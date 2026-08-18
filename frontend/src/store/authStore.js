/**
 * src/store/authStore.js
 * Zustand global auth state synced with Supabase Auth.
 */

import { create } from 'zustand';
import { supabase } from '../api/supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // Called once on app load to get current session and setup listener
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({
      user: session?.user || null,
      isAuthenticated: !!session,
      isInitialized: true,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user || null,
        isAuthenticated: !!session,
      });
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
