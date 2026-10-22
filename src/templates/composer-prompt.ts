import { COMPOSER_VARIANTS, type ComposerVariant } from './kit/composer-variant';

/* Rebuild prompt for one composer (/composers → Prompt): what it is, the one-line install from this site's
 * registry, then every source file it needs verbatim (the shared composer kit + its own file). Raw files load
 * only when a prompt is opened. */

const SOURCES = import.meta.glob(['./kit/*.{ts,tsx}', './kit/variants/*.tsx', '!./kit/variants/*.showcase.tsx'], { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;
const UTILS = import.meta.glob('../lib/utils.ts', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

/** The kit every composer imports; attachments-assets.ts is described, not inlined (≈86 KB of data URIs). */
const KIT = ['composer-kit.tsx', 'primitives.tsx', 'attachments.tsx', 'agent-limits.tsx', 'icon.tsx'];

const fence = (code: string, lang: string) => {
  const n = Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((m) => m[0].length + 1));
  const f = '`'.repeat(n);
  return `${f}${lang}\n${code.replace(/\s+$/, '')}\n${f}`;
};

export async function buildComposerPrompt(id: ComposerVariant) {
  const meta = COMPOSER_VARIANTS.find((v) => v.id === id)!;
  const Name = `${meta.name}Composer`;
  const files = [...KIT.map((f) => `./kit/${f}`), `./kit/variants/${id}.tsx`];
  const sources = await Promise.all(files.map(async (f) => [f.replace('./kit/', 'src/components/composer/'), await SOURCES[f]()] as const));
  const utils = await UTILS['../lib/utils.ts']();
  const registry = `${window.location.origin}/r/composer-${id}.json`;

  const L: string[] = [];
  L.push(`# Recreate the "${meta.name}" composer`, '');
  L.push(`${meta.name} (${meta.from}): ${meta.hint}.`, '');
  L.push('Rebuild it **identically** (markup, classes, spacing, keyboard behaviour, timings) in React 19 + TypeScript + Tailwind CSS v4. Do not redesign, simplify or rename anything.', '');
  L.push('## Fastest path', '');
  L.push('The same files are published as a shadcn registry item. In a project that already has shadcn set up:', '');
  L.push(fence(`npx shadcn@latest add ${registry}`, 'bash'), '');
  L.push('Then import the tokens once in the global CSS, after Tailwind: `@import "./styles/streaming-ui.css";`. The rest of this prompt is the same thing by hand.', '');
  L.push('## Stack', '');
  L.push(
    '- `react`, `react-dom` 19, `lucide-react` (icons), `radix-ui` (the context ring\'s popover), `tailwindcss` v4, `tw-animate-css`.',
    '- `clsx` + `tailwind-merge` for `cn()` (below).',
    '- Streaming UI design tokens (`theme.css`, `typography.css`, `globals.css` from `src/styles/`, or the registry\'s `streaming-ui.css`) define every semantic utility used here (`bg-background-primary-default`, `text-text-secondary`, `border-border-button-default`, `text-body-regular`…). Dark mode is a `.dark` class on `<html>`.',
    '- Path alias `@/` → `src/`.',
    '',
  );
  L.push('## Usage', '');
  L.push(
    fence(
      `import { useState } from 'react';
import { ${Name} } from '@/components/composer/variants/${id}';

export function Chat() {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <${Name}
      value={draft}
      onChange={setDraft}
      onSend={(text) => {
        setDraft('');
        setBusy(true); // start your request; setBusy(false) when the answer ends
      }}
      onStop={() => setBusy(false)}
      busy={busy}
      context={42}
      placeholder="Ask me anything"
    />
  );
}`,
      'tsx',
    ),
    '',
  );
  L.push(`\`${Name}\` owns its attachment queue (the + button) and clears it on send. Optional slots: \`model\` (a model picker), \`tools\` (chips), \`status\` (two spans for the line under the composer), \`context\` (0–100, the ring that opens the limits card).`, '');
  L.push('## Files (verbatim — copy each one to its path)', '');
  L.push('### `src/lib/utils.ts`', '', fence(utils, 'ts'), '');
  for (const [path, code] of sources) L.push(`### \`${path}\``, '', fence(code, path.endsWith('x') ? 'tsx' : 'ts'), '');
  L.push('### `src/components/composer/attachments-assets.ts`', '');
  L.push('Exports seven string constants used as sample attachments: `CAT_JPG` (a photo) and `DOC_ICON`, `DOC_DARK_ICON`, `SHEET_ICON`, `SLIDES_ICON`, `CODE_ICON`, `VIDEO_ICON` (24px file-type icons). Use data URIs or URLs of your own images; the registry install ships the originals.', '');
  L.push('## Acceptance checklist', '');
  L.push(
    '- Enter sends, Shift+Enter adds a line, Esc stops while busy; Send turns into Stop while busy.',
    '- The + button queues sample files with their upload ring; sending clears them.',
    '- Long drafts grow the field up to 8 lines, then it scrolls inside.',
    '- Identical in light and dark; no console errors.',
  );
  return L.join('\n');
}
