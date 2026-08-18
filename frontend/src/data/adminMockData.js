/**
 * src/data/adminMockData.js
 * Realistic admin/moderation placeholder data.
 */

export const ADMIN_STATS = {
  totalUsers        : 0,
  newUsersThisWeek  : 0,
  totalArtworks     : 0,
  pendingArtworks   : 0,
  flaggedContent    : 0,
  resolvedReports   : 0,
  totalForumPosts   : 0,
  activeToday       : 0,
};

export const PENDING_ARTWORKS = [];

export const FLAGGED_CONTENT = [];

export const RECENT_USERS = [];

export const ACTIVITY_LOG = [];

export const WEEKLY_UPLOADS = [
  { day: 'Mon', count: 0 },
  { day: 'Tue', count: 0 },
  { day: 'Wed', count: 0 },
  { day: 'Thu', count: 0 },
  { day: 'Fri', count: 0 },
  { day: 'Sat', count: 0 },
  { day: 'Sun', count: 0 },
];
