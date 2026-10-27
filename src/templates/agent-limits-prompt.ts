/* Rebuild prompt for the Agent Limits Card (/components/agent-limits-card → Prompt): what it is, the one-line install
 * from this site's registry, then every source file it needs verbatim. Raw files load only when the prompt is opened. */

const SOURCES = import.meta.glob(['./kit/agent-limits.tsx', './kit/icon.tsx'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const UTILS = import.meta.glob('../lib/utils.ts', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

const FILES = ['agent-limits.tsx', 'icon.tsx'];

const fence = (code: string, lang: string) => {
  const n = Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((m) => m[0].length + 1));
  const f = '`'.repeat(n);
  return `${f}${lang}\n${code.replace(/\s+$/, '')}\n${f}`;
};

export async function buildAgentLimitsPrompt() {
  const sources = await Promise.all(FILES.map(async (f) => ({ path: `src/components/composer/${f}`, code: await SOURCES[`./kit/${f}`]() })));
  const utils = await UTILS['../lib/utils.ts']();
  const registry = `${window.location.origin}/r/agent-limits-card.json`;

  const L: string[] = [];
  L.push('# Recreate the Agent Limits Card', '');
  L.push(
    "An agent's budget at a glance: the context window as one bar split by token bucket (messages, tools, skills, memory…) with used / max and a percentage, then the plan's usage limits (5-hour and weekly) with reset times. Clicking the context row expands the per-bucket breakdown, free space, deferred buckets and collapsible member lists. A 16px context ring opens the same card in a popover above a composer.",
    '',
  );
  L.push('Rebuild it **identically** (markup, classes, spacing, timings) in React 19 + TypeScript + Tailwind CSS v4. Do not redesign, simplify or rename anything.', '');
  L.push('## Fastest path', '');
  L.push('The same files are published as a shadcn registry item. In a project that already has shadcn set up:', '');
  L.push(fence(`npx shadcn@latest add ${registry}`, 'bash'), '');
  L.push('Then import the tokens once in the global CSS, after Tailwind: `@import "./styles/streaming-ui.css";`. The rest of this prompt is the same thing by hand.', '');
  L.push('## Stack', '');
  L.push(
    '- `react`, `react-dom` 19, `radix-ui` (Popover for the context ring), `tailwindcss` v4, `tw-animate-css`.',
    '- `clsx` + `tailwind-merge` for `cn()` (below).',
    "- Streaming UI design tokens (`theme.css`, `typography.css`, `globals.css` from `src/styles/`, or the registry's `streaming-ui.css`) define every semantic utility used here (`bg-background-secondary-default`, `bg-chart-track`, `--color-chart-1…8`, `bg-dropdown-background`…). Dark mode is a `.dark` class on `<html>`.",
    '- Path alias `@/` → `src/`.',
    '',
  );
  L.push('## Usage', '');
  L.push(
    fence(
      `import { AgentLimitsCard, ContextMeter } from '@/components/composer/agent-limits';

// The card on its own (pass your own numbers as \`limits\`, or leave the sample data).
<AgentLimitsCard defaultOpen />

// The ring a composer carries in its status line: opens the card above it.
<ContextMeter percent={82} />`,
      'tsx',
    ),
    '',
  );
  L.push('`limits` follows the `AgentLimits` shape: `window` (max tokens), `buckets` (label, tokens, colour), `deferred`, `groups` (label and `[name, tokens]` members), `plan` and `limits` (label, reset text, percent).', '');
  L.push('## Files (verbatim — copy each one to its path)', '');
  L.push('### `src/lib/utils.ts`', '', fence(utils, 'ts'), '');
  for (const { path, code } of sources) L.push(`### \`${path}\``, '', fence(code, 'tsx'), '');
  L.push('## Acceptance checklist', '');
  L.push(
    '- The context bar segments add up to the used share, each in its chart colour, with a 1px gap between them.',
    '- Clicking "Context window" expands the breakdown with a height-and-fade reveal and flips the chevron; each group row expands on its own.',
    '- The ring\'s popover opens above it, aligned to its end, and its card agrees with the ring\'s percentage.',
    '- Identical in light and dark; no console errors.',
  );
  return L.join('\n');
}
