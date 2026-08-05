/**
 * models/ForumPost.model.js
 *
 * Represents a discussion post in the Parent Community Forum.
 *
 * Key design decisions:
 *  - Forum is exclusively for parents (role: 'parent' | 'admin').
 *  - Threaded via a nested ForumComment sub-document approach (stored
 *    alongside the post) to avoid extra round-trips for small threads.
 *    For scalability, top-level comments reference the post via a
 *    separate ForumComment collection (see ForumComment.model.js).
 *  - category enum provides clear topical sections for navigation.
 *  - isPinned / isAnnouncement allow admin highlights.
 *  - Upvotes use a likedBy set to prevent duplicate votes.
 *  - Soft-delete preserves thread integrity.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Inline Poll Option ───────────────────────────
const pollOptionSchema = new mongoose.Schema(
  {
    text    : { type: String, required: true, maxlength: 100 },
    votes   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 },
  },
  { _id: true }
);

// ── Main Schema ──────────────────────────────────────────────
const forumPostSchema = new mongoose.Schema(
  {
    // ── Author ─────────────────────────────────────────────
    author : {
      type     : mongoose.Schema.Types.ObjectId,
      ref      : 'User',
      required : [true, 'Forum post must have an author'],
    },

    // ── Content ────────────────────────────────────────────
    title   : {
      type     : String,
      required : [true, 'Post title is required'],
      trim     : true,
      minlength: [5,   'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    body    : {
      type     : String,
      required : [true, 'Post body is required'],
      trim     : true,
      minlength: [10,  'Post body must be at least 10 characters'],
      maxlength: [5000, 'Post body cannot exceed 5000 characters'],
    },

    // ── Categorisation ─────────────────────────────────────
    category : {
      type     : String,
      required : [true, 'Category is required'],
      enum     : {
        values  : [
          'tips_and_advice',
          'art_techniques',
          'child_development',
          'materials_and_supplies',
          'showcase_feedback',
          'events_and_activities',
          'general_discussion',
          'announcements',
        ],
        message : 'Invalid forum category',
      },
    },
    tags : [{ type: String, maxlength: 30 }],

    // ── Attachments ────────────────────────────────────────
    attachments : [
      {
        url      : { type: String, required: true },
        publicId : { type: String, required: true },
        type     : { type: String, enum: ['image', 'pdf'], default: 'image' },
        name     : { type: String, default: '' },
      },
    ],

    // ── Optional Poll ──────────────────────────────────────
    hasPoll     : { type: Boolean, default: false },
    pollQuestion: { type: String,  maxlength: 200, default: '' },
    pollOptions : [pollOptionSchema],
    pollEndsAt  : { type: Date, default: null },

    // ── Engagement ─────────────────────────────────────────
    upvotedBy    : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount  : { type: Number, default: 0, min: 0 },
    viewCount    : { type: Number, default: 0, min: 0 },
    commentCount : { type: Number, default: 0, min: 0 },  // maintained by app logic

    // ── Admin Controls ─────────────────────────────────────
    isPinned        : { type: Boolean, default: false },
    isAnnouncement  : { type: Boolean, default: false },
    isClosed        : { type: Boolean, default: false },  // prevent new comments
    isLocked        : { type: Boolean, default: false },  // admin lock

    // ── Moderation ─────────────────────────────────────────
    moderationStatus : {
      type    : String,
      enum    : ['pending', 'approved', 'rejected', 'flagged'],
      default : 'approved',  // Forum posts visible immediately, flagged on report
    },
    moderatedBy    : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt    : { type: Date, default: null },
    moderationNote : { type: String, default: '' },

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
    isDeleted  : { type: Boolean, default: false },
    deletedAt  : { type: Date,    default: null  },
    deletedBy  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ── Linked Artwork (optional) ──────────────────────────
    linkedArtwork : { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', default: null },

    // ── Last Activity ──────────────────────────────────────
    lastActivityAt : { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Pre-Save Hooks ───────────────────────────────────────────
forumPostSchema.pre('save', function (next) {
  if (this.isModified('upvotedBy'))  this.upvoteCount  = this.upvotedBy.length;
  if (this.isModified('reports'))    this.reportCount  = this.reports.length;

  // Normalise tags
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.map((t) => t.toLowerCase().trim()).filter(Boolean))];
  }

  // Sync poll option vote counts
  if (this.hasPoll && this.isModified('pollOptions')) {
    this.pollOptions.forEach((opt) => { opt.voteCount = opt.votes.length; });
  }
  next();
});

// ── Indexes ──────────────────────────────────────────────────
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ category: 1, moderationStatus: 1, createdAt: -1 });
forumPostSchema.index({ isPinned: -1, lastActivityAt: -1 });
forumPostSchema.index({ moderationStatus: 1, reportCount: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ upvoteCount: -1 });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
