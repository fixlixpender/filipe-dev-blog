import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tag, ArrowRight, Clock, BookOpen, CornerDownLeft } from 'lucide-react';
import { Post } from '../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onSelectTag: (tag: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost,
  onSelectTag,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredPosts = posts.filter((post) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(q);
    const excerptMatch = post.excerpt.toLowerCase().includes(q);
    const tagMatch = post.tags.some((t) => t.toLowerCase().includes(q));
    const contentMatch = post.content.toLowerCase().includes(q);
    return titleMatch || excerptMatch || tagMatch || contentMatch;
  });

  // Extract all unique tags
  const popularTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredPosts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredPosts.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPosts[selectedIndex]) {
        onSelectPost(filteredPosts[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search articles by title, keywords, or topics..."
            className="w-full py-4 text-base bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 rounded ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {post.category}
                        </span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {post.readTimeMinutes} min
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
                        {post.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No articles matched "{query}"</p>
              <p className="text-xs mt-1 text-zinc-400">Try searching for TypeScript, Edge, Rust, or Architecture</p>
            </div>
          )}
        </div>

        {/* Quick Tag Recommendations */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-mono text-zinc-400 shrink-0">Tags:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onSelectTag(tag);
                  onClose();
                }}
                className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-200/60 dark:bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-500 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline text-[11px] font-mono text-zinc-400 shrink-0 pl-2">
            Use ↑↓ to navigate
          </span>
        </div>
      </div>
    </div>
  );
};
