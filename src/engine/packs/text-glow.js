/* Text + Glow pack — streaming / AI-response moments, ported to vanilla JS from each
 * component's shadcn registry source (+ its demo item for example content).
 * Tokens come from the original compiled CSS (:root / .dark). */
export default function pack(h) {
  'use strict';
  const { mk, esc, REDUCE, frame } = h;

  /* ------------------------------------------------------------ easing + motion */
  function bez(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (u) => ((ax * u + bx) * u + cx) * u, sy = (u) => ((ay * u + by) * u + cy) * u, dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let u = x;
      for (let i = 0; i < 8; i++) { const e = sx(u) - x; if (Math.abs(e) < 1e-5) break; const d = dx(u); if (Math.abs(d) < 1e-6) break; u -= e / d; }
      if (u < 0 || u > 1) { let lo = 0, hi = 1; u = x; for (let i = 0; i < 20; i++) { if (sx(u) < x) lo = u; else hi = u; u = (lo + hi) / 2; } }
      return sy(u);
    };
  }
  // Motion's named eases.
  const EIO = 'cubic-bezier(0.42, 0, 0.58, 1)', EOUT = 'cubic-bezier(0, 0, 0.58, 1)', EIN = 'cubic-bezier(0.42, 0, 1, 1)';
  const fEIO = bez(0.42, 0, 0.58, 1), fEIN = bez(0.42, 0, 1, 1), fEOUT = bez(0, 0, 0.58, 1);

  /** Motion spring (stiffness/damping/mass) sampled into a CSS linear() easing + its settle duration. */
  const springCache = new Map();
  function spring(k, c, m = 1, fixedMs) {
    const key = k + '/' + c + '/' + m + '/' + (fixedMs || 0);
    if (springCache.has(key)) return springCache.get(key);
    const dt = 1 / 240; let x = 0, v = 0, time = 0; const pts = [0];
    const limit = fixedMs ? fixedMs / 1000 : 4;
    while (time < limit) {
      const a = (-k * (x - 1) - c * v) / m; v += a * dt; x += v * dt; time += dt; pts.push(x);
      if (!fixedMs && time > 0.05 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.02) break;
    }
    const n = Math.min(64, pts.length - 1), out = [];
    for (let i = 0; i <= n; i++) out.push(+pts[Math.round((i / n) * (pts.length - 1))].toFixed(4));
    out[out.length - 1] = 1;
    const res = { easing: `linear(${out.join(', ')})`, duration: Math.round(time * 1000) };
    springCache.set(key, res); return res;
  }
  /** Motion's duration/bounce spring flavour (approximation of findSpring). */
  const springDB = (dur, bounce) => { const z = Math.max(0.05, 1 - bounce), w = 6.9 / (z * dur); return spring(w * w, 2 * z * w, 1, dur * 1000); };

  const A = (el, kf, o = {}) => el.animate(kf, REDUCE ? { duration: 0, fill: 'both' } : { fill: 'both', ...o });
  const LOOP = (el, kf, o = {}) => (REDUCE ? null : el.animate(kf, { iterations: Infinity, ...o }));
  const ease = (kfs, e) => kfs.map((k) => ({ ...k, easing: e }));
  /** JS tween driven by t.every (for text / attribute values WAAPI can't drive). */
  function tween(t, ms, fn, ef = (u) => u) {
    return new Promise((res) => {
      if (REDUCE || ms <= 0) { fn(1); res(); return; }
      const t0 = performance.now(); fn(0);
      const id = t.every(16, () => { const u = Math.min(1, (performance.now() - t0) / ms); fn(ef(u)); if (u >= 1) { t.stop(id); res(); } });
    });
  }
  let uidN = 0; const uid = (p) => `${p}-${++uidN}`;

  /* -------------------------------------------------------------- icons (lucide) */
  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    loader: '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  };
  const ic = (name, cls = 'size-4', sw = 2) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 ${cls}">${ICONS[name]}</svg>`;

  /* --------------------------------------------------------------------- CSS */
  if (!document.getElementById('lib-tfx-glow-css')) {
    const PX = 'https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-pixel/GeistPixel-';
    let bars = '';
    for (let i = 0; i < 12; i++) bars += `.tfx-bars .bar:nth-child(${i + 1}){animation-delay:${(-1.2 + i * 0.1).toFixed(1)}s;transform:rotate(${i ? i * 30 : 0.0001}deg) translate(146%)}`;
    const css = `
/* Text — compiled :root / .dark (shadcn neutral oklch), Geist */
.lib-text{--radius:.625rem;--background:oklch(100% 0 0);--foreground:oklch(14.5% 0 0);--card:oklch(100% 0 0);--card-foreground:oklch(14.5% 0 0);--popover:oklch(100% 0 0);--primary:oklch(20.5% 0 0);--primary-foreground:oklch(98.5% 0 0);--secondary:oklch(97% 0 0);--secondary-foreground:oklch(20.5% 0 0);--muted:oklch(97% 0 0);--muted-foreground:oklch(55.6% 0 0);--accent:oklch(97% 0 0);--accent-foreground:oklch(20.5% 0 0);--destructive:oklch(57.7% .245 27.325);--border:oklch(92.2% 0 0);--input:oklch(92.2% 0 0);--ring:oklch(70.8% 0 0);
  font-family:"Geist","Geist Fallback",ui-sans-serif,system-ui,sans-serif;background:var(--background);color:var(--foreground);box-shadow:inset 0 0 0 1px var(--border)}
.dark .lib-text{--background:oklch(11.49% 0 0);--foreground:oklch(98.5% 0 0);--card:oklch(20.5% 0 0);--card-foreground:oklch(98.5% 0 0);--popover:oklch(20.5% 0 0);--primary:oklch(92.2% 0 0);--primary-foreground:oklch(20.5% 0 0);--secondary:oklch(22.213% 0 0);--secondary-foreground:oklch(98.5% 0 0);--muted:oklch(26.9% 0 0);--muted-foreground:oklch(70.8% 0 0);--accent:oklch(26.9% 0 0);--accent-foreground:oklch(98.5% 0 0);--destructive:oklch(70.4% .191 22.216);--border:oklch(100% 0 0/.1);--input:oklch(100% 0 0/.15);--ring:oklch(55.6% 0 0)}
.lib-text .font-mono{font-family:"Geist Mono",ui-monospace,monospace}
/* ShimmerText: currentColor text with a contrast band sweeping -100% -> 250%, repeatDelay 1.5s */
.tfx-shimmer{--shimmer-contrast:rgba(255,255,255,.6);-webkit-text-fill-color:transparent;background:currentColor linear-gradient(to right,currentColor 0%,var(--shimmer-contrast) 40%,var(--shimmer-contrast) 60%,currentColor 100%);-webkit-background-clip:text;background-clip:text;background-repeat:no-repeat;background-size:50% 200%;background-position-x:250%;animation:tfx-shimmer 3s linear infinite}
.dark .tfx-shimmer{--shimmer-contrast:rgba(0,0,0,.5)}
@keyframes tfx-shimmer{0%{background-position-x:-100%}50%{background-position-x:250%}100%{background-position-x:250%}}
/* BarsSpinner (styled-jsx block, verbatim) */
.tfx-bars{height:var(--spinner-size,20px);width:var(--spinner-size,20px)}
.tfx-bars .spinner{position:relative;top:50%;left:50%;height:var(--spinner-size,20px);width:var(--spinner-size,20px)}
.tfx-bars .bar{animation:tfx-bars-spin 1.2s linear infinite;background:var(--spinner-color);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}
${bars}
@keyframes tfx-bars-spin{0%{opacity:1}100%{opacity:.15}}
@keyframes tfx-slide-vertical{to{translate:0 var(--destination)}}
@media (prefers-reduced-motion: reduce){.tfx-shimmer{animation:none;-webkit-text-fill-color:currentColor}.tfx-bars .bar{animation:none}.tfx-marquee-item{animation:none!important}}

/* Glow — compiled :root / .dark, Geist + Geist Pixel */
.lib-glow{--background:#fff;--foreground:#171717;--card:#fff;--card-foreground:#0a0a0a;--popover:#fff;--popover-foreground:#0a0a0a;--primary:#171717;--primary-foreground:#fafafa;--secondary:#f5f5f5;--secondary-foreground:#171717;--muted:#f5f5f5;--muted-foreground:#666;--accent:#f5f5f5;--accent-foreground:#171717;--destructive:#e40014;--border:#ebebeb;--input:#e5e5e5;--ring:#a1a1a1;
  font-family:"Geist","Geist Fallback",ui-sans-serif,system-ui,sans-serif;background:var(--background);color:var(--foreground);box-shadow:inset 0 0 0 1px var(--border)}
.dark .lib-glow,.lib-glow .dark{--background:#0a0a0a;--foreground:#eee;--card:#171717;--card-foreground:#fafafa;--popover:#171717;--popover-foreground:#fafafa;--primary:#eee;--primary-foreground:#171717;--secondary:#262626;--secondary-foreground:#fafafa;--muted:#1e1e1e;--muted-foreground:#a3a3a3;--accent:#262626;--accent-foreground:#fafafa;--destructive:#ff6568;--border:#ffffff1a;--input:#ffffff26;--ring:#737373}
.lib-glow .font-mono{font-family:"Geist Mono",ui-monospace,monospace}
@font-face{font-family:GeistPixelSquare;src:url(${PX}Square.woff2) format("woff2");font-display:swap;font-weight:500}
@font-face{font-family:GeistPixelGrid;src:url(${PX}Grid.woff2) format("woff2");font-display:swap;font-weight:500}
@font-face{font-family:GeistPixelCircle;src:url(${PX}Circle.woff2) format("woff2");font-display:swap;font-weight:500}
@font-face{font-family:GeistPixelTriangle;src:url(${PX}Triangle.woff2) format("woff2");font-display:swap;font-weight:500}
@font-face{font-family:GeistPixelLine;src:url(${PX}Line.woff2) format("woff2");font-display:swap;font-weight:500}
.lib-glow .font-pixel-square{font-family:GeistPixelSquare,"Geist Mono",monospace}
.lib-glow .font-pixel-grid{font-family:GeistPixelGrid,"Geist Mono",monospace}
.lib-glow .font-pixel-circle{font-family:GeistPixelCircle,"Geist Mono",monospace}
.lib-glow .font-pixel-triangle{font-family:GeistPixelTriangle,"Geist Mono",monospace}
.lib-glow .font-pixel-line{font-family:GeistPixelLine,"Geist Mono",monospace}
@keyframes glow-caret-blink{0%,49%{opacity:1}50%,to{opacity:0}}
.glow-caret{animation:1s step-end infinite glow-caret-blink}
.glow-halo-ind{background:linear-gradient(to right,color-mix(in oklab,var(--primary) 25%,transparent),var(--primary),color-mix(in oklab,var(--primary) 25%,transparent))}
.glow-halo-fill{background:linear-gradient(to bottom,var(--primary),color-mix(in oklab,var(--primary) 85%,transparent));box-shadow:0 1px 0 rgba(255,255,255,.2) inset}
@media (prefers-reduced-motion: reduce){.glow-caret{animation:none}}
`;
    const st = document.createElement('style'); st.id = 'lib-tfx-glow-css'; st.textContent = css; document.head.append(st);
  }

  /* ------------------------------------------------------------------ shared */
  const stage = (lib, root, cls = '') => { const s = mk('div', `lib-${lib} relative flex min-h-[380px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[20px] p-6 max-[420px]:px-4 ${cls}`); root.append(s); return s; };
  const ubub = (text) => mk('div', 'ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm text-foreground', esc(text));
  const col = (s, cls = 'max-w-[460px]') => { const c = mk('div', `flex w-full flex-col gap-4 ${cls}`); s.append(c); return c; };
  const who = (label = 'Assistant') => mk('div', 'text-xs font-medium text-muted-foreground', esc(label));
  const fadeIn = (el, ms = 300, y = 4) => A(el, [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }], { duration: ms, easing: EOUT });
  async function typeChars(t, node, text, ms = 28, prop = 'textContent') { for (const ch of text) { node[prop] += ch; await t.sleep(ms * (0.6 + Math.random() * 0.8)); } }
  async function streamWords(t, node, text, ms = 40) { for (const w of text.split(/(\s+)/)) { if (!w) continue; node.append(document.createTextNode(w)); if (w.trim()) await t.sleep(ms * (0.6 + Math.random() * 0.8)); } }

  /* ============================================================== TEXT */

  /** BlurReveal: per-char opacity/blur(12px)/y:10 with stagger 0.03/speedReveal, duration 0.3/speedSegment. */
  function blurReveal(text, { delay = 0, speedReveal = 1.5, speedSegment = 0.5, cls = '' } = {}) {
    const stagger = 0.03 / speedReveal, dur = 0.3 / speedSegment;
    const p = mk('p', cls); p.append(mk('span', 'sr-only', esc(text)));
    const items = []; const ws = text.split(' ');
    ws.forEach((w, wi) => {
      const ww = mk('span', 'inline-block whitespace-nowrap'); ww.setAttribute('aria-hidden', 'true');
      for (const ch of w) { const s = mk('span', 'inline-block'); s.textContent = ch; ww.append(s); items.push(s); }
      if (wi < ws.length - 1) { const s = mk('span', 'inline-block', '&nbsp;'); ww.append(s); items.push(s); }
      p.append(ww);
    });
    items.forEach((s) => { s.style.opacity = '0'; });
    const HID = { opacity: 0, filter: 'blur(12px)', transform: 'translateY(10px)' }, VIS = { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' };
    p.play = () => { items.forEach((s, i) => A(s, [HID, VIS], { duration: dur * 1000, delay: (delay + i * stagger) * 1000, easing: EIO })); return REDUCE ? 0 : (delay + items.length * stagger + dur) * 1000; };
    p.exit = () => { const n = items.length; items.forEach((s, i) => A(s, [VIS, HID], { duration: dur * 1000, delay: (n - 1 - i) * stagger * 1000, easing: EIO })); return REDUCE ? 0 : (n * stagger + dur) * 1000; };
    return p;
  }

  /** WordsStagger: words blur(10px)/y:10 -> 0, tween easeOut `speed`s, staggerChildren `stagger`. */
  function wordsStagger(text, { stagger = 0.1, speed = 0.5, delay = 0, cls = '' } = {}) {
    const d = mk('div', `flex flex-wrap ${cls}`); const ws = text.split(' ').filter(Boolean); const spans = [];
    ws.forEach((w, i) => { const s = mk('span', 'inline-block'); s.textContent = w; if (i < ws.length - 1) s.append(mk('span', 'inline-block', '&nbsp;')); s.style.opacity = '0'; d.append(s); spans.push(s); });
    d.play = () => { spans.forEach((s, i) => A(s, [{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(10px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: speed * 1000, delay: (delay + i * stagger) * 1000, easing: EOUT })); return REDUCE ? 0 : (delay + (spans.length - 1) * stagger + speed) * 1000; };
    return d;
  }

  /** RandomizedText: each word/char fades in over 1.2s (expoOut) at delay + rand*0.2 + rand*0.03. */
  function randomized(text, { split = 'words', delay = 0.2, cls = '' } = {}) {
    const root = mk('span', cls); root.setAttribute('aria-label', text); root.style.display = 'inline-block'; root.style.wordBreak = 'break-word';
    const parts = split === 'chars' ? text.split('').map((c) => (c === ' ' ? ' ' : c)) : text.split(' ');
    const els = parts.map((p) => { const s = mk('span', split === 'words' ? 'mr-[0.25em]' : ''); s.style.display = split === 'words' ? 'inline-block' : 'inline'; s.textContent = p; s.style.opacity = '0'; root.append(s); return s; });
    root.play = () => { let max = 0; els.forEach((s) => { const d = delay + Math.random() * 0.2 + Math.random() * 0.03; max = Math.max(max, d); A(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: d * 1000, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' }); }); return REDUCE ? 0 : (max + 1.2) * 1000; };
    return root;
  }

  /** SpecialText: phase 1 grows a random-glyph run, phase 2 resolves left->right with `_` cursor. */
  const RANDOM_CHARS = '_!X$0-+*#';
  const rndChar = (prev) => { let c; do { c = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)]; } while (c === prev); return c; };
  function specialText(text, cls = '') {
    const el = mk('span', `inline-flex font-mono font-medium whitespace-pre ${cls || 'h-[1.125rem] leading-5'}`); el.textContent = ' '.repeat(text.length);
    el.play = (t, speed = 20) => new Promise((res) => {
      if (REDUCE) { el.textContent = text; res(); return; }
      let phase = 1, step = 0; const L = text.length;
      const id = t.every(speed, () => {
        const chars = [];
        if (phase === 1) {
          const cur = Math.min(step + 1, L);
          for (let i = 0; i < cur; i++) chars.push(rndChar(i > 0 ? chars[i - 1] : undefined));
          for (let i = cur; i < L; i++) chars.push(' ');
          el.textContent = chars.join('');
          if (step < L * 2 - 1) step++; else { phase = 2; step = 0; }
        } else {
          const rev = Math.floor(step / 2);
          for (let i = 0; i < rev && i < L; i++) chars.push(text[i]);
          if (rev < L) chars.push(step % 2 === 0 ? '_' : rndChar());
          for (let i = chars.length; i < L; i++) chars.push(rndChar());
          el.textContent = chars.join('');
          if (step < L * 2 - 1) step++; else { el.textContent = text; t.stop(id); res(); }
        }
      });
    });
    return el;
  }

  /** BarsSpinner: 12 bars, 1.2s opacity 1 -> .15, staggered -0.1s. */
  function barsSpinner(size = 20, color = 'currentColor') {
    const w = mk('div', 'tfx-bars shrink-0'); w.style.setProperty('--spinner-size', size + 'px'); w.style.setProperty('--spinner-color', color);
    const s = mk('div', 'spinner'); for (let i = 0; i < 12; i++) s.append(mk('div', 'bar')); w.append(s); return w;
  }

  /** Spinner: two gradient-filled arcs, spin speed slow/normal/fast. */
  function textSpinner(size = 'md', speed = 'normal') {
    const id = uid('sp'); const sz = { sm: 'h-4 w-4', default: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-8 w-8' }[size];
    const sp = { slow: 'animate-[spin_2s_linear_infinite]', normal: 'animate-spin', fast: 'animate-[spin_0.5s_linear_infinite]' }[speed];
    return mk('span', `inline-block shrink-0 ${REDUCE ? '' : sp} ${sz}`, `<svg viewBox="0 0 24 24" aria-hidden="true" role="presentation" class="h-full w-full"><defs><linearGradient id="${id}a" x1="50%" x2="50%" y1="5.271%" y2="91.793%"><stop offset="0%" stop-color="currentColor"/><stop offset="100%" stop-color="currentColor" stop-opacity=".55"/></linearGradient><linearGradient id="${id}b" x1="50%" x2="50%" y1="15.24%" y2="87.15%"><stop offset="0%" stop-color="currentColor" stop-opacity="0"/><stop offset="100%" stop-color="currentColor" stop-opacity=".55"/></linearGradient></defs><g fill="none"><path d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021" fill="url(#${id}a)" transform="translate(1.5 1.625)"/><path d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118" fill="url(#${id}b)" transform="translate(1.5 1.625)"/></g></svg>`);
  }

  /** SlideUpText: each unit rises from y:100% inside an overflow-hidden mask, ease [0.625,0.05,0,1] 0.5s. */
  function slideUp(text, { split = 'words', delay = 0, stagger = 0.1, from = 'first', cls = '' } = {}) {
    const root = mk('span', `${cls} flex flex-wrap whitespace-pre-wrap ${split === 'lines' ? 'flex-col' : ''}`);
    root.append(mk('span', 'sr-only', esc(text)));
    const units = [];
    const ws = text.split(' ');
    const groups = split === 'characters' ? ws.map((w, i) => ({ chars: Array.from(w), space: i !== ws.length - 1 }))
      : (split === 'words' ? ws : text.split('\n')).map((el, i, arr) => ({ chars: [el], space: split === 'words' && i !== arr.length - 1 }));
    groups.forEach((g) => {
      const wrap = mk('span', 'inline-flex overflow-hidden'); wrap.setAttribute('aria-hidden', 'true');
      g.chars.forEach((c) => { const m = mk('span', 'relative overflow-hidden whitespace-pre-wrap'); const i = mk('span', 'inline-block'); i.textContent = c; i.style.transform = 'translateY(100%)'; m.append(i); wrap.append(m); units.push(i); });
      if (g.space) { const m = mk('span', 'relative overflow-hidden'); const i = mk('span', 'inline-block', ' '); i.style.transform = 'translateY(100%)'; m.append(i); wrap.append(m); units.push(i); }
      root.append(wrap);
    });
    const total = units.length;
    const sd = (i) => (from === 'last' ? (total - 1 - i) * stagger : from === 'center' ? Math.abs(Math.floor(total / 2) - i) * stagger : i * stagger);
    root.play = () => { let max = 0; units.forEach((u, i) => { const d = delay + sd(i); max = Math.max(max, d); A(u, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 500, delay: d * 1000, easing: 'cubic-bezier(0.625, 0.05, 0, 1)' }); }); return REDUCE ? 0 : (max + 0.5) * 1000; };
    return root;
  }

  /** HighlightedText: black/white bar slides in (spring 300/30) under mix-blend-difference text. */
  function highlighted(text, from = 'bottom') {
    const s = mk('span', 'relative inline-flex overflow-hidden align-baseline');
    const bar = mk('span', 'absolute inset-0 -left-[0.15em] -right-[0.18em] z-0 bg-black dark:bg-white');
    const off = { left: 'translateX(-100%)', right: 'translateX(100%)', top: 'translateY(-100%)', bottom: 'translateY(100%)' }[from];
    bar.style.transform = off; s.append(bar);
    const txt = mk('span', 'relative z-10 pl-[0.15em] pr-[0.18em] text-white mix-blend-difference'); s.append(txt); s.txt = txt;
    s.play = (delay = 0) => { const sp = spring(300, 30); A(bar, [{ transform: off }, { transform: 'translate(0,0)' }], { duration: sp.duration, easing: sp.easing, delay: delay * 1000 }); };
    return s;
  }

  /** AnimatedCheckbox: path draws (easeOut .3s), strike-through grows (spring duration .4 bounce .2). */
  function animatedCheckbox(title) {
    const row = mk('div', 'flex cursor-pointer items-center gap-3 select-none');
    const box = mk('div', 'flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-muted-foreground/40 bg-transparent transition-colors duration-200');
    box.innerHTML = '<svg viewBox="0 0 20 20" class="size-full text-background"><path d="M 0 4.5 L 3.182 8 L 10 0" fill="transparent" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(5 6)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity="0"/></svg>';
    const lab = mk('div', 'relative'); const span = mk('span', 'text-base font-medium text-foreground transition-colors duration-200'); span.textContent = title;
    const strike = mk('div', 'absolute left-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-muted-foreground'); strike.style.width = '0'; strike.style.opacity = '0';
    lab.append(span, strike); row.append(box, lab);
    row.check = () => {
      box.classList.remove('border-muted-foreground/40', 'bg-transparent'); box.classList.add('bg-foreground', 'border-transparent');
      span.classList.replace('text-foreground', 'text-muted-foreground');
      const path = box.querySelector('path'); path.setAttribute('opacity', '1');
      A(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 300, easing: EOUT });
      const sp = springDB(0.4, 0.2); A(strike, [{ width: '0%', opacity: 0 }, { width: '100%', opacity: 1 }], { duration: sp.duration, easing: sp.easing });
    };
    return row;
  }

  /** CopyButton (sm): Check / Copy icons cross-fade with scale + blur(2px), 1.5s copied state. */
  function copyButton() {
    const b = mk('button', 'relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-neutral-900 transition-all duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none dark:text-neutral-50');
    b.type = 'button'; b.setAttribute('aria-label', 'Copy to clipboard');
    const on = mk('div', 'scale-70 opacity-0 blur-[2px] transition-all duration-200', ic('check', 'size-3.5'));
    const off = mk('div', 'absolute scale-100 opacity-100 blur-none transition-all duration-200', ic('copy', 'size-3.5'));
    b.append(on, off);
    b.set = (copied) => {
      on.className = `transition-all duration-200 ${copied ? 'scale-100 opacity-100 blur-none' : 'scale-70 opacity-0 blur-[2px]'}`;
      off.className = `absolute transition-all duration-200 ${copied ? 'scale-0 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-none'}`;
      b.setAttribute('aria-label', copied ? 'Copied' : 'Copy to clipboard');
    };
    b.onclick = () => { b.set(true); setTimeout(() => b.set(false), 1500); };
    return b;
  }

  /* =============================================================== GLOW */

  /** `Warp` fragment shader ported to a 2D canvas (checks shape, softness 1).
   *  The React avatar renders a 1280x720 shader box clipped by the avatar, so pixel (x,y) maps to
   *  v_patternUV = ((x-640)/scale*.01, (360-y)/scale*.01), then main() halves it. */
  const hx = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const hash2 = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  function vnoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const x1 = a + (b - a) * ux, x2 = c + (d - c) * ux; return x1 + (x2 - x1) * uy;
  }
  const WARP_BLOB = ['#ff0080', '#7928ca', '#00d4ff', '#0070f3'];
  const WARP_HALO = ['#fda4af', '#0070f3', '#fb923c', '#f472b6', '#00d4ff'];
  function warpCanvas(t, { colors = WARP_BLOB, size = 32, speed = 1, scale = 0.2, proportion = 0.54, distortion = 0.25, swirl = 0.8, iters = 10 } = {}) {
    const R = Math.max(16, Math.min(96, Math.round(size)));
    const cv = document.createElement('canvas'); cv.width = cv.height = R; cv.className = 'absolute inset-0 size-full'; cv.setAttribute('aria-hidden', 'true');
    const ctx = cv.getContext('2d'); const img = ctx.createImageData(R, R); const cols = colors.map(hx); const n = cols.length;
    const k = 0.01 / scale * 0.5, step = size / R; const prop = 0.48 * Math.sign(proportion - 0.5) * Math.sqrt(Math.abs(proportion - 0.5));
    let time = 0, last = performance.now(), spd = speed;
    const draw = () => {
      const now = performance.now(); time += ((now - last) / 1000) * spd; last = now;
      const tt = 0.0625 * (time + 118); let p = 0; const d = img.data;
      for (let j = 0; j < R; j++) {
        for (let i = 0; i < R; i++) {
          let x = ((i + 0.5) * step - 640) * k, y = (360 - (j + 0.5) * step) * k;
          const n1 = vnoise(x + tt, y + tt), n2 = vnoise(x * 2 - tt, y * 2 - tt), ang = n1 * 6.2831853;
          x += 4 * distortion * n2 * Math.cos(ang); y += 4 * distortion * n2 * Math.sin(ang);
          for (let q = 1; q < iters; q++) { x += (swirl / q) * Math.cos(tt + q * 1.5 * y); y += (swirl / q) * Math.cos(tt + q * x); }
          const shape = 0.5 + 0.5 * Math.sin(x * 4) * Math.cos(y * 4) + prop;
          const mixer = shape * (n - 1); let r = cols[0][0], g = cols[0][1], b = cols[0][2];
          for (let c = 1; c < n; c++) { const m = Math.min(1, Math.max(0, mixer - (c - 1))); r += (cols[c][0] - r) * m; g += (cols[c][1] - g) * m; b += (cols[c][2] - b) * m; }
          d[p++] = r; d[p++] = g; d[p++] = b; d[p++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    draw(); if (!REDUCE) t.every(40, draw);
    cv.setSpeed = (s) => { spd = s; };
    return cv;
  }
  /** AiBlobWarpAvatar: rounded frame + Warp + motion pulse scale [1,1.055,.99,1] rotate [0,2,-1.5,0]. */
  function blobAvatar(t, { cls = 'size-8', size = 32, colors = WARP_HALO, speed = 1.15, pulse = 5.2, frame: fr = 'ring' } = {}) {
    const av = mk('div', `relative isolate shrink-0 overflow-hidden rounded-full bg-muted ${fr === 'ring' ? 'shadow-sm shadow-foreground/10 ring-1 ring-foreground/10' : 'border border-border/10'} ${cls}`);
    const m = mk('div', 'pointer-events-none absolute inset-0 origin-center rounded-full'); av.append(m);
    const cv = warpCanvas(t, { colors, size, speed }); m.append(cv);
    let an = null;
    const setPulse = (sec) => { if (an) an.cancel(); an = LOOP(m, ease([{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.055) rotate(2deg)' }, { transform: 'scale(.99) rotate(-1.5deg)' }, { transform: 'scale(1) rotate(0deg)' }], EIO), { duration: sec * 1000 }); };
    setPulse(pulse);
    av.set = (pulseSec, spd) => { setPulse(pulseSec); cv.setSpeed(spd); };
    return av;
  }

  /** Halo rim: three blurred gradient blobs sweeping `left` along the bottom edge. */
  const RIM = {
    default: ['linear-gradient(90deg, #ff0080, #7928ca, #00d4ff, #0070f3)', 'linear-gradient(90deg, #ff4d4d, #f9cb28, #ff0080)', 'linear-gradient(90deg, #0070f3, #00d4ff, #7928ca)'],
    deleting: ['linear-gradient(90deg, #fb7185, #f43f5e, #f97316, #ec4899, #a855f7)', 'linear-gradient(90deg, #fda4af, #fb923c, #f472b6, #fb7185)', 'linear-gradient(90deg, #e11d48, #db2777, #c026d3, #9333ea)'],
    destructive: ['linear-gradient(90deg, #991b1b, #dc2626, #e11d48, #f43f5e, #be123c)', 'linear-gradient(90deg, #fb7185, #fda4af, #f87171, #fecdd3)', 'linear-gradient(90deg, #7f1d1d, #b91c1c, #dc2626)'],
  };
  const LEFTS = { idle: [['-5%', '75%', '-5%'], ['65%', '10%', '65%'], ['25%', '55%', '25%']], deleting: [['-8%', '92%', '-8%'], ['72%', '-2%', '72%'], ['35%', '62%', '35%']] };
  function rimBlobs({ round = 'rounded-full', layer = 'h-1/2', sizes, opacity = 0.5, z = '' }) {
    const wrap = mk('div', `pointer-events-none absolute inset-0 overflow-hidden ${round} ${z}`);
    const lay = mk('div', `absolute inset-x-0 bottom-0 ${layer}`); lay.style.opacity = opacity; lay.style.transition = 'opacity .25s ease-out'; wrap.append(lay);
    const blobs = sizes.map((c) => { const b = mk('div', `absolute ${c}`); lay.append(b); return b; });
    let anims = [];
    wrap.set = (grads = RIM.default, lefts = LEFTS.idle, durs = [6, 5, 4]) => {
      anims.forEach((a) => a && a.cancel());
      anims = blobs.map((b, i) => { b.style.background = grads[i]; b.style.left = lefts[i][0]; return LOOP(b, ease(lefts[i].map((l) => ({ left: l })), EIO), { duration: durs[i] * 1000 }); });
    };
    wrap.op = (o) => { lay.style.opacity = o; };
    wrap.set(); return wrap;
  }
  const FIELD_BG = { solid: 'linear-gradient(to bottom, var(--card) 0%, color-mix(in oklch, var(--card) 94%, var(--muted)) 100%)', frost: 'linear-gradient(to bottom, color-mix(in oklch, var(--card) 82%, transparent) 0%, color-mix(in oklch, var(--card) 70%, transparent) 100%)' };
  const fieldSpinner = () => mk('span', `inline-flex origin-center text-muted-foreground ${REDUCE ? '' : 'animate-spin'}`, '<svg aria-hidden="true" class="h-3.5 w-3.5" viewBox="0 0 24 24"><circle class="opacity-[0.22]" cx="12" cy="12" fill="none" r="9" stroke="currentColor" stroke-width="2.25"/><circle cx="12" cy="12" fill="none" r="9" stroke="currentColor" stroke-dasharray="14 42" stroke-linecap="round" stroke-width="2.25"/></svg>');
  /** AnimatedPlaceholder: per-glyph opacity fade, staggerChildren / charDuration (easeOut). */
  function staggerText(text, { stagger = 0.018, dur = 0.16, cls = '', glyph = 'inline-block whitespace-pre' } = {}) {
    const s = mk('span', cls); s.setAttribute('aria-hidden', 'true');
    Array.from(text).forEach((ch, i) => { const g = mk('span', glyph); g.textContent = ch; s.append(g); A(g, [{ opacity: 0 }, { opacity: 1 }], { duration: dur * 1000, delay: i * stagger * 1000, easing: EOUT }); });
    return s;
  }
  /** Trailing action slot cross-fade (opacity/scale .88, 0.2s easeOut). */
  function swapSlot(slot, el) {
    const old = slot.firstElementChild;
    if (old) { A(old, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.88)' }], { duration: 200, easing: EOUT }); setTimeout(() => old.remove(), 210); }
    if (el) { slot.append(el); A(el, [{ opacity: 0, transform: 'scale(.88)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 200, easing: EOUT }); }
  }
  /** halo-search getDeletionGlyphTiming (verbatim math). */
  function deletionTiming(sweepMs, count) {
    const sweep = sweepMs / 1000, n = Math.max(1, count), norm = Math.min(1, Math.max(0, (n - 1) / 60)), eo = 1 - (1 - norm) ** 3, f = 1 - 0.6 * eo;
    const dur = Math.max(0.12, Math.max(0.22, sweep * 0.45) * f); let step = Math.max(0.004, Math.max(0.012, sweep * 0.03) * f);
    const span = Math.max(0, n - 1) * step; if (span > 0.85) step *= 0.85 / span;
    return { dur, step, span: Math.max(0, n - 1) * step };
  }

  /** Pixel fonts. */
  const PIXEL = ['font-pixel-square', 'font-pixel-grid', 'font-pixel-circle', 'font-pixel-triangle', 'font-pixel-line'];
  const PIXEL_KEYS = ['square', 'grid', 'circle', 'triangle', 'line'];
  const PHI = (1 + Math.sqrt(5)) / 2;
  const goldenBase = (i) => Math.floor((i * PHI * 5) % 5);
  const pseudoRandom = (tick, i) => ((tick * 2654435761 + i * 340573321) >>> 0) % 5;

  /** cmdk-ish subsequence filter (command-score style: contiguous match first). */
  const subseq = (q, s) => { q = q.toLowerCase(); s = s.toLowerCase(); let i = 0; for (const c of s) if (c === q[i]) i++; return i === q.length; };

  /* ================================================================ demos */
  return [
    /* ------------------------------------------------------------ Text */
    { group: 'Text', title: 'Blur Reveal', desc: 'The reply resolves character by character out of a 12px blur, then exits in reverse stagger when the answer is regenerated.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Say hello to the new docs site.'));
        const box = mk('div', 'flex min-h-[132px] flex-col gap-1.5'); const label = who(); box.append(label); c.append(box);
        const p1 = blurReveal('Hello, World! The new docs are live: every component ships with copy-paste source, a live preview and a full props table.', { cls: 'text-[15px] leading-7' });
        box.append(p1); await t.sleep(500); await t.sleep(p1.play()); await t.sleep(1800);
        label.textContent = 'Regenerating…'; await t.sleep(p1.exit()); p1.remove();
        const p2 = blurReveal('Hello, World! Fresh docs, live previews, and source you can paste straight into your project.', { cls: 'text-[15px] leading-7' });
        box.append(p2); label.textContent = 'Assistant'; await t.sleep(p2.play()); await t.sleep(1400);
      } },

    { group: 'Text', title: 'Shimmer Text', desc: 'Agent status lines shimmer while each step runs (variant colours from the component map), then settle to muted text with a check before the answer.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Refactor the data layer and run the tests.'));
        const list = mk('div', 'flex flex-col gap-2.5'); c.append(list);
        const steps = [['Reading 4 files', ''], ['Planning the refactor', 'text-violet-600 dark:text-violet-400'], ['Running tests', 'text-emerald-600 dark:text-emerald-400'], ['Writing the summary', 'text-blue-600 dark:text-blue-400']];
        for (const [label, variant] of steps) {
          const row = mk('div', 'flex items-center gap-2 text-sm'); const icon = mk('span', 'grid size-4 place-items-center text-muted-foreground', '<span class="size-1.5 rounded-full bg-current"></span>');
          const txt = mk('span', `tfx-shimmer inline-block font-medium ${variant}`); txt.textContent = label; txt.style.animationDelay = '0s';
          row.append(icon, mk('div', 'group overflow-hidden')); row.lastChild.append(txt); list.append(row); fadeIn(row, 260);
          await t.sleep(2300);
          txt.className = 'inline-block font-medium text-muted-foreground'; icon.innerHTML = ic('check', 'size-3.5');
        }
        const ans = mk('p', 'text-[15px] leading-7'); c.append(ans);
        await streamWords(t, ans, 'All 42 tests pass. I moved fetching into a single hook and kept the public API unchanged.', 45);
        await t.sleep(1500);
      } },

    { group: 'Text', title: 'Words Stagger', desc: 'Each arriving word lifts out of a 10px blur with a 0.1s stagger; the Copy Button then lands under the answer and flips to its copied state.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('What is this kit, in one line?'));
        const box = mk('div', 'flex min-h-[150px] flex-col gap-2'); c.append(box);
        const head = wordsStagger('Your complete platform for the Design.', { cls: 'text-2xl font-semibold tracking-tight' });
        const body = wordsStagger('Copy a component, drop it in, and every animation is already tuned for production.', { stagger: 0.06, cls: 'text-[15px] leading-7 text-muted-foreground' });
        box.append(head, body);
        await t.sleep(400); await t.sleep(head.play()); await t.sleep(body.play());
        const bar = mk('div', 'flex items-center gap-1 text-muted-foreground'); const cb = copyButton(); bar.append(cb); box.append(bar); fadeIn(bar, 250);
        await t.sleep(900); cb.click(); await t.sleep(2400);
      } },

    { group: 'Text', title: 'Randomized Text', desc: 'The motto appears word by word in a random order, the rationale character by character, each on a 1.2s expo-out fade; regenerating reshuffles it.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Give me a one-line motto for launch day.'));
        const box = mk('div', 'flex min-h-[120px] flex-col gap-2'); c.append(box);
        const lines = [['You can just ship things.', 'Small, frequent releases beat one perfect launch.'], ['Small releases, every single day.', 'Momentum compounds faster than polish.']];
        for (const [i, [a, b]] of lines.entries()) {
          box.innerHTML = ''; box.append(who(i ? 'Regenerated' : 'Assistant'));
          const hd = randomized(a, { cls: 'text-2xl font-semibold tracking-tight' }); const bd = randomized(b, { split: 'chars', delay: 0.5, cls: 'text-[15px] leading-7 text-muted-foreground' });
          box.append(mk('div'), mk('div')); box.children[1].append(hd); box.children[2].append(bd);
          await t.sleep(300); const d = Math.max(hd.play(), bd.play()); await t.sleep(d + 2000);
        }
      } },

    { group: 'Text', title: 'Special Text', desc: 'Status codes scramble through _!X$0-+*# before resolving left to right behind an underscore cursor, then the plain answer streams under them.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s, 'max-w-[420px]');
        const head = specialText('TEXT EFFECTS', 'text-2xl leading-8 tracking-tight'); c.append(head);
        const rows = mk('div', 'flex flex-col gap-1.5 text-sm text-muted-foreground'); c.append(rows);
        await t.sleep(300); await head.play(t);
        for (const l of ['ANALYZING PROMPT', 'QUERYING INDEX', 'DRAFTING REPLY']) {
          const r = mk('div', 'flex items-center gap-2'); r.append(mk('span', 'font-mono text-muted-foreground/60', '›')); const st = specialText(l); r.append(st); rows.append(r);
          await st.play(t); await t.sleep(250);
        }
        const ans = mk('p', 'text-[15px] leading-7 text-foreground'); c.append(ans);
        await streamWords(t, ans, 'Found three matching components. Special Text is the one that renders this exact scramble.', 45);
        await t.sleep(1600);
      } },

    { group: 'Text', title: 'Bars Spinner', desc: 'Each tool call shows the 12-bar spinner while it runs and resolves to a check, then the answer streams below.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Compare the three hosting quotes.'));
        const list = mk('div', 'flex flex-col gap-2.5'); c.append(list);
        for (const [label, ms] of [['Searching the web', 1700], ['Reading 3 sources', 2000], ['Drafting answer', 1500]]) {
          const row = mk('div', 'flex items-center gap-2.5 text-sm'); const slot = mk('span', 'grid size-4 place-items-center'); slot.append(barsSpinner(16)); row.append(slot, mk('span', 'font-medium', esc(label)));
          list.append(row); fadeIn(row, 240); await t.sleep(ms);
          slot.innerHTML = ic('check', 'size-3.5 text-muted-foreground'); row.lastChild.classList.add('text-muted-foreground');
        }
        const ans = mk('p', 'text-[15px] leading-7'); c.append(ans);
        await streamWords(t, ans, 'Vendor B is cheapest at scale: its bandwidth tier halves the bill past 2 TB a month.', 45);
        await t.sleep(1500);
      } },

    { group: 'Text', title: 'Spinner', desc: 'The gradient-arc spinner marks thinking (md, normal speed), then sits in the Regenerate button (sm, fast) while a new answer replaces the old one.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Name our new design system.'));
        const box = mk('div', 'flex min-h-[110px] flex-col gap-3'); c.append(box);
        const think = mk('div', 'flex items-center gap-2 text-sm text-muted-foreground'); think.append(textSpinner('md', 'normal'), mk('span', '', 'Thinking')); box.append(think);
        await t.sleep(2200); think.remove();
        const ans = mk('p', 'text-[15px] leading-7 transition-opacity duration-300'); box.append(ans);
        await streamWords(t, ans, 'How about “Loom”: short, tactile, and it hints at weaving components together.', 45);
        const btn = mk('button', 'inline-flex h-8 w-fit items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted'); btn.type = 'button';
        btn.innerHTML = `${ic('rotate-ccw', 'size-3.5')}<span>Regenerate</span>`; box.append(btn); fadeIn(btn, 240);
        await t.sleep(1100);
        btn.innerHTML = ''; btn.append(textSpinner('sm', 'fast'), mk('span', '', 'Regenerating')); btn.disabled = true; ans.style.opacity = '0.4';
        await t.sleep(1800); ans.textContent = ''; ans.style.opacity = '1';
        await streamWords(t, ans, 'Try “Kiln”: it suggests things that are shaped once and fired to last.', 45);
        btn.disabled = false; btn.innerHTML = `${ic('rotate-ccw', 'size-3.5')}<span>Regenerate</span>`;
        await t.sleep(1400);
      } },

    { group: 'Text', title: 'Text Marquee', desc: 'A vertical status ticker: “Assistant is …” rolls through verbs inside the masked 40px rows while the work runs, then gives way to the answer.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s, 'max-w-[440px] items-start');
        const items = ['thinking', 'searching', 'reading', 'comparing', 'writing'];
        const outer = mk('div', 'relative flex'); const inner = mk('div', 'relative flex h-min w-min flex-row items-center gap-1 overflow-hidden');
        inner.append(mk('div', 'relative size-auto whitespace-pre text-xl font-medium tracking-tight text-muted-foreground sm:text-2xl', 'Assistant is'));
        const view = mk('div', 'relative w-auto overflow-hidden opacity-100'); view.style.height = '120px';
        view.style.maskImage = view.style.webkitMaskImage = 'linear-gradient(rgba(0,0,0,0) 0%, rgb(0,0,0) 43.6902%, rgba(0,0,0,0) 100%)';
        const list = mk('div', 'relative h-full'); list.style.setProperty('--count', items.length); list.style.setProperty('--speed', 1);
        items.forEach((w, i) => {
          const it = mk('div', 'tfx-marquee-item flex h-[40px] items-center text-xl font-medium tracking-tight sm:text-2xl', esc(w));
          it.style.setProperty('--index', i); it.style.setProperty('--origin', 'calc((var(--count) - var(--index)) * 100%)'); it.style.setProperty('--destination', 'calc((var(--index) + 1) * -100%)');
          it.style.setProperty('--duration', `calc(var(--speed) * ${items.length}s)`); it.style.setProperty('--delay', 'calc((var(--duration) / var(--count)) * var(--index) - var(--duration))');
          it.style.translate = '0 var(--origin)'; it.style.animation = 'tfx-slide-vertical var(--duration) var(--delay) infinite linear';
          if (REDUCE && i === 2) it.style.translate = '0 0';
          list.append(it);
        });
        view.append(list); inner.append(view); outer.append(inner); c.append(outer);
        await t.sleep(7000);
        A(outer, [{ opacity: 1 }, { opacity: 0.35 }], { duration: 400, easing: EOUT });
        const ans = mk('p', 'text-[15px] leading-7'); c.append(ans);
        await streamWords(t, ans, 'Done. Across the five reviews, setup time is the only consistent complaint, so lead with the one-command install.', 45);
        await t.sleep(1500);
      } },

    { group: 'Text', title: 'Gradient Wave Text', desc: 'The answer headline lands with a single radial band wave (8 bands, 4% gap, --gi -25 to 200), then the supporting line follows.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s, 'max-w-[460px] items-center text-center');
        c.append(ubub('Summarise our launch strategy in three words.'));
        const think = mk('div', 'text-sm text-muted-foreground', 'Thinking…'); c.append(think);
        const colors = ['#8d6869', '#5a8ea6', '#b9c96e', '#c7c571', '#cb706f', '#7e5e5f'], gap = 4, cnt = 8, base = 'var(--gradient-wave-base, rgb(29,29,31))';
        const stops = [`${base} calc((var(--gi) + 0) * 1%)`]; for (let i = 0; i < cnt && i < colors.length * 2; i++) stops.push(`${colors[i % colors.length]} calc((var(--gi) + ${(i + 2) * gap}) * 1%)`); stops.push(`${base} calc((var(--gi) + ${(cnt + 2) * gap}) * 1%)`);
        const wrap = mk('div', 'flex w-full items-center justify-center [--gradient-wave-base:rgb(29,29,31)] dark:[--gradient-wave-base:rgb(255,255,255)] text-4xl font-medium tracking-[-.03em] sm:text-5xl'); wrap.style.setProperty('--gi', '-25');
        const span = mk('span'); Object.assign(span.style, { textAlign: 'center', backgroundImage: `radial-gradient(circle at 50% bottom, ${stops.join(', ')})`, webkitBackgroundClip: 'text', backgroundClip: 'text', webkitTextFillColor: 'transparent', color: 'transparent', whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline-block', transform: 'translateZ(0)', paddingBottom: '20%', marginBottom: '-20%', paddingInline: '2px' });
        span.textContent = 'Just ship things.'; wrap.append(span);
        await t.sleep(1400); think.replaceWith(wrap);
        if (REDUCE) wrap.style.setProperty('--gi', '200');
        else await new Promise((res) => { let g = -25, last = performance.now(); const id = t.every(16, () => { const now = performance.now(); g += (Math.min(64, now - last) * 1) / 16.6667; last = now; if (g >= 200) { g = 200; t.stop(id); res(); } wrap.style.setProperty('--gi', String(g)); }); });
        const sub = mk('p', 'text-[15px] leading-7 text-muted-foreground'); c.append(sub);
        await streamWords(t, sub, 'Release small, release often, and let real usage decide the roadmap.', 45);
        await t.sleep(1500);
      } },

    { group: 'Text', title: 'Slide Up Text', desc: 'Release notes rise out of their masks: the title by character from the centre, the summary by word, the bullets by line.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Draft the release notes for v2.4.'));
        const box = mk('div', 'flex flex-col gap-2'); c.append(box);
        const title = slideUp('Release notes drafted', { split: 'characters', from: 'center', stagger: 0.025, cls: 'text-2xl font-semibold tracking-tight' });
        const body = slideUp('Three changes shipped this week, all backwards compatible.', { split: 'words', stagger: 0.04, cls: 'text-[15px] leading-7 text-muted-foreground' });
        const lines = slideUp('• Cold starts are 38% faster\n• Streaming responses resume after reconnect\n• New `as` prop on every text primitive', { split: 'lines', stagger: 0.12, cls: 'gap-1 text-sm leading-6' });
        box.append(title, body, lines);
        await t.sleep(400); title.play(); await t.sleep(700); body.play(); await t.sleep(900); await t.sleep(lines.play());
        await t.sleep(2200);
      } },

    { group: 'Text', title: 'Highlighted Text', desc: 'Once the answer finishes streaming, its key phrases get the sliding mix-blend-difference highlight from bottom, left and right in turn.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s);
        c.append(ubub('Why does the list re-render on every keystroke?'));
        const p = mk('p', 'text-[15px] leading-8'); c.append(p);
        const segs = [['The selector returns a new array each time, so '], ['memoize the selector', 'bottom'], [' and compare by id. Then '], ['move the fetch into a loader', 'left'], [' so typing never triggers a request. The list will '], ['render once per change', 'right'], ['.']];
        const hls = [];
        for (const [txt, from] of segs) {
          if (from) { const hl = highlighted('', from); p.append(hl); hls.push(hl); await streamWords(t, hl.txt, txt, 42); }
          else await streamWords(t, p, txt, 42);
        }
        await t.sleep(500);
        for (const hl of hls) { hl.play(); await t.sleep(650); }
        await t.sleep(2000);
      } },

    { group: 'Text', title: 'Animated Checkbox', desc: 'The agent’s plan checks itself off: each tick draws its path, and a spring strike-through runs across the finished step.', kind: 'lib',
      async run(root, t) {
        const s = stage('text', root); const c = col(s, 'max-w-[400px]');
        c.append(mk('div', 'text-xs font-medium text-muted-foreground', 'Plan · 4 steps'));
        const list = mk('div', 'flex flex-col gap-3'); c.append(list);
        const rows = ['Read the failing test', 'Patch the date parser', 'Run the test suite', 'Open a pull request'].map((x) => { const r = animatedCheckbox(x); list.append(r); return r; });
        await t.sleep(900);
        for (const r of rows) { r.check(); await t.sleep(1500); }
        const done = mk('p', 'text-sm text-muted-foreground'); c.append(done);
        await streamWords(t, done, 'All steps done. PR #214 is ready for review.', 45);
        await t.sleep(1600);
      } },

    /* ------------------------------------------------------------- Glow */
    { group: 'Glow', title: 'Text Animate', desc: 'Every TextAnimate type in turn (fadeIn, fadeInUp, popIn, shiftInUp, rollIn, whipIn, whipInUp, calmInUp), each animating one line of the agent’s progress.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[480px] items-start');
        const chip = mk('span', 'rounded-md border border-dotted border-border px-2 py-0.5 font-mono text-xs text-muted-foreground'); c.append(chip);
        const hold = mk('div', 'min-h-[96px] w-full'); c.append(hold);
        const seq = [['fadeIn', 'Thinking it through'], ['fadeInUp', 'Reading your files'], ['popIn', 'Found the bug'], ['shiftInUp', 'Writing the fix'], ['rollIn', 'Running the tests'], ['whipIn', 'All checks passed'], ['whipInUp', 'Opening a PR'], ['calmInUp', 'Ready for review']];
        for (const [type, text] of seq) {
          chip.textContent = `type="${type}"`; hold.innerHTML = '';
          const h2 = mk('h2', 'flex flex-wrap text-3xl font-black tracking-tight text-black sm:text-4xl dark:text-neutral-100'); h2.setAttribute('aria-label', text); hold.append(h2);
          const wordsArr = text.split(' '); let li = 0;
          const yType = ['shiftInUp', 'whipInUp', 'calmInUp'].includes(type);
          wordsArr.forEach((w, wi) => {
            const ws = mk('span', `mr-[0.25em] inline-flex whitespace-nowrap ${yType ? 'overflow-hidden pb-[0.12em]' : ''}`); ws.setAttribute('aria-hidden', 'true'); h2.append(ws);
            [...w].forEach((ch, ci) => {
              const l = mk('span', 'inline-block'); l.textContent = ch; ws.append(l); const i = li++;
              if (type === 'fadeIn') { const sp = spring(100, 12); A(l, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: sp.duration, easing: sp.easing, delay: (0.3 + i * 0.05) * 1000 }); }
              else if (type === 'fadeInUp') A(l, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EIO, delay: (0.2 + i * 0.1) * 1000 });
              else if (type === 'popIn') { const sp = spring(400, 15); A(l, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.1)' }], { duration: sp.duration, easing: sp.easing, delay: (0.2 + i * 0.05) * 1000 }); }
              else if (type === 'calmInUp') A(l, [{ transform: 'translateY(200%)' }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(0.125, 0.92, 0.69, 0.975)', delay: (0.2 + i * 0.01) * 1000 });
              else if (type === 'shiftInUp') A(l, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: (0.2 + i * 0.01) * 1000 });
              else if (type === 'whipInUp') A(l, [{ transform: 'translateY(200%)' }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(0.5, -0.15, 0.25, 1.05)', delay: (0.2 + i * 0.01) * 1000 });
              else if (type === 'rollIn') A(l, [{ opacity: 0, transform: 'translateY(0.25em)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.75, 1)', delay: (wi * 0.13 + ci * 0.025) * 1000 });
              else if (type === 'whipIn') A(l, [{ opacity: 0, transform: 'translateY(0.35em)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(0.85, 0.1, 0.9, 1.2)', delay: (wi * 0.13 + ci * 0.025) * 1000 });
            });
          });
          if (type === 'fadeIn' || type === 'fadeInUp') A(h2, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: EIO });
          if (type === 'popIn') { const sp = spring(550, 30); A(h2, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: sp.duration, easing: sp.easing }); }
          await t.sleep(type === 'fadeInUp' ? 2400 : 1700);
        }
        await t.sleep(600);
      } },

    { group: 'Glow', title: 'Typewriter', desc: 'In the demo’s iMessage shell, a prompt types “Build a ” and then cycles through the component’s default build prompts (count 0→60, reverse, 1s repeatDelay).', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root);
        const shell = mk('div', 'mx-auto flex w-full max-w-[420px] flex-col rounded-lg bg-neutral-900 px-px pb-px shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'); s.append(shell);
        const body = mk('div', 'flex flex-col p-4 md:px-5'); shell.append(body);
        body.append(mk('div', 'mb-2 text-sm text-neutral-500', 'iMessage'), mk('div', 'mb-3 text-xs text-neutral-500', 'Today 11:29'));
        body.append(mk('div', 'mb-3 ml-auto rounded-2xl bg-blue-500 px-4 py-2 text-white', '<span>Hey!</span>'), mk('div', 'mr-auto mb-3 rounded-2xl bg-neutral-700 px-4 py-2 text-white', '<span>What should we build today?</span>'));
        const bub = mk('div', 'mb-3 ml-auto max-w-full rounded-2xl bg-blue-500 px-4 py-2 text-white'); const p = mk('p', 'truncate text-sm font-semibold'); bub.append(p); body.append(bub);
        const baseEl = mk('span'), rep = mk('span', 'inline'), cur = mk('span', 'inline-block h-5 w-[1px] translate-y-1 bg-neutral-900'); p.append(baseEl, rep, cur);
        LOOP(cur, [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }], { duration: 1000 });
        body.append(mk('div', 'mt-3 text-xs text-neutral-500', 'Delivered'));
        const base = 'Build a ';
        const texts = ['quiz page with questions and answers', 'blog Article Details Page Layout', 'ecommerce dashboard with a sidebar', 'ui like platform.openai.com....', 'buttttton', 'aop that tracks non-standard split sleep cycles', 'transparent card to showcase achievements of a user'];
        await t.sleep(1000);
        await tween(t, 1000, (v) => { baseEl.textContent = base.slice(0, Math.round(v * base.length)); }, fEIO);
        await t.sleep(2000);
        for (let k = 0; k < 3; k++) {
          const str = texts[k];
          await tween(t, 1000, (v) => { rep.textContent = str.slice(0, Math.round(v * 60)); }, fEIN);
          await t.sleep(1000);
          await tween(t, 1000, (u) => { rep.textContent = str.slice(0, Math.round(fEIN(1 - u) * 60)); });
          await t.sleep(1000);
        }
      } },

    { group: 'Glow', title: 'Terminal Animation', desc: 'An agent works through its commands: the window slides up, each command types at 25–60ms per key, and output lines land on their own delays as the tabs advance.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root, 'min-h-[420px] justify-end'); s.classList.remove('p-6', 'max-[420px]:px-4'); s.classList.add('p-0');
        s.append(mk('div', 'absolute inset-0 bg-gradient-to-br from-violet-600/40 via-fuchsia-600/30 to-indigo-950'));
        const rootEl = mk('div', 'dark relative flex w-full justify-center'); s.append(rootEl);
        const cont = mk('div', 'relative w-full max-w-[43rem] px-3 pt-10 pb-0 sm:px-6'); rootEl.append(cont);
        const win = mk('div', 'relative flex flex-col overflow-hidden rounded-t-xl bg-[var(--card)] outline-1 outline-offset-[2px] outline-white/30'); win.style.minHeight = '20rem'; cont.append(win);
        A(win, [{ transform: 'translateY(16rem)' }, { transform: 'translateY(0)' }], { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        const content = mk('div', 'min-h-[16rem] flex-1 overflow-hidden px-5 py-5 sm:px-8 sm:py-6'); win.append(content);
        const cmdRow = mk('div', 'flex items-center gap-2 leading-relaxed'); cmdRow.append(mk('span', 'select-none font-mono text-[10px] text-muted-foreground sm:text-xs', '$'));
        const cmd = mk('div', 'whitespace-pre font-mono text-[10px] text-foreground sm:text-xs'); cmdRow.append(cmd); content.append(cmdRow);
        const out = mk('div', 'mt-1'); out.setAttribute('role', 'log'); out.setAttribute('aria-live', 'polite'); content.append(out);
        const trail = mk('div', 'mt-1 hidden items-center gap-2 leading-relaxed'); trail.append(mk('span', 'select-none font-mono text-xs text-muted-foreground', '$'), mk('span', 'glow-caret ml-0.5 inline-block h-[14px] w-[6px] translate-y-[2px] bg-muted-foreground')); content.append(trail);
        const tabsWrap = mk('div', 'flex justify-center pb-5'); const tabList = mk('div', 'inline-flex items-center gap-0 rounded-lg border border-border bg-muted/50 px-1 py-1'); tabList.setAttribute('role', 'tablist'); tabsWrap.append(tabList); win.append(tabsWrap);
        const tabs = [
          { label: 'install', command: 'npm install', lines: [['', 80], ['added 1,247 packages in 12s', 400, 'text-[#6FF7CC]'], ['', 80], ['  3 packages are looking for funding', 150, 'text-slate-400'], ['    run `npm fund` for details', 100, 'text-slate-500'], ['  +-----------------------+', 120, 'text-[#ED42B5]'], ['  |     STREAMING UI      |', 120, 'text-[#ED42B5]'], ['  |   Shadcn expanded    |', 120, 'text-[#ED42B5]'], ['  +-----------------------+', 160, 'text-[#ED42B5]'], ['', 80], ['  found 0 vulnerabilities', 250, 'text-[#ADFA1F]']] },
          { label: 'build', command: 'npm run build', lines: [['', 80], ['  ▲ Next.js 16.1.6', 300, 'text-slate-300'], ['', 80], ['  Creating an optimized production build...', 250, 'text-slate-400'], ['  ✓ Compiled successfully', 200, 'text-[#6FF7CC]'], ['  ✓ Linting and checking validity of types', 150, 'text-[#6FF7CC]'], ['  ✓ Generating static pages (12/12)', 150, 'text-[#6FF7CC]'], ['  Route (app)  /  142 kB  |  First Load JS 198 kB', 150, 'text-slate-500'], ['  Route (app)  /blog 61 kB | First Load JS 57 kB', 150, 'text-slate-500'], ['  Route (app)  /about 75 kB | First Load JS 92 kB', 150, 'text-slate-500'], ['', 80], ['  ✓ Build completed in 4.2s', 300, 'text-[#6FF7CC]']] },
          { label: 'deploy', command: 'vercel deploy --prod', lines: [['', 80], ['  Vercel CLI 39.2.0', 200, 'text-slate-400'], ['', 80], ['  > Deploying to production...', 300, 'text-[#ED42B5]'], ['', 80], ['  ✓ Building', 250, 'text-[#6FF7CC]'], ['  ✓ Uploading', 200, 'text-[#6FF7CC]'], ['  ✓ Finalizing', 200, 'text-[#6FF7CC]'], ['', 80], ['  Production: https://aisdkagents.vercel.app', 400, 'text-[#ED42B5]'], ['', 80], ['  ✓ Deployment complete', 250, 'text-[#6FF7CC]']] },
          { label: 'test', command: 'npm test', lines: [['', 80], ['  PASS  src/components/Button.test.tsx', 200, 'text-slate-400'], ['    ✓ renders correctly', 100, 'text-[#ADFA1F]'], ['    ✓ handles click events', 100, 'text-[#ADFA1F]'], ['  PASS  src/utils/format.test.ts', 150, 'text-slate-400'], ['    ✓ formats currency', 100, 'text-[#ADFA1F]'], ['    ✓ formats dates', 100, 'text-[#ADFA1F]'], ['', 80], ['  Test Suites: 2 passed, 2 total', 200, 'text-[#ADFA1F]'], ['  Tests:       4 passed, 4 total', 150, 'text-[#ADFA1F]'], ['  Time:        1.234 s', 100, 'text-slate-500']] },
        ];
        const btns = tabs.map((tb) => { const b = mk('button', 'cursor-pointer rounded-md px-3 py-1 font-mono text-xs transition-all duration-150 sm:px-3.5 sm:text-sm'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = tb.label; tabList.append(b); return b; });
        const setActive = (i) => btns.forEach((b, j) => { const on = i === j; b.dataset.state = on ? 'active' : 'inactive'; b.setAttribute('aria-selected', String(on)); b.className = `cursor-pointer rounded-md px-3 py-1 font-mono text-xs transition-all duration-150 sm:px-3.5 sm:text-sm ${on ? 'bg-[var(--primary)] font-medium text-[var(--primary-foreground)]' : 'text-muted-foreground hover:text-foreground'}`; });
        const caret = () => mk('span', 'glow-caret ml-0.5 inline-block h-[14px] w-[6px] translate-y-[2px] bg-muted-foreground');
        for (const i of [1, 3, 2]) {
          const tb = tabs[i]; setActive(i); out.innerHTML = ''; cmd.textContent = ''; trail.classList.add('hidden'); trail.classList.remove('flex');
          const cc = caret(); cmdRow.append(cc);
          await t.sleep(300);
          for (let k = 0; k <= tb.command.length; k++) { cmd.textContent = tb.command.slice(0, k); await t.sleep(25 + Math.random() * 35); }
          await t.sleep(250); cc.remove();
          for (const [text, delay, color] of tb.lines) { const ln = mk('div', 'leading-relaxed'); ln.append(mk('span', `whitespace-pre font-mono text-[10px] sm:text-xs ${color || 'text-muted-foreground'}`)); ln.firstChild.textContent = text || ' '; out.append(ln); await t.sleep(delay); }
          trail.classList.remove('hidden'); trail.classList.add('flex');
          await t.sleep(1400);
        }
      } },

    { group: 'Glow', title: 'AI Instructions', desc: 'The instructions popover opens from the composer; it filters on “code”, two instructions are switched on, and the next answer streams with them applied.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root, 'min-h-[420px] justify-end');
        const c = col(s, 'max-w-md gap-3');
        const chat = mk('div', 'flex min-h-[40px] flex-col gap-2'); c.append(chat);
        const chips = mk('div', 'hidden rounded-lg border border-border bg-muted/50 p-3'); c.append(chips);
        const card = mk('div', 'relative rounded-lg border border-border bg-[var(--card)] p-3'); c.append(card);
        card.append(mk('p', 'mb-2 text-sm text-muted-foreground', 'Ask anything…'));
        const bar = mk('div', 'flex items-center justify-between'); card.append(bar);
        const trig = mk('button', 'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--accent)]'); trig.type = 'button'; bar.append(trig);
        bar.append(mk('span', 'grid size-8 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]', ic('send', 'size-3.5')));
        const INS = [
          { id: 'concise', title: 'Be Concise', description: 'Keep responses short and to the point' },
          { id: 'code-examples', title: 'Include Code Examples', description: 'Always include relevant code snippets' },
          { id: 'explain-reasoning', title: 'Explain Your Reasoning', description: 'Walk through your thought process step by step' },
          { id: 'typescript', title: 'Prefer TypeScript', description: 'Use TypeScript over JavaScript when possible' },
          { id: 'accessibility', title: 'Consider Accessibility', description: 'Ensure solutions are accessible to all users' },
        ];
        const active = new Set(['concise']);
        const renderTrig = () => { trig.innerHTML = `${ic('settings', 'size-3.5')}Instructions${active.size ? `<span class="inline-flex size-4 items-center justify-center rounded-full bg-[var(--primary)] text-[0.625rem] text-[var(--primary-foreground)]">${active.size}</span>` : ''}`; };
        renderTrig();
        const pop = mk('div', 'absolute bottom-[calc(100%-2rem)] left-1 z-50 w-80 max-w-[calc(100%-0.5rem)] overflow-hidden rounded-md border border-border bg-[var(--popover)] p-0 text-[var(--popover-foreground)] shadow-md'); pop.style.display = 'none';
        const searchRow = mk('div', 'flex h-9 items-center gap-2 border-b border-border px-3'); searchRow.innerHTML = ic('search', 'size-4 opacity-50');
        const sInput = mk('div', 'flex h-10 w-full items-center bg-transparent py-3 text-sm'); searchRow.append(sInput);
        const list = mk('div', 'max-h-56 overflow-y-auto overflow-x-hidden');
        const group = mk('div', 'overflow-hidden p-1 text-foreground'); group.append(mk('div', 'px-2 py-1.5 text-xs font-medium text-muted-foreground', 'Available Instructions'));
        const items = mk('div'); group.append(items); list.append(group);
        const empty = mk('div', 'hidden py-6 text-center text-sm', 'No instructions found.'); list.prepend(empty);
        const foot = mk('div', 'border-t border-border p-1'); foot.append(mk('div', 'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground', `${ic('plus', 'size-3.5')}New Instruction`));
        pop.append(searchRow, list, foot); card.append(pop);
        let q = '', sel = 0, shown = [];
        const render = () => {
          shown = INS.filter((x) => !q || subseq(q, x.title)).sort((a, b) => (q ? (b.title.toLowerCase().includes(q) ? 1 : 0) - (a.title.toLowerCase().includes(q) ? 1 : 0) : 0));
          items.innerHTML = ''; empty.classList.toggle('hidden', shown.length > 0); group.classList.toggle('hidden', !shown.length);
          shown.forEach((x, i) => {
            const on = active.has(x.id), first = i === 0, last = i === shown.length - 1;
            const it = mk('div', `group/instruction-item relative flex cursor-pointer items-start gap-3 px-2 py-2 text-sm select-none ${first ? 'rounded-t-md' : ''} ${last ? 'rounded-b-md' : ''} ${on || i === sel ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : ''}`);
            it.dataset.checked = String(on);
            it.innerHTML = `<div class="mt-0.5 flex size-4 shrink-0 items-center justify-center border ${on ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-muted-foreground/30'}">${on ? ic('check', 'size-3', 2.5) : ''}</div><div class="flex min-w-0 flex-1 flex-col gap-0.5"><span class="text-xs font-medium text-foreground">${esc(x.title)}</span><span class="line-clamp-2 text-xs text-muted-foreground">${esc(x.description)}</span></div>`;
            items.append(it);
          });
          sInput.innerHTML = q ? `<span class="text-foreground">${esc(q)}</span>` : '<span class="text-muted-foreground">Search instructions...</span>';
        };
        render();
        await t.sleep(900);
        trig.classList.add('bg-[var(--accent)]'); await t.sleep(250);
        pop.style.display = ''; A(pop, [{ opacity: 0, transform: 'translateY(8px) scale(.95)' }, { opacity: 1, transform: 'none' }], { duration: 150, easing: EOUT });
        await t.sleep(900);
        for (const ch of 'code') { q += ch; sel = 0; render(); await t.sleep(160); }
        await t.sleep(700); active.add('code-examples'); render(); renderTrig(); await t.sleep(800);
        q = ''; sel = 0; render(); await t.sleep(500);
        for (let i = 1; i <= 2; i++) { sel = i; render(); await t.sleep(380); }
        active.add('explain-reasoning'); render(); renderTrig(); await t.sleep(900);
        A(pop, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(8px) scale(.95)' }], { duration: 120, easing: EIN }); await t.sleep(130); pop.style.display = 'none'; trig.classList.remove('bg-[var(--accent)]');
        chips.classList.remove('hidden'); chips.innerHTML = `<p class="mb-2 text-xs font-medium">Active (${active.size}):</p><div class="flex flex-wrap gap-1.5">${INS.filter((x) => active.has(x.id)).map((x) => `<span class="rounded-md bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] px-2 py-0.5 text-xs text-[var(--primary)]">${esc(x.title)}</span>`).join('')}</div>`; fadeIn(chips, 240);
        await t.sleep(500);
        chat.append(ubub('Debounce the search input?'));
        const ans = mk('div', 'flex flex-col gap-2 text-sm leading-6'); chat.append(ans);
        const p = mk('p'); ans.append(p);
        await streamWords(t, p, 'Reasoning: every keystroke fires a fetch, so wait 250ms of silence first.', 40);
        const pre = mk('pre', 'overflow-x-auto rounded-md border border-border bg-muted/50 p-2 font-mono text-xs'); ans.append(pre);
        await typeChars(t, pre, 'const q = useDebounce(value, 250)', 18);
        await t.sleep(1500);
      } },

    { group: 'Glow', title: 'Pixel Heading (Character)', desc: 'A “Thinking” label in Geist Pixel. Every character cycles fonts on a 50ms tick in multi, wave and random modes, and the label reads out the active mode.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[460px] items-center text-center');
        const wrap = mk('div', 'inline-flex flex-col items-center gap-2'); c.append(wrap);
        const hd = mk('h2', 'cursor-default text-5xl tracking-tight select-none sm:text-6xl'); hd.dataset.state = 'active'; wrap.append(hd);
        const lab = mk('output', 'text-xs tracking-widest text-muted-foreground uppercase transition-opacity duration-200'); wrap.append(lab);
        const sub = mk('p', 'min-h-[3.5rem] text-[15px] leading-7 text-muted-foreground'); c.append(sub);
        const setText = (text) => { hd.innerHTML = ''; hd.setAttribute('aria-label', text); return [...text].map((ch) => { const sp = mk('span', ''); sp.textContent = ch; sp.setAttribute('aria-hidden', 'true'); hd.append(sp); return sp; }); };
        const run = (text, mode, ms) => new Promise((res) => {
          const spans = setText(text); lab.textContent = { multi: 'Multi', wave: 'Wave', random: 'Random' }[mode]; let el = 0;
          const paint = () => { let vi = 0; spans.forEach((sp, i) => { if (text[i] === ' ') return; const cm = Math.max(0, el - vi * 50), cy = Math.floor(cm / 150); const f = mode === 'multi' ? (goldenBase(vi) + cy) % 5 : mode === 'wave' ? (vi + cy) % 5 : cy > 0 ? pseudoRandom(cy, vi) : goldenBase(vi); sp.className = PIXEL[f]; vi++; }); };
          paint(); if (REDUCE) { setTimeout(res, 0); return; }
          const t0 = performance.now(); const id = t.every(50, () => { el += 50; paint(); if (performance.now() - t0 >= ms) { t.stop(id); res(); } });
        });
        await run('Thinking', 'multi', 3000);
        await run('Searching', 'wave', 3000);
        await run('Writing', 'random', 3000);
        const fin = setText('Answer ready'); fin.forEach((sp) => { sp.className = PIXEL[0]; }); lab.style.opacity = '0';
        await streamWords(t, sub, 'Three sources agree: the cache key ignores locale, so French users get English pages.', 40);
        await t.sleep(1400);
      } },

    { group: 'Glow', title: 'Pixel Heading (Word)', desc: 'While variations generate, the whole heading cycles every pixel font at 300ms with its label shown; it then swaps between square and triangle (swap mode) and settles.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[460px] items-center text-center');
        const status = mk('div', 'text-sm text-muted-foreground', 'Generating heading variations…'); c.append(status);
        const wrap = mk('div', 'inline-flex flex-col items-center gap-2'); c.append(wrap);
        const hd = mk('h1', `cursor-default text-5xl tracking-tight transition-all duration-150 select-none sm:text-6xl ${PIXEL[0]}`); hd.textContent = 'Pixel Fonts'; hd.dataset.font = 'square'; wrap.append(hd);
        const lab = mk('output', 'text-xs tracking-widest text-muted-foreground uppercase opacity-0 transition-opacity duration-200', 'square'); wrap.append(lab);
        let fi = 0; const setFont = (i) => { fi = i; hd.classList.remove(...PIXEL); hd.classList.add(PIXEL[i]); hd.dataset.font = PIXEL_KEYS[i]; lab.textContent = PIXEL_KEYS[i]; };
        await t.sleep(800);
        hd.dataset.state = 'active'; lab.classList.replace('opacity-0', 'opacity-100');
        await new Promise((res) => { if (REDUCE) return res(); let n = 0; const id = t.every(300, () => { setFont((fi + 1) % 5); if (++n >= 12) { t.stop(id); res(); } }); });
        setFont(0); hd.dataset.state = 'idle'; lab.classList.replace('opacity-100', 'opacity-0');
        status.textContent = 'Swap mode: square ↔ triangle';
        for (let k = 0; k < 2; k++) { await t.sleep(900); setFont(3); hd.dataset.state = 'active'; lab.classList.replace('opacity-0', 'opacity-100'); await t.sleep(900); setFont(0); hd.dataset.state = 'idle'; lab.classList.replace('opacity-100', 'opacity-0'); }
        status.textContent = 'Picked “square” for the hero.';
        await t.sleep(1600);
      } },

    { group: 'Glow', title: 'Pixel Paragraph Words', desc: 'The streamed answer sets “animated” and “shadcn/ui” in a pixel font that then steps through all five faces; the inverse variant follows, with only those words left in plain sans.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-xl');
        c.append(ubub('What is this library?'));
        const TEXT = '54+ animated components and effects. Free, open source, and built to drop into any shadcn/ui project.', WORDS = ['animated', 'shadcn/ui'];
        const split = (text, ws) => { const re = new RegExp(`(${[...ws].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g'); const out = []; let last = 0; for (const m of text.matchAll(re)) { if (m.index > last) out.push([0, text.slice(last, m.index)]); out.push([1, m[0]]); last = m.index + m[0].length; } if (last < text.length) out.push([0, text.slice(last)]); return out; };
        const p = mk('p', 'text-lg leading-relaxed text-muted-foreground'); p.dataset.slot = 'pixel-paragraph'; c.append(p);
        const pix = [];
        for (const [isPix, seg] of split(TEXT, WORDS)) {
          const sp = mk('span', isPix ? `${PIXEL[0]} font-medium text-foreground` : ''); if (isPix) { sp.dataset.slot = 'pixel-word'; pix.push(sp); } p.append(sp);
          await streamWords(t, sp, seg, 55);
        }
        await t.sleep(600);
        for (let i = 1; i <= 5; i++) { pix.forEach((sp) => { sp.classList.remove(...PIXEL); sp.classList.add(PIXEL[i % 5]); }); await t.sleep(650); }
        const inv = mk('p', `${PIXEL[0]} text-lg leading-relaxed text-muted-foreground`); inv.dataset.slot = 'pixel-paragraph-inverse';
        for (const [isPix, seg] of split(TEXT, WORDS)) { const sp = mk('span', isPix ? 'font-sans font-medium text-foreground' : ''); sp.textContent = seg; inv.append(sp); }
        c.append(inv); fadeIn(inv, 320);
        await t.sleep(2600);
      } },

    { group: 'Glow', title: 'Text GIF', desc: 'The “Thinking” status is filled with the component’s Giphy loops through background-clip:text and cycles all four; text uses the fallback colour until a GIF loads.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[480px] items-center text-center');
        const card = mk('div', 'flex w-full items-center justify-center rounded-xl bg-white p-8 dark:bg-black'); c.append(card);
        const holder = mk('div', 'relative inline-block'); card.append(holder);
        const txt = mk('span', 'pb-1.5 text-5xl font-bold tracking-tight sm:text-6xl'); txt.textContent = 'Thinking';
        Object.assign(txt.style, { backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', webkitBackgroundClip: 'text', backgroundClip: 'text', lineHeight: '1', textAlign: 'center', color: 'var(--foreground)', webkitTextFillColor: 'var(--foreground)', transition: 'background-image 300ms ease-in-out, color 300ms ease-in-out' });
        holder.append(txt);
        const cap = mk('div', 'font-mono text-xs text-muted-foreground'); c.append(cap);
        const gifs = ['https://media.giphy.com/media/3zvbrvbRe7wxBofOBI/giphy.gif', 'https://media.giphy.com/media/fnglNFjBGiyAFtm6ke/giphy.gif', 'https://media.giphy.com/media/9Pmfazv34l7aNIKK05/giphy.gif', 'https://media.giphy.com/media/4bhs1boql4XVJgmm4H/giphy.gif'];
        const use = (url) => { const img = new Image(); img.referrerPolicy = 'no-referrer'; img.onload = () => { if (t.dead) return; Object.assign(txt.style, { backgroundImage: `url(${url})`, color: 'transparent', webkitTextFillColor: 'transparent' }); }; img.onerror = () => { Object.assign(txt.style, { backgroundImage: 'none', color: 'var(--foreground)', webkitTextFillColor: 'var(--foreground)' }); }; img.src = url; };
        const labels = ['Thinking', 'Searching', 'Reading', 'Writing'];
        for (let i = 0; i < gifs.length; i++) { txt.textContent = labels[i]; cap.textContent = `gif ${i + 1}/4`; use(gifs[i]); await t.sleep(2400); }
        const ans = mk('p', 'text-[15px] leading-7 text-muted-foreground'); c.append(ans);
        await streamWords(t, ans, 'Here’s the short version: ship the beta to 10% of users first.', 45);
        await t.sleep(1400);
      } },

    { group: 'Glow', title: 'Agent Suggest Card Stack', desc: 'The agent’s suggestion stack from the demo data (“Suggestions” · 3 · Apply) assembles in place, its progress bars fill, and Apply is pressed.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[444px] items-center');
        const status = mk('div', 'self-start text-sm text-muted-foreground', 'Agent reviewed 3 changes'); c.append(status);
        const id = uid('as'), first = { title: 'Update auth config', progress: 100 }, second = { title: 'Fix type errors' };
        const tw = (v) => Math.max(26, Math.round(v.length * 6.2));
        const pbx = Math.min(332, 42 + tw(first.title) + 10), sbx = Math.min(312, 22 + tw(second.title) + 10), stx = Math.min(344, sbx + 41);
        const vercel = (col) => `<path d="M12.667 3C14.5077 3.0002 15.9998 4.4923 16 6.333V11.667C15.9998 13.5077 14.5077 14.9998 12.667 15H3.333C1.4923 14.9998 0.0002 13.5077 0 11.667V6.333C0.0002 4.4923 1.4923 3.0002 3.333 3H12.667ZM4 11.833H12L8 4.833L4 11.833Z" fill="${col}"/>`;
        const bot = (x) => `<g><rect fill="none" height="18" rx="9" stroke="var(--border)" width="32" x="${x}" y="0"/><text fill="var(--muted-foreground)" font-family="system-ui, sans-serif" font-size="9" text-anchor="middle" x="${x + 16}" y="12.5">bot</text></g>`;
        const frameR = (x, y, w, hh) => `<rect fill="var(--card)" height="${hh}" rx="12" width="${w}" x="${x}" y="${y}"/><rect fill="none" height="${hh + 1}" rx="12" stroke="var(--border)" width="${w + 1}" x="${x - 0.5}" y="${y - 0.5}"/>`;
        const succ = 'color-mix(in oklab, #388e4a 50%, var(--muted))', err = 'color-mix(in oklab, #c63d3d 50%, var(--muted))', pbg = 'color-mix(in oklab, var(--muted) 85%, #388e4a 15%)';
        const svg = `<svg class="h-auto w-full max-w-[444px]" data-slot="agent-suggest" fill="none" viewBox="0 0 444 178" xmlns="http://www.w3.org/2000/svg"><title>Agent suggestion card stack</title>
<defs><filter filterUnits="userSpaceOnUse" height="110%" id="${id}b" width="104%" x="-2" y="0"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation="1"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="shadow"/><feBlend in="SourceGraphic" in2="shadow" mode="normal" result="shape"/></filter>
<filter filterUnits="userSpaceOnUse" height="118%" id="${id}f" width="108%" x="-4" y="-1"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="4"/><feGaussianBlur stdDeviation="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0.16 0"/><feBlend in2="BackgroundImageFix" mode="normal" result="shadow"/><feBlend in="SourceGraphic" in2="shadow" mode="normal" result="shape"/></filter>
<clipPath id="${id}p1"><rect height="11" rx="5.5" width="376" x="34" y="71"/></clipPath><clipPath id="${id}p2"><rect height="21" rx="5" width="352" x="58" y="114"/></clipPath></defs>
<g data-slot="hdr" filter="url(#${id}b)" opacity="0.72">${frameR(42, 1, 360, 106)}<rect fill="#388E4A" height="19" rx="9.5" width="33" x="54" y="13.5"/><text fill="var(--primary-foreground)" font-family="system-ui, sans-serif" font-size="10" font-weight="500" text-anchor="middle" x="70.5" y="27">3</text><text fill="var(--foreground)" font-family="system-ui, sans-serif" font-size="14" font-weight="600" x="93" y="27">Suggestions</text><text fill="var(--muted-foreground)" font-family="system-ui, sans-serif" font-size="13" x="300" y="27">#5347</text></g>
<g data-slot="main" filter="url(#${id}f)">${frameR(22, 35, 400, 141)}
<g transform="translate(34, 47)"><svg width="16" height="16" viewBox="0 0 16 16" fill="none">${vercel('var(--foreground)')}</svg><circle cx="29" cy="8" fill="var(--muted)" r="7"/><g transform="translate(22, 1)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.8027 4.3692C3.4858 2.4147 6.5142 2.4147 8.1973 4.3692L10.1992 6.6944V7.3058L8.1973 9.631C6.5142 11.5854 3.4858 11.5854 1.8027 9.631L-0.1992 7.3058V6.6944L1.8027 4.3692ZM7.4863 4.9806C6.1773 3.4607 3.8227 3.4607 2.5137 4.9806L0.7744 7.0001L2.5137 9.0196C3.8227 10.5394 6.1773 10.5394 7.4863 9.0196L9.2246 7.0001L7.4863 4.9806ZM5 5.1251C6.0355 5.1251 6.875 5.9646 6.875 7.0001C6.875 8.0356 6.0355 8.8751 5 8.8751C3.9645 8.8751 3.125 8.0356 3.125 7.0001C3.125 5.9646 3.9645 5.1251 5 5.1251ZM5 6.0626C4.4822 6.0626 4.0625 6.4823 4.0625 7.0001C4.0625 7.5178 4.4823 7.9376 5 7.9376C5.5177 7.9376 5.9375 7.5178 5.9375 7.0001C5.9375 6.4823 5.5178 6.0626 5 6.0626Z" fill="var(--muted-foreground)"/></svg></g><text fill="var(--foreground)" font-family="system-ui, sans-serif" font-size="11" font-weight="500" x="42" y="12">${esc(first.title)}</text>${bot(pbx)}</g>
<g><rect fill="${pbg}" height="11" rx="5.5" stroke="var(--border)" width="376" x="34" y="71"/><g clip-path="url(#${id}p1)"><rect data-bar="p1" fill="${succ}" height="21" width="29" x="34" y="71"/></g></g>
<g transform="translate(34, 90)"><svg width="16" height="16" viewBox="0 0 16 16" fill="none">${vercel('var(--foreground)')}</svg><text fill="var(--foreground)" font-family="system-ui, sans-serif" font-size="11" font-weight="500" x="22" y="12">${esc(second.title)}</text>${bot(sbx)}<text fill="var(--foreground)" font-family="system-ui, sans-serif" font-size="11" x="${stx}" y="12">now</text></g>
<g><rect fill="${pbg}" height="21" rx="5" stroke="var(--border)" width="352" x="58" y="114"/><g clip-path="url(#${id}p2)"><rect fill="${err}" height="11" width="352" x="58" y="114"/><rect data-bar="m1" fill="${succ}" height="11" width="27" x="58" y="114"/><line stroke="color-mix(in oklab, var(--foreground) 12%, transparent)" x1="58" x2="410" y1="124.5" y2="124.5"/><rect data-bar="m2" fill="${succ}" height="10" width="27" x="58" y="125"/></g></g>
<g data-slot="commit"><rect data-btn fill="var(--muted)" height="22" rx="5" width="111" x="299" y="141"/><rect fill="none" height="23" rx="5" stroke="var(--border)" width="112" x="298.5" y="140.5"/><text fill="var(--foreground)" font-family="system-ui, sans-serif" font-size="11" font-weight="500" text-anchor="middle" x="354.5" y="156">Apply</text></g></g></svg>`;
        const holder = mk('div', 'w-full', svg); c.append(holder);
        const hdr = holder.querySelector('[data-slot="hdr"]'), main = holder.querySelector('[data-slot="main"]');
        A(hdr, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 0.72, transform: 'none' }], { duration: 420, easing: EOUT });
        A(main, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        await t.sleep(900);
        const p1 = holder.querySelector('[data-bar="p1"]'), m1 = holder.querySelector('[data-bar="m1"]'), m2 = holder.querySelector('[data-bar="m2"]');
        await tween(t, 1500, (v) => p1.setAttribute('width', Math.max(29, v * first.progress * 3.76)), fEOUT);
        await tween(t, 1300, (v) => { const w = Math.max(27, v * (2 / 3) * 352); m1.setAttribute('width', w); m2.setAttribute('width', w); }, fEOUT);
        status.textContent = '2 applied cleanly · 1 needs a manual fix';
        await t.sleep(900);
        const commit = holder.querySelector('[data-slot="commit"]'); commit.style.transformOrigin = '354px 152px'; commit.style.transformBox = 'view-box';
        A(commit, [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 260, easing: EOUT });
        holder.querySelector('[data-btn]').setAttribute('fill', 'var(--accent)');
        await t.sleep(400); status.textContent = 'Applied to branch fix/auth-config';
        await t.sleep(1600);
      } },

    { group: 'Glow', title: 'Fluid AI Workloads', desc: 'A chat prompt fans out through the center model to four workloads: bubbles pop in, the connector and colored branches draw, and pulses keep flowing.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[448px] items-center');
        const status = mk('div', 'self-start text-sm text-muted-foreground', 'Routing request…'); c.append(status);
        const id = uid('fw');
        const cardP = (d) => `<path d="${d}" fill="var(--card)"/><path d="${d}" stroke="var(--border)"/>`;
        const R = ['M438 0.5C442.69 0.5 446.5 4.31 446.5 9V27.96C446.5 32.65 442.69 36.46 438 36.46H321C316.31 36.46 312.5 32.65 312.5 27.96V9C312.5 4.31 316.31 0.5 321 0.5H438Z', 'M438 51.65C442.69 51.65 446.5 55.46 446.5 60.15V79.11C446.5 83.8 442.69 87.61 438 87.61H321C316.31 87.61 312.5 83.8 312.5 79.11V60.15C312.5 55.46 316.31 51.65 321 51.65H438Z', 'M438 104.38C442.69 104.38 446.5 108.19 446.5 112.88V131.84C446.5 136.54 442.69 140.34 438 140.34H321C316.31 140.34 312.5 136.54 312.5 131.84V112.88C312.5 108.19 316.31 104.38 321 104.38H438Z', 'M438 155.54C442.69 155.54 446.5 159.34 446.5 164.04V182.99C446.5 187.69 442.69 191.49 438 191.49H321C316.31 191.49 312.5 187.69 312.5 182.99V164.04C312.5 159.34 316.31 155.54 321 155.54H438Z'];
        const L = [['M244 95.858L276 95.857C282.63 95.857 288 90.48 288 83.86V30.63C288 24 293.37 18.63 300 18.63C316.05 18.63 330.36 18.63 330.36 18.63', '#52AEFF'], ['M243.59 95.858L276 95.858C282.63 95.858 288 90.49 288 83.86V79.78C288 74.26 292.48 69.78 298 69.78C314.75 69.78 329.98 69.78 329.98 69.78', '#E5484D'], ['M243.59 95.856L276 95.856C282.63 95.857 288 101.23 288 107.86V111.94C288 117.46 292.48 121.94 298 121.94C314.75 121.94 329.98 121.94 329.98 121.94', '#FFB224'], ['M244 95.857L276 95.858C282.63 95.858 288 101.23 288 107.86V161.09C288 167.72 293.37 173.09 300 173.09C316.05 173.09 330.36 173.09 330.36 173.09', '#45DEC4']];
        const dots = [[312.27, 18.48], [312.27, 69.65], [312.5, 121.88], [312.27, 173.04]];
        const svg = `<svg class="h-auto w-full max-w-[448px]" data-slot="fluid-ai-workloads" viewBox="0 0 448 195" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Fluid AI workloads illustration</title>
<defs><filter id="${id}s" x="-10" y="-10" width="500" height="250" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2"/></filter><clipPath id="${id}l"><rect x="2" y="31" width="163" height="130" rx="12"/></clipPath><clipPath id="${id}c"><rect x="190.592" y="62.35" width="66.816" height="67.013" rx="12"/></clipPath></defs>
<g opacity="0.04" filter="url(#${id}s)"><rect x="2" y="32.67" width="163" height="130.39" rx="12" fill="black"/><path d="M191 76.76C191 70.14 196.37 64.76 203 64.76H245C251.63 64.76 257 70.14 257 76.76V118.96C257 125.59 251.63 130.96 245 130.96H203C196.37 130.96 191 125.59 191 118.96V76.76Z" fill="black"/></g>
<g data-slot="left"><g clip-path="url(#${id}l)"><rect x="2" y="31" width="163" height="130" rx="12" fill="var(--card)"/>${[15.06, 24.86, 34.65].map((x) => `<circle cx="${x}" cy="43.76" r="3.26" fill="var(--foreground)" fill-opacity="0.08"/>`).join('')}
${[[17, 61, 98, 16], [17, 87, 49, 16], [101, 113, 50, 17], [17, 140, 65, 41]].map(([x, y, w, hh]) => `<rect data-bubble x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" fill="var(--muted)" stroke="var(--border)" stroke-width="1" style="transform-box:fill-box;transform-origin:${x === 101 ? 'right' : 'left'} center"/>`).join('')}</g><rect x="1.5" y="30.5" width="164" height="131" rx="12.5" stroke="var(--border)"/></g>
<path data-conn d="M166.047 95.856H191.348" stroke="var(--muted-foreground)" stroke-width="1.63" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
<g data-slot="center" style="transform-box:fill-box;transform-origin:center"><path d="M245 62.35C251.85 62.35 257.41 67.9 257.41 74.76V116.96C257.41 123.81 251.85 129.36 245 129.36H203C196.15 129.36 190.59 123.81 190.59 116.96V74.76C190.59 67.9 196.15 62.35 203 62.35H245Z" fill="var(--card)"/><path d="M245 62.35C251.85 62.35 257.41 67.9 257.41 74.76V116.96C257.41 123.81 251.85 129.36 245 129.36H203C196.15 129.36 190.59 123.81 190.59 116.96V74.76C190.59 67.9 196.15 62.35 203 62.35H245Z" stroke="var(--border)" stroke-width="0.82"/><g clip-path="url(#${id}c)"><path fill-rule="evenodd" clip-rule="evenodd" d="M224 86.47L233.79 103.61H214.2L224 86.47Z" fill="var(--foreground)"/></g></g>
<g data-slot="lines">${L.map(([d, col]) => `<path data-line d="${d}" stroke="${col}" stroke-width="2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path data-flow d="${d}" stroke="${col}" stroke-width="2.6" stroke-linecap="round" pathLength="1" stroke-dasharray="0.14 0.86" stroke-dashoffset="1" opacity="0" style="filter:drop-shadow(0 0 3px ${col})"/>`).join('')}</g>
<g data-slot="right">${R.map((d, i) => `<g data-rc="${i}" opacity="0">${cardP(d)}<rect data-skel x="324" y="${[12, 63.5, 116, 167.5][i]}" width="0" height="6" rx="3" fill="var(--muted)"/></g>`).join('')}${dots.slice(1).map(([x, y]) => `<circle data-dot cx="${x}" cy="${y}" r="3.76" fill="var(--card)" stroke="var(--border)" opacity="0"/>`).join('')}</g></svg>`;
        const holder = mk('div', 'w-full', svg); c.append(holder);
        const q = (sel) => [...holder.querySelectorAll(sel)];
        q('[data-bubble]').forEach((b) => { b.style.opacity = '0'; });
        await t.sleep(400);
        for (const b of q('[data-bubble]')) { const sp = spring(400, 30); A(b, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: sp.duration, easing: sp.easing }); await t.sleep(280); }
        await t.sleep(200);
        A(q('[data-conn]')[0], [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 400, easing: EOUT });
        await t.sleep(380);
        const cen = holder.querySelector('[data-slot="center"]'); A(cen, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 500, easing: EIO });
        status.textContent = 'Model fanned out to 4 workloads';
        q('[data-line]').forEach((l, i) => A(l, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, delay: i * 140, easing: EOUT }));
        q('[data-rc]').forEach((g, i) => A(g, [{ opacity: 0, transform: 'translateX(6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 600 + i * 140, easing: EOUT }));
        q('[data-dot]').forEach((d, i) => A(d, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 700 + (i + 1) * 140 }));
        await t.sleep(1300);
        q('[data-flow]').forEach((f, i) => { f.setAttribute('opacity', '1'); LOOP(f, [{ strokeDashoffset: 1 }, { strokeDashoffset: -0.14 }], { duration: 1400, delay: i * 220, easing: 'linear' }); });
        q('[data-skel]').forEach((r, i) => tween(t, 2600 + i * 500, (v) => r.setAttribute('width', v * [96, 72, 104, 60][i]), fEOUT));
        await t.sleep(3600); status.textContent = 'All workloads streaming results';
        await t.sleep(2400);
      } },

    { group: 'Glow', title: 'AI Blob Warp', desc: 'The assistant’s avatar runs a canvas port of a Warp shader in the default and warm palettes; it pulses faster while thinking and calms down as the reply streams.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[460px]');
        const cards = mk('div', 'flex flex-wrap justify-center gap-4'); c.append(cards);
        const sample = (label, desc, av) => { const k = mk('div', 'flex w-[180px] flex-col items-center gap-3 rounded-xl border border-border/60 bg-[color-mix(in_oklab,var(--card)_40%,transparent)] p-4 text-center shadow-sm'); k.append(av, mk('div', 'space-y-1', `<p class="text-sm font-medium text-foreground">${esc(label)}</p><p class="text-xs leading-relaxed text-balance text-muted-foreground">${esc(desc)}</p>`)); cards.append(k); };
        const a1 = blobAvatar(t, { cls: 'size-8', size: 32, colors: WARP_BLOB, speed: 1, frame: 'border' });
        const a2 = blobAvatar(t, { cls: 'size-14', size: 56, colors: ['#fda4af', '#fb923c', '#f472b6', '#fecdd3'], speed: 1, frame: 'border' });
        sample('Default', 'Defaults: size-8, Glow-style gradient stops.', a1); sample('Warm', 'Larger frame and warm palette override.', a2);
        const row = mk('div', 'flex items-start gap-3'); const av = blobAvatar(t, { cls: 'size-8', size: 32, colors: WARP_BLOB, speed: 1, frame: 'border' }); row.append(av);
        const bodyEl = mk('div', 'min-w-0 flex-1 pt-1.5 text-sm leading-6'); const state = mk('div', 'text-muted-foreground', 'Thinking…'); bodyEl.append(state); row.append(bodyEl); c.append(row);
        await t.sleep(300); av.set(1.65, 3.45); a1.set(1.65, 3.45);
        await t.sleep(2600);
        av.set(5.2, 1); a1.set(5.2, 1); state.textContent = ''; state.className = 'text-foreground';
        await streamWords(t, state, 'Your build is 40% faster since the cache moved to the edge. Want me to apply the same change to staging?', 45);
        await t.sleep(1800);
      } },

    { group: 'Glow', title: 'Halo Search', desc: 'An ask-anything field: the placeholder staggers in, typing speeds up the Warp avatar, Enter switches to the frosted “Searching…” state with a spinner, and clearing blurs the query out right to left.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-2xl');
        const wrap = mk('div', 'relative w-full'); c.append(wrap);
        const outer = mk('div', 'relative rounded-full p-px'); wrap.append(outer);
        const rim = rimBlobs({ sizes: ['-bottom-4 h-16 w-48 blur-xl', '-bottom-3 h-12 w-32 blur-lg', '-bottom-2 h-10 w-24 blur-lg'], opacity: 0.5 }); outer.append(rim);
        const inner = mk('div', 'relative flex items-center gap-3 rounded-full border border-border px-4 py-3 shadow-sm shadow-black/5 transition-[background,backdrop-filter,border-color,box-shadow] duration-200 dark:shadow-black/30'); inner.style.background = FIELD_BG.solid; outer.append(inner);
        const av = blobAvatar(t); inner.append(av);
        const field = mk('div', 'relative min-w-0 flex-1'); inner.append(field);
        const input = mk('input', 'w-full bg-transparent text-base text-foreground caret-foreground outline-none'); input.type = 'text'; input.readOnly = true; input.tabIndex = -1; input.setAttribute('aria-label', 'Demo search'); field.append(input);
        const trail = mk('div', 'relative size-6 shrink-0 hidden'); inner.append(trail);
        const PH = 'Search docs, APIs, or ask a question…';
        let ph = staggerText(PH, { cls: 'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-muted-foreground' }); field.append(ph);
        const result = mk('div', 'min-h-[72px] px-2 text-sm leading-6 text-muted-foreground'); c.append(result);
        const setFocus = (on, frost) => { inner.classList.toggle('border-ring/70', on); rim.op(frost ? (on ? 0.92 : 0.72) : (on ? 0.78 : 0.5)); };
        await t.sleep(1600);
        setFocus(true, false); ph.remove();
        const query = 'How do I stream tool calls?';
        trail.classList.remove('hidden');
        const clearBtn = () => mk('button', 'absolute inset-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm shadow-foreground/10 ring-1 ring-foreground/10 transition-[background-color,color] duration-150 ease-out hover:bg-[var(--accent)]', ic('x', 'h-3.5 w-3.5'));
        swapSlot(trail, clearBtn());
        av.set(2.65, 2.65);
        for (const ch of query) { input.value += ch; await t.sleep(45 + Math.random() * 50); }
        await t.sleep(420); av.set(5.2, 1.15);
        await t.sleep(500);
        // isLoading: frosted fill, text hidden, staggered loading line, spinner slot, fast avatar
        inner.classList.add('backdrop-blur-xl', 'backdrop-saturate-150'); inner.style.background = FIELD_BG.frost; setFocus(true, true);
        input.classList.add('text-transparent', 'caret-transparent'); inner.setAttribute('aria-busy', 'true');
        const load = staggerText('Searching…', { stagger: 0.044, dur: 0.42, cls: 'pointer-events-none absolute inset-y-0 left-0 flex items-center text-muted-foreground' }); field.append(load);
        const ld = mk('div', 'pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm shadow-foreground/10 ring-1 ring-foreground/10'); ld.append(fieldSpinner()); swapSlot(trail, ld);
        av.set(1.65, 3.45);
        await t.sleep(4800);
        load.remove(); input.classList.remove('text-transparent', 'caret-transparent'); inner.removeAttribute('aria-busy');
        inner.classList.remove('backdrop-blur-xl', 'backdrop-saturate-150'); inner.style.background = FIELD_BG.solid; setFocus(true, false);
        swapSlot(trail, clearBtn()); av.set(5.2, 1.15);
        await streamWords(t, result, 'Use streamText with tools: each tool call arrives as a part you can render while the model keeps writing.', 40);
        await t.sleep(1600);
        // clear: deletion blur reveal right-to-left, rim goes warm
        const ghost = input.value; input.value = '';
        const sweep = 340 + 170, tm = deletionTiming(sweep, ghost.length);
        rim.set(RIM.deleting, LEFTS.deleting, [2.35, 2, 1.65]); rim.op(0.88);
        const del = mk('div', 'pointer-events-none absolute inset-0 overflow-hidden rounded-[4px]'); const line = mk('span', 'relative z-10 flex h-full items-center whitespace-pre text-base text-foreground'); del.append(line); field.append(del);
        [...ghost].forEach((ch, i) => { const g = mk('span', 'inline-block'); g.textContent = ch === ' ' ? ' ' : ch; line.append(g); A(g, [{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }, { opacity: 0.04, filter: 'blur(10px)', transform: 'translateY(-1px)' }], { duration: tm.dur * 1000, delay: (ghost.length - 1 - i) * tm.step * 1000, easing: EOUT }); });
        swapSlot(trail, null);
        await t.sleep(Math.max(sweep, (tm.span + tm.dur) * 1000) + 160);
        A(del, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, delay: 220, easing: EOUT }); await t.sleep(360); del.remove(); trail.classList.add('hidden');
        rim.set(); setFocus(false, false); result.textContent = '';
        ph = staggerText(PH, { cls: 'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-muted-foreground' }); field.append(ph);
        await t.sleep(1800);
      } },

    { group: 'Glow', title: 'Prompt Composer', desc: 'A multi-line composer with drifting ambient glow and halo rim: the prompt types in, Send swaps to a spinner, and “Sending…” staggers in over the frosted field until the request settles.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-2xl');
        const wrap = mk('div', 'relative w-full'); c.append(wrap);
        const outer = mk('div', 'relative rounded-2xl p-px'); wrap.append(outer);
        const amb = mk('div', 'pointer-events-none absolute inset-0 overflow-hidden rounded-2xl'); outer.append(amb);
        const b1 = mk('div', 'absolute -top-32 -left-20 size-88 blur-3xl'); b1.style.background = 'radial-gradient(ellipse 80% 70% at 35% 35%, rgba(255, 0, 128, 0.28) 0%, rgba(121, 40, 202, 0.14) 45%, transparent 72%)';
        const b2 = mk('div', 'absolute -top-28 -right-16 size-80 blur-3xl'); b2.style.background = 'radial-gradient(ellipse 75% 68% at 65% 40%, rgba(0, 212, 255, 0.22) 0%, rgba(0, 112, 243, 0.12) 48%, transparent 70%)';
        amb.append(b1, b2, mk('div', 'absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,transparent_0%,color-mix(in_oklch,var(--background)_88%,transparent)_55%,transparent_100%)] opacity-70'));
        b1.style.opacity = '0.07'; b2.style.opacity = '0.06';
        LOOP(b1, ease([{ opacity: 0.05, transform: 'translate(-4%,-2%)' }, { opacity: 0.1, transform: 'translate(5%,3%)' }, { opacity: 0.05, transform: 'translate(-4%,-2%)' }], EIO), { duration: 18000 });
        LOOP(b2, ease([{ opacity: 0.04, transform: 'translate(5%,2%)' }, { opacity: 0.09, transform: 'translate(-4%,-2%)' }, { opacity: 0.04, transform: 'translate(5%,2%)' }], EIO), { duration: 22000 });
        const rim = rimBlobs({ round: 'rounded-2xl', layer: 'h-[58%]', z: 'z-0', sizes: ['-bottom-10 h-32 w-88 blur-2xl', '-bottom-7 h-24 w-52 blur-2xl', '-bottom-5 h-20 w-44 blur-xl'], opacity: 0.5 }); outer.append(rim);
        const inner = mk('div', 'relative z-10 flex flex-col gap-2 rounded-2xl border border-border px-4 py-3 shadow-sm shadow-black/5 transition-[background,backdrop-filter,border-color,box-shadow] duration-200 dark:shadow-black/30'); inner.style.background = FIELD_BG.solid; outer.append(inner);
        const top = mk('div', 'flex min-h-0 gap-3'); inner.append(top);
        const av = blobAvatar(t, { cls: 'mt-0.5 size-8' }); top.append(av);
        const field = mk('div', 'relative min-h-[6rem] min-w-0 flex-1'); top.append(field);
        const ta = mk('textarea', 'w-full resize-none bg-transparent text-base leading-relaxed text-foreground antialiased caret-foreground outline-none'); ta.rows = 3; ta.readOnly = true; ta.tabIndex = -1; ta.setAttribute('aria-label', 'Message'); field.append(ta);
        const phOpts = { cls: 'pointer-events-none absolute inset-x-0 top-0 flex flex-wrap content-start gap-x-0 pr-1 text-pretty text-muted-foreground', glyph: 'inline-block whitespace-pre-wrap' };
        let ph = staggerText('Write a prompt…', phOpts); field.append(ph);
        const foot = mk('div', 'flex items-center justify-end gap-2 border-t border-border/50 pt-2'); inner.append(foot);
        const attach = mk('button', 'flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm shadow-foreground/10 ring-1 ring-foreground/10 transition-[background-color,color,transform,opacity] duration-150 ease-out', `${ic('paperclip', 'size-4')}<span class="sr-only">Attach file</span>`); attach.type = 'button'; foot.append(attach);
        const slot = mk('div', 'relative size-10 shrink-0'); foot.append(slot);
        const sendBtn = (enabled) => { const w = mk('div', 'absolute inset-0'); const b = mk('button', `flex size-full min-h-10 min-w-10 items-center justify-center rounded-full shadow-sm shadow-foreground/10 ring-1 ring-foreground/10 transition-[background-color,color,transform] duration-150 ease-out outline-none select-none ${enabled ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'pointer-events-none bg-muted/80 text-muted-foreground opacity-50'}`, `${ic('send', 'size-4')}<span class="sr-only">Send message</span>`); b.type = 'button'; w.append(b); w.btn = b; return w; };
        swapSlot(slot, sendBtn(false));
        const setFocus = (on, frost) => { inner.classList.toggle('border-ring/70', on); rim.op(frost ? (on ? 0.92 : 0.72) : (on ? 0.78 : 0.5)); };
        await t.sleep(1500);
        setFocus(true, false); ph.remove(); av.set(2.65, 2.65);
        const prompt = 'Write a launch tweet for our new streaming API. Keep it under 200 characters and mention resumable streams.';
        let first = true;
        for (const ch of prompt) { ta.value += ch; if (first) { first = false; slot.firstElementChild.remove(); slot.append(sendBtn(true)); } await t.sleep(22 + Math.random() * 30); }
        await t.sleep(420); av.set(5.2, 1.15); await t.sleep(500);
        const sb = slot.firstElementChild && slot.firstElementChild.btn; if (sb) A(sb, [{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 180 });
        await t.sleep(200);
        inner.classList.add('backdrop-blur-xl', 'backdrop-saturate-150'); inner.style.background = FIELD_BG.frost; setFocus(true, true); inner.setAttribute('aria-busy', 'true');
        ta.classList.add('text-transparent', 'caret-transparent'); attach.classList.add('pointer-events-none', 'opacity-40');
        const load = staggerText('Sending…', { ...phOpts, stagger: 0.044, dur: 0.42 }); field.append(load);
        const ld = mk('div', 'pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm shadow-foreground/10 ring-1 ring-foreground/10'); ld.append(fieldSpinner()); swapSlot(slot, ld);
        av.set(1.65, 3.45);
        await t.sleep(4200);
        load.remove(); ta.value = ''; ta.classList.remove('text-transparent', 'caret-transparent'); attach.classList.remove('pointer-events-none', 'opacity-40');
        inner.classList.remove('backdrop-blur-xl', 'backdrop-saturate-150'); inner.style.background = FIELD_BG.solid; inner.removeAttribute('aria-busy'); setFocus(false, false);
        swapSlot(slot, sendBtn(false)); av.set(5.2, 1.15);
        ph = staggerText('Write a prompt…', phOpts); field.append(ph);
        await t.sleep(2000);
      } },

    { group: 'Glow', title: 'Halo Progress', desc: 'Determinate “Indexing context” fills on the 420/34 layout spring in +2% steps; “Generating answer” runs the indeterminate sweep until it snaps to 100%.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-md gap-8');
        const bar = (label) => {
          const r = mk('div', 'flex w-full min-w-[8rem] flex-wrap gap-2'); r.setAttribute('role', 'progressbar');
          const hd = mk('div', 'flex w-full items-baseline justify-between gap-3'); hd.append(mk('span', 'text-xs/relaxed font-medium text-foreground', esc(label))); const val = mk('span', 'text-xs/relaxed text-muted-foreground tabular-nums'); hd.append(val); r.append(hd);
          const wrapB = mk('div', 'relative w-full rounded-full p-px'); r.append(wrapB);
          const rb = mk('div', 'pointer-events-none absolute inset-0 overflow-hidden rounded-full'); const lay = mk('div', 'absolute inset-x-0 bottom-0 h-1/2'); lay.style.opacity = '0.55'; const blob = mk('div', 'absolute -bottom-3 h-10 w-32 blur-xl'); blob.style.background = 'linear-gradient(90deg, #0070f3, #7928ca, #00d4ff, #ff0080)'; lay.append(blob); rb.append(lay); wrapB.append(rb);
          LOOP(blob, ease([{ left: '-8%' }, { left: '72%' }, { left: '-8%' }], EIO), { duration: 5500 }); blob.style.left = '-8%';
          const track = mk('div', 'relative h-2 w-full overflow-hidden rounded-full border border-border/80 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md backdrop-saturate-150 dark:border-border dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_2px_10px_rgba(0,0,0,0.35)]');
          track.style.background = 'linear-gradient(to bottom, color-mix(in oklch, var(--muted) 55%, transparent) 0%, color-mix(in oklch, var(--muted) 40%, transparent) 100%)'; wrapB.append(track);
          const fill = mk('div', 'glow-halo-fill absolute inset-y-0 left-0 h-full w-full origin-left rounded-[inherit]'); fill.style.transform = 'scaleX(0)'; track.append(fill);
          let cur = 0, an = null; const sp = spring(420, 34);
          r.set = (pct) => { val.textContent = Math.round(pct) + '%'; r.setAttribute('aria-valuenow', Math.round(pct)); const from = cur; cur = pct / 100; if (an) an.cancel(); an = A(fill, [{ transform: `scaleX(${from})` }, { transform: `scaleX(${cur})` }], { duration: sp.duration, easing: sp.easing }); };
          r.indet = (on) => { const ex = track.querySelector('.ind'); if (on) { fill.style.display = 'none'; val.textContent = ''; r.removeAttribute('aria-valuenow'); if (!ex) { const o = mk('div', 'ind pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'); const m = mk('div', 'glow-halo-ind absolute inset-y-0 left-0 h-full w-2/5 rounded-[inherit]'); o.append(m); track.append(o); LOOP(m, ease([{ transform: 'translateX(-45%)' }, { transform: 'translateX(145%)' }], EIO), { duration: 1150 }); } } else { if (ex) ex.remove(); fill.style.display = ''; } };
          r.set(0); return r;
        };
        const a = bar('Indexing context'), b = bar('Generating answer'); c.append(a, b); b.indet(true);
        await t.sleep(500);
        for (let p = 0; p <= 100; p += 2) { a.set(p); await t.sleep(120); }
        await t.sleep(1000); b.indet(false); b.set(0); await t.sleep(60); b.set(100);
        await t.sleep(2000);
      } },

    { group: 'Glow', title: 'Halo Badge', desc: 'Run-status chips with a gradient rim: a Live badge pulses its dot while streaming, a tabular count ticks up the sources, an Action badge flags approval, and the run settles to Done.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-md');
        const LABEL = { default: 'text-[var(--primary)]', secondary: 'text-muted-foreground', destructive: 'text-[var(--destructive)]', outline: 'text-foreground' };
        const BORDER = { default: 'border-[color-mix(in_oklch,var(--border)_72%,oklch(0.88_0.06_300))]', secondary: 'border-[color-mix(in_oklch,var(--border)_72%,oklch(0.88_0.06_300))]', destructive: 'border-[color-mix(in_oklch,var(--border)_65%,oklch(0.86_0.09_22))]', outline: 'border-[color-mix(in_oklch,var(--border)_72%,oklch(0.88_0.06_300))]' };
        const badge = (variant, text, { live = false, tab = false } = {}) => {
          const o = mk('span', 'relative inline-flex max-w-full items-center self-center leading-none'); o.dataset.slot = 'halo-badge';
          const ul = mk('div', 'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[9999px]', `<div class="absolute inset-0 opacity-50"><div class="absolute inset-0 blur-2xl" style="background:radial-gradient(90% 70% at 50% 100%, rgba(255,0,128,0.28), rgba(121,40,202,0.12) 48%, transparent 62%)"></div><div class="absolute inset-0 opacity-70 blur-xl dark:opacity-50" style="background:radial-gradient(70% 55% at 30% 0%, rgba(0,212,255,0.22), rgba(0,112,243,0.08) 45%, transparent 58%)"></div></div>`); o.append(ul);
          const ring = mk('span', 'relative z-[1] inline-flex items-center justify-center rounded-full p-px text-[0] leading-none'); o.append(ring);
          const rim = rimBlobs({ z: 'z-0', sizes: ['-bottom-2 h-10 w-28 blur-xl', '-bottom-1.5 h-8 w-20 blur-lg', '-bottom-1 h-6 w-16 blur-md'], opacity: 0.72 }); if (variant === 'destructive') rim.set(RIM.destructive); ring.append(rim);
          const surf = mk('span', `relative z-[1] flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 text-[0.625rem] leading-none font-medium tracking-tight whitespace-nowrap antialiased backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_1px_2px_rgba(0,0,0,0.03),0_6px_18px_rgba(0,0,0,0.04)] dark:border-border/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_1px_2px_rgba(0,0,0,0.28),0_6px_22px_rgba(0,0,0,0.32)] ${LABEL[variant]} ${BORDER[variant]}`);
          surf.style.background = 'linear-gradient(to bottom, color-mix(in oklch, var(--card) 82%, transparent) 0%, color-mix(in oklch, var(--card) 70%, transparent) 100%)';
          if (live) { const d = mk('span', 'size-1.5 shrink-0 translate-y-[0.5px] self-center rounded-full bg-current opacity-90'); surf.append(d); LOOP(d, ease([{ opacity: 0.35 }, { opacity: 1 }, { opacity: 0.35 }], EIO), { duration: 1150 }); }
          const body = mk('span', `inline-flex items-center leading-none ${tab ? 'min-w-[1ch] tabular-nums' : ''}`); body.textContent = text; surf.append(body); ring.append(surf);
          o.setText = (v) => { const w0 = surf.offsetWidth; body.textContent = v; const w1 = surf.offsetWidth; if (w0 !== w1 && !REDUCE) { const sp = springDB(0.32, 0); surf.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: sp.duration, easing: sp.easing }); } };
          return o;
        };
        const head = mk('div', 'flex flex-wrap items-center gap-2'); c.append(head);
        head.append(mk('span', 'mr-1 text-sm font-semibold text-foreground', 'Research run'));
        const live = badge('outline', 'Live', { live: true }); const cnt = badge('secondary', '3', { tab: true }); head.append(live, cnt);
        [live, cnt].forEach((b, i) => A(b, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: i * 90, easing: EOUT }));
        const p = mk('p', 'min-h-[4.5rem] text-sm leading-6 text-muted-foreground'); c.append(p);
        await t.sleep(600);
        const words = 'Reading pricing pages and changelogs to compare how each vendor meters streaming tokens.';
        const st = streamWords(t, p, words, 70);
        for (const n of ['10', '17', '24']) { await t.sleep(1300); cnt.setText(n); }
        await st;
        const act = badge('destructive', 'Action'); head.append(act); A(act, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EOUT });
        live.setText('Needs approval'); await t.sleep(2000);
        act.remove(); live.remove(); const done = badge('default', 'Done'); head.insertBefore(done, cnt); A(done, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EOUT });
        await t.sleep(2000);
      } },

    { group: 'Glow', title: 'Speech Bubble', desc: 'The assistant speaks in the pill bubble with its tail: each reply types in behind the pulsing block cursor, which drops away when the last line is done.', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root); const c = col(s, 'max-w-[460px] items-start');
        const rootEl = mk('div', 'mr-12'); rootEl.dataset.slot = 'speech-bubble'; c.append(rootEl);
        const bodyEl = mk('div', 'relative flex w-fit items-center rounded-full bg-foreground px-6 py-5 text-background transition-colors sm:px-8'); rootEl.append(bodyEl);
        bodyEl.innerHTML = '<svg aria-hidden="true" class="absolute right-[-9px] bottom-0 h-[34px] w-auto -rotate-5 transition-colors" fill="none" viewBox="0 0 53 45" xmlns="http://www.w3.org/2000/svg"><path class="fill-foreground transition-colors" d="M44 0H0V0C0 24.8528 20.1472 45 45 45H53V45C47.1396 36.535 44 26.4842 44 16.1886V0Z"/></svg>';
        const txt = mk('h1', 'relative text-xl leading-[0.9] font-semibold tracking-[-0.06em] text-balance text-background sm:text-2xl'); const cur = mk('div', 'relative ml-2 h-6 w-4 shrink-0 bg-muted-foreground'); if (!REDUCE) cur.classList.add('animate-pulse');
        bodyEl.append(txt, cur);
        A(rootEl, [{ opacity: 0, transform: 'translateY(8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EOUT });
        const lines = ['Hello, how are you?', 'I read your notes from today.', 'Want a two-line summary?'];
        await t.sleep(700);
        for (const [i, l] of lines.entries()) {
          txt.textContent = ''; await typeChars(t, txt, l, 42);
          await t.sleep(i === lines.length - 1 ? 300 : 1500);
        }
        cur.remove();
        await t.sleep(2200);
      } },

    { group: 'Glow', title: 'Dynamic Island', desc: 'The assistant lives in the island, which springs between compact, a large “loading” state, a tall answer card and a long listening strip (400/30 spring, blur exits).', kind: 'lib',
      async run(root, t) {
        const s = stage('glow', root, 'min-h-[400px] justify-start pt-10');
        const isl = mk('div', 'relative mx-auto overflow-hidden border border-black/10 bg-black text-center text-black dark:border-white/5'); isl.style.width = '0px'; isl.style.height = '0px'; s.append(isl);
        const P = { compact: [235, 44 / 235, 46], large: [371, 84 / 371, 42], tall: [371, 210 / 371, 42], long: [371, 84 / 371, 42] };
        const sp = spring(400, 30);
        let an = null;
        const size = (k) => { const avail = Math.max(200, s.clientWidth - 40); const [w0, ar, br] = P[k]; const w = Math.min(w0, avail), hh = Math.round(w * ar); const cs = getComputedStyle(isl); const from = { width: cs.width, height: cs.height, borderRadius: cs.borderRadius }; if (an) an.cancel(); an = A(isl, [from, { width: w + 'px', height: hh + 'px', borderRadius: br + 'px' }], { duration: sp.duration, easing: sp.easing }); };
        let cur = null;
        const show = (html, cls) => {
          if (cur) { const old = cur; A(old, [{ opacity: 1, filter: 'blur(0px)', transform: 'none' }, { opacity: 0, filter: 'blur(10px)', transform: 'translateY(20px) scale(.95)' }], { duration: 300, easing: EOUT }); setTimeout(() => old.remove(), 310); }
          const el = mk('div', `absolute inset-0 ${cls}`, html); isl.append(el); cur = el;
          A(el, [{ opacity: 0, transform: 'translateY(5px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: sp.duration, easing: sp.easing, delay: 80 });
          el.querySelectorAll('[data-pop]').forEach((p, i) => A(p, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: sp.duration, easing: sp.easing, delay: 120 + i * 60 }));
        };
        await t.sleep(400);
        size('compact'); show(`<div class="relative flex h-full w-full items-center"><p data-pop class="absolute left-4 my-auto text-lg font-medium tracking-tighter text-white">${ic('message-circle', 'h-5 w-5 fill-cyan-400 text-cyan-400')}</p><p data-pop class="absolute right-4 my-auto text-lg font-bold tracking-tighter text-white">example.com</p></div>`, 'flex items-center justify-center');
        await t.sleep(1600);
        size('large'); show(`<div class="relative flex h-full w-full items-center justify-between gap-6 px-4"><span class="${REDUCE ? '' : 'animate-spin'} text-yellow-300">${ic('loader', 'h-10 w-10 sm:h-12 sm:w-12')}</span><h3 data-pop class="my-auto text-2xl font-black tracking-tighter text-white">loading</h3></div>`, 'flex items-center justify-center');
        await t.sleep(2400);
        size('tall'); show(`<div class="mt-4 flex w-full flex-col items-start gap-1 px-5 text-left font-semibold sm:mt-6 sm:px-8"><p data-pop class="rounded-2xl bg-cyan-300 p-2 text-sm leading-5 tracking-tight">The Cult of Pythagoras</p><p data-pop class="rounded-2xl bg-cyan-300 p-2 text-left text-sm leading-5 tracking-tight">Music of the Spheres, an idea that celestial bodies produce a form of music through their movements</p><h3 data-pop class="text-3xl font-black tracking-tighter text-cyan-100 sm:text-4xl">any cool colors?</h3></div>`, 'overflow-hidden');
        await t.sleep(4200);
        size('long'); show(`<div class="relative flex h-full w-full items-center justify-between gap-4 px-4"><div data-pop class="text-cyan-400">${ic('waves', 'h-8 w-8')}</div><h3 data-pop class="my-auto min-w-0 truncate text-xl font-black tracking-tighter text-white">Supercalifragilisticexpialid</h3></div>`, 'flex items-center justify-center');
        await t.sleep(2200);
        size('compact'); show(`<div class="relative flex h-full w-full items-center"><p data-pop class="absolute left-4 my-auto text-lg font-medium tracking-tighter text-white">${ic('message-circle', 'h-5 w-5 fill-cyan-400 text-cyan-400')}</p><p data-pop class="absolute right-4 my-auto text-lg font-bold tracking-tighter text-white">example.com</p></div>`, 'flex items-center justify-center');
        await t.sleep(1600);
      } },
  ];
}
