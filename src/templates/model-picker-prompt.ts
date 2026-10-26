/* Rebuild prompt for the model picker (/model-picker → Prompt): what it is, the one-line install from this site's
 * registry, then every source file it needs verbatim. provider-logos.ts is described, not inlined (≈38 KB of
 * data URIs). Raw files load only when the prompt is opened. */

const SOURCES = import.meta.glob(['./kit/model-picker.tsx', './kit/max-effort-fx.tsx', './kit/icon.tsx'], { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;
const UTILS = import.meta.glob('../lib/utils.ts', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

const FILES = ['model-picker.tsx', 'max-effort-fx.tsx', 'icon.tsx'];

const fence = (code: string, lang: string) => {
  const n = Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((m) => m[0].length + 1));
  const f = '`'.repeat(n);
  return `${f}${lang}\n${code.replace(/\s+$/, '')}\n${f}`;
};

export async function buildModelPickerPrompt() {
  const sources = await Promise.all(FILES.map(async (f) => ({ path: `src/components/composer/${f}`, code: await SOURCES[`./kit/${f}`]() })));
  const utils = await UTILS['../lib/utils.ts']();
  const registry = `${window.location.origin}/r/model-picker.json`;

  const L: string[] = [];
  L.push('# Recreate the model picker', '');
  L.push(
    'A model picker for a chat composer: a pill trigger showing the current model opens a 341×282 popover above it. A vertical rail of 18 provider logos (each named in an instant tooltip on hover) picks the provider; its models list as radio rows; Quick Search filters every provider at once. The selected row carries an Effort badge that opens a six-step Faster → Smarter slider (Max blows its ticks away), and models that offer it get a fast-mode bolt.',
    '',
  );
  L.push('Rebuild it **identically** (markup, classes, spacing, keyboard behaviour, timings) in React 19 + TypeScript + Tailwind CSS v4. Do not redesign, simplify or rename anything.', '');
  L.push('## Fastest path', '');
  L.push('The same files are published as a shadcn registry item. In a project that already has shadcn set up:', '');
  L.push(fence(`npx shadcn@latest add ${registry}`, 'bash'), '');
  L.push('Then import the tokens once in the global CSS, after Tailwind: `@import "./styles/streaming-ui.css";`. The rest of this prompt is the same thing by hand.', '');
  L.push('## Stack', '');
  L.push(
    '- `react`, `react-dom` 19, `lucide-react` (the reset icon), `radix-ui` (Popover for the picker and the effort card, Tooltip for the rail), `tailwindcss` v4, `tw-animate-css`.',
    '- `clsx` + `tailwind-merge` for `cn()` (below).',
    '- Streaming UI design tokens (`theme.css`, `typography.css`, `globals.css` from `src/styles/`, or the registry\'s `streaming-ui.css`) define every semantic utility used here (`bg-background-primary-default`, `bg-composer-panel-rail-background`, `text-text-secondary`, `shadow-dropdown`…). Dark mode is a `.dark` class on `<html>`.',
    '- Path alias `@/` → `src/`.',
    '',
  );
  L.push('## Usage', '');
  L.push(
    fence(
      `import { useState } from 'react';
import { ModelPicker } from '@/components/composer/model-picker';

export function ModelSlot() {
  const [model, setModel] = useState('Fable 5');
  return <ModelPicker value={model} onChange={setModel} />;
}`,
      'tsx',
    ),
    '',
  );
  L.push('`value` is a model name from `PROVIDERS`. Effort (0–5) and fast mode are kept inside unless you pass `effort`/`onEffortChange` and `fast`/`onFastChange`. Drop it into a composer\'s `model` slot or anywhere on its own.', '');
  L.push('## Files (verbatim — copy each one to its path)', '');
  L.push('### `src/lib/utils.ts`', '', fence(utils, 'ts'), '');
  for (const { path, code } of sources) L.push(`### \`${path}\``, '', fence(code, 'tsx'), '');
  L.push('### `src/components/composer/provider-logos.ts`', '');
  L.push(
    'Exports `PROVIDER_LOGOS: Record<string, string>`, one SVG data URI per provider `file` id used in `PROVIDERS`: `openai`, `anthropic`, `perplexity`, `cursor`, `openrouter`, `deepseek`, `jina`, `ollama`, `gemini`, `meta`, `mistral`, `xai`, `qwen`, `groq`, `cohere`, `moonshot`, `zhipu`, `aws`. Monochrome black marks (dark mode inverts them), 18–20px. Use the providers\' own marks; the registry install ships the originals.',
    '',
  );
  L.push('## Acceptance checklist', '');
  L.push(
    '- Hovering a rail logo shows its provider name at once, and sliding down the rail swaps the label with no delay.',
    '- Quick Search matches model or provider names across the whole catalogue ("llama 4" gives 8 rows); Esc clears the query.',
    '- Dragging the effort slider never resizes the badge; reaching Max scatters the ticks, leaving it brings them back.',
    '- The fast bolt slides into the trigger and badge only for models that offer fast mode.',
    '- Identical in light and dark; no console errors.',
  );
  return L.join('\n');
}
