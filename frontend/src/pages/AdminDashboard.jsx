/**
 * src/pages/AdminDashboard.jsx
 *
 * Admin Panel with real Supabase data:
 *  - Overview analytics
 *  - Content moderation queue (approve / reject / flag)
 *  - Flagged content review
 *  - User management
 *  - Analytics
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Image, Flag, Users, MessageSquare, BarChart2,
  CheckCircle, XCircle, AlertTriangle, Clock, Shield, Menu, X,
  ChevronRight, Palette, TrendingUp, Eye, Star, Bell, LogOut,
  UserX, Trash2, Check, Ban, RefreshCw, FileText, Search, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../api/supabaseClient';
import useAuthStore from '../store/authStore';

// ── Helpers ──────────────────────────────────────────────────
const fmt = (iso) => {
  try { return format(new Date(iso), 'MMM d, h:mm a'); } catch { return iso; }
};

const STATUS_BADGE = {
  active   : 'badge-approved',
  suspended: 'badge-rejected',
  pending  : 'badge-pending',
};

const ACTION_COLOR = {
  approve : 'text-green-500',
  reject  : 'text-red-500',
  remove  : 'text-red-400',
  suspend : 'text-orange-500',
  resolve : 'text-sky-500',
  feature : 'text-amber-500',
};

const ACTION_ICON = {
  approve : <CheckCircle size={14}/>,
  reject  : <XCircle size={14}/>,
  remove  : <Trash2 size={14}/>,
  suspend : <Ban size={14}/>,
  resolve : <Check size={14}/>,
  feature : <Star size={14}/>,
};

// Get the admin's id in public.users (used as moderated_by)
async function getAdminId(email) {
  const { data } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  return data?.id || null;
}

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map(d => (
        <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 hover:from-accent-500 hover:to-accent-400 cursor-pointer"
            style={{ height: `${(d.count / max) * 56}px` }}
            title={`${d.day}: ${d.count} uploads`}
          />
          <span className="text-[10px] text-gray-400 font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, alert }) {
  return (
    <div className={`glass-card p-5 flex items-start gap-4 relative ${alert ? 'ring-2 ring-red-300 dark:ring-red-700' : ''}`}>
      {alert && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-md shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function useWeeklyUploads() {
  const [weekly, setWeekly] = useState([]);
  useEffect(() => {
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from('artworks')
        .select('created_at')
        .gte('created_at', weekAgo);
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const buckets = days.map(day => ({ day, count: 0 }));
      (data || []).forEach(a => {
        const d = new Date(a.created_at);
        if (!isNaN(d)) buckets[d.getDay()].count++;
      });
      setWeekly(buckets);
    })();
  }, []);
  return weekly;
}

// ══════════════════════════════════════════════════════════════
// ── Sub-pages ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

// ── Overview ─────────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState(null);
  const WEEKLY_UPLOADS = useWeeklyUploads();

  useEffect(() => {
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [
        { count: totalUsers },
        { count: newUsersThisWeek },
        { count: totalArtworks },
        { count: pendingArtworks },
        { count: flaggedContent },
        { count: totalForumPosts },
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('artworks').select('id', { count: 'exact', head: true }),
        supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
        supabase.from('artworks').select('id', { count: 'exact', head: true }).gt('report_count', 0),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        totalArtworks: totalArtworks || 0,
        pendingArtworks: pendingArtworks || 0,
        flaggedContent: flaggedContent || 0,
        totalForumPosts: totalForumPosts || 0,
      });
    })();
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Platform Overview</h2>
        <p className="text-sm text-gray-500">Real-time summary of ArtBloom activity and content status.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20}/>}     label="Total Parents"     value={stats.totalUsers}        sub={`+${stats.newUsersThisWeek} this week`}  color="bg-gradient-to-br from-brand-500 to-brand-600"/>
        <StatCard icon={<Image size={20}/>}     label="Total Artworks"    value={stats.totalArtworks}     sub="All submissions"  color="bg-gradient-to-br from-emerald-500 to-teal-600"/>
        <StatCard icon={<Clock size={20}/>}     label="Pending Review"    value={stats.pendingArtworks}   sub="Needs attention"  color="bg-gradient-to-br from-amber-400 to-orange-500" alert={stats.pendingArtworks > 0}/>
        <StatCard icon={<Flag size={20}/>}      label="Flagged Content"   value={stats.flaggedContent}    sub="Requires action"  color="bg-gradient-to-br from-red-500 to-rose-600"    alert={stats.flaggedContent > 0}/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle size={20}/>} label="Approved Artworks" value={stats.totalArtworks - stats.pendingArtworks} sub="All time" color="bg-gradient-to-br from-sky-500 to-blue-600"/>
        <StatCard icon={<MessageSquare size={20}/>} label="Forum Posts"    value={stats.totalForumPosts}  sub="Parent community" color="bg-gradient-to-br from-violet-500 to-purple-600"/>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Artwork Uploads</h3>
              <p className="text-xs text-gray-400">This week</p>
            </div>
          </div>
          <MiniBarChart data={WEEKLY_UPLOADS}/>
          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>Total: {WEEKLY_UPLOADS.reduce((s,d)=>s+d.count,0)} uploads</span>
            <span>Peak: {WEEKLY_UPLOADS.reduce((m,d)=>Math.max(m,d.count),0)}</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Moderation Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats.pendingArtworks, color: 'bg-amber-400' },
              { label: 'Flagged', value: stats.flaggedContent, color: 'bg-red-500' },
              { label: 'Approved', value: stats.totalArtworks - stats.pendingArtworks, color: 'bg-green-500' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <span>{s.label}</span><span>{s.value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`}
                    style={{ width: `${stats.totalArtworks ? (s.value / stats.totalArtworks) * 100 : 0}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Moderation Queue ─────────────────────────────────────────
function ModerationQueue() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('*, child:children(display_name, date_of_birth), parent:users(first_name, last_name)')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    const adminId = await getAdminId(user?.email);
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
    const { error } = await supabase
      .from('artworks')
      .update({ moderation_status: status, moderated_by: adminId, moderated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setItems(list => list.filter(i => i.id !== id));
      setSelected(null);
    }
  };

  const ageFromDob = (dob) => {
    if (!dob) return null;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Moderation Queue</h2>
          <p className="text-sm text-gray-500">Review and approve artwork submissions before they go public.</p>
        </div>
        {items.length > 0 && <span className="badge badge-pending text-sm px-3 py-1">{items.length} pending</span>}
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4"/>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Queue is Clear!</h3>
          <p className="text-gray-400 text-sm">All artwork submissions have been reviewed. Great work! 🎉</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(art => (
            <div key={art.id} className="glass-card overflow-hidden hover:shadow-glow transition-all duration-300">
              <div className="group relative rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800" onClick={() => setSelected(art)}>
                <img src={art.image_original_url} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-white text-xs">
                  <Clock size={10}/> {fmt(art.created_at)}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{art.title}</h3>
                  <span className="badge bg-brand-50 text-brand-600 capitalize text-xs shrink-0">{art.category}</span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>🎨 <strong>{art.child?.display_name}</strong>, age {ageFromDob(art.child?.date_of_birth) ?? '—'} · {art.medium || '—'}</p>
                  <p>👤 Parent: {art.parent?.first_name} {art.parent?.last_name}</p>
                  <p className="line-clamp-2 text-gray-400 leading-relaxed">{art.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => act(art.id, 'approve')}
                    className="flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600 dark:text-green-400 text-xs font-bold py-2 rounded-xl transition-colors">
                    <Check size={13}/> Approve
                  </button>
                  <button onClick={() => act(art.id, 'reject')}
                    className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold py-2 rounded-xl transition-colors">
                    <XCircle size={13}/> Reject
                  </button>
                  <button onClick={() => act(art.id, 'flag')}
                    className="flex items-center justify-center gap-1 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 text-orange-600 dark:text-orange-400 text-xs font-bold py-2 rounded-xl transition-colors">
                    <Flag size={13}/> Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Flagged Content ───────────────────────────────────────────
function FlaggedContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('id, title, image_original_url, report_count, created_at')
      .gt('report_count', 0)
      .order('report_count', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    const { error } = await supabase
      .from('artworks')
      .update({ moderation_status: 'flagged', is_published: false })
      .eq('id', id);
    if (!error) setItems(list => list.filter(i => i.id !== id));
  };

  const dismiss = async (id) => {
    const { error } = await supabase
      .from('artworks')
      .update({ report_count: 0 })
      .eq('id', id);
    if (!error) setItems(list => list.filter(i => i.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Flagged Content</h2>
        <p className="text-sm text-gray-500">Artworks with community reports requiring admin review.</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Shield size={48} className="text-green-400 mx-auto mb-4"/>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">All Clear!</h3>
          <p className="text-gray-400 text-sm">No flagged content to review at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="glass-card p-5 border-l-4 border-orange-400 flex items-start gap-4">
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                <img src={item.image_original_url} alt={item.title} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge capitalize text-xs bg-orange-50 text-orange-600">artwork</span>
                  <span className="text-xs text-gray-400">· {fmt(item.created_at)}</span>
                  <span className="badge bg-red-50 text-red-600 text-xs">{item.report_count} reports</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Re: <span className="text-brand-600 dark:text-brand-400">"{item.title}"</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => remove(item.id)}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                  <Trash2 size={12}/> Unpublish
                </button>
                <button onClick={() => dismiss(item.id)}
                  className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                  <Check size={12}/> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── User Management ───────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const enriched = await Promise.all((data || []).map(async u => {
      const [{ count: childCount }, { count: artCount }] = await Promise.all([
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('parent_id', u.id),
        supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('parent_id', u.id),
      ]);
      return { ...u, children: childCount || 0, artworks: artCount || 0 };
    }));
    setUsers(enriched);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSuspend = async (id, status) => {
    const { error } = await supabase
      .from('users')
      .update({ account_status: status === 'active' ? 'suspended' : 'active' })
      .eq('id', id);
    if (!error) {
      setUsers(list => list.map(u =>
        u.id === id ? { ...u, account_status: u.account_status === 'active' ? 'suspended' : 'active' } : u
      ));
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">User Management</h2>
        <p className="text-sm text-gray-500">View, suspend, or manage parent accounts.</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input-field pl-10 text-sm py-2.5"/>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Children</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Artworks</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50 dark:divide-brand-900/50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {(u.first_name || '?')[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{fmt(u.created_at)}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-200">{u.children}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-200">{u.artworks}</td>
                  <td className="px-5 py-4">
                    <span className={STATUS_BADGE[u.account_status] || 'badge-pending'}>{u.account_status || 'active'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSuspend(u.id, u.account_status)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          u.account_status === 'active'
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-600'
                        }`}>
                        {u.account_status === 'active' ? <><Ban size={11}/> Suspend</> : <><Check size={11}/> Restore</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-40"/>
            <p className="text-sm">No users match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────
function Analytics() {
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const WEEKLY_UPLOADS = useWeeklyUploads();

  useEffect(() => {
    (async () => {
      const { data: artworks } = await supabase.from('artworks').select('category');
      const { data: children } = await supabase.from('children').select('age_group');

      const catMap = {};
      (artworks || []).forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + 1; });
      const totalArts = (artworks || []).length || 1;
      const catColors = ['bg-brand-500','bg-accent-500','bg-emerald-500','bg-sky-500','bg-violet-500','bg-pink-500','bg-amber-500','bg-rose-500'];
      setCategories(Object.entries(catMap).map(([name, count], i) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        count, pct: Math.round((count / totalArts) * 100),
        color: catColors[i % catColors.length],
      })).sort((a, b) => b.count - a.count));

      const ageMap = {};
      (children || []).forEach(c => { ageMap[c.age_group || 'unknown'] = (ageMap[c.age_group] || 0) + 1; });
      const totalKids = (children || []).length || 1;
      const ageColors = ['bg-pink-400','bg-amber-400','bg-green-400','bg-sky-400','bg-gray-400'];
      const ageLabels = {
        toddler: '2–4 yrs (Toddler)',
        early_childhood: '5–7 yrs (Early Childhood)',
        middle_childhood: '8–11 yrs (Middle Childhood)',
        tween: '12–17 yrs (Tween)',
      };
      setAgeGroups(Object.entries(ageMap).map(([name, count], i) => ({
        name: ageLabels[name] || name,
        count, pct: Math.round((count / totalKids) * 100),
        color: ageColors[i % ageColors.length],
      })).sort((a, b) => b.count - a.count));
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Analytics</h2>
        <p className="text-sm text-gray-500">Platform content breakdown and demographic insights.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><BarChart2 size={16} className="text-brand-500"/> Artworks by Category</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <span>{c.name}</span><span>{c.count} ({c.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full transition-all duration-700`} style={{ width: `${c.pct}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Users size={16} className="text-brand-500"/> Artists by Age Group</h3>
          {ageGroups.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {ageGroups.map(g => (
                <div key={g.name}>
                  <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <span>{g.name}</span><span>{g.count} ({g.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-brand-900/50 rounded-full overflow-hidden">
                    <div className={`h-full ${g.color} rounded-full transition-all duration-700`} style={{ width: `${g.pct}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><TrendingUp size={16} className="text-brand-500"/> Weekly Upload Trend</h3>
          <p className="text-xs text-gray-400 mb-5">Artwork submissions per day this week</p>
          <div className="flex items-end gap-3 h-24">
            {WEEKLY_UPLOADS.map(d => {
              const max = Math.max(...WEEKLY_UPLOADS.map(x=>x.count), 1);
              return (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1 group">
                  <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 hover:from-accent-500 hover:to-accent-300 transition-all duration-300 cursor-pointer"
                    style={{ height: `${(d.count / max) * 70}px` }}/>
                  <span className="text-xs font-semibold text-gray-500">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── MAIN ADMIN LAYOUT ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [{ count: pending }, { count: flagged }] = await Promise.all([
        supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
        supabase.from('artworks').select('id', { count: 'exact', head: true }).gt('report_count', 0),
      ]);
      setPendingCount(pending || 0);
      setFlaggedCount(flagged || 0);
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NAV_ITEMS = [
    { to: '/admin',           label: 'Overview',    icon: <LayoutDashboard size={18}/>, end: true },
    { to: '/admin/queue',     label: 'Mod Queue',   icon: <Clock size={18}/>,           badge: pendingCount },
    { to: '/admin/flagged',   label: 'Flagged',     icon: <Flag size={18}/>,            badge: flaggedCount },
    { to: '/admin/users',     label: 'Users',       icon: <Users size={18}/> },
    { to: '/admin/analytics', label: 'Analytics',   icon: <BarChart2 size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 transition-all duration-300 bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-xl border-r border-brand-100 dark:border-brand-900 flex flex-col h-screen sticky top-0 z-40`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-100 dark:border-brand-900">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-soft shrink-0">
            <Shield size={18} className="text-white"/>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-display font-extrabold text-sm gradient-text leading-tight">ArtBloom</p>
              <p className="text-xs text-gray-400 font-medium">Admin Panel</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o=>!o)} className="ml-auto text-gray-400 hover:text-brand-500 transition-colors">
            {sidebarOpen ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 shadow-soft'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
              {sidebarOpen && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"/>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-brand-100 dark:border-brand-900 space-y-1">
          <Link to="/gallery" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-all`}>
            <Palette size={18} className="shrink-0"/>
            {sidebarOpen && <span>View Gallery</span>}
          </Link>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all`}>
            <LogOut size={18} className="shrink-0"/>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-xl border-b border-brand-100 dark:border-brand-900 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Logged in as <strong>{user?.email || 'admin'}</strong></p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center text-brand-500 hover:bg-brand-100 transition-colors">
              <Bell size={16}/>
              {(pendingCount + flaggedCount) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
              )}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">
              {(user?.email || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index            element={<Overview/>}/>
            <Route path="queue"     element={<ModerationQueue/>}/>
            <Route path="flagged"   element={<FlaggedContent/>}/>
            <Route path="users"     element={<UserManagement/>}/>
            <Route path="analytics" element={<Analytics/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}