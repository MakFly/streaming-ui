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
    'Every way an AI response can arrive: 249 live streaming and agent patterns, 10 AI chat templates and 11 composers you can install with the shadcn CLI.',
};

export const RESPONSES: PageMeta = {
  path: '/responses',
  title: 'Streaming AI responses: 249 live patterns for React · Streaming UI',
  description:
    '249 live streaming, thinking and agent patterns in 14 collections. Watch each one play, then copy the prompt that rebuilds it.',
};

export const TEMPLATES: PageMeta = {
  path: '/templates',
  title: 'AI chat templates for React and shadcn · Streaming UI',
  description:
    'Ten chat apps built from the streaming components. Each one plays a real conversation, then answers what you type. Open one full screen, switch devices, or copy the prompt that rebuilds it.',
};

export const COMPOSERS: PageMeta = {
  path: '/components/composers',
  title: 'AI chat input components: 11 composers for React · Streaming UI',
  description:
    'Eleven chat composers behind one interface: pill, box, panel, dock, command, inline, voice, halo, media, palette and mention. Install any of them with the shadcn CLI.',
};

export const ORBS: PageMeta = {
  path: '/components/thinking-orbs',
  title: 'Thinking orbs: AI loading and thinking indicators · Streaming UI',
  description:
    'Dotted thought-orb loading indicators for AI agents: nine animated states (working, searching, solving, listening, connecting, weaving, composing, breathing, shaping) at three sizes, on a plain 2D canvas.',
};

export const MODEL_PICKER: PageMeta = {
  path: '/components/model-picker',
  title: 'Model picker: LLM model selector for React · Streaming UI',
  description:
    'A model picker for AI chat composers: 18 providers on a rail, search across every model, an effort slider and fast mode. Install it with the shadcn CLI or copy its prompt.',
};

export const PLAYGROUND: PageMeta = {
  path: '/playground',
  title: 'Playground · Streaming UI',
  description:
    'Combine every piece live: 11 composers, the model picker, thinking orbs, colour palettes, 249 streaming responses and 10 chat templates. Share the combination as a link and install it with the shadcn CLI.',
};

/** Collection pages. Slugs match engine/prompt.js slug(group). Names stay those of the credited source libraries
 * (THIRD_PARTY_NOTICES.md), so `topic` carries what people search for into the title. */
const LIBRARIES: { slug: string; name: string; topic: string; description: string }[] = [
  { slug: 'agent', name: 'Agent', topic: 'AI agent activity and progress UI', description: 'Agent thinking, progress, task lists, web search, cited answers, pipelines, live logs, diffs, handoffs and a context budget, playing live as the work happens.' },
  { slug: 'stream', name: 'Stream', topic: 'streaming replies and reasoning UI', description: 'Streaming replies, reasoning lines, tool results, citations, approvals and loaders.' },
  { slug: 'chat', name: 'Chat', topic: 'AI chat messages and thinking states', description: 'Streaming text, thinking states, tool chips, composers and approval cards.' },
  { slug: 'assist', name: 'Assist', topic: 'reasoning and tool call UI', description: 'Reasoning, tool calls, a worked summary and the chat workspace.' },
  { slug: 'motion', name: 'Motion', topic: 'animated text effects for AI replies', description: 'Text effects, shimmers, morphs, numbers and glow, each landing as part of a reply.' },
  { slug: 'dots', name: 'Dots', topic: 'dot matrix loaders and typing indicators', description: 'Dot-grid loaders used as thinking and typing indicators inside a reply.' },
  { slug: 'transitions', name: 'Transitions', topic: 'status and skeleton transitions', description: 'Status swaps, reveals, skeletons and shimmer as a reply arrives.' },
  { slug: 'tool-cards', name: 'Tool cards', topic: 'tool call and approval cards', description: 'Approval, plans, terminal, diffs, citations, charts and the other tool results.' },
  { slug: 'kit', name: 'Kit', topic: 'spinners, code blocks and status badges', description: 'Spinner, code block, snippet and status badges as an agent run advances.' },
  { slug: 'text', name: 'Text', topic: 'text reveal and shimmer effects', description: 'Blur reveals, shimmers, staggers, marquees and highlighted phrases.' },
  { slug: 'glow', name: 'Glow', topic: 'typewriter, terminal and glow effects', description: 'Typewriter, terminal, halo, pixel headings and a dynamic island.' },
  { slug: 'research', name: 'Research', topic: 'research traces and cited answers', description: 'Threads, scrollers, traces and cited research runs.' },
  { slug: 'blocks', name: 'Blocks', topic: 'chat bubbles and typing dots', description: 'Animated text, spinners, typing dots and chat bubbles.' },
  { slug: 'animated', name: 'Animated', topic: 'typing code and rolling numbers', description: 'Code being written, typing text, rolling numbers and highlights.' },
];

export const LIBRARY_PAGES: PageMeta[] = LIBRARIES.map((l) => ({
  path: `/responses/library/${l.slug}`,
  title: `${l.name}: ${l.topic} · Streaming UI`,
  description: l.description,
}));

/** Routes whose HTML head is written at build time. Demo pages stay client-rendered. */
export const COMPONENTS_INDEX: PageMeta = {
  path: '/components',
  title: 'AI chat UI components for React and shadcn · Streaming UI',
  description:
    'Every piece of an AI chat interface in one library: composers, the model picker, the agent limits card, the thread navigator and thinking orbs. React and Tailwind, installable with the shadcn CLI.',
};

export const THREAD_NAVIGATOR: PageMeta = {
  path: '/components/thread-navigator',
  title: 'Thread Navigator: chat minimap for long AI conversations · Streaming UI',
  description:
    'A rail of user turns for a long AI chat: the visible turn is marked, and a preview shows the request, the answer excerpt, references and a bookmark. Streaming does not move the reader.',
};

export const AGENT_FEED: PageMeta = {
  path: '/components/agent-feed',
  title: 'Agent Feed: live multi-agent activity UI · Streaming UI',
  description:
    'Show several AI agents working at once: searches, visited pages and their messages roll through a three-row window, then fold into Thought for Ns with the full log one click away. React and Tailwind.',
};

export const MARKDOWN: PageMeta = {
  path: '/components/markdown',
  title: 'Streaming Markdown renderer for AI chat answers · Streaming UI',
  description:
    'Render AI answers as they stream: headings, lists, highlighted code, tables, images and citation chips, parsed from whatever prefix has arrived. React and Tailwind.',
};

export const AGENT_LIMITS: PageMeta = {
  path: '/components/agent-limits-card',
  title: 'Agent Limits Card: context window and token usage UI · Streaming UI',
  description:
    'A context-window and plan-usage card for AI agents: a token bar split by bucket, an expandable breakdown, and 5-hour and weekly limits with reset times. Install it with the shadcn CLI.',
};

export const BLOUB: PageMeta = {
  path: '/components/bloub',
  title: 'Bloub: animated AI agent avatar in four characters · Streaming UI',
  description:
    'An SVG agent avatar that morphs through 14 states, in four characters (Bloub, Cat, Dog, Flower), 12 colours and 16 resting expressions. Its eyes follow the pointer. React, no animation library.',
};

export const COLLECTIONS: PageMeta = {
  path: '/collections',
  title: 'Collections · Streaming UI',
  description:
    '249 streaming, thinking and agent responses in 14 collections, each rendered in its own theme. Open one to browse its responses and copy their prompts.',
};

export const PROMPTS: PageMeta = {
  path: '/prompts',
  title: 'Rebuild prompts · Streaming UI',
  description:
    'Every response, template and component comes with a Markdown prompt an agent can follow to rebuild it 1:1: install command, source files, theme tokens and exact timings.',
};

export const STATIC_PAGES: PageMeta[] = [HOME, COMPONENTS_INDEX, AGENT_LIMITS, THREAD_NAVIGATOR, MARKDOWN, AGENT_FEED, BLOUB, COLLECTIONS, PROMPTS, RESPONSES, TEMPLATES, COMPOSERS, ORBS, MODEL_PICKER, PLAYGROUND, ...LIBRARY_PAGES];

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
