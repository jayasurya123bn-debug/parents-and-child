/**
 * src/pages/GalleryPage.jsx
 *
 * Full main gallery page with:
 *  - Hero section with animated blob and stats
 *  - Category + age-group filter bar
 *  - Masonry-style artwork grid with real mock data
 *  - Artwork detail modal
 *  - CTA section
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Heart, Eye, Palette, Star, Users, Image as ImageIcon, TrendingUp, ChevronRight, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ArtworkCard from '../components/ArtworkCard';
import { MOCK_ARTWORKS, MOCK_STATS, CATEGORIES, AGE_GROUPS } from '../data/mockData';

// ── Artwork Detail Modal ─────────────────────────────────────
function ArtworkModal({ artwork, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(artwork.likeCount || 0);
  const [imgErr, setImgErr] = useState(false);

  if (!artwork) return null;

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(artwork.title)}&background=c044ef&color=fff&size=800&font-size=0.3`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1a1033] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors">
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] bg-brand-50 dark:bg-brand-900/30 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
            {artwork.isFeatured && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                <Star size={11} fill="white" /> Featured
              </div>
            )}
            <img
              src={imgErr ? fallback : artwork.images?.original?.url || artwork.images?.thumbnail?.url || fallback}
              alt={artwork.title}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category + medium */}
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-brand-100 text-brand-600 capitalize">{artwork.category?.replace('_', ' ')}</span>
              {artwork.medium && <span className="text-xs text-gray-400 flex items-center gap-1"><Palette size={11}/>{artwork.medium}</span>}
            </div>

            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">{artwork.title}</h2>

            {/* Artist */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                {artwork.child?.displayName?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{artwork.child?.displayName}</p>
                <p className="text-xs text-gray-400">Young Artist</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{artwork.description}</p>

            {/* Child's story */}
            {artwork.childStory && (
              <div className="bg-brand-50 dark:bg-brand-900/30 rounded-2xl p-4 mb-5 border-l-4 border-brand-400">
                <p className="text-xs font-bold text-brand-600 dark:text-brand-300 mb-1">💬 In their own words:</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{artwork.childStory}"</p>
              </div>
            )}

            {/* Tags */}
            {artwork.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {artwork.tags.map(t => (
                  <span key={t} className="text-xs bg-gray-100 dark:bg-brand-900/50 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">#{t}</span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-brand-50 dark:border-brand-900/50">
              <span className="flex items-center gap-1.5 text-sm text-gray-500"><Eye size={15}/>{artwork.viewCount?.toLocaleString() || 0} views</span>
              <button
                onClick={() => { setLiked(l => !l); setLikes(n => liked ? n - 1 : n + 1); }}
                className={`flex items-center gap-1.5 text-sm font-semibold ml-auto transition-all duration-200 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              >
                <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {likes} likes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div className="glass-card px-6 py-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white text-xl shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Main Gallery Page ────────────────────────────────────────
export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge,      setSelectedAge]      = useState('all');
  const [search,           setSearch]           = useState('');
  const [sortBy,           setSortBy]           = useState('latest');
  const [selectedArtwork,  setSelectedArtwork]  = useState(null);
  const [showFilters,      setShowFilters]      = useState(false);

  // Filter + sort artworks
  const filtered = useMemo(() => {
    let list = [...MOCK_ARTWORKS];
    if (selectedCategory !== 'all') list = list.filter(a => a.category === selectedCategory);
    if (selectedAge      !== 'all') list = list.filter(a => a.child?.ageGroup === selectedAge);
    if (search.trim())              list = list.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.child?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === 'popular') list.sort((a, b) => b.likeCount  - a.likeCount);
    if (sortBy === 'latest')  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'views')   list.sort((a, b) => b.viewCount  - a.viewCount);
    return list;
  }, [selectedCategory, selectedAge, search, sortBy]);

  const featured = MOCK_ARTWORKS.filter(a => a.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar />

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="bg-blob w-96 h-96 bg-brand-400 -top-32 -left-32" />
        <div className="bg-blob w-80 h-80 bg-accent-400 -top-20 right-0" />
        <div className="bg-blob w-64 h-64 bg-brand-300 bottom-0 left-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-brand-100/70 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-brand-200/50 dark:border-brand-700/50">
            <Star size={12} fill="currentColor" /> Child-Safe Creative Space
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-gray-900 dark:text-white mb-5 leading-tight text-balance">
            Where Young Artists
            <span className="block gradient-text mt-1">Share Their World 🎨</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            A safe, moderated platform for children to showcase their creativity and for parents to build a supportive community together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-glow">
              Join the Community <ChevronRight size={18} />
            </Link>
            <Link to="/forum" className="btn-secondary px-8 py-3.5 text-base">
              Parent Forum <Users size={18} />
            </Link>
          </div>

          {/* Kids Zone entry banner */}
          <Link to="/kids" className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-400 via-brand-500 to-accent-400 text-white font-extrabold text-lg px-8 py-4 rounded-3xl shadow-glow hover:shadow-glow-lg hover:-translate-y-1 transition-all duration-300 mb-10 group">
            <span className="text-3xl group-hover:animate-bounce">🎨</span>
            <span>Kids Zone — Enter Here!</span>
            <span className="text-2xl group-hover:animate-bounce">🌈</span>
          </Link>


          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <StatCard icon={<ImageIcon size={20}/>} value={MOCK_STATS.totalArtworks.toLocaleString()} label="Artworks Shared"  color="bg-gradient-to-br from-brand-500 to-brand-600" />
            <StatCard icon={<Palette size={20}/>}   value={MOCK_STATS.totalArtists.toLocaleString()}  label="Young Artists"   color="bg-gradient-to-br from-accent-500 to-orange-600" />
            <StatCard icon={<Users size={20}/>}     value={MOCK_STATS.totalParents.toLocaleString()}  label="Parent Members"  color="bg-gradient-to-br from-emerald-500 to-teal-600" />
            <StatCard icon={<Heart size={20}/>}     value={(MOCK_STATS.totalLikes/1000).toFixed(0)+'k'} label="Likes Given"  color="bg-gradient-to-br from-pink-500 to-rose-600" />
          </div>
        </div>
      </section>

      {/* ── Featured Artworks ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-subtitle">✨ Hand-picked by our moderators</p>
            <h2 className="section-header">Featured Artworks</h2>
          </div>
          <button onClick={() => setSelectedCategory('all')} className="btn-ghost text-sm hidden sm:flex">
            View all <ChevronRight size={16}/>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {featured.map(art => (
            <div key={art._id} onClick={() => setSelectedArtwork(art)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-card hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 aspect-[4/3]">
              <img
                src={art.images?.thumbnail?.url}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
                  <Star size={11} fill="currentColor" /> Featured
                </div>
                <h3 className="text-white font-bold text-lg leading-tight">{art.title}</h3>
                <p className="text-white/70 text-sm">by {art.child?.displayName}</p>
                <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                  <span className="flex items-center gap-1"><Heart size={11}/>{art.likeCount}</span>
                  <span className="flex items-center gap-1"><Eye size={11}/>{art.viewCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery Section ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-subtitle">🎭 All approved artworks</p>
            <h2 className="section-header">Browse the Gallery</h2>
          </div>
          <button onClick={() => setShowFilters(f => !f)} className="btn-secondary text-sm flex items-center gap-2">
            <Filter size={15}/> {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search artworks, artists, tags…"
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14}/>
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field w-auto min-w-[150px] cursor-pointer"
          >
            <option value="latest">🕐 Latest</option>
            <option value="popular">❤️ Most Liked</option>
            <option value="views">👁️ Most Viewed</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-5 mb-6 animate-slide-up">
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      selectedCategory === c.value
                        ? 'bg-brand-500 text-white shadow-soft'
                        : 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 hover:bg-brand-100'
                    }`}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Age Group</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(a => (
                  <button
                    key={a.value}
                    onClick={() => setSelectedAge(a.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      selectedAge === a.value
                        ? 'bg-accent-500 text-white shadow-soft'
                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Quick Tabs */}
        {!showFilters && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === c.value
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-white dark:bg-brand-950/60 text-gray-600 dark:text-gray-400 border border-brand-100 dark:border-brand-800 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Result Count */}
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 font-medium">
          Showing <strong className="text-brand-600 dark:text-brand-400">{filtered.length}</strong> {filtered.length === 1 ? 'artwork' : 'artworks'}
          {selectedCategory !== 'all' && ` in ${CATEGORIES.find(c=>c.value===selectedCategory)?.label}`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(art => (
              <ArtworkCard key={art._id} artwork={art} onClick={() => setSelectedArtwork(art)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No artworks found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedAge('all'); }} className="btn-primary text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 p-10 md:p-16 text-center">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"/>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2"/>

          <div className="relative z-10">
            <div className="text-5xl mb-4 animate-float inline-block">🎨</div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4">
              Ready to Showcase Your Child's Art?
            </h2>
            <p className="text-white/80 text-base max-w-lg mx-auto mb-8 leading-relaxed">
              Join hundreds of families celebrating creativity in a safe, moderated environment designed specifically for young artists.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-brand-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Create Free Account <ChevronRight size={18}/>
              </Link>
              <Link to="/forum" className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-200">
                Explore Community <Users size={18}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Artwork Modal */}
      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      )}
    </div>
  );
}
