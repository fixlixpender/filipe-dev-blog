import { Post } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-test-1',
    slug: 'test-article',
    title: 'Test Article',
    excerpt: 'This is a test article to verify publishing, real-time persistence, and edge synchronization across all devices.',
    publishedAt: '2026-10-02',
    updatedAt: '2026-10-02',
    category: 'Testing',
    tags: ['Test', 'Publishing', 'Sync'],
    readTimeMinutes: 1,
    status: 'published',
    featured: true,
    views: 42,
    author: {
      name: 'Filipe Oliveira',
      role: 'Staff Systems & Frontend Architect',
      avatar: '/filipe-avatar.png?v=2',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
    content: `## Test Article

This article confirms that your publishing workflow is now fully synchronized with the persistent backend server.

### Key Highlights
- **Persistent Storage**: Changes are stored server-side and survive deployments, device changes, and anonymous browsing.
- **Zero-Login for Readers**: Visitors can browse anonymously with zero auth hurdles.
- **Author Publishing**: The Author Studio (\`?admin=true\` or \`Ctrl+Shift+A\`) persists updates directly to the server.

You can edit or delete this article anytime from your Author Studio.`
  },
  {
    id: 'post-1',
    slug: 'architecting-zero-latency-edge-apis-vercel-nextjs',
    title: 'Architecting Zero-Latency Edge APIs with Next.js and Vercel Edge Runtime',
    excerpt: 'How to bypass traditional server bottlenecks by orchestrating distributed Edge functions, geographic key-value caching, and streaming responses.',
    publishedAt: '2026-09-28',
    updatedAt: '2026-09-29',
    category: 'Architecture',
    tags: ['Next.js', 'Vercel', 'Edge Compute', 'Performance', 'TypeScript'],
    readTimeMinutes: 6,
    status: 'published',
    featured: false,
    views: 1420,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Oliveira',
      role: 'Staff Systems & Frontend Architect',
      avatar: '/filipe-avatar.png?v=2',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `When building distributed web applications, network hops to a single centralized origin server often dominate total time-to-first-byte (TTFB). By shifting API execution to Vercel's global Edge network and leveraging modern Next.js route handlers, we can achieve sub-20ms response times worldwide.

## The Edge Runtime Advantage

Traditional Node.js serverless functions incur a cold-start penalty ranging between 150ms to 400ms due to heavy container boot cycles and V8 isolate instantiations. In contrast, the Vercel Edge Runtime runs on lightweight V8 isolates with negligible (<5ms) cold starts.

\`\`\`typescript
// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = 'auto';

interface TelemetryPayload {
  metric: string;
  value: number;
  timestamp: number;
}

export async function POST(req: NextRequest) {
  const start = performance.now();
  const body = (await req.json()) as TelemetryPayload;

  return NextResponse.json({
    status: 'recorded',
    edgeNode: process.env.VERCEL_REGION || 'iad1',
    latencyMs: Number((performance.now() - start).toFixed(2)),
  });
}
\`\`\`

## Global Geographic Routing

Routing requests based on IP geolocation allows compute to occur closest to where the client is physically located. Combined with streaming Server-Sent Events or chunked transfer encoding, perceived speed approaches zero.`
  }
];
