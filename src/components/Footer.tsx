import React, { useState } from 'react';
import { 
  GitBranch, 
  Cpu, 
  Terminal, 
  Rss, 
  Shield, 
  Layers, 
  Zap,
  Lock
} from 'lucide-react';

interface FooterProps {
  onOpenGitHubSync: () => void;
  onTriggerAuthorGate: () => void;
  onSelectTag: (tag: string) => void;
  totalPosts: number;
  isAuthorAuthenticated: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenGitHubSync,
  onTriggerAuthorGate,
  onSelectTag,
  totalPosts,
  isAuthorAuthenticated,
}) => {
  // Discreet triple-click trigger on copyright
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleCopyrightClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 700) {
      const nextCount = clickCount + 1;
      if (nextCount >= 3) {
        setClickCount(0);
        onTriggerAuthorGate();
      } else {
        setClickCount(nextCount);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  return (
    <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-sm">
                Filipe-Dev-Blog
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Edge Live
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              A minimalist, high-velocity engineering journal focused on distributed systems, modern TypeScript, Rust microservices, and web performance architecture.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                Modern SSG Architecture
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                Global Edge Network
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                100% Anonymous Viewing
              </span>
            </div>
          </div>

          {/* Quick Topics */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3 font-mono">
              Core Topics
            </h4>
            <ul className="space-y-2">
              {['TypeScript', 'Systems', 'Next.js', 'Rust', 'Performance'].map((tag) => (
                <li key={tag}>
                  <button
                    onClick={() => onSelectTag(tag)}
                    className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between w-full text-left"
                  >
                    <span>#{tag}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Workflows */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs uppercase tracking-wider mb-3 font-mono">
              Engineering Specs
            </h4>
            <ul className="space-y-2">
              <li>
                <div className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Distributed Edge Compute</span>
                </div>
              </li>
              <li>
                <div className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Zero-Runtime Bundle Optimization</span>
                </div>
              </li>
              <li>
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Rss className="w-3.5 h-3.5 text-amber-500" />
                  <span>RSS / Atom Feed Syndication</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with secret discreet click target on copyright */}
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-[11px] select-none">
            <span
              onClick={handleCopyrightClick}
              className="cursor-default hover:text-zinc-600 dark:hover:text-zinc-400"
              title="Filipe-Dev-Blog"
            >
              ©
            </span>{' '}
            {new Date().getFullYear()} Filipe-Dev-Blog. Open engineering knowledge for anonymous readers.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>Articles: <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{totalPosts}</strong></span>
            <span>•</span>
            <span className="text-emerald-500">Fast Static Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
