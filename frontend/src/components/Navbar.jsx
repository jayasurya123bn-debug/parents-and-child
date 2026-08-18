/**
 * src/components/Navbar.jsx
 * Responsive navigation bar with mobile menu, auth state, and smooth styling.
 */
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Palette, Menu, X, Upload, MessageSquare, User, LogOut, Shield, Home } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { supabase } from '../api/supabaseClient';

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isAuthenticated, logout, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data?.role === 'admin');
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAuth = isInitialized && isAuthenticated;

  const links = [
    { to: '/gallery',   label: 'Gallery',    icon: <Home size={16}/> },
    { to: '/kids',      label: '🎨 Kids Zone', icon: null },
    { to: '/forum',     label: 'Community',  icon: <MessageSquare size={16}/> },
    ...(isAuth ? [{ to: '/upload',    label: 'Upload',     icon: <Upload size={16}/> }] : []),
    ...(isAdmin ? [{ to: '/admin',   label: 'Admin',      icon: <Shield size={16}/> }] : []),
  ];


  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-xl shadow-soft border-b border-brand-100/60 dark:border-brand-900/40' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/gallery" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
              <Palette size={18} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl gradient-text">ArtBloom</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-300'
                  }`
                }>
                {l.icon}{l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <>
                <NavLink to="/profile" className="btn-ghost p-2">
                  <User size={18} />
                </NavLink>
                <button onClick={handleLogout} className="btn-ghost p-2 text-red-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Join Free</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden btn-ghost p-2">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden absolute top-full inset-x-0 bg-white/95 dark:bg-[#0f0a1e]/95 backdrop-blur-xl border-b border-brand-100 dark:border-brand-900 shadow-xl p-4 flex flex-col gap-2 animate-slide-up">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-brand-50'
                }`
              }>
              {l.icon}{l.label}
            </NavLink>
          ))}
          <div className="border-t border-brand-100 pt-3 flex gap-2">
            {isAuth ? (
              <button onClick={handleLogout} className="btn-secondary flex-1 text-sm">Logout</button>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary flex-1 text-sm text-center" onClick={() => setOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary flex-1 text-sm text-center"  onClick={() => setOpen(false)}>Join Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
