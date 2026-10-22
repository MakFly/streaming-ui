/* Streaming demos for the Stream, Chat, Assist, Motion and Dots collections, in vanilla JS
 * (each component's source ships alongside it in public/sources).
 * Default export: (helpers) -> demo[]; it also adds its shared helpers onto h for the packs. */
export default function libDemos(h) {
  'use strict';
  const { mk, $, $$, esc, REDUCE, frame, tick, rnd } = h;

  /* ------------------------------------------------------------ shared bits */
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';      // Stream EASE_OUT
  const EASE_BU = 'cubic-bezier(0.23, 1, 0.32, 1)';      // Chat --ease-out-strong
  const SPRING_SWAP = 'cubic-bezier(0.34, 1.32, 0.64, 1)'; // stiffness 460 / damping 30 approximation
  const SPRING_LAYOUT = 'cubic-bezier(0.22, 1.12, 0.36, 1)';

  // Lucide icons (Stream + Assist import lucide-react).
  const LUCIDE = {
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    'thumbs-down': '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'square-terminal': '<path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    'loader-circle': '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'pencil-line': '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  };
  const lu = (name, cls = 'size-4', sw = 2) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lucide shrink-0 ${cls}">${LUCIDE[name]}</svg>`;

  const words = (s) => s.split(/(\s+)/).filter((w) => w.length);
  async function streamInto(node, text, t, ms = 32) {
    for (const w of words(text)) { node.append(document.createTextNode(w)); if (w.trim()) await t.sleep(ms * rnd(0.6, 1.4)); }
  }
  /** Streams words of a tiny Markdown subset (**bold**, `code`) so markers spanning several words still render. */
  async function mdStream(p, text, t, lo = 26, hi = 46) {
    let host = p;
    for (const w of words(text)) {
      if (!w.trim()) { host.append(document.createTextNode(w)); continue; }
      let rest = w;
      while (rest) {
        const m = rest.match(/\*\*|`/);
        const before = m ? rest.slice(0, m.index) : rest;
        if (before) host.append(document.createTextNode(before));
        if (!m) break;
        if (host === p) { host = m[0] === '**' ? mk('strong', 'font-semibold') : mk('code', 'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]'); p.append(host); }
        else host = p;
        rest = rest.slice(m.index + m[0].length);
      }
      await t.sleep(rnd(lo, hi));
    }
  }
  const setTransition = (el, css) => { el.style.transition = css; };
  async function show(el, from, to, t, css) {
    Object.assign(el.style, from); await frame(); setTransition(el, css); Object.assign(el.style, to);
  }

  /** Stream AgentDisclosure: height/opacity/clip-path/y reveal, 0.22s open, 0.14s close on EASE_OUT. */
  function disclosure(el, open, { openHeight } = {}) {
    el.classList.add('overflow-hidden');
    el.style.transformOrigin = 'top';
    const target = openHeight != null ? openHeight + 'px' : el.scrollHeight + 'px';
    const dur = open ? 0.22 : 0.14;
    if (REDUCE) { el.style.height = open ? (openHeight != null ? target : 'auto') : '0px'; el.style.opacity = open ? '1' : '0'; return; }
    const from = el.style.height === 'auto' || !el.style.height ? el.getBoundingClientRect().height + 'px' : el.style.height;
    el.style.height = from;
    tick(() => {
      el.style.transition = `height ${dur}s ${EASE_OUT}, opacity ${dur}s ${EASE_OUT}, clip-path ${dur}s ${EASE_OUT}, transform ${dur}s ${EASE_OUT}`;
      el.style.height = open ? target : '0px';
      el.style.opacity = open ? '1' : '0';
      el.style.clipPath = open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)';
      el.style.transform = open ? 'translateY(0)' : 'translateY(-4px)';
      el.setAttribute('aria-hidden', String(!open));
      if (open && openHeight == null) setTimeout(() => { if (el.style.opacity === '1') el.style.height = 'auto'; }, dur * 1000 + 40);
    });
  }
  function closedDisclosure(el) { el.classList.add('overflow-hidden'); Object.assign(el.style, { height: '0px', opacity: '0', clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-4px)', transformOrigin: 'top' }); }

  /** Stream ActionSwapText "roll": old label leaves up with blur, new one rises in. */
  function rollSlot(text) {
    const s = mk('span', 'relative -my-[0.08em] inline-grid min-w-0 max-w-full whitespace-nowrap py-[0.08em] align-bottom');
    s.style.clipPath = 'inset(0 -999px)';
    const cur = mk('span', 'col-start-1 row-start-1 inline-block min-w-0 truncate'); cur.textContent = text; s.append(cur);
    s.set = (next) => {
      const old = s.lastElementChild; if (old.textContent === next) return;
      const n = mk('span', 'col-start-1 row-start-1 inline-block min-w-0 truncate'); n.textContent = next;
      if (REDUCE) { old.remove(); s.append(n); return; }
      Object.assign(n.style, { opacity: '0', transform: 'translateY(90%)', filter: 'blur(3px)' }); s.append(n);
      tick(() => {
        old.style.transition = `opacity .14s ${EASE_OUT}, transform .14s ${EASE_OUT}, filter .14s ${EASE_OUT}`;
        Object.assign(old.style, { opacity: '0', transform: 'translateY(-90%)', filter: 'blur(3px)' });
        n.style.transition = `opacity .32s ${SPRING_SWAP}, transform .32s ${SPRING_SWAP}, filter .32s ${SPRING_SWAP}`;
        Object.assign(n.style, { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' });
        setTimeout(() => old.remove(), 180);
      });
    };
    return s;
  }

  const favicon = (url, cls) => {
    const img = `<img src="${esc(new URL('/favicon.ico', url).toString())}" alt="" width="16" height="16" referrerpolicy="no-referrer" class="size-4 rounded-sm object-contain" onerror="this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:${esc(JSON.stringify(lu('globe', 'size-3.5')))}}).firstChild)">`;
    return `<span aria-hidden="true" class="grid shrink-0 place-items-center text-muted-foreground [&>svg]:size-3.5 ${cls || 'size-5'}">${img}</span>`;
  };

  /* ================================================================== Stream */
  function streamShimmer(text, duration = 1.8, cls = '') {
    return `<span class="stream-text-shimmer inline-block font-medium ${cls}" style="animation:stream-text-shimmer ${duration}s linear infinite">${esc(text)}</span>`;
  }
  function streamAction(label, icon, onClick) {
    const b = mk('button', 'grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-[color,background-color,transform] duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-90', lu(icon, 'size-3.5'));
    b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; b.onclick = onClick; return b;
  }
  function citationList(sources) {
    const list = mk('div', 'grid gap-0.5');
    sources.forEach((c, i) => {
      const row = mk('a', 'group/citation flex items-center gap-2 rounded-md px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring');
      row.href = c.url; row.target = '_blank'; row.rel = 'noreferrer noopener';
      row.innerHTML = `${favicon(c.url)}<span class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5"><span class="truncate text-sm font-medium text-foreground/80 transition-colors group-hover/citation:text-foreground">${esc(c.title)}</span><span class="min-w-0 truncate text-xs text-muted-foreground/60">${esc(c.domain)}</span></span><span class="flex shrink-0 items-center gap-1.5"><span class="grid size-5 place-items-center rounded-md bg-foreground/[0.05] text-[10px] font-semibold tabular-nums text-muted-foreground">${i + 1}</span>${lu('external-link', 'size-3.5 text-muted-foreground/40 transition-colors group-hover/citation:text-muted-foreground')}</span>`;
      list.append(row);
    });
    return list;
  }
  const streamStage = (root, cls = 'min-h-[460px]') => { const s = mk('div', `lib-stream flex w-full items-center justify-center rounded-[20px] px-6 py-10 ${cls}`); root.append(s); return s; };

  /* =========================================================== Chat */
  const buStage = (root, cls = '') => { const s = mk('div', `lib-chat chat-stripes flex min-h-[420px] w-full items-center justify-center rounded-[20px] p-6 ${cls}`); root.append(s); return s; };
  const buCard = (cls = '') => mk('div', `chat-card w-full max-w-[400px] rounded-[14px] bg-surface p-4 ${cls}`);

  /* ============================================================= Dots */
  function dotGrid(t, kind, { size = 36, dot = 5, speed } = {}) {
    const g = Math.max(1, Math.floor((size - dot * 5) / 4));
    const root = mk('span', 'dots-root'); root.setAttribute('role', 'img'); root.setAttribute('aria-label', 'Loading');
    const grid = mk('span', 'dots-grid'); grid.style.cssText = `width:${size}px;height:${size}px;gap:${g}px`;
    const dots = [];
    for (let i = 0; i < 25; i++) {
      const row = Math.floor(i / 5), col = i % 5; const d = mk('span', 'dots-dot'); d.style.cssText = `width:${dot}px;height:${dot}px;place-self:center`;
      if (kind === 'square-1') {
        const sp = speed ?? 1.1, scale = 1 / sp; const path = (row + (4 - col)) / 8; const parity = (row + (4 - col)) % 2;
        d.classList.add('dots-diagonal-alt-sweep');
        d.style.animationDuration = `${1500 * scale}ms`;
        d.style.animationDelay = `${(path * 0.2 + parity * 0.5) * 1500 * scale}ms`;
        if (REDUCE) { d.style.animation = 'none'; d.style.opacity = parity === 0 ? '0.88' : '0.14'; }
      }
      if (kind === 'circular-5' && ((row === 0 || row === 4) && (col === 0 || col === 4))) d.style.visibility = 'hidden';
      grid.append(d); dots.push({ d, row, col });
    }
    root.append(grid);
    if (kind === 'circular-5') {
      const sp = speed ?? 1.7; const cycle = 1650 / sp; const t0 = performance.now();
      const paint = () => {
        const phase = REDUCE ? 0 : ((performance.now() - t0) % cycle) / cycle; const theta = phase * Math.PI * 2;
        for (const { d, row, col } of dots) {
          if ((row === 0 || row === 4) && (col === 0 || col === 4)) continue;
          const x = col - 2, y = row - 2, r = Math.hypot(x, y), a = Math.atan2(y, x);
          const pin = Math.cos(a * 4 - theta * 2.2), gate = Math.sin(r * 2.1 - theta * 1.25);
          d.style.opacity = r < 0.6 ? 0.66 : pin > 0.48 && gate > -0.25 ? 0.94 : pin > 0.1 ? 0.34 : 0.08;
        }
      };
      paint(); if (!REDUCE) t.every(33, paint);
    }
    return root;
  }

  // Share these with the packs in libs/*.js (they receive the same `h`).
  Object.assign(h, { LUCIDE, lu, words, streamInto, mdStream, show, disclosure, closedDisclosure, rollSlot, favicon, dotGrid,
    streamShimmer, streamAction, citationList, streamStage, buStage, buCard, EASE_OUT, EASE_BU, SPRING_SWAP, SPRING_LAYOUT });

  /* ============================================================== demos */
  return [
    /* ---------------------------------------------------------- Stream 1 */
    { group: 'Stream', title: 'Streaming Response', desc: 'A stable response surface: rich content streams in with links, lists and code intact, then completion actions and an expandable source summary settle underneath.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root);
        const wrap = mk('div', 'w-full max-w-xl'); stage.append(wrap);
        const resp = mk('div', 'w-full'); resp.dataset.state = 'streaming'; resp.setAttribute('aria-busy', 'true'); wrap.append(resp);
        const body = mk('div', 'stream-prose text-sm leading-6 text-foreground/90'); body.setAttribute('aria-live', 'polite'); resp.append(body);
        const blocks = [
          ['p', [['A streaming response can link directly to '], ['a', "Motion's React guide", 'https://motion.dev/docs/react'], [' while the rest of the answer continues to arrive.']]],
          ['p', [['The same response can preserve useful structure:']]],
          ['ul', ['Links stay interactive as nearby text streams', 'Lists keep their spacing and hierarchy', 'Code remains readable without shifting the response']],
          ['p', [['Set '], ['code', 'aria-busy'], [' while new content is still arriving.']]],
          ['pre', 'const status = complete ? "ready" : "streaming";'],
        ];
        await t.sleep(400);
        for (const [tag, parts] of blocks) {
          const el = mk(tag); body.append(el);
          if (tag === 'ul') { for (const li of parts) { const l = mk('li'); el.append(l); await streamInto(l, li, t); } continue; }
          if (tag === 'pre') { const c = mk('code'); el.append(c); for (const ch of parts) { c.textContent += ch; await t.sleep(14); } continue; }
          for (const [kind, text, href] of parts) {
            if (kind === 'a') { const a = mk('a'); a.href = href; a.target = '_blank'; a.rel = 'noreferrer noopener'; el.append(a); await streamInto(a, text, t); }
            else if (kind === 'code') { const c = mk('code'); el.append(c); await streamInto(c, text, t); }
            else await streamInto(el, kind, t);
          }
        }
        resp.dataset.state = 'complete'; resp.setAttribute('aria-busy', 'false');
        const sources = [
          { title: 'Motion for React', domain: 'motion.dev', url: 'https://motion.dev/docs/react' },
          { title: 'ARIA: aria-busy attribute', domain: 'developer.mozilla.org', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy' },
          { title: 'Rendering lists', domain: 'react.dev', url: 'https://react.dev/learn/rendering-lists' },
        ];
        const foot = mk('div', 'mt-3'); resp.append(foot);
        const bar = mk('div', 'flex items-center gap-0.5'); foot.append(bar);
        let copied = false;
        const copyBtn = streamAction('Copy response', 'copy', () => { if (copied) return; copied = true; copyBtn.innerHTML = lu('check', 'size-3.5'); copyBtn.title = 'Copied'; setTimeout(() => { copied = false; copyBtn.innerHTML = lu('copy', 'size-3.5'); copyBtn.title = 'Copy response'; }, 1600); });
        const fb = {}; const feedback = (k) => () => { for (const key of ['up', 'down']) fb[key].classList.toggle('bg-muted', key === k && !fb[key].classList.contains('bg-muted')); for (const key of ['up', 'down']) fb[key].classList.toggle('text-foreground', fb[key].classList.contains('bg-muted')); };
        fb.up = streamAction('Helpful', 'thumbs-up', feedback('up')); fb.down = streamAction('Not helpful', 'thumbs-down', feedback('down'));
        bar.append(copyBtn, streamAction('Retry response', 'rotate-ccw', () => {}), fb.up, fb.down);
        const srcBtn = mk('button', 'group ml-1 inline-flex min-h-7 items-center gap-2 rounded-md px-1.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring');
        srcBtn.type = 'button'; srcBtn.setAttribute('aria-expanded', 'false');
        srcBtn.innerHTML = `<span aria-hidden="true" class="flex -space-x-1.5">${sources.map((s) => favicon(s.url, 'size-6 rounded-full bg-background ring-2 ring-background')).join('')}</span><span class="tabular-nums">${sources.length} sources</span><span aria-hidden="true" class="sui-chev inline-flex text-muted-foreground/50 transition-transform duration-300 group-hover:text-muted-foreground" style="transition-timing-function:${SPRING_SWAP}">${lu('chevron-down', 'size-3')}</span>`;
        bar.append(srcBtn);
        const disc = mk('div'); closedDisclosure(disc); const list = citationList(sources); list.classList.add('mt-2', 'rounded-xl', 'bg-muted', 'p-2'); disc.append(list); foot.append(disc);
        let open = false; srcBtn.onclick = () => { open = !open; srcBtn.setAttribute('aria-expanded', open); $('.sui-chev', srcBtn).style.transform = `rotate(${open ? 180 : 0}deg)`; disclosure(disc, open); if (open) $$('a', list).forEach((a, i) => show(a, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .18s ${EASE_OUT} ${i * 40}ms, transform .45s ${SPRING_LAYOUT} ${i * 40}ms`)); };
        await show(foot, { opacity: '0', transform: 'translateY(4px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EASE_OUT}, transform .22s ${EASE_OUT}`);
        await t.sleep(1100); srcBtn.click(); await t.sleep(4200);
      } },

    /* ---------------------------------------------------------- Stream 2 */
    { group: 'Stream', title: 'Reasoning Text', desc: 'The agent\'s status line while it works: phrases cycle every 1.8s under a travelling shimmer, beside a terminal-style ASCII loader. Three transitions — per-letter cascade, swap and scramble.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const col = mk('div', 'flex flex-col gap-6'); stage.append(col);
        const PHRASES = ['Thinking', 'Reading the context', 'Connecting the details', 'Forming a response'];
        const longest = PHRASES.reduce((a, b) => (b.length > a.length ? b : a));
        const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/';
        const shimmerCls = 'stream-text-shimmer';
        const shimmerStyle = 'animation:stream-text-shimmer 2.2s linear infinite';
        for (const variant of ['cascade', 'swap', 'scramble']) {
          const row = mk('div', 'flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-4');
          row.innerHTML = `<span class="font-mono text-[11px] text-muted-foreground/60 sm:w-16">${variant}</span>`;
          const status = mk('span', 'inline-flex items-center gap-2 text-sm font-medium text-muted-foreground'); status.setAttribute('role', 'status');
          const ind = mk('span', 'inline-flex size-3 shrink-0 items-center justify-center'); ind.setAttribute('aria-hidden', 'true');
          const glyph = mk('span', 'font-mono leading-none tabular-nums'); glyph.style.cssText = 'font-size:14px;line-height:1'; glyph.textContent = '|'; ind.append(glyph);
          const frames = ['|', '/', '-', '\\']; let f = 0; t.every((0.8 / frames.length) * 1000 * (REDUCE ? 2.5 : 1), () => { f = (f + 1) % frames.length; glyph.textContent = frames[f]; });
          const gridEl = mk('span', 'grid overflow-hidden text-left'); gridEl.setAttribute('aria-hidden', 'true');
          gridEl.innerHTML = `<span class="invisible col-start-1 row-start-1 whitespace-nowrap">${esc(longest)}…</span>`;
          status.append(ind, gridEl); row.append(status); col.append(row);
          let i = 0;
          const render = (phrase, first) => {
            const text = phrase + '…';
            const prev = $$('[data-phrase]', gridEl);
            if (variant === 'cascade') {
              const p = mk('span', 'col-start-1 row-start-1 inline-block justify-self-start whitespace-pre'); p.dataset.phrase = '';
              [...text].forEach((ch, ci) => { const c = mk('span', `inline-block whitespace-pre ${shimmerCls}`); c.style.cssText = shimmerStyle; c.textContent = ch; if (!first && !REDUCE) { Object.assign(c.style, { opacity: '0', transform: 'translateY(100%)' }); tick(() => { c.style.transition = `opacity .42s ${SPRING_SWAP} ${ci * 0.025}s, transform .42s ${SPRING_SWAP} ${ci * 0.025}s`; c.style.opacity = '1'; c.style.transform = 'translateY(0)'; }); } p.append(c); });
              prev.forEach((o) => { [...o.children].forEach((c, ci) => { c.style.transition = `opacity .14s ${EASE_OUT} ${ci * 0.025 * 0.45}s, transform .14s ${EASE_OUT} ${ci * 0.025 * 0.45}s`; c.style.opacity = '0'; c.style.transform = 'translateY(-100%)'; }); setTimeout(() => o.remove(), 900); });
              gridEl.append(p);
            } else if (variant === 'swap') {
              const p = mk('span', `col-start-1 row-start-1 inline-block justify-self-start whitespace-nowrap ${shimmerCls}`); p.dataset.phrase = ''; p.style.cssText = shimmerStyle; p.textContent = text;
              if (!first) { Object.assign(p.style, { opacity: '0', transform: 'translateY(3px)' }); tick(() => { p.style.transition = `opacity .2s ${EASE_OUT}, transform .2s ${EASE_OUT}`; p.style.opacity = '1'; p.style.transform = 'none'; }); }
              prev.forEach((o) => { o.style.transition = `opacity .2s ${EASE_OUT}, transform .2s ${EASE_OUT}`; o.style.opacity = '0'; o.style.transform = 'translateY(-3px)'; setTimeout(() => o.remove(), 240); });
              gridEl.append(p);
            } else {
              let p = prev[0];
              if (!p) { p = mk('span', `col-start-1 row-start-1 inline-block justify-self-start whitespace-pre tabular-nums ${shimmerCls}`); p.dataset.phrase = ''; p.style.cssText = shimmerStyle; gridEl.append(p); }
              if (first || REDUCE) { p.textContent = text; return; }
              const chars = [...text]; const dur = Math.min(760, Math.max(420, chars.length * 32)); const t0 = performance.now();
              const id = t.every(40, () => { const prog = Math.min((performance.now() - t0) / dur, 1); const settled = Math.floor(prog * chars.length); p.textContent = chars.map((c, k) => (k < settled || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''); if (prog >= 1) { t.stop(id); p.textContent = text; } });
            }
          };
          render(PHRASES[0], true);
          t.every(1800, () => { i = (i + 1) % PHRASES.length; render(PHRASES[i], false); });
        }
        await t.sleep(14800);
      } },

    /* ---------------------------------------------------------- Stream 3 */
    { group: 'Stream', title: 'Agent Activity', desc: 'A chronological feed of what the agent is doing — thinking, web searches with results, file reads, edits and commands — gliding upward inside a fixed viewport while it runs, then folding into a one-line summary.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[440px]');
        const wrap = mk('div', 'w-full max-w-md'); stage.append(wrap);
        const box = mk('div', 'w-full text-sm'); box.setAttribute('aria-busy', 'true'); wrap.append(box);
        const head = mk('div', 'flex h-7 min-w-0 items-center text-muted-foreground'); head.setAttribute('role', 'status'); head.innerHTML = streamShimmer('Working through it…'); box.append(head);
        const MAX = 208;
        const disc = mk('div', 'overflow-hidden'); disc.style.height = MAX + 'px'; box.append(disc);
        const vp = mk('div', 'scrollbar-hide overflow-y-hidden pr-1'); vp.style.height = MAX + 'px'; disc.append(vp);
        const list = mk('div', 'space-y-0.5 py-2'); list.setAttribute('role', 'list'); list.style.transition = `transform .55s ${SPRING_LAYOUT}`; vp.append(list);
        const reflow = () => { const ch = list.offsetHeight; const capped = ch > MAX; list.style.transform = `translateY(${Math.min(0, MAX - ch)}px)`; const m = capped ? 'linear-gradient(to bottom, transparent, black 12px)' : ''; vp.style.maskImage = m; vp.style.webkitMaskImage = m; };
        const enter = async (el) => { list.append(el); await show(el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .18s ${EASE_OUT}, transform .5s ${SPRING_LAYOUT}`); reflow(); };
        const traceRow = (icon, label, detail) => { const r = mk('div', 'grid min-h-8 grid-cols-[1rem_auto_minmax(0,1fr)] items-center gap-2.5 rounded-md px-1.5 py-0.5'); r.setAttribute('role', 'listitem'); r.innerHTML = `<span aria-hidden="true" class="grid size-4 place-items-center text-muted-foreground/70">${lu(icon)}</span><span class="font-medium text-foreground/90">${esc(label)}</span>${detail ? `<span class="min-w-0 truncate rounded-lg bg-muted/80 px-2.5 py-1 font-mono text-xs text-muted-foreground/70">${esc(detail)}</span>` : '<span></span>'}`; return r; };
        const toolRow = (action, target, add, del) => { const r = mk('div', 'flex min-h-8 min-w-0 items-center gap-2.5 rounded-md px-1.5 py-0.5 leading-5'); r.setAttribute('role', 'listitem'); const icon = action === 'read' ? 'file-text' : action === 'edit' ? 'pencil-line' : 'square-terminal'; r.innerHTML = `<span aria-hidden="true" class="grid size-4 shrink-0 place-items-center text-muted-foreground/70">${lu(icon)}</span><span class="shrink-0 font-medium text-foreground/90">${action[0].toUpperCase() + action.slice(1)}</span><span class="min-w-0 flex-1 truncate rounded-lg bg-muted/80 px-2.5 py-1 font-mono text-xs text-muted-foreground/70">${esc(target)}</span>${add != null ? `<span class="flex shrink-0 items-center gap-2 font-mono tabular-nums"><span class="text-emerald-500">+${add}</span><span class="text-rose-500">−${del}</span></span>` : ''}`; return r; };
        const t0 = performance.now();
        await t.sleep(500);
        await enter(traceRow('sparkles', 'Thinking', 'Plan the timeline animation fix')); await t.sleep(900);
        const search = mk('div', 'space-y-0.5'); search.setAttribute('role', 'listitem');
        search.innerHTML = `<div class="flex min-h-7 items-center gap-2.5 rounded-md px-1.5 py-1 text-muted-foreground">${lu('search', 'size-4', 1.7)}<span class="min-w-0 truncate">motion react layout animation stagger</span></div><div class="sui-res space-y-0.5 pl-4"></div>`;
        await enter(search);
        const results = [['Layout animations', 'motion.dev', 'https://motion.dev/docs/react-layout-animations'], ['Stagger', 'motion.dev', 'https://motion.dev/docs/stagger'], ['useLayoutEffect', 'react.dev', 'https://react.dev/reference/react/useLayoutEffect']];
        for (const [title, domain, url] of results) { await t.sleep(420); const r = mk('a', 'flex min-h-7 items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring'); r.href = url; r.target = '_blank'; r.rel = 'noreferrer'; r.innerHTML = `${favicon(url)}<span class="min-w-0 truncate font-medium text-foreground/90">${esc(title)}</span><span class="min-w-0 truncate text-muted-foreground/55">${esc(domain)}</span>`; $('.sui-res', search).append(r); await show(r, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .18s ${EASE_OUT}, transform .5s ${SPRING_LAYOUT}`); reflow(); }
        await t.sleep(300); const more = mk('div', 'px-1.5 py-1 pl-8 text-muted-foreground/55', '+4 more'); search.append(more); reflow();
        await t.sleep(800); await enter(toolRow('read', 'src/components/timeline.tsx'));
        await t.sleep(900); await enter(toolRow('edit', 'src/components/timeline.tsx', 42, 8));
        await t.sleep(900); await enter(toolRow('run', 'bun run test'));
        await t.sleep(1000); await enter(traceRow('message-square', 'Message', 'Explained the stagger change'));
        await t.sleep(1100);
        const n = list.children.length; const secs = Math.round((performance.now() - t0) / 1000);
        box.setAttribute('aria-busy', 'false');
        const btn = mk('button', 'group flex h-7 min-w-0 items-center gap-1.5 rounded-md text-left font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring');
        btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = `<span class="truncate">Completed ${n} steps</span><span aria-hidden="true" class="sui-chev inline-flex shrink-0 text-muted-foreground/70 transition-transform duration-300 group-hover:text-foreground" style="transition-timing-function:${SPRING_SWAP}">${lu('chevron-down', 'size-3.5')}</span>`;
        head.replaceWith(btn); btn.title = `${secs}s`;
        list.style.transform = 'translateY(0)'; vp.classList.replace('overflow-y-hidden', 'overflow-y-auto');
        const capH = Math.min(list.offsetHeight, MAX); vp.style.height = capH + 'px'; vp.style.maskImage = vp.style.webkitMaskImage = list.offsetHeight > MAX ? 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)' : '';
        disclosure(disc, false);
        let open = false; btn.onclick = () => { open = !open; btn.setAttribute('aria-expanded', open); $('.sui-chev', btn).style.transform = `rotate(${open ? 180 : 0}deg)`; vp.scrollTop = 0; disclosure(disc, open, { openHeight: capH }); };
        const ans = mk('div', 'stream-prose mt-2 text-sm leading-6 text-foreground/90'); const p = mk('p'); ans.append(p); wrap.append(ans);
        await t.sleep(260);
        await streamInto(p, 'Fixed. The timeline items now animate with a 40 ms stagger driven by layout position, so reordering no longer snaps. Tests pass.', t, 36);
        await t.sleep(3800);
      } },

    /* ---------------------------------------------------------- Stream 4 */
    { group: 'Stream', title: 'Tool Result', desc: 'A tool call as it runs: the output log streams and follows itself, status, title and meta roll to their final values, and the panel folds away once the call completes.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[440px]');
        const col = mk('div', 'flex w-full max-w-xl flex-col gap-2'); stage.append(col);
        const STATUS = { running: ['Running', 'text-blue-600 dark:text-blue-400', 'loader-circle'], success: ['Completed', 'text-emerald-600 dark:text-emerald-400', 'circle-check'] };
        function toolResult({ kind, tool, title, meta }) {
          const el = mk('div', 'w-full text-sm'); el.dataset.state = 'running'; el.setAttribute('aria-busy', 'true');
          const trig = mk('button', 'group flex min-h-9 w-full items-center gap-2 rounded-md py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'); trig.type = 'button'; trig.setAttribute('aria-expanded', 'true');
          const titleS = rollSlot(title), metaS = rollSlot(meta), toolS = rollSlot(tool), statS = rollSlot('Running');
          const iconWrap = mk('span', 'grid size-4 shrink-0 place-items-center text-muted-foreground', lu(kind === 'terminal' ? 'square-terminal' : 'braces')); iconWrap.setAttribute('aria-hidden', 'true');
          const mid = mk('span', 'flex min-w-0 flex-1 items-baseline gap-2');
          const a = mk('span', 'min-w-0 truncate font-medium text-foreground/90'); a.append(titleS);
          const b = mk('span', 'min-w-0 truncate text-xs text-muted-foreground/60'); b.append(metaS);
          const c = mk('span', 'min-w-0 truncate font-mono text-[11px] text-muted-foreground/55'); c.append(toolS);
          mid.append(a, b, c);
          const stat = mk('span', `inline-flex shrink-0 items-center gap-1 text-[11px] font-medium ${STATUS.running[1]}`);
          const sIcon = mk('span', 'inline-flex', lu('loader-circle', 'size-3 animate-spin')); stat.append(sIcon, statS);
          const chev = mk('span', 'shrink-0 text-muted-foreground/50 transition-[transform,color] duration-300 group-hover:text-muted-foreground', lu('chevron-down', 'size-3.5')); chev.style.transform = 'rotate(180deg)'; chev.style.transitionTimingFunction = SPRING_SWAP;
          trig.append(iconWrap, mid, stat, chev);
          const disc = mk('div', 'overflow-hidden'); disc.style.height = 'auto';
          const inner = mk('div', 'pl-6 pt-1.5'); const panel = mk('div', 'overflow-hidden rounded-xl bg-muted/80');
          const vp = mk('div', 'scrollbar-hide overflow-y-auto'); vp.style.maxHeight = '220px'; vp.setAttribute('role', 'log');
          const pre = mk('pre', 'm-0 overflow-x-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5 text-foreground/80'); vp.append(pre);
          const foot = mk('div', 'flex items-center gap-0.5 px-2 pb-1.5'); const footStat = rollSlot('Running');
          foot.append(streamAction('Copy result', 'copy', () => {}), streamAction('Run again', 'rotate-ccw', () => {})); const fs = mk('span', 'ml-auto text-[11px] text-muted-foreground/55'); fs.append(footStat); foot.append(fs);
          panel.append(vp, foot); inner.append(panel); disc.append(inner); el.append(trig, disc);
          let open = true; trig.onclick = () => { open = !open; trig.setAttribute('aria-expanded', open); chev.style.transform = `rotate(${open ? 180 : 0}deg)`; disclosure(disc, open); };
          return {
            el, pre, vp,
            async line(text, cls = '') { const s = mk('span', `block ${cls}`); s.textContent = text; pre.append(s); vp.scrollTo({ top: vp.scrollHeight, behavior: REDUCE ? 'auto' : 'smooth' }); },
            finish(next) {
              el.dataset.state = 'success'; el.setAttribute('aria-busy', 'false');
              stat.className = `inline-flex shrink-0 items-center gap-1 text-[11px] font-medium ${STATUS.success[1]}`; sIcon.innerHTML = lu('circle-check', 'size-3');
              statS.set('Completed'); footStat.set('Completed'); titleS.set(next.title); metaS.set(next.meta);
              setTimeout(() => { open = false; trig.setAttribute('aria-expanded', 'false'); chev.style.transform = 'rotate(0deg)'; disclosure(disc, false); }, 900);
            },
          };
        }
        await t.sleep(400);
        const a = toolResult({ kind: 'terminal', tool: 'bash', title: 'Running tests', meta: 'bun test' }); col.append(a.el);
        await show(a.el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .2s ${EASE_OUT}, transform .4s ${SPRING_LAYOUT}`);
        const LOG = [['$ bun test', 'text-foreground/90'], ['bun test v1.2.19'], [''], ['src/timeline.test.tsx:'], ['✓ renders items in order [2.10ms]', 'text-emerald-600 dark:text-emerald-400'], ['✓ staggers by layout position [4.83ms]', 'text-emerald-600 dark:text-emerald-400'], ['✓ respects reduced motion [1.02ms]', 'text-emerald-600 dark:text-emerald-400'], [''], ['src/agent-activity.test.tsx:'], ['✓ collapses on complete [3.41ms]', 'text-emerald-600 dark:text-emerald-400'], ['✓ glides when capped [2.77ms]', 'text-emerald-600 dark:text-emerald-400'], [''], [' 42 pass'], [' 0 fail'], ['Ran 42 tests across 9 files. [1.84s]']];
        for (const [l, c] of LOG) { await a.line(l, c); await t.sleep(l ? rnd(140, 320) : 80); }
        await t.sleep(300); a.finish({ title: 'Tests passed', meta: '42 passed · 1.8s' });
        await t.sleep(1200);
        const b = toolResult({ kind: 'request', tool: 'GET /api/releases', title: 'Fetching releases', meta: 'api.github.com' }); col.append(b.el);
        await show(b.el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .2s ${EASE_OUT}, transform .4s ${SPRING_LAYOUT}`);
        const JSONL = ['{', '  "repo": "motiondivision/motion",', '  "latest": "12.23.0",', '  "published": "2026-10-14",', '  "assets": 3,', '  "notes": "Layout animations now respect transform-origin"', '}'];
        for (const l of JSONL) { await b.line(l); await t.sleep(rnd(160, 300)); }
        await t.sleep(300); b.finish({ title: 'Fetched releases', meta: '200 · 212 ms' });
        await t.sleep(4000);
      } },

    /* --------------------------------------------------- Chat 1 */
    { group: 'Chat', title: 'Streaming Text', desc: 'Words resolve one by one, an inline source chip pops in mid-sentence, then the action row, a sources stack and two follow-up prompts become usable.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const card = buCard(); stage.append(card);
        const IMG = {
          scoop: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%231f7a5f'/%3E%3Cpath d='M20 36c0 7 5.4 12 12 12s12-5 12-12H20Z' fill='%23fff'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23bff3dd'/%3E%3Cpath d='M24 24c4-7 13-7 17 0' fill='none' stroke='%231f7a5f' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E",
          trends: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%232f6fec'/%3E%3Cpath d='M15 43 27 31l8 7 14-18' fill='none' stroke='%23fff' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='49' cy='20' r='5' fill='%23bfe0ff'/%3E%3C/svg%3E",
          market: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23e56d24'/%3E%3Cpath d='M17 45V25h8v20h-8Zm11 0V16h8v29h-8Zm11 0V30h8v15h-8Z' fill='%23fff'/%3E%3Cpath d='M16 49h32' stroke='%23ffd6b8' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E",
        };
        const SOURCES = [{ name: 'Scoop Data', domain: 'scoopdata.io', href: 'https://scoopdata.io/', image: IMG.scoop }, { name: 'Trends Index', domain: 'trends.google.com', href: 'https://trends.google.com/trends/', image: IMG.trends }, { name: 'Market Basket', domain: 'marketbasket.io', href: 'https://marketbasket.io/', image: IMG.market }];
        const TOKENS = [...'Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points.'.split(' ').map((text) => ({ text })), { cite: true }, ...'Stone-fruit flavors are trending in the same range.'.split(' ').map((text) => ({ text }))];
        const wrap = mk('div', 'min-h-[15.5rem] w-full'); card.append(wrap);
        const p = mk('p', 'text-[13px] leading-relaxed text-ink'); wrap.append(p);
        const caret = mk('span', 'ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink'); caret.style.animation = 'chat-fade-in 150ms ease-out both'; p.append(caret);
        const ICONS = ['<g><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g>', '<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>', '<path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z"/>', '<path d="M17 14V2M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88z"/>'];
        const actions = mk('div', 'mt-2 flex items-center gap-0.5 transition-opacity duration-[400ms]'); actions.style.opacity = '0'; actions.style.pointerEvents = 'none';
        actions.innerHTML = ICONS.map((i) => `<button type="button" aria-label="Action" class="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover-2 hover:text-ink-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${i}</svg></button>`).join('')
          + `<button type="button" aria-expanded="false" class="chat-src ml-1.5 flex items-center gap-1.5 rounded-[6px] px-1 py-0.5 text-left transition-colors duration-150 hover:bg-hover"><span class="flex -space-x-1">${SOURCES.map((s) => `<img src="${s.image}" alt="" class="chat-source-avatar size-3.5 rounded-full bg-surface" style="box-shadow:0 0 0 1.5px var(--canvas)">`).join('')}</span><span class="text-[12px] text-ink-2">10 sources</span></button>`;
        wrap.append(actions);
        const srcGrid = mk('div', 'grid transition-[grid-template-rows,opacity] duration-300'); Object.assign(srcGrid.style, { gridTemplateRows: '0fr', opacity: '0', transitionTimingFunction: EASE_BU });
        srcGrid.innerHTML = `<div class="overflow-hidden"><div class="mt-1.5 flex flex-col rounded-[10px] bg-inset p-1 chat-hairline">${SOURCES.map((s) => `<a href="${s.href}" target="_blank" rel="noreferrer" class="flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-[12px] text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"><img src="${s.image}" alt="" class="chat-source-avatar size-4 rounded-[4px]"><span class="chat-underline">${s.name}</span><span class="ml-auto font-mono text-[10.5px] text-ink-3">${s.domain}</span></a>`).join('')}</div></div>`;
        wrap.append(srcGrid);
        let srcOpen = false; $('.chat-src', actions).onclick = () => { srcOpen = !srcOpen; $('.chat-src', actions).setAttribute('aria-expanded', srcOpen); srcGrid.style.gridTemplateRows = srcOpen ? '1fr' : '0fr'; srcGrid.style.opacity = srcOpen ? '1' : '0'; };
        const fu = mk('div', 'mt-2.5 transition-opacity duration-[400ms]'); fu.style.opacity = '0'; fu.style.pointerEvents = 'none';
        fu.innerHTML = `<p class="text-[12px] font-medium text-ink-2">Follow-ups</p><div class="mt-0.5 flex flex-col">${['Which flavors sell best in winter', 'Compare gelato and soft serve margins'].map((x) => `<button class="chat-fu -mx-1.5 flex items-center gap-2 rounded-[7px] border-b border-line px-1.5 py-1.5 text-left text-[12.5px] text-ink transition-colors duration-100 hover:bg-hover-2" style="opacity:0"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>${x}</button>`).join('')}</div>`;
        wrap.append(fu);
        await t.sleep(300);
        for (const tok of TOKENS) {
          if (tok.cite) { const s = SOURCES[0]; caret.insertAdjacentHTML('beforebegin', `<a href="${s.href}" target="_blank" rel="noreferrer" class="ml-0 mr-1 inline-flex h-[18px] translate-y-[-1px] items-center gap-1 rounded-[5px] bg-inset pr-[3px] pl-[3px] align-middle font-mono text-[10.5px] text-ink-2 chat-hairline transition-colors duration-150 hover:bg-hover hover:text-ink" style="animation:chat-pop-in 250ms ${EASE_BU} both"><img src="${s.image}" alt="" class="chat-source-avatar size-3 rounded-[3px]"><span>${s.domain}</span></a>`); }
          else { const s = mk('span', 'inline'); s.textContent = tok.text + ' '; caret.before(s); }
          await t.sleep(55);
        }
        caret.remove();
        for (const el of [actions, fu]) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
        $$('.chat-fu', fu).forEach((b, i) => { b.style.animation = `chat-fade-up 350ms ${EASE_BU} ${i * 90}ms both`; });
        await t.sleep(900); $('.chat-src', actions).click(); await t.sleep(3400);
      } },

    /* --------------------------------------------------- Chat 2 */
    { group: 'Chat', title: 'Thinking State', desc: 'An expandable agent trace in four variants — Steps, Reasoning, Search and Coding. It opens while the agent works, rows fade up as they land, the header shimmers, then it settles to a past-tense summary.', kind: 'lib',
      async run(root, t, ctx) {
        const VARIANTS = {
          Steps: { active: 'Thinking', done: 'Thought for 4 seconds', rows: [{ primary: 'Reading flavor briefs' }, { primary: 'Scanning supplier lists' }, { primary: 'Comparing tasting notes', secondary: '6 flavors' }, { primary: 'Writing the scoop report' }] },
          Reasoning: { active: 'Thinking', done: 'Thought for 4 seconds', rows: [{ primary: 'Summer demand spikes for stone-fruit flavors — peach and apricot lead.' }, { primary: 'I should check cone inventory before promoting a waffle-bowl special.' }] },
          Search: { active: 'Searching the web', done: 'Searched the web', query: 'best waffle cone supplier', rows: [{ primary: 'Joy Cone', secondary: 'joycone.com', href: 'https://joycone.com/' }, { primary: 'WebstaurantStore', secondary: 'webstaurantstore.com', href: 'https://www.webstaurantstore.com/' }, { primary: 'The Konery', secondary: 'thekonery.com', href: 'https://www.thekonery.com/' }] },
          Coding: { active: 'Running tools', done: 'Ran 3 tools', rows: [{ primary: 'Read', secondary: 'flavors.ts', mono: true }, { primary: 'Edit', secondary: 'ChurnSchedule.tsx', mono: true, add: 74, del: 41 }, { primary: 'Run', secondary: 'npm run freeze', mono: true }] },
        };
        const names = Object.keys(VARIANTS);
        ctx.variant = ctx.variant == null ? 0 : (ctx.variant + 1) % names.length;
        const variant = names[ctx.variant]; const v = VARIANTS[variant];
        const stage = buStage(root, 'flex-col gap-4');
        const seg = mk('div', 'inline-flex max-w-full overflow-x-auto rounded-[8px] bg-hover-2 p-0.5 text-[12px] scrollbar-hide');
        names.forEach((n, i) => { const b = mk('button', `rounded-[6px] px-2.5 py-1 font-medium transition-colors ${n === variant ? 'bg-surface text-ink chat-btn-shadow' : 'text-ink-2 hover:text-ink'}`, n); b.type = 'button'; b.onclick = () => { ctx.variant = i - 1; ctx.restart(); }; seg.append(b); });
        const card = buCard(); stage.append(seg, card);
        const box = mk('div', 'flex w-full flex-col'); box.style.minHeight = '176px'; box.style.transition = `min-height 400ms ${EASE_BU}`; card.append(box);
        const btn = mk('button', '-mx-1.5 flex w-fit items-center gap-2 rounded-[8px] px-1.5 py-1 transition-colors duration-100 hover:bg-hover-2'); btn.type = 'button';
        btn.innerHTML = `<svg class="chat-spark" width="16" height="16" viewBox="0 0 24 24" fill="var(--ink-2)"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg><span role="status" class="contents"><span class="chat-label bg-clip-text text-[13px] font-medium whitespace-nowrap text-transparent" style="background-image:linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%);background-size:200% 100%;animation:chat-shimmer-text 1.4s linear infinite">${esc(v.active)}</span></span><svg class="chat-chev transition-transform duration-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
        const gridEl = mk('div', 'grid transition-[grid-template-rows,opacity] duration-[400ms]'); Object.assign(gridEl.style, { gridTemplateRows: '0fr', opacity: '0', transitionTimingFunction: EASE_BU });
        gridEl.innerHTML = '<div class="overflow-hidden"><div class="relative mt-1 ml-[5px] pl-4"><span aria-hidden="true" class="chat-line absolute left-[3px] w-px bg-line" style="top:-8px;height:0;transition:height 500ms cubic-bezier(0.23,1,0.32,1)"></span><div class="chat-trace flex flex-col gap-1 py-1"></div></div></div>';
        box.append(btn, gridEl);
        const trace = $('.chat-trace', gridEl), line = $('.chat-line', gridEl);
        let manual = null, auto = false, working = true;
        const apply = () => { const ex = manual ?? auto; btn.setAttribute('aria-expanded', ex); gridEl.style.gridTemplateRows = ex ? '1fr' : '0fr'; gridEl.style.opacity = ex ? '1' : '0'; $('.chat-chev', btn).style.transform = ex ? 'rotate(180deg)' : 'rotate(0)'; box.style.minHeight = working || ex ? '176px' : ''; tick(() => { line.style.height = trace.offsetHeight ? trace.offsetHeight - 2 + 'px' : '0'; }); };
        btn.onclick = () => { manual = !(manual ?? auto); apply(); };
        const TONES = ['var(--accent)', 'var(--orange)', 'var(--green)'];
        const rowEl = (row, i, isLast) => {
          const tag = variant === 'Search' ? 'a' : variant === 'Coding' ? 'button' : 'div';
          const r = mk(tag, `flex min-h-7 w-full items-center gap-2 rounded-[6px] px-1.5 py-0.5 text-left ${tag !== 'div' ? 'transition-colors duration-150 hover:bg-hover' : ''}`);
          if (tag === 'a') { r.href = row.href; r.target = '_blank'; r.rel = 'noreferrer'; }
          r.style.animation = `chat-fade-up 320ms ${EASE_BU} ${i * 120}ms both`;
          let lead = '';
          if (variant === 'Search') lead = `<span class="flex size-3.5 shrink-0 items-center justify-center rounded-full text-white" style="background:${TONES[i % 3]}"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg></span>`;
          if (variant === 'Steps') lead = isLast && working ? '<span class="chat-spin size-3 shrink-0 rounded-full border-[1.5px] border-line-strong" style="border-top-color:var(--ink-2);animation:chat-spin 700ms linear infinite"></span>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M20 6L9 17l-5-5"/></svg>';
          r.innerHTML = `${lead}<span class="min-w-0 truncate text-[12.5px] ${variant === 'Reasoning' ? 'whitespace-normal leading-relaxed text-ink-2' : 'font-medium text-ink'} ${variant === 'Search' ? 'chat-underline' : ''}">${esc(row.primary)}</span>${row.secondary ? `<span class="shrink-0 text-[11.5px] text-ink-3 ${row.mono ? 'font-mono' : ''}">${esc(row.secondary)}</span>` : ''}${row.add != null ? `<span class="shrink-0 font-mono text-[11px] tabular-nums"><span class="text-green">+${row.add}</span> <span class="text-red">−${row.del}</span></span>` : ''}`;
          return r;
        };
        const render = (visible) => {
          trace.innerHTML = '';
          if (v.query) { const q = mk('div', 'flex h-6 items-center gap-2 px-1.5'); q.style.animation = `chat-fade-up 300ms ${EASE_BU} both`; q.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round" class="shrink-0"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><span class="text-[12.5px] text-ink-2">${esc(v.query)}</span>`; trace.append(q); }
          v.rows.slice(0, visible).forEach((row, i) => trace.append(rowEl(row, i, i === visible - 1)));
          if (variant === 'Search' && !working) { const m = mk('span', 'text-[12px] text-ink-3', '+7 more'); m.style.animation = 'chat-fade-in 300ms ease-out both'; trace.append(m); }
          apply();
        };
        const STAGES = [800, 600, 1800, 2600, 1600];
        const setStage = (s) => {
          auto = s >= 1 && s < 4; working = s < 3;
          const visible = s < 2 ? 0 : s === 2 ? Math.min(2, v.rows.length) : v.rows.length;
          if (!working && !btn.dataset.done) { btn.dataset.done = '1'; const lab = $('.chat-label', btn); lab.removeAttribute('style'); lab.className = 'chat-label text-[13px] font-medium whitespace-nowrap text-ink-2'; lab.style.animation = 'chat-fade-in 350ms ease-out both'; lab.textContent = v.done; $('.chat-spark', btn).setAttribute('fill', 'var(--ink-3)'); }
          render(visible);
        };
        setStage(0);
        for (let s = 1; s < STAGES.length; s++) { await t.sleep(STAGES[s - 1]); setStage(s); }
        await t.sleep(2600);
      } },

    /* --------------------------------------------------- Chat 3 */
    { group: 'Chat', title: 'Tool Chips', desc: 'An agent run as compact rows: each tool call lands every 700 ms with an inline chip, then file-diff chips summarise the edits. Rows expand to show what the tool did; hovering a diff chip previews the change.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const card = buCard('max-w-[340px]'); stage.append(card);
        const ICONS = { think: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>', write: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></g>', run: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-5-6-5M12 19h8"/></g>', read: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></g>' };
        const ROWS = [
          { icon: 'think', label: 'Thinking', chip: 'Planning the churn schedule…', mono: false, detailMono: false, detail: [{ text: 'Weekend demand carries pistachio, so it churns first.' }, { text: 'Batch capacity leaves two evening freezer windows.' }] },
          { icon: 'write', label: 'Write 204 lines', chip: 'ChurnSchedule.tsx', mono: true, detailMono: true, detail: [{ text: '+ const windows = slots.filter((s) => s.temp <= -12)', tone: 'add' }, { text: '+ return schedule(windows, { hero: "pistachio" })', tone: 'add' }] },
          { icon: 'run', label: 'Rebuild and verify', chip: 'npm run freeze', mono: true, detailMono: true, detail: [{ text: '✓ built in 1.2s' }, { text: '✓ 34 checks passed' }] },
          { icon: 'read', label: 'Read image', chip: 'flavor-chart.png', mono: true, detailMono: false, detail: [{ text: '1280 × 720 · line chart, three summers.' }, { text: 'Mint chip trends up 12% through July.' }] },
        ];
        const DIFFS = [{ file: 'flavors.css', add: 13, del: 0 }, { file: 'ChurnSchedule.tsx', add: 74, del: 41 }, { file: 'menu.ts', add: 8, del: 2 }];
        const DIFF_LINES = { 'flavors.css': [['.scoop-card {', 'ctx'], ['  gap: 14px;', 'del'], ['  gap: 12px;', 'add'], ['  container-type: inline-size;', 'add'], ['}', 'ctx']], 'ChurnSchedule.tsx': [['const slots = coldSlots(week);', 'ctx'], ['const windows = slots;', 'del'], ['const windows = slots.filter(', 'add'], ['  (s) => s.temp <= -12,', 'add'], [');', 'add']], 'menu.ts': [['export const hero = "mint-chip";', 'del'], ['export const hero = "pistachio";', 'add']] };
        const wrap = mk('div', 'min-h-[220px] w-full pb-1'); card.append(wrap);
        const head = mk('button', '-mx-1.5 flex w-fit items-center gap-1.5 rounded-[8px] px-1.5 py-1 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover-2'); head.type = 'button'; head.setAttribute('aria-expanded', 'true');
        head.innerHTML = '<svg class="chat-chev transition-transform duration-200" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg><span class="tabular-nums">4 tool calls, 2 messages</span>';
        const body = mk('div', 'grid transition-[grid-template-rows,opacity] duration-300'); body.style.gridTemplateRows = '1fr';
        body.innerHTML = '<div class="-mx-1 overflow-hidden px-1.5 pb-1"><div class="chat-rows mt-1.5 flex flex-col gap-1"></div></div>';
        wrap.append(head, body);
        let open = true; head.onclick = () => { open = !open; head.setAttribute('aria-expanded', open); $('.chat-chev', head).style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)'; body.style.gridTemplateRows = open ? '1fr' : '0fr'; body.style.opacity = open ? '1' : '0'; };
        const rows = $('.chat-rows', body);
        await t.sleep(700);
        for (const row of ROWS) {
          const el = mk('div'); el.style.animation = `chat-fade-up 300ms ${EASE_BU} both`;
          el.innerHTML = `<button type="button" aria-expanded="false" class="group/row -mx-[3px] flex h-7 w-[calc(100%+6px)] min-w-0 items-center gap-2 rounded-[8px] px-[3px] text-left transition-colors duration-100 hover:bg-hover-2"><span class="relative flex size-4 shrink-0 items-center justify-center text-ink-3"><svg width="13" height="13" viewBox="0 0 24 24" fill="${row.icon === 'think' ? 'currentColor' : 'none'}" stroke="currentColor" class="chat-ico transition-opacity duration-100 group-hover/row:opacity-0">${ICONS[row.icon]}</svg><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="chat-rchev absolute opacity-0 transition-[opacity,transform] duration-150 group-hover/row:opacity-100" style="transform:rotate(-90deg)"><path d="M6 9l6 6 6-6"/></svg></span><span class="shrink-0 text-[12.5px] font-medium text-ink">${esc(row.label)}</span><span class="inline-flex h-[22px] min-w-0 flex-1 cursor-pointer items-center truncate rounded-[6px] bg-field px-1.5 text-[11.5px] text-ink-2 chat-hairline transition-colors duration-100 hover:bg-hover-2 ${row.mono ? 'font-mono' : ''}">${esc(row.chip)}</span></button><div class="grid transition-[grid-template-rows,opacity] duration-300" style="grid-template-rows:0fr;opacity:0;transition-timing-function:${EASE_BU}"><div class="min-h-0 overflow-hidden"><div class="mt-0.5 mb-1 ml-2 flex flex-col gap-0.5 border-l border-line py-0.5 pl-3.5">${row.detail.map((l) => `<span class="truncate text-[11.5px] leading-[1.6] ${row.detailMono ? 'font-mono' : ''} ${l.tone === 'add' ? 'text-green' : 'text-ink-2'}">${esc(l.text)}</span>`).join('')}</div></div></div>`;
          const b = el.firstElementChild, d = el.lastElementChild; let ro = false;
          b.onclick = () => { ro = !ro; b.setAttribute('aria-expanded', ro); d.style.gridTemplateRows = ro ? '1fr' : '0fr'; d.style.opacity = ro ? '1' : '0'; $('.chat-ico', b).classList.toggle('opacity-0', ro); const c = $('.chat-rchev', b); c.classList.toggle('opacity-100', ro); c.style.transform = ro ? 'rotate(0deg)' : 'rotate(-90deg)'; };
          rows.append(el); await t.sleep(700);
        }
        const chips = mk('div', 'mt-2.5 flex max-w-full flex-wrap gap-1.5 border-t border-line pt-2.5'); body.firstElementChild.append(chips);
        let pop = null; const closePop = () => { if (pop) { pop.remove(); pop = null; } };
        DIFFS.forEach((d, i) => {
          const s = mk('span', 'relative');
          s.innerHTML = `<button type="button" aria-label="Show diff for ${esc(d.file)}" class="inline-flex h-7 max-w-full items-center gap-2 rounded-[6px] bg-surface px-2 font-mono text-[11.5px] text-ink chat-btn-shadow transition-colors duration-100 hover:bg-hover" style="animation:chat-pop-in 250ms ${EASE_BU} ${i * 80}ms both"><span class="min-w-0 truncate">${esc(d.file)}</span><span class="shrink-0 text-green tabular-nums">+${d.add}</span>${d.del ? `<span class="shrink-0 text-red tabular-nums">−${d.del}</span>` : ''}</button>`;
          const openPop = () => {
            closePop(); const r = s.getBoundingClientRect(); const lines = DIFF_LINES[d.file];
            pop = mk('div', 'lib-chat fixed z-50 w-72 overflow-hidden rounded-[10px] bg-surface chat-overlay-shadow');
            const fitsBelow = r.bottom + 6 + 38 + lines.length * 19 <= innerHeight - 12;
            Object.assign(pop.style, { left: Math.max(12, Math.min(r.left, innerWidth - 300)) + 'px', ...(fitsBelow ? { top: r.bottom + 6 + 'px' } : { bottom: innerHeight - r.top + 6 + 'px' }), animation: `chat-pop-in 160ms ${EASE_BU} both`, transformOrigin: fitsBelow ? 'top left' : 'bottom left' });
            pop.innerHTML = `<div class="flex items-center justify-between border-b border-line px-2.5 py-1.5 font-mono text-[11px]"><span class="min-w-0 truncate text-ink-2">${esc(d.file)}</span><span class="shrink-0 tabular-nums"><span class="text-green">+${d.add}</span>${d.del ? `<span class="text-red"> −${d.del}</span>` : ''}</span></div><div class="py-1 font-mono text-[11px] leading-[1.8]">${lines.map(([tx, tone]) => `<div class="flex gap-2 px-2.5 whitespace-pre ${tone === 'add' ? 'bg-green-tint text-green' : tone === 'del' ? 'bg-red-tint text-red' : 'text-ink-2'}"><span class="w-3 shrink-0 select-none">${tone === 'add' ? '+' : tone === 'del' ? '−' : ' '}</span><span class="min-w-0 truncate">${esc(tx)}</span></div>`).join('')}</div>`;
            document.body.append(pop);
          };
          s.onmouseenter = openPop; s.onmouseleave = closePop; s.firstElementChild.onfocus = openPop; s.firstElementChild.onblur = closePop;
          chips.append(s);
        });
        chips.insertAdjacentHTML('beforeend', `<button type="button" class="inline-flex h-7 items-center rounded-[6px] px-1.5 font-mono text-[11.5px] text-ink-3 underline decoration-transparent underline-offset-2 transition-colors duration-100 hover:text-ink-2 hover:decoration-current" style="animation:chat-fade-in 300ms ease-out ${DIFFS.length * 80}ms both">+2 more</button>`);
        await t.sleep(1200); $('button', rows.children[1]).click(); await t.sleep(4800); closePop();
      } },

    /* --------------------------------------------------- Chat 4 */
    { group: 'Chat', title: 'Stream Text', desc: 'The reusable streaming primitive: characters land two at a time every 9 ms, the newest six resolve out of a masked blur, and the caret holds solid while streaming then blinks once the text settles.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const card = buCard(); stage.append(card);
        card.innerHTML = `<div class="flex items-center gap-2 border-b border-line pb-3"><span class="flex size-6 items-center justify-center rounded-[6px] bg-accent-tint text-accent-ink"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg></span><span class="text-[13px] font-medium text-ink">Rewrite</span><span class="ml-auto rounded-[6px] bg-inset px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3 chat-hairline">shorter · friendlier</span></div><p class="chat-orig mt-3 text-[12.5px] leading-relaxed text-ink-3 line-through decoration-line-strong">Our team is currently experiencing a higher than usual volume of requests and as a consequence response times may be longer than expected.</p><p class="chat-out mt-2 text-[13px] leading-relaxed text-ink"></p>`;
        const out = $('.chat-out', card);
        const text = "We're a little busier than usual right now, so replies might take a bit longer. Thanks for bearing with us — we'll get back to you as soon as we can!";
        const head = document.createTextNode(''); const tail = mk('span', 'stream-tail'); const caret = mk('span', 'stream-caret is-streaming'); caret.setAttribute('aria-hidden', 'true');
        out.append(head, tail, caret);
        await t.sleep(600);
        for (let i = 0; i < text.length;) {
          i = Math.min(i + 2, text.length); const shown = text.slice(0, i); const split = i < text.length ? Math.max(0, shown.length - 6) : shown.length;
          head.textContent = shown.slice(0, split); tail.textContent = shown.slice(split); await t.sleep(9);
        }
        tail.textContent = ''; head.textContent = text; caret.classList.remove('is-streaming');
        await t.sleep(4200);
      } },

    /* --------------------------------------------------------- Assist */
    { group: 'Assist', title: 'Reasoning & Tool', desc: 'The Assist collection\'s chat parts: a collapsible Reasoning block pulses "Thinking..." and streams its trace open, a Tool header pulses while the call runs and expands to its input and output, then the reply streams.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-assist flex min-h-[460px] w-full justify-center rounded-[20px] px-6 py-8'); root.append(stage);
        const thread = mk('div', 'flex w-full max-w-xl flex-col gap-2'); stage.append(thread);
        const user = mk('div', 'ms-auto w-fit max-w-[80%] rounded-2xl bg-secondary px-3.5 py-2 text-sm text-secondary-foreground', 'What changed in the latest React Compiler release?');
        thread.append(user); await show(user, { opacity: '0', transform: 'translateY(4px)' }, { opacity: '1', transform: 'none' }, t, 'opacity .25s ease, transform .25s ease');
        await t.sleep(500);
        const chev = (open) => lu('chevron-down', `size-3.5 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`);
        const collapsible = (open) => { const c = mk('div', 'grid transition-[grid-template-rows] duration-200'); c.style.gridTemplateRows = open ? '1fr' : '0fr'; c.innerHTML = '<div class="min-h-0 overflow-hidden"></div>'; return c; };
        // Reasoning
        const rs = mk('div', 'not-prose my-2 w-full min-w-0'); rs.dataset.slot = 'reasoning';
        const rt = mk('button', 'inline-flex max-w-full cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'); rt.type = 'button'; rt.setAttribute('role', 'status');
        rt.innerHTML = `<span class="truncate animate-pulse">Thinking...</span>${chev(true)}`;
        const rc = collapsible(true); const rcontent = mk('div', 'py-1 text-sm text-muted-foreground'); rc.firstElementChild.append(rcontent);
        rs.append(rt, rc); thread.append(rs);
        let rOpen = true; rt.onclick = () => { rOpen = !rOpen; rc.style.gridTemplateRows = rOpen ? '1fr' : '0fr'; $('svg', rt).classList.toggle('-rotate-90', !rOpen); $('svg', rt).classList.toggle('rotate-0', rOpen); };
        const REASON = ['The user wants the changes in the newest **React Compiler** release.', 'I should search for the release notes rather than rely on memory, then summarise the user-facing changes.'];
        for (const para of REASON) { const p = mk('p', 'mb-2 last:mb-0'); rcontent.append(p); await mdStream(p, para, t); }
        rt.removeAttribute('role'); rt.firstElementChild.classList.remove('animate-pulse'); rt.firstElementChild.textContent = 'Thought';
        await t.sleep(400);
        // Tool
        const tl = mk('div', 'not-prose my-1 w-full min-w-0'); tl.dataset.slot = 'tool';
        const th = mk('button', 'group inline-flex max-w-full cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'); th.type = 'button';
        th.innerHTML = `<span class="truncate animate-pulse">Web Search · react compiler release notes</span>${chev(false)}`;
        const tc = collapsible(false); const tcontent = mk('div', 'flex flex-col gap-1 py-1 text-sm text-muted-foreground'); tc.firstElementChild.append(tcontent);
        tl.append(th, tc); thread.append(tl);
        let tOpen = false; th.onclick = () => { tOpen = !tOpen; tc.style.gridTemplateRows = tOpen ? '1fr' : '0fr'; $('svg', th).classList.toggle('-rotate-90', !tOpen); $('svg', th).classList.toggle('rotate-0', tOpen); };
        const pre = (o) => `<pre class="overflow-x-auto font-mono text-xs">${esc(JSON.stringify(o, null, 2))}</pre>`;
        tcontent.innerHTML = `<div class="flex flex-col gap-0.5 overflow-hidden"><p class="text-xs text-muted-foreground">Input</p>${pre({ query: 'react compiler release notes' })}</div>`;
        await t.sleep(1800);
        tcontent.insertAdjacentHTML('beforeend', `<div class="flex flex-col gap-0.5 overflow-x-auto text-xs text-foreground"><p class="text-xs text-muted-foreground">Output</p>${pre({ results: [{ title: 'React Compiler v1.0', url: 'react.dev/blog/react-compiler-1.0' }, { title: 'eslint-plugin-react-hooks 6.1', url: 'npmjs.com/package/eslint-plugin-react-hooks' }] })}</div>`);
        th.firstElementChild.classList.remove('animate-pulse');
        await t.sleep(300); th.click(); await t.sleep(900);
        const ans = mk('div', 'text-sm leading-6 text-foreground'); thread.append(ans);
        const parts = ['The compiler is now **stable at v1.0**: it ships through the new `babel-plugin-react-compiler` and is on by default in new Expo and Vite templates.', 'Lint rules moved into `eslint-plugin-react-hooks`, so one plugin now flags code the compiler cannot optimise.'];
        for (const para of parts) { const p = mk('p', 'mb-3 last:mb-0'); ans.append(p); await mdStream(p, para, t, 28, 48); }
        await t.sleep(4200);
      } },

    /* ------------------------------------------------- Motion 1 */
    { group: 'Motion', title: 'Text Effect', desc: 'TextEffect with the fade-in-blur preset, per word: each word rises 20px out of a 12px blur on a 50 ms stagger — the way an answer feels when it lands as a whole — then leaves in reverse order.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-motion flex min-h-[340px] w-full items-center justify-center rounded-[20px] px-8 py-10'); root.append(stage);
        const p = mk('p', 'max-w-lg text-[15px] leading-7 text-zinc-700 dark:text-zinc-300'); stage.append(p);
        const text = 'Animate your interface with ease. Motion turns every response into a reveal: words drift up out of the blur in order, and the paragraph settles before you have finished reading the first line.';
        const segs = text.split(/(\s+)/); const speedReveal = 1.1, speedSegment = 0.3; const stagger = 0.05 / speedReveal, dur = 0.3 / speedSegment;
        p.innerHTML = `<span class="sr-only">${esc(text)}</span>`;
        const spans = segs.map((s) => { const e = mk('span', 'inline-block whitespace-pre'); e.setAttribute('aria-hidden', 'true'); e.textContent = s; Object.assign(e.style, { opacity: '0', transform: 'translateY(20px)', filter: 'blur(12px)' }); p.append(e); return e; });
        await t.sleep(300);
        spans.forEach((e, i) => { tick(() => { e.style.transition = `opacity ${dur}s ease ${i * stagger}s, transform ${dur}s ease ${i * stagger}s, filter ${dur}s ease ${i * stagger}s`; Object.assign(e.style, { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' }); }); });
        await t.sleep((spans.length * stagger + dur) * 1000 + 2600);
        const n = spans.length; spans.forEach((e, i) => { e.style.transition = `opacity ${dur}s ease ${(n - 1 - i) * stagger}s, transform ${dur}s ease ${(n - 1 - i) * stagger}s, filter ${dur}s ease ${(n - 1 - i) * stagger}s`; Object.assign(e.style, { opacity: '0', transform: 'translateY(20px)', filter: 'blur(12px)' }); });
        await t.sleep((n * stagger + dur) * 1000);
      } },

    /* ------------------------------------------------- Motion 2 */
    { group: 'Motion', title: 'Text Shimmer Wave', desc: 'TextShimmerWave as a generation status: each letter lifts forward in 3D, tilts and brightens in turn, a wave that sweeps the label — then the generated code takes its place.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-motion flex min-h-[340px] w-full flex-col items-center justify-center gap-6 rounded-[20px] px-8 py-10'); root.append(stage);
        const wave = (label, cls) => {
          const el = mk('p', `relative inline-block [perspective:500px] font-mono text-sm ${cls}`); el.style.color = 'var(--base-color)';
          const chars = [...label]; const duration = 1, repeatDelay = chars.length * 0.05; const total = duration + repeatDelay; const k = duration / total;
          chars.forEach((ch, i) => {
            const s = mk('span', 'inline-block whitespace-pre [transform-style:preserve-3d]'); s.textContent = ch; el.append(s);
            if (REDUCE) return;
            s.animate([
              { offset: 0, transform: 'translateZ(0) translateX(0) translateY(0) scale(1) rotateY(0deg)', color: 'var(--base-color)', easing: 'ease-in-out' },
              { offset: k / 2, transform: 'translateZ(10px) translateX(2px) translateY(-2px) scale(1.1) rotateY(10deg)', color: 'var(--base-gradient-color)', easing: 'ease-in-out' },
              { offset: k, transform: 'translateZ(0) translateX(0) translateY(0) scale(1) rotateY(0deg)', color: 'var(--base-color)' },
              { offset: 1, transform: 'translateZ(0) translateX(0) translateY(0) scale(1) rotateY(0deg)', color: 'var(--base-color)' },
            ], { duration: total * 1000, delay: ((i * duration) / chars.length) * 1000, iterations: Infinity });
          });
          return el;
        };
        const w1 = wave('Generating code...', '[--base-color:#0D74CE] [--base-gradient-color:#5EB1EF]');
        const w2 = wave('Running the test suite...', '[--base-color:#a1a1aa] [--base-gradient-color:#000] dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff]');
        stage.append(w1, w2);
        await t.sleep(4200);
        const code = mk('pre', 'w-full max-w-md overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-[12.5px] leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200');
        w1.replaceWith(code);
        const LINES = ['export function useStream(url: string) {', '  const [text, setText] = useState("");', '  useEffect(() => {', '    const es = new EventSource(url);', '    es.onmessage = (e) => setText((t) => t + e.data);', '    return () => es.close();', '  }, [url]);', '  return text;', '}'];
        for (const [i, l] of LINES.entries()) { const s = mk('span', 'block whitespace-pre'); s.textContent = l || ' '; code.append(s); await show(s, { opacity: '0', filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: '1', filter: 'blur(0px)', transform: 'none' }, t, 'opacity .3s ease, filter .3s ease, transform .3s ease'); await t.sleep(110 + i * 4); }
        await t.sleep(1600); w2.textContent = 'All 12 tests passed'; w2.className = 'font-mono text-sm text-emerald-600 dark:text-emerald-400'; w2.removeAttribute('style');
        await t.sleep(3000);
      } },

    /* --------------------------------------------------------- Dots */
    { group: 'Dots', title: 'Dots Loaders', desc: 'Two loaders from the Dots set driving a reply: Square 1 sweeps an alternating diagonal while the agent thinks, Circular 5 spins a pinwheel while it searches, then the answer streams in.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-dots flex min-h-[380px] w-full items-center justify-center rounded-[20px] px-8 py-10'); root.append(stage);
        const col = mk('div', 'flex w-full max-w-md flex-col gap-4'); stage.append(col);
        const gallery = mk('div', 'flex items-center justify-center gap-8 pb-4'); col.append(gallery);
        for (const [kind, label] of [['square-1', 'square-1'], ['circular-5', 'circular-5']]) { const c = mk('div', 'flex flex-col items-center gap-2'); c.append(dotGrid(t, kind, { size: 48, dot: 7 })); c.insertAdjacentHTML('beforeend', `<span class="whitespace-nowrap font-mono text-[11px] text-neutral-500">${label}</span>`); gallery.append(c); }
        const row = mk('div', 'flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400'); col.append(row);
        const setRow = (kind, label) => { row.innerHTML = ''; row.append(dotGrid(t, kind, { size: 18, dot: 3 })); row.insertAdjacentHTML('beforeend', `<span>${label}</span>`); };
        await t.sleep(300); setRow('square-1', 'Thinking'); await t.sleep(2400);
        setRow('circular-5', 'Searching 4 sources'); await t.sleep(2600);
        row.remove();
        const p = mk('p', 'text-sm leading-6 text-neutral-800 dark:text-neutral-200'); col.append(p);
        await show(p, { opacity: '0' }, { opacity: '1' }, t, 'opacity .25s ease');
        await streamInto(p, 'Dot-grid loaders read as activity without pretending to measure progress: a 5×5 grid, one opacity per dot, and a pattern that loops at a fixed cycle so the eye never waits for it to finish.', t, 34);
        await t.sleep(4000);
      } },
  ];
}
