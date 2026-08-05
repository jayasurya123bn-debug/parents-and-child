/**
 * src/pages/AdminDashboard.jsx
 *
 * Comprehensive Admin Panel with:
 *  - Collapsible sidebar navigation
 *  - Overview analytics with mini bar chart
 *  - Content moderation queue (approve / reject / flag)
 *  - Flagged content review
 *  - User management table
 *  - Activity log
 */

import React, { useState } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Image, Flag, Users, MessageSquare, BarChart2,
  CheckCircle, XCircle, AlertTriangle, Clock, Shield, Menu, X,
  ChevronRight, Palette, TrendingUp, Eye, Star, Bell, LogOut,
  UserX, Trash2, Check, Ban, RefreshCw, FileText, Search,
} from 'lucide-react';
import {
  ADMIN_STATS, PENDING_ARTWORKS, FLAGGED_CONTENT,
  RECENT_USERS, ACTIVITY_LOG, WEEKLY_UPLOADS,
} from '../data/adminMockData';
import { format } from 'date-fns';

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

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.count));
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

// ══════════════════════════════════════════════════════════════
// ── Sub-pages ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

// ── Overview ─────────────────────────────────────────────────
function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Platform Overview</h2>
        <p className="text-sm text-gray-500">Real-time summary of ArtBloom activity and content status.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20}/>}     label="Total Parents"     value={ADMIN_STATS.totalUsers}        sub={`+${ADMIN_STATS.newUsersThisWeek} this week`}  color="bg-gradient-to-br from-brand-500 to-brand-600"/>
        <StatCard icon={<Image size={20}/>}     label="Total Artworks"    value={ADMIN_STATS.totalArtworks}     sub="All approved"    color="bg-gradient-to-br from-emerald-500 to-teal-600"/>
        <StatCard icon={<Clock size={20}/>}     label="Pending Review"    value={ADMIN_STATS.pendingArtworks}   sub="Needs attention" color="bg-gradient-to-br from-amber-400 to-orange-500" alert={true}/>
        <StatCard icon={<Flag size={20}/>}      label="Flagged Content"   value={ADMIN_STATS.flaggedContent}    sub="Requires action" color="bg-gradient-to-br from-red-500 to-rose-600"    alert={true}/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle size={20}/>} label="Reports Resolved"  value={ADMIN_STATS.resolvedReports}  sub="All time"         color="bg-gradient-to-br from-sky-500 to-blue-600"/>
        <StatCard icon={<MessageSquare size={20}/>} label="Forum Posts"    value={ADMIN_STATS.totalForumPosts}  sub="Parent community" color="bg-gradient-to-br from-violet-500 to-purple-600"/>
        <StatCard icon={<TrendingUp size={20}/>} label="Active Today"      value={ADMIN_STATS.activeToday}       sub="Unique sessions"  color="bg-gradient-to-br from-pink-500 to-rose-500"/>
        <StatCard icon={<Shield size={20}/>}    label="Safety Score"       value="99.7%"                        sub="Platform health"  color="bg-gradient-to-br from-green-500 to-emerald-600"/>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly uploads chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Artwork Uploads</h3>
              <p className="text-xs text-gray-400">This week</p>
            </div>
            <span className="badge badge-approved text-xs">↑ 18% vs last week</span>
          </div>
          <MiniBarChart data={WEEKLY_UPLOADS}/>
          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span>Total: {WEEKLY_UPLOADS.reduce((s,d)=>s+d.count,0)} uploads</span>
            <span>Peak: Fri ({Math.max(...WEEKLY_UPLOADS.map(d=>d.count))})</span>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Your Recent Actions</h3>
            <RefreshCw size={14} className="text-gray-400 cursor-pointer hover:text-brand-500 transition-colors"/>
          </div>
          <div className="space-y-3">
            {ACTIVITY_LOG.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${ACTION_COLOR[a.type]}`}>{ACTION_ICON[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{a.action}</p>
                  <p className="text-xs text-gray-400 truncate">{a.target}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{a.time}</span>
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
  const [items, setItems] = useState(PENDING_ARTWORKS);
  const [selected, setSelected] = useState(null);

  const act = (id, action) => {
    setItems(list => list.filter(i => i._id !== id));
    setSelected(null);
  };

  const safeColor = (score) => {
    if (score >= 0.95) return 'text-green-500';
    if (score >= 0.8)  return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Moderation Queue</h2>
          <p className="text-sm text-gray-500">Review and approve artwork submissions before they go public.</p>
        </div>
        {items.length > 0 && (
          <span className="badge badge-pending text-sm px-3 py-1">{items.length} pending</span>
        )}
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
            <div key={art._id} className="glass-card overflow-hidden hover:shadow-glow transition-all duration-300">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-brand-50 dark:bg-brand-900/30 overflow-hidden cursor-pointer" onClick={() => setSelected(art)}>
                <img src={art.images?.thumbnail?.url} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                {/* AI Safety score badge */}
                <div className={`absolute top-2 right-2 bg-white/90 dark:bg-black/60 rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-bold ${safeColor(art.aiSafetyScore)}`}>
                  <Shield size={10}/> {(art.aiSafetyScore * 100).toFixed(0)}% safe
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-white text-xs">
                  <Clock size={10}/> {fmt(art.submittedAt)}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{art.title}</h3>
                  <span className="badge bg-brand-50 text-brand-600 capitalize text-xs shrink-0">{art.category}</span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>🎨 <strong>{art.child?.displayName}</strong>, age {art.child?.age} · {art.medium}</p>
                  <p>👤 Parent: {art.parent?.firstName} {art.parent?.lastName}</p>
                  <p className="line-clamp-2 text-gray-400 leading-relaxed">{art.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {art.tags?.map(t => <span key={t} className="text-xs bg-gray-100 dark:bg-brand-900/40 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>)}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => act(art._id, 'approve')}
                    className="flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600 dark:text-green-400 text-xs font-bold py-2 rounded-xl transition-colors">
                    <Check size={13}/> Approve
                  </button>
                  <button onClick={() => act(art._id, 'reject')}
                    className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold py-2 rounded-xl transition-colors">
                    <XCircle size={13}/> Reject
                  </button>
                  <button onClick={() => act(art._id, 'flag')}
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
  const [items, setItems] = useState(FLAGGED_CONTENT);
  const dismiss = (id) => setItems(list => list.filter(i => i._id !== id));

  const TYPE_ICON = { comment: <MessageSquare size={16}/>, forum_post: <FileText size={16}/>, artwork: <Image size={16}/> };
  const TYPE_COLOR = { comment: 'bg-sky-100 text-sky-600', forum_post: 'bg-violet-100 text-violet-600', artwork: 'bg-pink-100 text-pink-600' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Flagged Content</h2>
        <p className="text-sm text-gray-500">Community-reported content requiring admin review.</p>
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
            <div key={item._id} className="glass-card p-5 border-l-4 border-orange-400">
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLOR[item.type]}`}>
                  {TYPE_ICON[item.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge capitalize text-xs ${TYPE_COLOR[item.type]}`}>{item.type.replace('_',' ')}</span>
                    <span className="text-xs text-gray-400">· {fmt(item.reportedAt)}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Re: <span className="text-brand-600 dark:text-brand-400">"{item.targetTitle}"</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{item.text}</p>
                  <p className="text-xs text-gray-400">
                    <strong>Reason:</strong> {item.reason} · <strong>Reported by:</strong> {item.reportedBy}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => dismiss(item._id)}
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                    <Trash2 size={12}/> Remove
                  </button>
                  <button onClick={() => dismiss(item._id)}
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                    <Check size={12}/> Dismiss
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

// ── User Management ───────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState(RECENT_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSuspend = (id) => {
    setUsers(list => list.map(u =>
      u._id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">User Management</h2>
          <p className="text-sm text-gray-500">View, suspend, or manage parent accounts.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input-field pl-10 text-sm py-2.5"/>
      </div>

      {/* Table */}
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
                <tr key={u._id} className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.firstName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{fmt(u.joinedAt)}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-200">{u.children}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-200">{u.artworks}</td>
                  <td className="px-5 py-4">
                    <span className={STATUS_BADGE[u.status]}>{u.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSuspend(u._id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                          u.status === 'active'
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-600'
                        }`}>
                        {u.status === 'active' ? <><Ban size={11}/> Suspend</> : <><Check size={11}/> Restore</>}
                      </button>
                      <button className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center gap-1">
                        <UserX size={11}/> Delete
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

// ── Analytics stub ────────────────────────────────────────────
function Analytics() {
  const categories = [
    { name: 'Painting',   count: 412, pct: 33, color: 'bg-brand-500' },
    { name: 'Drawing',    count: 287, pct: 23, color: 'bg-accent-500' },
    { name: 'Craft',      count: 198, pct: 16, color: 'bg-emerald-500' },
    { name: 'Digital',    count: 165, pct: 13, color: 'bg-sky-500' },
    { name: 'Sculpture',  count: 99,  pct: 8,  color: 'bg-violet-500' },
    { name: 'Mixed Media',count: 87,  pct: 7,  color: 'bg-pink-500' },
  ];
  const ageGroups = [
    { name: '2–4 yrs (Toddler)',           count: 89,  pct: 23, color: 'bg-pink-400' },
    { name: '5–7 yrs (Early Childhood)',   count: 134, pct: 34, color: 'bg-amber-400' },
    { name: '8–11 yrs (Middle Childhood)', count: 119, pct: 31, color: 'bg-green-400' },
    { name: '12–17 yrs (Tween)',           count: 45,  pct: 12, color: 'bg-sky-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Analytics</h2>
        <p className="text-sm text-gray-500">Platform content breakdown and demographic insights.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><BarChart2 size={16} className="text-brand-500"/> Artworks by Category</h3>
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
        </div>

        {/* Age Group Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Users size={16} className="text-brand-500"/> Artists by Age Group</h3>
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
        </div>

        {/* Weekly uploads chart */}
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><TrendingUp size={16} className="text-brand-500"/> Weekly Upload Trend</h3>
          <p className="text-xs text-gray-400 mb-5">Artwork submissions per day this week</p>
          <div className="flex items-end gap-3 h-24">
            {WEEKLY_UPLOADS.map(d => {
              const max = Math.max(...WEEKLY_UPLOADS.map(x=>x.count));
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

const NAV_ITEMS = [
  { to: '/admin',           label: 'Overview',    icon: <LayoutDashboard size={18}/>, end: true },
  { to: '/admin/queue',     label: 'Mod Queue',   icon: <Clock size={18}/>,           badge: ADMIN_STATS.pendingArtworks },
  { to: '/admin/flagged',   label: 'Flagged',     icon: <Flag size={18}/>,            badge: ADMIN_STATS.flaggedContent },
  { to: '/admin/users',     label: 'Users',       icon: <Users size={18}/> },
  { to: '/admin/analytics', label: 'Analytics',   icon: <BarChart2 size={18}/> },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 transition-all duration-300 bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-xl border-r border-brand-100 dark:border-brand-900 flex flex-col h-screen sticky top-0 z-40`}>
        {/* Logo */}
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

        {/* Nav */}
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
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-brand-100 dark:border-brand-900 space-y-1">
          <Link to="/gallery" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-all`}>
            <Palette size={18} className="shrink-0"/>
            {sidebarOpen && <span>View Gallery</span>}
          </Link>
          <button onClick={() => navigate('/login')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all`}>
            <LogOut size={18} className="shrink-0"/>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-xl border-b border-brand-100 dark:border-brand-900 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Logged in as <strong>admin@artshowcase.com</strong></p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center text-brand-500 hover:bg-brand-100 transition-colors">
              <Bell size={16}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">A</div>
          </div>
        </header>

        {/* Page content */}
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
