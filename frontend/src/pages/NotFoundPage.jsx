/**
 * src/pages/NotFoundPage.jsx
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar/>
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="text-8xl mb-6 animate-float">🎨</div>
        <h1 className="text-6xl font-display font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">This Canvas is Empty!</h2>
        <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
          Looks like the page you're looking for has wandered off. Let's get you back to the gallery!
        </p>
        <div className="flex gap-4">
          <Link to="/gallery"  className="btn-primary">← Back to Gallery</Link>
          <Link to="/register" className="btn-secondary">Join Free</Link>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
