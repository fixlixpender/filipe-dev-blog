import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, 
  Search, 
  Bookmark, 
  Sparkles, 
  ArrowRight, 
  Rss, 
  GitBranch, 
  SlidersHorizontal,
  Flame,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { Post, ThemeMode, ViewMode, FilterState } from './types';
import { storageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { TagFilter } from './components/TagFilter';
import { SearchBar } from './components/SearchBar';
import { BookmarksModal } from './components/BookmarksModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { AuthorDashboard } from './components/AuthorDashboard';
import { AuthorGateModal } from './components/AuthorGateModal';

export default function App() {
  // Main data state
  const [posts, setPosts] = useState<Post[]>(() => storageService.getPosts());
  const [bookmarks, setBookmarks] = useState<string[]>(() => storageService.getBookmarks());
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());
  
  // Navigation & View state
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('editorial');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Author Authentication & Gate (Option 5: Hybrid Approach)
  const [isAuthorAuthenticated, setIsAuthorAuthenticated] = useState<boolean>(() => storageService.isAuthorAuthenticated());
  const [isAuthorGateOpen, setIsAuthorGateOpen] = useState(false);

  // Filters
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedTag: null,
    selectedCategory: null,
    sortBy: 'latest',
  });

  // Apply Theme to Document Element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    storageService.setTheme(theme);
  }, [theme]);

  // URL Query Sync for shareable article links and secret author parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check for secret author URL parameters (?admin=true, ?author=true, ?manage=true)
    const hasAdminParam = params.get('admin') === 'true' || params.get('author') === 'true' || params.get('manage') === 'true';
    if (hasAdminParam) {
      if (storageService.isAuthorAuthenticated()) {
        setIsDashboardOpen(true);
      } else {
        setIsAuthorGateOpen(true);
      }
      // Clean up URL parameter quietly so it doesn't linger in browser bar
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('admin');
      cleanUrl.searchParams.delete('author');
      cleanUrl.searchParams.delete('manage');
      window.history.replaceState({}, '', cleanUrl.toString());
    }

    const postSlug = params.get('post');
    if (postSlug) {
      const matched = storageService.getPostBySlug(postSlug);
      if (matched) {
        setCurrentPost(matched);
      }
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const slug = currentParams.get('post');
      if (slug) {
        const found = storageService.getPostBySlug(slug);
        setCurrentPost(found || null);
      } else {
        setCurrentPost(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcuts
  // - Cmd+K or '/' -> Quick Search
  // - Ctrl+Shift+A or Cmd+Shift+A -> Author Studio / Passkey Gate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Author Trigger: Ctrl+Shift+A or Cmd+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (storageService.isAuthorAuthenticated()) {
          setIsDashboardOpen((prev) => !prev);
        } else {
          setIsAuthorGateOpen(true);
        }
        return;
      }

      // Search: Cmd+K / Ctrl+K or '/'
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectPost = (post: Post) => {
    setCurrentPost(post);
    storageService.incrementView(post.id);
    // Update URL query without full page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('post', post.slug);
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleBackToHome = () => {
    setCurrentPost(null);
    setIsDashboardOpen(false);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('post');
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleToggleBookmark = (postId: string) => {
    const updated = storageService.toggleBookmark(postId);
    setBookmarks(updated);
  };

  const handleClearBookmarks = () => {
    localStorage.removeItem('filipe_dev_blog_bookmarks');
    setBookmarks([]);
  };

  // Author Studio Trigger & Lock Handlers (Option 5: Hybrid Approach)
  const handleTriggerAuthor = () => {
    if (storageService.isAuthorAuthenticated()) {
      setIsDashboardOpen(true);
    } else {
      setIsAuthorGateOpen(true);
    }
  };

  const handleAuthorUnlockSuccess = () => {
    setIsAuthorAuthenticated(true);
    setIsDashboardOpen(true);
  };

  const handleLockAuthor = () => {
    storageService.logoutAuthor();
    setIsAuthorAuthenticated(false);
    setIsDashboardOpen(false);
  };

  // Author dashboard CRUD handlers
  const handleSavePost = (savedPost: Post) => {
    const updated = storageService.savePost(savedPost);
    setPosts(updated);
    if (currentPost?.id === savedPost.id) {
      setCurrentPost(savedPost);
    }
  };

  const handleDeletePost = (id: string) => {
    const updated = storageService.deletePost(id);
    setPosts(updated);
    if (currentPost?.id === id) {
      handleBackToHome();
    }
  };

  const handleResetDefaults = () => {
    const reset = storageService.resetDefaults();
    setPosts(reset);
  };

  // Derived filter calculations
  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return Array.from(cats);
  }, [posts]);

  const tagsWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Status filter: in anonymous viewing mode, show published posts (or all if drafted by author)
        if (post.status !== 'published') return false;

        // Tag filter
        if (filterState.selectedTag && !post.tags.includes(filterState.selectedTag)) {
          return false;
        }

        // Category filter
        if (filterState.selectedCategory && post.category !== filterState.selectedCategory) {
          return false;
        }

        // Search query filter
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchExcerpt = post.excerpt.toLowerCase().includes(q);
          const matchTag = post.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchExcerpt && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'popular') {
          return b.views - a.views;
        }
        if (filterState.sortBy === 'readTime') {
          return a.readTimeMinutes - b.readTimeMinutes;
        }
        // Default latest
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [posts, filterState]);

  // Featured post
  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured && p.status === 'published') || posts[0];
  }, [posts]);

  // Related posts for current article
  const relatedPosts = useMemo(() => {
    if (!currentPost) return [];
    return posts
      .filter(
        (p) =>
          p.id !== currentPost.id &&
          p.status === 'published' &&
          p.tags.some((t) => currentPost.tags.includes(t))
      )
      .slice(0, 3);
  }, [posts, currentPost]);

  const bookmarkedPosts = useMemo(() => {
    return posts.filter((p) => bookmarks.includes(p.id));
  }, [posts, bookmarks]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarks.length}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onLockAuthor={handleLockAuthor}
        onTriggerAuthorGate={handleTriggerAuthor}
        onGoHome={handleBackToHome}
        isDashboardOpen={isDashboardOpen}
        isAuthorAuthenticated={isAuthorAuthenticated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {currentPost ? (
          /* Single Article Detail Reading Mode */
          <ArticleDetail
            post={currentPost}
            onBack={handleBackToHome}
            onSelectTag={(tag) => {
              handleBackToHome();
              setFilterState((prev) => ({ ...prev, selectedTag: tag }));
            }}
            onSelectRelatedPost={handleSelectPost}
            relatedPosts={relatedPosts}
            isBookmarked={bookmarks.includes(currentPost.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          /* Blog Feed View */
          <div>
            
            {/* Minimalist Hero Section */}
            <section className="py-8 sm:py-12 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Edge-Compiled SSG • Vercel Global Anycast</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                    Filipe-Dev-Blog
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    Deep dives into modern systems architecture, TypeScript type-level metaprogramming, Rust microservices, and extreme web performance. Written for anonymous readers with zero sign-in friction.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Anonymous Reading
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Static Generation
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <GitBranch className="w-4 h-4 text-blue-500" />
                      GitHub Synced
                    </span>
                  </div>
                </div>

                {/* Author Fast Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Quick Search</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded">
                      ⌘K
                    </kbd>
                  </button>

                  <button
                    onClick={() => setIsGitHubSyncOpen(true)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Git Workflow</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Featured Post Spotlight Banner (when no tag filter active) */}
            {!filterState.selectedTag && !filterState.selectedCategory && featuredPost && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Featured Engineering Dispatch</span>
                </div>

                <div
                  onClick={() => handleSelectPost(featuredPost)}
                  className="group relative p-6 sm:p-8 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white via-zinc-50/50 to-emerald-500/5 dark:from-zinc-900 dark:via-zinc-900/60 dark:to-emerald-950/20 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {featuredPost.category}
                        </span>
                        <span>•</span>
                        <span>{featuredPost.publishedAt}</span>
                        <span>•</span>
                        <span>{featuredPost.readTimeMinutes} min read</span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {featuredPost.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <span>Read Featured Post</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tag & Category Filter Bar */}
            <TagFilter
              tagsWithCounts={tagsWithCounts}
              selectedTag={filterState.selectedTag}
              onSelectTag={(tag) => setFilterState((prev) => ({ ...prev, selectedTag: tag }))}
              selectedCategory={filterState.selectedCategory}
              onSelectCategory={(cat) => setFilterState((prev) => ({ ...prev, selectedCategory: cat }))}
              categories={categories}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              sortBy={filterState.sortBy}
              onChangeSortBy={(sort) => setFilterState((prev) => ({ ...prev, sortBy: sort }))}
              totalPostsCount={posts.filter((p) => p.status === 'published').length}
            />

            {/* Articles List / Grid */}
            {filteredPosts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    viewMode={viewMode}
                    onSelect={handleSelectPost}
                    onSelectTag={(tag) => setFilterState((prev) => ({ ...prev, selectedTag: tag }))}
                    isBookmarked={bookmarks.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <BookOpen className="w-10 h-10 mx-auto text-zinc-400 mb-3 opacity-50" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  No articles found
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  No articles matched your current filters. Try resetting the tag or category filter.
                </p>
                <button
                  onClick={() =>
                    setFilterState({
                      searchQuery: '',
                      selectedTag: null,
                      selectedCategory: null,
                      sortBy: 'latest',
                    })
                  }
                  className="mt-4 px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        onTriggerAuthorGate={handleTriggerAuthor}
        onSelectTag={(tag) => {
          handleBackToHome();
          setFilterState((prev) => ({ ...prev, selectedTag: tag }));
        }}
        totalPosts={posts.filter((p) => p.status === 'published').length}
        isAuthorAuthenticated={isAuthorAuthenticated}
      />

      {/* Instant Search Bar Modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts.filter((p) => p.status === 'published')}
        onSelectPost={handleSelectPost}
        onSelectTag={(tag) => {
          setFilterState((prev) => ({ ...prev, selectedTag: tag }));
          handleBackToHome();
        }}
      />

      {/* Anonymous Reading List / Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedPosts={bookmarkedPosts}
        onSelectPost={handleSelectPost}
        onRemoveBookmark={handleToggleBookmark}
        onClearAll={handleClearBookmarks}
      />

      {/* GitHub Repository & Vercel Automated Deployment Modal */}
      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
        posts={posts}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Author Custom Publishing Dashboard (Restricted) */}
      {isDashboardOpen && (
        <AuthorDashboard
          posts={posts}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          onClose={() => setIsDashboardOpen(false)}
          onResetDefaults={handleResetDefaults}
          onLockAuthor={handleLockAuthor}
        />
      )}

      {/* Author Gate / Passkey Verification Modal (Option 5) */}
      <AuthorGateModal
        isOpen={isAuthorGateOpen}
        onClose={() => setIsAuthorGateOpen(false)}
        onSuccess={handleAuthorUnlockSuccess}
      />

    </div>
  );
}
