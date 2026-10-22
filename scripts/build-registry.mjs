// Builds the composer kit as a shadcn registry: writes registry.json, bundles the Streaming UI tokens into one CSS
// file, then runs `shadcn build`, which emits one JSON per item into public/r/ (served next to the site).
//
//   bun run registry:build                                   (production URL, set in package.json)
//   REGISTRY_URL=https://your-site.dev bun scripts/build-registry.mjs
//
// Items that depend on each other reference their JSON by URL, so REGISTRY_URL must be where public/r is served.
// There is no default: a silent localhost fallback once shipped a registry that only worked on the author's machine.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

if (!process.env.REGISTRY_URL) {
  console.error('REGISTRY_URL is not set: give the public origin that serves public/r (see package.json registry:build).');
  process.exit(1);
}
const BASE = process.env.REGISTRY_URL.replace(/\/$/, '');
const SHADCN = 'shadcn@4.22.1'; // pinned: the registry output must not change with whatever shadcn is latest
const url = (name) => `${BASE}/r/${name}.json`;
const KIT = 'src/templates/kit';
const TARGET = 'components/composer';

// 1. Tokens: the Streaming UI theme, type scale, keyframes and the few kit utilities, as one stylesheet.
const CSS = ['fonts', 'theme', 'typography', 'globals', 'scrollbars', 'templates'];
mkdirSync('registry', { recursive: true });
writeFileSync(
  'registry/streaming-ui.css',
  [
    '/* Streaming UI tokens for the composer kit. Import it once, after Tailwind, in your global stylesheet:',
    ' *   @import "tailwindcss";',
    ' *   @import "./styles/streaming-ui.css";',
    ' * Inter and JetBrains Mono are expected as --font-inter / --font-mono-source (next/font or @fontsource). */',
    ...CSS.map((f) => `\n/* ---- ${f}.css */\n${readFileSync(`src/styles/${f}.css`, 'utf8').replace(/^@import[^\n]*\n/gm, '')}`),
  ].join('\n'),
);

const file = (path, type = 'registry:component') => ({ path: `${KIT}/${path}`, type, target: `${TARGET}/${path}` });

const COMPOSERS = [
  ['pill', 'Pill', 'Single row: one 52px row with add, input, model, mic and send.', []],
  ['box', 'Box', 'Textarea: a growing textarea over an action row.', []],
  ['panel', 'Panel', 'Rail: branch, project and context on a rail, permission modes.', ['dropdown-menu']],
  ['dock', 'Dock', 'Floating toolbar: a floating glass toolbar with grouped tools.', []],
  ['command', 'Command', 'Terminal: monospace prompt, slash commands, key hints.', []],
  ['inline', 'Inline', 'Selection bar: a compact bar on a selection, edit or ask.', []],
  ['voice', 'Voice', 'Voice orb: push-to-talk orb with a live transcript.', []],
  ['halo', 'Halo', 'Glow rim: glowing rim, typed example prompts, enhance, vanish on send.', []],
  ['media', 'Media', 'Image prompt: prompt with aspect ratio, sliders, style and batch.', []],
  ['palette', 'Palette', 'Command palette: a command palette that hands the query to AI on Tab.', []],
  ['mention', 'Mention', 'Mentions: @ chips for files, people and sources.', []],
];

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'streaming-ui',
  homepage: BASE,
  items: [
    {
      name: 'composer-theme',
      type: 'registry:file',
      title: 'Streaming UI tokens',
      description: 'Colors, radii, shadows, type scale and keyframes the composers are drawn with. Import styles/streaming-ui.css after Tailwind.',
      files: [{ path: 'registry/streaming-ui.css', type: 'registry:file', target: 'styles/streaming-ui.css' }],
    },
    {
      name: 'composer-kit',
      type: 'registry:component',
      title: 'Composer kit',
      description: 'What every composer shares: the props contract, field behaviour, buttons, dictation, the status line with the context ring, the Composer Loader rim and the Composer Attachments strip.',
      dependencies: ['lucide-react', 'radix-ui'],
      registryDependencies: ['utils', url('composer-theme')],
      files: ['composer-kit.tsx', 'primitives.tsx', 'attachments.tsx', 'attachments-assets.ts', 'agent-limits.tsx', 'icon.tsx'].map((f) => file(f)),
    },
    ...COMPOSERS.map(([id, title, description, ui]) => ({
      name: `composer-${id}`,
      type: 'registry:component',
      title: `${title} composer`,
      description,
      dependencies: ['lucide-react', ...(id === 'media' ? ['radix-ui'] : [])],
      registryDependencies: [url('composer-kit'), ...ui],
      files: [file(`variants/${id}.tsx`)],
    })),
    {
      name: 'composer',
      type: 'registry:component',
      title: 'Composer (all variants)',
      description: 'The eleven composers behind one <Composer variant="…" /> switch, with a provider that lets a picker swap them everywhere.',
      registryDependencies: COMPOSERS.map(([id]) => url(`composer-${id}`)),
      files: [file('composers.tsx'), file('composer-variant.tsx'), { path: 'src/lib/storage.ts', type: 'registry:lib', target: 'lib/storage.ts' }],
    },
    {
      name: 'model-picker',
      type: 'registry:component',
      title: 'Model picker',
      description: 'Multi-agent model picker: providers, effort slider with the Max jet effect, fast mode.',
      dependencies: ['lucide-react', 'radix-ui'],
      registryDependencies: [url('composer-kit')],
      files: [file('model-picker.tsx'), file('max-effort-fx.tsx')],
    },
  ],
};

writeFileSync('registry.json', `${JSON.stringify(registry, null, 2)}\n`);
execSync(`bunx ${SHADCN} build registry.json --output public/r`, { stdio: 'inherit' });
console.log(`Registry built for ${BASE}: ${registry.items.length} items in public/r/`);
