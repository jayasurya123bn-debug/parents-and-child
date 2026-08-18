/**
 * src/pages/RegisterPage.jsx
 * Beautiful registration page — API integration in Phase 4.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Palette, Shield, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlyingEmojis from '../components/FlyingEmojis';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

const PERKS = [
  'Create child profiles safely',
  'Upload & showcase artwork',
  'Join the parent community forum',
  'Admin-moderated, child-safe platform',
];

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', agree: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    
    if (authError) {
      let msg = authError.message;
      if (authError.status === 429 || /rate limit/i.test(msg)) {
        msg = 'Too many signup emails sent (rate limit hit). Wait ~1 hour, or ask the admin to create your account. Tip: turn OFF "Confirm email" in Supabase Auth to stop sending emails on signup.';
      }
      setError(msg);
      setLoading(false);
      return;
    }

    // Confirmation needed only when Supabase sends a verify email
    const needsConfirmation = !authData?.session && !authData?.user?.email_confirmed_at;
    setNeedsEmail(needsConfirmation);

    // 2. Insert into our users table
    if (authData?.user) {
      const { error: dbError } = await supabase.from('users').insert([{
        first_name: form.firstName,
        last_name: form.lastName,
        username: form.firstName.toLowerCase() + Math.floor(Math.random() * 10000),
        email: form.email,
        password: 'supabase_managed'
      }]);

      if (dbError) {
        console.error('Error inserting user data:', dbError);
        setError('Account created, but profile setup failed: ' + dbError.message + '. Please run the RLS fix SQL in Supabase and register again.');
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar/>
      <div className="relative pt-24 pb-20 flex items-center justify-center overflow-hidden">
        <div className="bg-blob w-80 h-80 bg-brand-300 -top-20 right-0"/>
        <div className="bg-blob w-64 h-64 bg-accent-300 bottom-10 left-0"/>

        <FlyingEmojis />

        <div className="relative w-full max-w-4xl mx-auto px-4 z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left — perks */}
            <div className="hidden md:block">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow mb-6">
                <Palette size={26} className="text-white"/>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
                Join ArtBloom<br/><span className="gradient-text">for Free Today</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Give your child a safe, beautiful space to share their creativity with a warm, moderated community of families.
              </p>
              <ul className="space-y-3">
                {PERKS.map(p => (
                  <li key={p} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center shrink-0">
                      <Check size={13} className="text-brand-600 dark:text-brand-400"/>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — form */}
            <div className="glass-card p-8">
              <h1 className="text-xl font-display font-extrabold text-gray-900 dark:text-white mb-1">Create Your Account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Parent accounts only · Free forever</p>

              {success ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center">
                  <Check size={32} className="mx-auto mb-2 text-green-500" />
                  <h3 className="font-bold text-lg mb-1">Registration Successful!</h3>
                  {needsEmail ? (
                    <p className="text-sm mb-4">Please check your email to verify your account.</p>
                  ) : (
                    <p className="text-sm mb-4">Your account is ready — you can sign in right now.</p>
                  )}
                  <Link to="/login" className="btn-primary py-2 px-6 inline-block">Go to Login</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="text" required placeholder="Sarah"
                        value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                        className="input-field pl-9 text-sm py-2.5"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input type="text" required placeholder="Johnson"
                      value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                      className="input-field text-sm py-2.5"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="email" required placeholder="you@example.com"
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="input-field pl-9 text-sm py-2.5"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type={show ? 'text' : 'password'} required placeholder="Min. 8 characters"
                      value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      className="input-field pl-9 pr-10 text-sm py-2.5"/>
                    <button type="button" onClick={() => setShow(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required checked={form.agree} onChange={e => setForm({...form, agree: e.target.checked})}
                    className="mt-0.5 rounded border-brand-300 text-brand-500 focus:ring-brand-400"/>
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    I agree to the <a href="#" className="text-brand-600 hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 hover:underline">Child Safety Policy</a>. I confirm I am the parent or legal guardian.
                  </span>
                </label>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Create Free Account →'}
                </button>
              </form>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700">Sign in</Link>
              </p>

              <div className="mt-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-400">
                <Shield size={13} className="shrink-0"/> All content is moderated by our safety team
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
