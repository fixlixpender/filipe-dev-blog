import { Post, ThemeMode } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

const POSTS_KEY = 'filipe_dev_blog_posts_v1';
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
      return JSON.parse(data);
    } catch {
      return INITIAL_POSTS;
    }
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
    return updated;
  },

  deletePost(id: string): Post[] {
    const posts = this.getPosts().filter((p) => p.id !== id);
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Error deleting post:', e);
    }
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
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.includes(postId);
    const updated = exists
      ? bookmarks.filter((id) => id !== postId)
      : [...bookmarks, postId];
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving bookmarks:', e);
    }
    return updated;
  },

  // Theme
  getTheme(): ThemeMode {
    try {
      const theme = localStorage.getItem(THEME_KEY) as ThemeMode;
      return theme === 'dark' ? 'dark' : 'light'; // default to light theme
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
