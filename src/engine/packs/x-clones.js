/* X clones — components first shown on X, rebuilt pixel for pixel with their authors' permission. Each demo credits
 * its author and post in its description, which the Prompt dialog carries into the rebuild prompt (as /orbs does):
 *   Agent Status — Elia Kuratli (@eliakuratli), https://x.com/eliakuratli/status/2113618712066711970
 *   RAG Pipeline — Jeet (@jeetnirnejak), https://x.com/jeetnirnejak/status/2095507715556831429
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
    message: '<path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V16.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z"/><path d="M12 8v3.2M12 13.6v.01"/>',
    hash: '<path d="M9.5 4L8 20M16 4l-1.5 16M4.5 9h15M4 15h15"/>',
    fileText: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    sparkles: '<path d="M10 4.5l1.6 4.4 4.4 1.6-4.4 1.6L10 16.5l-1.6-4.4L4 10.5l4.4-1.6z"/><path d="M17.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    rotate: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
    playOutline: '<path d="M7.5 5.5v13l10.5-6.5z"/>',
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

  /* ---------------------------------------------------------- RAG Pipeline */
  const XRG_CSS = `
.xrg { --xrg-ease:cubic-bezier(0.22,1,0.36,1); --xrg-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  --xrg-orange:var(--color-status-orange-text); --xrg-purple:var(--color-chart-5-active); --xrg-blue:var(--color-chart-6-active); --xrg-green:var(--color-chart-7-active); --xrg-pink:var(--color-chart-3-active);
  width:440px; max-width:100%; padding:0 10px; border-radius:28px; background:var(--color-background-secondary-default); border:1px solid var(--color-border-button-default);
  box-shadow:0 20px 44px -26px color-mix(in srgb, var(--color-text-primary) 40%, transparent); color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
:where(.xrg) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xrg [data-tone=orange] { --xrg-c:var(--xrg-orange); } .xrg [data-tone=purple] { --xrg-c:var(--xrg-purple); } .xrg [data-tone=blue] { --xrg-c:var(--xrg-blue); }
.xrg [data-tone=green] { --xrg-c:var(--xrg-green); } .xrg [data-tone=pink] { --xrg-c:var(--xrg-pink); }
.xrg-ink { color:color-mix(in oklab, var(--xrg-c) 68%, var(--color-text-primary)); }
.xrg-head { display:flex; align-items:center; justify-content:space-between; height:50px; padding:0 10px 0 12px; }
.xrg-title { font-size:15px; font-weight:600; letter-spacing:-.01em; }
.xrg-badge { height:20px; padding:0 9px; border-radius:999px; background:var(--color-background-tertiary-default); color:var(--xrg-muted); font-family:var(--font-mono); font-size:11px; line-height:20px; font-variant-numeric:tabular-nums; }
.xrg-panel { position:relative; padding:16px 18px; border-radius:20px; background:var(--color-background-primary-default); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 8%, transparent); }
.xrg-stage { position:relative; display:grid; grid-template-columns:22px minmax(0,1fr); column-gap:12px; padding-bottom:18px; }
.xrg-stage:last-of-type { padding-bottom:0; }
.xrg-stage:not(:last-of-type)::before { content:""; position:absolute; left:10.5px; top:26px; bottom:2px; width:1px; background:var(--color-border-button-default); }
.xrg-dot { position:absolute; left:8px; top:26px; width:6px; height:6px; border-radius:999px; background:var(--xrg-c); opacity:0; }
.xrg-stage[data-state=run] .xrg-dot { opacity:1; animation:xrg-travel var(--xrg-dur, 2s) linear both; }
@keyframes xrg-travel { from { transform:translateY(0) } to { transform:translateY(var(--xrg-drop, 40px)) } }
.xrg-ic { position:relative; z-index:1; display:grid; place-items:center; width:22px; height:22px; border-radius:6px; background:var(--color-background-secondary-default); color:var(--xrg-muted); transition:background-color .3s var(--xrg-ease), color .3s var(--xrg-ease); }
.xrg-ic svg { width:13px; height:13px; }
.xrg-stage[data-state=done] .xrg-ic { color:var(--color-text-primary); }
.xrg-stage[data-state=run] .xrg-ic { background:var(--xrg-c); color:var(--color-background-primary-default); }
.xrg-top { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:22px; }
.xrg-name { font-weight:600; }
.xrg-stage[data-state=idle] .xrg-name { color:var(--xrg-muted); }
.xrg-ms { font-family:var(--font-mono); font-size:11px; color:var(--xrg-muted); font-variant-numeric:tabular-nums; transition:opacity .3s; }
.xrg-stage[data-state=run] .xrg-ms { opacity:.55; }
.xrg-sub { grid-column:2; margin-top:3px; color:var(--xrg-muted); }
.xrg-sub > span { display:block; animation:xrg-in .3s var(--xrg-ease) both; }
.xrg-sub.is-mono { font-family:var(--font-mono); font-size:11.5px; color:var(--color-text-primary); }
.xrg-stage[data-key=query] .xrg-sub { color:var(--color-text-primary); }
.xrg-extra { grid-column:2; }
.xrg-cells { display:flex; gap:2px; height:10px; margin-top:8px; }
.xrg-cells > i { flex:1; border-radius:2px; background:var(--color-background-tertiary-default); transition:background-color .25s; }
.xrg-rows { display:flex; flex-direction:column; gap:7px; margin-top:10px; }
.xrg-row { display:grid; grid-template-columns:14px minmax(0,1fr) 54px 34px; align-items:center; gap:8px; height:20px; border-radius:6px; animation:xrg-in .35s var(--xrg-ease) both; }
.xrg-row.is-empty { grid-template-columns:14px 1fr; color:var(--xrg-muted); animation:none; }
.xrg-num { position:relative; display:grid; place-items:center; width:14px; height:14px; border-radius:999px; background:var(--xrg-c); color:var(--color-background-primary-default); font-size:9px; font-weight:700; }
.xrg-row.is-empty .xrg-num { background:none; border:1.5px solid var(--color-border-button-hover); }
.xrg-num::after { content:""; position:absolute; inset:-3px; border-radius:inherit; border:2px solid var(--xrg-c); opacity:0; }
.xrg-num.is-ping::after { animation:xrg-ping .9s var(--xrg-ease) both; }
.xrg-row.is-hot .xrg-num::after { opacity:.45; animation:none; }
@keyframes xrg-ping { 0% { opacity:.9; transform:scale(.8) } 100% { opacity:0; transform:scale(1.9) } }
.xrg-file { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-family:var(--font-mono); font-size:11.5px; }
.xrg-sim { height:4px; border-radius:2px; background:var(--color-background-tertiary-default); overflow:hidden; }
.xrg-sim > i { display:block; height:100%; border-radius:inherit; background:var(--xrg-c); transform:scaleX(0); transform-origin:left; transition:transform .6s var(--xrg-ease); }
.xrg-score { text-align:right; font-family:var(--font-mono); font-size:11.5px; font-variant-numeric:tabular-nums; }
.xrg-stack { display:flex; gap:2px; height:10px; margin-top:8px; overflow:hidden; border-radius:5px; background:var(--color-background-tertiary-default); }
.xrg-stack > i { height:100%; background:var(--xrg-c); transform:scaleX(0); transform-origin:left; transition:transform .45s var(--xrg-ease); }
.xrg-answer { margin-top:14px; padding-top:14px; border-top:1px dashed var(--color-border-button-default); font-size:13.5px; line-height:20px; animation:xrg-in .3s var(--xrg-ease) both; }
.xrg-cite { display:inline-grid; place-items:center; width:16px; height:16px; margin:0 1px 0 4px; border-radius:999px; vertical-align:-3px; background:var(--xrg-c); color:var(--color-background-primary-default); font-size:9.5px; font-weight:700; animation:xrg-pop .3s var(--xrg-ease) both; }
.xrg-cite:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:1px; }
.xrg-caret { display:inline-block; width:6px; height:13px; margin-left:3px; vertical-align:-2px; background:var(--color-text-primary); animation:xrg-blink 1s step-end infinite; }
.xrg-foot { display:flex; align-items:center; gap:8px; height:56px; padding:0 2px 0 12px; }
.xrg-status { display:flex; align-items:center; gap:8px; min-width:0; flex:1; font-weight:500; }
.xrg-status > span:last-child { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; animation:xrg-in .3s var(--xrg-ease) both; }
.xrg-sdot { flex:none; width:6px; height:6px; border-radius:999px; background:var(--xrg-c, var(--color-text-tertiary)); }
.xrg-status:not([data-tone]) { color:var(--xrg-muted); }
.xrg-status.is-done { color:var(--color-text-primary); }
.xrg-trio { display:flex; flex:none; } .xrg-trio > i { width:8px; height:8px; margin-left:-2px; border-radius:999px; background:var(--xrg-c); box-shadow:0 0 0 1.5px var(--color-background-secondary-default); }
.xrg-btn { display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 14px 0 12px; border-radius:999px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-weight:600; transition:opacity .2s, transform .2s var(--xrg-ease); }
.xrg-btn:active { transform:scale(.97); }
.xrg-btn svg { width:13px; height:13px; }
.xrg-icon-btn { display:grid; place-items:center; width:30px; height:30px; border-radius:999px; background:var(--color-background-tertiary-default); color:var(--color-text-primary); }
.xrg-icon-btn svg { width:13px; height:13px; }
.xrg-btn:focus-visible, .xrg-icon-btn:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
@keyframes xrg-in { from { opacity:0; transform:translateY(3px) } }
@keyframes xrg-pop { from { opacity:0; transform:scale(.5) } }
@keyframes xrg-blink { 50% { opacity:0 } }
@media (prefers-reduced-motion: reduce) { .xrg, .xrg * { animation:none !important; transition:none !important; } }`;

  const XRG_STAGES = [
    { key: 'query', name: 'Query', icon: 'message', tone: 'orange', idle: 'How do I rotate an API key without downtime?', status: 'Reading query', ms: 0, real: 1900 },
    { key: 'embed', name: 'Embed', icon: 'hash', tone: 'purple', idle: 'Encode the query as a vector', result: '11 tok → 1,536-dim vector', status: 'Embedding query', ms: 42, real: 2300 },
    { key: 'retrieve', name: 'Retrieve', icon: 'search', tone: 'blue', idle: 'Nearest neighbors from the index', result: 'top 3 of 1,284 chunks · cosine', status: 'Searching index', ms: 11, real: 3600 },
    { key: 'assemble', name: 'Assemble', icon: 'fileText', tone: 'green', idle: 'Merge top chunks into the prompt', result: '3 chunks + query → 488 tok', status: 'Assembling prompt', ms: 2, real: 1500 },
    { key: 'generate', name: 'Generate', icon: 'sparkles', tone: 'pink', idle: 'Stream the answer with citations', result: '488 tok → cited answer', status: 'Streaming answer', ms: 890, real: 0 },
  ];
  const XRG_SOURCES = [
    { file: 'security/api-keys.md', score: 0.92, tone: 'blue' },
    { file: 'guides/key-rotation.md', score: 0.87, tone: 'purple' },
    { file: 'reference/auth-tokens.md', score: 0.79, tone: 'pink' },
  ];
  // Query, then each chunk's share of the 488-token prompt, then the free room left in the bar.
  const XRG_STACK = [['orange', 0.025], ['blue', 0.33], ['purple', 0.29], ['pink', 0.235]];
  const XRG_ANSWER = ['Create a second key and deploy it alongside the old one', 1, ', then shift traffic over and watch for auth failures', 2, '. Once the old key sees no requests for 24 hours, revoke it', 3, '.'];
  // Grey levels of the embedding cells, fixed so every run draws the same vector.
  const XRG_CELLS = [3, 1, 4, 1, 5, 2, 6, 5, 3, 5, 2, 1, 6, 2, 4, 3, 2, 3, 6, 1, 5, 4, 2, 6, 4, 3, 1, 2, 5, 3, 4, 2, 6, 1, 2, 4, 3, 5];
  const xrgCell = (lv) => `color-mix(in srgb, var(--color-text-primary) ${8 + lv * 8}%, var(--color-background-primary-default))`;

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

    { group: G, title: 'RAG Pipeline', kind: 'scene',
      desc: 'RAG Pipeline by Jeet (@jeetnirnejak, https://x.com/jeetnirnejak/status/2095507715556831429), cloned with permission: a query runs through embed, retrieve, assemble and generate, each stage lighting in its own colour, and every citation in the streamed answer pings its source chunk; hover a citation to find it again.',
      async run(root, t) {
        xcStyle('x-rag-pipeline-css', XRG_CSS);
        const el = mk('section', 'xrg'); el.setAttribute('aria-label', 'RAG pipeline');
        el.innerHTML = `<div class="xrg-head"><span class="xrg-title">RAG Pipeline</span><span class="xrg-badge">5 stages</span></div><div class="xrg-panel"></div><div class="xrg-foot"><div class="xrg-status" role="status" aria-live="polite"></div><div class="xrg-actions" style="display:flex;gap:8px"></div></div>`;
        root.append(el);
        const panel = $('.xrg-panel', el), badge = $('.xrg-badge', el), status = $('.xrg-status', el), actions = $('.xrg-actions', el);
        let running = false;

        const setStatus = (tone, text, trio = false) => {
          if (tone) status.dataset.tone = tone; else delete status.dataset.tone;
          status.classList.toggle('xrg-ink', !!tone); status.classList.toggle('is-done', trio);
          status.innerHTML = `${trio ? `<span class="xrg-trio" aria-hidden="true">${XRG_SOURCES.map((s) => `<i data-tone="${s.tone}"></i>`).join('')}</span>` : '<span class="xrg-sdot" aria-hidden="true"></span>'}<span>${esc(text)}</span>`;
        };
        const setSub = (stage, text, mono) => { const sub = $('.xrg-sub', stage); sub.classList.toggle('is-mono', mono); sub.innerHTML = `<span>${esc(text)}</span>`; };
        const button = (cls, html, label, onclick) => { const b = mk('button', cls); b.type = 'button'; b.innerHTML = html; if (label) b.setAttribute('aria-label', label); b.onclick = onclick; return b; };

        // The idle card: every stage greyed with its placeholder, Ready, Run pipeline.
        const reset = () => {
          panel.innerHTML = XRG_STAGES.map((s) => `<div class="xrg-stage" data-key="${s.key}" data-tone="${s.tone}" data-state="idle"><span class="xrg-dot" aria-hidden="true"></span><span class="xrg-ic" aria-hidden="true">${xcIcon(s.icon)}</span><div class="xrg-top"><span class="xrg-name">${s.name}</span><span class="xrg-ms"></span></div><div class="xrg-sub"><span>${esc(s.idle)}</span></div><div class="xrg-extra"></div></div>`).join('');
          const ex = (key) => $(`[data-key=${key}] .xrg-extra`, panel);
          ex('embed').innerHTML = `<div class="xrg-cells" aria-hidden="true">${XRG_CELLS.map(() => '<i></i>').join('')}</div>`;
          ex('retrieve').innerHTML = `<div class="xrg-rows">${XRG_SOURCES.map(() => '<div class="xrg-row is-empty"><span class="xrg-num"></span><span>–</span></div>').join('')}</div>`;
          ex('assemble').innerHTML = `<div class="xrg-stack" aria-hidden="true">${XRG_STACK.map(([tone, w]) => `<i data-tone="${tone}" style="width:${w * 100}%"></i>`).join('')}</div>`;
          badge.textContent = '5 stages';
          setStatus(null, 'Ready');
          actions.replaceChildren(button('xrg-btn', `${xcIcon('playOutline')}Run pipeline`, '', () => pipeline()));
        };

        async function pipeline() {
          if (running) return;
          running = true;
          reset();
          actions.firstChild.style.opacity = '.5';
          const stages = [...panel.querySelectorAll('.xrg-stage')];
          let total = 0;
          for (const [i, s] of XRG_STAGES.entries()) {
            const stage = stages[i], ms = $('.xrg-ms', stage), extra = $('.xrg-extra', stage);
            const next = stages[i + 1];
            if (next) { stage.style.setProperty('--xrg-drop', `${next.offsetTop - stage.offsetTop - 8}px`); stage.style.setProperty('--xrg-dur', `${s.real || 1}ms`); }
            stage.dataset.state = 'run'; setStatus(s.tone, s.status);
            if (s.result) setSub(stage, s.result, true);
            // The stage's own work, while its time and the run total count up.
            const tick = (frac) => { const v = Math.round(s.ms * frac); if (s.ms) ms.textContent = `${v} ms`; badge.textContent = `${total + v} ms`; };
            if (s.key === 'embed') {
              const cells = [...extra.querySelectorAll('i')];
              for (const [j, c] of cells.entries()) { c.style.background = xrgCell(XRG_CELLS[j]); if (j % 3 === 2) { tick(j / cells.length); await xcWait(t, 150); } }
            } else if (s.key === 'retrieve') {
              const rows = $('.xrg-rows', extra); rows.replaceChildren();
              for (const [j, src] of XRG_SOURCES.entries()) {
                const row = mk('div', 'xrg-row'); row.dataset.tone = src.tone; row.dataset.src = String(j + 1);
                row.innerHTML = `<span class="xrg-num">${j + 1}</span><span class="xrg-file">${esc(src.file)}</span><span class="xrg-sim"><i></i></span><span class="xrg-score xrg-ink">0.00</span>`;
                rows.append(row);
                await xcWait(t, 30); $('.xrg-sim > i', row).style.transform = `scaleX(${src.score})`;
                for (let k = 1; k <= 8; k++) { $('.xrg-score', row).textContent = (src.score * (k / 8)).toFixed(2); await xcWait(t, 70); }
                tick((j + 1) / XRG_SOURCES.length); await xcWait(t, 500);
              }
            } else if (s.key === 'assemble') {
              for (const [j, seg] of [...extra.querySelectorAll('.xrg-stack > i')].entries()) { seg.style.transform = 'scaleX(1)'; tick((j + 1) / XRG_STACK.length); await xcWait(t, 300); }
            } else if (s.key === 'generate') {
              const answer = mk('p', 'xrg-answer'); const caret = mk('span', 'xrg-caret'); caret.setAttribute('aria-hidden', 'true');
              answer.append(caret); extra.append(answer);
              const words = XRG_ANSWER.flatMap((p) => (typeof p === 'number' ? [p] : p.split(/(?<= )/)));
              for (const [j, w] of words.entries()) {
                if (typeof w === 'number') {
                  const src = XRG_SOURCES[w - 1], row = $(`.xrg-row[data-src="${w}"]`, panel), num = $('.xrg-num', row);
                  const c = mk('button', 'xrg-cite'); c.type = 'button'; c.dataset.tone = src.tone; c.textContent = w;
                  c.setAttribute('aria-label', `Source ${w}: ${src.file}`);
                  c.onmouseenter = c.onfocus = () => { row.classList.add('is-hot'); num.classList.remove('is-ping'); void num.offsetWidth; num.classList.add('is-ping'); };
                  c.onmouseleave = c.onblur = () => row.classList.remove('is-hot');
                  answer.insertBefore(c, caret);
                  num.classList.remove('is-ping'); await xcWait(t, 20); num.classList.add('is-ping');
                  await xcWait(t, 260);
                } else { answer.insertBefore(document.createTextNode(w), caret); await xcWait(t, 55); }
                tick((j + 1) / words.length);
              }
              caret.remove();
            } else await xcWait(t, s.real);
            if (s.ms) ms.textContent = `${s.ms} ms`;
            total += s.ms; badge.textContent = `${total} ms`;
            stage.dataset.state = 'done';
          }
          setStatus(null, `Grounded in ${XRG_SOURCES.length} sources`, true);
          actions.replaceChildren(button('xrg-icon-btn', xcIcon('rotate'), 'Reset', () => { if (!running) reset(); }), button('xrg-btn', `${xcIcon('rotate')}Replay`, '', () => pipeline()));
          running = false;
        }

        reset();
        await xcWait(t, 900);
        await pipeline();
      } },
  ];
}
