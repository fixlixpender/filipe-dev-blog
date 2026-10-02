import React, { useState } from 'react';
import { Clock, Bookmark, Share2, Check, ArrowRight, Eye, Calendar } from 'lucide-react';
import { Post, ViewMode } from '../types';

interface ArticleCardProps {
  post: Post;
  viewMode: ViewMode;
  onSelect: (post: Post) => void;
  onSelectTag: (tag: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (postId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  viewMode,
  onSelect,
  onSelectTag,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href.split('?')[0] + `?post=${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(post.id);
  };

  if (viewMode === 'grid') {
    return (
      <article
        onClick={() => onSelect(post)}
        className="group relative flex flex-col bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-700 transition-all hover:shadow-md cursor-pointer"
      >
        {/* Cover Image if available */}
        {post.coverImage && (
          <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={post.coverImage}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-950/80 text-emerald-400 backdrop-blur-xs border border-zinc-800">
                {post.category}
              </span>
            </div>
            {post.featured && (
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500 text-white shadow-xs">
                  Featured
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {/* Meta bar */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2.5 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTimeMinutes} min read
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Card Footer: Tags & Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
              {post.tags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag(tag);
                  }}
                  className="text-[10px] font-mono text-zinc-500 hover:text-emerald-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors"
                >
                  #{tag}
                </button>
              ))}
              {post.tags.length > 2 && (
                <span className="text-[10px] font-mono text-zinc-400 self-center">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                  isBookmarked
                    ? 'text-emerald-500'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Copy article link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>
      </article>
    );
  }

  // Editorial List View (Minimalist & High-Performance)
  return (
    <article
      onClick={() => onSelect(post)}
      className="group relative p-5 sm:p-6 bg-white/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900/80 transition-all cursor-pointer shadow-2xs"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Top metadata */}
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-mono">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
              {post.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTimeMinutes} min read
            </span>
            {post.featured && (
              <>
                <span>•</span>
                <span className="text-[10px] uppercase font-bold text-amber-500">
                  ★ Featured
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight leading-snug mb-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(tag);
                }}
                className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-0.5 rounded transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>

        </div>

        {/* Right side actions */}
        <div className="flex md:flex-col items-center justify-between md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/60">
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                isBookmarked
                  ? 'text-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save to reading list'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-90 group-hover:translate-x-0.5 transition-transform">
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

        </div>

      </div>
    </article>
  );
};
