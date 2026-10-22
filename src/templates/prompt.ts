import type { TemplateMeta } from './registry';

/* Rebuild prompt for a chat template: stack, the CSS it relies on, then every source file verbatim
 * (the shared chat kit + the template itself). Raw files load only when a prompt is opened. */

const SOURCES = import.meta.glob(['./kit/*.{ts,tsx}', './*.tsx'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;
const STYLES = import.meta.glob(['../styles/templates.css', '../styles/gallery.css', '../styles/globals.css'], { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;
const UTILS = import.meta.glob('../lib/utils.ts', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

const fence = (code: string, lang: string) => {
  const n = Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((m) => m[0].length + 1));
  const f = '`'.repeat(n);
  return `${f}${lang}\n${code.replace(/\s+$/, '')}\n${f}`;
};

/** Pulls one rule (and its @media reduced-motion twin) out of a stylesheet. */
const ruleOf = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return '';
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  return '';
};

export async function buildTemplatePrompt(t: TemplateMeta) {
  const files = ['./kit/engine.ts', './kit/markdown.tsx', './kit/parts.tsx', `./${t.file}`];
  const sources = await Promise.all(files.map(async (f) => [f.replace('./', 'src/templates/'), await SOURCES[f]()] as const));
  const [templatesCss, galleryCss, globalsCss] = await Promise.all(['../styles/templates.css', '../styles/gallery.css', '../styles/globals.css'].map((f) => STYLES[f]()));
  const utils = await UTILS['../lib/utils.ts']();

  const shimmer = [
    globalsCss.slice(globalsCss.indexOf('@keyframes ai-chat-text-shimmer'), globalsCss.indexOf('.agent-progress-loading-text')).trim(),
    ruleOf(globalsCss, '.agent-progress-loading-text'),
  ].join('\n\n');
  const caretAndRows = galleryCss
    .split('\n')
    .filter((l) => /sui-caret|sui-row/.test(l))
    .join('\n');

  const L: string[] = [];
  L.push(`# Recreate the "${t.name}" chat template`, '');
  L.push(`${t.description}`, '');
  L.push(
    'Rebuild it **identically** (layout, classes, copy, timings) in React 19 + TypeScript + Tailwind CSS v4. It is a live preview: a scripted conversation plays on load, then the composer accepts real messages and answers with a scripted reply. Do not redesign, simplify or rename anything.',
    '',
  );
  L.push('## Stack', '');
  L.push(
    '- `react`, `react-dom` 19, `lucide-react` (icons), `tailwindcss` v4, `tw-animate-css` (the `animate-in fade-in-0 slide-in-from-*` classes).',
    '- `clsx` + `tailwind-merge` for `cn()` (below).',
    '- Streaming UI design tokens: `theme.css` and `typography.css` (copied from `src/styles/`) define every semantic utility used here (`bg-background-primary-default`, `text-text-secondary`, `border-border-button-default`, `text-body-2-medium`, `bg-button-primary`…). Dark mode is a `.dark` class on `<html>`.',
    '- Path alias `@/` → `src/`.',
    '',
  );
  L.push('## Global CSS', '', 'Add these rules to the global stylesheet after the theme and typography imports.', '');
  L.push(fence(`${templatesCss.trim()}\n\n${shimmer}\n\n${caretAndRows}`, 'css'), '');
  L.push('## Files (verbatim — copy each one to its path)', '');
  L.push('### `src/lib/utils.ts`', '', fence(utils, 'ts'), '');
  for (const [path, code] of sources) L.push(`### \`${path}\``, '', fence(code, path.endsWith('x') ? 'tsx' : 'ts'), '');
  L.push('## Mounting', '');
  L.push(`Render \`<${t.name.replace(/\s+/g, '')}Template />\` (the default export of \`src/templates/${t.file}\`) inside a full-height container, e.g. \`<div className="h-dvh">\`. The template fills its parent and adapts at the \`sm\`, \`md\`, \`lg\` and \`xl\` breakpoints.`, '');
  L.push('## Acceptance checklist', '');
  L.push(
    '- The intro conversation plays on load with the same copy, order and timings.',
    '- Sending a message cancels anything still playing; Stop ends the current answer.',
    '- Pixel-identical at 1440px, 820px and 390px widths, light and dark themes.',
    '- No console errors; no horizontal overflow.',
  );
  return L.join('\n');
}
