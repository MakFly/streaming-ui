/* X clones — components first shown on X, rebuilt pixel for pixel with their authors' permission. Each demo credits
 * its author and post in its description, which the Prompt dialog carries into the rebuild prompt (as /orbs does):
 *   Agent Status — Elia Kuratli (@eliakuratli), https://x.com/eliakuratli/status/2113618712066711970
 * Measured frame by frame from the posted videos; drawn with the app's semantic tokens so each follows light, dark and
 * the four palettes. Reduced motion: waits resolve at once and animations drop, so each lands on its final state. */
export default function pack(h) {
  'use strict';
  const { mk, $, esc, REDUCE } = h;
  const G = 'Agent';

  // A wait that resolves at once under reduced motion, so a demo lands straight on its final state.
  const xcWait = (t, ms) => (REDUCE ? Promise.resolve() : t.sleep(ms));
  function xcStyle(id, css) {
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.append(s);
  }
  const XC_ICONS = {
    fileSearch: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="11.5" cy="13.5" r="2.5"/><path d="M13.3 15.3L15 17"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
    filePen: '<path d="M12.5 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3"/><path d="M14 3v5h5"/><path d="M19.4 13.6a1.5 1.5 0 0 1 2.1 2.1L17 20.2l-3 .8.8-3z"/>',
    files: '<path d="M15.5 7H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2.5"/><path d="M6 3h6l4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>',
    flask: '<path d="M9.5 3h5M10.5 3v6L5.4 18.4A1.8 1.8 0 0 0 7 21h10a1.8 1.8 0 0 0 1.6-2.6L13.5 9V3"/><path d="M7.5 15h9"/>',
    terminal: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M7.5 9.5l2.5 2.5-2.5 2.5M12.5 14.5h4"/>',
    pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1.2"/><rect x="14" y="5" width="3.5" height="14" rx="1.2"/>',
    stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="1.5"/>',
    play: '<path d="M7 5.5v13l11-6.5z"/>',
    arrowUpRight: '<path d="M7.5 16.5l9-9M9 7.5h7.5V15"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.2 12.3l2.6 2.6 5-5.4"/>',
    xCircle: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>',
  };
  const xcIcon = (name, cls = '') => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}">${XC_ICONS[name] || ''}</svg>`;

  /* ---------------------------------------------------------- Agent Status */
  const XAS_CSS = `
.xas { --xas-ease:cubic-bezier(0.22,1,0.36,1); --xas-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  position:relative; max-width:100%; overflow:hidden; border-radius:20px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default);
  box-shadow:0 18px 40px -22px color-mix(in srgb, var(--color-text-primary) 35%, transparent); color:var(--color-text-primary); font-family:var(--font-sans); font-size:14px; line-height:20px; text-align:start;
  transition:width .42s var(--xas-ease), height .42s var(--xas-ease), border-radius .42s var(--xas-ease); }
.xas[data-open=true] { border-radius:24px; }
:where(.xas) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xas-head { display:flex; align-items:center; gap:10px; width:100%; height:40px; padding:0 16px 0 8px; white-space:nowrap; }
.xas-head:focus-visible, .xas-btn:focus-visible, .xas-open:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:-2px; border-radius:20px; }
.xas-orb { position:relative; flex:none; display:grid; place-items:center; width:24px; height:24px; }
.xas-orb .xas-spark { width:14px; height:14px; color:var(--color-status-orange-text); }
.xas-orb .xas-arc { position:absolute; inset:0; width:24px; height:24px; animation:xas-spin 1s linear infinite; }
.xas-orb .xas-arc circle { fill:none; stroke-width:1.5; }
.xas-orb .xas-arc .xas-track { stroke:color-mix(in srgb, var(--color-text-primary) 12%, transparent); }
.xas-orb .xas-arc .xas-sweep { stroke:var(--color-text-primary); stroke-linecap:round; stroke-dasharray:16 66; }
.xas-orb > .xas-done { width:24px; height:24px; color:var(--color-status-lime-text); animation:xas-pop .32s var(--xas-ease) both; }
.xas-orb > .xas-done.is-stop { color:var(--color-status-rose-text); }
.xas-hic { flex:none; display:grid; place-items:center; width:16px; height:16px; margin-right:-4px; color:var(--xas-muted); }
.xas-label { position:relative; min-width:0; flex:1; display:flex; overflow:hidden; color:var(--xas-muted); }
.xas-label > span { min-width:0; overflow:hidden; text-overflow:ellipsis; animation:xas-swap .3s var(--xas-ease) both; }
.xas[data-state=done] .xas-label, .xas[data-state=stopped] .xas-label { color:var(--color-text-primary); font-weight:500; }
.xas-time { flex:none; color:var(--xas-muted); font-variant-numeric:tabular-nums; }
.xas[data-state=done] .xas-time, .xas[data-state=stopped] .xas-time, .xas[data-state=done] .xas-hic, .xas[data-state=stopped] .xas-hic { display:none; }
.xas-shimmer { background:linear-gradient(90deg, var(--xas-muted) 0%, var(--xas-muted) 35%, var(--color-text-primary) 50%, var(--xas-muted) 65%, var(--xas-muted) 100%);
  background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:xas-shimmer 2s linear infinite; }
.xas-body { padding:8px 16px 12px; }
.xas[data-open=false] .xas-body { visibility:hidden; }
.xas-meta { display:flex; justify-content:space-between; gap:12px; font-size:13px; line-height:16px; color:var(--xas-muted); }
.xas-meta > span { white-space:nowrap; font-variant-numeric:tabular-nums; }
.xas-bar { display:flex; gap:4px; margin-top:8px; }
.xas-bar > span { position:relative; flex:1; height:3px; overflow:hidden; border-radius:2px; background:var(--color-background-tertiary-default); }
.xas-bar > span > i { position:absolute; inset:0; border-radius:inherit; background:var(--color-accent-500); transform:scaleX(0); transform-origin:left; transition:transform .1s linear; }
.xas-steps { position:relative; max-height:140px; margin-top:14px; overflow:hidden; }
.xas-steps > ol { display:flex; flex-direction:column; transition:transform .42s var(--xas-ease); }
.xas-row { display:flex; align-items:center; gap:10px; height:28px; overflow:hidden; animation:xas-row .36s var(--xas-ease) both; }
.xas-row-ic { flex:none; display:grid; place-items:center; width:16px; height:16px; color:var(--xas-muted); }
.xas-row-t { min-width:0; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; color:var(--xas-muted); }
.xas-row[data-done] .xas-row-t { color:var(--color-text-primary); }
.xas-row-d { flex:none; font-size:13px; color:var(--xas-muted); font-variant-numeric:tabular-nums; }
.xas-actions { display:flex; align-items:center; gap:8px; margin-top:14px; }
.xas-btn { display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 16px 0 14px; border-radius:999px; border:1px solid var(--color-border-button-default);
  font-weight:500; transition:background-color .2s, opacity .3s var(--xas-ease), transform .3s var(--xas-ease); }
.xas-btn:hover { background:var(--color-background-primary-hover); }
.xas-btn.is-gone { opacity:0; transform:scale(.96); pointer-events:none; }
.xas-open { display:inline-flex; align-items:center; gap:8px; height:36px; margin-left:auto; padding:0 4px 0 8px; color:var(--xas-muted); transition:color .2s; }
.xas-open:hover { color:var(--color-text-primary); }
@keyframes xas-spin { to { transform:rotate(360deg) } }
@keyframes xas-pop { from { opacity:0; transform:scale(.6) } }
@keyframes xas-swap { from { opacity:0; filter:blur(2px); transform:translateY(4px) } }
@keyframes xas-row { from { height:0; opacity:0 } }
@keyframes xas-shimmer { from { background-position:100% 0 } to { background-position:0% 0 } }
@media (prefers-reduced-motion: reduce) { .xas, .xas * { animation:none !important; transition:none !important; } }`;

  const XAS_STEPS = [
    { icon: 'fileSearch', run: 'Reading 12 files', done: 'Read 12 files', ms: 1900 },
    { icon: 'search', run: 'Searching for prorateInvoice', done: 'Found 4 call sites', ms: 1500 },
    { icon: 'filePen', run: 'Editing src/billing/invoice.ts', done: 'Edited src/billing/invoice.ts', ms: 2500 },
    { icon: 'files', run: 'Updating 5 test files', done: 'Updated 5 test files', ms: 1900 },
    { icon: 'flask', run: 'Running tests', tests: 12, done: 'Passed 12 of 12 tests', ms: 3300 },
    { icon: 'terminal', run: 'Pushing fix/proration-rounding', done: 'Pushed fix/proration-rounding', ms: 1400 },
  ];
  const XAS_ROW = 28, XAS_VISIBLE = 5, XAS_WIDTH = 400;
  const xasClock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  // Swaps the text of a slot for a new span that blurs in (CSS animation, no timer).
  function xasSwap(slot, text, cls = '') {
    const s = mk('span', cls); s.textContent = text; slot.replaceChildren(s);
  }

  /* ---------------------------------------------------------------- demos */
  return [
    { group: G, title: 'Agent Status', kind: 'scene',
      desc: 'Agent Status by Elia Kuratli (@eliakuratli, https://x.com/eliakuratli/status/2113618712066711970), cloned with permission: a status pill opens into a run card where six steps tick through a segmented bar, the oldest row scrolls away, Pause and Stop work, and the header settles on "Done in 13s · 6 files changed".',
      async run(root, t) {
        xcStyle('x-agent-status-css', XAS_CSS);
        const el = mk('section', 'xas'); el.dataset.open = 'false'; el.dataset.state = 'run'; el.setAttribute('aria-label', 'Agent status');
        el.innerHTML = `<button type="button" class="xas-head" aria-expanded="false"><span class="xas-orb"><svg class="xas-spark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5l1.1 7.4 4.6-5.9-2.8 6.9 6.9-2.8-5.9 4.6 7.4 1.1-7.4 1.1 5.9 4.6-6.9-2.8 2.8 6.9-4.6-5.9L12 22.5l-1.1-7.4-4.6 5.9 2.8-6.9-6.9 2.8 5.9-4.6L.7 11.2l7.4-1.1-5.9-4.6 6.9 2.8-2.8-6.9 4.6 5.9z"/></svg><svg class="xas-arc" viewBox="0 0 24 24" aria-hidden="true"><circle class="xas-track" cx="12" cy="12" r="10.5"/><circle class="xas-sweep" cx="12" cy="12" r="10.5"/></svg></span><span class="xas-hic"></span><span class="xas-label" role="status" aria-live="polite"></span><span class="xas-time" aria-hidden="true">0:00</span></button>
<div class="xas-body"><div class="xas-meta"><span>Claude Sonnet 5.5</span><span class="xas-step">Step 1 of ${XAS_STEPS.length}</span></div><div class="xas-bar" aria-hidden="true">${XAS_STEPS.map(() => '<span><i></i></span>').join('')}</div><div class="xas-steps"><ol aria-label="Steps"></ol></div><div class="xas-actions"><button type="button" class="xas-btn" data-act="pause">${xcIcon('pause')}<span>Pause</span></button><button type="button" class="xas-btn" data-act="stop">${xcIcon('stop')}<span>Stop</span></button><button type="button" class="xas-open">Open run ${xcIcon('arrowUpRight')}</button></div></div>`;
        root.append(el);
        const head = $('.xas-head', el), body = $('.xas-body', el), label = $('.xas-label', el), hic = $('.xas-hic', el), time = $('.xas-time', el);
        const list = $('.xas-steps > ol', el), stepOf = $('.xas-step', el), segs = [...el.querySelectorAll('.xas-bar i')];
        const pauseBtn = $('[data-act=pause]', el), stopBtn = $('[data-act=stop]', el);
        let open = false, paused = false, stopped = false, total = 0;

        // Opens the pill into the card (or back): width and height animate from measured sizes, then height goes auto.
        const setOpen = async (v) => {
          open = v; head.setAttribute('aria-expanded', String(v));
          const from = el.getBoundingClientRect();
          head.style.width = 'max-content'; const pillW = head.offsetWidth + 2; head.style.width = '';
          const W = Math.min(XAS_WIDTH, root.clientWidth || XAS_WIDTH);
          body.style.width = `${W - 2}px`;
          const H = v ? 40 + body.offsetHeight + 2 : 42;
          el.style.width = `${from.width}px`; el.style.height = `${from.height}px`;
          el.dataset.open = String(v);
          await xcWait(t, 20);
          el.style.width = `${v ? W : pillW}px`; el.style.height = `${H}px`;
          await xcWait(t, 440);
          if (open === v && v) { el.style.height = ''; body.style.width = ''; el.style.width = `${W}px`; }
        };
        head.onclick = () => setOpen(!open);
        pauseBtn.onclick = () => {
          paused = !paused;
          pauseBtn.innerHTML = `${xcIcon(paused ? 'play' : 'pause')}<span>${paused ? 'Resume' : 'Pause'}</span>`;
          $('.xas-arc', el).style.animationPlayState = paused ? 'paused' : '';
        };
        stopBtn.onclick = () => { stopped = true; };

        xasSwap(label, XAS_STEPS[0].run); hic.innerHTML = xcIcon(XAS_STEPS[0].icon);
        el.style.width = 'max-content';
        await xcWait(t, 700);
        await setOpen(true);

        let changed = 0;
        for (const [i, s] of XAS_STEPS.entries()) {
          if (stopped) break;
          const runText = (n) => (s.tests ? `${s.run} ${n} of ${s.tests}` : s.run);
          xasSwap(label, runText(0), 'xas-shimmer'); hic.innerHTML = xcIcon(s.icon);
          stepOf.textContent = `Step ${i + 1} of ${XAS_STEPS.length}`;
          const row = mk('li', 'xas-row');
          row.innerHTML = `<span class="xas-row-ic">${xcIcon(s.icon)}</span><span class="xas-row-t xas-shimmer"></span><span class="xas-row-d">0s</span>`;
          $('.xas-row-t', row).textContent = runText(0);
          list.append(row);
          const rows = list.children.length;
          if (rows > XAS_VISIBLE) list.style.transform = `translateY(-${(rows - XAS_VISIBLE) * XAS_ROW}px)`;
          let ms = 0, shown = 0;
          if (REDUCE) ms = s.ms;
          while (ms < s.ms && !stopped) {
            await t.sleep(100);
            if (paused) continue;
            ms += 100; total += 100;
            segs[i].style.transform = `scaleX(${ms / s.ms})`;
            $('.xas-row-d', row).textContent = `${Math.floor(ms / 1000)}s`;
            time.textContent = xasClock(total);
            const n = s.tests ? Math.min(s.tests, Math.floor((ms / s.ms) * (s.tests + 1))) : 0;
            if (n !== shown) { shown = n; xasSwap(label, runText(n), 'xas-shimmer'); $('.xas-row-t', row).textContent = runText(n); }
          }
          if (REDUCE) total += s.ms;
          if (stopped) break;
          segs[i].style.transform = 'scaleX(1)';
          row.dataset.done = ''; $('.xas-row-t', row).classList.remove('xas-shimmer');
          $('.xas-row-t', row).textContent = s.done; $('.xas-row-d', row).textContent = `${(s.ms / 1000).toFixed(1)}s`;
          if (s.icon === 'filePen' || s.icon === 'files') changed += s.icon === 'files' ? 5 : 1;
        }

        for (const b of [pauseBtn, stopBtn]) b.classList.add('is-gone');
        const orb = $('.xas-orb', el);
        if (stopped) {
          el.dataset.state = 'stopped';
          orb.innerHTML = xcIcon('xCircle', 'xas-done is-stop');
          xasSwap(label, `Stopped after ${Math.max(1, Math.round(total / 1000))}s`);
        } else {
          el.dataset.state = 'done';
          orb.innerHTML = xcIcon('checkCircle', 'xas-done');
          xasSwap(label, `Done in ${Math.round(total / 1000)}s · ${changed} files changed`);
          stepOf.textContent = `${XAS_STEPS.length} of ${XAS_STEPS.length} steps`;
        }
        await xcWait(t, 320);
        pauseBtn.remove(); stopBtn.remove();
      } },
  ];
}
