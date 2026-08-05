/**
 * models/User.model.js
 *
 * Represents both Parent accounts and Admin accounts.
 *
 * Key design decisions:
 *  - Role enum keeps a single collection with clear access tiers.
 *  - Password is never exposed via JSON (select: false + toJSON transform).
 *  - bcrypt hashing is performed in a pre-save hook to centralise logic.
 *  - refreshTokens array supports multi-device logout.
 *  - accountStatus + suspension fields give admins granular control.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Sub-schema: Notification Preferences ────────────────────
const notificationPrefsSchema = new mongoose.Schema(
  {
    emailOnNewComment : { type: Boolean, default: true  },
    emailOnLike       : { type: Boolean, default: false },
    emailOnForumReply : { type: Boolean, default: true  },
  },
  { _id: false }
);

// ── Main Schema ──────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────
    firstName : {
      type     : String,
      required : [true, 'First name is required'],
      trim     : true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName  : {
      type     : String,
      required : [true, 'Last name is required'],
      trim     : true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    username  : {
      type     : String,
      required : [true, 'Username is required'],
      unique   : true,
      trim     : true,
      lowercase: true,
      minlength: [3,  'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match    : [/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers, and underscores'],
    },
    email     : {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      trim     : true,
      lowercase: true,
      match    : [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password  : {
      type     : String,
      required : [true, 'Password is required'],
      minlength: [8,  'Password must be at least 8 characters'],
      select   : false,   // Never returned in queries by default
    },

    // ── Role & Status ──────────────────────────────────────
    role : {
      type    : String,
      enum    : { values: ['parent', 'admin'], message: 'Role must be parent or admin' },
      default : 'parent',
    },
    accountStatus : {
      type    : String,
      enum    : ['active', 'suspended', 'pending_verification', 'deactivated'],
      default : 'active',
    },
    suspensionReason  : { type: String, default: null },
    suspensionEndDate : { type: Date,   default: null },

    // ── Profile ────────────────────────────────────────────
    avatar      : {
      url      : { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1/art-showcase/avatars/default.png' },
      publicId : { type: String, default: null },
    },
    bio         : { type: String, maxlength: [300, 'Bio cannot exceed 300 characters'], default: '' },
    location    : { type: String, maxlength: [100, 'Location cannot exceed 100 characters'], default: '' },
    website     : { type: String, default: '' },

    // ── Children (populated separately via ChildProfile) ──
    children    : [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile' }],

    // ── Community Stats ────────────────────────────────────
    totalLikesGiven    : { type: Number, default: 0, min: 0 },
    totalCommentsGiven : { type: Number, default: 0, min: 0 },
    forumPostCount     : { type: Number, default: 0, min: 0 },

    // ── Auth & Security ────────────────────────────────────
    refreshTokens         : [{ type: String }],  // supports multi-device sessions
    emailVerified         : { type: Boolean, default: false },
    emailVerificationToken: { type: String,  default: null  },
    passwordResetToken    : { type: String,  default: null  },
    passwordResetExpires  : { type: Date,    default: null  },
    lastLogin             : { type: Date,    default: null  },
    loginAttempts         : { type: Number,  default: 0    },
    lockUntil             : { type: Date,    default: null  },

    // ── Preferences ────────────────────────────────────────
    notificationPrefs : { type: notificationPrefsSchema, default: () => ({}) },
    theme             : { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  {
    timestamps: true,   // adds createdAt / updatedAt
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

// ── Virtual: Full Name ───────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Virtual: Account Locked? ─────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-Save Hook: Hash Password ─────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare Password ────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Instance Method: Increment Login Attempts ────────────────
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Reset after lock period has expired
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) };
  }
  return this.updateOne(updates);
};

// ── Indexes ──────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
