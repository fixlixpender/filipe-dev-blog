import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'posts.json');

// Helper to get stored posts
function getStoredPosts(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading posts.json:', err);
  }
  return [];
}

// Helper to write stored posts
function saveStoredPosts(posts: any[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving posts.json:', err);
    return false;
  }
}

// API Routes
app.get('/api/posts', (_req, res) => {
  const posts = getStoredPosts();
  res.json({ posts });
});

app.post('/api/posts', (req, res) => {
  const post = req.body;
  if (!post || !post.id || !post.title) {
    return res.status(400).json({ error: 'Invalid post object' });
  }

  const posts = getStoredPosts();
  const existingIdx = posts.findIndex((p: any) => p.id === post.id);
  if (existingIdx >= 0) {
    posts[existingIdx] = post;
  } else {
    posts.unshift(post);
  }

  saveStoredPosts(posts);
  res.json({ success: true, posts });
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  const posts = getStoredPosts();
  const filtered = posts.filter((p: any) => p.id !== id);
  saveStoredPosts(filtered);
  res.json({ success: true, posts: filtered });
});

app.post('/api/posts/sync', (req, res) => {
  const { posts } = req.body;
  if (Array.isArray(posts)) {
    saveStoredPosts(posts);
    return res.json({ success: true, posts });
  }
  res.status(400).json({ error: 'Expected an array of posts' });
});

app.post('/api/posts/reset', (_req, res) => {
  const defaultPosts = [
    {
      id: "post-test-1",
      slug: "test-article",
      title: "Test Article",
      excerpt: "This is a test article to verify publishing, real-time persistence, and edge synchronization across all devices.",
      content: "## Test Article\n\nThis article confirms that your publishing workflow is now fully synchronized with the persistent backend server.\n\n### Key Highlights\n- **Persistent Storage**: Changes are stored server-side and survive deployments, device changes, and anonymous browsing.\n- **Zero-Login for Readers**: Visitors can browse anonymously with zero auth hurdles.\n- **Author Publishing**: The Author Studio (?admin=true or Ctrl+Shift+A) persists updates directly to the server.\n\nYou can edit or delete this article anytime from your Author Studio.",
      category: "Testing",
      tags: ["Test", "Publishing", "Sync"],
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: 1,
      status: "published",
      featured: true,
      views: 42,
      author: {
        name: "Filipe Oliveira",
        role: "Staff Systems & Frontend Architect",
        avatar: "/filipe-avatar.jpg?v=4",
        github: "https://github.com",
        twitter: "https://twitter.com"
      }
    }
  ];
  saveStoredPosts(defaultPosts);
  res.json({ success: true, posts: defaultPosts });
});

// Serve permanent profile picture with strict cache busting
app.get(['/filipe-avatar.jpg', '/avatar.jpg', '/filipe.jpg', '/filipe-avatar.png', '/avatar.png', '/filipe.png'], (req, res) => {
  const jpgPath = path.join(__dirname, 'public', 'filipe-avatar.jpg');
  const pngPath = path.join(__dirname, 'public', 'filipe-avatar.png');
  const targetPath = fs.existsSync(jpgPath) ? jpgPath : pngPath;
  
  if (fs.existsSync(targetPath)) {
    const isJpg = targetPath.endsWith('.jpg') || req.path.endsWith('.jpg');
    res.setHeader('Content-Type', isJpg ? 'image/jpeg' : 'image/jpeg');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(targetPath);
  }
  res.status(404).end();
});

// Endpoint to upload new avatar image directly from Author Studio or Article page
app.post('/api/upload-avatar', express.json({ limit: '15mb' }), (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl || !dataUrl.includes('base64,')) {
    return res.status(400).json({ error: 'Invalid image data' });
  }
  try {
    const base64Data = dataUrl.split('base64,')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join(__dirname, 'public', 'filipe-avatar.jpg'), buffer);
    fs.writeFileSync(path.join(__dirname, 'public', 'avatar.jpg'), buffer);
    fs.writeFileSync(path.join(__dirname, 'public', 'filipe-avatar.png'), buffer);
    fs.writeFileSync(path.join(__dirname, 'public', 'filipe.png'), buffer);
    fs.writeFileSync(path.join(__dirname, 'public', 'avatar.png'), buffer);

    // Also update existing posts with new avatar timestamp
    const posts = getStoredPosts();
    const updatedPosts = posts.map(p => ({
      ...p,
      author: {
        ...p.author,
        name: 'Filipe Oliveira',
        avatar: `/filipe-avatar.jpg?v=${Date.now()}`
      }
    }));
    saveStoredPosts(updatedPosts);

    return res.json({ success: true, url: `/filipe-avatar.jpg?v=${Date.now()}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write avatar' });
  }
});

// Vite Middleware (Dev) vs Static Files (Prod)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
