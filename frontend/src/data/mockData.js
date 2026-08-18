/**
 * src/data/mockData.js
 * Realistic placeholder data for development display.
 * Replace with real API calls in Phase 4.
 */

export const MOCK_ARTWORKS = [];

export const MOCK_STATS = {
  totalArtworks : 0,
  totalArtists  : 0,
  totalParents  : 0,
  totalLikes    : 0,
};

export const CATEGORIES = [
  { value: 'all',         label: 'All Art',       emoji: '🎨' },
  { value: 'painting',    label: 'Painting',       emoji: '🖌️' },
  { value: 'drawing',     label: 'Drawing',        emoji: '✏️' },
  { value: 'craft',       label: 'Craft',          emoji: '✂️' },
  { value: 'sculpture',   label: 'Sculpture',      emoji: '🏺' },
  { value: 'digital',     label: 'Digital',        emoji: '💻' },
  { value: 'mixed_media', label: 'Mixed Media',    emoji: '🎭' },
  { value: 'photography', label: 'Photography',    emoji: '📷' },
];

export const AGE_GROUPS = [
  { value: 'all',               label: 'All Ages'     },
  { value: 'toddler',           label: '2–4 yrs'      },
  { value: 'early_childhood',   label: '5–7 yrs'      },
  { value: 'middle_childhood',  label: '8–11 yrs'     },
  { value: 'tween',             label: '12–17 yrs'    },
];
