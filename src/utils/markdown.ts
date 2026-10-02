import { marked } from 'marked';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function extractTableOfContents(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1];
    const text = match[2].trim().replace(/\*\*|__|\*|_/g, ''); // strip inline bold/italic
    const id = generateSlug(text);
    items.push({
      id,
      text,
      level: hashes.length,
    });
  }

  return items;
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  try {
    const rawHtml = marked.parse(markdown) as string;
    
    // Add IDs to h2, h3, h4 tags for scroll spy
    return rawHtml.replace(/<h([2-4])>(.*?)<\/h\1>/gi, (match, level, text) => {
      const plainText = text.replace(/<[^>]+>/g, '').trim();
      const slug = generateSlug(plainText);
      return `<h${level} id="${slug}" class="scroll-mt-24 group flex items-center justify-between">${text}<a href="#${slug}" class="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-emerald-500 ml-2 transition-opacity text-sm">#</a></h${level}>`;
    });
  } catch (err) {
    console.error('Markdown parse error:', err);
    return `<p>${markdown}</p>`;
  }
}
