/**
 * src/data/adminMockData.js
 * Realistic admin/moderation placeholder data.
 */

export const ADMIN_STATS = {
  totalUsers        : 312,
  newUsersThisWeek  : 24,
  totalArtworks     : 1248,
  pendingArtworks   : 7,
  flaggedContent    : 3,
  resolvedReports   : 45,
  totalForumPosts   : 189,
  activeToday       : 38,
};

export const PENDING_ARTWORKS = [
  {
    _id: 'p1',
    title: 'T-Rex Attack!',
    category: 'drawing',
    medium: 'Crayons',
    child: { displayName: 'Oliver', age: 6 },
    parent: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
    images: { thumbnail: { url: 'https://images.unsplash.com/photo-1416339684178-3a239570f315?w=300&q=70' } },
    submittedAt: '2026-08-04T10:30:00Z',
    description: 'A very scary T-Rex chasing tiny people made with crayons.',
    tags: ['dinosaur', 'trex', 'fun'],
    aiSafetyScore: 0.97,
  },
  {
    _id: 'p2',
    title: 'Night Sky Dreams',
    category: 'painting',
    medium: 'Watercolour',
    child: { displayName: 'Zara', age: 11 },
    parent: { firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com' },
    images: { thumbnail: { url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=300&q=70' } },
    submittedAt: '2026-08-04T14:00:00Z',
    description: 'Stars and planets painted in watercolour with gold accents.',
    tags: ['stars', 'night', 'space'],
    aiSafetyScore: 0.99,
  },
  {
    _id: 'p3',
    title: 'My Pet Hamster',
    category: 'drawing',
    medium: 'Coloured pencils',
    child: { displayName: 'Leo', age: 8 },
    parent: { firstName: 'Michael', lastName: 'Chen', email: 'mike@example.com' },
    images: { thumbnail: { url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&q=70' } },
    submittedAt: '2026-08-04T16:45:00Z',
    description: 'A portrait of my pet hamster named Peanut.',
    tags: ['hamster', 'pet', 'portrait'],
    aiSafetyScore: 1.0,
  },
];

export const FLAGGED_CONTENT = [
  {
    _id: 'f1',
    type: 'comment',
    text: 'This comment was reported for potentially unkind language.',
    reportedBy: 'sarah@example.com',
    reason: 'Inappropriate language',
    targetTitle: 'Space Adventure',
    reportedAt: '2026-08-03T09:00:00Z',
  },
  {
    _id: 'f2',
    type: 'forum_post',
    text: 'A forum post was flagged for sharing personal contact information.',
    reportedBy: 'mike@example.com',
    reason: 'Personal information',
    targetTitle: 'Best painting apps?',
    reportedAt: '2026-08-04T08:15:00Z',
  },
  {
    _id: 'f3',
    type: 'artwork',
    text: 'Artwork flagged for review — contains text that may include a phone number.',
    reportedBy: 'priya@example.com',
    reason: 'Possible contact info visible in image',
    targetTitle: 'Our Family Portrait',
    reportedAt: '2026-08-04T11:30:00Z',
  },
];

export const RECENT_USERS = [
  { _id: 'u1', firstName: 'Anna',   lastName: 'Williams', email: 'anna@example.com',  role: 'parent', status: 'active',    joinedAt: '2026-08-04T08:00:00Z', children: 2, artworks: 8  },
  { _id: 'u2', firstName: 'James',  lastName: 'Lopez',    email: 'james@example.com', role: 'parent', status: 'active',    joinedAt: '2026-08-04T10:30:00Z', children: 1, artworks: 3  },
  { _id: 'u3', firstName: 'Mei',    lastName: 'Zhang',    email: 'mei@example.com',   role: 'parent', status: 'active',    joinedAt: '2026-08-03T15:00:00Z', children: 3, artworks: 15 },
  { _id: 'u4', firstName: 'Carlos', lastName: 'Ruiz',     email: 'carlos@example.com',role: 'parent', status: 'suspended', joinedAt: '2026-07-28T09:00:00Z', children: 1, artworks: 2  },
  { _id: 'u5', firstName: 'Emma',   lastName: 'Brown',    email: 'emma@example.com',  role: 'parent', status: 'active',    joinedAt: '2026-08-04T18:00:00Z', children: 2, artworks: 0  },
];

export const ACTIVITY_LOG = [
  { action: 'Artwork Approved',  target: '"Rainbow Garden" by Emma',      admin: 'You', time: '2m ago',  type: 'approve' },
  { action: 'User Suspended',    target: 'carlos@example.com',            admin: 'You', time: '1h ago',  type: 'suspend' },
  { action: 'Comment Removed',   target: 'Comment on "Space Adventure"',  admin: 'You', time: '3h ago',  type: 'remove'  },
  { action: 'Artwork Rejected',  target: '"Untitled" by anonymous child', admin: 'You', time: '5h ago',  type: 'reject'  },
  { action: 'Report Resolved',   target: 'Forum post flagged by mike@',   admin: 'You', time: '1d ago',  type: 'resolve' },
  { action: 'Artwork Featured',  target: '"Underwater World" by Maya',    admin: 'You', time: '1d ago',  type: 'feature' },
];

export const WEEKLY_UPLOADS = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 19 },
  { day: 'Wed', count: 8  },
  { day: 'Thu', count: 23 },
  { day: 'Fri', count: 31 },
  { day: 'Sat', count: 27 },
  { day: 'Sun', count: 15 },
];
