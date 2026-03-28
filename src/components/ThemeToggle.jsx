import { useThemeStore } from '../stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-10 h-10 shrink-0 box-border flex items-center justify-center border border-themed text-themed bg-transparent font-bold transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      <Sun
        size={18}
        strokeWidth={2.5}
        className={`absolute transition-all duration-300 ${
          theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
      <Moon
        size={18}
        strokeWidth={2.5}
        className={`absolute transition-all duration-300 ${
          theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  );
}
