/**
 * models/ChildProfile.model.js
 *
 * Represents a child account managed by a parent user.
 *
 * Key design decisions:
 *  - Children are NEVER independent users; they are owned by a parent (User).
 *  - No personal email or password stored — authentication flows through the parent.
 *  - Age is stored as dateOfBirth and exposed as a virtual to avoid stale data.
 *  - ageGroup is auto-computed from DOB for age-appropriate content filtering.
 *  - privacyLevel controls how artwork is visible (public / friends / private).
 *  - consentGiven tracks COPPA / GDPR-style parental consent.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Art Stats ────────────────────────────────────
const artStatsSchema = new mongoose.Schema(
  {
    totalUploads  : { type: Number, default: 0, min: 0 },
    totalLikes    : { type: Number, default: 0, min: 0 },
    totalComments : { type: Number, default: 0, min: 0 },
    featuredCount : { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// ── Main Schema ──────────────────────────────────────────────
const childProfileSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────
    parent : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'User',
      required : [true, 'Child profile must belong to a parent'],
    },

    // ── Identity ───────────────────────────────────────────
    displayName : {
      type     : String,
      required : [true, 'Display name is required'],
      trim     : true,
      maxlength: [40, 'Display name cannot exceed 40 characters'],
    },
    // NOTE: dateOfBirth is required for age-appropriate content grouping.
    dateOfBirth : {
      type     : Date,
      required : [true, 'Date of birth is required'],
      validate : {
        validator(dob) {
          const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          return age >= 2 && age <= 17;
        },
        message : 'Child must be between 2 and 17 years old',
      },
    },

    // ── Avatar ─────────────────────────────────────────────
    avatar : {
      url      : { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1/art-showcase/avatars/child_default.png' },
      publicId : { type: String, default: null },
    },

    // ── Bio / About ────────────────────────────────────────
    bio           : { type: String, maxlength: [200, 'Bio cannot exceed 200 characters'], default: '' },
    artInterests  : {
      type    : [{ type: String, enum: ['painting', 'drawing', 'craft', 'sculpture', 'digital', 'mixed_media', 'photography'] }],
      default : [],
    },
    favoriteColors: [{ type: String, maxlength: 30 }],

    // ── Content Settings ───────────────────────────────────
    privacyLevel : {
      type    : String,
      enum    : ['public', 'community', 'private'],
      default : 'community',
      // public    = visible to all visitors
      // community = visible to registered parents/children
      // private   = visible only to the parent
    },

    // ── Age Group (auto-computed, stored for query efficiency) ──
    ageGroup : {
      type    : String,
      enum    : ['toddler', 'early_childhood', 'middle_childhood', 'tween'],
      // toddler          = 2-4
      // early_childhood  = 5-7
      // middle_childhood = 8-11
      // tween            = 12-17
    },

    // ── Artwork References ─────────────────────────────────
    artworks : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],

    // ── Stats ──────────────────────────────────────────────
    artStats : { type: artStatsSchema, default: () => ({}) },

    // ── Achievements / Badges ──────────────────────────────
    badges : [
      {
        name      : { type: String, required: true },
        icon      : { type: String, required: true },
        awardedAt : { type: Date,   default: Date.now },
      },
    ],

    // ── Consent & Safety ──────────────────────────────────
    consentGiven    : { type: Boolean, default: false },
    consentDate     : { type: Date,    default: null  },
    isActive        : { type: Boolean, default: true  },
    deactivatedAt   : { type: Date,    default: null  },
  },
  { timestamps: true }
);

// ── Virtual: Age ─────────────────────────────────────────────
childProfileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diffMs = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
});

// ── Pre-Save Hook: Compute ageGroup ──────────────────────────
childProfileSchema.pre('save', function (next) {
  if (this.isModified('dateOfBirth') && this.dateOfBirth) {
    const age = Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if      (age <= 4)  this.ageGroup = 'toddler';
    else if (age <= 7)  this.ageGroup = 'early_childhood';
    else if (age <= 11) this.ageGroup = 'middle_childhood';
    else                this.ageGroup = 'tween';
  }
  next();
});

// ── Indexes ──────────────────────────────────────────────────
childProfileSchema.index({ parent: 1 });
childProfileSchema.index({ ageGroup: 1 });
childProfileSchema.index({ privacyLevel: 1 });
childProfileSchema.index({ 'artStats.totalLikes': -1 });
childProfileSchema.index({ createdAt: -1 });

const ChildProfile = mongoose.model('ChildProfile', childProfileSchema);
module.exports = ChildProfile;
