import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark, 
  Check, 
  Tag, 
  Twitter, 
  Linkedin, 
  Copy, 
  ChevronRight,
  Eye,
  Type,
  Upload
} from 'lucide-react';
import { Post } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { AuthorAvatar } from './AuthorAvatar';

interface ArticleDetailProps {
  post: Post;
  onBack: () => void;
  onSelectTag: (tag: string) => void;
  onSelectRelatedPost: (post: Post) => void;
  relatedPosts: Post[];
  isBookmarked: boolean;
  onToggleBookmark: (postId: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  post,
  onBack,
  onSelectTag,
  onSelectRelatedPost,
  relatedPosts,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const contentRef = useRef<HTMLDivElement>(null);

  const htmlContent = renderMarkdown(post.content);

  // Reading progress
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollRatio = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, scrollRatio)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.id]);

  // Code block copy buttons
  useEffect(() => {
    if (!contentRef.current) return;
    const preBlocks = contentRef.current.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return; // already injected

      const wrapper = document.createElement('div');
      wrapper.className = 'relative group/code';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement('button');
      btn.className =
        'copy-code-btn absolute top-3 right-3 p-1.5 rounded bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-700/60 opacity-0 group-hover/code:opacity-100 transition-opacity text-xs flex items-center gap-1 shadow-sm';
      btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Copy</span>`;

      btn.addEventListener('click', () => {
        const codeText = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(codeText);
        btn.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-emerald-400">Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Copy</span>`;
        }, 2000);
      });

      wrapper.appendChild(btn);
    });
  }, [htmlContent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Reading "${post.title}" on Filipe-Dev-Blog:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedin = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xl: 'text-xl',
  }[fontSize];

  return (
    <div className="relative pb-24">
      {/* Reading Progress Indicator */}
      <div
        className="fixed top-16 left-0 h-1 bg-emerald-500 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between py-6 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Articles</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white dark:bg-zinc-700 shadow-2xs font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
              title="Normal text size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-white dark:bg-zinc-700 shadow-2xs font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
              title="Larger text size"
            >
              A+
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(post.id)}
            className={`p-2 rounded-lg border transition-colors ${
              isBookmarked
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Main Article Content */}
        <div>
          
          {/* Header Metadata */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                {post.category}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                Published {post.publishedAt}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
              <span className="text-zinc-400">•</span>
              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Eye className="w-3.5 h-3.5" />
                {post.views} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed border-l-2 border-emerald-500 pl-4 py-0.5">
              {post.excerpt}
            </p>

            {/* Author Profile Card */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <AuthorAvatar
                  src="/filipe-avatar.jpg?v=4"
                  name={post.author.name}
                  size="md"
                />
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {post.author.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {post.author.role}
                  </p>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShareTwitter}
                  className="p-2 text-zinc-400 hover:text-sky-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Share on X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShareLinkedin}
                  className="p-2 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Cover Image if available */}
          {post.coverImage && (
            <div className="mb-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Article Prose Content */}
          <div
            ref={contentRef}
            className={`prose-custom ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags Footer */}
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              Tagged in:
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className="px-3 py-1 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Related Articles
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Based on common tags
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedPosts.map((related) => (
              <div
                key={related.id}
                onClick={() => onSelectRelatedPost(related)}
                className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                  <span>{related.category}</span>
                  <span>•</span>
                  <span>{related.readTimeMinutes} min</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors line-clamp-2 mb-1">
                  {related.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {related.excerpt}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
