/**
 * src/pages/KidsZonePage.jsx
 *
 * A fully child-friendly, fun, colorful browsing experience designed
 * for children ages 4–17 to explore artwork, earn badges, and have fun!
 *
 * Features:
 *  - Giant colorful buttons with emojis
 *  - Animated characters and floating elements
 *  - Large readable fonts
 *  - Age-zone selector (Tiny Artists / Junior Artists / Pro Artists)
 *  - Gallery with big cards, fun reactions, and confetti on likes
 *  - "My Faves" collection
 *  - Simple avatar selector
 *  - Achievement badges display
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Sparkles, Trophy, Palette, Music2, Rainbow, Rocket, Flower2, Fish, Turtle, Bird, Dog, Cat, Sun, Moon, Cloud, Zap } from 'lucide-react';
import { supabase } from '../api/supabaseClient';

// ── Floating Emoji Particle ───────────────────────────────────
function FloatEmoji({ emoji, style }) {
  return (
    <span className="absolute text-3xl pointer-events-none select-none animate-float opacity-60" style={style}>
      {emoji}
    </span>
  );
}

// ── Confetti burst on like ────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const items = ['🎉','⭐','🌟','💖','🎨','✨','🌈','🎊'];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
      {items.map((e, i) => (
        <span key={i} className="absolute text-2xl animate-ping"
          style={{
            top: `${20 + Math.random()*60}%`,
            left: `${10 + Math.random()*80}%`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}>
          {e}
        </span>
      ))}
    </div>
  );
}

// ── Kid Artwork Card ──────────────────────────────────────────
function KidArtCard({ artwork, isFave, onFave, onReact }) {
  const [confetti, setConfetti] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [imgErr, setImgErr]     = useState(false);

  const REACTIONS = [
    { emoji: '❤️', label: 'Love it!' },
    { emoji: '⭐', label: 'Amazing!' },
    { emoji: '😮', label: 'Wow!'     },
    { emoji: '😄', label: 'Fun!'     },
    { emoji: '🤩', label: 'Super!'   },
  ];

  const handleFave = () => {
    setConfetti(true);
    onFave(artwork.id);
    setTimeout(() => setConfetti(false), 800);
  };

  const handleReact = (r) => {
    setReaction(r.emoji);
    onReact && onReact(artwork.id, r.emoji);
  };

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(artwork.title)}&background=c044ef&color=fff&size=400&font-size=0.3&bold=true`;

  return (
    <div className="relative group bg-white rounded-[2rem] overflow-hidden border-4 border-brand-200 hover:border-brand-400 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
      <Confetti active={confetti} />

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50">
        <img
          src={imgErr ? fallback : artwork.image_original_url || fallback}
          alt={artwork.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Fave button */}
        <button
          onClick={handleFave}
          className={`absolute top-3 right-3 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-200 active:scale-90 ${
            isFave ? 'bg-red-400 text-white scale-110' : 'bg-white/90 hover:bg-red-100'
          }`}
        >
          {isFave ? '❤️' : '🤍'}
        </button>

        {/* Current reaction display */}
        {reaction && (
          <div className="absolute top-3 left-3 text-3xl animate-bounce">{reaction}</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1 line-clamp-1">{artwork.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-extrabold">
            {artwork.child?.display_name?.[0] || '?'}
          </div>
          <span className="text-sm font-bold text-gray-600">{artwork.child?.display_name}</span>
          <span className="ml-auto text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-bold capitalize">
            {artwork.category?.replace('_', ' ')}
          </span>
        </div>

        {/* Reaction row */}
        <div className="flex items-center gap-1.5">
          {REACTIONS.map(r => (
            <button
              key={r.emoji}
              onClick={() => handleReact(r)}
              title={r.label}
              className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-75 ${
                reaction === r.emoji
                  ? 'bg-yellow-100 scale-110 ring-2 ring-yellow-400'
                  : 'bg-gray-50 hover:bg-yellow-50 hover:scale-110'
              }`}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Avatar Options ────────────────────────────────────────────
const AVATARS = [
  { id: 1, emoji: '🦁', bg: 'from-amber-400 to-orange-500', name: 'Leo the Lion' },
  { id: 2, emoji: '🐼', bg: 'from-gray-400 to-slate-500',   name: 'Panda Pal' },
  { id: 3, emoji: '🦊', bg: 'from-orange-400 to-red-500',   name: 'Foxy Friend' },
  { id: 4, emoji: '🐸', bg: 'from-green-400 to-emerald-600',name: 'Froggy' },
  { id: 5, emoji: '🦄', bg: 'from-pink-400 to-brand-500',   name: 'Uni the Unicorn' },
  { id: 6, emoji: '🐙', bg: 'from-violet-400 to-purple-600',name: 'Octo Artist' },
  { id: 7, emoji: '🐬', bg: 'from-sky-400 to-blue-600',     name: 'Dolphin Diva' },
  { id: 8, emoji: '🦋', bg: 'from-brand-400 to-accent-400', name: 'Butterfly' },
];

const BADGES = [
  { emoji: '🎨', label: 'First Artwork',  earned: true  },
  { emoji: '❤️', label: '5 Likes Given',  earned: true  },
  { emoji: '⭐', label: 'Super Fan',       earned: true  },
  { emoji: '🌈', label: '10 Faves',        earned: false },
  { emoji: '🏆', label: 'Top Reactor',     earned: false },
  { emoji: '🚀', label: 'Explorer',        earned: false },
];

const AGE_ZONES = [
  { id: 'tiny',   label: '🌱 Tiny Artists',   age: '4–7',   color: 'from-pink-400 to-rose-500',     bg: 'bg-pink-50',   border: 'border-pink-300'   },
  { id: 'junior', label: '🎨 Junior Artists',  age: '8–11',  color: 'from-brand-500 to-violet-600',  bg: 'bg-brand-50',  border: 'border-brand-300'  },
  { id: 'pro',    label: '🚀 Pro Artists',     age: '12–17', color: 'from-sky-500 to-indigo-600',    bg: 'bg-sky-50',    border: 'border-sky-300'    },
];

const FLOATS = [
  { emoji: '🎨', style: { top: '8%',  left: '3%',  animationDelay: '0s'   }},
  { emoji: '⭐', style: { top: '15%', right: '4%', animationDelay: '1s'   }},
  { emoji: '🌈', style: { top: '40%', left: '1%',  animationDelay: '2s'   }},
  { emoji: '🦋', style: { top: '60%', right: '2%', animationDelay: '0.5s' }},
  { emoji: '✨', style: { top: '80%', left: '5%',  animationDelay: '1.5s' }},
  { emoji: '🎪', style: { top: '25%', right: '3%', animationDelay: '2.5s' }},
];

// ═══════════════════════════════════════════════════════════════
// ── MAIN KIDS ZONE PAGE ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export default function KidsZonePage() {
  const [artworks,   setArtworks]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [zone,       setZone]       = useState(null);       // selected age zone
  const [avatar,     setAvatar]     = useState(AVATARS[4]); // selected avatar
  const [faves,      setFaves]      = useState([]);
  const [activeTab,  setActiveTab]  = useState('gallery');  // gallery | faves | badges | profile
  const [showAvatarPicker, setAvatarPicker] = useState(false);
  const [search,     setSearch]     = useState('');

  // Fetch artworks when zone changes
  useEffect(() => {
    const fetchArtworks = async () => {
      if (!zone) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select(`*, child:children!inner(display_name, age_group)`)
        .eq('moderation_status', 'approved')
        .eq('children.age_group', zone.age);
        
      if (!error && data) {
        setArtworks(data);
      }
      setLoading(false);
    };
    fetchArtworks();
  }, [zone]);

  const toggleFave = (id) => {
    setFaves(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const filtered = artworks.filter(a =>
    search ? (a.title.toLowerCase().includes(search.toLowerCase()) || a.child?.display_name?.toLowerCase().includes(search.toLowerCase())) : true
  );

  // ── Landing — pick your age zone ──────────────────────────
  if (!zone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef3ff] via-[#fff0fb] to-[#f0f8ff] relative overflow-hidden">
        {FLOATS.map((f, i) => <FloatEmoji key={i} {...f}/>)}

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
          {/* Back to main site */}
          <Link to="/gallery" className="absolute top-5 left-5 text-sm font-bold text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1">
            ← Back to main site
          </Link>

          {/* Hero */}
          <div className="mb-8">
            <div className="text-7xl mb-4 animate-bounce">🎨</div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-3 leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome to<br/>
              <span className="bg-gradient-to-r from-brand-500 via-accent-500 to-pink-500 bg-clip-text text-transparent">
                ArtBloom Kids!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-semibold max-w-lg mx-auto leading-relaxed">
              See amazing art made by kids just like you! 🌟
            </p>
          </div>

          {/* Avatar pick */}
          <div className="mb-10">
            <p className="text-lg font-bold text-gray-700 mb-4">👇 First, pick your animal buddy!</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-sm mx-auto">
              {AVATARS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a)}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.bg} text-3xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                    avatar.id === a.id ? 'ring-4 ring-brand-400 scale-110 shadow-glow' : ''
                  }`}
                  title={a.name}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
            {avatar && (
              <p className="text-brand-600 font-bold mt-3 text-lg animate-pulse">
                {avatar.emoji} You picked: <strong>{avatar.name}</strong>!
              </p>
            )}
          </div>

          {/* Age zone cards */}
          <div className="mb-8">
            <p className="text-xl font-extrabold text-gray-700 mb-5">Now choose YOUR zone! 🎯</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {AGE_ZONES.map(z => (
                <button
                  key={z.id}
                  onClick={() => setZone(z)}
                  className="group relative rounded-3xl p-6 border-4 border-transparent hover:border-brand-300 bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${z.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}/>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${z.color} flex items-center justify-center text-3xl shadow-md mx-auto mb-3`}>
                    {z.id === 'tiny'   && '🌱'}
                    {z.id === 'junior' && '🎨'}
                    {z.id === 'pro'    && '🚀'}
                  </div>
                  <p className="text-lg font-extrabold text-gray-900 mb-1">{z.label}</p>
                  <p className="text-sm font-bold text-gray-500">Ages {z.age}</p>
                  <div className="mt-3 py-2 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                    Let's Go! →
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Safety badge */}
          <div className="flex items-center gap-2 bg-green-100 text-green-700 rounded-2xl px-5 py-3 text-sm font-bold">
            🛡️ 100% Safe — Everything is checked by grown-ups before you see it!
          </div>
        </div>
      </div>
    );
  }

  // ── Main Kids Zone ─────────────────────────────────────────
  return (
    <div className={`min-h-screen relative overflow-hidden`}
      style={{ background: 'linear-gradient(135deg, #fef3ff 0%, #fff7f0 50%, #f0f8ff 100%)' }}>
      {FLOATS.map((f, i) => <FloatEmoji key={i} {...f}/>)}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">

        {/* ── Top bar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          {/* Avatar + Name */}
          <button onClick={() => setAvatarPicker(p=>!p)} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-md hover:shadow-lg transition-all">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-2xl shadow-md`}>
              {avatar.emoji}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-500">Playing as</p>
              <p className="text-sm font-extrabold text-gray-900">{avatar.name}</p>
            </div>
          </button>

          {/* Zone badge */}
          <div className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${zone.color} text-white rounded-2xl px-4 py-2.5 shadow-md font-extrabold text-sm`}>
            {zone.label}
          </div>

          {/* Back / Change zone */}
          <button onClick={() => setZone(null)} className="bg-white rounded-2xl px-4 py-2.5 shadow-md text-sm font-bold text-gray-600 hover:text-brand-600 hover:shadow-lg transition-all">
            🔄 Change Zone
          </button>
        </div>

        {/* Avatar picker popup */}
        {showAvatarPicker && (
          <div className="absolute top-24 left-4 z-50 bg-white rounded-3xl shadow-2xl p-5 border-4 border-brand-200 animate-slide-up">
            <p className="font-extrabold text-gray-800 mb-3 text-sm">Pick your buddy!</p>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map(a => (
                <button key={a.id} onClick={() => { setAvatar(a); setAvatarPicker(false); }}
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${a.bg} text-2xl flex items-center justify-center shadow-md hover:scale-110 transition-transform ${avatar.id===a.id ? 'ring-4 ring-brand-400' : ''}`}>
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Welcome banner ────────────────────────────────── */}
        <div className={`rounded-3xl bg-gradient-to-r ${zone.color} p-6 mb-6 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-8xl opacity-20 -mt-4 -mr-4">🎨</div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1" style={{fontFamily:'Poppins,sans-serif'}}>
              Hey {avatar.emoji}! Ready to explore? 🎉
            </h1>
            <p className="text-white/90 font-bold text-lg">
              Check out amazing art from real kids like you!
            </p>
          </div>
        </div>

        {/* ── Tab bar ───────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 bg-white/60 rounded-2xl p-1.5 shadow-inner overflow-x-auto no-scrollbar">
          {[
            { id: 'gallery', label: '🖼️ Gallery',        },
            { id: 'faves',   label: `❤️ My Faves (${faves.length})` },
            { id: 'badges',  label: '🏆 Badges'          },
            { id: 'profile', label: '👤 My Profile'      },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`shrink-0 flex-1 min-w-max py-3 px-4 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* Gallery Tab */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <div>
            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for art or artists…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-3 border-brand-200 focus:border-brand-400 bg-white text-lg font-bold placeholder-gray-400 focus:outline-none shadow-md transition-all"
                style={{ borderWidth: '3px' }}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-brand-400 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Art grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(art => (
                <KidArtCard
                  key={art.id}
                  artwork={art}
                  isFave={faves.includes(art.id)}
                  onFave={toggleFave}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-2xl font-extrabold text-gray-700">No art found!</p>
                <p className="text-gray-400 font-semibold mt-2">Try searching for something else 😊</p>
                <button onClick={() => setSearch('')} className="mt-4 bg-brand-500 text-white font-extrabold px-6 py-3 rounded-2xl text-lg hover:bg-brand-600 transition-colors">
                  Show All Art 🎨
                </button>
              </div>
            )}
            </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* Faves Tab */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'faves' && (
          <div>
            {faves.length === 0 ? (
              <div className="text-center py-16 bg-white/60 rounded-3xl">
                <div className="text-7xl mb-4 animate-bounce">💔</div>
                <h2 className="text-3xl font-extrabold text-gray-700 mb-2">No Faves Yet!</h2>
                <p className="text-gray-500 font-bold text-lg mb-6">Tap the ❤️ on any artwork to save it here!</p>
                <button onClick={() => setActiveTab('gallery')}
                  className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-extrabold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  🖼️ Explore Gallery
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-2xl font-extrabold text-gray-800">My Favourite Art!</h2>
                  <span className="bg-red-100 text-red-500 font-extrabold text-sm px-3 py-1 rounded-full">{faves.length} saved ❤️</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {artworks.filter(a => faves.includes(a.id)).map(art => (
                    <KidArtCard key={art.id} artwork={art} isFave={true} onFave={toggleFave}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* Badges Tab */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'badges' && (
          <div>
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">🏆</div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Your Badges</h2>
              <p className="text-gray-500 font-bold">Collect them all by exploring and reacting to art!</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...BADGES,
                { emoji: '💖', label: faves.length >= 5 ? '5 Art Faves! ✅' : `Save ${5-faves.length} more faves`, earned: faves.length >= 5 },
              ].map((b, i) => (
                <div key={i} className={`rounded-3xl p-6 text-center border-4 transition-all ${
                  b.earned
                    ? 'bg-white border-yellow-300 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className={`text-5xl mb-3 ${b.earned ? 'animate-bounce' : 'grayscale'}`}>{b.emoji}</div>
                  <p className={`font-extrabold text-sm ${b.earned ? 'text-gray-800' : 'text-gray-400'}`}>{b.label}</p>
                  {b.earned
                    ? <span className="mt-2 inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">✅ Earned!</span>
                    : <span className="mt-2 inline-block bg-gray-100 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">🔒 Locked</span>
                  }
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-3xl p-6 text-white text-center">
              <div className="text-4xl mb-2">🌟</div>
              <h3 className="text-xl font-extrabold mb-1">Keep exploring to earn more badges!</h3>
              <p className="text-white/80 font-semibold text-sm">React to art, save your faves, and come back every day!</p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* Profile Tab */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto">
            {/* Avatar card */}
            <div className={`rounded-3xl bg-gradient-to-br ${avatar.bg} p-8 text-center text-white shadow-xl mb-5`}>
              <div className="text-8xl mb-4">{avatar.emoji}</div>
              <h2 className="text-3xl font-extrabold mb-1">{avatar.name}</h2>
              <p className="text-white/80 font-bold">{zone.label} · Ages {zone.age}</p>
              <button onClick={() => setAvatarPicker(p=>!p)}
                className="mt-4 bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2 rounded-xl transition-colors text-sm">
                Change Avatar 🔄
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { emoji: '❤️', label: 'Faves Saved', value: faves.length },
                { emoji: '🏆', label: 'Badges',      value: BADGES.filter(b=>b.earned).length },
                { emoji: '🎨', label: 'Art Viewed',  value: artworks.length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-md border-2 border-brand-100">
                  <div className="text-3xl mb-1">{s.emoji}</div>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs font-bold text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA for parents */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-200 rounded-3xl p-6 text-center" style={{borderWidth:'3px'}}>
              <div className="text-4xl mb-2">👨‍👩‍👧</div>
              <h3 className="text-lg font-extrabold text-gray-800 mb-1">Want to share YOUR art?</h3>
              <p className="text-gray-500 font-semibold text-sm mb-4">Ask a parent or guardian to create an account and upload your masterpiece!</p>
              <Link to="/register"
                className="inline-block bg-gradient-to-r from-brand-500 to-accent-500 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Ask a Parent to Join Free 🎨
              </Link>
            </div>

            {/* Avatar picker */}
            {showAvatarPicker && (
              <div className="mt-5 bg-white rounded-3xl shadow-xl p-5 border-4 border-brand-200">
                <p className="font-extrabold text-gray-800 mb-3">Pick your buddy!</p>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map(a => (
                    <button key={a.id} onClick={() => { setAvatar(a); setAvatarPicker(false); }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.bg} text-3xl flex items-center justify-center shadow-md hover:scale-110 transition-transform ${avatar.id===a.id ? 'ring-4 ring-brand-400 scale-110' : ''}`}>
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom nav (mobile-friendly) ──────────────────── */}
        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t-4 border-brand-100 py-3 px-4 flex justify-around z-40 md:hidden">
          {[
            { id: 'gallery', emoji: '🖼️', label: 'Gallery' },
            { id: 'faves',   emoji: '❤️', label: 'Faves'   },
            { id: 'badges',  emoji: '🏆', label: 'Badges'  },
            { id: 'profile', emoji: '👤', label: 'Profile' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                activeTab === t.id ? 'text-brand-600 scale-110' : 'text-gray-400'
              }`}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-extrabold">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom padding for mobile nav */}
        <div className="h-20 md:h-4"/>
      </div>
    </div>
  );
}
