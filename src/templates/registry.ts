import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/* The chat templates: metadata for the gallery and a lazy component for the live preview. */

export interface TemplateMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  /** "What's included" on the template page. */
  features: { title: string; text: string }[];
  /** Messages worth sending to see the template react. */
  tryIt: string[];
  /** Source file under src/templates/, used by the rebuild prompt. */
  file: string;
  Component: LazyExoticComponent<ComponentType>;
}

export const templates: TemplateMeta[] = [
  {
    slug: 'assistant',
    name: 'Assistant',
    tagline: 'General-purpose chat with history',
    description: 'Sidebar history, model picker, reasoning that folds away once done, a streamed markdown answer with code, then follow-up suggestions.',
    tags: ['Reasoning', 'Markdown', 'Code'],
    features: [{"title":"History sidebar","text":"Grouped by day, with search and a drawer on phones."},{"title":"Reasoning that folds away","text":"Steps stream while it thinks, then collapse to \"Thought for Ns\"."},{"title":"Streamed markdown","text":"Headings, lists, inline code and code blocks render as tokens arrive."},{"title":"Stop and follow-ups","text":"Send turns into Stop while busy; suggestions appear when it is done."}],
    tryIt: ["Explain React Server Components","Write a haiku about latency"],
    file: 'assistant.tsx',
    Component: lazy(() => import('./assistant')),
  },
  {
    slug: 'research',
    name: 'Research',
    tagline: 'Answer engine with cited sources',
    description: 'The query becomes the page title, search steps run with live result counts, sources land as cards, then a cited answer streams with related questions.',
    tags: ['Web search', 'Citations', 'Sources'],
    features: [{"title":"Live search steps","text":"Each query spins, then reports how many results it found."},{"title":"Source cards","text":"Sources land one by one and are numbered for citations."},{"title":"Cited answer","text":"Citation chips sit inline in the streamed answer."},{"title":"Related questions","text":"One click asks the next question in the same thread."}],
    tryIt: ["Is SSE better than WebSockets for chat?","How long should a thinking indicator last?"],
    file: 'research.tsx',
    Component: lazy(() => import('./research')),
  },
  {
    slug: 'coding-agent',
    name: 'Coding Agent',
    tagline: 'Plan, edit files, run the tests',
    description: 'The agent keeps a live plan, searches and reads files, streams each edit as a diff in the side panel and runs the test suite in a terminal.',
    tags: ['Tool calls', 'Diff', 'Terminal'],
    features: [{"title":"Live plan","text":"A checklist that ticks itself off as the agent works."},{"title":"Tool calls","text":"Search, Read and Run rows with status, meta and streamed output."},{"title":"Diff panel","text":"Every edit streams into a side panel, one tab per file."},{"title":"Terminal and PR","text":"Test output in a real terminal; Create PR unlocks when done."}],
    tryIt: ["Also set color-scheme on the root","Add a keyboard shortcut for the toggle"],
    file: 'coding-agent.tsx',
    Component: lazy(() => import('./coding-agent')),
  },
  {
    slug: 'support-copilot',
    name: 'Support Copilot',
    tagline: 'Help desk with an AI copilot',
    description: 'An inbox and a customer thread; the copilot reads the ticket, checks billing and the help center, then drafts a reply you can insert and send.',
    tags: ['Inbox', 'Draft reply', 'Side panel'],
    features: [{"title":"Inbox","text":"Tickets with priority, unread state and previews."},{"title":"Copilot panel","text":"Reads the ticket, checks billing and the help center, then summarises."},{"title":"Draft reply","text":"Streams a reply you can insert, shorten, edit and send."},{"title":"Closed loop","text":"Send it and the customer answers in the thread."}],
    tryIt: ["Make it shorter and friendlier","Does she have other open tickets?"],
    file: 'support-copilot.tsx',
    Component: lazy(() => import('./support-copilot')),
  },
  {
    slug: 'data-analyst',
    name: 'Data Analyst',
    tagline: 'Ask your data, get SQL and charts',
    description: 'Questions turn into streamed SQL; the query runs, a result table fills row by row, a bar chart grows and the takeaways stream in.',
    tags: ['SQL', 'Table', 'Chart'],
    features: [{"title":"Dataset panel","text":"Tables and typed columns next to the chat."},{"title":"Streamed SQL","text":"The query is written live, then runs with timing and row count."},{"title":"Result table and chart","text":"Rows fill in one by one and the bars grow into place."},{"title":"Takeaways","text":"A short written read of the numbers, then follow-up ideas."}],
    tryIt: ["Break it down by plan","Which region is growing fastest?"],
    file: 'data-analyst.tsx',
    Component: lazy(() => import('./data-analyst')),
  },
  {
    slug: 'agent-builder',
    name: 'Agent Builder',
    tagline: 'Build an agent from A to Z',
    description: 'Describe an agent and it drafts itself: identity, instructions, a full toolset of MCP servers, skills and built-ins you switch on tool by tool, knowledge, then deploy. A playground runs it against the live config.',
    tags: ['MCP', 'Skills', 'Builder'],
    features: [{"title":"Generate with AI","text":"One sentence fills every step, field by field, as if streamed."},{"title":"Full toolset","text":"MCP servers with per-tool switches and Ask / Auto approval, skills and built-ins."},{"title":"Live playground","text":"Switch a tool off and the agent really cannot call it."},{"title":"Review and deploy","text":"A checklist, deploy targets, and a live endpoint when it ships."}],
    tryIt: ["Triage the latest Sentry error","What tools can you use?"],
    file: 'agent-builder.tsx',
    Component: lazy(() => import('./agent-builder')),
  },
  {
    slug: 'canvas',
    name: 'Canvas',
    tagline: 'Chat beside a living document',
    description: 'A draft streams into a document artifact next to the chat; every change you ask for becomes a new version you can step back through, with a floating edit toolbar.',
    tags: ['Artifacts', 'Versions', 'Editor'],
    features: [{"title":"Artifact panel","text":"The document streams into its own panel, with word count and save state."},{"title":"Versions","text":"Each edit is a new version; step back and forth, then return to the latest."},{"title":"Edit toolbar","text":"Shorten, polish or add emoji from a floating button on the document."},{"title":"Artifact card","text":"The chat keeps a compact card of the document that opens it on phones."}],
    tryIt: ["Make it shorter","Add emoji to the headings"],
    file: 'canvas.tsx',
    Component: lazy(() => import('./canvas')),
  },
  {
    slug: 'deep-research',
    name: 'Deep Research',
    tagline: 'Parallel browser agents, cited report',
    description: 'The question is split across four browser agents that read the web in parallel, each with its live page and progress; then a long cited report streams with a table of contents.',
    tags: ['Multi-agent', 'Browsing', 'Report'],
    features: [{"title":"Parallel agents","text":"Four browser lanes advance at their own pace with live URLs and counts."},{"title":"Run stats","text":"Sources kept, pages read, agents and elapsed time at a glance."},{"title":"Report with contents","text":"Sections light up in the contents as the report reaches them."},{"title":"Export","text":"PDF and share actions with the cited sources stacked in the footer."}],
    tryIt: ["State of small modular reactors in 2026","Market for heat pumps in Europe"],
    file: 'deep-research.tsx',
    Component: lazy(() => import('./deep-research')),
  },
  {
    slug: 'agent-approvals',
    name: 'Agent Approvals',
    tagline: 'Human in the loop for risky actions',
    description: 'An on-call agent reads metrics on its own but pauses before changing production: approve and it rolls back, deny and it backs off. A run log and permissions sit beside it.',
    tags: ['Human-in-the-loop', 'Tools', 'Timeline'],
    features: [{"title":"Real pause","text":"The agent stops at the approval card until you decide."},{"title":"Approve or deny","text":"Approve runs the command and verifies; deny makes it suggest another way."},{"title":"Inline charts","text":"Error-rate sparklines before and after the fix."},{"title":"Run log","text":"Every tool call and decision on a timeline, next to the permissions."}],
    tryIt: ["Scale the payment workers instead","Check checkout again"],
    file: 'agent-approvals.tsx',
    Component: lazy(() => import('./agent-approvals')),
  },
  {
    slug: 'model-compare',
    name: 'Model Compare',
    tagline: 'One prompt, models side by side',
    description: 'Send one prompt to several models and watch them stream in parallel, each with its time to first token, speed and cost; pick the better answer to mark a winner.',
    tags: ['Multi-model', 'Metrics', 'Voting'],
    features: [{"title":"Pick the models","text":"Toggle models in the header; the next prompt goes to every selected one."},{"title":"Parallel streams","text":"Each column starts at its own first token and streams at its own speed."},{"title":"Live metrics","text":"TTFT, tokens per second and cost, with the best of each highlighted."},{"title":"Vote","text":"Prefer an answer and the others step back."}],
    tryIt: ["Explain CRDTs in two sentences","Write a regex for ISO dates"],
    file: 'model-compare.tsx',
    Component: lazy(() => import('./model-compare')),
  },
];

const bySlug = new Map(templates.map((t) => [t.slug, t]));
export const getTemplate = (slug: string | undefined) => (slug ? bySlug.get(slug) : undefined);
