/**
 * models/Comment.model.js
 *
 * Represents a comment left on an Artwork.
 *
 * Key design decisions:
 *  - Comments are authored by parents (Users), not children directly.
 *  - moderationStatus mirrors Artwork moderation for consistent workflow.
 *  - Threaded replies are supported with a flat parentComment reference
 *    (one level deep to keep moderation manageable).
 *  - Soft-delete (isDeleted flag) preserves thread structure while
 *    hiding inappropriate content after removal.
 *  - Reactions (heart, star, palette) are child-friendly alternatives to likes.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Reaction ─────────────────────────────────────
const reactionSchema = new mongoose.Schema(
  {
    user     : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type     : {
      type    : String,
      enum    : ['heart', 'star', 'palette', 'clap', 'wow'],
      required: true,
    },
    reactedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Main Schema ──────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    // ── Relationships ──────────────────────────────────────
    artwork       : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'Artwork',
      required : [true, 'Comment must be linked to an artwork'],
    },
    author        : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'User',
      required : [true, 'Comment must have an author'],
    },
    parentComment : {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'Comment',
      default : null,
      // null = top-level comment; ObjectId = reply
    },

    // ── Content ────────────────────────────────────────────
    text : {
      type     : String,
      required : [true, 'Comment text is required'],
      trim     : true,
      minlength: [1,   'Comment cannot be empty'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },

    // ── Moderation ─────────────────────────────────────────
    moderationStatus : {
      type    : String,
      enum    : ['pending', 'approved', 'rejected', 'flagged'],
      default : 'pending',
    },
    moderatedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt : { type: Date, default: null },
    moderationNote: { type: String, default: '' },

    // ── Reactions ──────────────────────────────────────────
    reactions     : [reactionSchema],
    reactionCount : { type: Number, default: 0, min: 0 },

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

    // ── Soft Delete ────────────────────────────────────────
    isDeleted   : { type: Boolean, default: false },
    deletedAt   : { type: Date,    default: null  },
    deletedBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ── Reply Count (maintained by application logic) ──────
    replyCount  : { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Pre-Save Hook: Sync Counts ───────────────────────────────
commentSchema.pre('save', function (next) {
  if (this.isModified('reactions'))  this.reactionCount = this.reactions.length;
  if (this.isModified('reports'))    this.reportCount   = this.reports.length;
  next();
});

// ── Indexes ──────────────────────────────────────────────────
commentSchema.index({ artwork: 1, createdAt: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ moderationStatus: 1, createdAt: -1 });
commentSchema.index({ reportCount: -1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
