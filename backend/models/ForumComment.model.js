/**
 * models/ForumComment.model.js
 *
 * Comments on ForumPosts (separate collection for scalability).
 * Mirrors the artwork Comment model's moderation patterns.
 */

const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema(
  {
    post          : { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    author        : { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
    parentComment : { type: mongoose.Schema.Types.ObjectId, ref: 'ForumComment', default: null },

    text : {
      type     : String,
      required : [true, 'Comment text is required'],
      trim     : true,
      minlength: [1,   'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },

    // ── Engagement ─────────────────────────────────────────
    upvotedBy   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount : { type: Number, default: 0, min: 0 },
    replyCount  : { type: Number, default: 0, min: 0 },

    // ── Moderation ─────────────────────────────────────────
    moderationStatus : {
      type    : String,
      enum    : ['pending', 'approved', 'rejected', 'flagged'],
      default : 'approved',
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
    isDeleted : { type: Boolean, default: false },
    deletedAt : { type: Date,    default: null  },
    deletedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

forumCommentSchema.pre('save', function (next) {
  if (this.isModified('upvotedBy')) this.upvoteCount = this.upvotedBy.length;
  if (this.isModified('reports'))   this.reportCount  = this.reports.length;
  next();
});

forumCommentSchema.index({ post: 1, createdAt: 1 });
forumCommentSchema.index({ author: 1 });
forumCommentSchema.index({ parentComment: 1 });
forumCommentSchema.index({ moderationStatus: 1 });

const ForumComment = mongoose.model('ForumComment', forumCommentSchema);
module.exports = ForumComment;
