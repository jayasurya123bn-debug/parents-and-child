/**
 * src/pages/DashboardPage.jsx
 * Parent dashboard with child profiles, quick stats, and recent activity.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, MessageSquare, Heart, Image, Star, Users, Bell, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { supabase } from '../api/supabaseClient';

const CHILD_COLORS = [
  'from-pink-400 to-rose-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
];

const RECENT_ACTIVITY = [
  { icon: <Heart size={14} className="text-red-400"/>, text: 'Sarah liked Emma\'s "Rainbow Garden"', time: '2m ago' },
  { icon: <MessageSquare size={14} className="text-brand-400"/>, text: 'New comment on "Space Adventure"', time: '1h ago' },
  { icon: <Star size={14} className="text-amber-400"/>, text: 'Oliver\'s artwork was featured!', time: '3h ago' },
  { icon: <Bell size={14} className="text-green-400"/>, text: 'Your upload has been approved', time: '1d ago' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (cancelled) return;
      setProfile(profileData);

      if (profileData) {
        const { data: childrenData } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', profileData.id)
          .order('created_at', { ascending: false });
        if (!cancelled) setChildren(childrenData || []);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email || 'Guest';

  const ageFromDob = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar/>
      <div className="page-container pt-24">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-brand-500 font-bold mb-1">👋 Welcome back,</p>
            <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">{displayName}</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your children's art profiles and community activity</p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload" className="btn-primary text-sm py-2.5"><Upload size={15}/>Upload Art</Link>
            <Link to="/forum"  className="btn-secondary text-sm py-2.5"><MessageSquare size={15}/>Forum</Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Artworks', value: '17', icon: <Image size={18}/>, color: 'bg-gradient-to-br from-brand-500 to-brand-600' },
            { label: 'Total Likes',    value: '67', icon: <Heart size={18}/>, color: 'bg-gradient-to-br from-pink-500 to-rose-500'  },
            { label: 'Forum Posts',   value: '4',  icon: <MessageSquare size={18}/>, color: 'bg-gradient-to-br from-sky-500 to-blue-600' },
            { label: 'Featured',      value: '2',  icon: <Star size={18}/>,  color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-white shadow-md shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Child Profiles */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">My Children</h2>
              <button className="btn-ghost text-sm"><Plus size={15}/>Add Child</button>
            </div>
            <div className="grid gap-4">
              {loading ? (
                <div className="glass-card p-5 text-center text-sm text-gray-500">Loading your children...</div>
              ) : children.length === 0 ? (
                <div className="glass-card p-5 text-center text-sm text-gray-500">
                  No child profiles yet — add your first child to start showcasing artwork.
                </div>
              ) : (
                children.map((child, i) => (
                  <div key={child.id} className="glass-card p-5 flex items-center gap-4 hover:shadow-glow transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CHILD_COLORS[i % CHILD_COLORS.length]} flex items-center justify-center text-white text-2xl font-extrabold shadow-md shrink-0`}>
                      {(child.display_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{child.display_name}</h3>
                      <p className="text-xs text-gray-500">{ageFromDob(child.date_of_birth) ?? '—'} years old</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Image size={11}/>{child.total_uploads ?? 0} artworks</span>
                        <span className="flex items-center gap-1"><Heart size={11}/>{child.total_likes ?? 0} likes</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/profile/${child.id}`} className="btn-secondary text-xs py-1.5 px-3">View Profile</Link>
                      <Link to="/upload" className="btn-primary text-xs py-1.5 px-3"><Upload size={11}/>Upload</Link>
                    </div>
                  </div>
                ))
              )}

              {/* Add child card */}
              <div className="border-2 border-dashed border-brand-200 dark:border-brand-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all duration-200 cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <Plus size={22} className="text-brand-500"/>
                </div>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">Add Another Child</p>
                <p className="text-xs text-gray-400">Create a safe profile for your child</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="glass-card p-5 space-y-4">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center shrink-0 mt-0.5">{a.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
              <Link to="/gallery" className="flex items-center justify-center gap-1 text-xs text-brand-500 font-semibold hover:text-brand-600 pt-2 border-t border-brand-50 dark:border-brand-900/50">
                View Gallery <ChevronRight size={13}/>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
