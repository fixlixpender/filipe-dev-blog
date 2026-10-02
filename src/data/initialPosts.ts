import { Post } from '../types';

export const INITIAL_POSTS: Post[] = [
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
    featured: true,
    views: 1420,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
When building distributed web applications, network hops to a single centralized origin server often dominate total time-to-first-byte (TTFB). By shifting API execution to Vercel's global Edge network and leveraging modern Next.js route handlers, we can achieve sub-20ms response times worldwide.

## The Edge Runtime Advantage

Traditional Node.js serverless functions incur a cold-start penalty ranging between 150ms to 400ms due to heavy container boot cycles and V8 isolate instantiations. In contrast, the Vercel Edge Runtime runs on lightweight V8 isolates with negligible (<5ms) cold starts.

\`\`\`typescript
// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = 'auto'; // Routes to the geographically closest node

interface TelemetryPayload {
  metric: string;
  value: number;
  timestamp: number;
}

export async function POST(req: NextRequest) {
  const start = performance.now();
  const body = (await req.json()) as TelemetryPayload;

  // Process distributed edge pipeline
  const geo = req.geo || { city: 'Unknown', country: 'Global' };
  
  return NextResponse.json({
    status: 'recorded',
    edgeNode: process.env.VERCEL_REGION || 'iad1',
    clientRegion: geo.country,
    latencyMs: Number((performance.now() - start).toFixed(2)),
  }, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    }
  });
}
\`\`\`

### Key Performance Principles

1. **Keep Payloads Compact**: Avoid importing monolithic libraries on the edge. Prefer native Web APIs like \`fetch\`, \`crypto.subtle\`, and \`TransformStream\`.
2. **Geographic Proximity**: Deploy read replicas or use Edge Config to minimize distance to state.
3. **HTTP/3 & Brotli**: Automatically served through Vercel's multi-region edge mesh.

> **Pro Tip**: Use \`stale-while-revalidate\` headers generously. When an edge cache hit occurs, your visitor experiences instantaneous static delivery while background revalidation warms up fresh data.

## Benchmarking Edge vs. Node Serverless

Here is how our micro-benchmark fared across 10,000 requests globally:

| Architecture | Cold Start (p95) | Warm TTFB (Global) | Memory Footprint |
| :--- | :--- | :--- | :--- |
| Node.js 20 Serverless | ~280ms | 115ms | ~85MB |
| **Vercel Edge Runtime** | **< 6ms** | **18ms** | **~12MB** |

By adopting Edge runtime patterns, we decoupled backend computation from geographical boundaries, drastically improving mobile user experience on constrained networks.
    `.trim()
  },
  {
    id: 'post-2',
    slug: 'advanced-typescript-patterns-const-type-parameters',
    title: 'Advanced TypeScript Patterns: Type-Level Programming with Const Type Parameters',
    excerpt: 'Unlocking strict type narrowing, immutable record inference, and zero-runtime type assertions in modern TypeScript engineering.',
    publishedAt: '2026-09-20',
    updatedAt: '2026-09-21',
    category: 'Engineering',
    tags: ['TypeScript', 'Best Practices', 'Software Design'],
    readTimeMinutes: 8,
    status: 'published',
    featured: true,
    views: 2890,
    coverImage: 'https://images.unsplash.com/photo-1516116211227-bbc155255479?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
TypeScript's type system is famously Turing complete, but in day-to-day engineering, our primary goal is ergonomics and defect prevention. Modern features like \`const\` type parameters radically simplify how we enforce immutability and literal inference.

## The Problem with Object Literal Widening

Historically, whenever you passed an object literal or tuple into a generic function, TypeScript eagerly widened literal types into broad primitives:

\`\`\`typescript
// Prior to const type parameters
declare function registerRoutes<T extends Record<string, string>>(routes: T): T;

const appRoutes = registerRoutes({
  home: '/',
  blog: '/posts/:id',
});

// Type of appRoutes.home is 'string', NOT literal '/'!
\`\`\`

Developers routinely resorted to \`as const\` at the call site. Not only was this repetitive, but if a junior teammate forgot \`as const\`, safety dissolved.

## The Solution: \`const\` Type Modifiers

With \`const\` type parameters directly in generic declarations, literal narrowing happens automatically:

\`\`\`typescript
// Modern approach
function defineRouterConfig<const TRoutes extends readonly { path: string; method: 'GET' | 'POST' }[]>(
  routes: TRoutes
) {
  return {
    routes,
    hasRoute<TPath extends TRoutes[number]['path']>(path: TPath): boolean {
      return routes.some(r => r.path === path);
    }
  };
}

const router = defineRouterConfig([
  { path: '/api/v1/health', method: 'GET' },
  { path: '/api/v1/publish', method: 'POST' },
]);

// TypeScript strictly infers:
// TRoutes = readonly [{ readonly path: "/api/v1/health", readonly method: "GET" }, ...]
router.hasRoute('/api/v1/health'); // Valid
// router.hasRoute('/api/v1/unknown'); // Compile-time Type Error!
\`\`\`

## Building a Compile-Time State Machine

We can extend this to enforce zero-runtime-cost transition invariants:

\`\`\`typescript
type State = 'idle' | 'loading' | 'success' | 'failure';

type TransitionTable = {
  [K in State]: readonly State[];
};

const validTransitions = {
  idle: ['loading'],
  loading: ['success', 'failure'],
  success: ['idle'],
  failure: ['idle', 'loading'],
} as const satisfies TransitionTable;

type CanTransition<From extends State, To extends State> = 
  To extends (typeof validTransitions)[From][number] ? true : false;

// Verifies transitions at build time:
type Valid = CanTransition<'loading', 'success'>; // true
type Invalid = CanTransition<'idle', 'success'>;   // false
\`\`\`

Embracing these declarative patterns keeps your domain core rock solid while providing seamless autocompletion for every developer on your team.
    `.trim()
  },
  {
    id: 'post-3',
    slug: 'rust-vs-nodejs-high-throughput-microservices-real-world',
    title: 'Rust vs. Node.js for High-Throughput Microservices: A Real-World Benchmark',
    excerpt: 'We migrated our critical WebSocket ingestion gateway from Node.js to Axum in Rust. Here are the exact CPU, memory, and p99 latency trade-offs.',
    publishedAt: '2026-09-12',
    updatedAt: '2026-09-14',
    category: 'Systems',
    tags: ['Rust', 'Node.js', 'Performance', 'Systems', 'Backend'],
    readTimeMinutes: 10,
    status: 'published',
    featured: false,
    views: 3120,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
Microservice benchmarks found online are frequently synthetic 'Hello World' echo servers that fail to reflect production reality. Last quarter, we systematically tested our real-world packet ingestion service under both Node.js (Fastify + libuv) and Rust (Axum + Tokio).

## The Ingestion Workload

The service receives continuous telemetry batches:
- Cryptographic signature verification using Ed25519
- JSON deserialization and schema validation
- In-memory ring buffer aggregation
- Asynchronous fan-out over Redis streams

\`\`\`rust
// src/handlers/telemetry.rs (Rust Axum)
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize, Serialize)]
pub struct Packet {
    pub device_id: String,
    pub timestamp_epoch_ms: u64,
    pub payload_hash: String,
}

pub async fn handle_batch(
    State(app_state): State<Arc<AppState>>,
    Json(packets): Json<Vec<Packet>>,
) -> impl IntoResponse {
    let count = packets.len();
    if count == 0 {
        return StatusCode::BAD_REQUEST.into_response();
    }

    // Zero-copy processing via Tokio task pool
    tokio::spawn(async move {
        app_state.ingest_packets(packets).await;
    });

    (StatusCode::ACCEPTED, format!("Batch of {} queued", count)).into_response()
}
\`\`\`

## Memory Allocation & Garbage Collection Stalls

Under Node.js, v8's generational garbage collector regularly triggered scavenges and major GC pauses when handling 35,000 requests per second. Even with tuned \`--max-semi-space-size=128\`, p99 latency spiked up to 84ms during heap compaction.

Under Rust with Jemalloc:
- **GC pauses**: Completely eliminated (0ms).
- **RSS Memory**: Stabilized at 42MB vs. Node.js's 490MB.
- **p99 Latency**: Held stable at 3.4ms under peak synthetic load.

### When should you stick with Node.js?

Despite Rust's sheer performance dominance, Node.js remains king of rapid development velocity, rich npm ecosystem integration, and trivial hiring loops. Reserve Rust for CPU-bound hot paths, cryptographic pipelines, and persistent connection multiplexers.
    `.trim()
  },
  {
    id: 'post-4',
    slug: 'mastering-css-subgrid-and-container-queries-production',
    title: 'Mastering CSS Subgrid and Container Queries in Production',
    excerpt: 'Building truly fluid editorial card layouts that adapt to their container context rather than clumsy global viewport breakpoints.',
    publishedAt: '2026-09-05',
    updatedAt: '2026-09-06',
    category: 'Frontend',
    tags: ['CSS', 'Web-Dev', 'Frontend', 'Design'],
    readTimeMinutes: 5,
    status: 'published',
    featured: false,
    views: 1840,
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
For years, frontend engineers relied on media queries keyed to window widths. But a component placed in a 300px sidebar needs the exact same layout as a component placed on a 300px mobile screen. Container queries finally solved this architectural mismatch.

## Defining Container Contexts

\`\`\`css
/* Define container on parent */
.post-feed {
  container-type: inline-size;
  container-name: post-feed;
}

/* Query against container dimensions */
@container post-feed (min-width: 640px) {
  .post-card {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
    align-items: center;
  }
}
\`\`\`

## Aligning Card Footers with CSS Subgrid

A persistent complaint with responsive card grids was misaligned action buttons when titles varied in length. With \`grid-template-rows: subgrid\`, sibling elements inherit the parent's rhythm seamlessly:

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: auto auto 1fr auto;
  gap: 2rem;
}

.card-item {
  grid-row: span 4;
  display: grid;
  grid-template-rows: subgrid;
}
\`\`\`

No fragile JavaScript heights calculations, no extra flex spacers. Modern CSS primitives empower responsive systems that load instantly and perform at 120 FPS.
    `.trim()
  },
  {
    id: 'post-5',
    slug: 'postgresql-indexing-strategies-btree-gist-brin-under-pressure',
    title: 'PostgreSQL Indexing Strategies: B-Tree, GiST, and BRIN Under Pressure',
    excerpt: 'Selecting the right index structure for high-volume time-series, full-text search, and multi-tenant telemetry datasets.',
    publishedAt: '2026-08-22',
    updatedAt: '2026-08-25',
    category: 'Databases',
    tags: ['Databases', 'Architecture', 'Performance', 'Backend'],
    readTimeMinutes: 7,
    status: 'published',
    featured: false,
    views: 2210,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
Every senior backend engineer knows the feeling: your application is humming along until a table hits 20 million rows, and sequential scans bring production CPU utilization to 100%. Choosing the right index type is the highest-leverage optimization you can make.

## 1. B-Tree: The Battle-Tested Standard

Best for high-cardinality equality and range lookups. However, multi-column indexes require strict attention to column ordering:

\`\`\`sql
-- Optimal for: WHERE organization_id = 'org_1' AND created_at > NOW() - INTERVAL '7 days'
CREATE INDEX idx_audit_org_created ON audit_logs (organization_id, created_at DESC);
\`\`\`

## 2. BRIN (Block Range Index): The Secret Weapon for Big Data

If your table is naturally ordered on disk by append time (e.g. log streams, financial ticks, IoT events), a regular B-Tree index can consume hundreds of megabytes or gigabytes of RAM.

\`\`\`sql
-- BRIN index stores only minimum and maximum values per 128 disk pages
CREATE INDEX idx_metrics_timestamp_brin 
ON system_metrics 
USING BRIN (recorded_at) 
WITH (pages_per_range = 128);
\`\`\`

### Size Comparison on 50 Million Records:
- **B-Tree**: ~1.1 GB in RAM
- **BRIN**: ~64 KB (Over 99.9% memory savings!)

Use GiST for geospatial / range overlaps, GIN for full-text search and JSONB arrays, and BRIN for naturally correlated append-only logs.
    `.trim()
  },
  {
    id: 'post-6',
    slug: 'optimizing-core-web-vitals-how-we-cut-lcp-68-percent',
    title: 'Optimizing Core Web Vitals: How We Cut LCP by 68% on Modern Static Sites',
    excerpt: 'Practical front-end performance auditing: font preloading, critical CSS, modern image formats, and eliminating client-side layout thrashing.',
    publishedAt: '2026-08-10',
    updatedAt: '2026-08-11',
    category: 'Performance',
    tags: ['Performance', 'Web-Dev', 'Next.js', 'Frontend'],
    readTimeMinutes: 5,
    status: 'published',
    featured: false,
    views: 1650,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Filipe Silva',
      role: 'Staff Systems & Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    content: `
Largest Contentful Paint (LCP) directly dictates whether a visitor perceives your developer blog or product documentation as blazing fast or sluggish. By methodically profiling the waterfall, we reduced LCP from 2.4s to 0.72s.

## The 4 Pillars of Instant LCP

1. **Preconnect to Critical Origins**:
\`\`\`html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
\`\`\`

2. **Fetch Priority on Hero Images**:
\`\`\`html
<img src="/hero.webp" fetchpriority="high" loading="eager" alt="Architecture Diagram" />
\`\`\`

3. **Font Display Swap with Fallback Metric Overrides**:
Eliminates layout shifts (CLS) while web fonts stream in.

4. **Zero Layout Thrashing**:
Never read \`element.offsetHeight\` immediately before modifying inline styles. Group reads before writes using \`requestAnimationFrame\`.

Achieving sub-second performance is not magic—it's systematic hygiene in your build pipeline.
    `.trim()
  }
];
