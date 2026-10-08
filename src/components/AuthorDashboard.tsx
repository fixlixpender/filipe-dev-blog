import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  Eye, 
  CheckCircle, 
  Clock, 
  Tag, 
  GitBranch, 
  Download, 
  ArrowLeft, 
  Save, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw,
  FolderGit2,
  Code,
  Sparkles,
  BarChart3,
  Layers,
  ExternalLink,
  ShieldAlert,
  Lock,
  AlertCircle,
  X,
  Upload
} from 'lucide-react';
import { Post, GitHubRepoFile } from '../types';
import { generateSlug, calculateReadTime, renderMarkdown } from '../utils/markdown';
import { generateRepositoryFiles, postToMarkdownWithFrontmatter, downloadFile } from '../utils/exportGit';

interface AuthorDashboardProps {
  posts: Post[];
  onSavePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onClose: () => void;
  onResetDefaults: () => void;
  onLockAuthor: () => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  posts,
  onSavePost,
  onDeletePost,
  onClose,
  onResetDefaults,
  onLockAuthor,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'editor' | 'github' | 'analytics'>('articles');
  
  // Editor state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['TypeScript', 'Performance']);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [featured, setFeatured] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copiedCommit, setCopiedCommit] = useState(false);
  const [selectedRepoFile, setSelectedRepoFile] = useState<GitHubRepoFile | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'building' | 'deployed'>('idle');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Pre-fill editor when editing an existing post
  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setTags(post.tags);
    setCoverImage(post.coverImage || '');
    setStatus(post.status === 'archived' ? 'draft' : post.status);
    setFeatured(!!post.featured);
    setActiveTab('editor');
  };

  // Start fresh new post
  const handleStartNew = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setCategory('Engineering');
    setExcerpt('');
    setContent(`## Introduction\n\nWrite your thoughts here...\n\n\`\`\`typescript\n// Code snippet\nconst speed = "instant";\n\`\`\`\n\n### In-Depth Analysis\n\nMore details...`);
    setTags(['Next.js', 'Vercel']);
    setCoverImage('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80');
    setStatus('published');
    setFeatured(false);
    setActiveTab('editor');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveArticle = () => {
    if (!title.trim()) {
      setEditorError('Please enter an article title.');
      setTimeout(() => setEditorError(null), 3000);
      return;
    }

    const calculatedTime = calculateReadTime(content);
    const postPayload: Post = {
      id: editingPostId || `post-${Date.now()}`,
      slug: slug || generateSlug(title),
      title: title.trim(),
      excerpt: excerpt.trim() || content.substring(0, 140).replace(/[#*`_]/g, '') + '...',
      content: content.trim(),
      category: category.trim() || 'Engineering',
      tags: tags.length > 0 ? tags : ['General'],
      coverImage: coverImage.trim() || undefined,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: calculatedTime,
      status: status,
      featured: featured,
      views: editingPostId ? (posts.find((p) => p.id === editingPostId)?.views || 0) : 0,
      author: {
        name: 'Filipe Oliveira',
        role: 'Staff Systems & Frontend Architect',
        avatar: '/filipe-avatar.png?v=2',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
      },
    };

    onSavePost(postPayload);
    setActiveTab('articles');
  };

  const handleExportCurrentMarkdown = () => {
    const fakePost: Post = {
      id: editingPostId || 'temp',
      slug: slug || generateSlug(title) || 'untitled-post',
      title: title || 'Untitled Post',
      excerpt: excerpt,
      content: content,
      category,
      tags,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: calculateReadTime(content),
      status,
      views: 0,
      author: {
        name: 'Filipe Oliveira',
        role: 'Staff Systems & Frontend Architect',
        avatar: '/filipe-avatar.png?v=2',
      },
    };
    const md = postToMarkdownWithFrontmatter(fakePost);
    downloadFile(`${fakePost.slug}.md`, md);
  };

  // Quick markdown toolbar helper
  const insertMarkdown = (syntax: string) => {
    setContent((prev) => prev + '\n' + syntax + '\n');
  };

  // Repository files
  const repoFiles = generateRepositoryFiles(posts);
  const activeFile = selectedRepoFile || repoFiles[0];

  const handleSimulateDeploy = () => {
    setDeployStatus('building');
    setTimeout(() => {
      setDeployStatus('deployed');
      setTimeout(() => setDeployStatus('idle'), 4000);
    }, 2200);
  };

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Failed to upload avatar', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex flex-col justify-start">
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
        
        {/* Top Dashboard Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Return to Blog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <label className="relative group cursor-pointer" title="Click to upload/change your PNG avatar">
                <img
                  src="/filipe-avatar.png?v=2"
                  alt="Filipe Oliveira"
                  className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 bg-amber-50 dark:bg-zinc-800 shadow-2xs"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-3.5 h-3.5 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileSelected}
                />
              </label>
              <div>
                <span className="font-bold text-sm tracking-tight block">Filipe Oliveira</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block leading-none">
                  Author Studio
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'articles'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Articles ({posts.length})
            </button>
            <button
              onClick={() => {
                if (activeTab !== 'editor') handleStartNew();
              }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingPostId ? 'Edit Post' : 'New Article'}</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'github'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
              <span>Git & Vercel</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              View Blog
            </button>
            <button
              onClick={() => {
                onLockAuthor();
                onClose();
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
              title="Lock and exit author mode"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Session</span>
            </button>
          </div>
        </header>

        {/* TAB 1: ARTICLES MANAGER */}
        {activeTab === 'articles' && (
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Article Management</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Manage published articles and drafts. Readers view these anonymously without signing in.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition-colors"
                  title="Reset initial developer articles"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={handleStartNew}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft New Post</span>
                </button>
              </div>
            </div>

            {/* Posts Table / Cards */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {post.status}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          {post.category}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-xs font-mono text-zinc-500">
                          {post.publishedAt}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-xs font-mono text-zinc-500">
                          {post.readTimeMinutes} min read
                        </span>
                        {post.featured && (
                          <span className="text-[10px] text-amber-500 font-bold">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          const md = postToMarkdownWithFrontmatter(post);
                          downloadFile(`${post.slug}.md`, md);
                        }}
                        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Download Markdown file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(post)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete article"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* TAB 2: ARTICLE EDITOR & MARKDOWN STUDIO */}
        {activeTab === 'editor' && (
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
            
            {/* Editor Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {editingPostId ? 'Edit Article' : 'Draft New Article'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {calculateReadTime(content)} min read • {content.trim().split(/\s+/).length} words
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View switcher */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setPreviewMode('edit')}
                    className={`px-2.5 py-1 rounded ${previewMode === 'edit' ? 'bg-white dark:bg-zinc-900 shadow-2xs font-semibold' : 'text-zinc-500'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPreviewMode('split')}
                    className={`px-2.5 py-1 rounded hidden md:block ${previewMode === 'split' ? 'bg-white dark:bg-zinc-900 shadow-2xs font-semibold' : 'text-zinc-500'}`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`px-2.5 py-1 rounded ${previewMode === 'preview' ? 'bg-white dark:bg-zinc-900 shadow-2xs font-semibold' : 'text-zinc-500'}`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  onClick={handleExportCurrentMarkdown}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                  title="Export to Markdown with frontmatter"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export .md</span>
                </button>

                <button
                  onClick={handleSaveArticle}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{status === 'published' ? 'Publish Article' : 'Save Draft'}</span>
                </button>
              </div>
            </div>

            {/* Post Metadata Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              
              {/* Title & Slug */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Architecting Distributed Microservices in Rust"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                    Slug / URL Path
                  </label>
                  <div className="flex items-center px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-mono text-zinc-500">
                    <span>filipe-dev-blog/posts/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="post-slug"
                      className="flex-1 ml-1 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                    Excerpt / Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A concise synopsis of the article for cards and SEO..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category, Tags & Publish Status */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Systems">Systems</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Databases">Databases</option>
                      <option value="Performance">Performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none font-medium"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">
                    Tags (Press Enter to add)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="e.g. Next.js, Rust"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="featured-checkbox" className="text-xs font-medium cursor-pointer">
                    Feature on Blog Homepage
                  </label>
                </div>
              </div>

            </div>

            {/* Markdown Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => insertMarkdown('## Section Title')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('### Subsection')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('**bold text**')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*italic text*')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```typescript\n// code here\n```')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400"
              >
                &lt;code&gt;
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('> **Pro Tip**: Your callout message here.')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('| Feature | Metric | Status |\n| :--- | :--- | :--- |\n| TTFB | 12ms | Fast |')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- Bullet item 1\n- Bullet item 2')}
                className="px-2 py-1 bg-white dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                List
              </button>
            </div>

            {/* Split View Editor & Preview */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 border-x border-b border-zinc-200 dark:border-zinc-800 rounded-b-lg overflow-hidden min-h-[420px]">
              
              {/* Raw Markdown Editor */}
              {(previewMode === 'edit' || previewMode === 'split') && (
                <div className={`p-4 bg-white dark:bg-zinc-950 flex flex-col ${previewMode === 'split' ? 'border-r border-zinc-200 dark:border-zinc-800' : 'md:col-span-2'}`}>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write article in GitHub-flavored Markdown..."
                    className="w-full h-full min-h-[400px] resize-none font-mono text-xs leading-relaxed bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              )}

              {/* Live Preview Pane */}
              {(previewMode === 'preview' || previewMode === 'split') && (
                <div className={`p-6 bg-zinc-50/70 dark:bg-zinc-900/40 overflow-y-auto max-h-[600px] ${previewMode === 'preview' ? 'md:col-span-2' : ''}`}>
                  <div className="text-xs font-mono uppercase text-emerald-500 font-bold mb-3">
                    Live Static Preview
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                    {title || 'Article Title Preview'}
                  </h1>
                  <p className="text-sm text-zinc-500 mb-6 italic">
                    {excerpt || 'Article summary excerpt...'}
                  </p>
                  <div
                    className="prose-custom text-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                </div>
              )}

            </div>

          </main>
        )}

        {/* TAB 3: GITHUB REPO & VERCEL AUTOMATED WORKFLOW */}
        {activeTab === 'github' && (
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 flex-1">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-500" />
                <h1 className="text-2xl font-extrabold tracking-tight">
                  GitHub & Vercel Automated Deployment Pipeline
                </h1>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Filipe-Dev-Blog is engineered for static site generators (Next.js SSG). Articles are fully synced as Markdown with YAML frontmatter, ready to be committed to your GitHub repository and deployed to Vercel's global edge network.
              </p>
            </div>

            {/* Quick Actions & Deployment Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>Repository Branch</span>
                    <span className="text-emerald-500 font-bold">main (Clean)</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Git Push & Commit Helper
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Pushing to main automatically triggers the GitHub Action to build and deploy to Vercel.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const cmd = `git add content/posts/ && git commit -m "feat(blog): publish articles from author studio" && git push origin main`;
                    navigator.clipboard.writeText(cmd);
                    setCopiedCommit(true);
                    setTimeout(() => setCopiedCommit(false), 2000);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCommit ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCommit ? 'Copied Git Command!' : 'Copy Git Push Command'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>Vercel Edge</span>
                    <span className="text-emerald-500 font-bold">Production Ready</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Vercel Edge SSG Deployment
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Static generation pre-compiles all HTML at build time for sub-20ms edge latency.
                  </p>
                </div>

                <button
                  onClick={handleSimulateDeploy}
                  disabled={deployStatus === 'building'}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    deployStatus === 'building'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : deployStatus === 'deployed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${deployStatus === 'building' ? 'animate-spin' : ''}`} />
                  <span>
                    {deployStatus === 'building'
                      ? 'Building SSG Pages...'
                      : deployStatus === 'deployed'
                      ? 'Deployed to Global Edge!'
                      : 'Simulate Vercel Build'}
                  </span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span>Export Content</span>
                    <span>{posts.length} Posts</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Download Repository Bundle
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Download posts and workflow configs formatted for direct copy/paste into your git directory.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const bundle = JSON.stringify(repoFiles, null, 2);
                    downloadFile('filipe-dev-blog-repo-bundle.json', bundle, 'application/json');
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Git Manifest (.json)</span>
                </button>
              </div>

            </div>

            {/* Repository File Tree & File Viewer */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                
                {/* File Tree Left Sidebar */}
                <div className="md:col-span-4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 p-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Project File Structure</span>
                  </div>

                  <div className="space-y-1">
                    {repoFiles.map((file) => {
                      const isSelected = activeFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedRepoFile(file)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <span className="truncate">{file.path}</span>
                          <span className="text-[10px] text-zinc-400 ml-1 uppercase">
                            {file.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* File Viewer Right Side */}
                <div className="md:col-span-8 p-4 flex flex-col bg-zinc-950 text-zinc-200">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-300 font-semibold">{activeFile.path}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeFile.content);
                          alert(`Copied ${activeFile.path} content to clipboard!`);
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy File</span>
                      </button>
                      <button
                        onClick={() => downloadFile(activeFile.path.split('/').pop() || 'file.txt', activeFile.content)}
                        className="px-2 py-1 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 text-[11px] flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <pre className="flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300 p-2 bg-transparent">
                    <code>{activeFile.content}</code>
                  </pre>
                </div>

              </div>
            </div>

          </main>
        )}

        {/* TAB 4: METRICS & EDGE ANALYTICS */}
        {activeTab === 'analytics' && (
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 flex-1">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight">Performance & Edge Telemetry</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Real-time metrics demonstrating the high-performance benefits of static generation and anonymous reader access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                <div className="text-xs font-mono text-zinc-400 mb-1">Global p95 Latency</div>
                <div className="text-2xl font-black text-emerald-500 font-mono">14ms</div>
                <div className="text-[11px] text-zinc-500 mt-1">Sub-20ms worldwide on Vercel Edge</div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                <div className="text-xs font-mono text-zinc-400 mb-1">Cache Hit Ratio</div>
                <div className="text-2xl font-black text-blue-500 font-mono">98.8%</div>
                <div className="text-[11px] text-zinc-500 mt-1">Edge ISR & Static Pre-rendering</div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                <div className="text-xs font-mono text-zinc-400 mb-1">Total Readers</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {posts.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Anonymous Views (Zero Sign-In)</div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                <div className="text-xs font-mono text-zinc-400 mb-1">Active Articles</div>
                <div className="text-2xl font-black text-purple-500 font-mono">{posts.length}</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {posts.filter(p => p.status === 'published').length} published, {posts.filter(p => p.status === 'draft').length} drafts
                </div>
              </div>
            </div>

            {/* Popular Articles Breakdown */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 p-6">
              <h3 className="font-bold text-sm mb-4">Most Read Engineering Articles</h3>
              <div className="space-y-4">
                {posts
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((post, idx) => (
                    <div key={post.id} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3 truncate pr-4">
                        <span className="text-zinc-400 w-4 font-bold">#{idx + 1}</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{post.title}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-zinc-500">
                        <span>{post.views.toLocaleString()} views</span>
                        <span className="w-16 text-right text-emerald-500 font-semibold">{post.readTimeMinutes}m read</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </main>
        )}

        {/* In-App Delete Confirmation Modal */}
        {postToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setPostToDelete(null)}
          >
            <div
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Delete Article
                  </h3>
                  <p className="text-xs text-zinc-500">
                    This action permanently deletes this article.
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">"{postToDelete.title}"</strong>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const deletedTitle = postToDelete.title;
                    const idToDelete = postToDelete.id;
                    setPostToDelete(null);
                    onDeletePost(idToDelete);
                    setToastMessage(`Deleted "${deletedTitle}"`);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Article</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Reset Defaults Confirmation Modal */}
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowResetConfirm(false)}
          >
            <div
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Reset to Default Articles
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Restore the initial technical articles.
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                This will reset your article list back to the default 6 engineering articles. Any custom posts you created will be replaced.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetDefaults();
                    setToastMessage('Reset articles to default.');
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Confirm Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate max-w-xs">{toastMessage}</span>
          </div>
        )}

        {/* Editor Error Notification Alert */}
        {editorError && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{editorError}</span>
          </div>
        )}

      </div>
    </div>
  );
};
