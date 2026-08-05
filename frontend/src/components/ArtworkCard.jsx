/**
 * src/components/ArtworkCard.jsx
 * Beautiful card for artwork display in the gallery.
 */
import React, { useState } from 'react';
import { Heart, Eye, Palette, Star } from 'lucide-react';

const AGE_COLORS = {
  toddler:           'bg-pink-100 text-pink-600',
  early_childhood:   'bg-yellow-100 text-yellow-600',
  middle_childhood:  'bg-green-100 text-green-600',
  tween:             'bg-blue-100 text-blue-600',
};

const AGE_LABELS = {
  toddler:           '2–4 yrs',
  early_childhood:   '5–7 yrs',
  middle_childhood:  '8–11 yrs',
  tween:             '12–17 yrs',
};

export default function ArtworkCard({ artwork, onClick }) {
  const [liked, setLiked]   = useState(false);
  const [likes, setLikes]   = useState(artwork.likeCount || 0);
  const [imgErr, setImgErr] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(artwork.title)}&background=c044ef&color=fff&size=400&font-size=0.35`;

  return (
    <article
      onClick={onClick}
      className="group relative bg-white dark:bg-brand-950/60 rounded-3xl overflow-hidden border border-brand-100/60 dark:border-brand-800/40 shadow-card hover:shadow-glow hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      {/* Featured badge */}
      {artwork.isFeatured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          <Star size={10} fill="white" /> Featured
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50 dark:bg-brand-900/30">
        <img
          src={imgErr ? fallback : artwork.images?.thumbnail?.url || fallback}
          alt={artwork.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">
            {artwork.childStory || artwork.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1 flex-1">
            {artwork.title}
          </h3>
          <span className="shrink-0 badge bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 capitalize text-xs">
            {artwork.category?.replace('_', ' ')}
          </span>
        </div>

        {/* Artist row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {artwork.child?.displayName?.[0] || '?'}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{artwork.child?.displayName}</span>
          {artwork.child?.ageGroup && (
            <span className={`badge text-xs ml-auto ${AGE_COLORS[artwork.child.ageGroup]}`}>
              {AGE_LABELS[artwork.child.ageGroup]}
            </span>
          )}
        </div>

        {/* Medium */}
        {artwork.medium && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
            <Palette size={11} /> {artwork.medium}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-50 dark:border-brand-900/50">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Eye size={12} /> {artwork.viewCount || 0}</span>
          </div>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
              liked ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            {likes}
          </button>
        </div>
      </div>
    </article>
  );
}
