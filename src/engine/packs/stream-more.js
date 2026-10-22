/* Stream — the remaining agent / streaming components, ported to vanilla JS from
 * their shadcn registry source and the demo previews of each component.
 * Default export: a factory that receives the shared helpers*/
export default function pack(h) {
  'use strict';
  const { mk, $, $$, esc, REDUCE, tick, LUCIDE, lu, streamInto, show, disclosure, closedDisclosure, rollSlot, favicon, streamShimmer, streamStage } = h;
  const EO = h.EASE_OUT;                                  // [0.16, 1, 0.3, 1]
  const SW = h.SPRING_SWAP;                               // stiffness 460 / damping 30 / mass 0.55
  const SL = h.SPRING_LAYOUT;                             // stiffness 360 / damping 32 / mass 0.6
  const EIO = 'cubic-bezier(0.77, 0, 0.175, 1)';          // Stream EASE_IN_OUT
  const PRESS = 'cubic-bezier(0.3, 1.3, 0.6, 1)';         // SPRING_PRESS 500 / 30 / 0.6
  const BUBBLE_POP = 'cubic-bezier(0.34, 1.45, 0.64, 1)'; // 520 / 27 / 0.52 — one restrained overshoot
  const MSG_POP = 'cubic-bezier(0.3, 1.22, 0.6, 1)';      // MESSAGE_POP_UP 480 / 32 / 0.62
  const REVEAL_SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)'; // TextReveal 140 / 26 / 1.2 (≈ critically damped)

  /* ------------------------------------------------------------ icons */
  const ICONS = {
    'list-todo': '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'file-code-2': '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m5 12-3 3 3 3"/><path d="m9 18 3-3-3-3"/>',
    'book-open-text': '<path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'message-square-text': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    'image-plus': '<path d="M16 5h6"/><path d="M19 2v6"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/>',
    puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  };
  for (const k in ICONS) if (!(k in LUCIDE)) LUCIDE[k] = ICONS[k];

  /* -------------------------------------------------------------- CSS */
  if (!document.getElementById('stream-more-css')) {
    const st = document.createElement('style'); st.id = 'stream-more-css';
    st.textContent = `
@media (prefers-reduced-motion: reduce){.stream-text-shimmer{animation:none !important}}
.bm-k{color:#a0111f}.bm-s{color:#032563}.bm-f{color:#622cbc}.bm-n,.bm-p{color:#023b95}.bm-c{color:#66707b}.bm-t{color:#702c00}
.dark .bm-k{color:#ff9492}.dark .bm-s{color:#addcff}.dark .bm-f{color:#dbb7ff}.dark .bm-n,.dark .bm-p{color:#91cbff}.dark .bm-c{color:#bdc4cc}.dark .bm-t{color:#ffb757}
@keyframes bm-spin{to{transform:rotate(360deg)}}
@keyframes bm-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes bm-op{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes bm-dot{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(var(--h));opacity:1}}
@keyframes bm-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes bm-dm{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
@keyframes bm-dither{0%,100%{opacity:.1}50%{opacity:1}}
@keyframes bm-mb1{0%,100%{transform:translateX(0)}50%{transform:translateX(40px)}}
@keyframes bm-mb2{0%,100%{transform:translateX(0)}50%{transform:translateX(-40px)}}
@keyframes bm-nl{0%{transform:translateX(0)}28%{transform:translateX(calc(var(--out) * -1))}50%,100%{transform:translateX(0)}}
@keyframes bm-nr{0%,50%{transform:translateX(0)}78%{transform:translateX(var(--out))}100%{transform:translateX(0)}}
@keyframes bm-hxa{0%,100%{transform:translateX(var(--amp)) scale(1);opacity:1}50%{transform:translateX(calc(var(--amp) * -1)) scale(.5);opacity:.45}}
@keyframes bm-hxb{0%,100%{transform:translateX(calc(var(--amp) * -1)) scale(.5);opacity:.45}50%{transform:translateX(var(--amp)) scale(1);opacity:1}}
@keyframes bm-ap{0%,100%{opacity:.28;transform:scale(.72)}50%{opacity:1;transform:scale(1)}}
@keyframes bm-ap-r{0%,100%{opacity:.35}50%{opacity:.8}}
@keyframes bm-typing{0%,100%{opacity:.28;transform:translateY(0)}50%{opacity:.85;transform:translateY(-2px)}}
.bm-clamp4{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 68%,transparent 100%);mask-image:linear-gradient(to bottom,#000 68%,transparent 100%)}
`;
    document.head.append(st);
  }

  /* ---------------------------------------------------------- helpers */
  const anim = (el, name, dur, delay = 0, ease = EIO) => { el.style.animation = `${name} ${dur}s ${ease} ${delay}s infinite`; };
  function bezier(x1, y1, x2, y2) {
    const c = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
    return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 22; i++) { t = (lo + hi) / 2; if (c(t, x1, x2) < x) lo = t; else hi = t; } return c(t, y1, y2); };
  }
  const easeInOut = bezier(0.77, 0, 0.175, 1);
  /** whileTap feedback: scale down on the press spring, then release. */
  async function press(btn, t, s = 0.97) {
    if (!btn || REDUCE) return;
    const prev = btn.style.transition;
    btn.style.transition = `transform .12s ${PRESS}`; btn.style.transform = `scale(${s})`;
    await t.sleep(130); btn.style.transform = ''; await t.sleep(120); btn.style.transition = prev;
  }
  async function typeInto(el, text, t, ms = 34) { for (const ch of text) { el.value += ch; el.dispatchEvent(new Event('input')); await t.sleep(ms * (ch === ' ' ? 1.6 : 1) * (0.7 + Math.random() * 0.6)); } }
  const enterRow = (el, t) => show(el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .18s ${EO}, transform .45s ${SL}`);
  const chev = (cls = 'size-3.5', open = false) => `<span aria-hidden="true" class="bm-chev inline-flex" style="transition:transform .32s ${SW};transform:rotate(${open ? 180 : 0}deg)">${lu('chevron-down', cls)}</span>`;
  const setChev = (root, open) => { const c = $('.bm-chev', root); if (c) c.style.transform = `rotate(${open ? 180 : 0}deg)`; };

  /* Small line highlighter standing in for shiki github-{light,dark}-high-contrast (AgentCode). */
  const KW = new Set('import export from async await function const let var return new type interface if else for of in as default class extends true false null undefined string number boolean void'.split(' '));
  const TOK = /(\/\/.*)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
  const sp = (c, s) => `<span class="bm-${c}">${s}</span>`;
  function hl(src, lang = 'typescript') {
    if (lang === 'bash') { let first = true; return src.split(/(\s+)/).map((w) => { if (!w.trim()) return w; const e = esc(w); if (first) { first = false; return sp('f', e); } if (w[0] === '-') return sp('n', e); if (/^["']/.test(w)) return sp('s', e); return e; }).join(''); }
    let out = '', m, prevDot = false; TOK.lastIndex = 0;
    while ((m = TOK.exec(src))) {
      const [all, com, str, num, id, ws, ch] = m; const next = src.slice(TOK.lastIndex);
      if (com) out += sp('c', esc(com));
      else if (str) out += sp(lang === 'json' && /^\s*:/.test(next) ? 'p' : 's', esc(str));
      else if (num) out += sp('n', esc(num));
      else if (id) out += KW.has(id) && !prevDot ? sp('k', esc(id)) : /^\s*\(/.test(next) ? sp('f', esc(id)) : /^\s*:/.test(next) && !prevDot ? sp('p', esc(id)) : /^[A-Z]/.test(id) ? sp('t', esc(id)) : esc(id);
      else out += esc(all);
      if (!ws) prevDot = ch === '.';
    }
    return out;
  }

  /* ============================================================ Loader */
  const ASCII_SETS = {
    ascii: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    'ascii-line': ['|', '/', '-', '\\'],
    'ascii-braille': ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
    'ascii-blocks': ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'],
    'ascii-bounce': ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  };
  const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const ngon = (ang, n, phase = 0) => { const seg = (2 * Math.PI) / n; const a = ang - phase; const local = (((a % seg) + seg) % seg) - seg / 2; return Math.cos(Math.PI / n) / Math.cos(local); };
  const morphPts = (fn) => Array.from({ length: 24 }, (_, i) => { const ang = (i / 24) * 2 * Math.PI - Math.PI / 2; const r = Math.min(1.05, fn(ang)); return [50 + Math.cos(ang) * 46 * r, 50 + Math.sin(ang) * 46 * r]; });
  const MORPH_SHAPES = [morphPts(() => 1), morphPts((a) => ngon(a, 4, Math.PI / 4)), morphPts((a) => ngon(a, 3)), morphPts((a) => ngon(a, 6)), morphPts((a) => ngon(a, 4))];
  const MORPH_SEQ = [...MORPH_SHAPES.flatMap((p) => [p, p]), MORPH_SHAPES[0]];
  const MORPH_ROT = [0, 0, 72, 72, 144, 144, 216, 216, 288, 288, 360];
  const MORPH_SCALE = [1, 1, 0.88, 0.88, 1, 1, 0.88, 0.88, 1, 1, 1];
  const ptsD = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z';
  let filterUid = 0;
  const px = (n) => n + 'px';
  const cell = (cls, w, hh) => { const d = mk('span', cls); d.style.width = px(w); d.style.height = px(hh ?? w); return d; };

  /** Loader({ variant, size, speed }) — CSS keyframes stand in for motion's repeat: Infinity. */
  function loader(variant, t, size = 36, speed = 1) {
    const box = mk('span', 'inline-flex items-center justify-center text-foreground');
    box.setAttribute('role', 'status'); box.setAttribute('aria-label', 'Loading');
    if (variant === 'spinner') {
      const s = Math.max(2, size * 0.09), r = (size - s) / 2, c = size / 2;
      box.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="${s}"/><path d="M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c + r} ${c}" fill="none" stroke="currentColor" stroke-width="${s}" stroke-linecap="round"/></svg>`;
      REDUCE ? anim(box.firstChild, 'bm-pulse', 1.4) : anim(box.firstChild, 'bm-spin', speed, 0, 'linear');
    } else if (variant === 'dots') {
      const row = mk('span', 'flex items-center'); row.style.gap = px(size * 0.14);
      for (let i = 0; i < 3; i++) { const d = cell('rounded-full bg-current', size * 0.24); d.style.setProperty('--h', px(-size * 0.3)); anim(d, REDUCE ? 'bm-op' : 'bm-dot', speed, i * speed * 0.16); row.append(d); }
      box.append(row);
    } else if (variant === 'bars') {
      const row = mk('span', 'flex items-center'); row.style.gap = px(size * 0.1); row.style.height = px(size);
      for (let i = 0; i < 4; i++) { const d = cell('rounded-full bg-current', size * 0.16, size); d.style.transformOrigin = '50% 100%'; anim(d, REDUCE ? 'bm-op' : 'bm-bar', speed, i * speed * 0.12); row.append(d); }
      box.append(row);
    } else if (variant === 'dot-matrix' || variant === 'dither') {
      const n = variant === 'dither' ? 4 : 3; const gap = variant === 'dither' ? Math.max(1, size * 0.05) : size * 0.14; const d0 = (size - gap * (n - 1)) / n;
      const grid = mk('span', 'grid'); grid.style.gap = px(gap); grid.style.gridTemplateColumns = `repeat(${n}, ${d0}px)`;
      for (let idx = 0; idx < n * n; idx++) {
        const x = idx % n, y = Math.floor(idx / n);
        const d = cell(variant === 'dither' ? 'bg-current' : 'rounded-full bg-current', d0);
        const delay = variant === 'dither' ? (BAYER_4[idx] / 16) * speed : ((x + y) / (2 * (n - 1))) * speed;
        anim(d, REDUCE ? 'bm-op' : variant === 'dither' ? 'bm-dither' : 'bm-dm', speed, delay); grid.append(d);
      }
      box.append(grid);
    } else if (ASCII_SETS[variant]) {
      const frames = ASCII_SETS[variant]; const s = mk('span', 'font-mono leading-none tabular-nums'); s.style.fontSize = px(size); s.style.lineHeight = '1'; s.textContent = frames[0];
      let f = 0; t.every((((REDUCE ? speed * 2.5 : speed) / frames.length) * 1000), () => { f = (f + 1) % frames.length; s.textContent = frames[f]; });
      box.append(s);
    } else if (variant === 'morph') {
      box.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img"><title>Loading</title><path fill="currentColor" d="${ptsD(MORPH_SHAPES[0])}"/></svg>`;
      const svg = box.firstChild, path = svg.lastChild;
      if (REDUCE) anim(svg, 'bm-pulse', 1.4);
      else {
        const t0 = performance.now(), dur = speed * 5000;
        const paint = () => {
          const ph = (((performance.now() - t0) % dur) / dur) * 10; const seg = Math.min(9, Math.floor(ph)); const k = easeInOut(ph - seg);
          const a = MORPH_SEQ[seg], b = MORPH_SEQ[seg + 1];
          path.setAttribute('d', ptsD(a.map((p, i) => [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k])));
          svg.style.transform = `rotate(${MORPH_ROT[seg] + (MORPH_ROT[seg + 1] - MORPH_ROT[seg]) * k}deg) scale(${MORPH_SCALE[seg] + (MORPH_SCALE[seg + 1] - MORPH_SCALE[seg]) * k})`;
        };
        paint(); t.every(33, paint);
      }
    } else if (variant === 'comet') {
      const head = size * 0.2, r = size / 2 - head / 2;
      const wrap = mk('span', 'relative'); wrap.style.width = wrap.style.height = px(size);
      const spin = mk('span', 'absolute inset-0'); REDUCE ? anim(spin, 'bm-pulse', 1.4) : anim(spin, 'bm-spin', speed, 0, 'linear');
      for (let i = 0; i < 6; i++) { const sz = head * (1 - i * 0.13); const d = cell('absolute top-1/2 left-1/2 rounded-full bg-current', sz); Object.assign(d.style, { marginLeft: px(-sz / 2), marginTop: px(-sz / 2), opacity: String(1 - i * 0.16), transform: `rotate(${-i * 15}deg) translateY(${-r}px)` }); spin.append(d); }
      wrap.append(spin); box.append(wrap);
    } else if (variant === 'scramble') {
      const TARGET = 'LOADING', G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*#@';
      const s = mk('span', 'font-mono font-medium tracking-[0.2em] tabular-nums'); s.style.fontSize = px(size * 0.42); s.textContent = TARGET;
      if (!REDUCE) { let k = 0; const total = TARGET.length + 4; t.every((speed / TARGET.length) * 1000 * 0.55, () => { const reveal = k % total; let out = ''; for (let i = 0; i < TARGET.length; i++) out += i < reveal ? TARGET[i] : G[Math.floor(Math.random() * G.length)]; s.textContent = out; k++; }); }
      box.append(s);
    } else if (variant === 'metaballs') {
      const id = 'bm-goo-' + ++filterUid;
      box.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img"><title>Loading</title><defs><filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"/></filter></defs><g filter="url(#${id})" fill="currentColor"><circle cy="50" r="15" cx="${REDUCE ? 40 : 30}"/><circle cy="50" r="15" cx="${REDUCE ? 60 : 70}"/></g></svg>`;
      const [c1, c2] = $$('circle', box);
      if (REDUCE) { anim(c1, 'bm-op', speed * 1.6); anim(c2, 'bm-op', speed * 1.6); } else { anim(c1, 'bm-mb1', speed * 1.6); anim(c2, 'bm-mb2', speed * 1.6); }
    } else if (variant === 'newton') {
      const d = size * 0.2; const row = mk('span', 'flex items-center justify-center'); row.style.height = px(d);
      for (let i = 0; i < 5; i++) { const b = cell('rounded-full bg-current', d); if (!REDUCE && (i === 0 || i === 4)) { b.style.setProperty('--out', px(d * 1.1)); anim(b, i === 0 ? 'bm-nl' : 'bm-nr', speed * 1.5); } row.append(b); }
      box.append(row);
    } else if (variant === 'helix') {
      const rows = 7, dot = size * 0.14, amp = size * 0.32; const wrap = mk('span', 'relative'); wrap.style.width = wrap.style.height = px(size);
      for (let r = 0; r < rows; r++) {
        const top = (r / (rows - 1)) * (size - dot);
        for (const k of ['bm-hxa', 'bm-hxb']) { const d = cell('absolute rounded-full bg-current', dot); Object.assign(d.style, { left: px(size / 2 - dot / 2), top: px(top) }); d.style.setProperty('--amp', px(amp)); anim(d, REDUCE ? 'bm-op' : k, speed, (r / rows) * speed); wrap.append(d); }
      }
      box.append(wrap);
    } else if (variant === 'percent') {
      const col = mk('span', 'flex flex-col items-center'); col.style.gap = px(size * 0.14); col.style.width = px(size * 1.4);
      const num = mk('span', 'font-mono font-medium tabular-nums'); Object.assign(num.style, { fontSize: px(size * 0.42), lineHeight: '1' }); num.textContent = '0%';
      const track = mk('span', 'w-full overflow-hidden rounded-full bg-current/15'); track.style.height = px(Math.max(3, size * 0.1));
      const fill = mk('span', 'block h-full rounded-full bg-current'); fill.style.width = '0%'; track.append(fill); col.append(num, track); box.append(col);
      const dur = (REDUCE ? speed * 2 : speed) * 1000; let acc = 0;
      t.every(40, () => { acc += 40; const p = Math.min(100, Math.round((acc / dur) * 100)); num.textContent = p + '%'; fill.style.width = p + '%'; if (p >= 100) acc = 0; });
    }
    box.insertAdjacentHTML('beforeend', '<span class="sr-only">Loading</span>');
    return box;
  }
  function loaderGallery(stage, t, variants) {
    const g = mk('div', 'flex flex-wrap items-center justify-center gap-x-8 gap-y-7 p-2 sm:p-6'); stage.append(g);
    variants.forEach(([v, label], i) => {
      const item = mk('div', 'flex min-w-16 flex-col items-center gap-4');
      const slot = mk('div', 'grid h-[52px] place-items-center'); slot.append(loader(v, t, 36));
      item.append(slot, mk('span', 'whitespace-nowrap text-xs text-muted-foreground', esc(label))); g.append(item);
      show(item, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .3s ${EO} ${i * 40}ms, transform .5s ${SL} ${i * 40}ms`);
    });
  }

  /* ================================================== shared agent parts */
  const btnPrimarySm = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 text-xs font-medium text-white transition-[opacity,background-color] hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const btnSecondarySm = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-[var(--card)] px-3 text-xs font-medium text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const btnGhostSm = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const button = (cls, html, label) => { const b = mk('button', cls, html); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; };

  /* ------------------------------------------------------------ demos */
  return [
    /* ------------------------------------------------- Thinking Shimmer */
    { group: 'Stream', title: 'Thinking Shimmer', desc: 'A quiet gradient sweep (1.8s per pass) keeps the agent\'s current status readable while it works; once the answer arrives the status gives way to the streamed text.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const col = mk('div', 'flex w-full max-w-md flex-col gap-3'); stage.append(col);
        const status = mk('div', 'flex h-8 items-center text-lg'); status.setAttribute('role', 'status'); status.innerHTML = streamShimmer('Thinking…', 1.8); col.append(status);
        await t.sleep(2600);
        const phrase = $('.stream-text-shimmer', status); phrase.style.transition = `opacity .2s ${EO}, transform .2s ${EO}`; phrase.style.opacity = '0'; phrase.style.transform = 'translateY(-3px)';
        await t.sleep(200); status.innerHTML = streamShimmer('Checking the release notes…', 1.8);
        await show(status.firstChild, { opacity: '0', transform: 'translateY(3px)' }, { opacity: '1', transform: 'none' }, t, `opacity .2s ${EO}, transform .2s ${EO}`);
        await t.sleep(2600);
        status.style.transition = `opacity .22s ${EO}`; status.style.opacity = '0'; await t.sleep(220); status.remove();
        const p = mk('p', 'stream-prose text-sm leading-6 text-foreground/90'); col.append(p);
        await streamInto(p, 'The release improves streaming, navigation and recovery states. Long answers now follow the live edge, and reduced motion keeps every status readable without the sweep.', t, 34);
        await t.sleep(3200);
      } },

    /* --------------------------------------------------- Agent Progress */
    { group: 'Stream', title: 'Agent Progress', desc: 'For longer-running work: a 3×3 activity glyph whose cells pulse in sequence, the action verb and a live tabular timer ticking every 100ms.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const make = (label, initial, cls) => {
          const el = mk('span', `inline-flex items-center gap-3 font-mono text-sm text-muted-foreground ${cls}`); el.setAttribute('role', 'status'); el.setAttribute('aria-label', `${label}, in progress`);
          const grid = mk('span', 'grid size-5 shrink-0 grid-cols-3 gap-[2px]'); grid.setAttribute('aria-hidden', 'true');
          [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 0.98, 1.12].forEach((d) => { const c = mk('span', 'rounded-[1px] bg-current'); anim(c, REDUCE ? 'bm-ap-r' : 'bm-ap', 1.55, d); grid.append(c); });
          const time = mk('span', 'tabular-nums text-muted-foreground/70'); time.setAttribute('aria-hidden', 'true');
          el.append(grid, mk('span', 'font-sans font-medium', esc(label)), time);
          const fmt = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60); const sec = (s % 60).toFixed(1); return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };
          const started = performance.now() - initial * 1000; const upd = () => { time.textContent = fmt((performance.now() - started) / 1000); }; upd(); t.every(100, upd);
          return el;
        };
        const col = mk('div', 'flex flex-col items-center gap-6'); stage.append(col);
        const main = make('Churning', 151.6, 'text-base'); col.append(main);
        await show(main, { opacity: '0', transform: 'translateY(4px)' }, { opacity: '1', transform: 'none' }, t, `opacity .3s ${EO}, transform .3s ${EO}`);
        await t.sleep(12000);
      } },

    /* -------------------------------------------------------- Citations */
    { group: 'Stream', title: 'Citations', desc: 'Numbered inline markers land with the sentence they support while the matching sources append to a collapsible reference list below, each row rising on the layout spring.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[400px]');
        const wrap = mk('div', 'w-full max-w-lg space-y-4'); stage.append(wrap);
        const ITEMS = [
          { id: 'motion', title: 'Motion documentation', domain: 'motion.dev', url: 'https://motion.dev/docs/react' },
          { id: 'wai', title: 'WAI accessibility patterns', domain: 'w3.org', url: 'https://www.w3.org/WAI/ARIA/apg/' },
          { id: 'guidelines', title: 'Motion guidelines', domain: 'Design handbook · PDF', icon: 'file-text' },
        ];
        const p = mk('p', 'text-sm leading-6 text-foreground/90'); wrap.append(p);
        const box = mk('div', 'w-full text-sm'); wrap.append(box);
        const trig = button('group -ml-1 flex min-h-8 items-center gap-2 rounded-lg px-1 text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring');
        trig.setAttribute('aria-expanded', 'true');
        trig.innerHTML = `${lu('book-open-text', 'size-4')}<span class="font-medium">Sources</span><span class="bm-count rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">0</span><span class="text-muted-foreground/60">${chev('size-3.5', true)}</span>`;
        const disc = mk('div'); const list = mk('div', 'mt-1 grid gap-0.5'); disc.append(list); box.append(trig, disc);
        let open = true; trig.onclick = () => { open = !open; trig.setAttribute('aria-expanded', open); setChev(trig, open); disclosure(disc, open); };
        const rows = {};
        const addRow = (c, i) => {
          const row = mk(c.url ? 'a' : 'div', 'group/citation flex items-center gap-2 rounded-md px-1.5 py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring');
          if (c.url) { row.href = c.url; row.target = '_blank'; row.rel = 'noreferrer noopener'; }
          const icon = c.icon ? `<span aria-hidden="true" class="grid size-5 shrink-0 place-items-center text-muted-foreground">${lu(c.icon, 'size-3.5')}</span>` : favicon(c.url);
          row.innerHTML = `${icon}<span class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5"><span class="truncate text-sm font-medium text-foreground/80 transition-colors group-hover/citation:text-foreground">${esc(c.title)}</span><span class="min-w-0 truncate text-xs text-muted-foreground/60">${esc(c.domain)}</span></span><span class="flex shrink-0 items-center gap-1.5"><span class="grid size-5 place-items-center rounded-md bg-foreground/[0.05] text-[10px] font-semibold tabular-nums text-muted-foreground">${i + 1}</span>${c.url ? lu('external-link', 'size-3.5 text-muted-foreground/40 transition-colors group-hover/citation:text-muted-foreground') : ''}</span>`;
          list.append(row); rows[c.id] = row; $('.bm-count', trig).textContent = String(i + 1); enterRow(row, t);
        };
        const marker = (i) => {
          const a = mk('a', 'mx-0.5 inline-flex min-w-4 -translate-y-0.5 items-center justify-center rounded-md bg-muted/60 px-1 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground no-underline outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', String(i + 1));
          a.href = '#'; a.setAttribute('aria-label', i === 2 ? 'Citation 3: Motion guidelines' : `View citation ${i + 1}`);
          a.onclick = (e) => { e.preventDefault(); const r = rows[ITEMS[i].id]; if (!r) return; if (!open) trig.click(); r.classList.add('bg-muted'); setTimeout(() => r.classList.remove('bg-muted'), 900); };
          return a;
        };
        const SEGS = ['Use layout-aware motion for newly appended results ', 0, ' and preserve accessible disclosure behavior ', 1, ' as the list grows, keeping exits shorter than entrances ', 2, '.'];
        await t.sleep(400);
        for (const s of SEGS) {
          if (typeof s === 'number') {
            const m = marker(s); p.append(m);
            show(m, { opacity: '0', transform: 'scale(0.6)' }, { opacity: '1', transform: 'scale(1)' }, t, `opacity .18s ${EO}, transform .32s ${SW}`);
            await t.sleep(180); addRow(ITEMS[s], s); await t.sleep(320);
          } else await streamInto(p, s, t, 38);
        }
        await t.sleep(1800); trig.click(); await t.sleep(1300); trig.click(); await t.sleep(3200);
      } },

    /* ---------------------------------------------------- Tool Approval */
    { group: 'Stream', title: 'Tool Approval', desc: 'A human-in-the-loop permission card: the requested command sits in the details, then Allow once / Always allow / Deny moves it through approving, approved, running and completed — or denied — while the details fold away.', kind: 'lib',
      async run(root, t, ctx) {
        const choice = ['once', 'always', 'deny'][(ctx.n = ((ctx.n ?? -1) + 1) % 3)];
        const stage = streamStage(root, 'min-h-[400px]');
        const wrap = mk('div', 'w-full max-w-lg'); stage.append(wrap);
        const COPY = { pending: 'Approval required', approving: 'Approving', approved: 'Approved', denied: 'Denied', running: 'Running', complete: 'Completed', error: 'Failed' };
        const BADGE = (s) => s === 'pending' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' : s === 'approving' || s === 'running' ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400' : s === 'approved' || s === 'complete' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400';
        const card = mk('div', 'w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 text-sm'); wrap.append(card);
        const head = mk('div', 'flex items-start gap-3 p-4');
        const icon = mk('span', 'mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl border border-border/60 bg-background text-muted-foreground'); icon.setAttribute('aria-hidden', 'true');
        const body = mk('div', 'min-w-0 flex-1');
        body.innerHTML = `<div class="flex min-w-0 items-start justify-between gap-3"><div class="min-w-0"><div class="bm-title font-medium text-foreground">Allow this tool to run?</div><div class="mt-0.5 truncate font-mono text-xs text-muted-foreground">terminal.run</div></div><span class="bm-badge shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors"></span></div><p class="mt-2 leading-5 text-muted-foreground">The agent wants to run the project test suite in the current workspace.</p>`;
        const det = button('mt-2 inline-flex items-center gap-1 rounded-md text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', `View details${chev('size-3.5', true)}`); det.setAttribute('aria-expanded', 'true');
        body.append(det); head.append(icon, body); card.append(head);
        const disc = mk('div');
        disc.innerHTML = `<dl class="mx-4 mb-4 grid gap-2 rounded-xl border border-border/50 bg-background/70 p-3"><div class="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-3 text-xs"><dt class="text-muted-foreground">Command</dt><dd class="min-w-0 break-words font-mono text-foreground/85"><pre class="m-0 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 font-mono text-xs leading-5 text-foreground/85"><code>${hl('bun test tests/a11y.test.tsx', 'bash')}</code></pre></dd></div><div class="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-3 text-xs"><dt class="text-muted-foreground">Directory</dt><dd class="min-w-0 break-words font-mono text-foreground/85">ui-components</dd></div></dl>`;
        card.append(disc);
        let open = true; det.onclick = () => { open = !open; det.setAttribute('aria-expanded', open); setChev(det, open); disclosure(disc, open); };
        const actions = mk('div', 'flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3');
        const allow = button('rounded-xl bg-foreground px-3 py-1.5 text-xs font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', 'Allow once');
        const always = button('rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring', 'Always allow');
        const deny = button('rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', 'Deny');
        actions.append(allow, always, deny); card.append(actions);
        let status = '';
        const set = (s) => {
          const prev = status; status = s; card.dataset.state = s; card.setAttribute('aria-busy', String(s === 'approving' || s === 'running'));
          const busy = s === 'approving' || s === 'running';
          icon.classList.toggle('text-rose-600', s === 'error');
          icon.innerHTML = busy ? lu('loader-circle', `size-4 ${REDUCE ? '' : 'animate-spin'}`) : s === 'error' ? lu('circle-alert') : s === 'denied' ? lu('x') : s === 'approved' || s === 'complete' ? lu('check') : lu('shield-check');
          $('.bm-title', body).textContent = s === 'pending' ? 'Allow this tool to run?' : 'Terminal access';
          const b = $('.bm-badge', body); b.className = `bm-badge shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${BADGE(s)}`; b.textContent = COPY[s];
          if (prev === 'pending' && s !== 'pending') {
            if (open) det.click();
            actions.style.transition = `opacity ${REDUCE ? 0.12 : 0.22}s ${EO}`; actions.style.opacity = '0'; setTimeout(() => actions.remove(), REDUCE ? 120 : 220);
          }
        };
        set('pending');
        await show(card, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .45s ${SL}`);
        await show(actions, { opacity: '0', transform: 'translateY(4px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .22s ${EO}`);
        await t.sleep(2600);
        if (choice === 'deny') { await press(deny, t); set('denied'); await t.sleep(4200); return; }
        await press(choice === 'always' ? always : allow, t);
        set('approving'); await t.sleep(600); set('approved'); await t.sleep(550); set('running'); await t.sleep(1050); set('complete');
        await t.sleep(4000);
      } },

    /* ------------------------------------------ Approval Card — questions */
    { group: 'Stream', title: 'Approval Card — Questions', desc: 'The agent asks before it continues: a single choice auto-advances after 240ms, a multi-select needs Next, a free-text constraint ends the flow, then the card settles to a one-line result.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[460px]');
        const wrap = mk('div', 'w-full max-w-lg'); stage.append(wrap);
        const Q = [
          { id: 'scope', title: 'How focused should the first release be?', options: [['focused', 'A focused starter set', 'Ship a few polished pieces first.'], ['broad', 'A broader collection', 'Cover more ground with lighter depth.'], ['flagship', 'One flagship experience', 'Pour everything into a single showcase.']], allowCustom: true, placeholder: 'Describe another scope…' },
          { id: 'checks', title: 'Which checks should block publishing?', description: 'Select every check the agent must pass before it can continue.', multiple: true, options: [['types', 'Type safety'], ['accessibility', 'Accessibility'], ['registry', 'Registry validation']] },
          { id: 'preserve', title: 'Anything the agent should preserve?', allowCustom: true, placeholder: 'Add a final constraint…' },
        ];
        const answers = {}; let step = 0;
        const card = mk('div', 'w-full overflow-hidden rounded-2xl bg-muted p-4 text-sm'); card.dataset.state = 'pending'; wrap.append(card);
        const rowEl = mk('div', 'flex items-start gap-3'); card.append(rowEl);
        const icon = mk('span', 'grid size-5 shrink-0 place-items-center text-muted-foreground', lu('circle-help')); icon.setAttribute('aria-hidden', 'true');
        const body = mk('div', 'min-w-0 flex-1'); rowEl.append(icon, body);
        const headRow = mk('div', 'flex min-w-0 items-start gap-3');
        const title = rollSlot(Q[0].title); const h3 = mk('h3', 'min-w-0 flex-1 text-base font-medium leading-5 text-foreground'); h3.append(title);
        const counter = mk('span', 'shrink-0 text-xs tabular-nums text-muted-foreground/65', `1/${Q.length}`);
        headRow.append(h3, counter); body.append(headRow);
        const disc = mk('div'); body.append(disc);
        const qHost = mk('div'); disc.append(qHost);
        const foot = mk('div', 'mt-4 flex items-center gap-3'); disc.append(foot);
        const back = button('grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50', lu('arrow-left'), 'Previous question'); back.disabled = true;
        const dots = mk('span', 'flex gap-1.5'); Q.forEach(() => { const d = mk('span', 'size-1.5 rounded-full bg-foreground'); d.style.transition = `transform .32s ${SW}, opacity .32s ${SW}`; dots.append(d); });
        const next = button('ml-auto grid size-8 place-items-center rounded-full bg-[var(--primary)] text-white transition-[opacity,width] disabled:pointer-events-none disabled:opacity-50', lu('arrow-right'), 'Next question');
        foot.append(back, dots, next);
        const paintDots = () => [...dots.children].forEach((d, i) => { d.style.transform = `scale(${i === step ? 1 : 0.75})`; d.style.opacity = i <= step ? '1' : '0.35'; });
        const answered = () => { const a = answers[Q[step].id]; return !!a && (a.selected.length > 0 || !!(a.custom || '').trim()); };
        const refreshNext = () => {
          const last = step === Q.length - 1;
          next.className = last ? `ml-auto ${btnPrimarySm}` : 'ml-auto grid size-8 place-items-center rounded-full bg-[var(--primary)] text-white transition-opacity disabled:pointer-events-none disabled:opacity-50';
          next.innerHTML = last ? `Submit response${lu('arrow-right', 'size-3.5')}` : lu('arrow-right');
          next.setAttribute('aria-label', last ? 'Submit response' : 'Next question'); next.disabled = !answered(); back.disabled = step === 0;
        };
        const ui = {};
        const renderQ = () => {
          const q = Q[step]; const a = answers[q.id] || (answers[q.id] = { selected: [], custom: '' });
          const el = mk('div'); ui.items = {};
          if (q.description) el.append(mk('p', 'mt-1 leading-5 text-muted-foreground', esc(q.description)));
          const opts = mk('div', 'mt-3');
          if (q.options) {
            const grid = mk('div', 'grid gap-0.5'); grid.setAttribute('role', q.multiple ? 'group' : 'radiogroup');
            for (const [value, label, d] of q.options) {
              const lab = mk('label', `inline-flex cursor-pointer gap-3 ${d ? 'items-start' : 'items-center'} min-h-9 rounded-lg px-1.5 py-1`);
              const ctl = button(q.multiple ? 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-muted-foreground/50 bg-background outline-none transition-colors duration-200' : 'relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/50 outline-none transition-colors duration-200');
              ctl.setAttribute('role', q.multiple ? 'checkbox' : 'radio'); ctl.setAttribute('aria-checked', 'false');
              lab.append(ctl, mk('span', 'flex min-w-0 select-none flex-col gap-0.5', `<span class="text-sm text-foreground ${d ? 'leading-4' : ''}">${esc(label)}</span>${d ? `<span class="text-xs text-muted-foreground">${esc(d)}</span>` : ''}`));
              grid.append(lab); ui.items[value] = ctl;
            }
            opts.append(grid);
          }
          if (q.allowCustom) {
            const root2 = mk('div', `flex flex-col gap-1.5 p-0.5 ${q.options ? 'mt-1.5' : ''}`);
            const field = mk('div', 'relative h-10 overflow-hidden rounded-xl bg-background/70 transition-colors duration-200 focus-within:bg-background');
            const input = mk('input', 'peer h-full w-full bg-transparent px-3 text-sm leading-6 text-foreground caret-foreground outline-none placeholder:text-muted-foreground/60'); input.placeholder = q.placeholder; input.value = a.custom;
            input.oninput = () => { a.custom = input.value; if (!q.multiple && input.value) { a.selected = []; Object.values(ui.items).forEach((c) => c.set && c.set(false)); } refreshNext(); };
            field.append(input); root2.append(field); opts.append(root2); ui.input = input;
          } else ui.input = null;
          el.append(opts);
          Object.entries(ui.items).forEach(([value, ctl]) => {
            ctl.set = (on) => {
              ctl.setAttribute('aria-checked', String(on));
              if (q.multiple) {
                ctl.className = `inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 outline-none transition-colors duration-200 ${on ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-muted-foreground/50 bg-background'}`;
                ctl.innerHTML = on ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M20 6 9 17l-5-5" style="stroke-dasharray:1;stroke-dashoffset:${REDUCE ? 0 : 1};transition:stroke-dashoffset .3s ${EO} .04s"/></svg>` : '';
                if (on && !REDUCE) tick(() => { const pth = $('path', ctl); if (pth) pth.style.strokeDashoffset = '0'; });
              } else {
                ctl.className = `relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 outline-none transition-colors duration-200 ${on ? 'border-[var(--primary)]' : 'border-muted-foreground/50'}`;
                ctl.innerHTML = on ? '<span class="absolute inset-1 rounded-full bg-[var(--primary)]"></span>' : '';
                if (on && !REDUCE) show(ctl.firstChild, { transform: 'scale(0)' }, { transform: 'scale(1)' }, t, `transform .45s ${SL}`);
              }
            };
            ctl.set(a.selected.includes(value));
            ctl.onclick = () => {
              if (q.multiple) { const on = !a.selected.includes(value); a.selected = on ? [...a.selected, value] : a.selected.filter((v) => v !== value); ctl.set(on); }
              else { a.selected = [value]; a.custom = ''; if (ui.input) ui.input.value = ''; Object.entries(ui.items).forEach(([v, c]) => c.set(v === value)); }
              refreshNext();
            };
          });
          return el;
        };
        const goTo = async (n) => {
          const old = qHost.firstChild; step = n;
          if (old && !REDUCE) { old.style.transition = `opacity .2s ${EO}, transform .2s ${EO}`; old.style.opacity = '0'; old.style.transform = 'translateX(-6px)'; await t.sleep(200); }
          if (old) old.remove();
          const el = renderQ(); qHost.append(el); title.set(Q[step].title); counter.textContent = `${step + 1}/${Q.length}`; paintDots(); refreshNext();
          if (!REDUCE) await show(el, { opacity: '0', transform: 'translateX(8px)' }, { opacity: '1', transform: 'none' }, t, `opacity .2s ${EO}, transform .2s ${EO}`);
        };
        await goTo(0);
        await show(card, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .45s ${SL}`);
        await t.sleep(1700);
        await press(ui.items.focused, t, 0.92); ui.items.focused.click();
        await t.sleep(240); await goTo(1);
        await t.sleep(1100); await press(ui.items.types, t, 0.92); ui.items.types.click();
        await t.sleep(650); await press(ui.items.accessibility, t, 0.92); ui.items.accessibility.click();
        await t.sleep(900); await press(next, t); await goTo(2);
        await t.sleep(600); ui.input.focus({ preventScroll: true }); await typeInto(ui.input, 'Keep the public API and prop names stable.', t, 38);
        await t.sleep(500); await press(next, t);
        // submitting → answered (750ms)
        card.dataset.state = 'submitting'; card.setAttribute('aria-busy', 'true'); next.disabled = true; back.disabled = true; ui.input.disabled = true;
        next.innerHTML = lu('loader-circle', `size-4 ${REDUCE ? '' : 'animate-spin'}`); icon.innerHTML = lu('loader-circle', `size-4 ${REDUCE ? '' : 'animate-spin'}`);
        await t.sleep(750);
        card.dataset.state = 'answered'; card.setAttribute('aria-busy', 'false');
        icon.className = 'grid size-5 shrink-0 place-items-center text-emerald-600 dark:text-emerald-400'; icon.innerHTML = lu('check');
        counter.className = 'shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 transition-colors dark:text-emerald-400'; counter.textContent = 'Response submitted';
        disclosure(disc, false);
        const res = mk('p', 'mt-1 text-sm text-muted-foreground', 'Three responses sent to the agent.'); body.append(res);
        show(res, { opacity: '0' }, { opacity: '1' }, t, `opacity .22s ${EO}`);
        await t.sleep(3800);
      } },

    /* --------------------------------------------- Approval Card — review */
    { group: 'Stream', title: 'Approval Card — Review', desc: 'The decision variant: the prepared release waits on Approve, Request changes or Reject; the choice submits for 700ms, the controls fold away and the badge and result line record the outcome.', kind: 'lib',
      async run(root, t, ctx) {
        const outcome = ['approved', 'changes-requested', 'rejected'][(ctx.n = ((ctx.n ?? -1) + 1) % 3)];
        const stage = streamStage(root, 'min-h-[380px]');
        const wrap = mk('div', 'w-full max-w-lg'); stage.append(wrap);
        const LABEL = { pending: 'Input required', submitting: 'Submitting', approved: 'Approved', rejected: 'Rejected', 'changes-requested': 'Changes requested' };
        const BADGE = { pending: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400', 'changes-requested': 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400', submitting: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400', approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400' };
        const ICON_CLS = { approved: 'text-emerald-600 dark:text-emerald-400', rejected: 'text-rose-600 dark:text-rose-400', 'changes-requested': 'text-amber-600 dark:text-amber-400' };
        const RESULT = { approved: 'Publishing was approved.', 'changes-requested': 'The agent will wait for revision notes.', rejected: 'Publishing was declined.' };
        const card = mk('div', 'w-full overflow-hidden rounded-2xl bg-muted p-4 text-sm'); wrap.append(card);
        card.innerHTML = `<div class="flex items-start gap-3"><span aria-hidden="true" class="bm-icon grid size-5 shrink-0 place-items-center text-muted-foreground">${lu('message-square-text')}</span><div class="bm-body min-w-0 flex-1"><div class="flex min-w-0 items-start gap-3"><h3 class="min-w-0 flex-1 text-base font-medium leading-5 text-foreground">Publish the component update?</h3><span class="bm-badge shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors"></span></div></div></div>`;
        const body = $('.bm-body', card), icon = $('.bm-icon', card), badge = $('.bm-badge', card);
        const disc = mk('div');
        disc.innerHTML = `<p class="mt-1 leading-5 text-muted-foreground">The agent has prepared the release and is waiting for your decision.</p><div class="mt-3"><dl class="grid gap-1 text-xs"><div class="flex items-center justify-between gap-4 py-1"><dt class="text-muted-foreground">Release</dt><dd class="font-mono text-foreground/80">approval-card</dd></div><div class="flex items-center justify-between gap-4 py-1"><dt class="text-muted-foreground">Checks</dt><dd class="text-foreground/80">4 passed</dd></div><div class="flex items-center justify-between gap-4 py-1"><dt class="text-muted-foreground">Visibility</dt><dd class="text-foreground/80">Public registry</dd></div></dl></div>`;
        const btns = mk('div', 'mt-4 flex flex-wrap items-center gap-2');
        const approve = button(btnPrimarySm, 'Approve'), changes = button(btnSecondarySm, 'Request changes'), reject = button(`${btnGhostSm} hover:text-rose-600 dark:hover:text-rose-400`, 'Reject');
        btns.append(approve, changes, reject); disc.append(btns); body.append(disc);
        const set = (s) => { card.dataset.state = s; card.setAttribute('aria-busy', String(s === 'submitting')); badge.className = `bm-badge shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${BADGE[s]}`; badge.textContent = LABEL[s]; };
        set('pending');
        await show(card, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .45s ${SL}`);
        await t.sleep(2600);
        await press({ approved: approve, 'changes-requested': changes, rejected: reject }[outcome], t);
        set('submitting'); [approve, changes, reject].forEach((b) => { b.disabled = true; }); icon.innerHTML = lu('loader-circle', `size-4 ${REDUCE ? '' : 'animate-spin'}`);
        await t.sleep(700);
        set(outcome); icon.className = `bm-icon grid size-5 shrink-0 place-items-center ${ICON_CLS[outcome]}`; icon.innerHTML = lu(outcome === 'rejected' ? 'x' : 'check');
        disclosure(disc, false);
        const res = mk('p', 'mt-1 text-sm text-muted-foreground', esc(RESULT[outcome])); body.append(res); show(res, { opacity: '0' }, { opacity: '1' }, t, `opacity .22s ${EO}`);
        await t.sleep(4200);
      } },

    /* -------------------------------------------------------- Todo List */
    { group: 'Stream', title: 'Todo List', desc: 'The agent\'s plan as a collapsible checklist: the active task fills a progress ring in 25% ticks, finished ones draw a check and strike through, the count rolls, and the list folds away once everything is done.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[360px]');
        const wrap = mk('div', 'w-full max-w-lg'); stage.append(wrap);
        const TASKS = ['Inspect the current data flow', 'Update the response schema', 'Add coverage for edge cases', 'Run checks and prepare the result'];
        const TICKS = 4;
        const sec = mk('section', 'w-full overflow-hidden rounded-2xl border border-border/70'); sec.setAttribute('aria-label', 'Agent task list'); wrap.append(sec);
        const trig = button('group flex h-11 w-full items-center gap-2.5 rounded-2xl px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'); trig.setAttribute('aria-expanded', 'true');
        const hIcon = mk('span', 'relative grid size-6 shrink-0 place-items-center'); hIcon.setAttribute('aria-hidden', 'true');
        const todoIco = mk('span', 'absolute grid place-items-center text-muted-foreground', lu('list-todo', 'size-4')); hIcon.append(todoIco);
        const count = rollSlot('0'); const countWrap = mk('span', 'shrink-0 text-xs font-medium tabular-nums text-muted-foreground transition-colors');
        const srCount = mk('span', 'sr-only', `0 of ${TASKS.length} tasks completed`); const vis = mk('span', 'inline-flex'); vis.setAttribute('aria-hidden', 'true'); vis.append(count, mk('span', '', '/'), mk('span', '', String(TASKS.length))); countWrap.append(srCount, vis);
        const chevWrap = mk('span', 'text-muted-foreground/50 transition-colors group-hover:text-muted-foreground', chev('size-3.5', true));
        trig.append(hIcon, mk('h3', 'min-w-0 flex-1 truncate text-sm font-medium text-foreground/90', 'Implementation plan'), countWrap, chevWrap); sec.append(trig);
        const disc = mk('div'); const vp = mk('div', 'scrollbar-hide overflow-y-auto px-2 pb-2'); vp.style.maxHeight = '248px'; const ol = mk('ol', 'space-y-0'); ol.setAttribute('aria-live', 'polite'); vp.append(ol); disc.append(vp); sec.append(disc);
        let open = true; const setOpen = (o) => { if (o === open) return; open = o; trig.setAttribute('aria-expanded', o); setChev(trig, o); disclosure(disc, o); };
        trig.onclick = () => setOpen(!open);
        const TITLE_CLS = { pending: 'text-muted-foreground/65', 'in-progress': 'text-foreground', completed: 'text-muted-foreground/60', cancelled: 'text-muted-foreground/55' };
        const rows = TASKS.map((title) => {
          const li = mk('li', 'flex min-h-9 items-center gap-2.5 rounded-xl px-1.5 py-1');
          li.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" class="bm-ico mx-0.5 size-5 shrink-0 overflow-visible text-muted-foreground transition-colors"><circle class="bm-c1" cx="12" cy="12" r="9" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="fill-opacity:0;transition:fill-opacity .18s ${EO}"/><circle class="bm-c2" cx="12" cy="12" r="9" pathLength="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="transform-origin:12px 12px;transform:rotate(-90deg);stroke-dasharray:0 1;opacity:0;transition:stroke-dasharray .5s ${SL}, opacity .5s ${SL}"/><path class="bm-ck" d="M7.5 12.25 10.5 15.25 16.75 8.75" pathLength="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1;stroke-dashoffset:1;opacity:0;transition:stroke-dashoffset .24s ${EO}, opacity .24s ${EO}"/></svg><span class="sr-only bm-sr">Pending: </span><span class="bm-title min-w-0 flex-1 truncate text-sm leading-5 transition-colors"><span class="relative inline-block max-w-full">${esc(title)}<span aria-hidden="true" class="bm-strike absolute inset-x-0 top-1/2 h-px origin-left bg-current" style="transform:scaleX(0);opacity:0;transition:transform .28s ${EO} .06s, opacity .28s ${EO} .06s"></span></span></span><span class="bm-detail shrink-0 text-sm text-muted-foreground/55"></span>`;
          ol.append(li); return li;
        });
        const paint = (li, status, progress) => {
          if (REDUCE) $$('[style]', li).forEach((n) => { n.style.transition = 'none'; });
          $('.bm-ico', li).setAttribute('class', `bm-ico mx-0.5 size-5 shrink-0 overflow-visible transition-colors ${status === 'in-progress' ? 'text-foreground' : 'text-muted-foreground'}`);
          const c1 = $('.bm-c1', li), c2 = $('.bm-c2', li), ck = $('.bm-ck', li);
          c1.style.fillOpacity = status === 'completed' ? '0.06' : '0'; c1.style.strokeDasharray = status === 'pending' ? '2 3' : 'none'; c1.style.opacity = status === 'in-progress' ? '0.2' : '1';
          const p = progress == null ? 0.68 : progress / 100;
          c2.style.strokeDasharray = `${status === 'in-progress' ? p : 0} 1`; c2.style.opacity = status === 'in-progress' ? '1' : '0';
          ck.style.strokeDashoffset = status === 'completed' ? '0' : '1'; ck.style.opacity = status === 'completed' ? '1' : '0';
          $('.bm-title', li).className = `bm-title min-w-0 flex-1 truncate text-sm leading-5 transition-colors ${TITLE_CLS[status]}`;
          const strike = $('.bm-strike', li); strike.style.transform = `scaleX(${status === 'completed' ? 1 : 0})`; strike.style.opacity = status === 'completed' ? '1' : '0';
          $('.bm-sr', li).textContent = `${status === 'in-progress' ? 'In progress' : status === 'completed' ? 'Completed' : 'Pending'}: `;
          $('.bm-detail', li).textContent = status === 'in-progress' && progress != null ? `${progress}%` : '';
        };
        let wasComplete = false;
        const apply = (s) => {
          let done = 0;
          TASKS.forEach((_, i) => {
            const status = s >= (i + 1) * TICKS ? 'completed' : s >= i * TICKS ? 'in-progress' : 'pending';
            if (status === 'completed') done++;
            paint(rows[i], status, status === 'in-progress' ? ((s % TICKS) + 1) * 25 : null);
          });
          count.set(String(done)); srCount.textContent = `${done} of ${TASKS.length} tasks completed`;
          const all = done === TASKS.length;
          countWrap.classList.toggle('text-emerald-600', all); countWrap.classList.toggle('dark:text-emerald-400', all); countWrap.classList.toggle('text-muted-foreground', !all);
          if (all && !wasComplete) {
            todoIco.style.transition = `opacity .3s ${SW}, transform .3s ${SW}`; todoIco.style.opacity = '0'; todoIco.style.transform = 'scale(0.72)';
            const done2 = mk('span', 'absolute grid place-items-center'); done2.innerHTML = `<svg viewBox="0 0 24 24" class="size-[22px] overflow-visible text-emerald-500"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M7.5 12.25 10.5 15.25 16.75 8.75" pathLength="1" fill="none" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1;stroke-dashoffset:${REDUCE ? 0 : 1};transition:stroke-dashoffset .24s ${EO}"/></svg>`;
            hIcon.append(done2);
            if (!REDUCE) { show(done2, { opacity: '0', transform: 'scale(0.72)' }, { opacity: '1', transform: 'scale(1)' }, t, `opacity .32s ${SW}, transform .32s ${SW}`); tick(() => { $('path', done2).style.strokeDashoffset = '0'; }); }
            setOpen(false);
          }
          wasComplete = all;
        };
        apply(0);
        await show(sec, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .45s ${SL}`);
        await t.sleep(700);
        for (let s = 1; s <= TASKS.length * TICKS; s++) { await t.sleep(280); apply(s); }
        await t.sleep(1800); trig.click(); await t.sleep(3200);
      } },

    /* ------------------------------------------------- Image Generation */
    { group: 'Stream', title: 'Image Generation', desc: 'A stable generated-image surface: a dither field drifts while the job is queued and generating, the image fades in blurred while refining, then sharpens as the status line rolls to "Image ready".', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[400px]');
        const wrap = mk('div', 'flex w-full max-w-xl flex-col items-center'); stage.append(wrap);
        const STATUS_TEXT = { queued: 'Waiting to generate', generating: 'Generating image', refining: 'Refining details', complete: 'Image ready' };
        const MEDIA = { queued: ['blur(4px) saturate(0.75)', 0, 1.02], generating: ['blur(3px) saturate(0.85)', 0, 1.015], refining: ['blur(1.5px) saturate(0.95)', 0.62, 1.005], complete: ['blur(0px) saturate(1)', 1, 1] };
        const OVERLAY = { queued: 1, generating: 1, refining: 0.48, complete: 0 };
        const host = mk('div', 'w-full'); host.dataset.slot = 'image-generation'; wrap.append(host);
        const inner = mk('div', 'mx-auto w-full max-w-52'); host.append(inner);
        const frameEl = mk('div', 'relative isolate w-full overflow-hidden rounded-xl bg-muted'); frameEl.style.aspectRatio = '1 / 1'; frameEl.setAttribute('role', 'img'); inner.append(frameEl);
        const media = mk('div', 'absolute inset-0 [&>*]:size-full'); Object.assign(media.style, { opacity: '0', filter: REDUCE ? '' : MEDIA.queued[0], transform: REDUCE ? '' : `scale(${MEDIA.queued[2]})` }); tick(() => { media.style.transition = REDUCE ? 'none' : `filter .4s ${EO}, opacity .4s ${EO}, transform .4s ${EO}`; });
        media.innerHTML = '<svg viewBox="0 0 800 600" aria-hidden="true" class="size-full" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bm-image-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#191b33"/><stop offset="0.48" stop-color="#60538d"/><stop offset="1" stop-color="#e59b7b"/></linearGradient><linearGradient id="bm-image-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#314946"/><stop offset="1" stop-color="#101817"/></linearGradient><radialGradient id="bm-image-glow"><stop offset="0" stop-color="#ffe6b2" stop-opacity="0.95"/><stop offset="1" stop-color="#efb47e" stop-opacity="0"/></radialGradient></defs><rect width="800" height="600" fill="url(#bm-image-sky)"/><circle cx="570" cy="210" r="150" fill="url(#bm-image-glow)"/><circle cx="570" cy="210" r="54" fill="#ffe5ad"/><path d="M0 395 120 314l92 54 132-143 116 126 78-66 92 88 170-61v288H0Z" fill="#283d43" opacity="0.9"/><path d="M0 432 118 376l99 73 115-97 107 92 112-52 108 68 141-48v188H0Z" fill="url(#bm-image-ground)"/><path d="M0 505c116-44 190-32 280 6 103 44 212 47 330-7 68-31 126-37 190-28v124H0Z" fill="#13201f"/><g fill="#c9d7c3" opacity="0.65"><circle cx="108" cy="142" r="2"/><circle cx="168" cy="102" r="1.5"/><circle cx="248" cy="154" r="2"/><circle cx="332" cy="84" r="1.5"/><circle cx="414" cy="138" r="2"/></g></svg>';
        frameEl.append(media);
        const fieldWrap = mk('div', 'absolute inset-0'); const field = mk('div', 'absolute inset-0 overflow-hidden bg-muted'); field.style.transition = `opacity ${REDUCE ? 0 : 0.4}s ${EO}`;
        const canvas = mk('canvas', 'absolute inset-0 size-full text-foreground'); field.append(canvas); fieldWrap.append(field); frameEl.append(fieldWrap);
        frameEl.insertAdjacentHTML('beforeend', '<span class="absolute top-2 right-2 z-10 rounded-full bg-background/75 px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">1024 × 1024</span>');
        const meta = mk('div', 'mt-3 text-left'); inner.append(meta);
        const statusRow = mk('div', 'flex min-h-5 items-center gap-2 text-sm font-medium text-foreground'); statusRow.setAttribute('aria-live', 'polite');
        const mark = mk('span', 'grid size-3.5 place-items-center'); const label = mk('span', 'relative inline-grid'); statusRow.append(mark, label);
        meta.append(statusRow, mk('p', 'mt-0.5 truncate text-xs text-muted-foreground', '“a quiet mountain landscape at sunset”'));
        // DitherField: a 10px dot lattice displaced around a drifting (or pointer-following) cluster.
        const ctx2 = canvas.getContext('2d'); let W = 208, H = 208, color = '#000'; const ptr = { x: 104, y: 104, tx: 104, ty: 104, inside: false };
        const resize = () => { const r = canvas.getBoundingClientRect(); W = r.width || 208; H = r.height || 208; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx2.setTransform(dpr, 0, 0, dpr, 0, 0); color = getComputedStyle(canvas).color; };
        canvas.addEventListener('pointermove', (e) => { if (REDUCE || !matchMedia('(hover: hover)').matches) return; const r = canvas.getBoundingClientRect(); ptr.inside = true; ptr.tx = e.clientX - r.left; ptr.ty = e.clientY - r.top; }, { passive: true });
        canvas.addEventListener('pointerleave', () => { ptr.inside = false; });
        const t0 = performance.now();
        const draw = () => {
          if (!canvas.isConnected) return; const time = performance.now() - t0;
          if (canvas.width === 300 || Math.abs(canvas.getBoundingClientRect().width - W) > 1) resize();
          ctx2.clearRect(0, 0, W, H);
          if (!ptr.inside) { ptr.tx = W / 2 + (REDUCE ? 0 : Math.sin(time / 1700) * W * 0.12); ptr.ty = H / 2 + (REDUCE ? 0 : Math.cos(time / 2100) * H * 0.1); }
          const follow = REDUCE ? 1 : ptr.inside ? 0.16 : 0.045; ptr.x += (ptr.tx - ptr.x) * follow; ptr.y += (ptr.ty - ptr.y) * follow;
          const radius = Math.min(W, H) * 0.38, cols = Math.ceil(W / 10) + 1, rws = Math.ceil(H / 10) + 1, ox = (W - (cols - 1) * 10) / 2, oy = (H - (rws - 1) * 10) / 2;
          ctx2.fillStyle = color;
          for (let r = 0; r < rws; r++) for (let c = 0; c < cols; c++) {
            const ax = ox + c * 10, ay = oy + r * 10, dx = ax - ptr.x, dy = ay - ptr.y, d = Math.hypot(dx, dy);
            const prox = Math.max(0, 1 - d / radius), inf = prox * prox * (3 - 2 * prox), disp = inf * inf * 9;
            ctx2.globalAlpha = 0.17 + inf * 0.72; ctx2.beginPath(); ctx2.arc(ax + (d > 0 ? dx / d : 0) * disp, ay + (d > 0 ? dy / d : 0) * disp, 0.65 + inf * 0.85, 0, Math.PI * 2); ctx2.fill();
          }
          ctx2.globalAlpha = 1;
        };
        await t.sleep(30); resize(); draw(); const loop = REDUCE ? null : t.every(16, draw);
        const setMark = (s) => {
          if (s === 'complete') { mark.innerHTML = lu('check', 'size-3.5'); mark.style.animation = ''; return; }
          if (!mark.dataset.dither) { mark.dataset.dither = '1'; mark.innerHTML = '<span aria-hidden="true" class="grid size-3.5 grid-cols-2 place-items-center gap-0.5"><span class="size-1 rounded-[1px] bg-current"></span><span class="size-1 rounded-[1px] bg-current opacity-55"></span><span class="size-1 rounded-[1px] bg-current opacity-55"></span><span class="size-1 rounded-[1px] bg-current"></span></span>'; if (!REDUCE) anim(mark.firstChild, 'bm-spin', 2.4); }
        };
        const setLabel = (text) => {
          const old = label.lastElementChild; const n = mk('span', 'col-start-1 row-start-1 whitespace-nowrap', esc(text)); label.append(n);
          if (!old || REDUCE) { if (old) old.remove(); return; }
          Object.assign(n.style, { opacity: '0', transform: 'translateY(4px)' });
          tick(() => { for (const [el, y, o] of [[old, '-4px', '0'], [n, '0', '1']]) { el.style.transition = `opacity .15s ${EO}, transform .15s ${EO}`; el.style.opacity = o; el.style.transform = `translateY(${y})`; } setTimeout(() => old.remove(), 160); });
        };
        const set = (s) => {
          host.dataset.state = s; host.setAttribute('aria-busy', String(s !== 'complete')); frameEl.setAttribute('aria-label', `${STATUS_TEXT[s]}: a quiet mountain landscape at sunset`);
          const [f, o, sc] = MEDIA[s]; if (!REDUCE) media.style.filter = f; media.style.opacity = String(o); if (!REDUCE) media.style.transform = `scale(${sc})`;
          field.style.opacity = String(OVERLAY[s]); setMark(s); setLabel(STATUS_TEXT[s]);
          if (s === 'complete') { fieldWrap.style.transition = `opacity ${REDUCE ? 0 : 0.25}s ${EO}`; fieldWrap.style.opacity = '0'; setTimeout(() => { if (loop) t.stop(loop); fieldWrap.remove(); }, 260); }
        };
        set('queued'); await t.sleep(500); set('generating'); await t.sleep(2500); set('refining'); await t.sleep(2200); set('complete');
        await t.sleep(4200);
      } },

    /* ------------------------------------------------------- Code Block */
    { group: 'Stream', title: 'Code Block', desc: 'Code written by the agent arrives a line every 260ms into a highlighted, line-numbered surface that follows the newest line; focused lines stay tinted and the header flips from Writing to Ready.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[380px]');
        const wrap = mk('div', 'w-full max-w-xl'); stage.append(wrap);
        const LINES = ['import { generateText } from "ai";', '', 'export async function summarize(input: string) {', '  const { text } = await generateText({', '    model: "openai/gpt-5",', '    prompt: `Summarize this clearly: ${input}`,', '  });', '', '  return {', '    text,', '    generatedAt: new Date().toISOString(),', '  };', '}'];
        const HL = new Set([4, 5, 6, 7]);
        const box = mk('div', 'w-full overflow-hidden rounded-2xl bg-muted/80 text-sm'); box.dataset.state = 'streaming'; box.setAttribute('aria-busy', 'true'); wrap.append(box);
        const head = mk('div', 'flex h-10 items-center gap-2.5 px-3');
        head.innerHTML = `${lu('file-code-2', 'size-3.5 shrink-0 text-muted-foreground/70')}<span class="min-w-0 truncate font-mono text-xs text-foreground/80">summarize.ts</span><span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55">typescript</span><span class="bm-st ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400">${lu('loader-circle', `size-3 ${REDUCE ? '' : 'animate-spin'}`)}Writing</span>`;
        let copied = false;
        const copy = button('grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', lu('copy', 'size-3.5'), 'Copy code'); copy.title = 'Copy code';
        copy.onclick = (e) => { if (e && e.isTrusted && navigator.clipboard) navigator.clipboard.writeText(LINES.join('\n')).catch(() => {}); copied = true; copy.innerHTML = lu('check', 'size-3.5'); copy.title = 'Copied'; copy.setAttribute('aria-label', 'Copied'); setTimeout(() => { copied = false; copy.innerHTML = lu('copy', 'size-3.5'); copy.title = 'Copy code'; copy.setAttribute('aria-label', 'Copy code'); }, 1600); };
        head.append(copy); box.append(head);
        const vp = mk('div', 'scrollbar-hide overflow-auto border-t border-foreground/[0.06] py-2'); vp.style.maxHeight = '224px'; vp.setAttribute('role', 'log'); vp.setAttribute('aria-live', 'polite');
        const pre = mk('pre', 'm-0 min-w-max font-mono text-xs leading-5 text-foreground/85'); const code = mk('code'); pre.append(code); vp.append(pre); box.append(vp);
        const addLine = (i) => {
          const row = mk('span', `grid min-h-5 grid-cols-[2.75rem_minmax(0,1fr)] ${HL.has(i + 1) ? 'bg-blue-500/[0.07]' : ''}`);
          row.innerHTML = `<span class="select-none pr-3 text-right tabular-nums text-muted-foreground/35">${i + 1}</span><span class="whitespace-pre pl-1 pr-4">${hl(LINES[i])}</span>`;
          code.append(row);
          requestAnimationFrame(() => { if (vp.scrollHeight > vp.clientHeight) vp.scrollTo({ top: vp.scrollHeight, behavior: REDUCE ? 'auto' : 'smooth' }); });
        };
        addLine(0);
        await show(box, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .22s ${EO}, transform .45s ${SL}`);
        for (let i = 1; i < LINES.length; i++) { await t.sleep(260); addLine(i); }
        box.dataset.state = 'complete'; box.setAttribute('aria-busy', 'false'); vp.removeAttribute('role'); vp.removeAttribute('aria-live');
        const st = $('.bm-st', head); st.className = 'bm-st ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400'; st.innerHTML = `${lu('check', 'size-3')}Ready`;
        await t.sleep(1200); await press(copy, t, 0.9); if (!copied) copy.click();
        await t.sleep(1400); vp.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
        await t.sleep(3600);
      } },

    /* -------------------------------------------------------- File Diff */
    { group: 'Stream', title: 'File Diff', desc: 'An edit as it is applied: diff rows land one by one with old and new line numbers, the +/− counts tick up beside the file name, and the panel folds away once the change is written.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[380px]');
        const col = mk('div', 'flex w-full max-w-lg flex-col gap-1'); stage.append(col);
        const FILES = [
          { file: 'src/runner.ts', lines: [[18, 18, 'export async function runTask() {'], [19, null, '  return execute(task);', 'removed'], [null, 19, '  const result = await execute(task);', 'added'], [null, 20, '  return normalize(result);', 'added'], [20, 21, '}']] },
          { file: 'src/runner.test.ts', lines: [[12, 12, 'it("normalizes the task result", async () => {'], [13, null, '  expect(await runTask()).toEqual(raw);', 'removed'], [null, 13, '  const result = await runTask();', 'added'], [null, 14, '  expect(result.status).toBe("ok");', 'added'], [null, 15, '  expect(result.items).toHaveLength(3);', 'added'], [14, 16, '});']] },
        ];
        function fileDiff(file) {
          const el = mk('div', 'w-full text-sm'); el.dataset.state = 'streaming'; el.setAttribute('aria-busy', 'true');
          const trig = button('group flex min-h-9 w-full items-center gap-2 rounded-md py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'); trig.setAttribute('aria-expanded', 'true');
          trig.innerHTML = `${lu('file-code-2', 'size-4 shrink-0 text-muted-foreground')}<span class="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">${esc(file)}</span><span class="flex shrink-0 items-center gap-2"><span class="bm-add font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400"></span><span class="bm-del font-mono text-xs tabular-nums text-rose-600 dark:text-rose-400"></span></span><span class="bm-st grid size-4 shrink-0 place-items-center text-muted-foreground/60">${lu('loader-circle', `size-3.5 ${REDUCE ? '' : 'animate-spin'}`)}</span><span class="shrink-0 text-muted-foreground/45 transition-colors group-hover:text-muted-foreground">${chev('size-3.5', true)}</span>`;
          const disc = mk('div'); const pad = mk('div', 'pl-6 pt-1.5'); const panel = mk('div', 'overflow-hidden rounded-xl bg-muted/80');
          const vp = mk('div', 'scrollbar-hide overflow-auto'); vp.style.maxHeight = '150px'; vp.setAttribute('aria-live', 'polite');
          const rowsEl = mk('div', 'font-mono text-xs leading-5', '<span class="sr-only">File changes</span>'); vp.append(rowsEl);
          const foot = mk('div', 'flex justify-end px-2 pb-1.5 pt-1');
          const copy = button('grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', lu('copy', 'size-3.5'), 'Copy diff');
          copy.onclick = () => { copy.innerHTML = lu('check', 'size-3.5'); setTimeout(() => { copy.innerHTML = lu('copy', 'size-3.5'); }, 1600); };
          foot.append(copy); panel.append(vp, foot); pad.append(panel); disc.append(pad); el.append(trig, disc);
          let open = true; const setOpen = (o) => { open = o; trig.setAttribute('aria-expanded', o); setChev(trig, o); disclosure(disc, o); };
          trig.onclick = () => setOpen(!open);
          let add = 0, del = 0;
          return {
            el,
            push([o, n, content, type]) {
              const r = mk('div', `grid grid-cols-[2.25rem_2.25rem_1rem_minmax(0,1fr)] ${type === 'added' ? 'bg-emerald-500/[0.07]' : type === 'removed' ? 'bg-rose-500/[0.07]' : ''}`);
              r.innerHTML = `<span class="select-none pr-2 text-right tabular-nums text-muted-foreground/40">${o ?? ''}</span><span class="select-none pr-2 text-right tabular-nums text-muted-foreground/40">${n ?? ''}</span><span class="select-none text-center ${type === 'added' ? 'text-emerald-600 dark:text-emerald-400' : type === 'removed' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground/45'}">${type === 'added' ? '+' : type === 'removed' ? '−' : ''}</span><span class="min-w-0 whitespace-pre px-1.5">${hl(content)}</span>`;
              rowsEl.append(r);
              if (type === 'added') $('.bm-add', trig).textContent = '+' + ++add;
              if (type === 'removed') $('.bm-del', trig).textContent = '−' + ++del;
              requestAnimationFrame(() => { if (open && vp.scrollHeight > vp.clientHeight) vp.scrollTo({ top: vp.scrollHeight, behavior: REDUCE ? 'auto' : 'smooth' }); });
            },
            complete() { el.dataset.state = 'complete'; el.setAttribute('aria-busy', 'false'); $('.bm-st', trig).innerHTML = lu('check', 'size-3.5'); setOpen(false); },
          };
        }
        await t.sleep(300);
        for (const f of FILES) {
          const d = fileDiff(f.file); col.append(d.el);
          await show(d.el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .2s ${EO}, transform .45s ${SL}`);
          await t.sleep(180);
          for (const line of f.lines) { d.push(line); await t.sleep(360); }
          await t.sleep(120); d.complete(); await t.sleep(900);
        }
        await t.sleep(3200);
      } },

    /* ---------------------------------------------------------- Message */
    { group: 'Stream', title: 'Message', desc: 'Conversation rows with avatars, headers and grouped bubbles: the sent message pops up from its trailing corner, the assistant types, answers stream into soft bubbles and the viewport keeps following the live edge.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[440px] py-6!');
        const vp = mk('div', 'scrollbar-hide h-[380px] w-full max-w-xl overflow-y-auto px-1'); vp.setAttribute('aria-label', 'Conversation'); vp.setAttribute('role', 'log'); stage.append(vp);
        const group = mk('div', 'flex min-h-full w-full flex-col justify-end gap-4 py-2'); vp.append(group);
        const follow = () => vp.scrollTo({ top: vp.scrollHeight, behavior: REDUCE ? 'auto' : 'smooth' });
        function message(from, { avatar, name, when, footer, variant = from === 'user' ? 'solid' : 'soft', placeholder, animateIn }) {
          const user = from === 'user';
          const art = mk('article', `group/message flex w-full items-start gap-2 ${user ? 'flex-row-reverse' : 'flex-row'}`); art.dataset.from = from; art.setAttribute('aria-label', `${from} message`);
          art.style.transformOrigin = user ? '100% 100%' : '0% 100%';
          const av = mk('div', `grid size-7 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-medium [&_svg]:size-3.5 ${user ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'} ${placeholder ? 'invisible' : ''}`, avatar ? lu(avatar) : '');
          const content = mk('div', `flex min-w-0 flex-1 flex-col gap-1.5 ${user ? 'items-end' : 'items-start'}`);
          if (name) content.append(mk('div', `flex items-center gap-1.5 px-1 text-[11px] leading-none text-muted-foreground ${user ? 'justify-end' : 'justify-start'}`, `<span class="font-medium text-foreground/70">${esc(name)}</span><span>${esc(when)}</span>`));
          const bubble = mk('div', `group/bubble flex w-full flex-col ${user ? 'items-end' : 'items-start'}`);
          const bc = mk('div', `relative z-0 min-w-9 max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${variant === 'solid' ? 'text-background' : 'text-foreground'}`);
          const surface = mk('span', `pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ${user ? 'origin-bottom-right' : 'origin-bottom-left'} ${variant === 'solid' ? 'bg-foreground' : 'bg-muted'}`); surface.setAttribute('aria-hidden', 'true');
          const text = mk('div', 'relative'); bc.append(surface, text); bubble.append(bc); content.append(bubble);
          let foot = null; if (footer) { foot = mk('div', `flex min-h-5 items-center gap-1 px-1 text-[11px] text-muted-foreground ${user ? 'justify-end' : 'justify-start'}`, esc(footer)); content.append(foot); }
          art.append(av, content); group.append(art);
          if (animateIn && !REDUCE) show(art, { opacity: '0', transform: 'translateY(8px) scale(0.95)' }, { opacity: '1', transform: 'translateY(0) scale(1)' }, t, `opacity .2s ${EO}, transform .38s ${MSG_POP}`);
          follow();
          return { art, text, foot };
        }
        const typing = () => { const s = mk('span', 'inline-flex h-6 items-center gap-1 text-muted-foreground'); s.innerHTML = '<span class="sr-only">Responding</span>'; for (let i = 0; i < 3; i++) { const d = mk('span', 'size-1 rounded-full bg-current'); d.setAttribute('aria-hidden', 'true'); if (REDUCE) d.style.opacity = '0.45'; else anim(d, 'bm-typing', 1.05, i * 0.14, EO); s.append(d); } return s; };
        async function answer(m, txt) { const ty = typing(); m.text.append(ty); follow(); await t.sleep(900); ty.remove(); const p = mk('p'); m.text.append(p); for (const w of h.words(txt)) { p.append(document.createTextNode(w)); if (w.trim()) { follow(); await t.sleep(h.rnd(26, 48)); } } }
        await t.sleep(300);
        const u1 = message('user', { avatar: 'user', name: 'You', when: 'Now', footer: 'Delivered', animateIn: true }); u1.text.textContent = 'Can you turn these notes into a launch update?';
        await t.sleep(650);
        const a1 = message('assistant', { avatar: 'bot', name: 'Assistant', when: 'Just now' });
        await answer(a1, 'Absolutely. I’ll keep it concise and lead with what changed.');
        await t.sleep(500);
        const a2 = message('assistant', { placeholder: true }); await answer(a2, 'Do you want the tone to feel more technical or more customer-facing?');
        await t.sleep(1100);
        const u2 = message('user', { avatar: 'user', name: 'You', when: 'Now', footer: 'Delivered', animateIn: true }); u2.text.textContent = 'Customer-facing, please.';
        await t.sleep(700);
        const a3 = message('assistant', { avatar: 'bot', name: 'Assistant', when: 'Just now' });
        await answer(a3, 'Launch update: conversations now stream more smoothly, stay pinned to the newest reply while it arrives, and let you scroll back without being pulled down again. Navigation is quicker, and if a response is interrupted you can pick up right where it stopped.');
        await t.sleep(3200);
      } },

    /* --------------------------------------------------- Message Bubble */
    { group: 'Stream', title: 'Message Bubble', desc: 'The bubble surface on its own: solid and soft tones pop in with one restrained overshoot, and a long assistant reply stays clamped to four faded lines until Show more lets the surface grow.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[440px]');
        const g = mk('div', 'flex w-full max-w-xl flex-col gap-3'); stage.append(g);
        const bubble = (align, variant, html) => {
          const b = mk('div', `group/bubble flex w-full flex-col ${align === 'end' ? 'items-end' : 'items-start'}`); b.dataset.align = align; b.dataset.variant = variant;
          const c = mk('div', `relative z-0 min-w-9 max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${variant === 'solid' ? 'text-background' : 'text-foreground'} [&_p+p]:mt-2`);
          const s = mk('span', `pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ${align === 'end' ? 'origin-bottom-right' : 'origin-bottom-left'} ${variant === 'solid' ? 'bg-foreground' : 'bg-muted'}`); s.setAttribute('aria-hidden', 'true');
          const inner = mk('div', 'relative', html); c.append(s, inner); b.append(c); g.append(b);
          if (!REDUCE) { show(s, { opacity: '0', transform: 'scale(0.92)' }, { opacity: '1', transform: 'scale(1)' }, t, `opacity .12s ${EO}, transform .34s ${BUBBLE_POP}`); show(inner, { opacity: '0' }, { opacity: '1' }, t, `opacity .12s ${EO} .04s`); }
          return { b, c, inner };
        };
        await t.sleep(300);
        bubble('end', 'solid', 'Can you summarize the release notes?');
        await t.sleep(800);
        bubble('start', 'soft', 'The release improves streaming, navigation, and recovery states.');
        await t.sleep(900);
        const PARAS = ['The release is ready for a focused rollout. The main conversation flow, keyboard navigation, error recovery, and reduced-motion behavior are all covered.', 'I would keep advanced workflow controls out of this version. They add configuration without improving the first-run experience, and the usage data from this release will give us a better basis for those decisions.', 'Before publishing, run the accessibility suite once more and verify the streaming behavior with a long response on a smaller viewport.'];
        const long = bubble('start', 'soft', '');
        const coll = mk('div', 'w-full'); coll.dataset.state = 'closed';
        const body = mk('div', 'bm-clamp4 overflow-hidden', PARAS.map((p) => `<p>${esc(p)}</p>`).join('')); body.id = 'bm-coll-' + Math.random().toString(36).slice(2, 8);
        const more = button('mt-2 inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', `<span class="bm-lbl">Show more</span>${chev('size-3.5')}`);
        more.setAttribute('aria-expanded', 'false'); more.setAttribute('aria-controls', body.id);
        coll.append(body, more); long.inner.append(coll);
        let open = false;
        const MASK = 'linear-gradient(to bottom,#000 68%,transparent 100%)';
        more.onclick = () => {
          const from = body.getBoundingClientRect().height; open = !open; coll.dataset.state = open ? 'open' : 'closed';
          $('.bm-lbl', more).textContent = open ? 'Show less' : 'Show more'; more.setAttribute('aria-expanded', open); setChev(more, open);
          if (REDUCE) { body.classList.toggle('bm-clamp4', !open); return; }
          let to;
          if (open) { body.classList.remove('bm-clamp4'); to = body.scrollHeight; }
          else { to = (body.classList.add('bm-clamp4'), body.getBoundingClientRect().height); body.classList.remove('bm-clamp4'); body.style.webkitMaskImage = body.style.maskImage = MASK; }
          body.style.height = from + 'px'; void body.offsetHeight; body.style.transition = `height .5s ${SL}`; body.style.height = to + 'px';
          setTimeout(() => { body.style.transition = ''; body.style.height = ''; body.style.webkitMaskImage = body.style.maskImage = ''; body.classList.toggle('bm-clamp4', !open); }, 520);
        };
        await t.sleep(2400); await press(more, t); more.click();
        await t.sleep(3400); await press(more, t); more.click();
        await t.sleep(2600);
      } },

    /* ----------------------------------------------------- Prompt Input */
    { group: 'Stream', title: 'Prompt Input', desc: 'The agent composer: the + menu offers actions, the textarea grows with the prompt, and sending swaps the arrow for a stop square while the model and actions lock — stopping hands control back.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[440px]');
        const col = mk('div', 'flex h-[360px] w-full max-w-xl flex-col justify-end'); stage.append(col);
        const form = mk('form', 'relative w-full rounded-2xl border border-border/80 bg-background p-2 transition-colors focus-within:border-foreground/25'); col.append(form);
        form.onsubmit = (e) => e.preventDefault();
        const ta = mk('textarea', 'scrollbar-hide block w-full resize-none overflow-y-auto bg-transparent px-2 pt-1.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/55');
        ta.rows = 2; ta.placeholder = 'Ask the agent to do something…'; ta.setAttribute('aria-label', 'Prompt'); ta.value = 'Review the current implementation and suggest the next improvement.';
        const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(Math.max(ta.scrollHeight, 48), 192) + 'px'; };
        ta.addEventListener('input', () => { grow(); refresh(); });
        const bar = mk('div', 'mt-1 flex min-h-8 items-center gap-1');
        const plusWrap = mk('div', 'relative');
        const plus = button('grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring', `<span aria-hidden="true" class="inline-flex" style="transition:transform .32s ${SW}">${lu('plus')}</span>`, 'Add to prompt');
        const ACTIONS = [['image', 'Attach image', 'Add a screenshot or visual reference.', 'image-plus'], ['skill', 'Use a skill', 'Give the agent a specialized workflow.', 'puzzle'], ['context', 'Add context', 'Include a file with supporting details.', 'file-text']];
        const pop = mk('div', 'absolute bottom-full left-0 z-10 mb-2 w-56 rounded-xl border border-border bg-background p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]'); pop.style.display = 'none'; pop.style.transformOrigin = '0% 100%'; pop.setAttribute('role', 'menu');
        const actBtns = {};
        for (const [v, label, d, ic] of ACTIONS) { const b = button('flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted', `<span class="mt-0.5 grid size-5 shrink-0 place-items-center text-muted-foreground">${lu(ic)}</span><span class="min-w-0"><span class="block text-sm text-foreground">${esc(label)}</span><span class="mt-0.5 block text-xs leading-4 text-muted-foreground">${esc(d)}</span></span>`); b.setAttribute('role', 'menuitem'); b.onclick = () => { notice(`${label} selected.`); setPop(false); }; pop.append(b); actBtns[v] = b; }
        plusWrap.append(plus, pop);
        let popOpen = false;
        const setPop = (o) => {
          popOpen = o; plus.firstChild.style.transform = `rotate(${o ? 45 : 0}deg)`; plus.setAttribute('aria-expanded', o);
          if (o) { pop.style.display = ''; show(pop, { opacity: '0', transform: 'scale(0.94)', clipPath: 'inset(30% 40% 0 0 round 12px)' }, { opacity: '1', transform: 'scale(1)', clipPath: 'inset(0 0 0 0 round 12px)' }, t, `opacity .2s ${EO}, transform .42s ${SL}, clip-path .32s ${EO}`); }
          else { pop.style.transition = `opacity .14s ${EO}, transform .14s ${EO}`; pop.style.opacity = '0'; pop.style.transform = 'scale(0.97)'; setTimeout(() => { if (!popOpen) pop.style.display = 'none'; }, 150); }
        };
        plus.onclick = () => setPop(!popOpen);
        const model = button('inline-flex h-8 min-w-0 max-w-52 items-center gap-1.5 rounded-xl px-2 text-xs transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring', `<span class="grid size-4 shrink-0 place-items-center text-muted-foreground">${favicon('https://openai.com', 'size-4')}</span><span class="truncate text-muted-foreground">GPT-5.2</span><span class="text-muted-foreground/60">${lu('chevron-down', 'size-3')}</span>`, 'Model');
        const send = button('ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-white transition-opacity disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring', '', 'Send prompt');
        const slot = mk('span', 'grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1'); send.append(slot);
        bar.append(plusWrap, model, send); form.append(ta, bar);
        const note = mk('div', 'h-8 px-2 pt-2 text-xs text-muted-foreground'); col.append(note);
        let loading = false, stopCb = null;
        const icon = (stop) => { const s = mk('span', 'grid place-items-center', stop ? lu('square', 'size-3 fill-current') : lu('arrow-up')); return s; };
        const swapIcon = (stop) => {
          const old = slot.firstChild; const n = icon(stop); slot.append(n);
          if (!old) return; if (REDUCE) { old.remove(); return; }
          Object.assign(n.style, { opacity: '0', transform: 'translateY(3px) scale(0.8)' });
          tick(() => { old.style.transition = n.style.transition = `opacity .32s ${SW}, transform .32s ${SW}`; Object.assign(old.style, { opacity: '0', transform: 'translateY(-3px) scale(0.8)' }); Object.assign(n.style, { opacity: '1', transform: 'none' }); setTimeout(() => old.remove(), 260); });
        };
        const refresh = () => { send.disabled = loading ? false : !ta.value.trim(); plus.disabled = model.disabled = loading; send.setAttribute('aria-label', loading ? 'Stop generating' : 'Send prompt'); };
        const notice = (txt) => {
          const old = note.firstChild; if (old) { old.style.transition = `opacity .18s ${EO}`; old.style.opacity = '0'; setTimeout(() => old.remove(), 180); }
          if (!txt) return; const p = mk('p', '', esc(txt)); setTimeout(() => { note.append(p); show(p, { opacity: '0', transform: 'translateY(3px)' }, { opacity: '1', transform: 'none' }, t, `opacity .18s ${EO}, transform .18s ${EO}`); }, old ? 190 : 0);
        };
        const setLoading = (v) => { loading = v; form.setAttribute('aria-busy', String(v)); swapIcon(v); refresh(); };
        const submit = () => { if (loading || !ta.value.trim()) return; notice(null); ta.value = ''; grow(); setLoading(true); };
        send.onclick = () => { if (loading) { if (stopCb) stopCb(); } else submit(); };
        slot.append(icon(false)); refresh();
        await t.sleep(30); grow();
        await t.sleep(1300);
        await press(plus, t, 0.95); plus.click(); await t.sleep(1100);
        actBtns.skill.classList.add('bg-muted'); await t.sleep(450); await press(actBtns.skill, t, 0.98); actBtns.skill.click(); actBtns.skill.classList.remove('bg-muted');
        await t.sleep(1300);
        await press(send, t, 0.94); submit(); await t.sleep(900); setLoading(false); notice('Prompt sent to the selected model.');
        await t.sleep(1200); ta.focus({ preventScroll: true });
        await typeInto(ta, 'Now add tests for the empty state and the error retry, then summarize what changed.', t, 30);
        await t.sleep(500); await press(send, t, 0.94); submit();
        stopCb = () => { stopCb = null; setLoading(false); };
        await t.sleep(1800); await press(send, t, 0.94); send.click();
        await t.sleep(3200);
      } },

    /* ------------------------------------------------- Loader — shapes */
    { group: 'Stream', title: 'Loader — Shapes', desc: 'Ten geometric variants of the Stream Loader at 36px: spinner, dots, bars, dot grid, Bayer dither, a shape morph, comet, gooey metaballs, Newton\'s cradle and a double helix.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[400px] px-3!');
        loaderGallery(stage, t, [['spinner', 'Spinner'], ['dots', 'Dots'], ['bars', 'Bars'], ['dot-matrix', 'Dot grid'], ['dither', 'Dither'], ['morph', 'Morph'], ['comet', 'Comet'], ['metaballs', 'Metaballs'], ['newton', 'Newton'], ['helix', 'Helix']]);
        await t.sleep(14000);
      } },

    /* --------------------------------------------- Loader — text & ASCII */
    { group: 'Stream', title: 'Loader — Text & ASCII', desc: 'The text-based Loader variants: a LOADING scramble, a looping percent bar, and the five terminal frame sets CLI agents cycle through — braille dots, line, braille ring, blocks and bounce.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[340px] px-3!');
        loaderGallery(stage, t, [['scramble', 'Scramble'], ['percent', 'Percent'], ['ascii', 'ASCII'], ['ascii-line', 'ASCII Line'], ['ascii-braille', 'ASCII Braille'], ['ascii-blocks', 'ASCII Blocks'], ['ascii-bounce', 'ASCII Bounce']]);
        await t.sleep(12000);
      } },

    /* ------------------------------------------------------ Text Reveal */
    { group: 'Stream', title: 'Text Reveal', desc: 'Word-by-word reveal: each unit rises 40% on a soft spring while a 12px blur clears, staggered 90ms, with a quieter subtitle following; the second pass splits by character.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[360px]');
        const col = mk('div', 'flex w-full flex-col items-center gap-2 text-center'); stage.append(col);
        function reveal(lines, { split = 'word', stagger = 0.09, delay = 0, blur = 12, y = '40%', cls = '' }) {
          const el = mk('span', `block ${cls}`); let idx = 0;
          for (const line of [].concat(lines)) {
            const ln = mk('span', 'block');
            for (const chunk of line.match(/\S+\s*|\s+/g) || []) {
              const units = split === 'char' ? Array.from(chunk) : [chunk];
              const holder = split === 'char' ? mk('span', 'inline-block whitespace-pre') : ln;
              for (const u of units) {
                const d = delay + idx++ * stagger; const s = mk('span', 'inline-block whitespace-pre will-change-transform'); s.textContent = u;
                if (REDUCE) { s.style.opacity = '0'; tick(() => { s.style.transition = `opacity .25s ${EO} ${d * 0.3}s`; s.style.opacity = '1'; }); }
                else { Object.assign(s.style, { opacity: '0', transform: `translateY(${y})`, filter: `blur(${blur}px)` }); tick(() => { s.style.transition = `transform .9s ${REVEAL_SPRING} ${d}s, opacity .7s ${EO} ${d}s, filter .9s ${EO} ${d}s`; Object.assign(s.style, { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' }); }); }
                holder.append(s);
              }
              if (holder !== ln) ln.append(holder);
            }
            el.append(ln);
          }
          return el;
        }
        const pass = async (split) => {
          col.innerHTML = '';
          col.append(reveal(['Motion that feels', 'considered.'], { split, stagger: split === 'char' ? 0.03 : 0.09, cls: 'text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-foreground sm:text-5xl' }));
          col.append(reveal('Word by word, with a soft blur.', { delay: 0.9, stagger: 0.05, blur: 6, y: '20%', cls: 'text-sm text-muted-foreground' }));
          await t.sleep(4300);
          col.style.transition = `opacity .3s ${EO}`; col.style.opacity = '0'; await t.sleep(320); col.innerHTML = ''; col.style.transition = ''; col.style.opacity = '1';
        };
        await t.sleep(200); await pass('word'); await pass('char');
      } },

    /* ----------------------------------------------------- Text Cascade */
    { group: 'Stream', title: 'Text Cascade', desc: 'A letter-by-letter slot roll: every 2.4s the old label\'s letters drop away while the new ones land left to right, each on the swap spring with a light blur.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const PH = ['Install skills', 'Open settings', 'Ship updates'];
        const p = mk('p', 'text-lg font-medium text-foreground'); stage.append(p);
        const wrap = mk('span', 'relative -my-[0.08em] inline-block max-w-full whitespace-nowrap py-[0.08em] align-bottom'); wrap.style.clipPath = 'inset(0 -999px)'; p.append(wrap);
        const sizer = mk('span', 'invisible inline-block whitespace-nowrap'); sizer.setAttribute('aria-hidden', 'true'); const sr = mk('span', 'sr-only'); wrap.append(sizer, sr);
        const layer = (label, enter) => {
          const l = mk('span', 'absolute left-0 top-[0.08em] inline-block whitespace-pre'); l.setAttribute('aria-hidden', 'true');
          Array.from(label).forEach((ch, i) => { const c = mk('span', 'inline-block whitespace-pre will-change-[opacity,filter,transform]'); c.textContent = ch; if (enter) { Object.assign(c.style, { opacity: '0', transform: 'translateY(105%)', filter: 'blur(3px)' }); tick(() => { c.style.transition = `opacity .32s ${SW} ${i * 0.025}s, transform .32s ${SW} ${i * 0.025}s, filter .32s ${SW} ${i * 0.025}s`; Object.assign(c.style, { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' }); }); } l.append(c); });
          return l;
        };
        const set = (label, first) => {
          sizer.innerHTML = Array.from(label).map((c) => `<span class="inline-block whitespace-pre">${esc(c)}</span>`).join(''); sr.textContent = label;
          const old = $$('[aria-hidden="true"].absolute', wrap);
          if (REDUCE) { old.forEach((o) => o.remove()); const l = layer(label, false); wrap.append(l); if (!first) show(l, { opacity: '0' }, { opacity: '1' }, t, `opacity .2s ${EO}`); return; }
          old.forEach((o) => { [...o.children].forEach((c, i) => { c.style.transition = `opacity .16s ${EO} ${i * 0.0125}s, transform .16s ${EO} ${i * 0.0125}s, filter .16s ${EO} ${i * 0.0125}s`; Object.assign(c.style, { opacity: '0', transform: 'translateY(-105%)', filter: 'blur(3px)' }); }); setTimeout(() => o.remove(), 500); });
          wrap.append(layer(label, !first));
        };
        set(PH[0], true);
        for (let i = 1; i <= 5; i++) { await t.sleep(2400); set(PH[i % PH.length], false); }
        await t.sleep(2400);
      } },

    /* ----------------------------------------------------- Text Scramble */
    { group: 'Stream', title: 'Text Scramble', desc: 'A controlled character scramble: when the status changes, unresolved positions cycle through glyphs every 40ms and settle left to right within 420–760ms, while screen readers get the final text.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const col = mk('div', 'flex w-full flex-col items-center gap-8 text-center'); stage.append(col);
        const PH = ['Inspecting the repository', 'Running the checks', 'Preparing the update'];
        const G = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/';
        const el = mk('span', 'inline-block whitespace-pre font-mono text-xl font-medium text-foreground max-w-full truncate');
        const sr = mk('span', 'sr-only'); const vis = mk('span'); vis.setAttribute('aria-hidden', 'true'); el.append(sr, vis); col.append(el);
        const btn = button('inline-flex h-9 items-center rounded-full border border-border bg-[var(--card)] px-4 text-xs font-medium text-foreground transition-colors', 'Next phrase'); col.append(btn);
        let idx = 0, run = null;
        const set = (text, first) => {
          sr.textContent = text; if (run) { t.stop(run); run = null; }
          if (first || REDUCE) { vis.textContent = text; return; }
          const chars = text.split(''); const dur = Math.min(760, Math.max(420, chars.length * 32)); const t0 = performance.now();
          const step = () => { const prog = Math.min((performance.now() - t0) / dur, 1); const settled = Math.floor(prog * chars.length); vis.textContent = chars.map((c, k) => (k < settled || c === ' ' ? c : G[Math.floor(Math.random() * G.length)])).join(''); if (prog >= 1) { t.stop(run); run = null; vis.textContent = text; } };
          step(); run = t.every(40, step);
        };
        btn.onclick = () => { idx = (idx + 1) % PH.length; set(PH[idx], false); };
        set(PH[0], true);
        for (let i = 0; i < 5; i++) { await t.sleep(2300); await press(btn, t); btn.click(); }
        await t.sleep(2400);
      } },

    /* ------------------------------------------------------ Text Shimmer */
    { group: 'Stream', title: 'Text Shimmer', desc: 'A gradient sweep clipped to the text for loading or emphasis — 2.5s per pass by default, 1.5s on the faster line — and switched off entirely under reduced motion.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[320px]');
        const col = mk('div', 'flex flex-col gap-4'); stage.append(col);
        col.innerHTML = `${streamShimmer('Loading projects…', 2.5, 'text-3xl font-semibold')}${streamShimmer('Faster shimmer', 1.5, 'text-sm')}`;
        $$('.stream-text-shimmer', col).forEach((s) => s.classList.remove('font-medium'));
        $$('.stream-text-shimmer', col).forEach((s, i) => show(s, { opacity: '0', transform: 'translateY(4px)' }, { opacity: '1', transform: 'none' }, t, `opacity .3s ${EO} ${i * 80}ms, transform .3s ${EO} ${i * 80}ms`));
        await t.sleep(10000);
      } },

    /* --------------------------------------------------------- Voice Orb */
    { group: 'Stream', title: 'Voice Orb', desc: 'A grainy liquid sphere drawn by a WebGL shader: simulated syllables and pauses drive its activity, which opens the folds, ripples the rim and nudges the orb up and wider on a critically damped spring.', kind: 'lib',
      async run(root, t) {
        const stage = streamStage(root, 'min-h-[400px]');
        const box = mk('div', 'relative aspect-square w-64 shrink-0 sm:w-72'); box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'Voice visualization'); box.dataset.slot = 'voice-orb'; stage.append(box);
        const mover = mk('div', 'size-full'); const canvas = mk('canvas', 'block size-full'); mover.append(canvas); box.append(mover);
        const fail = () => { box.innerHTML = '<div class="flex size-full items-center justify-center rounded-full border border-border bg-[var(--card)] p-8 text-center text-xs text-muted-foreground">Orb rendering unavailable</div>'; box.dataset.renderState = 'error'; };
        const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
        if (!gl) { fail(); await t.sleep(8000); return; }
        const VERT = 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';
        const FRAG = `precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform float u_activity;uniform vec3 u_base;uniform vec3 u_light;uniform vec3 u_dark;
float hash(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*0.57+noise(p*2.03+7.2)*0.28+noise(p*4.07+3.1)*0.15;}
void main(){
vec2 p=(gl_FragCoord.xy*2.0-u_resolution)/min(u_resolution.x,u_resolution.y);
float t=u_time*0.38;float angle=atan(p.y,p.x);float breath=sin(u_time*1.4)*0.008;
float ripple=sin(angle*3.0+t*2.1)*0.55+sin(angle*5.0-t*1.7)*0.30+sin(angle*2.0+t)*0.15;
p/=0.91+breath+u_activity*0.025+ripple*(0.004+u_activity*0.024);
float r2=dot(p,p);float aa=3.0/min(u_resolution.x,u_resolution.y);float alpha=1.0-smoothstep(1.0-aa,1.0,r2);
if(alpha<=0.0){gl_FragColor=vec4(0.0);return;}
vec3 normal=vec3(p,sqrt(max(0.0,1.0-r2)));vec3 flow=vec3(normal.xy*1.65,normal.z*1.4);
flow.xy+=vec2(sin(normal.y*2.6+t),cos(normal.x*2.3-t*0.8))*(0.25+u_activity*0.22);
vec3 warp=vec3(noise(flow+vec3(0.0,t,t*0.3)),noise(flow+vec3(4.7,-t*0.7,t)),noise(flow+vec3(t*0.5,9.2,-t)))-0.5;
float pigment=fbm(flow+warp*1.4+vec3(t*0.3,-t*0.2,t*0.4));
float fold=normal.x*0.50+normal.y*0.32+sin(normal.y*2.6-t)*0.30+(pigment-0.5)*0.65;
float shadow=smoothstep(-0.30,0.42,fold);vec3 color=mix(u_dark,u_base,shadow);
color=mix(color,u_light,smoothstep(0.40,0.82,pigment)*0.34);
float diffuse=max(0.0,dot(normal,normalize(vec3(-0.4,0.65,1.0))));color*=0.64+0.46*diffuse;
float shine=exp(-pow((fold+0.06)*8.0,2.0))*pow(normal.z,0.65);float innerLight=exp(-pow((fold-0.28)*4.0,2.0))*normal.z;
color=mix(color,u_light,innerLight*(0.18+u_activity*0.16));color=mix(color,mix(u_light,vec3(1.0),0.55),shine*0.78);
float gleam=pow(max(0.0,dot(normal,normalize(vec3(-0.45,0.55,1.0)))),24.0);color+=gleam*0.16;
float rim=pow(1.0-normal.z,3.0);color=mix(color,u_light,rim*(0.36+0.25*max(0.0,-normal.x)));
float grain=hash(vec3(gl_FragCoord.xy,1.0))-0.5;color+=grain*0.032;
gl_FragColor=vec4(clamp(color,0.0,1.0),alpha);}`;
        let prog;
        try {
          const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'compile'); return s; };
          prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
          if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
          gl.useProgram(prog); const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
          const a = gl.getAttribLocation(prog, 'a_position'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        } catch (e) { fail(); await t.sleep(8000); return; }
        const U = {}; ['u_resolution', 'u_time', 'u_activity', 'u_base', 'u_light', 'u_dark'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
        const rgb = (hex) => { const v = parseInt(hex.slice(1), 16); return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; };
        gl.uniform3fv(U.u_base, rgb('#e8754d')); gl.uniform3fv(U.u_light, rgb('#ffe0ac')); gl.uniform3fv(U.u_dark, rgb('#346b52'));
        const release = () => { const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); };
        let elapsed = 0, prev = 0, x = 0, v = 0; const t0 = performance.now(); let id = null;
        const draw = () => {
          if (t.dead || !canvas.isConnected) { if (id) t.stop(id); release(); return; }
          const now = performance.now();
          // Simulated syllables and pauses (the docs preview) → SPRING_GLIDE (700 / 50 / 0.5) on activity.
          const s = (now - t0) / 1000; const phrase = Math.max(0, Math.sin(s * 0.85)); const syl = Math.max(0, Math.sin(s * 9.3 + Math.sin(s * 2.1)));
          const target = REDUCE ? 0 : phrase * (0.12 + syl * syl * 0.72);
          const dt = Math.min(0.05, prev ? (now - prev) / 1000 : 0.016);
          for (let k = 0; k < 4; k++) { const d = dt / 4; v += ((700 * (target - x) - 50 * v) / 0.5) * d; x += v * d; }
          const act = Math.max(0, Math.min(1, x));
          if (!REDUCE) { elapsed += dt * (1 + act * 0.6); mover.style.transform = `translate3d(0, ${-act * 2}px, 0) scale(${1 + act * 0.04}, ${1 - act * 0.018})`; }
          prev = now;
          const dpr = Math.min(window.devicePixelRatio || 1, 2); const r = canvas.getBoundingClientRect();
          const w = Math.max(1, Math.round(r.width * dpr)), hh = Math.max(1, Math.round(r.height * dpr));
          if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; }
          gl.viewport(0, 0, w, hh); gl.uniform2f(U.u_resolution, w, hh); gl.uniform1f(U.u_time, elapsed); gl.uniform1f(U.u_activity, act);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        await t.sleep(30); draw(); if (!REDUCE) id = t.every(16, draw);
        await show(box, { opacity: '0', transform: 'scale(0.96)' }, { opacity: '1', transform: 'none' }, t, `opacity .4s ${EO}, transform .6s ${SL}`);
        await t.sleep(14000);
        if (id) t.stop(id); release();
      } },
  ];
}
