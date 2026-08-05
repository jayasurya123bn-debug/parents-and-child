/**
 * src/App.jsx — Root Component with Routing
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Lazy-loaded pages ────────────────────────────────────────
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/RegisterPage'));
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const GalleryPage    = lazy(() => import('./pages/GalleryPage'));
const UploadPage     = lazy(() => import('./pages/UploadPage'));
const ForumPage      = lazy(() => import('./pages/ForumPage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const KidsZonePage   = lazy(() => import('./pages/KidsZonePage'));
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'));

// ── Loading Fallback ─────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[var(--bg-canvas)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
      <p className="text-sm text-brand-400 font-semibold">Loading ArtBloom…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default redirect */}
        <Route path="/"         element={<Navigate to="/gallery" replace />} />

        {/* Public Routes */}
        <Route path="/gallery"  element={<GalleryPage />} />
        <Route path="/kids"     element={<KidsZonePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes — open for demo (Phase 3 adds guards) */}
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/upload"       element={<UploadPage />} />
        <Route path="/forum"        element={<ForumPage />} />
        <Route path="/profile/:id?" element={<ProfilePage />} />

        {/* Admin Routes — nested sub-routing handled inside AdminDashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
