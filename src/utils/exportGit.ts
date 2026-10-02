import { Post, GitHubRepoFile } from '../types';

export function postToMarkdownWithFrontmatter(post: Post): string {
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${post.publishedAt}"
updated: "${post.updatedAt}"
slug: "${post.slug}"
category: "${post.category}"
tags: [${post.tags.map((t) => `"${t}"`).join(', ')}]
readTime: ${post.readTimeMinutes}
featured: ${!!post.featured}
author:
  name: "${post.author.name}"
  role: "${post.author.role}"
---

${post.content}
`;
  return frontmatter;
}

export function generateRepositoryFiles(posts: Post[]): GitHubRepoFile[] {
  const files: GitHubRepoFile[] = [];

  // 1. Markdown posts with frontmatter
  posts.forEach((post) => {
    files.push({
      path: `content/posts/${post.slug}.md`,
      content: postToMarkdownWithFrontmatter(post),
      type: 'markdown',
    });
  });

  // 2. Vercel deployment configuration
  files.push({
    path: 'vercel.json',
    content: JSON.stringify(
      {
        $schema: 'https://openapi.vercel.sh/vercel.json',
        framework: 'nextjs',
        buildCommand: 'next build',
        cleanUrls: true,
        headers: [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
              },
            ],
          },
          {
            source: '/static/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ],
      },
      null,
      2
    ),
    type: 'config',
  });

  // 3. GitHub Actions automated deployment workflow
  files.push({
    path: '.github/workflows/deploy.yml',
    content: `name: Deploy Filipe-Dev-Blog to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts (SSG)
        run: vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel Edge
        run: vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}
`,
    type: 'workflow',
  });

  // 4. package.json for Next.js SSG
  files.push({
    path: 'package.json',
    content: JSON.stringify(
      {
        name: 'filipe-dev-blog',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^15.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'gray-matter': '^4.0.3',
          marked: '^15.0.0',
          'lucide-react': '^0.546.0',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^5.8.0',
        },
      },
      null,
      2
    ),
    type: 'json',
  });

  // 5. README.md with version control & deployment guide
  files.push({
    path: 'README.md',
    content: `# Filipe-Dev-Blog

A high-performance minimalist developer blog built for static generation and zero-latency global delivery on Vercel.

## 🚀 Quick Start

\`\`\`bash
# 1. Clone repository
git clone https://github.com/filipe/filipe-dev-blog.git
cd filipe-dev-blog

# 2. Install dependencies
npm install

# 3. Run local development server
npm run dev
\`\`\`

## 📝 Publishing New Articles

Create a new \`.md\` file inside \`content/posts/\` with YAML frontmatter:

\`\`\`markdown
---
title: "My New System Architecture"
date: "2026-10-02"
slug: "my-new-system-architecture"
tags: ["Architecture", "Rust"]
category: "Engineering"
---

Your markdown content here...
\`\`\`

Pushing to \`main\` triggers the automated GitHub Action workflow, generating static HTML pages and deploying to Vercel's global edge network in ~20 seconds.
`,
    type: 'markdown',
  });

  return files;
}

export function downloadFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
