export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  views: number;
  author: {
    name: string;
    role: string;
    avatar: string;
    github?: string;
    twitter?: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ViewMode = 'editorial' | 'grid' | 'compact';

export interface FilterState {
  searchQuery: string;
  selectedTag: string | null;
  selectedCategory: string | null;
  sortBy: 'latest' | 'popular' | 'readTime';
}

export interface GitHubRepoFile {
  path: string;
  content: string;
  type: 'markdown' | 'config' | 'workflow' | 'json';
}
