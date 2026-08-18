/**
 * src/pages/ForumPage.jsx
 * Parent community forum backed by Supabase.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, Eye, Send, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { supabase } from '../api/supabaseClient';

const FORUM_CATEGORIES = [
  { value: 'general_discussion',  label: '💬 General Discussion' },
  { value: 'tips_and_advice',     label: '💡 Tips & Advice' },
  { value: 'art_techniques',      label: '🎨 Art Techniques' },
  { value: 'child_development',   label: '🌱 Child Development' },
  { value: 'materials_and_supplies', label: '🖍️ Materials & Supplies' },
  { value: 'showcase_feedback',   label: '⭐ Showcase Feedback' },
  { value: 'events_and_activities', label: '🎉 Events & Activities' },
];

const CATEGORY_COLORS = {
  general_discussion:    'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  tips_and_advice:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  art_techniques:        'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  child_development:     'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  materials_and_supplies:'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  showcase_feedback:     'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  events_and_activities: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
  announcements:         'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};

export default function ForumPage() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general_discussion');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, author:users(first_name, last_name)')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!profile) {
      setError('User profile not found. Please register again.');
      setPosting(false);
      return;
    }

    const { error: postError } = await supabase.from('forum_posts').insert([{
      author_id: profile.id,
      title,
      body,
      category,
    }]);

    setPosting(false);
    if (postError) {
      setError(postError.message);
      return;
    }
    setTitle('');
    setBody('');
    setCategory('general_discussion');
    setShowForm(false);
    fetchPosts();
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar />
      <div className="page-container pt-24 pb-20 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-subtitle">💬 A warm space for parents</p>
            <h1 className="section-header">Parent Community Forum</h1>
          </div>
          {isAuthenticated && (
            <button onClick={() => setShowForm(f => !f)} className="btn-primary text-sm py-2.5">
              <MessageSquare size={15} /> {showForm ? 'Cancel' : 'New Post'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">{error}</div>
        )}

        {/* New post form */}
        {showForm && (
          <form onSubmit={handleCreate} className="glass-card p-6 mb-8 space-y-4 animate-slide-up">
            <h3 className="font-bold text-gray-900 dark:text-white">Start a Discussion</h3>
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                {FORUM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="What would you like to discuss?" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Message</label>
              <textarea required value={body} onChange={e => setBody(e.target.value)} className="input-field min-h-[120px]" placeholder="Share your thoughts..." />
            </div>
            <button type="submit" disabled={posting} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
              {posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publish Post
            </button>
          </form>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No discussions yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              {isAuthenticated ? 'Be the first to start a conversation!' : 'Sign in to start a discussion.'}
            </p>
            {!isAuthenticated && (
              <Link to="/login" className="btn-primary text-sm inline-block">Sign In</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <article key={post.id} className="glass-card p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge text-xs capitalize ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general_discussion}`}>
                    {(post.category || 'general_discussion').replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-line">{post.body}</p>
                <div className="flex items-center justify-between pt-3 border-t border-brand-50 dark:border-brand-900/50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                      {(post.author?.first_name || 'P')[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">
                      {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Parent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Heart size={13} /> {post.upvote_count || 0}</span>
                    <span className="flex items-center gap-1"><Eye size={13} /> {post.view_count || 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}