/** Public origin. Social cards and the sitemap point here, not at the dev server. */
export const SITE = 'https://streaming-ui.pulseview.app';

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  robots?: string;
}

export const HOME: PageMeta = {
  path: '/',
  title: 'Streaming UI: every way an AI response can arrive',
  description:
    'Every way an AI response can arrive: 227 live streaming and agent patterns, 10 AI chat templates and 11 composers you can install with the shadcn CLI.',
};

export const RESPONSES: PageMeta = {
  path: '/responses',
  title: 'Streaming responses · Streaming UI',
  description:
    '227 live streaming, thinking and agent patterns in 14 collections. Watch each one play, then copy the prompt that rebuilds it.',
};

export const TEMPLATES: PageMeta = {
  path: '/templates',
  title: 'AI chat templates · Streaming UI',
  description:
    'Ten chat apps built from the streaming components. Each one plays a real conversation, then answers what you type. Open one full screen, switch devices, or copy the prompt that rebuilds it.',
};

export const COMPOSERS: PageMeta = {
  path: '/composers',
  title: 'Composers · Streaming UI',
  description:
    'Eleven chat composers behind one interface: pill, box, panel, dock, command, inline, voice, halo, media, palette and mention. Install any of them with the shadcn CLI.',
};

export const ORBS: PageMeta = {
  path: '/orbs',
  title: 'Thinking orbs · Streaming UI',
  description:
    'Dotted thought-orb loading indicators for AI agents: nine animated states (working, searching, solving, listening, connecting, weaving, composing, breathing, shaping) at three sizes, on a plain 2D canvas.',
};

/** Collection pages. Slugs match engine/prompt.js slug(group). */
const LIBRARIES: { slug: string; name: string; description: string }[] = [
  { slug: 'agent', name: 'Agent', description: 'Agent thinking, a composer loader, progress, task lists and web search, playing live as the work happens.' },
  { slug: 'stream', name: 'Stream', description: 'Streaming replies, reasoning lines, tool results, citations, approvals and loaders.' },
  { slug: 'chat', name: 'Chat', description: 'Streaming text, thinking states, tool chips, composers and approval cards.' },
  { slug: 'assist', name: 'Assist', description: 'Reasoning, tool calls, a worked summary and the chat workspace.' },
  { slug: 'motion', name: 'Motion', description: 'Text effects, shimmers, morphs, numbers and glow, each landing as part of a reply.' },
  { slug: 'dots', name: 'Dots', description: 'Dot-grid loaders used as thinking and typing indicators inside a reply.' },
  { slug: 'transitions', name: 'Transitions', description: 'Status swaps, reveals, skeletons and shimmer as a reply arrives.' },
  { slug: 'tool-cards', name: 'Tool cards', description: 'Approval, plans, terminal, diffs, citations, charts and the other tool results.' },
  { slug: 'kit', name: 'Kit', description: 'Spinner, code block, snippet and status badges as an agent run advances.' },
  { slug: 'text', name: 'Text', description: 'Blur reveals, shimmers, staggers, marquees and highlighted phrases.' },
  { slug: 'glow', name: 'Glow', description: 'Typewriter, terminal, halo, pixel headings and a dynamic island.' },
  { slug: 'research', name: 'Research', description: 'Threads, scrollers, traces and cited research runs.' },
  { slug: 'blocks', name: 'Blocks', description: 'Animated text, spinners, typing dots and chat bubbles.' },
  { slug: 'animated', name: 'Animated', description: 'Code being written, typing text, rolling numbers and highlights.' },
];

export const LIBRARY_PAGES: PageMeta[] = LIBRARIES.map((l) => ({
  path: `/responses/library/${l.slug}`,
  title: `${l.name} · Streaming UI`,
  description: l.description,
}));

/** Routes whose HTML head is written at build time. Demo pages stay client-rendered. */
export const STATIC_PAGES: PageMeta[] = [HOME, RESPONSES, TEMPLATES, COMPOSERS, ORBS, ...LIBRARY_PAGES];

export const clip = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > 80 ? cut.slice(0, space) : cut).trimEnd()}...`;
};

/** Prompt dialogs are a second URL for a page that already exists. */
export const isPromptPath = (pathname: string) => /\/prompt(\/|$)/.test(pathname);

const abs = (path: string) => `${SITE}${path === '/' ? '/' : path}`;

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/** Keep <title>, description, canonical, Open Graph and Twitter aligned with the route. */
export function applyHead(meta: PageMeta) {
  const description = clip(meta.description);
  const url = abs(meta.path);
  document.title = meta.title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', meta.robots ?? 'index, follow');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', description);
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}
