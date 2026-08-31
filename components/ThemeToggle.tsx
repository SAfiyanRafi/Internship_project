'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
      className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 shadow-md'
          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-700" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
}
