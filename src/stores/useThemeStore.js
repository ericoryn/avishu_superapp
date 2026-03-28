import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('avishu-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('avishu-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  initTheme: () => {
    const theme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
    return set({ theme });
  },
}));
