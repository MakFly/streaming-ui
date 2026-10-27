// Builds the composer kit as a shadcn registry: writes registry.json, bundles the Streaming UI tokens into one CSS
// file, then runs `shadcn build`, which emits one JSON per item into public/r/ (served next to the site).
//
//   bun run registry:build                                   (production URL, set in package.json)
//   REGISTRY_URL=https://your-site.dev bun scripts/build-registry.mjs
//
// Items that depend on each other reference their JSON by URL, so REGISTRY_URL must be where public/r is served.
// There is no default: a silent localhost fallback once shipped a registry that only worked on the author's machine.
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';
import ts from 'typescript';

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

// Thinking orbs (Jakub Antalik, MIT): the engine ships with its LICENSE, and every file carries the credit header.
const ORB = 'src/components/thinking-orb';
const ORB_CREDIT = 'Jakub Antalik (libraries.dev/orbs), made with help from Alexandr Brinza. MIT, from the thinking-orbs package.';
const orbFile = (path, type = 'registry:component') => ({ path: `${ORB}/${path}`, type, target: `components/thinking-orb/${path}` });
const ORB_ENGINE = readdirSync(ORB, { recursive: true })
  .map((f) => String(f).replaceAll('\\', '/')) // Windows lists engine\core.ts: the registry and its import checks want posix paths

  .filter((f) => /\.tsx?$/.test(f) && f !== 'orb-status.tsx')
  .sort();

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
      files: ['composer-kit.tsx', 'primitives.tsx', 'attachments.tsx', 'attachments-assets.ts', 'agent-limits.tsx', 'icon.tsx', 'mention-menu.tsx', 'mention-field.tsx'].map((f) => file(f)),
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
      dependencies: ['lucide-react'],
      registryDependencies: COMPOSERS.map(([id]) => url(`composer-${id}`)),
      files: [file('composers.tsx'), file('reply.tsx'), file('composer-variant.tsx'), { path: 'src/lib/storage.ts', type: 'registry:lib', target: 'lib/storage.ts' }],
    },
    {
      name: 'model-picker',
      type: 'registry:component',
      title: 'Model picker',
      description: 'Multi-agent model picker: providers, effort slider with the Max jet effect, fast mode.',
      dependencies: ['lucide-react', 'radix-ui'],
      registryDependencies: [url('composer-kit')],
      files: [file('model-picker.tsx'), file('max-effort-fx.tsx'), file('provider-logos.ts')],
    },
    {
      name: 'agent-limits-card',
      type: 'registry:component',
      title: 'Agent Limits Card',
      description: 'Context window split by token bucket with an expandable breakdown, plan usage limits with reset times, and the context ring that opens it.',
      dependencies: ['radix-ui'],
      registryDependencies: ['utils', url('composer-theme')],
      files: [file('agent-limits.tsx'), file('icon.tsx')],
    },
    {
      name: 'thinking-orb',
      type: 'registry:component',
      title: 'Thinking orb',
      author: ORB_CREDIT,
      description:
        'Dotted thought-orb loader by Jakub Antalik: nine animated states (working, searching, solving, listening, connecting, weaving, composing, breathing, shaping), sizes 64, 32 and 20, light and dark ink, on a plain 2D canvas. <ThinkingOrb state="searching" size={64} />',
      docs: `Thinking orbs are designed and built by Jakub Antalik (https://libraries.dev/orbs), made with help from Alexandr Brinza. MIT: keep components/thinking-orb/LICENSE with the code.`,
      files: [...ORB_ENGINE.map((f) => orbFile(f)), orbFile('LICENSE', 'registry:file')],
    },
    {
      name: 'orb-status',
      type: 'registry:component',
      title: 'Orb status',
      author: ORB_CREDIT,
      description: 'A thinking orb with its shimmering status label, as a 74px pill or a 36px chip, from the libraries.dev/orbs showcase. <OrbStatus state="solving" label="Solving…" variant="pill" />',
      docs: 'Status pill and chip from the libraries.dev/orbs showcase by Jakub Antalik, made with help from Alexandr Brinza.',
      registryDependencies: ['utils', url('thinking-orb')],
      files: [orbFile('orb-status.tsx')],
    },
  ],
};

const localItemsByUrl = new Map(registry.items.map((item) => [url(item.name), item]));
const moduleCandidates = (path) => {
  const normalized = posix.normalize(path);
  const extension = posix.extname(normalized);
  const extensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp'];
  if (extension) {
    const stem = normalized.slice(0, -extension.length);
    return [normalized, ...extensions.map((ext) => `${stem}${ext}`)];
  }
  return [normalized, ...extensions.map((ext) => `${normalized}${ext}`), ...extensions.map((ext) => `${normalized}/index${ext}`)];
};
const importSpecifiers = (sourceFile) => {
  const imports = [];
  const addString = (node) => {
    if (node && ts.isStringLiteralLike(node)) imports.push(node.text);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) addString(node.moduleSpecifier);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) addString(node.argument.literal);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) imports.push(node.arguments[0].text);
      else imports.push('<dynamic import>');
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      if (node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) imports.push(node.arguments[0].text);
      else imports.push('<dynamic require>');
    }
    if (ts.isPropertyAccessExpression(node) && ['glob', 'env'].includes(node.name.text)) {
      const meta = node.expression;
      if (ts.isMetaProperty(meta) && meta.keywordToken === ts.SyntaxKind.ImportKeyword && meta.name.text === 'meta') {
        imports.push(`import.meta.${node.name.text}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return imports;
};

const installErrors = [];
for (const item of registry.items) {
  const files = item.files.filter((entry) => /\.tsx?$/.test(entry.path));
  if (!files.length) continue;

  const shippedTargets = new Set();
  const dependencyNames = new Set();
  const visitedItems = new Set();
  const visitDependency = (dependencyItem) => {
    if (visitedItems.has(dependencyItem.name)) return;
    visitedItems.add(dependencyItem.name);
    for (const entry of dependencyItem.files) shippedTargets.add(posix.normalize(entry.target));
    for (const dependency of dependencyItem.registryDependencies ?? []) {
      if (typeof dependency !== 'string') continue;
      const localItem = localItemsByUrl.get(dependency);
      if (localItem) visitDependency(localItem);
      else dependencyNames.add(dependency);
    }
  };
  visitDependency(item);

  const externalDependencies = new Set(item.dependencies ?? []);
  for (const entry of files) {
    const content = readFileSync(entry.path, 'utf8');
    const sourceFile = ts.createSourceFile(entry.path, content, ts.ScriptTarget.Latest, true, entry.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    for (const specifier of importSpecifiers(sourceFile)) {
      if (specifier === 'import.meta.glob' || specifier === 'import.meta.env') {
        installErrors.push(`${item.name}: ${entry.target} uses unsupported ${specifier}`);
        continue;
      }

      if (specifier.startsWith('./') || specifier.startsWith('../')) {
        const target = posix.join(posix.dirname(entry.target), specifier);
        if (!moduleCandidates(target).some((candidate) => shippedTargets.has(candidate))) {
          installErrors.push(`${item.name}: ${entry.target} import "${specifier}" does not resolve to a shipped file`);
        }
        continue;
      }

      if (specifier.startsWith('@/')) {
        const target = specifier.slice(2);
        if (moduleCandidates(target).some((candidate) => shippedTargets.has(candidate))) continue;
        if (target === 'lib/utils' && dependencyNames.has('utils')) continue;
        const uiDependency = target.match(/^components\/ui\/([^/]+)$/)?.[1];
        if (uiDependency && dependencyNames.has(uiDependency)) continue;
        installErrors.push(`${item.name}: ${entry.target} import "${specifier}" does not resolve to a shipped file or registry dependency`);
        continue;
      }

      const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
      if (packageName !== 'react' && packageName !== 'react-dom' && !externalDependencies.has(packageName)) {
        installErrors.push(`${item.name}: ${entry.target} import "${specifier}" is missing from dependencies`);
      }
    }
  }
}
if (installErrors.length) {
  console.error(`Registry installability validation failed:\n${installErrors.map((error) => `  ${error}`).join('\n')}`);
  process.exit(1);
}

writeFileSync('registry.json', `${JSON.stringify(registry, null, 2)}\n`);
execSync(`bunx ${SHADCN} build registry.json --output public/r`, { stdio: 'inherit' });
console.log(`Registry built for ${BASE}: ${registry.items.length} items in public/r/`);
