/* Streaming responses — the Agent collection as a faithful vanilla implementation.
 * Components below cover agent-thinking, composer-loader, agent-log
 * (Task List / Web Search), agent-progress and composer markup and motion. */
import { REMIX_ICONS, BRAND_MARKS } from './icons.js';

/** Builds the Agent components and their demos. Called once by the registry. */
export function createCore() {

  /* ------------------------------------------------------------------ utils */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SOFT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const LINE_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Timer-based ticks: rAF is throttled hard in background/hidden panes, so state changes never kick off there.
  const frame = () => new Promise((r) => setTimeout(r, 20));
  const tick = (fn) => setTimeout(fn, 20);

  function timers() {
    const s = new Set(); let dead = false;
    return {
      get dead() { return dead; },
      sleep: (ms) => new Promise((r) => { if (dead) return; const id = setTimeout(() => { s.delete(id); r(); }, ms); s.add(id); }),
      every: (ms, fn) => { const id = setInterval(fn, ms); s.add(id); return id; },
      stop: (id) => { clearInterval(id); clearTimeout(id); s.delete(id); },
      clear() { dead = true; s.forEach((id) => { clearTimeout(id); clearInterval(id); }); s.clear(); },
    };
  }

  const ic = (name, cls = '', style = '') => {
    const d = REMIX_ICONS[name];
    if (!d) console.warn('missing icon', name);
    return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" aria-hidden="true" class="remixicon ${cls}"${style ? ` style="${style}"` : ''}><path d="${d || ''}"></path></svg>`;
  };
  const mark = (brand, cls = 'size-3') => {
    const b = BRAND_MARKS[brand];
    return `<svg viewBox="${b.vb}" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true" class="shrink-0 ${cls} text-text-primary"${b.color ? ` style="color:${b.color}"` : ''}><path d="${b.d}"></path></svg>`;
  };

  /* -------------------------------------------------------- motion helpers */
  function blurIn(el, { blur = 5, y = 4, ms = 420, ease = LINE_EASE, delay = 0 } = {}) {
    if (REDUCE) return;
    el.style.opacity = '0'; el.style.filter = `blur(${blur}px)`; el.style.transform = `translateY(${y}px)`;
    tick(() => {
      el.style.transition = `opacity ${ms}ms ${ease} ${delay}ms, filter ${ms}ms ${ease} ${delay}ms, transform ${ms}ms ${ease} ${delay}ms`;
      el.style.opacity = '1'; el.style.filter = 'blur(0px)'; el.style.transform = 'none';
    });
  }

  const REVEAL_MASK = 'linear-gradient(to bottom, #000 calc(100% - var(--sui-reveal-fade, 0px)), transparent calc(100% + 1px))';
  function unitInit(el) {
    if (REDUCE) return;
    el.style.opacity = '0'; el.style.height = '0px'; el.style.transform = 'translateY(4px)'; el.style.filter = 'blur(6px)';
    el.style.setProperty('--sui-reveal-fade', '22px');
    el.style.webkitMaskImage = REVEAL_MASK; el.style.maskImage = REVEAL_MASK;
  }
  async function unitReveal(el, t) {
    if (REDUCE) { el.style.height = 'auto'; return; }
    await frame();
    const h = el.scrollHeight;
    el.style.transition = `height .38s ${SOFT_EASE}, opacity .42s ${SOFT_EASE}, filter .42s ${SOFT_EASE}, transform .42s ${SOFT_EASE}, --sui-reveal-fade .44s ${SOFT_EASE}`;
    el.style.height = h + 'px'; el.style.opacity = '1'; el.style.transform = 'translateY(0px)'; el.style.filter = 'blur(0px)';
    el.style.setProperty('--sui-reveal-fade', '0px');
    await t.sleep(450);
    el.style.height = 'auto'; el.style.maskImage = ''; el.style.webkitMaskImage = ''; el.style.transition = '';
  }
  function collapse(body, closed) {
    const h = body.scrollHeight;
    body.style.transition = `height .3s ${SOFT_EASE}, opacity .3s ${SOFT_EASE}`;
    if (closed) { body.style.height = h + 'px'; tick(() => { body.style.height = '0px'; body.style.opacity = '0'; }); }
    else { body.style.height = '0px'; tick(() => { body.style.height = h + 'px'; body.style.opacity = '1'; setTimeout(() => { body.style.height = 'auto'; }, 320); }); }
  }

  /* ---------------------------------------------------------- AgentThinking */
  const DOTS_SEED = [0.55, 0.3, 0.15, 0.85, 0.55, 0.3, 1, 0.85, 0.55];
  function dotScalar(v, col, row) {
    const m = 2;
    if (v === 'wave') return ((col + row) / (2 * m)) * (3 / 4);
    const c = m / 2; return (Math.atan2(row - c, col - c) / (2 * Math.PI) + 1) % 1;
  }
  function dotOpacities(v, phase) {
    return Array.from({ length: 9 }, (_, i) => {
      const s = dotScalar(v, i % 3, Math.floor(i / 3));
      const behind = (phase - s + 1) % 1;
      const lit = Math.max(0, 1 - behind / 0.3) ** 1.5;
      return 0.12 + 0.88 * lit;
    });
  }
  const STAR_PATH = 'M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z';
  const STAR_LAYOUT = [{ x: 50, y: 46, s: 1 }, { x: 18, y: 22, s: 0.55 }, { x: 82, y: 26, s: 0.45 }, { x: 78, y: 76, s: 0.55 }, { x: 22, y: 78, s: 0.4 }];
  const INF_PATH = 'M28 14C33 5 47 5 47 14C47 23 33 23 28 14C23 5 9 5 9 14C9 23 23 23 28 14Z';

  function agentThinking(t, { variant = 'wave', label = 'Thinking', tone, shimmer = true, showTimer = true, className = '' } = {}) {
    const TONE = { subtle: 'var(--color-text-tertiary)', default: 'var(--color-text-secondary)', primary: 'var(--color-text-primary)', accent: 'var(--color-blue-500)' };
    const VT = { wave: 'default', spin: 'default', stars: 'subtle', infinity: 'default' };
    const color = TONE[tone || VT[variant]];
    const root = mk('div', `flex items-center gap-2.5 ${className}`);
    root.setAttribute('role', 'status'); root.style.color = color; root.style.setProperty('--sui-agent-thinking-tone', color);
    if (variant === 'wave' || variant === 'spin') {
      const grid = mk('span', 'grid shrink-0'); grid.setAttribute('aria-hidden', 'true');
      grid.style.gridTemplateColumns = 'repeat(3, 4px)'; grid.style.gap = '2px';
      const dots = DOTS_SEED.map((o) => { const d = mk('span', 'rounded-[1px] bg-current'); d.style.cssText = `width:4px;height:4px;opacity:${o};transition:opacity 220ms ease`; grid.append(d); return d; });
      root.append(grid);
      if (!REDUCE) { let phase = 0; t.every(80, () => { phase = (phase + 1 / 8) % 1; dotOpacities(variant, phase).forEach((o, i) => { dots[i].style.opacity = o; }); }); }
    } else if (variant === 'stars') {
      const box = mk('span', 'sui-agent-thinking-stars relative block shrink-0'); box.setAttribute('aria-hidden', 'true');
      box.style.width = '21px'; box.style.height = '21px';
      box.innerHTML = STAR_LAYOUT.map((st, i) => { const size = 14 * st.s; return `<svg viewBox="0 0 24 24" class="sui-agent-thinking-star absolute" style="width:${size}px;height:${size}px;left:${st.x}%;top:${st.y}%;margin-left:${-size / 2}px;margin-top:${-size / 2}px;animation-duration:1.4s;animation-delay:${(i * 1.4 * 0.7) / 5}s"><path d="${STAR_PATH}" fill="currentColor"></path></svg>`; }).join('');
      root.append(box);
    } else {
      root.insertAdjacentHTML('beforeend', `<svg aria-hidden="true" viewBox="0 0 56 28" class="shrink-0" style="width:32px;height:16px;margin:0 -4px"><path d="${INF_PATH}" fill="none" stroke="currentColor" stroke-width="2.75" opacity="0.15"></path><path d="${INF_PATH}" pathLength="100" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-dasharray="11 89" class="sui-agent-thinking-comet" style="animation-duration:1.2s"></path></svg>`);
    }
    const lbl = mk('span', `text-body-medium${shimmer ? ' sui-agent-thinking-label' : ''}`); lbl.setAttribute('aria-label', label); lbl.textContent = label; root.append(lbl);
    if (showTimer) {
      const tm = mk('span', 'font-mono text-caption-1-regular text-text-tertiary tabular-nums', '0.0s'); root.append(tm);
      const t0 = performance.now(); t.every(100, () => { tm.textContent = ((performance.now() - t0) / 1000).toFixed(1) + 's'; });
    }
    root.leave = async () => { root.style.transition = 'opacity .3s ease, transform .3s ease'; root.style.opacity = '0'; root.style.transform = 'translateY(-4px)'; await t.sleep(300); root.remove(); };
    return root;
  }

  /* --------------------------------------------------------- ComposerLoader */
  // The composer's surface. Busy shows through the composer itself (Stop, Agent Thinking), not around it.
  function composerLoader(child, { className = '' } = {}) {
    const root = mk('div', `relative ${className}`);
    const surface = mk('span', 'absolute inset-0 bg-background-primary-default shadow-xs'); surface.setAttribute('aria-hidden', 'true'); surface.style.borderRadius = '9999px';
    const content = mk('div', 'relative'); content.append(child);
    root.append(surface, content);
    return { el: root, setActive() {}, destroy() {} };
  }

  /* --------------------------------------------------------------- Composer */
  function composer({ status = false, placeholder = 'Ask me anything' } = {}) {
    const wrap = mk('div', 'flex w-full flex-col gap-2.5');
    // 1px border so the pill keeps a clean edge in every state, including while the agent works.
    const form = mk('div', 'flex h-[52px] w-full items-center gap-2.5 rounded-full border border-border-button-default bg-background-primary-default py-2 pe-2 ps-2 shadow-xs transition-colors duration-300');
    form.innerHTML = `<button type="button" aria-label="Add attachment" class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full p-2 outline-none transition-colors duration-150 ease focus-visible:ring-2 focus-visible:ring-border-focus-ring bg-ai-chat-composer-add-background hover:bg-ai-chat-composer-add-hover-background">${ic('add-line', 'size-5 text-foreground-icon-primary transition-transform duration-200 ease')}</button><input type="text" aria-label="Message" placeholder="${esc(placeholder)}" autocomplete="off" class="h-5 min-w-0 flex-1 bg-transparent text-body-regular text-text-primary caret-accent-500 outline-none placeholder:text-text-tertiary"><button type="button" aria-expanded="false" class="sui-model flex h-8 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-xl bg-background-primary-default py-1.5 pe-1 ps-2 outline-none transition-colors duration-150 ease hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"><span class="px-0.5 text-body-medium whitespace-nowrap text-text-secondary">Fable 5</span>${ic('arrow-down-s-line', 'size-[18px] shrink-0 text-foreground-icon-secondary transition-transform duration-200 ease')}</button><div class="flex shrink-0 items-center gap-2 ps-1.5"><button type="button" aria-label="Voice input" class="sui-mic flex size-9 cursor-pointer items-center justify-center rounded-full border border-border-button-default bg-background-primary-default p-2 shadow-xs transition-colors duration-150 ease hover:bg-background-primary-hover">${ic('mic-line', 'size-5 text-foreground-icon-primary')}</button><button type="button" aria-label="Send message" class="sui-send flex size-9 cursor-pointer items-center justify-center rounded-full bg-button-primary p-2 transition-opacity duration-200 ease">${ic('arrow-up-line', 'size-5 text-white')}</button></div>`;
    const loader = composerLoader(form);
    wrap.append(loader.el);
    if (status) {
      wrap.insertAdjacentHTML('beforeend', `<div class="flex h-[26px] w-full items-center justify-between"><div class="flex items-center gap-3"><button type="button" class="flex cursor-pointer items-center gap-1">${ic('git-branch-site', 'size-4 shrink-0 -scale-y-100 text-foreground-icon-secondary')}<span class="flex items-center"><span class="text-body-2-medium whitespace-nowrap text-text-secondary">Main</span></span></button><button type="button" aria-expanded="false" class="flex cursor-pointer items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">${ic('folder-line', 'size-4 shrink-0 text-foreground-icon-secondary')}<span class="flex items-center"><span class="text-body-2-medium whitespace-nowrap text-text-secondary">project-sea</span>${ic('arrow-drop-down', 'size-4 shrink-0 text-foreground-icon-secondary transition-transform duration-200 ease')}</span></button></div><div class="flex items-center gap-3"><button type="button" class="flex cursor-pointer items-center gap-1">${ic('infinity-line', 'size-4 shrink-0 text-foreground-icon-secondary')}<span class="flex items-center"><span class="text-body-2-medium whitespace-nowrap text-text-secondary">Agent</span>${ic('arrow-drop-down', 'size-4 shrink-0 text-foreground-icon-secondary')}</span></button><div class="flex items-center gap-1 rounded-[40px] bg-background-tertiary-default py-1 pe-2 ps-1.5"><svg class="shrink-0 -rotate-90" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-neutral-300)" stroke-width="2.5"></circle><circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-neutral-500)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="21.488493750554184 37.69911184307752"></circle></svg><span class="text-body-2-medium whitespace-nowrap text-text-secondary">57%</span></div></div></div>`);
    }
    const input = $('input', form);
    const api = {
      el: wrap, form, input, send: $('.sui-send', form), mic: $('.sui-mic', form), model: $('.sui-model', form),
      setBusy(v) {
        loader.setActive(v);
        form.classList.toggle('bg-background-primary-default', !v); form.classList.toggle('shadow-xs', !v); form.classList.toggle('bg-transparent', v);
        [api.model, api.mic].forEach((b) => b.classList.toggle('sui-glass', v));
      },
      async type(text, t, ms = 28) { input.value = ''; for (const ch of text) { input.value += ch; await t.sleep(ms); } },
      press() { api.send.style.transform = 'scale(.92)'; setTimeout(() => { api.send.style.transform = ''; }, 150); input.value = ''; },
    };
    return api;
  }

  /* ---------------------------------------------------------- chat surfaces */
  function userMessage(text, scene = false) {
    const p = mk('div', scene
      ? '-me-1.5 ms-auto flex w-fit max-w-[calc(50%+6px)] flex-col rounded-2xl bg-background-primary-default px-3 py-[11px] text-start text-body-regular text-text-primary shadow-card'
      : 'ml-auto w-fit max-w-[80%] rounded-2xl bg-background-secondary-default px-3 py-[11px] text-body-regular text-text-primary shadow-card dark:bg-background-primary-default');
    p.textContent = text; blurIn(p, { blur: 4, y: 4.6, ms: 420 }); return p;
  }
  function answerBlock(cls = '') {
    const d = mk('div', `flex flex-col gap-2 text-body-regular text-text-primary ${cls}`); blurIn(d, { blur: 4, y: 4, ms: 420 }); return d;
  }
  /** Paragraphs mount once and blur in, then only grow — whole words on a steady tick. */
  async function streamText(block, text, t, { ms = 48 } = {}) {
    for (const line of text.split('\n').filter((l) => l.trim())) {
      const p = mk('p'); block.append(p); blurIn(p, { blur: 5, y: 4, ms: 420 });
      const words = line.split(' ');
      for (let i = 0; i < words.length; i++) { p.textContent += (i ? ' ' : '') + words[i]; await t.sleep(ms); }
      await t.sleep(140);
    }
  }

  function chatFrame(root, { status = false } = {}) {
    const frame = mk('div', 'flex h-[500px] w-full max-w-[560px] flex-col gap-3 rounded-2xl border border-border-button-default p-3');
    const scroll = mk('div', 'flex-1 overflow-y-auto');
    const thread = mk('div', 'flex flex-col gap-4 px-1 pt-1');
    scroll.append(thread);
    const comp = composer({ status });
    frame.append(scroll, comp.el); root.append(frame);
    const mo = new MutationObserver(() => { scroll.scrollTop = scroll.scrollHeight; });
    mo.observe(thread, { childList: true, subtree: true, characterData: true });
    return { frame, thread, composer: comp, scroll };
  }
  function sceneFrame(root) {
    const frame = mk('div', 'flex h-[360px] w-full flex-col overflow-hidden rounded-3xl bg-background-secondary-default');
    const scroll = mk('div', 'flex min-h-0 flex-1 flex-col overflow-hidden');
    const thread = mk('div', 'mt-auto flex flex-col justify-end gap-3 px-4 pt-5');
    scroll.append(thread);
    const foot = mk('div', 'flex w-full flex-col gap-2.5 px-2.5 pt-4 pb-2.5');
    const comp = composer({ status: true }); foot.append(comp.el);
    frame.append(scroll, foot); root.append(frame);
    const mo = new MutationObserver(() => { scroll.scrollTop = scroll.scrollHeight; });
    mo.observe(thread, { childList: true, subtree: true, characterData: true });
    return { frame, thread, foot, composer: comp };
  }

  /* ---------------------------------------------------- Agent Log (shared) */
  function connector(first) {
    const s = mk('span', 'pointer-events-none absolute inset-y-0 start-0 w-3 text-foreground-icon-quaternary'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `<svg width="12" height="15" viewBox="0 0 12 15" fill="none" class="absolute top-0 start-0 rtl:-scale-x-100"><path d="M0.5 0 V8 Q0.5 14 6.5 14 H11.5" stroke="currentColor" stroke-width="1" pathLength="1" stroke-dasharray="1 1" style="stroke-dashoffset:${REDUCE ? 0 : 1};transition:stroke-dashoffset .14s linear ${first ? 0 : 0.12}s"></path></svg>`;
    s.play = () => tick(() => { $('path', s).style.strokeDashoffset = '0'; });
    s.addTrunk = () => {
      if ($('.sui-trunk', s)) return;
      const tr = mk('span', 'sui-trunk absolute start-0 w-px origin-top bg-current'); tr.style.cssText = `top:8px;bottom:0;transform:scaleY(${REDUCE ? 1 : 0});transition:transform .12s linear`;
      s.append(tr); tick(() => { tr.style.transform = 'scaleY(1)'; });
    };
    return s;
  }
  function logRow(content, { first = false, padCls = 'ps-4' } = {}) {
    const li = mk('li', `relative overflow-hidden ${padCls}`);
    const c = connector(first); li.append(c, content); unitInit(li);
    li.addTrunk = () => c.addTrunk();
    li.reveal = (t) => { c.play(); return unitReveal(li, t); };
    return li;
  }
  function bridge(h) {
    const b = mk('span', 'pointer-events-none absolute w-px origin-top bg-current text-foreground-icon-quaternary'); b.setAttribute('aria-hidden', 'true');
    b.style.cssText = `top:-${h}px;height:${h}px;inset-inline-start:7px;transform:scaleY(${REDUCE ? 1 : 0});transition:transform .12s linear`;
    b.play = () => tick(() => { b.style.transform = 'scaleY(1)'; });
    return b;
  }
  function workingRow(t, label, cls = '') {
    const d = mk('div', `overflow-hidden ${cls}`); const inner = mk('div', 'py-1'); inner.append(agentThinking(t, { variant: 'stars', label })); d.append(inner); unitInit(d);
    d.reveal = () => unitReveal(d, t);
    d.leave = async () => { d.style.height = d.offsetHeight + 'px'; await frame(); d.style.transition = 'opacity .25s ease, height .3s ease'; d.style.opacity = '0'; d.style.height = '0px'; await t.sleep(300); d.remove(); };
    return d;
  }
  const chip = (name) => {
    const tsx = /\.(t|j)sx?$/.test(name);
    return `<span class="me-0.5 ms-[3px] inline-flex max-w-full -translate-y-px items-center gap-1 rounded-md border py-0.5 pe-1.5 ps-1 align-middle border-border-button-default/50 bg-background-secondary-default transition-colors duration-150 ease hover:border-border-button-hover hover:bg-background-tertiary-default"><span class="flex size-3.5 shrink-0 items-center justify-center">${tsx ? ic('reactjs-line', 'size-3.5 text-[#61dafb]') : ic('braces-line', 'size-3.5 text-[#38bdf8]')}</span><span class="truncate text-caption-2-medium text-text-primary">${esc(name)}</span></span>`;
  };
  function swapText(span, text) {
    if (REDUCE) { span.textContent = text; return; }
    span.style.transition = 'opacity .2s ease, filter .2s ease, transform .2s ease';
    span.style.opacity = '0'; span.style.filter = 'blur(3px)'; span.style.transform = 'translateY(-3px)';
    setTimeout(() => { span.textContent = text; span.style.transform = 'translateY(3px)'; tick(() => { span.style.opacity = '1'; span.style.filter = 'blur(0px)'; span.style.transform = 'none'; }); }, 200);
  }

  /* -------------------------------------------------------------- Task List */
  async function taskList(container, tasks, t, { startDelay = 320, stepInterval = 850, working = 'Working', collapseOnComplete = false } = {}) {
    const list = mk('div', 'flex w-full flex-col gap-[5px]'); container.append(list);
    const tail = workingRow(t, working); container.append(tail);
    await t.sleep(startDelay); tail.reveal();
    const bodies = [];
    for (const tk of tasks) {
      const sec = mk('section', 'overflow-hidden');
      sec.innerHTML = `<button type="button" aria-expanded="true" class="group flex w-full cursor-pointer items-center gap-2 rounded-md py-0.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">${ic(tk.icon || 'search-line', 'size-4 shrink-0 text-foreground-icon-secondary')}<span class="min-w-0 flex-1 text-body-medium text-text-secondary"><span class="relative flex min-w-0 overflow-hidden"><span class="sui-title block truncate agent-progress-loading-text">${esc(tk.running || tk.title)}</span></span></span>${ic('arrow-down-s-line', 'size-4 shrink-0 text-foreground-icon-tertiary transition-transform duration-300 ease group-hover:text-foreground-icon-secondary rotate-180')}</button><div class="overflow-hidden" style="height:auto;opacity:1"><ul class="mt-0.5 ms-2 flex flex-col"></ul></div>`;
      unitInit(sec); list.append(sec);
      const body = $('div.overflow-hidden', sec), ul = $('ul', sec), btn = $('button', sec), chev = btn.lastElementChild, title = $('.sui-title', sec);
      let open = true; bodies.push({ body, chev, set(v) { open = v; btn.setAttribute('aria-expanded', open); chev.classList.toggle('rotate-180', open); collapse(body, !open); } });
      btn.onclick = () => bodies[bodies.length - 1 - (tasks.length - 1 - tasks.indexOf(tk))].set(!open);
      await unitReveal(sec, t);
      let prev = null;
      for (const [i, s] of tk.steps.entries()) {
        await t.sleep(stepInterval);
        const span = mk('span', 'block py-1 text-body-regular text-text-secondary'); span.append(document.createTextNode(s.label));
        for (const ch of s.chips || []) span.insertAdjacentHTML('beforeend', chip(ch));
        const li = logRow(span, { first: i === 0 }); if (prev) prev.addTrunk(); ul.append(li); prev = li; li.reveal(t);
      }
      await t.sleep(420);
      title.classList.remove('agent-progress-loading-text'); if (tk.running) swapText(title, tk.title);
      if (collapseOnComplete === true) bodies[bodies.length - 1].set(false);
    }
    await t.sleep(300); await tail.leave();
    if (collapseOnComplete === 'all') bodies.forEach((b) => b.set(false));
  }

  /* ------------------------------------------------------------- Web Search */
  function searchRow(s, first, t) {
    const content = mk('div', 'py-1');
    const icon = s.brand ? `<span class="mt-0.5 flex size-4 shrink-0 items-center justify-center">${mark(s.brand, 'size-[13px]')}</span>` : ic(s.icon || 'lightbulb-line', 'mt-0.5 size-4 shrink-0 text-foreground-icon-secondary');
    content.innerHTML = `<div class="flex items-start gap-2">${icon}<p class="min-w-0 flex-1 text-body-regular text-text-secondary">${esc(s.label)}${s.query ? `<span class="ms-1.5 font-mono text-caption-1-regular text-text-tertiary">${esc(s.query)}</span>` : ''}</p>${s.meta ? `<span class="shrink-0 pt-px text-body-regular text-text-tertiary tabular-nums">${esc(s.meta)}</span>` : ''}</div>`;
    const li = logRow(content, { first, padCls: 'ps-[14px]' });
    if (s.sources) {
      const rel = mk('div', 'relative mt-0.5'); const br = bridge(5); const ul = mk('ul', 'flex flex-col'); ul.style.marginInlineStart = '7px';
      rel.append(br, ul); content.append(rel); li.srcUl = ul; li.srcBridge = br;
    }
    return li;
  }
  function sourcesRow(sources, t) {
    const shown = sources.slice(0, 6); const more = sources.length - shown.length;
    const marks = shown.map((s, i) => `<span class="relative flex size-5 shrink-0 items-center justify-center rounded-full border border-border-button-default bg-background-primary-default" style="z-index:${shown.length - i};opacity:0;transition:opacity .3s ease ${i * 60}ms" title="${esc(s.title)} — ${esc(s.domain)}">${mark(s.brand, 'size-3')}</span>`).join('')
      + (more > 0 ? `<span class="relative flex size-5 shrink-0 items-center justify-center rounded-full border border-border-button-default bg-background-primary-default text-caption-2-medium text-text-secondary" style="z-index:0;opacity:0;transition:opacity .3s ease ${shown.length * 60}ms">+${more}</span>` : '');
    const content = mk('div', 'py-1');
    content.innerHTML = `<button type="button" aria-expanded="false" class="group flex cursor-pointer items-center rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"><span class="text-body-regular text-text-secondary">Sources</span><span class="ms-2 flex items-center" style="width:${shown.length * 20 - (shown.length - 1) * 6 + (more > 0 ? 14 : 0)}px"><span class="flex items-center -space-x-1.5">${marks}</span></span>${ic('arrow-down-s-line', 'ms-1 size-4 shrink-0 text-foreground-icon-quaternary transition-transform duration-300 ease group-hover:text-foreground-icon-secondary rotate-0')}</button><ul class="flex flex-col">${sources.map((s) => `<li class="overflow-hidden" style="height:0px;transition:height .3s ${SOFT_EASE}"><a class="flex items-center gap-2 rounded-md px-1 py-1 cursor-pointer transition-colors duration-150 ease hover:bg-background-secondary-default" href="${esc(s.href || 'https://' + s.domain)}" target="_blank" rel="noreferrer"><span class="flex size-5 shrink-0 items-center justify-center">${mark(s.brand, 'size-3.5')}</span><span class="flex min-w-0 flex-1 items-center gap-2" style="opacity:0;transition:opacity .3s ease"><span class="min-w-0 flex-1 truncate text-body-regular text-text-secondary">${esc(s.title)}</span><span class="hidden shrink-0 text-caption-1-regular text-text-tertiary sm:block">${esc(s.domain)}</span></a></li>`).join('')}</ul>`;
    const btn = $('button', content), chev = btn.lastElementChild; let open = false;
    btn.onclick = () => {
      open = !open; btn.setAttribute('aria-expanded', open); chev.classList.toggle('rotate-180', open);
      $$('ul > li', content).forEach((li, i) => { const a = li.firstElementChild; li.style.transitionDelay = (open ? i * 40 : 0) + 'ms'; li.style.height = open ? a.offsetHeight + 'px' : '0px'; a.lastElementChild.style.opacity = open ? '1' : '0'; });
    };
    const li = logRow(content, { first: false });
    li.showMarks = () => $$('.-space-x-1\\.5 > span', content).forEach((m) => { m.style.opacity = '1'; });
    return li;
  }
  async function webSearch(container, steps, t, { working = 'Searching', startDelay = 320 } = {}) {
    const root = mk('div', 'flex w-full flex-col'); container.append(root);
    const tail = workingRow(t, working); container.append(tail);
    const [head, ...rest] = steps;
    const headEl = mk('div', 'overflow-hidden');
    headEl.innerHTML = `<div class="py-1"><div class="flex items-start gap-2">${ic(head.icon || 'search-line', 'mt-0.5 size-4 shrink-0 text-foreground-icon-secondary')}<p class="min-w-0 flex-1 text-body-regular text-text-secondary">${esc(head.label)}</p></div></div>`;
    unitInit(headEl); root.append(headEl);
    const rel = mk('div', 'relative'); const br = bridge(6); const inner = mk('div'); inner.style.marginInlineStart = '7px';
    const ul = mk('ul', 'flex flex-col'); inner.append(ul); rel.append(br, inner); root.append(rel);
    await t.sleep(startDelay); tail.reveal(); await unitReveal(headEl, t);
    await t.sleep(head.dwell ?? 900);
    let prev = null;
    for (const [i, s] of rest.entries()) {
      const li = searchRow(s, i === 0, t); if (prev) prev.addTrunk(); ul.append(li); prev = li;
      if (i === 0) br.play(); li.reveal(t);
      if (s.sources) {
        await t.sleep(600);
        const src = sourcesRow(s.sources, t); li.srcUl.append(src.li || src); li.srcBridge.play(); src.reveal(t); setTimeout(() => src.showMarks(), 200);
      }
      await t.sleep(s.dwell ?? 1200);
    }
    await tail.leave();
  }

  /* --------------------------------------------------------- Agent Progress */
  function agentProgress(t, steps, { stepDuration = 1800, completionDelay = 1000 } = {}) {
    const card = mk('div', 'relative w-[341px] max-w-full overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default shadow-xs');
    card.innerHTML = `<span class="pointer-events-none absolute top-[14px] start-[14px] z-20 flex size-4 items-center justify-center"><svg class="shrink-0 -rotate-90" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.75" fill="none" stroke="var(--color-border-button-default)" stroke-width="2.5"></circle><circle data-progress-ring="true" cx="8" cy="8" r="6.75" fill="none" stroke="var(--color-agent-progress-ring)" stroke-width="2.5" stroke-linecap="round" pathLength="1" stroke-dashoffset="0" style="stroke-dasharray:0 1;transition:stroke-dasharray .5s ${SOFT_EASE}"></circle></svg></span><div class="absolute inset-x-0 top-0 px-2.5 pt-2 pb-2.5"><div class="pt-1"><div class="flex h-5 w-full items-center ps-1"><span class="flex h-4 w-6 shrink-0 items-center overflow-hidden"></span><span class="relative inline-flex min-w-0 overflow-hidden flex-1 text-body-medium text-text-secondary"><span class="sui-ap-label block whitespace-nowrap" style="transition:opacity .25s ease, filter .25s ease, transform .25s ease">${steps.length} steps left</span></span><button type="button" aria-label="Minimize steps" class="size-5 cursor-pointer rounded-sm transition-opacity duration-200 hover:opacity-80"><span class="relative block size-5 shrink-0"><span class="absolute top-px start-px size-[18px] rounded-sm bg-background-quaternary-default"></span><span class="absolute top-[13px] start-1 h-0.5 w-3 rounded-[3px] bg-foreground-icon-secondary"></span></span></button></div><div class="sui-ap-steps mt-[9px] flex flex-col gap-1.5"></div></div></div>`;
    const stepsEl = $('.sui-ap-steps', card), label = $('.sui-ap-label', card), ring = $('[data-progress-ring]', card);
    const rows = steps.map((text, i) => {
      const row = mk('div', 'h-8 w-full');
      row.innerHTML = `<div class="relative flex h-full w-full items-center gap-2 rounded-full" style="padding-inline:4px"><span class="sui-pill pointer-events-none absolute inset-0 rounded-full border border-border-button-default" style="opacity:0;transition:opacity .3s ease"></span><span class="relative z-10 flex size-3.5 shrink-0 items-center justify-center"><span class="sui-dashed absolute inset-[-0.5px]" style="opacity:1;transition:opacity .3s ease, transform .3s ease"><svg class="size-[15px]" viewBox="0 0 15 15"><circle cx="7.5" cy="7.5" r="7" fill="none" stroke="var(--color-background-quaternary-default)" stroke-dasharray="2 2"></circle></svg></span><span class="sui-ring absolute inset-0" style="opacity:0;transform:scale(.83);transition:opacity .3s ease, transform .3s ease"><svg class="size-3.5 shrink-0 -rotate-90" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-border-button-default)" stroke-width="1.5"></circle><circle data-step-progress="true" cx="7" cy="7" r="5.75" fill="none" stroke="var(--color-agent-progress-ring)" stroke-width="1.5" stroke-linecap="round" pathLength="1" stroke-dashoffset="0" style="stroke-dasharray:0 1"></circle></svg></span><span class="sui-check absolute inset-[-0.5px]" style="opacity:0;transform:scale(.75) rotate(-15deg);transition:opacity .35s ${SOFT_EASE}, transform .45s ${SOFT_EASE}"><svg class="size-[15px]" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="var(--color-background-quaternary-default)"></circle><path d="M4 7.5 5.646 9.146a.5.5 0 0 0 .708 0L10 5.5" fill="none" stroke="var(--color-foreground-icon-secondary)" stroke-width="1.5" stroke-linecap="round"></path></svg></span></span><span class="relative z-10 flex min-w-0 flex-1 items-center truncate leading-5"><span class="sui-lbl relative block min-w-0 max-w-full truncate text-body-medium leading-5 transition-colors duration-300 text-text-secondary"><span class="sui-txt inline-block">${esc(text)}</span><span class="sui-strike absolute top-1/2 end-0 start-0 h-px origin-left rtl:origin-right bg-current" style="opacity:0;transform:scaleX(0);transition:transform .4s ${SOFT_EASE}, opacity .2s ease"></span></span></span></div>`;
      blurIn(row, { blur: 4, y: 6, ms: 420, delay: 120 + i * 70 }); stepsEl.append(row); return row;
    });
    const HEADER = 42, total = HEADER + 9 + steps.length * 32 + (steps.length - 1) * 6;
    card.style.height = total + 'px'; card.style.transition = `height .45s ${SOFT_EASE}`;
    let minimized = false; $('button', card).onclick = () => { minimized = !minimized; card.style.height = (minimized ? HEADER : total) + 'px'; };
    const setLabel = (txt) => swapText(label, txt);
    async function run() {
      await t.sleep(600);
      for (const [i, row] of rows.entries()) {
        const q = (c) => $(c, row);
        const pill = q('.sui-pill'), dashed = q('.sui-dashed'), ringEl = q('.sui-ring'), check = q('.sui-check'), lbl = q('.sui-lbl'), txt = q('.sui-txt'), strike = q('.sui-strike'), prog = q('[data-step-progress]');
        pill.style.opacity = '1'; lbl.classList.replace('text-text-secondary', 'text-text-primary'); txt.classList.add('agent-progress-loading-text');
        await t.sleep(350);
        dashed.style.opacity = '0'; dashed.style.transform = 'scale(.8)'; ringEl.style.opacity = '1'; ringEl.style.transform = 'none';
        prog.style.transition = `stroke-dasharray ${stepDuration}ms linear`; await frame(); prog.style.strokeDasharray = '1 1';
        await t.sleep(stepDuration);
        ringEl.style.opacity = '0'; ringEl.style.transform = 'scale(.83)'; check.style.opacity = '1'; check.style.transform = 'none';
        txt.classList.remove('agent-progress-loading-text'); lbl.classList.replace('text-text-primary', 'text-text-secondary');
        strike.style.opacity = '.8'; strike.style.transform = 'scaleX(1)'; pill.style.opacity = '0';
        const left = steps.length - i - 1;
        setLabel(left ? `${left} step${left > 1 ? 's' : ''} left` : 'All steps completed');
        ring.style.strokeDasharray = `${(i + 1) / steps.length} 1`;
        await t.sleep(260);
      }
      await t.sleep(completionDelay);
    }
    return { el: card, run };
  }

  /* ------------------------------------------------------------- demos data */
  const HERO = 'The hero now leads with a shorter headline and a single call to action. The CTA copy moves from "Discover our plans" to "Start for free", which makes the next step obvious.';

  async function thinkScene(root, t, variant, label) {
    const sc = sceneFrame(root);
    sc.thread.append(userMessage('Redesign the pricing page hero and tighten the CTA copy.', true));
    await t.sleep(420);
    const th = agentThinking(t, { variant, label, className: 'px-1.5' }); sc.foot.prepend(th);
    await t.sleep(4200); await th.leave();
    const a = answerBlock('px-1'); sc.thread.append(a); await streamText(a, HERO, t);
  }

  const demos = [
    { group: 'Agent', title: 'Agent Thinking · Dot wave', desc: 'A 3×3 dot grid crossed by a diagonal wavefront — a bright band enters at the top-left, glides to the bottom-right with a fading trail, and re-enters after a beat. Shimmering label and elapsed timer, sitting above the composer.', kind: 'scene', run: (r, t) => thinkScene(r, t, 'wave', 'Thinking') },
    { group: 'Agent', title: 'Agent Thinking · Dot spin', desc: 'The same grid with a bright head orbiting clockwise, trailing a comet tail — reads as steady rotation without a spinner glyph.', kind: 'scene', run: (r, t) => thinkScene(r, t, 'spin', 'Searching the docs') },
    { group: 'Agent', title: 'Agent Thinking · Stars', desc: 'Five four-point sparkles twinkling in and out on a stagger. Defaults to the subtle tone so it reads quieter than the dot grids.', kind: 'scene', run: (r, t) => thinkScene(r, t, 'stars', 'Thinking') },
    { group: 'Agent', title: 'Agent Thinking · Infinity', desc: 'A comet trail lapping a figure-eight over a faint track — continuous motion with no start or end, for long-running agent work.', kind: 'scene', run: (r, t) => thinkScene(r, t, 'infinity', 'Thinking') },
    { group: 'Agent', title: 'Composer Loader', desc: 'The user\'s message lands, Agent Thinking thinks above the composer while Send turns into Stop, then the reply streams in and the composer is ready again.', kind: 'scene',
      async run(root, t) {
        const sc = sceneFrame(root); const c = sc.composer;
        await t.sleep(500); await c.type('Draft a migration plan to React 19.', t, 26); await t.sleep(400);
        const q = c.input.value; c.press();
        sc.thread.append(userMessage(q, true)); c.setBusy(true);
        const th = agentThinking(t, { variant: 'infinity', label: 'Thinking', className: 'px-1.5' }); sc.foot.prepend(th);
        await t.sleep(3800); await th.leave();
        const a = answerBlock('px-1'); sc.thread.append(a);
        await streamText(a, 'Four steps: upgrade dependencies and types, replace forwardRef with the ref prop, adopt Actions for forms, then enable the compiler on a pilot route.', t);
        c.setBusy(false);
      } },
    { group: 'Agent', title: 'Agent Progress', desc: 'A collapsible progress block for multi-step AI work. It introduces steps with a soft stagger, advances the active task with synchronized circular progress, preserves progress while minimized, and hands the UI back to the agent response once complete.', kind: 'chat',
      async run(root, t) {
        const ch = chatFrame(root);
        ch.thread.append(userMessage('Add dark mode to the project.'));
        await t.sleep(500);
        const wrap = mk('div', 'flex w-full'); const ap = agentProgress(t, ['Read project files', 'Update light mode tokens', 'Implement dark mode tokens', 'Register the theme toggle', 'Run lint and production build'], { stepDuration: 1600, completionDelay: 900 });
        wrap.append(ap.el); ch.thread.append(wrap);
        await ap.run();
        const a = answerBlock(); ch.thread.append(a);
        await streamText(a, 'Dark mode is in: both token sets live in theme.css and the toggle flips the class on the root element.\nLint and the production build pass with no warnings.', t);
      } },
    { group: 'Agent', title: 'Task List', desc: 'A streaming log of what an agent actually did. Tasks reveal one unit at a time, each animating its own height alongside a short blur and lift, while a curved guide strokes itself alongside them. A task shimmers its running title until every step has landed, then settles.', kind: 'chat',
      async run(root, t) {
        const ch = chatFrame(root);
        ch.thread.append(userMessage('Add a dark mode toggle to the dashboard'));
        const log = mk('div', 'flex w-full flex-col'); ch.thread.append(log);
        await taskList(log, [
          { running: 'Searching project files', title: 'Found project files', icon: 'search-line', steps: [{ label: 'Searching "app/page.tsx, components structure"' }, { label: 'Read', chips: ['page.tsx'] }, { label: 'Scanning 52 files' }, { label: 'Reading files', chips: ['layout.tsx'] }] },
          { running: 'Registering the theme toggle', title: 'Registered the theme toggle', icon: 'file-code-line', steps: [{ label: 'Created', chips: ['theme-toggle.tsx'] }, { label: 'Wired it into', chips: ['layout.tsx'] }, { label: 'Ran lint and type-check, 0 errors' }] },
        ], t);
        const a = answerBlock(); ch.thread.append(a);
        await streamText(a, 'Done. The toggle lives in the header and persists the choice to localStorage, so it survives a reload.\nIt reads the system preference only on first visit, then the manual choice wins.', t);
      } },
    { group: 'Agent', title: 'Web Search', desc: 'The research counterpart to Task List: each step is a query the agent ran or a page it opened, and a step that found something branches once more into its sources, shown as overlapping site marks. An Agent Thinking indicator sits at the tail and moves down as each step lands.', kind: 'chat',
      async run(root, t) {
        const ch = chatFrame(root);
        ch.thread.append(userMessage('What do teams actually pay for in a component library? Search online'));
        const log = mk('div', 'flex w-full flex-col'); ch.thread.append(log);
        await webSearch(log, [
          { label: 'Ran 3 searches', icon: 'search-line', dwell: 1200 },
          { label: 'Searching for what teams actually pay for in a component library', meta: '5 results', dwell: 2200, sources: [
            { brand: 'reddit', title: 'Tailwind UI vs building your own: a cost breakdown', domain: 'www.reddit.com' },
            { brand: 'linkedin', title: 'We shipped our design system in 6 weeks. Here is what it cost', domain: 'www.linkedin.com' },
            { brand: 'github', title: 'shadcn/ui — the registry model explained', domain: 'github.com' },
            { brand: 'figma', title: 'Design tokens: a practical guide', domain: 'www.figma.com' },
            { brand: 'notion', title: 'How we priced our component library', domain: 'www.notion.so' },
          ] },
          { label: 'Searched X for', query: 'component library OR design system pricing', brand: 'x', meta: '7 posts', dwell: 1900 },
          { label: 'Searched Reddit for', query: 'r/reactjs worth paying for', brand: 'reddit', meta: '12 threads', dwell: 1900 },
          { label: 'Reading the strongest three threads', dwell: 2200 },
        ], t);
        const a = answerBlock(); ch.thread.append(a);
        await streamText(a, 'The consistent answer across threads is time, not pixels: teams pay to skip the six weeks it takes to get tokens, theming and accessibility right.\nThe second theme is ownership. Registry-style libraries that copy source into the repo beat npm packages, because nobody wants a dependency they cannot patch.', t);
      } }
  ];

  const H = { mk, $, $$, esc, REDUCE, frame, tick, rnd };
  // Reference material for the Prompt dialog: every helper a demo's run() can reach.
  const refs = { mk, $, $$, esc, rnd, frame, tick, timers, ic, mark, blurIn, unitInit, unitReveal, collapse, dotScalar, dotOpacities, agentThinking, composerLoader, composer, userMessage, answerBlock, streamText, chatFrame, sceneFrame, connector, logRow, bridge, workingRow, chip, swapText, taskList, searchRow, sourcesRow, webSearch, agentProgress, thinkScene };
  const consts = { REDUCE: 'window.matchMedia("(prefers-reduced-motion: reduce)").matches', SOFT_EASE: JSON.stringify(SOFT_EASE), LINE_EASE: JSON.stringify(LINE_EASE), REVEAL_MASK: JSON.stringify(REVEAL_MASK), DOTS_SEED: JSON.stringify(DOTS_SEED), STAR_PATH: JSON.stringify(STAR_PATH), STAR_LAYOUT: JSON.stringify(STAR_LAYOUT), INF_PATH: JSON.stringify(INF_PATH), HERO: JSON.stringify(HERO) };
  return { demos, H, refs, consts, timers };
}
