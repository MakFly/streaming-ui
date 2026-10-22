/* Prompt dialog for each demo: a self-contained Markdown prompt to rebuild the component and its demo 1:1 —
 * install command, dependencies, theme tokens, every original source file (cached in sources/) and the exact demo choreography with its helpers. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ic = (name, cls = '') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" class="remixicon ${cls}"><path d="${(window.ICONS || {})[name] || ''}"></path></svg>`;

  // Registry base per collection (shadcn "registry-item" JSON at <base><name>.json); none is public here.
  const REGISTRY = {};
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, ' ').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
  const keyOf = (d) => `${d.group}::${d.title}`;
  const installCmd = (group, name) => (REGISTRY[group]?.cli ? REGISTRY[group].cli(name) : `npx shadcn@latest add ${REGISTRY[group]?.base || ''}${name}.json`);

  /* ------------------------------------------------------------ sources */
  let indexPromise = null;
  const loadIndex = () => (indexPromise ||= fetch('sources/index.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  async function loadItems(d) {
    const index = await loadIndex();
    const entry = index[keyOf(d)];
    const names = entry?.items || d.registry || [];
    const items = [];
    for (const name of names) {
      let item = null;
      try { const r = await fetch(`sources/${encodeURIComponent(d.group)}/${name}.json`); if (r.ok) item = await r.json(); } catch {}
      if (!item && REGISTRY[d.group]) { try { const r = await fetch(`${REGISTRY[d.group].base}${name}.json`); if (r.ok) item = await r.json(); } catch {} }
      if (item) items.push({ ...item, name: item.name || name, url: `${REGISTRY[d.group]?.base || ''}${name}.json` });
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
  const packCache = {};
  async function packDecls(d) {
    const files = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')).filter((s) => /^libs(\.js|\/)/.test(s));
    const needles = [`'${d.title.replace(/'/g, "\\'")}'`, JSON.stringify(d.title), `\`${d.title}\``];
    for (const f of files) {
      packCache[f] ||= fetch(f).then((r) => r.text()).catch(() => '');
      const text = await packCache[f];
      if (needles.some((n) => text.includes(n))) return { file: f, decls: declarations(text) };
    }
    return { file: '', decls: {} };
  }

  function demoSource(d, extra = {}) {
    let run = ''; try { run = d.run.toString(); } catch { return ''; }
    const fns = Object.assign({}, window.SR_H || {}, window.SR_REFS || {});
    const consts = window.SR_CONSTS || {};
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

  function buildPrompt(d, items, note, demo = demoSource(d)) {
    const L = [];
    const docs = d.src ? `https://${d.src.split(' ')[0]}` : '';
    L.push(`# Recreate "${d.title}" — ${d.group}`, '');
    L.push(`Rebuild this streaming-response component **identically** (markup, classes, tokens, timings, easing, copy) in React + TypeScript + Tailwind CSS v4${items.some((i) => (i.dependencies || []).some((x) => /^motion|framer-motion/.test(x))) ? ' + motion/react' : ''}. Do not redesign, simplify or rename anything.`, '');
    L.push('## What it does', '', d.desc, '');
    L.push('## Source of truth', '');
    L.push(`- Collection: **${d.group}**${docs ? ` — docs: ${docs}` : ''}`);
    if (items.length) {
      for (const it of items) L.push(`- Registry item \`${it.name}\`: ${it.url}`, `- Install: \`${installCmd(d.group, it.name)}\``);
    } else {
      L.push(`- No public registry source${note ? ` (${note})` : ''}. Rebuild it from the reference implementation below, which reproduces the original preview.`);
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

  /* ------------------------------------------------------------ highlight */
  const hl = (code, lang) => {
    const h = window.hljs;
    const l = lang === 'tsx' || lang === 'jsx' ? 'typescript' : lang === 'js' ? 'javascript' : lang;
    if (h && h.getLanguage(l)) { try { return h.highlight(code, { language: l, ignoreIllegals: true }).value; } catch {} }
    return esc(code);
  };
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); } catch { const ta = mk('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    const label = btn.querySelector('.cv-label'); const prev = label.textContent; label.textContent = 'Copied';
    setTimeout(() => { label.textContent = prev; }, 1400);
  }
  const btnCls = 'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-body-medium whitespace-nowrap text-text-primary shadow-xs transition-colors duration-150 hover:border-border-button-hover hover:bg-background-primary-hover outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring';
  const codeBlock = (title, code, lang, actions = '') => `<section class="cv-file shrink-0 overflow-hidden rounded-xl border border-border-button-default bg-docs-code-background"><header class="flex min-h-10 items-center gap-2 border-b border-separator-border px-3 py-1.5"><span class="min-w-0 flex-1 truncate font-mono text-caption-1-medium text-text-primary" title="${esc(title)}">${esc(title)}</span><span class="font-mono text-caption-2-regular text-text-tertiary uppercase">${esc(lang)}</span>${actions}<button type="button" class="cv-copy ${btnCls} h-7 px-2" data-copy>${ic('file-copy-line', 'size-4')}<span class="cv-label text-body-2-medium">Copy</span></button></header><pre class="scrollbar-thin m-0 max-h-[60vh] overflow-auto p-4 text-[12.5px] leading-5"><code class="hljs font-mono">${hl(code, lang)}</code></pre></section>`;

  /* ------------------------------------------------------------ dialog */
  let dlg = null, state = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = mk('dialog', 'cv-dialog m-0 border-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:h-[min(88vh,900px)] sm:w-[min(94vw,1040px)] sm:rounded-3xl');
    dlg.setAttribute('aria-labelledby', 'cvTitle');
    dlg.innerHTML = `<div class="flex h-full flex-col overflow-hidden bg-background-full text-text-primary shadow-xl sm:rounded-3xl sm:border sm:border-border-button-default">
      <header class="flex flex-col gap-3 border-b border-separator-border px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
        <div class="flex items-start gap-3">
          <div class="flex min-w-0 flex-1 flex-col gap-0.5"><h2 id="cvTitle" class="truncate text-title-3-semibold text-text-primary"></h2><a id="cvDocs" class="w-fit max-w-full truncate font-mono text-caption-1-regular text-text-tertiary underline decoration-transparent underline-offset-2 hover:text-text-secondary hover:decoration-current" target="_blank" rel="noreferrer"></a></div>
          <button type="button" id="cvClose" aria-label="Close" class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-icon-secondary transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">${ic('close-line', 'size-5')}</button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span id="cvMeta" class="min-w-0 truncate text-body-2-regular text-text-tertiary"></span>
          <div id="cvActions" class="ms-auto flex items-center gap-2"></div>
        </div>
      </header>
      <div id="cvBody" class="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6"></div>
    </div>`;
    document.body.append(dlg);
    $('#cvClose', dlg).onclick = () => dlg.close();
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
    dlg.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b && state?.prompt) copy(state.prompt, b); });
    return dlg;
  }
  function render() {
    if (!state) return;
    const body = $('#cvBody', dlg), actions = $('#cvActions', dlg), meta = $('#cvMeta', dlg);
    const { d } = state;
    meta.textContent = `${state.prompt.length.toLocaleString()} characters · Markdown`;
    actions.innerHTML = `<button type="button" class="${btnCls}" data-copy>${ic('file-copy-line', 'size-4')}<span class="cv-label">Copy prompt</span></button><button type="button" id="cvDownload" class="${btnCls}">${ic('download-2-line', 'size-4')}<span>.md</span></button>`;
    $('#cvDownload', dlg).onclick = () => { const a = mk('a'); a.href = URL.createObjectURL(new Blob([state.prompt], { type: 'text/markdown' })); a.download = `${slug(d.group)}-${slug(d.title)}.prompt.md`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    body.innerHTML = codeBlock(`${slug(d.title)}.prompt.md`, state.prompt, 'markdown');
    const pre = body.querySelector('pre'); pre.classList.remove('max-h-[60vh]'); pre.classList.add('whitespace-pre-wrap', 'break-words');
    body.querySelector('.cv-file [data-copy]').remove(); // the header action already copies the prompt
    body.scrollTop = 0;
  }

  async function open(d) {
    ensureDialog();
    state = { d, items: [], note: '', prompt: '' };
    $('#cvTitle', dlg).textContent = `${d.title} · ${d.group}`;
    const docs = $('#cvDocs', dlg); docs.textContent = d.src || ''; docs.href = d.src ? `https://${d.src.split(' ')[0]}` : '#'; docs.hidden = !d.src;
    $('#cvMeta', dlg).textContent = ''; $('#cvActions', dlg).innerHTML = '';
    $('#cvBody', dlg).innerHTML = `<div class="flex flex-1 items-center justify-center py-20 text-body-regular text-text-tertiary">Building the prompt…</div>`;
    if (!dlg.open) { dlg.showModal(); document.documentElement.style.overflow = 'hidden'; }
    const { items, note } = await loadItems(d);
    if (state.d !== d) return;
    const pack = await packDecls(d); if (state.d !== d) return;
    state.demo = demoSource(d, pack.decls); state.items = items; state.note = note || ''; state.prompt = buildPrompt(d, items, note, state.demo);
    render();
  }

  window.SR_CODE = { open, buildPrompt, keyOf };
})();
