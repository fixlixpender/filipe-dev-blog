import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bookmark, 
  GitBranch, 
  Lock,
  PenTool,
  Check
} from 'lucide-react';
import { ThemeMode } from '../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onOpenGitHubSync: () => void;
  onOpenDashboard: () => void;
  onLockAuthor: () => void;
  onTriggerAuthorGate: () => void;
  onGoHome: () => void;
  isDashboardOpen: boolean;
  isAuthorAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenBookmarks,
  bookmarksCount,
  onOpenGitHubSync,
  onOpenDashboard,
  onLockAuthor,
  onTriggerAuthorGate,
  onGoHome,
  isDashboardOpen,
  isAuthorAuthenticated,
}) => {
  // Easter egg: 5 quick clicks on the 'F' logo triggers the author gate
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 800) {
      const nextCount = clickCount + 1;
      if (nextCount >= 5) {
        setClickCount(0);
        onTriggerAuthorGate();
      } else {
        setClickCount(nextCount);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
    onGoHome();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo with discreet author trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogoClick}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="Filipe-Dev-Blog Home"
            title="Filipe-Dev-Blog"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-mono text-sm font-bold shadow-sm group-hover:scale-105 transition-transform select-none">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-base">
                  Filipe<span className="text-emerald-500 font-mono">.dev</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hidden sm:inline-block">
                  Blog
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Search trigger button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 text-sm text-zinc-500 dark:text-zinc-400 transition-all shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <span>Search articles, tags, concepts...</span>
            </span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Search articles"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Reading list / Bookmarks (Anonymous) */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Saved reading list (anonymous)"
            aria-label="Reading list"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarksCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* GitHub & Vercel Sync Modal Trigger */}
          <button
            onClick={onOpenGitHubSync}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-mono"
            title="GitHub Repository & Vercel Deployment"
          >
            <GitBranch className="w-4 h-4 text-emerald-500" />
            <span className="hidden lg:inline text-zinc-700 dark:text-zinc-300">GitHub / Vercel</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Author Mode Indicator & Controls: ONLY VISIBLE WHEN UNLOCKED */}
          {isAuthorAuthenticated && (
            <div className="flex items-center gap-1 pl-1 ml-1 border-l border-zinc-200 dark:border-zinc-800">
              <button
                onClick={onOpenDashboard}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isDashboardOpen
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Open Author Publishing Studio"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">Author Studio</span>
                <span className="sm:hidden">Studio</span>
              </button>
              
              <button
                onClick={onLockAuthor}
                className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Lock / Exit Author Mode"
                aria-label="Lock Author Mode"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
