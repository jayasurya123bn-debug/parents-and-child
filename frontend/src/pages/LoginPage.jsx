/**
 * src/pages/LoginPage.jsx
 * Beautiful login page — API integration in Phase 4.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Palette, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlyingEmojis from '../components/FlyingEmojis';

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Phase 4: Login API will be wired here.\n\nEmail: ' + form.email);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar />
      <div className="relative pt-24 pb-20 flex items-center justify-center min-h-screen overflow-hidden">
        {/* Blobs */}
        <div className="bg-blob w-80 h-80 bg-brand-400 -top-20 -left-20"/>
        <div className="bg-blob w-64 h-64 bg-accent-400 bottom-0 right-0"/>

        <FlyingEmojis />

        <div className="relative w-full max-w-md mx-auto px-4 z-10">
          <div className="glass-card p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow mx-auto mb-4">
                <Palette size={28} className="text-white"/>
              </div>
              <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Welcome Back!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your parent account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input
                    type={show ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded border-brand-300 text-brand-500 focus:ring-brand-400"/>
                  Remember me
                </label>
                <a href="#" className="text-brand-600 hover:text-brand-700 font-semibold">Forgot password?</a>
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-base mt-2">
                Sign In to ArtBloom
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700">Create one free →</Link>
              </p>
            </div>

            {/* Safety note */}
            <div className="mt-6 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-400">
              <Shield size={14} className="shrink-0"/>
              Parent accounts only — children are managed through your dashboard
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
