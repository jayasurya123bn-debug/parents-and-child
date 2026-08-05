# Children Creative Art Showcase & Parent Community Portal
# ArtBloom — MERN Stack Web Application

## 📁 Project Structure

```
children and parents/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── cloudinary.js           # Cloudinary + Multer setup
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT protect / authorise
│   │   └── error.middleware.js     # Global error handler
│   ├── models/
│   │   ├── User.model.js           # Parent & Admin accounts
│   │   ├── ChildProfile.model.js   # Child profiles (parent-owned)
│   │   ├── Artwork.model.js        # Artwork with moderation
│   │   ├── Comment.model.js        # Artwork comments (threaded)
│   │   ├── ForumPost.model.js      # Parent discussion posts
│   │   └── ForumComment.model.js   # Forum comment threads
│   ├── routes/                     # (Stubs — Phase 2 implements all)
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── child.routes.js
│   │   ├── artwork.routes.js
│   │   ├── comment.routes.js
│   │   ├── forum.routes.js
│   │   ├── moderation.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   ├── generateToken.js        # JWT factory
│   │   └── seeder.js               # Dev data seeder (npm run seed)
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── server.js                   # Express entry point
│
└── frontend/                       # React 18 + Vite + Tailwind
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js    # Configured Axios + JWT interceptors
    │   ├── components/             # (Phase 3 — Navbar, Footer, Cards…)
    │   ├── hooks/                  # (Phase 3 — useAuth, useArtwork…)
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── GalleryPage.jsx
    │   │   ├── UploadPage.jsx
    │   │   ├── ForumPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── store/
    │   │   └── authStore.js        # Zustand persisted auth state
    │   ├── App.jsx                 # Routes + guards
    │   ├── index.css               # Tailwind + global design system
    │   └── main.jsx                # React entry point
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account

### Backend
```bash
cd backend
npm install
cp .env.example .env          # Fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm run seed                   # Populate dev data
npm run dev                    # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Starts on http://localhost:3000
```

### Dev Seed Credentials
| Role   | Email                  | Password       |
|--------|------------------------|----------------|
| Admin  | admin@artshowcase.com  | AdminPass@123  |
| Parent | sarah@example.com      | Password@123   |
| Parent | mike@example.com       | Password@123   |
| Parent | priya@example.com      | Password@123   |

## 📋 Phase Status

| Phase | Description                        | Status    |
|-------|------------------------------------|-----------|
| 1     | Architecture & Database Design     | ✅ Done   |
| 2     | Backend Auth & API Routes          | ⏳ Next   |
| 3     | Frontend Setup & Routing           | ⏳ Pending|
| 4     | Core Frontend Pages (UI)           | ⏳ Pending|
| 5     | Polish & Security                  | ⏳ Pending|

## 🗄️ Data Models Summary

### User (parent | admin)
- JWT auth with bcrypt hashing, account locking after 5 failed attempts
- Refresh token array for multi-device sessions
- Suspension system with reason + end date

### ChildProfile
- Owned by parent, never an independent login
- COPPA-style parental consent tracking
- Auto-computed ageGroup from DOB (toddler → tween)
- 3-tier privacy: public / community / private

### Artwork
- Full moderation workflow: pending → approved | rejected | flagged
- AI safety score field for future automated moderation
- Multi-size image storage: original, medium (800px), thumbnail (300px)
- likedBy set prevents duplicate likes
- Report system with per-report resolved flag

### Comment
- Threaded (one level of replies via parentComment)
- Child-friendly reactions: heart, star, palette, clap, wow
- Soft-delete preserves thread structure

### ForumPost
- Parent-only forum with 8 topic categories
- Optional inline poll with vote tracking
- Pin, announce, close, and lock controls for admins

### ForumComment
- Separate collection for scalable threading
- Full moderation + soft-delete mirrors ForumPost
