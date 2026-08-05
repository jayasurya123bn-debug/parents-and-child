/**
 * config/cloudinary.js
 * Configures the Cloudinary SDK with credentials from environment variables.
 * Call this once during app startup.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Initialise Cloudinary
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ── Artwork Upload Storage ───────────────────────────────────
const artworkStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder         : 'art-showcase/artworks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation : [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    public_id      : `artwork_${Date.now()}_${file.originalname.split('.')[0]}`,
  }),
});

// ── Avatar Upload Storage ────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : 'art-showcase/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation : [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// ── Forum Attachment Storage ─────────────────────────────────
const forumAttachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder         : 'art-showcase/forum',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation : [{ width: 1000, quality: 'auto' }],
  },
});

// ── File Filter (MIME validation) ────────────────────────────
const imageFileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// ── Multer Upload Instances ──────────────────────────────────
const uploadArtwork     = multer({ storage: artworkStorage,          fileFilter: imageFileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB
const uploadAvatar      = multer({ storage: avatarStorage,           fileFilter: imageFileFilter, limits: { fileSize: 3  * 1024 * 1024 } }); //  3 MB
const uploadForumAttach = multer({ storage: forumAttachmentStorage,                              limits: { fileSize: 5  * 1024 * 1024 } }); //  5 MB

module.exports = { cloudinary, uploadArtwork, uploadAvatar, uploadForumAttach };
