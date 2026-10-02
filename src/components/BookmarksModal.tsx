import React from 'react';
import { X, Bookmark, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { Post } from '../types';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedPosts: Post[];
  onSelectPost: (post: Post) => void;
  onRemoveBookmark: (postId: string) => void;
  onClearAll: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarkedPosts,
  onSelectPost,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-500 fill-current" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Saved Reading List
            </h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {bookmarkedPosts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bookmarkedPosts.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-zinc-400 hover:text-rose-500 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => (
              <div
                key={post.id}
                className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group cursor-pointer"
                onClick={() => {
                  onSelectPost(post);
                  onClose();
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {post.readTimeMinutes} min
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(post.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded transition-colors"
                    title="Remove from reading list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-zinc-600 dark:text-zinc-300 text-sm">No saved articles</p>
              <p className="mt-1">
                Click the bookmark icon on any article to save it here for offline or later reading. No sign-in required!
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
          <span>Anonymous client-side storage</span>
          <span className="text-emerald-500">100% Privacy</span>
        </div>
      </div>
    </div>
  );
};
