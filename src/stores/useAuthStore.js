import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuthStore = create((set) => ({
  user: null, // { uid, name, role }
  isLoading: true,
  
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({ user: null });
    window.location.href = '/';
  },
}));

