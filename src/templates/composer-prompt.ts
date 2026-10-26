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

const normalizeModulePath = (path: string) => {
  const parts: string[] = [];
  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..' && parts.length && parts[parts.length - 1] !== '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
};

const moduleId = (path: string) => normalizeModulePath(path).replace(/\.(?:[cm]?[jt]sx?)$/, '');

const importSpecifiers = (code: string) => {
  const specifiers: string[] = [];
  const imports = /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of code.matchAll(imports)) {
    const specifier = match[1] ?? match[2];
    if (specifier) specifiers.push(specifier);
  }
  return specifiers;
};

const fence = (code: string, lang: string) => {
  const n = Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((m) => m[0].length + 1));
  const f = '`'.repeat(n);
  return `${f}${lang}\n${code.replace(/\s+$/, '')}\n${f}`;
};

export async function buildComposerPrompt(id: ComposerVariant) {
  const meta = COMPOSER_VARIANTS.find((v) => v.id === id)!;
  const Name = `${meta.name}Composer`;
  const files = [...KIT.map((f) => `./kit/${f}`), `./kit/variants/${id}.tsx`];
  const sources = await Promise.all(files.map(async (source) => ({
    source,
    path: source.replace('./kit/', 'src/components/composer/'),
    code: await SOURCES[source](),
  })));
  const utils = await UTILS['../lib/utils.ts']();
  const inlined = [...sources.map(({ source, code }) => [source, code] as const), ['../lib/utils.ts', utils] as const];
  const inlinedIds = new Set(inlined.map(([source]) => moduleId(source)));
  for (const [source, code] of inlined) {
    for (const specifier of importSpecifiers(code)) {
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) continue;
      const directory = source.slice(0, source.lastIndexOf('/') + 1);
      const target = moduleId(`${directory}${specifier}`);
      if (!inlinedIds.has(target) && target !== 'kit/attachments-assets') {
        throw new Error(`Composer prompt source ${source} has a relative import that is not inlined: ${specifier}`);
      }
    }
  }
  const shadcnPrimitives = [...new Set(inlined.flatMap(([, code]) => importSpecifiers(code)
    .map((specifier) => specifier.match(/^@\/components\/ui\/([^/]+)/)?.[1])
    .filter((name): name is string => Boolean(name))))];
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
  if (shadcnPrimitives.length) {
    L.push(`- Add these shadcn primitives first: \`npx shadcn@latest add ${shadcnPrimitives.join(' ')}\`.`, '');
  }
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
  L.push(`\`${Name}\` owns its attachment queue (the + button) and clears it on send. Optional slots: \`model\` (a model picker: ours is \`npx shadcn@latest add ${window.location.origin}/r/model-picker.json\`, a provider rail whose logos name themselves in an instant tooltip on hover), \`tools\` (chips), \`status\` (two spans for the line under the composer), \`context\` (0–100, the ring that opens the limits card).`, '');
  L.push('## Files (verbatim — copy each one to its path)', '');
  L.push('### `src/lib/utils.ts`', '', fence(utils, 'ts'), '');
  for (const { path, code } of sources) L.push(`### \`${path}\``, '', fence(code, path.endsWith('x') ? 'tsx' : 'ts'), '');
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
