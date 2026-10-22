/* Rebuild prompt for each demo: a self-contained Markdown prompt to recreate the component and its demo 1:1 —
 * dependencies, theme tokens, every original source file (shipped in public/sources/<collection>/) and the
 * exact demo choreography with its helpers.
 * Ported from the vanilla gallery's codeview.js; the dialog itself is now components/prompt-dialog.tsx. */

// Raw text of the demo modules, loaded on demand: helpers private to a pack are cut out of it.
// run() itself and the shared helpers come from Function#toString — the build keeps the authored text
// (Vite 7 / Rollup with minify off), see vite.config.ts.
const RAW = import.meta.glob(['./libs.js', './packs/*.js'], { query: '?raw', import: 'default' });
const rawCache = {};
const loadRaw = (file) => (rawCache[file] ||= (RAW[file] ? RAW[file]() : Promise.resolve('')).catch(() => ''));
const BASE = import.meta.env.BASE_URL;

export const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, ' ').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
export const keyOf = (d) => `${d.group}::${d.title}`;

/* ------------------------------------------------------------ sources */
let indexPromise = null;
const loadIndex = () => (indexPromise ||= fetch(`${BASE}sources/index.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
export async function loadItems(d) {
  const index = await loadIndex();
  const entry = index[keyOf(d)];
  const names = entry?.items || d.registry || [];
  const items = [];
  for (const name of names) {
    let item = null;
    try { const r = await fetch(`${BASE}sources/${encodeURIComponent(d.group)}/${name}.json`); if (r.ok) item = await r.json(); } catch {}
    if (item) items.push({ ...item, name: item.name || name, url: `${BASE}sources/${encodeURIComponent(d.group)}/${name}.json` });
  }
  return { items, note: entry?.note };
}

/* ------------------------------------------------------------ prompt */
const langOf = (p = '') => (/\.(tsx|ts|jsx|js|mjs)$/.test(p) ? (p.endsWith('x') ? 'tsx' : p.split('.').pop()) : /\.css$/.test(p) ? 'css' : /\.json$/.test(p) ? 'json' : /\.mdx?$/.test(p) ? 'markdown' : 'text');
const fence = (code, lang) => { const n = Math.max(3, ...[...String(code).matchAll(/`{3,}/g)].map((m) => m[0].length + 1)); const f = '`'.repeat(n); return `${f}${lang}\n${String(code).replace(/\s+$/, '')}\n${f}`; };
// The demo's run() plus, recursively, every helper and constant it reaches (app.js locals and the shared `h`),
// so the reference is complete and can be rebuilt without the rest of the gallery.
const reIdent = (k) => { const e = k.replace(/\$/g, '\\$'); return new RegExp(`(?<![\\w$.])${e}(?![\\w$])|\\bh\\.${e}(?![\\w$])`); };
/* Top-level declarations of a pack file (function X / const X = …), cut with a small scanner
 * that respects strings, template literals and comments. Used for helpers private to a pack. */
function declarations(text) {
  const map = {};
  const re = /^[ \t]*(?:async\s+)?function\s*\*?\s*([\w$]+)\s*\(|^[ \t]*(?:const|let)\s+([\w$]+)\s*=/gm;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1] || m[2]; const start = m.index; let i = m[1] ? re.lastIndex - 1 : re.lastIndex; let depth = 0; let seenBrace = false; const stack = [];
    for (; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      const top = stack[stack.length - 1];
      if (top === '`') { if (c === '\\') { i++; continue; } if (c === '`') stack.pop(); else if (c === '$' && n === '{') { stack.push('${'); i++; } continue; }
      if (top === "'" || top === '"') { if (c === '\\') { i++; continue; } if (c === top) stack.pop(); continue; }
      if (c === '/' && n === '/') { i = text.indexOf('\n', i); if (i < 0) i = text.length; continue; }
      if (c === '/' && n === '*') { i = text.indexOf('*/', i + 2) + 1; continue; }
      if (c === "'" || c === '"' || c === '`') { stack.push(c); continue; }
      if (c === '/') { // regex literal: a slash where an operand is expected
        const prev = text.slice(Math.max(0, i - 12), i).replace(/\s+$/, '');
        if (!prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of)$/.test(prev)) {
          let inClass = false;
          for (i++; i < text.length; i++) { const x = text[i]; if (x === '\\') { i++; continue; } if (x === '[') inClass = true; else if (x === ']') inClass = false; else if (x === '/' && !inClass) break; else if (x === '\n') break; }
          continue;
        }
      }
      if (c === '{' || c === '(' || c === '[') { depth++; if (c === '{') seenBrace = true; continue; }
      if (c === '}' && top === '${') { stack.pop(); continue; }
      if (c === '}' || c === ')' || c === ']') { depth--; if (depth === 0 && m[1] && c === '}' && seenBrace) { i++; break; } continue; }
      if (depth === 0 && m[2] && (c === ';' || (c === '\n' && /^\s*(const|let|function|async|return|\}|\/\/|\(window)/.test(text.slice(i + 1, i + 40))))) { i++; break; }
    }
    const body = text.slice(start, i).replace(/^[ \t]+/, '');
    if (!map[name]) { try { new Function(body.replace(/^(const|let)\s+/, 'var ')); map[name] = body; } catch { /* cut went wrong: leave it out */ } }
    re.lastIndex = Math.max(re.lastIndex, i);
  }
  return map;
}
const needlesOf = (title) => [`'${title.replace(/'/g, "\\'")}'`, JSON.stringify(title), `\`${title}\``];
/** The module that declares a demo (found by its title literal), with its raw text and declarations. */
async function packDecls(d) {
  const needles = needlesOf(d.title);
  for (const file of Object.keys(RAW)) {
    const text = await loadRaw(file);
    if (needles.some((n) => text.includes(n))) return { file, text, decls: declarations(text) };
  }
  return { file: '', text: '', decls: {} };
}

function demoSource(d, refs, extra = {}) {
  let run = ''; try { run = d.run.toString(); } catch { return ''; }
  const fns = Object.assign({}, refs.H, refs.refs);
  const consts = refs.consts;
  const used = new Map(), usedConsts = new Map();
  const scan = (src, depth) => {
    if (depth > 8) return;
    for (const [k, s] of Object.entries(extra)) {
      if (used.has(k) || usedConsts.has(k) || k === 'demo' || !reIdent(k).test(src)) continue;
      used.set(k, s); scan(s, depth + 1);
    }
    for (const [k, v] of Object.entries(fns)) {
      if (used.has(k) || usedConsts.has(k) || !reIdent(k).test(src)) continue;
      if (typeof v === 'function') { const s = v.toString(); used.set(k, s); scan(s, depth + 1); }
      else { try { usedConsts.set(k, JSON.stringify(v)); } catch {} }
    }
    for (const [k, v] of Object.entries(consts)) if (!usedConsts.has(k) && reIdent(k).test(src)) usedConsts.set(k, v);
  };
  scan(run, 0);
  if (!used.size && !usedConsts.size) return run;
  const decl = (k, s) => (/^(const|let)\s/.test(s) ? s : /^(async\s+)?function\b/.test(s) ? s.replace(/^(async\s+)?function\s*\*?\s*[\w$]*\s*\(/, (m, a) => `${a || ''}function ${k}(`) : `const ${k} = ${s};`);
  const out = ['// Helpers reached by run() — `h.x` in run() refers to the same functions.'];
  for (const [k, v] of usedConsts) out.push(`const ${k} = ${v};`);
  for (const [k, s] of [...used].reverse()) out.push(decl(k, s));
  out.push('// Demo: one full cycle. The gallery calls run(stage, timers()) again after ~3.8s.', `const demo = { title: ${JSON.stringify(d.title)}, ${/^(async\s+)?run\s*\(/.test(run) ? run : `run: ${run}`} };`);
  return out.join('\n\n');
}
// Families of items share files (e.g. every Dots loader ships the same core): keep each path+content once.
const uniqueFiles = (items) => { const seen = new Set(); return items.flatMap((i) => (i.files || []).filter((f) => f.content).map((f) => ({ ...f, item: i.name }))).filter((f) => { const k = (f.target || f.path) + '|' + f.content.length + f.content.slice(0, 200); if (seen.has(k)) return false; seen.add(k); return true; }); };

export function buildPrompt(d, items, note, demo) {
  const L = [];
  L.push(`# Recreate "${d.title}" — ${d.group}`, '');
  L.push(`Rebuild this streaming-response component **identically** (markup, classes, tokens, timings, easing, copy) in React + TypeScript + Tailwind CSS v4${items.some((i) => (i.dependencies || []).some((x) => /^motion|framer-motion/.test(x))) ? ' + motion/react' : ''}. Do not redesign, simplify or rename anything.`, '');
  L.push('## What it does', '', d.desc, '');
  L.push('## Source of truth', '');
  L.push(`- Collection: **${d.group}**`);
  if (items.length) {
    L.push(`- Source items: ${items.map((it) => `\`${it.name}\``).join(', ')}`, '- Source files are included below; add their npm dependencies.');
  } else {
    L.push(`- Source files are not included${note ? ` (${note})` : ''}. Rebuild it from the reference implementation below, which reproduces the original preview.`);
  }
  const deps = [...new Set(items.flatMap((i) => i.dependencies || []))];
  const devDeps = [...new Set(items.flatMap((i) => i.devDependencies || []))];
  const regDeps = [...new Set(items.flatMap((i) => i.registryDependencies || []))];
  if (deps.length) L.push(`- npm dependencies: ${deps.map((x) => `\`${x}\``).join(', ')}`);
  if (devDeps.length) L.push(`- dev dependencies: ${devDeps.map((x) => `\`${x}\``).join(', ')}`);
  if (regDeps.length) L.push(`- registry dependencies (install them too): ${regDeps.map((x) => `\`${x}\``).join(', ')}`);
  L.push('');
  const vars = items.map((i) => i.cssVars).filter((v) => v && Object.keys(v).length);
  if (vars.length) { L.push('## Theme tokens', '', fence(JSON.stringify(Object.assign({}, ...vars), null, 2), 'json'), ''); }
  const css = items.map((i) => i.css).filter((v) => v && Object.keys(v).length);
  if (css.length) { L.push('## Global CSS', '', fence(JSON.stringify(Object.assign({}, ...css), null, 2), 'json'), ''); }
  const files = uniqueFiles(items);
  if (files.length) {
    L.push('## Files (verbatim — copy each one to its path)', '');
    for (const f of files) L.push(`### \`${f.target || f.path}\``, '', fence(f.content, langOf(f.target || f.path)), '');
  }
  L.push('## Demo to reproduce', '');
  L.push('Build a demo page that plays this exact choreography in a loop (same copy, same order, same delays in ms). The reference below is the vanilla implementation running in the gallery: `t.sleep(ms)` waits, `t.every(ms, fn)` ticks, and the class strings are the Tailwind classes to keep. Translate it to React state + effects (or motion) while keeping every value.', '');
  L.push(fence(demo, 'js'), '');
  L.push('## Acceptance checklist', '');
  L.push('- Pixel-identical at 1280px, 820px and 375px widths, light and dark themes.', '- Same timings, easings and stagger as the source files and the demo above.', '- `prefers-reduced-motion` falls back exactly as the source does.', '- No console errors; no horizontal overflow.');
  return L.join('\n');
}

/** Everything the Prompt dialog shows for a demo. `refs` comes from the registry (helpers + constants). */
export async function createPrompt(d, refs) {
  const { items, note } = await loadItems(d);
  const pack = await packDecls(d);
  const demo = demoSource(d, refs, pack.decls);
  return { items, note: note || '', demo, prompt: buildPrompt(d, items, note, demo) };
}
