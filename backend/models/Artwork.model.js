/**
 * models/Artwork.model.js
 *
 * Represents a piece of art uploaded by (or on behalf of) a child.
 *
 * Key design decisions:
 *  - Both the child and parent are stored to allow orphan detection.
 *  - moderationStatus drives the approval workflow: uploaded → pending →
 *    approved | rejected | flagged.
 *  - contentWarning and aiSafetyScore fields allow future integration
 *    with automated moderation services (e.g. AWS Rekognition).
 *  - likedBy stores ObjectIds so we can prevent duplicate likes efficiently.
 *  - tags are normalised to lowercase and trimmed on save.
 *  - Multiple image sizes (thumbnail, medium, original) are stored
 *    to optimise bandwidth across device types.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Image Variant ────────────────────────────────
const imageVariantSchema = new mongoose.Schema(
  {
    url      : { type: String, required: true },
    publicId : { type: String, required: true },
    width    : { type: Number },
    height   : { type: Number },
    bytes    : { type: Number },
    format   : { type: String },
  },
  { _id: false }
);

// ── Sub-schema: Moderation History Entry ────────────────────
const moderationHistorySchema = new mongoose.Schema(
  {
    action      : { type: String, enum: ['submitted', 'approved', 'rejected', 'flagged', 'reinstated'], required: true },
    performedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason      : { type: String, default: '' },
    timestamp   : { type: Date,   default: Date.now },
  },
  { _id: false }
);

// ── Main Schema ──────────────────────────────────────────────
const artworkSchema = new mongoose.Schema(
  {
    // ── Authorship ─────────────────────────────────────────
    child  : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'ChildProfile',
      required : [true, 'Artwork must be linked to a child profile'],
    },
    parent : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'User',
      required : [true, 'Artwork must have a parent uploader'],
    },

    // ── Content ────────────────────────────────────────────
    title       : {
      type     : String,
      required : [true, 'Artwork title is required'],
      trim     : true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description : {
      type     : String,
      trim     : true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default  : '',
    },
    category    : {
      type     : String,
      required : [true, 'Category is required'],
      enum     : {
        values  : ['painting', 'drawing', 'craft', 'sculpture', 'digital', 'mixed_media', 'photography', 'other'],
        message : 'Invalid artwork category',
      },
    },
    medium      : { type: String, maxlength: [80, 'Medium cannot exceed 80 characters'], default: '' },
    tags        : [{ type: String, maxlength: 30 }],

    // ── Image Storage ──────────────────────────────────────
    images : {
      original  : { type: imageVariantSchema, required: true },
      medium    : { type: imageVariantSchema },   // ~800px wide
      thumbnail : { type: imageVariantSchema },   // ~300px wide
    },

    // ── Moderation ─────────────────────────────────────────
    moderationStatus : {
      type    : String,
      enum    : ['pending', 'approved', 'rejected', 'flagged'],
      default : 'pending',
      index   : true,
    },
    moderationNotes   : { type: String, default: '' },
    moderationHistory : [moderationHistorySchema],
    moderatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt       : { type: Date, default: null },

    // ── AI / Automated Safety ──────────────────────────────
    aiSafetyScore     : { type: Number, min: 0, max: 1, default: null },
    aiSafetyLabels    : [{ type: String }],
    contentWarning    : { type: Boolean, default: false },

    // ── Engagement ─────────────────────────────────────────
    likedBy    : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount  : { type: Number, default: 0, min: 0 },
    viewCount  : { type: Number, default: 0, min: 0 },
    shareCount : { type: Number, default: 0, min: 0 },

    // ── Reports ────────────────────────────────────────────
    reports : [
      {
        reportedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason     : { type: String, required: true, maxlength: 300 },
        reportedAt : { type: Date, default: Date.now },
        resolved   : { type: Boolean, default: false },
      },
    ],
    reportCount : { type: Number, default: 0, min: 0 },

    // ── Visibility ─────────────────────────────────────────
    isPublished  : { type: Boolean, default: false },  // true only when approved
    isFeatured   : { type: Boolean, default: false },  // admin can feature artwork
    featuredAt   : { type: Date,    default: null  },

    // ── Child's Story / Context ────────────────────────────
    childStory   : {
      type     : String,
      maxlength: [300, "Child's story cannot exceed 300 characters"],
      default  : '',
    },
    creationDate : { type: Date, default: null },  // When the child actually made this
  },
  { timestamps: true }
);

// ── Pre-Save Hook: Normalise Tags ────────────────────────────
artworkSchema.pre('save', function (next) {
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.map((t) => t.toLowerCase().trim()).filter(Boolean))];
  }
  // Sync isPublished with moderationStatus
  this.isPublished = this.moderationStatus === 'approved';
  next();
});

// ── Pre-Save Hook: Sync likeCount ────────────────────────────
artworkSchema.pre('save', function (next) {
  if (this.isModified('likedBy')) {
    this.likeCount = this.likedBy.length;
  }
  if (this.isModified('reports')) {
    this.reportCount = this.reports.length;
  }
  next();
});

// ── Indexes ──────────────────────────────────────────────────
artworkSchema.index({ child: 1, createdAt: -1 });
artworkSchema.index({ parent: 1 });
artworkSchema.index({ moderationStatus: 1, createdAt: -1 });
artworkSchema.index({ category: 1, moderationStatus: 1 });
artworkSchema.index({ likeCount: -1 });
artworkSchema.index({ isFeatured: 1, featuredAt: -1 });
artworkSchema.index({ tags: 1 });
artworkSchema.index({ reportCount: -1 });

const Artwork = mongoose.model('Artwork', artworkSchema);
module.exports = Artwork;
