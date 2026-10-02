import { Post, ThemeMode } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

const POSTS_KEY = 'filipe_dev_blog_posts_v2';
const BOOKMARKS_KEY = 'filipe_dev_blog_bookmarks';
const THEME_KEY = 'filipe_dev_blog_theme_v2';
const AUTHOR_SESSION_KEY = 'filipe_dev_blog_author_session_v2';
const AUTHOR_PASSKEY_KEY = 'filipe_dev_blog_author_passkey';
const DEFAULT_PASSKEYS = ['filipe2026', 'filipe'];

export const storageService = {
  getPosts(): Post[] {
    try {
      const data = localStorage.getItem(POSTS_KEY);
      if (!data) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
        return INITIAL_POSTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  },

  async fetchPostsFromServer(): Promise<Post[]> {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          localStorage.setItem(POSTS_KEY, JSON.stringify(data.posts));
          return data.posts;
        }
      }
    } catch (e) {
      console.warn('API /api/posts unreachable, falling back to local cache:', e);
    }
    return this.getPosts();
  },

  getPostBySlug(slug: string): Post | undefined {
    const posts = this.getPosts();
    return posts.find((p) => p.slug === slug);
  },

  savePost(post: Post): Post[] {
    const posts = this.getPosts();
    const existingIndex = posts.findIndex((p) => p.id === post.id);

    let updated: Post[];
    if (existingIndex >= 0) {
      updated = [...posts];
      updated[existingIndex] = {
        ...post,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    } else {
      updated = [
        {
          ...post,
          id: post.id || `post-${Date.now()}`,
          publishedAt: post.publishedAt || new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          views: post.views || 0,
        },
        ...posts,
      ];
    }

    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving post to localStorage:', e);
    }

    // Persist to Server in background
    const targetPost = existingIndex >= 0 ? updated[existingIndex] : updated[0];
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetPost),
    }).catch((err) => console.error('Error saving post to backend:', err));

    return updated;
  },

  deletePost(id: string): Post[] {
    const posts = this.getPosts().filter((p) => p.id !== id);
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Error deleting post:', e);
    }

    // Persist deletion to Server in background
    fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting post on backend:', err));

    return posts;
  },

  incrementView(id: string): void {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === id);
    if (target) {
      target.views = (target.views || 0) + 1;
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      } catch (e) {
        console.error('Error incrementing view count:', e);
      }
    }
  },

  resetDefaults(): Post[] {
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
    } catch (e) {
      console.error('Error resetting defaults:', e);
    }

    // Persist reset to server
    fetch('/api/posts/reset', { method: 'POST' }).catch((err) =>
      console.error('Error resetting posts on backend:', err)
    );

    return INITIAL_POSTS;
  },

  // Bookmarks (Anonymous, client-side only)
  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(postId: string): string[] {
    const current = this.getBookmarks();
    const exists = current.includes(postId);
    const updated = exists ? current.filter((id) => id !== postId) : [...current, postId];
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating bookmarks:', e);
    }
    return updated;
  },

  // Theme Management
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      return 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  },

  // Author dashboard access (No user accounts or sign-up needed)
  verifyPasskey(entered: string): boolean {
    const trimmed = entered.trim();
    if (!trimmed) return false;
    const customKey = localStorage.getItem(AUTHOR_PASSKEY_KEY);
    if (customKey && trimmed === customKey) return true;
    return DEFAULT_PASSKEYS.includes(trimmed.toLowerCase());
  },

  setCustomPasskey(newPasskey: string): void {
    try {
      localStorage.setItem(AUTHOR_PASSKEY_KEY, newPasskey.trim());
    } catch (e) {
      console.error('Error saving custom passkey:', e);
    }
  },

  isAuthorAuthenticated(): boolean {
    try {
      return (
        sessionStorage.getItem(AUTHOR_SESSION_KEY) === 'true' ||
        localStorage.getItem(AUTHOR_SESSION_KEY) === 'true'
      );
    } catch {
      return false;
    }
  },

  setAuthorAuthenticated(value: boolean, rememberOnBrowser = false): void {
    try {
      if (value) {
        sessionStorage.setItem(AUTHOR_SESSION_KEY, 'true');
        if (rememberOnBrowser) {
          localStorage.setItem(AUTHOR_SESSION_KEY, 'true');
        }
      } else {
        sessionStorage.removeItem(AUTHOR_SESSION_KEY);
        localStorage.removeItem(AUTHOR_SESSION_KEY);
      }
    } catch (e) {
      console.error('Error saving author state:', e);
    }
  },

  logoutAuthor(): void {
    try {
      sessionStorage.removeItem(AUTHOR_SESSION_KEY);
      localStorage.removeItem(AUTHOR_SESSION_KEY);
    } catch (e) {
      console.error('Error logging out author:', e);
    }
  },
};
