/**
 * src/pages/ProfilePage.jsx
 * Real user profile page backed by Supabase.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar, MapPin, Image, Heart, MessageSquare, Palette, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { supabase } from '../api/supabaseClient';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({ artworks: 0, likes: 0, forumPosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (cancelled) return;
      setProfile(profileData);

      if (profileData) {
        const [{ data: kids }, { data: arts }, { count: forumCount }] = await Promise.all([
          supabase.from('children').select('*').eq('parent_id', profileData.id),
          supabase.from('artworks').select('like_count').eq('parent_id', profileData.id),
          supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('author_id', profileData.id),
        ]);
        if (cancelled) return;
        setChildren(kids || []);
        setStats({
          artworks: arts?.length || 0,
          likes: (arts || []).reduce((s, a) => s + (a.like_count || 0), 0),
          forumPosts: forumCount || 0,
        });
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-brand-500" />
      </div>
    );
  }

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`
    : (user?.email?.[0] || '?').toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar />
      <div className="page-container pt-24 pb-20 max-w-4xl">
        {/* Header card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-glow shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">
                {profile ? `${profile.first_name} ${profile.last_name}` : user?.email}
              </h1>
              <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail size={13} /> {user?.email}
              </p>
              {profile?.location && (
                <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <MapPin size={12} /> {profile.location}
                </p>
              )}
              <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Calendar size={12} /> Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/upload" className="btn-primary text-sm py-2.5"><Palette size={15} />Upload Art</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center bg-brand-50/60 dark:bg-brand-900/20 rounded-2xl py-4">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.artworks}</p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Image size={12} /> Artworks</p>
            </div>
            <div className="text-center bg-pink-50/60 dark:bg-pink-900/20 rounded-2xl py-4">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.likes}</p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Heart size={12} /> Likes</p>
            </div>
            <div className="text-center bg-sky-50/60 dark:bg-sky-900/20 rounded-2xl py-4">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.forumPosts}</p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><MessageSquare size={12} /> Forum Posts</p>
            </div>
          </div>
        </div>

        {/* Children */}
        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">My Children</h2>
        {children.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 text-sm">
            No child profiles yet — <Link to="/upload" className="text-brand-600 font-semibold">add one here</Link>.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {children.map(c => (
              <div key={c.id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xl font-extrabold shrink-0">
                  {(c.display_name || 'C')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{c.display_name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{c.age_group?.replace('_', ' ')}</p>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  <p>{c.total_uploads ?? 0} artworks</p>
                  <p>{c.total_likes ?? 0} likes</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}