/* Motion + Kit pack, vanilla JS.
 *   Motion  text-effect, text-shimmer, text-scramble, text-morph, text-loop, text-roll, animated-number,
 *           sliding-number, glow-effect, border-trail, progressive-blur
 *   Kit     spinner, code-block, snippet, status
 * Motion springs are sampled into CSS linear() easings; motion `layoutId` (TextMorph) is a FLIP. */
(window.LIB_PACKS = window.LIB_PACKS || []).push(function (h) {
  'use strict';
  const { mk, esc, REDUCE, tick, rnd } = h;
  const frame = h.frame || (() => new Promise((r) => tick(r)));
  const streamInto = h.streamInto || (async (node, text, t, ms = 32) => {
    for (const w of text.split(/(\s+)/).filter(Boolean)) { node.append(document.createTextNode(w)); if (w.trim()) await t.sleep(ms * rnd(0.6, 1.4)); }
  });
  const show = h.show || (async (el, from, to, t, css) => { Object.assign(el.style, from); await frame(); el.style.transition = css; Object.assign(el.style, to); });

  /* ---------------------------------------------------------- scoped CSS */
  if (!document.getElementById('lib-motion-kit-css')) {
    const st = document.createElement('style'); st.id = 'lib-motion-kit-css';
    st.textContent = `
/* Kit — shadcn neutral tokens */
.lib-kit { --background:oklch(1 0 0); --foreground:oklch(0.145 0 0); --secondary:oklch(0.97 0 0); --secondary-foreground:oklch(0.205 0 0);
  --muted:oklch(0.97 0 0); --muted-foreground:oklch(0.556 0 0); --border:oklch(0.922 0 0); --input:oklch(0.922 0 0); --ring:oklch(0.708 0 0);
  --primary:oklch(0.205 0 0); --primary-foreground:oklch(0.985 0 0);
  font-family:"Geist",ui-sans-serif,system-ui,sans-serif; background:var(--background); color:var(--foreground); box-shadow:inset 0 0 0 1px var(--border); }
.dark .lib-kit { --background:oklch(0.145 0 0); --foreground:oklch(0.985 0 0); --secondary:oklch(0.269 0 0); --secondary-foreground:oklch(0.985 0 0);
  --muted:oklch(0.269 0 0); --muted-foreground:oklch(0.708 0 0); --border:oklch(1 0 0 / 10%); --input:oklch(1 0 0 / 15%); --ring:oklch(0.556 0 0);
  --primary:oklch(0.922 0 0); --primary-foreground:oklch(0.205 0 0); }
.lib-kit .font-mono, .lib-kit pre, .lib-kit code { font-family:"Geist Mono",ui-monospace,monospace; }
/* Kit Spinner · bars (verbatim keyframes) */
.kit-spinner-bar { animation:kit-spinner-bars .8s linear infinite; animation-delay:-.8s; }
.kit-spinner-bars-2 { animation-delay:-.65s; } .kit-spinner-bars-3 { animation-delay:-.5s; }
@keyframes kit-spinner-bars { 0% { y:1px; height:22px; } 93.75% { y:5px; height:14px; opacity:.2; } }
/* Kit CodeBlock item: line numbers, highlight + diff lines, github-light / github-dark tokens */
.kit-code pre { padding:16px 0; margin:0; }
.kit-code code { display:grid; width:100%; overflow-x:auto; background:transparent; counter-reset:line; counter-increment:line 0; font-size:13px; line-height:1.6; color:#24292e; }
.kit-code .line { position:relative; display:block; width:100%; padding:0 16px; white-space:pre; min-height:1.6em; }
.kit-code.kit-ln .line::before { content:counter(line); counter-increment:line; display:inline-block; width:16px; margin-right:16px; font-size:13px; text-align:right; color:color-mix(in oklab, var(--muted-foreground) 50%, transparent); user-select:none; }
.kit-code .line.highlighted { background:#eff6ff; }
.kit-code .line.diff.add { background:#ecfdf5; } .kit-code .line.diff.remove { background:#fff1f2; }
.kit-code .line.highlighted::after, .kit-code .line.diff::after { content:""; position:absolute; left:0; top:0; bottom:0; width:2px; }
.kit-code .line.highlighted::after { background:#3b82f6; } .kit-code .line.diff.add::after { background:#10b981; } .kit-code .line.diff.remove::after { background:#f43f5e; }
.dark .kit-code code { color:#e1e4e8; }
.dark .kit-code .line.highlighted { background:rgb(59 130 246 / .1); } .dark .kit-code .line.diff.add { background:rgb(16 185 129 / .1); } .dark .kit-code .line.diff.remove { background:rgb(244 63 94 / .1); }
.kit-code .tk-k { color:#d73a49; } .kit-code .tk-s { color:#032f62; } .kit-code .tk-f { color:#6f42c1; } .kit-code .tk-t { color:#22863a; } .kit-code .tk-c { color:#005cc5; }
.dark .kit-code .tk-k { color:#f97583; } .dark .kit-code .tk-s { color:#9ecbff; } .dark .kit-code .tk-f { color:#b392f0; } .dark .kit-code .tk-t { color:#85e89d; } .dark .kit-code .tk-c { color:#79b8ff; }
/* Motion TextShimmer colour example (blue-600/200, dark blue-700/400) */
.motion-shimmer-blue { --base-color:oklch(0.546 0.245 262.881); --base-gradient-color:oklch(0.882 0.059 254.128); }
.dark .motion-shimmer-blue { --base-color:oklch(0.488 0.243 264.376); --base-gradient-color:oklch(0.707 0.165 254.624); }
/* Motion GlowEffect: registered props so gradients interpolate like motion's string tweening */
@property --mpg-a { syntax:'<color>'; inherits:false; initial-value:transparent; }
@property --mpg-b { syntax:'<color>'; inherits:false; initial-value:transparent; }
.motion-glow-shift { background:conic-gradient(from 0deg at 50% 50%, var(--mpg-a) 0%, var(--mpg-b) 50%, var(--mpg-a) 100%); }
`;
    document.head.append(st);
  }

  /* ------------------------------------------------------------ shared */
  const LUC = Object.assign({
    loader: '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
    'loader-pinwheel': '<path d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0"/><path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6"/><path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6"/><circle cx="12" cy="12" r="10"/>',
    'loader-circle': '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'square-terminal': '<path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>',
  }, h.LUCIDE || {});
  const ico = (name, cls = 'size-4', sw = 2, size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}">${LUC[name] || ''}</svg>`;

  const EASE_MOTION = 'cubic-bezier(0.25, 0.1, 0.35, 1)'; // motion's default tween ease
  const LINEAR_OK = (() => { try { return CSS.supports('animation-timing-function', 'linear(0, 1)'); } catch (e) { return false; } })();
  const springCache = {};
  /** Samples a motion spring { stiffness, damping, mass } into a CSS linear() easing + its settle duration. */
  function spring(k, c, m = 1) {
    const key = `${k}/${c}/${m}`; if (springCache[key]) return springCache[key];
    let x = 0, v = 0, tt = 0, n = 0; const dt = 1 / 600; const s = [0];
    while (tt < 3) { const a = (-k * (x - 1) - c * v) / m; v += a * dt; x += v * dt; tt += dt; n++; if (n % 10 === 0) s.push(x); if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break; }
    s.push(1);
    const step = Math.max(1, Math.ceil(s.length / 64)); const pts = s.filter((_, i) => i % step === 0 || i === s.length - 1);
    return (springCache[key] = { ms: Math.max(140, Math.round(tt * 1000)), ease: LINEAR_OK ? `linear(${pts.map((p) => +p.toFixed(4)).join(', ')})` : 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }
  /** el.animate that degrades to "jump to the last frame" under reduced motion. */
  function A(el, frames, o) {
    if (REDUCE) { const last = Object.assign({}, frames[frames.length - 1]); Object.keys(last).forEach((k) => { if (k.startsWith('--')) { el.style.setProperty(k, last[k]); delete last[k]; } }); delete last.offset; delete last.easing; Object.assign(el.style, last); return { set onfinish(f) { f(); }, cancel() {} }; }
    return el.animate(frames, o);
  }
  /** motion target -> WAAPI keyframe (consistent transform list so every pair interpolates). */
  const kf = (s = {}) => {
    const o = { opacity: s.opacity ?? 1, transform: `translateY(${s.y || 0}px) rotateX(${s.rotateX || 0}deg) rotate(${s.rotate || 0}deg) scale(${s.scale ?? 1})`, filter: s.filter || 'blur(0px)' };
    if (s.color) o.color = s.color; return o;
  };

  const mpStage = (root, cls = '') => { const s = mk('div', `lib-motion relative flex min-h-[360px] w-full min-w-0 flex-col ${/items-/.test(cls) ? '' : 'items-center'} justify-center overflow-hidden rounded-[20px] px-5 py-10 sm:px-8 ${cls}`); root.append(s); return s; };
  const kitStage = (root, cls = '') => { const s = mk('div', `lib-kit relative flex min-h-[380px] w-full min-w-0 flex-col ${/items-/.test(cls) ? '' : 'items-center'} justify-center overflow-hidden rounded-[20px] px-4 py-8 sm:px-8 ${cls}`); root.append(s); return s; };
  const mpBubble = (text) => { const b = mk('div', 'ml-auto w-fit max-w-[85%] rounded-2xl bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'); b.textContent = text; return b; };
  const kitBubble = (text) => { const b = mk('div', 'ml-auto w-fit max-w-[85%] rounded-2xl bg-secondary px-3.5 py-2 text-sm text-secondary-foreground'); b.textContent = text; return b; };
  const rise = (el, t) => show(el, { opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'none' }, t, `opacity .3s ${EASE_MOTION}, transform .3s ${EASE_MOTION}`);
  const fadeOut = async (el, t, ms = 300) => { el.style.transition = `opacity ${ms}ms ease, filter ${ms}ms ease`; el.style.opacity = '0'; el.style.filter = 'blur(4px)'; await t.sleep(ms); };

  /* ------------------------------------------------- MP: TextEffect port */
  const STAGGER = { char: 0.03, word: 0.05, line: 0.1 };
  const PRESET = {
    blur: { hidden: { opacity: 0, filter: 'blur(12px)' }, visible: { opacity: 1, filter: 'blur(0px)' }, exit: { opacity: 0, filter: 'blur(12px)' } },
    'fade-in-blur': { hidden: { opacity: 0, y: 20, filter: 'blur(12px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: 20, filter: 'blur(12px)' } },
    scale: { hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 } },
    fade: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  };
  /** TextEffect: splits per line/word/char, items hidden -> visible on a container stagger; exit runs in reverse.
   *  Like the source, segmentTransition duration (0.3 / speedSegment) overrides variant durations. */
  function textEffect(text, o = {}) {
    const per = o.per || 'word'; const item = o.item || PRESET[o.preset || 'fade'];
    const stagger = o.stagger ?? STAGGER[per] / (o.speedReveal || 1);
    const dur = (0.3 / (o.speedSegment || 1)) * 1000;
    const el = mk(o.as || 'p', o.className || '');
    if (per !== 'line') { const sr = mk('span', 'sr-only'); sr.textContent = text; el.append(sr); }
    const items = [];
    (per === 'line' ? text.split('\n') : text.split(/(\s+)/)).forEach((seg) => {
      let host = el;
      if (o.wrap) { host = mk('span', `${per === 'line' ? 'block' : 'inline-block'} ${o.wrap}`); el.append(host); }
      if (per === 'char') {
        const w = mk('span', 'inline-block whitespace-pre'); host.append(w);
        for (const ch of seg) { const s = mk('span', 'inline-block whitespace-pre'); s.setAttribute('aria-hidden', 'true'); s.textContent = ch; w.append(s); items.push(s); }
      } else {
        const s = mk('span', per === 'line' ? 'block' : 'inline-block whitespace-pre'); if (per === 'word') s.setAttribute('aria-hidden', 'true'); s.textContent = seg; host.append(s); items.push(s);
      }
    });
    const hidden = kf(item.hidden), visible = kf(item.visible), exit = kf(item.exit || item.hidden);
    items.forEach((s) => Object.assign(s.style, hidden));
    const run = (from, to, order, delay, st) => {
      const n = items.length;
      items.forEach((s, i) => { s.getAnimations().forEach((a) => a.cancel()); A(s, [from, to], { duration: dur, delay: (delay + (order ? i : n - 1 - i) * st) * 1000, fill: 'both', easing: o.ease || EASE_MOTION }); });
      return REDUCE ? 0 : (delay + n * st) * 1000 + dur;
    };
    el.enter = (delay = o.delay || 0) => run(hidden, visible, true, delay, stagger);
    el.exit = () => run(visible, exit, false, 0, o.exitStagger ?? stagger);
    el.items = items;
    return el;
  }

  /* --------------------------------------------- MP: TextShimmer port */
  function textShimmer(text, { as = 'p', className = '', duration = 2, spread = 2 } = {}) {
    const el = mk(as, `relative inline-block bg-clip-text text-transparent ${className}`);
    if (!/--base-color/.test(className) && !/motion-shimmer-/.test(className)) el.classList.add('[--base-color:#a1a1aa]', '[--base-gradient-color:#000]', 'dark:[--base-color:#71717a]', 'dark:[--base-gradient-color:#ffffff]');
    el.textContent = text;
    el.style.setProperty('--spread', `${text.length * spread}px`);
    el.style.setProperty('--bg', 'linear-gradient(90deg, #0000 calc(50% - var(--spread)), var(--base-gradient-color), #0000 calc(50% + var(--spread)))');
    Object.assign(el.style, { backgroundImage: 'var(--bg), linear-gradient(var(--base-color), var(--base-color))', backgroundSize: '250% 100%, auto', backgroundRepeat: 'no-repeat, padding-box', WebkitBackgroundClip: 'text', backgroundPosition: '100% center' });
    if (!REDUCE) el.animate([{ backgroundPosition: '100% center' }, { backgroundPosition: '0% center' }], { duration: duration * 1000, iterations: Infinity, easing: 'linear' });
    return el;
  }

  /* -------------------------------------------- MP: TextScramble port */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  function scramble(el, text, t, { duration = 0.8, speed = 0.04, characterSet = SCRAMBLE_CHARS } = {}) {
    return new Promise((resolve) => {
      if (REDUCE) { el.textContent = text; resolve(); return; }
      const steps = duration / speed; let step = 0;
      const id = t.every(speed * 1000, () => {
        let out = ''; const progress = step / steps;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          out += progress * text.length > i ? text[i] : characterSet[Math.floor(Math.random() * characterSet.length)];
        }
        el.textContent = out; step++;
        if (step > steps) { t.stop(id); el.textContent = text; resolve(); }
      });
    });
  }

  /* ----------------------------------------------- MP: TextMorph port */
  /** Characters keyed by letter + occurrence (motion layoutId); kept letters glide (FLIP), new fade in, gone fade out popLayout-style. */
  function textMorph(el) {
    el.classList.add('relative'); let cur = [];
    const T = spring(280, 18, 0.3);
    el.set = (text) => {
      el.setAttribute('aria-label', text);
      const first = cur.length === 0; const counts = {};
      const next = [...text].map((ch) => { const l = ch.toLowerCase(); counts[l] = (counts[l] || 0) + 1; return { id: l + counts[l], label: ch === ' ' ? ' ' : ch }; });
      const before = new Map(cur.map((c) => [c.id, c.node.getBoundingClientRect()]));
      const old = new Map(cur.map((c) => [c.id, c.node]));
      const ids = new Set(next.map((n) => n.id));
      const leaving = cur.filter((c) => !ids.has(c.id));
      cur = next.map((it) => { let node = old.get(it.id); let fresh = false; if (!node) { node = mk('span', 'inline-block'); node.setAttribute('aria-hidden', 'true'); node.textContent = it.label; fresh = true; } return { id: it.id, node, fresh }; });
      el.replaceChildren(...cur.map((c) => c.node));
      if (REDUCE || first) return;
      const box = el.getBoundingClientRect();
      cur.forEach((c) => {
        if (c.fresh) { c.node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T.ms, easing: T.ease }); return; }
        const a = before.get(c.id), b = c.node.getBoundingClientRect(); const dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) c.node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: T.ms, easing: T.ease });
      });
      leaving.forEach((c) => {
        const a = before.get(c.id); const g = c.node; g.getAnimations().forEach((x) => x.cancel());
        g.style.cssText = `position:absolute;left:${a.left - box.left}px;top:${a.top - box.top}px;pointer-events:none`; el.append(g);
        g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.ms, easing: T.ease, fill: 'forwards' }).onfinish = () => g.remove();
      });
    };
    return el;
  }

  /* ------------------------------------------------ MP: TextLoop port */
  const LOOP_DEFAULT = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } };
  function textLoop(items, { className = '', variants = LOOP_DEFAULT, transition = { ms: 300, ease: EASE_MOTION } } = {}) {
    const el = mk('div', `relative inline-block whitespace-nowrap ${className}`); let idx = 0;
    const put = (i) => { const d = mk('div'); d.innerHTML = items[i]; el.append(d); return d; };
    let cur = put(0);
    el.next = (v = variants) => {
      idx = (idx + 1) % items.length; const old = cur;
      old.style.position = 'absolute'; old.style.top = '0'; old.style.left = '0';
      A(old, [kf(v.animate), kf(v.exit)], { duration: transition.ms, easing: transition.ease, fill: 'forwards' }).onfinish = () => old.remove();
      cur = put(idx); A(cur, [kf(v.initial), kf(v.animate)], { duration: transition.ms, easing: transition.ease });
      return idx;
    };
    return el;
  }

  /* ------------------------------------------------ MP: TextRoll port */
  const ROLL_DEFAULT = { enter: { from: { rotateX: 0 }, to: { rotateX: 90 } }, exit: { from: { rotateX: 90 }, to: { rotateX: 0 } } };
  function textRoll(text, { className = '', variants = ROLL_DEFAULT, duration = 0.5, enterDelay = (i) => i * 0.1, exitDelay = (i) => i * 0.1 + 0.2, ease = 'cubic-bezier(0.42, 0, 1, 1)' } = {}) {
    const el = mk('span', className); const sr = mk('span', 'sr-only'); sr.textContent = text;
    const letters = [...text]; let total = 0;
    letters.forEach((ch, i) => {
      const lab = ch === ' ' ? ' ' : ch;
      const w = mk('span', 'relative inline-block [perspective:10000px] [transform-style:preserve-3d]'); w.setAttribute('aria-hidden', 'true');
      const a = mk('span', 'absolute inline-block [backface-visibility:hidden] [transform-origin:50%_25%]'); a.textContent = lab;
      const b = mk('span', 'absolute inline-block [backface-visibility:hidden] [transform-origin:50%_100%]'); b.textContent = lab;
      const inv = mk('span', 'invisible'); inv.textContent = lab; w.append(a, b, inv); el.append(w);
      if (REDUCE) { a.style.visibility = 'hidden'; return; }
      A(a, [kf(variants.enter.from), kf(variants.enter.to)], { duration: duration * 1000, delay: enterDelay(i) * 1000, fill: 'both', easing: ease });
      A(b, [kf(variants.exit.from), kf(variants.exit.to)], { duration: duration * 1000, delay: exitDelay(i) * 1000, fill: 'both', easing: ease });
      total = Math.max(total, (exitDelay(i) + duration) * 1000);
    });
    el.append(sr); el.total = total; return el;
  }

  /* ------------------------------------ MP: SlidingNumber / AnimatedNumber */
  /** One spring-driven digit column per place (stiffness 280, damping 18, mass 0.3), y = offset * height like the source. */
  function slidingNumber(t, { padStart = false, className = '' } = {}) {
    const el = mk('div', `flex items-center ${className}`); const digits = new Map(); let value = null;
    const mkDigit = (v) => {
      const d = mk('div', 'relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums');
      const z = mk('div', 'invisible'); z.textContent = '0'; d.append(z);
      const nums = Array.from({ length: 10 }, (_, n) => { const s = mk('span', 'absolute inset-0 flex items-center justify-center'); s.textContent = n; d.append(s); return s; });
      const g = { el: d, nums, x: v, v: 0, target: v, h: 0 };
      g.paint = () => { if (!g.h) g.h = z.offsetHeight; const pv = g.x % 10; nums.forEach((s, n) => { const off = (10 + n - pv) % 10; let y = off * g.h; if (off > 5) y -= 10 * g.h; s.style.transform = `translateY(${y}px)`; }); };
      return g;
    };
    t.every(16, () => {
      digits.forEach((g) => {
        if (!g.h) g.paint();
        if (Math.abs(g.target - g.x) < 0.001 && Math.abs(g.v) < 0.01) { if (g.x !== g.target) { g.x = g.target; g.paint(); } return; }
        for (let k = 0; k < 4; k++) { const dt = 0.004; const a = (-280 * (g.x - g.target) - 18 * g.v) / 0.3; g.v += a * dt; g.x += g.v * dt; }
        g.paint();
      });
    });
    el.set = (v) => {
      value = v; const s = String(Math.abs(Math.trunc(v))); const str = padStart && Math.abs(v) < 10 ? `0${s}` : s;
      const places = [...str].map((_, i) => 10 ** (str.length - i - 1)); const int = parseInt(s, 10);
      const kids = places.map((p) => {
        const dv = Math.floor(int / p) % 10; let g = digits.get(p);
        if (!g) { g = mkDigit(dv); digits.set(p, g); } else g.target = REDUCE ? (g.x = dv) : dv;
        return g;
      });
      [...digits.keys()].forEach((p) => { if (!places.includes(p)) digits.delete(p); });
      el.replaceChildren(...(v < 0 ? [document.createTextNode('-')] : []), ...kids.map((g) => g.el));
      kids.forEach((g) => g.paint());
    };
    el.get = () => value;
    return el;
  }
  /** AnimatedNumber: useSpring({ bounce: 0, duration }) -> critically damped chase, Math.round().toLocaleString(). */
  function animatedNumber(t, { className = '', duration = 1000, value = 0 } = {}) {
    const el = mk('span', `tabular-nums ${className}`); let x = value, v = 0, target = value; const w = 7.5 / (duration / 1000);
    el.textContent = Math.round(x).toLocaleString();
    t.every(16, () => {
      if (Math.abs(target - x) < 0.5 && Math.abs(v) < 0.5) { if (x !== target) { x = target; el.textContent = Math.round(x).toLocaleString(); } return; }
      for (let k = 0; k < 4; k++) { const dt = 0.004; const a = w * w * (target - x) - 2 * w * v; v += a * dt; x += v * dt; }
      el.textContent = Math.round(x).toLocaleString();
    });
    el.set = (n) => { target = n; if (REDUCE) { x = n; el.textContent = Math.round(n).toLocaleString(); } };
    return el;
  }

  /* ------------------------------------------------ MP: GlowEffect port */
  const BLUR = { softest: 4, soft: 8, medium: 12, strong: 16, stronger: 24, strongest: 24, none: 0 };
  function glowEffect({ colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'], mode = 'colorShift', blur = 'medium', duration = 5, scale = 1 } = {}) {
    const el = mk('div', `pointer-events-none absolute inset-0 h-full w-full transform-gpu ${mode === 'colorShift' ? 'motion-glow-shift' : ''}`);
    el.style.filter = `blur(${typeof blur === 'number' ? blur : BLUR[blur]}px)`; el.style.scale = String(scale); el.style.backfaceVisibility = 'hidden';
    if (mode === 'colorShift') {
      el.style.setProperty('--mpg-a', colors[0]); el.style.setProperty('--mpg-b', colors[1]);
      if (!REDUCE) el.animate(colors.map((c, i) => ({ '--mpg-a': c, '--mpg-b': colors[(i + 1) % colors.length] })), { duration: duration * 1000, iterations: Infinity, direction: 'alternate', easing: 'linear' });
    } else if (mode === 'static') el.style.background = `linear-gradient(to right, ${colors.join(', ')})`;
    return el;
  }

  /* ----------------------------------------------- MP: BorderTrail port */
  function borderTrail({ className = 'bg-zinc-500', size = 60, style = {}, duration = 5, ease = 'linear', iterations = Infinity } = {}) {
    const wrap = mk('div', 'pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]');
    const dot = mk('div', `absolute aspect-square ${className}`); Object.assign(dot.style, { width: `${size}px`, offsetPath: `rect(0 auto auto 0 round ${size}px)` }, style);
    wrap.append(dot);
    wrap.anim = REDUCE ? null : dot.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], { duration: duration * 1000, iterations, easing: ease, fill: iterations === Infinity ? 'none' : 'forwards' });
    wrap.dot = dot; return wrap;
  }

  /* -------------------------------------------- MP: ProgressiveBlur port */
  const ANGLE = { top: 0, right: 90, bottom: 180, left: 270 };
  function progressiveBlur({ direction = 'bottom', blurLayers = 8, className = '', blurIntensity = 0.25 } = {}) {
    const el = mk('div', `relative ${className}`); const layers = Math.max(blurLayers, 2); const seg = 1 / (blurLayers + 1);
    for (let i = 0; i < layers; i++) {
      const stops = [i * seg, (i + 1) * seg, (i + 2) * seg, (i + 3) * seg].map((p, k) => `rgba(255, 255, 255, ${k === 1 || k === 2 ? 1 : 0}) ${p * 100}%`);
      const g = `linear-gradient(${ANGLE[direction]}deg, ${stops.join(', ')})`;
      const l = mk('div', 'pointer-events-none absolute inset-0 rounded-[inherit]');
      Object.assign(l.style, { maskImage: g, WebkitMaskImage: g, backdropFilter: `blur(${i * blurIntensity}px)`, WebkitBackdropFilter: `blur(${i * blurIntensity}px)` });
      el.append(l);
    }
    return el;
  }

  /* ----------------------------------------------- Kit: Spinner port */
  let spinUid = 0;
  function kitSpinner(variant, size = 16, cls = '') {
    const sz = `width="${size}" height="${size}"`;
    switch (variant) {
      case 'throbber': return ico('loader', `animate-spin ${cls}`, 2, size);
      case 'pinwheel': return ico('loader-pinwheel', `animate-spin ${cls}`, 2, size);
      case 'circle-filled': return `<div class="relative ${cls}" style="width:${size}px;height:${size}px"><div class="absolute inset-0 rotate-180">${ico('loader-circle', 'animate-spin text-foreground opacity-20', 2, size)}</div>${ico('loader-circle', 'relative animate-spin', 2, size)}</div>`;
      case 'ellipsis': { const u = `kit-ell-${++spinUid}`; const an = (b, id) => `<animate attributeName="cy" begin="${b}" calcMode="spline" dur="0.6s"${id ? ` id="${id}"` : ''} keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12"/>`;
        return `<svg ${sz} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${cls}"><title>Loading...</title><circle cx="4" cy="12" fill="currentColor" r="2">${an(`0;${u}3.end+0.25s`, `${u}1`)}</circle><circle cx="12" cy="12" fill="currentColor" r="2">${an(`${u}1.begin+0.1s`)}</circle><circle cx="20" cy="12" fill="currentColor" r="2">${an(`${u}1.begin+0.2s`, `${u}3`)}</circle></svg>`; }
      case 'ring': { const c = (b) => `<circle cx="22" cy="22" r="1"><animate attributeName="r" begin="${b}" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"/><animate attributeName="stroke-opacity" begin="${b}" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"/></circle>`;
        return `<svg ${sz} stroke="currentColor" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" class="${cls}"><title>Loading...</title><g fill="none" fill-rule="evenodd" stroke-width="2">${c('0s')}${c('-0.9s')}</g></svg>`; }
      case 'bars': return `<svg ${sz} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${cls}"><title>Loading...</title><rect class="kit-spinner-bar" fill="currentColor" height="22" width="6" x="1" y="1"/><rect class="kit-spinner-bar kit-spinner-bars-2" fill="currentColor" height="22" width="6" x="9" y="1"/><rect class="kit-spinner-bar kit-spinner-bars-3" fill="currentColor" height="22" width="6" x="17" y="1"/></svg>`;
      case 'infinite': return `<svg ${sz} preserveAspectRatio="xMidYMid" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="${cls}"><title>Loading...</title><path d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" fill="none" stroke="currentColor" stroke-dasharray="205.271142578125 51.317785644531256" stroke-linecap="round" stroke-width="10" style="transform:scale(0.8);transform-origin:50px 50px"><animate attributeName="stroke-dashoffset" dur="2s" keyTimes="0;1" repeatCount="indefinite" values="0;256.58892822265625"/></path></svg>`;
      default: return `<span role="status" aria-label="Loading" class="inline-flex">${ico('loader-circle', `size-4 animate-spin ${cls}`, 2, size)}</span>`;
    }
  }

  /* ------------------------------------------- Kit: tiny github highlighter */
  const TOK = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(<\/?)([A-Za-z][\w.]*)|\b(function|return|const|let|export|import|from|default|async|await|new)\b|\b(string|number|boolean|true|false|null|\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;
  function hl(line) {
    let out = '', last = 0, m; TOK.lastIndex = 0;
    while ((m = TOK.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += `<span class="tk-s">${esc(m[1])}</span>`;
      else if (m[2]) out += `${esc(m[2])}<span class="tk-t">${esc(m[3])}</span>`;
      else if (m[4]) out += `<span class="tk-k">${m[4]}</span>`;
      else if (m[5]) out += `<span class="tk-c">${m[5]}</span>`;
      else out += `<span class="tk-f">${esc(m[6])}</span>`;
      last = TOK.lastIndex;
    }
    return out + esc(line.slice(last));
  }
  const REACT_ICON = '<svg viewBox="-11.5 -10.232 23 20.463" class="h-4 w-4 shrink-0" aria-hidden="true"><circle r="2.05" fill="currentColor"/><g fill="none" stroke="currentColor"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>';
  const ghostIconBtn = (inner, label) => { const b = mk('button', 'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,opacity] outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--ring)_50%,transparent)]', inner); b.type = 'button'; b.setAttribute('aria-label', label); return b; };

  /* ===================================================================== */
  return [
    /* ------------------------------------- Text Effect · presets */
    { group: 'Motion', title: 'Text Effect · Presets', desc: 'The rest of TextEffect\'s presets building one answer: the headline lands per word with blur, the summary slides up per word, the aside fades in per character and the source line scales in, then all four exit in reverse.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-5'); stage.append(col);
        const q = mpBubble('What changed in React Compiler 1.0?'); col.append(q); await rise(q, t); await t.sleep(500);
        const grid = mk('div', 'grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-3'); col.append(grid);
        const rows = [
          ['blur', textEffect('React Compiler 1.0 is stable', { per: 'word', as: 'h3', preset: 'blur', className: 'text-lg font-medium text-zinc-950 dark:text-zinc-50' })],
          ['slide', textEffect('Automatic memoization ships on by default in new Vite, Next.js and Expo apps — most useMemo calls can go.', { per: 'word', preset: 'slide', className: 'text-sm leading-6 text-zinc-700 dark:text-zinc-300' })],
          ['fade', textEffect('Lint rules now live in eslint-plugin-react-hooks.', { per: 'char', preset: 'fade', className: 'text-sm text-zinc-500 dark:text-zinc-400' })],
          ['scale', textEffect('Sources: react.dev · github.com/facebook/react', { per: 'word', preset: 'scale', className: 'font-mono text-xs text-zinc-500' })],
        ];
        for (const [name, el] of rows) { const tag = mk('span', 'font-mono text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'); tag.textContent = name; grid.append(tag, el); }
        for (const [, el] of rows) { const ms = el.enter(); await t.sleep(Math.min(ms, 1600) * 0.75); }
        await t.sleep(3000);
        for (const [, el] of rows.slice().reverse()) { el.exit(); await t.sleep(260); }
        await t.sleep(1000);
      } },

    /* ------------------------------------- Text Effect · per line */
    { group: 'Motion', title: 'Text Effect · Per line', desc: 'per="line" with the docs\' overflow-hidden segment wrapper: each line of the agent\'s plan rises 40px out of its own mask on a 200 ms stagger, then the result summary replaces it the same way.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-4'); stage.append(col);
        const q = mpBubble('Fix the flaky checkout test.'); col.append(q); await rise(q, t);
        const status = mk('div', 'flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400', `${ico('loader-circle', 'size-3.5 animate-spin')}<span>Planning</span>`); col.append(status);
        await rise(status, t); await t.sleep(1100);
        const lineFx = (text) => textEffect(text, { per: 'line', wrap: 'overflow-hidden', stagger: 0.2, item: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }, className: 'text-sm leading-7 text-zinc-800 dark:text-zinc-200' });
        const plan = lineFx('1. Reproduce the failure with a fixed seed\n2. Trace the race between cart and payment mocks\n3. Await the payment promise before asserting\n4. Run the suite 50 times to confirm');
        col.append(plan); status.lastChild.textContent = 'Plan'; status.firstChild.remove();
        await t.sleep(plan.enter() + 2200);
        status.innerHTML = `${ico('loader-circle', 'size-3.5 animate-spin')}<span>Running the suite</span>`;
        plan.exit(); await t.sleep(1400);
        plan.remove(); status.innerHTML = `${ico('check', 'size-3.5 text-emerald-600 dark:text-emerald-400')}<span>Done</span>`;
        const res = lineFx('Root cause: the payment mock resolved after the assertion.\nFix: await confirmPayment() in the checkout helper.\n50 of 50 runs passed.');
        col.append(res); await t.sleep(res.enter() + 3200);
      } },

    /* ------------------------------------- Text Effect · exit + trigger */
    { group: 'Motion', title: 'Text Effect · Exit & trigger', desc: 'The docs\' blur-slide variants driven by trigger: each status line resolves per character out of blur and 0% brightness, then exits upward 30px in reverse order before the next agent step takes its place.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root);
        const counter = mk('div', 'mb-4 font-mono text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'); stage.append(counter);
        const slot = mk('div', 'flex min-h-[64px] w-full items-center justify-center text-center'); stage.append(slot);
        const V = { hidden: { opacity: 0, filter: 'blur(10px) brightness(0%)', y: 0 }, visible: { opacity: 1, y: 0, filter: 'blur(0px) brightness(100%)' }, exit: { opacity: 0, y: -30, filter: 'blur(10px) brightness(0%)' } };
        const steps = ['Reading 4 files', 'Planning the change', 'Writing the patch', 'Running the tests', 'All checks passed'];
        for (const [i, s] of steps.entries()) {
          counter.textContent = i < steps.length - 1 ? `Step ${i + 1} of ${steps.length - 1}` : 'Complete';
          const el = textEffect(s, { per: 'char', item: V, stagger: 0.01, exitStagger: 0.01, className: `inline-flex flex-wrap justify-center text-xl font-medium ${i === steps.length - 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}` });
          slot.replaceChildren(el); el.enter();
          await t.sleep(2000);
          if (i === steps.length - 1) break;
          await t.sleep(el.exit());
        }
        await t.sleep(1800);
      } },

    /* ------------------------------------- Text Effect · custom delay */
    { group: 'Motion', title: 'Text Effect · Custom delay', desc: 'Three TextEffects chained with delay 0.5 / 1.5 / 2.5 s, as in the docs: a per-char flip-up headline (rotateX 90 → 0), a per-char fade subline and a blurred footnote announce a finished report.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root);
        const status = mk('div', 'flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400', `${ico('loader-circle', 'size-3.5 animate-spin')}<span>Generating report</span>`); stage.append(status);
        await rise(status, t); await t.sleep(1800); status.remove();
        const box = mk('div', 'flex flex-col items-center space-y-0 text-center text-zinc-900 dark:text-zinc-100'); stage.append(box);
        const a = textEffect('Your report is ready', { per: 'char', delay: 0.5, stagger: 0.05, className: 'text-2xl font-medium', item: { hidden: { opacity: 0, rotateX: 90, y: 10 }, visible: { opacity: 1, rotateX: 0, y: 0 } } });
        const b = textEffect('with 3 charts and a written summary', { per: 'char', delay: 1.5, className: 'text-sm text-zinc-600 dark:text-zinc-400' });
        const c = textEffect('(generated in 4.2s)', { per: 'char', delay: 2.5, preset: 'blur', className: 'pt-12 text-xs text-zinc-500' });
        box.append(a, b, c);
        await t.sleep(Math.max(a.enter(), b.enter(), c.enter()) + 3200);
        await fadeOut(box, t, 400);
      } },

    /* ------------------------------------- Text Shimmer */
    { group: 'Motion', title: 'Text Shimmer', desc: 'TextShimmer twice, with the docs\' props: the blue 1.2 s greeting on an empty chat, then the 1 s mono "Generating code..." label — a highlight band sized to the text length sweeping across a clipped gradient — until the answer arrives.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-4'); stage.append(col);
        const hello = textShimmer('Hi, how are you?', { duration: 1.2, className: 'motion-shimmer-blue text-xl font-medium' });
        const hw = mk('div', 'flex justify-center'); hw.append(hello); col.append(hw); await rise(hw, t);
        await t.sleep(2600); await fadeOut(hw, t); hw.remove();
        const q = mpBubble('Write a hook that streams server-sent events.'); col.append(q); await rise(q, t);
        const gen = textShimmer('Generating code...', { duration: 1, className: 'font-mono text-sm' }); col.append(gen);
        await t.sleep(3000);
        const ans = mk('p', 'text-sm leading-6 text-zinc-800 dark:text-zinc-200'); gen.replaceWith(ans);
        await streamInto(ans, 'Open an EventSource inside useEffect, append each message to state with a functional update, and close the source in the cleanup so a remount never leaves a dangling connection.', t, 34);
        await t.sleep(3200);
      } },

    /* ------------------------------------- Text Scramble */
    { group: 'Motion', title: 'Text Scramble', desc: 'TextScramble in three roles: the docs\' "Generating the interface..." status with a dot-and-space character set over 1.2 s, the answer title decoding left to right, and a source link that re-scrambles at 10 ms per step on hover.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-4'); stage.append(col);
        const q = mpBubble('Design a pricing page for our API.'); col.append(q); await rise(q, t);
        const st = mk('p', 'font-mono text-sm text-zinc-500 dark:text-zinc-400'); col.append(st);
        for (let i = 0; i < 3; i++) { await scramble(st, 'Generating the interface...', t, { duration: 1.2, characterSet: '. ' }); await t.sleep(300); }
        st.remove();
        const title = mk('p', 'font-mono text-sm uppercase tracking-wide text-zinc-900 dark:text-zinc-100'); col.append(title);
        await scramble(title, 'Pricing page draft', t);
        const body = mk('p', 'text-sm leading-6 text-zinc-700 dark:text-zinc-300'); col.append(body);
        await streamInto(body, 'Three tiers with usage-based overage, a monthly / annual toggle and a comparison table under the fold. Copy follows the patterns below.', t, 30);
        const src = mk('div', 'flex flex-col gap-1 border-t border-zinc-200 pt-3 dark:border-zinc-800'); col.append(src);
        const links = ['Stripe — Pricing table patterns', 'Vercel — How we price usage'].map((s) => { const a = mk('a', 'w-fit text-sm text-zinc-500 transition-colors hover:text-black dark:hover:text-white'); a.href = '#'; a.onclick = (e) => e.preventDefault(); const sp = mk('span'); sp.textContent = s; a.append(sp); src.append(a); a.addEventListener('mouseenter', () => scramble(sp, s, t, { speed: 0.01 })); return [a, sp, s]; });
        await rise(src, t); await t.sleep(900);
        for (const [a, sp, s] of links) { a.classList.add('text-black', 'dark:text-white'); await scramble(sp, s, t, { speed: 0.01 }); await t.sleep(500); a.classList.remove('text-black', 'dark:text-white'); await t.sleep(300); }
        await t.sleep(2400);
      } },

    /* ------------------------------------- Text Morph */
    { group: 'Motion', title: 'Text Morph', desc: 'TextMorph keys every letter by character and occurrence, so shared letters glide to their new slot on a spring while the rest fade — here the agent\'s state word, and the docs\' Continue → Confirm button guarding a command.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'gap-10');
        const word = textMorph(mk('p', 'text-4xl font-medium text-black sm:text-5xl dark:text-white')); stage.append(word);
        const card = mk('div', 'flex w-full max-w-sm items-center gap-3 rounded-2xl border border-zinc-950/10 p-2 pl-4 dark:border-zinc-50/10');
        card.innerHTML = `<code class="min-w-0 flex-1 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">rm -rf .next && pnpm build</code>`;
        const btn = mk('button', 'flex h-10 w-[120px] shrink-0 items-center justify-center rounded-full bg-black px-4 text-base font-medium text-zinc-50 shadow-xs transition-[colors,transform] hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200'); btn.type = 'button';
        const lab = textMorph(mk('span')); btn.append(lab); card.append(btn);
        const press = async () => { btn.style.transform = 'scale(0.96)'; await t.sleep(120); btn.style.transform = ''; };
        word.set('Thinking'); await t.sleep(1500);
        word.set('Planning'); await t.sleep(1500);
        word.set('Waiting'); lab.set('Continue'); stage.append(card); await rise(card, t); await t.sleep(1300);
        await press(); lab.set('Confirm'); await t.sleep(1300);
        await press(); card.style.transition = 'opacity .3s ease'; card.style.opacity = '0.4'; btn.disabled = true;
        word.set('Building'); await t.sleep(2000);
        word.set('Done'); await t.sleep(2600);
      } },

    /* ------------------------------------- Text Loop */
    { group: 'Motion', title: 'Text Loop', desc: 'TextLoop twice: the docs\' four prompt suggestions cycle every 2 s as the composer placeholder, then the custom-variants loop (rotateX + blur on a stiffness 900 / damping 80 / mass 10 spring) rolls through who the agent is searching templates for.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-5'); stage.append(col);
        const thread = mk('div', 'flex min-h-[120px] flex-col justify-end gap-3'); col.append(thread);
        const comp = mk('div', 'flex items-center gap-2 rounded-2xl border border-zinc-950/10 py-2 pr-2 pl-4 dark:border-zinc-50/10'); col.append(comp);
        const ph = textLoop(['How can I assist you today?', 'Generate a logo', 'Create a component', 'Draw a diagram'].map(esc), { className: 'min-w-0 flex-1 font-mono text-sm text-zinc-400 dark:text-zinc-500' });
        const field = mk('div', 'min-w-0 flex-1 overflow-hidden'); field.append(ph);
        const send = mk('span', 'grid size-8 shrink-0 place-items-center rounded-full bg-black text-white dark:bg-white dark:text-black', ico('arrow-up', 'size-4'));
        comp.append(field, send); await rise(comp, t);
        for (let i = 0; i < 2; i++) { await t.sleep(2000); ph.next(); }
        await t.sleep(1400);
        const q = mpBubble('Create a component'); thread.append(q); await rise(q, t);
        const SPR = spring(900, 80, 10);
        const line = mk('p', 'inline-flex flex-wrap whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300'); line.append('Searching templates for ');
        const who = textLoop(['Founders', 'Developers', 'Designers', 'Design Engineers'].map(esc), { className: 'overflow-y-clip font-medium text-zinc-950 dark:text-zinc-50', transition: SPR,
          variants: { initial: { y: 20, rotateX: 90, opacity: 0, filter: 'blur(4px)' }, animate: { y: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)' }, exit: { y: -20, rotateX: -90, opacity: 0, filter: 'blur(4px)' } } });
        line.append(who); thread.append(line); await rise(line, t);
        for (let i = 0; i < 3; i++) { await t.sleep(2000); who.next(); }
        await t.sleep(1800);
      } },

    /* ------------------------------------- Text Roll */
    { group: 'Motion', title: 'Text Roll', desc: 'TextRoll on the response heading each time the answer is regenerated, cycling the docs\' three set-ups: the default rotateX flip, the blurred flip, and the 40px slide on a 0.3 s back-out ease with 50 ms letter delays.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'gap-6');
        const cap = mk('div', 'font-mono text-[11px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500'); stage.append(cap);
        const slot = mk('div', 'flex min-h-[48px] items-center justify-center'); stage.append(slot);
        const btn = mk('button', 'inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-950/10 px-3 text-sm text-zinc-700 transition-transform dark:border-zinc-50/10 dark:text-zinc-300', `${ico('rotate-ccw', 'size-3.5')}<span>Regenerate</span>`); btn.type = 'button';
        stage.append(btn);
        const RUNS = [
          ['default', {}],
          ['blur', { variants: { enter: { from: { rotateX: 0, filter: 'blur(0px)' }, to: { rotateX: 90, filter: 'blur(2px)' } }, exit: { from: { rotateX: 90, filter: 'blur(2px)' }, to: { rotateX: 0, filter: 'blur(0px)' } } } }],
          ['slide', { className: 'overflow-clip', variants: { enter: { from: { y: 0 }, to: { y: 40 } }, exit: { from: { y: -40 }, to: { y: 0 } } }, duration: 0.3, enterDelay: (i) => i * 0.05, exitDelay: (i) => i * 0.05 + 0.05, ease: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)' }],
        ];
        for (const [name, o] of RUNS) {
          btn.style.transform = 'scale(0.96)'; await t.sleep(120); btn.style.transform = '';
          cap.textContent = `variant · ${name}`;
          const el = textRoll('Answer ready', Object.assign({}, o, { className: `inline-block text-3xl font-medium text-black sm:text-4xl dark:text-white ${o.className || ''}` }));
          slot.replaceChildren(el); await t.sleep(el.total + 1800);
        }
        await t.sleep(800);
      } },

    /* ------------------------------------- Animated Number */
    { group: 'Motion', title: 'Animated Number', desc: 'AnimatedNumber as the response\'s token meter: every streamed chunk bumps the target and a zero-bounce spring (duration 1000, as in the counter example) chases it, rounded and locale-formatted.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-4'); stage.append(col);
        const q = mpBubble('Explain how HTTP/3 differs from HTTP/2.'); col.append(q); await rise(q, t);
        const p = mk('p', 'min-h-[120px] text-sm leading-6 text-zinc-800 dark:text-zinc-200'); col.append(p);
        const meter = mk('div', 'flex items-center justify-between border-t border-zinc-200 pt-3 text-zinc-800 dark:border-zinc-800 dark:text-zinc-50'); col.append(meter);
        const left = mk('div', 'flex items-center', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" class="mr-3 h-3 w-3 fill-transparent stroke-zinc-800 stroke-[1.3] dark:stroke-zinc-50" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>');
        const num = animatedNumber(t, { className: 'inline-flex items-center font-mono text-2xl font-light', duration: 1000 }); left.append(num);
        meter.append(left, mk('span', 'font-mono text-xs text-zinc-500', 'tokens'));
        await rise(meter, t);
        const text = 'HTTP/3 runs over QUIC instead of TCP, so a lost packet only stalls its own stream rather than every request on the connection. The handshake folds TLS 1.3 into the transport, which cuts a round trip on new connections and allows 0-RTT resumption, and connection IDs let a session survive a network change from Wi-Fi to cellular.';
        let toks = 0;
        for (const w of text.split(/(\s+)/).filter(Boolean)) { p.append(w); if (w.trim()) { toks += Math.ceil(w.length / 3.2) * 7; if (Math.random() < 0.35) num.set(toks); await t.sleep(rnd(50, 95)); } }
        num.set(toks); await t.sleep(1400);
        meter.lastChild.textContent = 'tokens · done'; await t.sleep(2600);
      } },

    /* ------------------------------------- Sliding Number */
    { group: 'Motion', title: 'Sliding Number', desc: 'SlidingNumber digit columns on the docs\' spring (stiffness 280, damping 18, mass 0.3): an mm:ss timer with padStart ticks while the agent works, and a progress percentage counts up one step every 10 ms per file.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-sm flex-col gap-6'); stage.append(col);
        const head = mk('div', 'flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400'); col.append(head);
        head.append(mk('span', '', 'Indexing repository'));
        const clock = mk('div', 'flex items-center gap-0.5 font-mono text-zinc-900 dark:text-zinc-100');
        const mm = slidingNumber(t, { padStart: true }), ss = slidingNumber(t, { padStart: true });
        clock.append(mm, mk('span', 'text-zinc-500', ':'), ss); head.append(clock); mm.set(0); ss.set(0);
        const big = mk('div', 'inline-flex items-center gap-1 font-mono text-[40px] leading-none text-black dark:text-white');
        const pct = slidingNumber(t); pct.set(0); big.append(pct, mk('span', 'text-zinc-400', '%')); col.append(big);
        const bar = mk('div', 'h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800', '<div class="h-full w-0 rounded-full bg-zinc-900 transition-[width] duration-150 dark:bg-zinc-100"></div>'); col.append(bar);
        const file = mk('div', 'h-5 truncate font-mono text-xs text-zinc-500'); col.append(file);
        await rise(col, t);
        const t0 = performance.now();
        const clk = t.every(250, () => { const s = Math.floor((performance.now() - t0) / 1000); ss.set(s % 60); mm.set(Math.floor(s / 60)); });
        const files = [['src/app/layout.tsx', 18], ['src/components/chat/*.tsx', 47], ['src/lib/stream.ts', 66], ['packages/ui/**', 89], ['README.md', 100]];
        let v = 0;
        for (const [f, to] of files) {
          file.textContent = f;
          while (v < to) { v++; pct.set(v); bar.firstChild.style.width = `${v}%`; await t.sleep(10); }
          await t.sleep(rnd(1100, 1700));
        }
        t.stop(clk); file.textContent = '1,284 files indexed'; await t.sleep(2600);
      } },

    /* ------------------------------------- Glow Effect */
    { group: 'Motion', title: 'Glow Effect', desc: 'The docs\' card mode as a generating card: Submit morphs to "Submitting...", a colorShift glow (blur medium, 4 s) fades in behind it in 0.2 s, the reply streams in, then the glow fades and the button morphs back.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root);
        const wrap = mk('div', 'relative h-[260px] w-full max-w-[380px]'); stage.append(wrap);
        const glowBox = mk('div', 'pointer-events-none absolute inset-0'); glowBox.style.opacity = '0'; glowBox.style.transition = 'opacity 0.2s ease-out';
        glowBox.append(glowEffect({ colors: ['#0894FF', '#C959DD', '#FF2E54', '#FF9004'], mode: 'colorShift', blur: 'medium', duration: 4 }));
        const card = mk('div', 'relative flex h-full flex-col justify-between gap-3 rounded-md border border-zinc-300/40 bg-zinc-100 px-4 py-3 dark:border-zinc-700/40 dark:bg-zinc-900');
        const prompt = mk('p', 'text-sm text-zinc-500 dark:text-zinc-400', 'Draft a launch post for our streaming UI kit.');
        const out = mk('p', 'min-h-0 flex-1 overflow-hidden text-sm leading-6 text-zinc-800 dark:text-zinc-200');
        const btn = mk('button', 'relative ml-1 flex h-8 scale-100 select-none appearance-none items-center justify-center self-end overflow-hidden rounded-lg border border-zinc-950/10 bg-white px-2 text-sm text-zinc-950 transition-transform focus-visible:ring-2 active:scale-[0.96] dark:border-zinc-50/10'); btn.type = 'button'; btn.setAttribute('aria-label', 'Load');
        const lab = textMorph(mk('span')); btn.append(lab); lab.set('Submit');
        card.append(prompt, out, btn); wrap.append(glowBox, card);
        await t.sleep(1200);
        btn.style.transform = 'scale(0.96)'; await t.sleep(120); btn.style.transform = '';
        lab.set('Submitting...'); glowBox.style.opacity = '1';
        await t.sleep(1400);
        await streamInto(out, 'Streaming UI, without the jank. Thinking states, token-by-token text and tool calls that settle instead of jump — copy the source, keep the motion.', t, 40);
        await t.sleep(600);
        glowBox.style.opacity = '0'; lab.set('Submit');
        await t.sleep(3000);
      } },

    /* ------------------------------------- Border Trail */
    { group: 'Motion', title: 'Border Trail', desc: 'BorderTrail around a pending reply: a 100px zinc light with the docs\' layered glow laps a pulsing skeleton (5 s linear), then the answer streams in under a green gradient trail on the [0, 0.5, 0.8, 0.5] ease, which fades out when its lap completes.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root);
        const card = mk('div', 'relative flex h-[220px] w-full max-w-[360px] flex-col justify-center rounded-md bg-zinc-200 px-5 py-2 dark:bg-zinc-800'); stage.append(card);
        const trail = borderTrail({ size: 100, style: { boxShadow: '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)' } });
        const sk = mk('div', 'flex h-full animate-pulse flex-col items-start justify-center space-y-2');
        sk.setAttribute('role', 'status'); sk.setAttribute('aria-label', 'Loading...');
        sk.innerHTML = ['w-4', 'w-10', 'w-12', 'w-12', 'w-12'].map((w) => `<div class="h-1 ${w} rounded-[4px] bg-zinc-600"></div>`).join('');
        card.append(trail, sk);
        await t.sleep(4200);
        trail.remove(); sk.remove();
        card.className = 'relative flex h-[220px] w-full max-w-[360px] flex-col rounded-md border border-zinc-300/40 bg-zinc-100 px-4 py-3 dark:border-zinc-700/40 dark:bg-zinc-900';
        const green = borderTrail({ className: 'bg-linear-to-l from-green-300 via-green-500 to-green-300 transition-opacity duration-300 dark:from-green-700/30 dark:via-green-500 dark:to-green-700/30', size: 120, duration: 4, ease: 'cubic-bezier(0, 0.5, 0.8, 0.5)', iterations: 1 });
        const p = mk('p', 'text-sm leading-6 text-zinc-800 dark:text-zinc-200');
        card.append(green, p); const g0 = performance.now();
        await streamInto(p, 'The migration is safe to run: every column it drops is unused since v2.3, the new index builds concurrently, and the down migration restores the old shape.', t, 45);
        await t.sleep(REDUCE ? 0 : Math.max(0, 4000 - (performance.now() - g0)));
        green.dot.style.opacity = '0';
        await t.sleep(3200);
      } },

    /* ------------------------------------- Progressive Blur */
    { group: 'Motion', title: 'Progressive Blur', desc: 'ProgressiveBlur (direction top, 8 layers, intensity 1) over a pinned-to-bottom response: as the answer streams and pushes upward, older lines pass through stacked backdrop blurs that deepen toward the top edge.', kind: 'lib',
      async run(root, t) {
        const stage = mpStage(root);
        const panel = mk('div', 'relative h-[280px] w-full max-w-md overflow-hidden rounded-[4px]'); stage.append(panel);
        const body = mk('div', 'absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 pb-5 text-sm leading-6 text-zinc-800 dark:text-zinc-200'); panel.append(body);
        panel.append(progressiveBlur({ direction: 'top', blurIntensity: 1, className: 'pointer-events-none absolute top-0 left-0 h-[55%] w-full' }));
        const q = mpBubble('Walk me through how a streaming response renders.'); body.append(q);
        const paras = [
          'The server flushes tokens as soon as the model emits them, usually as server-sent events over a single long-lived response.',
          'The client appends each chunk to state; React batches the updates so a burst of tokens costs one render instead of fifty.',
          'Markdown is parsed incrementally, so an unfinished code fence renders as plain text until its closing backticks arrive.',
          'Finally the scroll container stays pinned to the bottom unless the reader scrolls up, which pauses the follow behaviour.',
        ];
        for (const s of paras) { const p = mk('p'); body.append(p); await streamInto(p, s, t, 38); await t.sleep(400); }
        await t.sleep(3600);
      } },

    /* ------------------------------------- Kit: Spinner */
    { group: 'Kit', title: 'Spinner', desc: 'All eight Spinner variants as live agent statuses — default, throbber, pinwheel, circle-filled, ellipsis, ring, bars and infinite — overlapping as steps start on a stagger and settling to checks as each finishes.', kind: 'lib',
      async run(root, t) {
        const stage = kitStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full max-w-md flex-col gap-1'); stage.append(col);
        const head = mk('div', 'mb-2 flex items-center justify-between text-sm'); col.append(head);
        head.innerHTML = '<span class="font-medium">Agent run</span>';
        const timer = mk('span', 'font-mono text-xs tabular-nums text-muted-foreground', '0.0s'); head.append(timer);
        const STEPS = [['default', 'Loading the conversation'], ['throbber', 'Reading 12 files'], ['pinwheel', 'Searching the web'], ['circle-filled', 'Uploading the screenshot'], ['ellipsis', 'Drafting the reply'], ['ring', 'Waiting for the webhook'], ['bars', 'Analyzing build logs'], ['infinite', 'Thinking it through']];
        const rows = STEPS.map(([v, label]) => {
          const r = mk('div', 'flex h-8 min-w-0 items-center gap-3 text-sm');
          r.innerHTML = `<span class="grid size-5 shrink-0 place-items-center text-muted-foreground"><span class="size-1.5 rounded-full bg-current opacity-50"></span></span><span class="min-w-0 flex-1 truncate text-muted-foreground">${esc(label)}</span><code class="shrink-0 font-mono text-[11px] text-muted-foreground">${v}</code>`;
          col.append(r); return { r, v };
        });
        const t0 = performance.now(); const tm = t.every(100, () => { timer.textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s`; });
        const runStep = async ({ r, v }, i) => {
          await t.sleep(i * 520);
          const [ic, lab] = r.children; ic.className = 'grid size-5 shrink-0 place-items-center text-foreground'; ic.innerHTML = kitSpinner(v, 16); lab.className = 'min-w-0 flex-1 truncate text-foreground';
          await t.sleep(rnd(2400, 3600));
          ic.className = 'grid size-5 shrink-0 place-items-center text-emerald-600 dark:text-emerald-400'; ic.innerHTML = ico('check', 'size-4'); lab.className = 'min-w-0 flex-1 truncate text-muted-foreground';
        };
        await Promise.all(rows.map(runStep));
        t.stop(tm); timer.textContent = `Done in ${timer.textContent}`;
        await t.sleep(3000);
      } },

    /* ------------------------------------- Kit: Code Block */
    { group: 'Kit', title: 'Code Block', desc: 'The CodeBlock in a reply: a sample MyComponent streams line by line with line numbers, then a follow-up switches the language select to tsx, where diff notation marks the changed signature, and the copy button confirms.', kind: 'lib',
      async run(root, t) {
        const stage = kitStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full min-w-0 max-w-lg flex-col gap-3'); stage.append(col);
        const q = kitBubble('Write a React component that greets the user.'); col.append(q); await rise(q, t);
        const p = mk('p', 'text-sm leading-6'); col.append(p); await streamInto(p, 'Here is a small component that takes a name prop:', t, 30);
        const DATA = {
          jsx: { filename: 'MyComponent.jsx', code: 'function MyComponent(props) {\n  return (\n    <div>\n      <h1>Hello, {props.name}!</h1>\n      <p>This is an example React component.</p>\n    </div>\n  );\n}' },
          tsx: { filename: 'MyComponent.tsx', code: 'function MyComponent(props) {\nfunction MyComponent(props: { name: string }) {\n  return (\n    <div>\n      <h1>Hello, {props.name}!</h1>\n      <p>This is an example React component.</p>\n    </div>\n  );\n}', diff: { 0: 'remove', 1: 'add' } },
        };
        const block = mk('div', 'size-full min-w-0 overflow-hidden rounded-md border border-border');
        const header = mk('div', 'flex flex-row items-center border-b border-border bg-secondary p-1');
        const files = mk('div', 'flex min-w-0 grow flex-row items-center gap-2');
        const fname = mk('div', 'flex min-w-0 items-center gap-2 bg-secondary px-4 py-1.5 text-xs text-muted-foreground');
        const sel = mk('button', 'flex h-9 w-fit shrink-0 items-center justify-between gap-2 rounded-md border-none px-3 py-2 text-xs text-muted-foreground shadow-none outline-none'); sel.type = 'button';
        const copy = ghostIconBtn(ico('copy', 'text-muted-foreground', 2, 14), 'Copy code');
        files.append(fname); header.append(files, sel, copy);
        const item = mk('div', 'kit-code kit-ln mt-0 bg-background text-sm'); const pre = mk('pre', 'w-full'); const code = mk('code'); pre.append(code); item.append(pre);
        block.append(header, item);
        const setLang = (lang) => { fname.innerHTML = `${REACT_ICON}<span class="flex-1 truncate">${DATA[lang].filename}</span>`; sel.innerHTML = `<span>${lang}</span>${ico('chevron-down', 'size-4 opacity-50')}`; };
        setLang('jsx'); col.append(block); await rise(block, t);
        const streamCode = async (lang) => {
          code.innerHTML = ''; const d = DATA[lang];
          for (const [i, ln] of d.code.split('\n').entries()) {
            const s = mk('span', `line${d.diff && d.diff[i] ? ` diff ${d.diff[i]}` : ''}`); code.append(s);
            for (let k = 3; k < ln.length + 3; k += 3) { s.innerHTML = hl(ln.slice(0, k)); await t.sleep(16); }
            if (!ln) s.innerHTML = '';
          }
        };
        await streamCode('jsx'); await t.sleep(1200);
        const q2 = kitBubble('Make it TypeScript.'); col.insertBefore(q2, null); await rise(q2, t); await t.sleep(500);
        sel.classList.add('bg-background'); await t.sleep(260); sel.classList.remove('bg-background');
        setLang('tsx'); col.append(block); await streamCode('tsx'); await t.sleep(900);
        copy.classList.add('bg-muted'); copy.innerHTML = ico('check', 'text-muted-foreground', 2, 14); await t.sleep(2000);
        copy.classList.remove('bg-muted'); copy.innerHTML = ico('copy', 'text-muted-foreground', 2, 14); await t.sleep(1400);
      } },

    /* ------------------------------------- Kit: Snippet */
    { group: 'Kit', title: 'Snippet', desc: 'The Snippet closing an answer: two install commands type into tabbed panes, the reply flips to the second tab, and the hover-revealed copy button confirms with a check for its 2 s timeout.', kind: 'lib',
      async run(root, t) {
        const stage = kitStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full min-w-0 max-w-lg flex-col gap-3'); stage.append(col);
        const q = kitBubble('How do I add the snippet component?'); col.append(q); await rise(q, t);
        const p = mk('p', 'text-sm leading-6'); col.append(p); await streamInto(p, 'Install it with either package manager:', t, 30);
        const CMDS = [{ label: 'npm', icon: 'heart', code: 'npx shadcn@latest add snippet' }, { label: 'pnpm', icon: 'box', code: 'pnpm dlx shadcn@latest add snippet' }];
        const snip = mk('div', 'group flex w-full min-w-0 flex-col gap-0 overflow-hidden rounded-md border border-border');
        const header = mk('div', 'flex flex-row items-center justify-between border-b border-border bg-secondary p-1');
        const list = mk('div', 'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'); list.setAttribute('role', 'tablist');
        const trig = CMDS.map((c) => { const b = mk('button', 'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow,background-color]', `${ico(c.icon, '', 2, 14)}<span>${c.label}</span>`); b.type = 'button'; b.setAttribute('role', 'tab'); list.append(b); return b; });
        const copy = ghostIconBtn(ico('copy', '', 2, 14), 'Copy'); copy.classList.add('opacity-0', 'group-hover:opacity-100');
        header.append(list, copy);
        const pre = mk('pre', 'mt-0 truncate bg-background p-4 text-sm');
        snip.append(header, pre);
        const setTab = (i) => trig.forEach((b, k) => { b.setAttribute('aria-selected', String(i === k)); b.classList.toggle('bg-background', i === k); b.classList.toggle('shadow-sm', i === k); b.classList.toggle('dark:text-muted-foreground', i !== k); });
        setTab(0); col.append(snip); await rise(snip, t);
        const typeCmd = async (s) => { pre.textContent = ''; for (let k = 1; k <= s.length; k += 2) { pre.textContent = s.slice(0, k); await t.sleep(18); } pre.textContent = s; };
        await typeCmd(CMDS[0].code); await t.sleep(1500);
        setTab(1); await typeCmd(CMDS[1].code); await t.sleep(900);
        copy.classList.replace('opacity-0', 'opacity-100'); await t.sleep(500);
        copy.classList.add('bg-muted'); copy.innerHTML = ico('check', '', 2, 14); await t.sleep(2000);
        copy.classList.remove('bg-muted'); copy.innerHTML = ico('copy', '', 2, 14); copy.classList.replace('opacity-100', 'opacity-0');
        const done = mk('p', 'text-sm leading-6 text-muted-foreground'); col.append(done); await streamInto(done, 'Both add the same file under components/ui/snippet.', t, 30);
        await t.sleep(2400);
      } },

    /* ------------------------------------- Kit: Status */
    { group: 'Kit', title: 'Status', desc: 'Status badges — online, offline, maintenance, degraded, each with a pinging indicator — tracking a request as the router falls back across model providers before one answers and the reply streams.', kind: 'lib',
      async run(root, t) {
        const stage = kitStage(root, 'items-stretch');
        const col = mk('div', 'mx-auto flex w-full min-w-0 max-w-lg flex-col gap-3'); stage.append(col);
        const COLOR = { online: 'bg-emerald-500', offline: 'bg-red-500', maintenance: 'bg-blue-500', degraded: 'bg-amber-500' };
        const LABEL = { online: 'Online', offline: 'Offline', maintenance: 'Maintenance', degraded: 'Degraded' };
        const badge = (status) => {
          const b = mk('span', `group ${status} flex w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground`);
          b.set = (s) => { b.className = b.className.replace(/\b(online|offline|maintenance|degraded)\b/, s); b.innerHTML = `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${COLOR[s]}"></span><span class="relative inline-flex h-2 w-2 rounded-full ${COLOR[s]}"></span></span><span class="text-muted-foreground">${LABEL[s]}</span>`; };
          b.set(status); return b;
        };
        const PROV = [['us-east · primary', 'online'], ['eu-west', 'online'], ['ap-south', 'maintenance'], ['us-west · fallback', 'online']];
        const tbl = mk('div', 'flex flex-col divide-y divide-border rounded-md border border-border'); col.append(tbl);
        const rows = PROV.map(([name, s]) => { const r = mk('div', 'flex min-w-0 items-center justify-between gap-3 px-3 py-2 text-sm'); const n = mk('span', 'min-w-0 truncate font-mono text-xs'); n.textContent = name; const b = badge(s); r.append(n, b); tbl.append(r); return { r, b }; });
        await rise(tbl, t);
        const q = kitBubble('Summarize yesterday\'s incident report.'); col.append(q); await rise(q, t);
        const log = mk('div', 'flex min-h-[20px] items-center gap-2 text-xs text-muted-foreground'); col.append(log);
        const say = (s) => { log.innerHTML = `${ico('loader-circle', 'size-3.5 animate-spin')}<span class="truncate">${esc(s)}</span>`; };
        say('Routing to us-east · primary'); await t.sleep(1300);
        rows[0].b.set('offline'); say('us-east timed out · trying eu-west'); await t.sleep(1500);
        rows[1].b.set('degraded'); say('eu-west is slow · falling back to us-west'); await t.sleep(1600);
        log.innerHTML = `${ico('check', 'size-3.5 text-emerald-600 dark:text-emerald-400')}<span class="truncate">Answered by us-west · fallback</span>`;
        const p = mk('p', 'text-sm leading-6'); col.append(p);
        await streamInto(p, 'A bad config push at 14:02 dropped connection pooling on the primary region. Traffic failed over within four minutes; the rollback finished at 14:31 and no data was lost.', t, 32);
        await t.sleep(700); rows[0].b.set('online'); await t.sleep(3000);
      } },
  ];
});
