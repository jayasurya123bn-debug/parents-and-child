/**
 * src/components/Footer.jsx
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Heart, Shield, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/50 dark:bg-brand-950/50 border-t border-brand-100 dark:border-brand-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-soft">
                <Palette size={18} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-xl gradient-text">ArtBloom</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              A safe, joyful space where young artists share their creativity and parents build a supportive community.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-brand-400 font-medium">
              <Shield size={13} /> Child-safe & moderated platform
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[['Gallery',   '/gallery'],['Community','/forum'],['Upload Art','/upload'],['My Profile','/profile']].map(([l,h]) => (
                <li key={h}><Link to={h} className="hover:text-brand-500 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 uppercase tracking-wider">Safety</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[['Child Safety Policy','#'],['Community Guidelines','#'],['Report Content','#'],['Privacy Policy','#'],['Contact Us','#']].map(([l,h]) => (
                <li key={l}><a href={h} className="hover:text-brand-500 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-100 dark:border-brand-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> for creative kids everywhere · © 2026 ArtBloom
          </p>
          <a href="mailto:hello@artbloom.com" className="text-xs text-brand-400 hover:text-brand-600 flex items-center gap-1 transition-colors">
            <Mail size={12} /> hello@artbloom.com
          </a>
        </div>
      </div>
    </footer>
  );
}
