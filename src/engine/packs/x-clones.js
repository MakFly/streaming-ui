/* X clones — components first shown on X, rebuilt pixel for pixel with their authors' permission. Each demo credits
 * its author and post in its description, which the Prompt dialog carries into the rebuild prompt (as /orbs does):
 *   Agent Status — Elia Kuratli (@eliakuratli), https://x.com/eliakuratli/status/2113618712066711970
 *   RAG Pipeline — Jeet (@jeetnirnejak), https://x.com/jeetnirnejak/status/2095507715556831429
 *   Release Pipeline Card — Akash (@a1x45h), https://x.com/a1x45h/status/2112964394825187349
 *   Parallel Research Run — Akash (@a1x45h), https://x.com/a1x45h/status/2113708491907215460
 *   Merge Conflicts — Phil Pitus (@pitus_), https://x.com/pitus_/status/2111519352503873866
 *   Merge Conflicts · One-shot v1 — Phil Pitus (@pitus_), https://x.com/pitus_/status/2111887566907802073
 *   Agent Approval Card — Kevin (@kvnkld, aicss.dev), https://x.com/kvnkld/status/2089693820313366635
 *   Floating Agent Chat — Louis Nguyen Studio (@louisnstudio), https://x.com/louisnstudio/status/2096525796714438833
 *     (measured on its live demo, crm-agent-pop.vercel.app)
 *   Deploy Status — Charles Postiaux (@PostiauxCharles), https://x.com/PostiauxCharles/status/2109606436527366235
 *     (three still images: the motion that plays them is ours)
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
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    history: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4M12 8v4l2.5 2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    code: '<path d="M8.5 8L4.5 12l4 4M15.5 8l4 4-4 4"/>',
    scissors: '<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.5 8.5L19 17M8.5 15.5L19 7"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.6 3.5-5.5 7-5.5s6.3 1.9 7 5.5"/>',
    asterisk: '<path d="M12 4v16M5 8l14 8M19 8L5 16"/>',
    scale: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
    shield: '<path d="M12 3.5l7 2.5v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/>',
    bug: '<rect x="7.5" y="8" width="9" height="11" rx="4.5"/><path d="M9.5 8a2.5 2.5 0 0 1 5 0M4 13h3.5M16.5 13H20M5 8.5l2.5 1.5M19 8.5l-2.5 1.5M5 18l2.5-1.5M19 18l-2.5-1.5"/>',
    upload: '<path d="M12 15V4.5M7.5 9L12 4.5 16.5 9"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
    gitBranch: '<circle cx="6.5" cy="5.5" r="2"/><circle cx="6.5" cy="18.5" r="2"/><circle cx="17.5" cy="7.5" r="2"/><path d="M6.5 7.5v9M17.5 9.5c0 4-5 4-10 7"/>',
    commit: '<circle cx="12" cy="12" r="3.5"/><path d="M3.5 12h5M15.5 12h5"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17.5 18.5z"/>',
    layers: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    alert: '<path d="M12 4.5l8.5 15h-17z"/><path d="M12 10.5v3.5M12 17v.01"/>',
    fork: '<circle cx="6" cy="5.5" r="2"/><circle cx="18" cy="5.5" r="2"/><circle cx="12" cy="18.5" r="2"/><path d="M6 7.5v1.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.5M12 12v4.5"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/>',
    tag: '<path d="M4 4.5h7l8.5 8.5-7 7L4 11.5z"/><circle cx="8" cy="8.5" r="1.2"/>',
    chevronRight: '<path d="M9.5 6.5L15 12l-5.5 5.5"/>',
    research: '<circle cx="14" cy="10" r="4.5"/><path d="M17.3 13.3L20.5 16.5M3.5 7h4M3.5 11h3M3.5 15h6"/>',
    merge: '<circle cx="6.5" cy="5.5" r="2"/><circle cx="6.5" cy="18.5" r="2"/><circle cx="17.5" cy="12" r="2"/><path d="M6.5 7.5v9M6.5 7.5c0 3 3 4.5 9 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    laptop: '<rect x="5" y="5.5" width="14" height="9.5" rx="1.5"/><path d="M3 18.5h18"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    github: '<path d="M9 19c-4 1.3-4-2-5.5-2.5M14.5 21v-3.4a3 3 0 0 0-.8-2.2c2.8-.3 5.8-1.4 5.8-6.2a4.8 4.8 0 0 0-1.3-3.3 4.5 4.5 0 0 0-.1-3.3s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.1 1.3 5.1 1.6 5.1 1.6a4.5 4.5 0 0 0-.1 3.3 4.8 4.8 0 0 0-1.3 3.3c0 4.8 3 5.9 5.8 6.2a3 3 0 0 0-.8 2.2V21"/>',
    chevronDown: '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
    signal: '<path d="M5 18v-3M10 18v-6M15 18v-9M20 18V6"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
    expand: '<path d="M14.5 4.5h5v5M19.5 4.5L13 11M9.5 19.5h-5v-5M4.5 19.5L11 13"/>',
    listCheck: '<path d="M11 6.5h9M11 12h9M11 17.5h9"/><path d="M3.5 6.5l1.5 1.5 3-3M3.5 12l1.5 1.5 3-3"/><path d="M4.5 17.5h2"/>',
    circleDashed: '<path d="M10.1 3.7a8.5 8.5 0 0 1 3.8 0M17.4 5.6a8.5 8.5 0 0 1 2.4 3M20.3 13.9a8.5 8.5 0 0 1-1.9 3.4M15.4 19.8a8.5 8.5 0 0 1-3.8.7M8 19.6a8.5 8.5 0 0 1-3-2.3M3.6 13.6a8.5 8.5 0 0 1 .4-3.9M5.9 6.1a8.5 8.5 0 0 1 3-2"/>',
    question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.1-2.4 3.5M12 16.8v.01"/>',
    enter: '<path d="M19 5.5v6a3 3 0 0 1-3 3H6M9.5 11L6 14.5 9.5 18"/>',
    chevronUp: '<path d="M6.5 14.5L12 9l5.5 5.5"/>',
    dots: '<path d="M6 12h.01M12 12h.01M18 12h.01"/>',
    minus: '<path d="M6 12h12"/>',
    star: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
    panel: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M14 5v14"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    heart: '<path d="M12 19s-7-4.4-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 2.5C19 14.6 12 19 12 19z"/>',
    share: '<circle cx="17.5" cy="6" r="2.2"/><circle cx="6.5" cy="12" r="2.2"/><circle cx="17.5" cy="18" r="2.2"/><path d="M8.5 11l7-4M8.5 13l7 4"/>',
    at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"/>',
    send: '<path d="M5 12L19.5 5 15 19.5l-3-6z"/>',
    home: '<path d="M4.5 11L12 4.5l7.5 6.5V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M4 13.5l2.5-8h11l2.5 8V19H4z"/><path d="M4 13.5h5l1 2h4l1-2h5"/>',
    bubble: '<path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8z"/>',
    users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2.2 3 4.4"/>',
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

  /* ------------------------------------------------- Release Pipeline Card */
  const XRP_CSS = `
.xrp { --xrp-ease:cubic-bezier(0.22,1,0.36,1); --xrp-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  --xrp-ok:var(--color-status-lime-text); --xrp-err:var(--color-status-rose-text); --xrp-run:var(--color-accent-500);
  container-type:inline-size; width:520px; max-width:100%; padding:0 12px 12px; border-radius:24px; background:var(--color-background-secondary-default); border:1px solid var(--color-border-button-default);
  box-shadow:0 22px 48px -28px color-mix(in srgb, var(--color-text-primary) 40%, transparent); color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
.dark .xrp { --xrp-err:var(--color-notification-error-foreground); }
:where(.xrp) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xrp-head { display:flex; align-items:center; gap:12px; height:68px; padding:0 4px; }
.xrp-logo { flex:none; display:grid; place-items:center; width:36px; height:36px; border-radius:10px; background:var(--color-text-primary); color:var(--color-background-primary-default); }
.xrp-logo svg { width:17px; height:17px; }
.xrp-name { min-width:0; flex:1; }
.xrp-name b { display:block; font-size:15px; font-weight:600; letter-spacing:-.01em; }
.xrp-name span { color:var(--xrp-muted); }
.xrp-badge { flex:none; display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:999px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); font-size:12px; font-weight:600; color:var(--xrp-muted); white-space:nowrap; animation:xrp-in .3s var(--xrp-ease) both; }
.xrp-badge svg { width:12px; height:12px; }
.xrp-badge i { width:6px; height:6px; border-radius:999px; background:currentColor; }
.xrp-badge[data-tone=run] { color:color-mix(in oklab, var(--xrp-run) 70%, var(--color-text-primary)); background:var(--color-badge-new-background); border-color:color-mix(in srgb, var(--xrp-run) 35%, transparent); }
.xrp-badge[data-tone=ok] { color:var(--xrp-ok); background:var(--color-status-lime-background); border-color:color-mix(in srgb, var(--xrp-ok) 35%, transparent); }
.xrp-badge[data-tone=err] { color:var(--xrp-err); background:var(--color-status-rose-background); border-color:color-mix(in srgb, var(--xrp-err) 35%, transparent); }
.xrp-panel { border-radius:16px; background:var(--color-background-primary-default); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 8%, transparent); }
.xrp-steps { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); padding:22px 8px 16px; }
.xrp-step { position:relative; display:flex; flex-direction:column; align-items:center; gap:2px; min-width:0; text-align:center; }
.xrp-step:not(:last-child)::after { content:""; position:absolute; top:16px; left:calc(50% + 20px); right:calc(-50% + 20px); height:2px; border-radius:1px; background:var(--color-background-tertiary-default); }
.xrp-link { position:absolute; top:16px; left:calc(50% + 20px); right:calc(-50% + 20px); z-index:1; height:2px; border-radius:1px; background:var(--xrp-run); transform:scaleX(0); transform-origin:left; transition:transform .25s linear, background-color .3s; }
.xrp-step[data-state=done] .xrp-link { background:var(--color-chart-7-active); }
.xrp-node { position:relative; display:grid; place-items:center; width:34px; height:34px; margin-bottom:8px; border-radius:999px; border:1.5px solid var(--color-border-button-default); background:var(--color-background-primary-default); color:transparent; transition:background-color .3s var(--xrp-ease), border-color .3s var(--xrp-ease), color .3s var(--xrp-ease); }
.xrp-node svg { width:15px; height:15px; animation:xrp-pop .32s var(--xrp-ease) both; }
.xrp-step[data-state=run] .xrp-node { border-color:color-mix(in srgb, var(--xrp-run) 25%, transparent); box-shadow:0 0 0 4px color-mix(in srgb, var(--xrp-run) 10%, transparent); }
.xrp-step[data-state=run] .xrp-node::after { content:""; position:absolute; inset:-1.5px; border-radius:inherit; border:2px solid transparent; border-top-color:var(--xrp-run); border-left-color:var(--xrp-run); animation:xrp-spin .9s linear infinite; }
.xrp-step[data-state=done] .xrp-node { border-color:color-mix(in srgb, var(--color-chart-7-active) 45%, transparent); background:color-mix(in srgb, var(--color-chart-7-active) 12%, var(--color-background-primary-default)); color:color-mix(in oklab, var(--color-chart-7-active) 70%, var(--color-text-primary)); }
.xrp-step[data-state=fail] .xrp-node { border-color:color-mix(in srgb, var(--xrp-err) 30%, transparent); background:var(--color-status-rose-background); color:var(--xrp-err); }
.xrp-step-n { font-size:12.5px; }
.xrp-step[data-state=pending] .xrp-step-n { color:var(--xrp-muted); }
.xrp-step-t { min-height:16px; font-family:var(--font-mono); font-size:11.5px; color:var(--xrp-muted); font-variant-numeric:tabular-nums; }
.xrp-detail { margin-top:8px; min-height:178px; padding:16px 18px; }
.xrp-dtop { display:flex; justify-content:space-between; gap:12px; margin-bottom:12px; }
.xrp-dtitle { font-weight:600; }
.xrp-dtitle.is-run { font-weight:500; background:linear-gradient(90deg, var(--xrp-muted) 0%, var(--xrp-muted) 35%, var(--color-text-primary) 50%, var(--xrp-muted) 65%, var(--xrp-muted) 100%); background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:xrp-shimmer 2s linear infinite; }
.xrp-dtime { font-family:var(--font-mono); font-size:12px; color:var(--xrp-muted); font-variant-numeric:tabular-nums; }
.xrp-lines { display:flex; flex-direction:column; }
.xrp-line { display:flex; align-items:center; gap:10px; height:28px; animation:xrp-in .32s var(--xrp-ease) both; }
.xrp-line svg { flex:none; width:14px; height:14px; color:var(--xrp-muted); }
.xrp-line[data-tone=ok] { color:var(--xrp-ok); font-weight:500; } .xrp-line[data-tone=ok] svg { color:var(--xrp-ok); }
.xrp-line[data-tone=err] { color:var(--xrp-err); font-weight:500; } .xrp-line[data-tone=err] svg { color:var(--xrp-err); }
.xrp-line[data-tone=run] svg { color:var(--xrp-run); }
.xrp-line > b { font-weight:500; }
.xrp-line > .xrp-k { width:64px; color:var(--xrp-muted); }
.xrp-skel { display:flex; align-items:center; gap:10px; height:28px; }
.xrp-skel i { width:14px; height:14px; border-radius:999px; border:1.5px solid var(--color-border-button-default); border-top-color:var(--xrp-muted); animation:xrp-spin .9s linear infinite; }
.xrp-skel span { width:96px; height:8px; border-radius:4px; background:linear-gradient(90deg, var(--color-background-tertiary-default) 0%, var(--color-background-secondary-default) 50%, var(--color-background-tertiary-default) 100%); background-size:200% 100%; animation:xrp-shimmer 1.4s linear infinite; }
.xrp-foot { display:flex; align-items:center; gap:10px; margin-top:12px; }
.xrp-seg { display:flex; padding:3px; border-radius:999px; background:var(--color-background-tertiary-default); }
.xrp-seg button { height:34px; padding:0 16px; border-radius:999px; font-weight:500; color:var(--xrp-muted); transition:background-color .25s var(--xrp-ease), color .25s, box-shadow .25s; }
.xrp-seg button[aria-pressed=true] { background:var(--color-background-primary-default); color:var(--color-text-primary); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 14%, transparent); }
.xrp-fail { display:grid; place-items:center; width:40px; height:40px; border-radius:999px; border:1px solid var(--color-border-button-default); color:var(--xrp-muted); transition:background-color .25s, color .25s, border-color .25s; }
.xrp-fail svg { width:15px; height:15px; }
.xrp-fail:hover, .xrp-fail[aria-pressed=true] { background:var(--color-status-rose-background); border-color:color-mix(in srgb, var(--xrp-err) 35%, transparent); color:var(--xrp-err); }
.xrp-main { margin-left:auto; min-width:148px; height:40px; padding:0 20px; border-radius:999px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-weight:600; transition:transform .2s var(--xrp-ease), opacity .2s; }
.xrp-main:active { transform:scale(.97); }
.xrp button:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
@keyframes xrp-in { from { opacity:0; transform:translateY(4px) } }
@keyframes xrp-pop { from { opacity:0; transform:scale(.5) } }
@keyframes xrp-spin { to { transform:rotate(360deg) } }
@keyframes xrp-shimmer { from { background-position:100% 0 } to { background-position:0% 0 } }
@container (max-width:440px) { .xrp-seg button { padding:0 10px; } .xrp-main { min-width:0; } .xrp-step-n { font-size:11.5px; } .xrp-step-t { font-size:10.5px; } }
@media (prefers-reduced-motion: reduce) { .xrp, .xrp * { animation:none !important; transition:none !important; } }`;

  // Each stage: simulated seconds, its log lines (icon, text) and how it ends. `fail` is the scan's failing run.
  const XRP_STAGES = [
    { name: 'Install', title: 'Install dependencies', secs: 15, lines: [['box', 'Resolving 1,096 packages'], ['history', 'Restoring cache from main'], ['link', 'Linking binaries']] },
    { name: 'Build', title: 'Build', secs: 22, lines: [['code', 'Compiling 214 modules'], ['scissors', 'Removing unused exports'], ['folder', 'Writing 3 chunks']], end: ['check', '412 kB bundle'] },
    { name: 'Test', title: 'Run tests', secs: 28, lines: [['target', 'Running 86 suites'], ['user', 'Unit: 1,102 passed'], ['asterisk', 'Integration: 182 passed']], end: ['check', '1,284 passed'] },
    { name: 'Scan', title: 'Security scan', secs: 17, lines: [['search', 'Auditing 1,096 dependencies'], ['scale', 'Checking licences'], ['shield', 'Scanning container image']], end: ['check', 'No known vulnerabilities'],
      fail: { secs: 10.6, lines: [['search', 'Auditing 1,096 dependencies'], ['bug', 'lodash 4.17.20: prototype pollution'], ['bug', 'minimist 1.2.5: prototype pollution']], end: ['x', '2 high-severity issues'] } },
    { name: 'Deploy', title: 'Deploy to', secs: 20, lines: [['upload', 'Uploading 3 artifacts'], ['layers', 'Shifting traffic to v2.9.0'], ['cloud', 'Warming edge caches']] },
  ];
  const XRP_TARGETS = { staging: { label: 'Staging', url: 'staging.checkout.dev' }, production: { label: 'Production', url: 'checkout.dev' } };

  /* ------------------------------------------------- Parallel Research Run */
  const XPR_CSS = `
.xpr { --xpr-ease:cubic-bezier(0.22,1,0.36,1); --xpr-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  --xpr-run:var(--color-accent-500); --xpr-ok:var(--color-chart-7-active); --xpr-ok-ink:color-mix(in oklab, var(--color-chart-7-active) 62%, var(--color-text-primary));
  width:440px; max-width:100%; padding:0 10px 10px; border-radius:24px; background:var(--color-background-secondary-default); border:1px solid var(--color-border-button-default);
  box-shadow:0 22px 48px -28px color-mix(in srgb, var(--color-text-primary) 40%, transparent); color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
:where(.xpr) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xpr button:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
.xpr-head { display:flex; align-items:center; gap:12px; height:62px; padding:0 4px; }
.xpr-logo { flex:none; display:grid; place-items:center; width:34px; height:34px; border-radius:10px; background:var(--color-text-primary); color:var(--color-background-primary-default); }
.xpr-logo svg { width:16px; height:16px; }
.xpr-name { min-width:0; flex:1; }
.xpr-name b { display:block; font-size:14px; font-weight:600; }
.xpr-name span { font-size:12px; color:var(--xpr-muted); }
.xpr-badge { flex:none; display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:999px; border:1px solid color-mix(in srgb, var(--xpr-run) 30%, transparent); background:var(--color-badge-new-background);
  color:color-mix(in oklab, var(--xpr-run) 70%, var(--color-text-primary)); font-size:12px; font-weight:600; white-space:nowrap; animation:xpr-in .3s var(--xpr-ease) both; }
.xpr-badge i { width:6px; height:6px; border-radius:999px; background:var(--xpr-run); }
.xpr-badge svg { width:12px; height:12px; }
.xpr-badge[data-tone=ok] { border-color:color-mix(in srgb, var(--xpr-ok) 40%, transparent); background:color-mix(in srgb, var(--xpr-ok) 12%, var(--color-background-primary-default)); color:var(--xpr-ok-ink); }
.xpr-panel { padding:16px 16px 14px; border-radius:16px; background:var(--color-background-primary-default); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 8%, transparent); }
.xpr-q { display:flex; align-items:center; gap:12px; font-weight:500; }
.xpr-q::before { content:""; flex:none; width:6px; height:6px; margin:0 3px; border-radius:999px; background:var(--color-text-primary); }
.xpr-split { display:flex; align-items:center; gap:10px; margin-top:10px; font-size:12px; color:var(--xpr-muted); }
.xpr-split svg { flex:none; width:13px; height:13px; }
.xpr-split.is-run span { background:linear-gradient(90deg, var(--xpr-muted) 0%, var(--xpr-muted) 35%, var(--color-text-primary) 50%, var(--xpr-muted) 65%, var(--xpr-muted) 100%); background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:xpr-shimmer 2s linear infinite; }
.xpr-agents, .xpr-steps { display:flex; flex-direction:column; }
.xpr-agents { margin-top:4px; padding-left:22px; }
.xpr-steps { padding-left:22px; overflow:hidden; }
.xpr-agent, .xpr-step { --xpr-c:var(--xpr-run); position:relative; }
.xpr-agent[data-state=done] { --xpr-c:var(--xpr-ok); }
/* Elbow from the trunk into each row, and the trunk on to the next row: drawn in the row's colour. */
.xpr-agent::before, .xpr-step::before { content:""; position:absolute; left:-16px; width:11px; border-left:1.5px solid var(--xpr-c); border-bottom:1.5px solid var(--xpr-c); border-bottom-left-radius:7px; }
.xpr-agent::before { top:-6px; height:21px; } .xpr-step::before { top:-3px; height:16px; }
.xpr-agent:not(:last-child)::after, .xpr-step:not(:last-child)::after { content:""; position:absolute; left:-16px; top:8px; bottom:-8px; border-left:1.5px solid var(--xpr-c); }
.xpr-agent { padding-top:8px; animation:xpr-in .35s var(--xpr-ease) both; }
.xpr-atop { display:flex; align-items:center; gap:10px; height:22px; }
.xpr-atop > .xpr-st { flex:none; display:grid; place-items:center; width:16px; height:16px; }
.xpr-spin { width:14px; height:14px; border-radius:999px; border:1.5px solid var(--color-border-button-default); border-top-color:var(--xpr-run); animation:xpr-spin .9s linear infinite; }
.xpr-ok { display:grid; place-items:center; width:16px; height:16px; border-radius:999px; background:var(--xpr-ok); color:var(--color-background-primary-default); animation:xpr-pop .3s var(--xpr-ease) both; }
.xpr-ok svg { width:10px; height:10px; stroke-width:2.6; }
.xpr-aname { min-width:0; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-weight:600; }
.xpr-atime { flex:none; font-family:var(--font-mono); font-size:11.5px; color:var(--xpr-muted); font-variant-numeric:tabular-nums; }
.xpr-toggle { display:none; place-items:center; width:16px; height:16px; color:var(--xpr-muted); }
.xpr-toggle svg { width:13px; height:13px; transition:transform .3s var(--xpr-ease); }
.xpr-toggle[aria-expanded=true] svg { transform:rotate(90deg); }
.xpr-agent[data-state=done] .xpr-toggle { display:grid; }
.xpr-sum { display:flex; align-items:center; gap:10px; height:24px; color:var(--xpr-ok-ink); font-weight:500; animation:xpr-in .3s var(--xpr-ease) both; }
.xpr-sum .xpr-ok { width:14px; height:14px; margin-left:1px; }
.xpr-step { display:flex; align-items:center; gap:10px; height:24px; font-size:12px; color:var(--xpr-muted); animation:xpr-in .3s var(--xpr-ease) both; }
.xpr-step svg { flex:none; width:13px; height:13px; }
.xpr-step[data-state=run] svg { color:var(--xpr-run); }
.xpr-step[data-state=run] span { background:linear-gradient(90deg, var(--xpr-muted) 0%, var(--xpr-muted) 35%, var(--color-text-primary) 50%, var(--xpr-muted) 65%, var(--xpr-muted) 100%); background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:xpr-shimmer 2s linear infinite; }
.xpr-answer { position:relative; margin-top:12px; animation:xpr-in .35s var(--xpr-ease) both; }
.xpr-answer .xpr-atop { margin-bottom:6px; }
.xpr-answer.is-run .xpr-aname { font-weight:500; color:var(--xpr-muted); }
.xpr-answer p, .xpr-answer ol { padding-left:26px; }
.xpr-answer ol { display:flex; flex-direction:column; gap:6px; margin-top:6px; }
.xpr-answer li { display:flex; gap:10px; }
.xpr-answer li > i { flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:5px; background:var(--color-background-tertiary-default); font-style:normal; font-size:11px; font-weight:600; font-family:var(--font-mono); }
.xpr-foot { display:flex; align-items:center; gap:14px; margin-top:12px; padding:0 4px 0 8px; }
.xpr-stat { display:flex; flex-direction:column; gap:2px; padding-right:14px; border-right:1px solid var(--color-border-button-default); }
.xpr-stat:nth-child(3) { border-right:0; }
.xpr-stat span { font-size:11.5px; color:var(--xpr-muted); }
.xpr-stat b { font-family:var(--font-mono); font-size:12.5px; font-weight:500; font-variant-numeric:tabular-nums; }
.xpr-main { margin-left:auto; min-width:120px; height:40px; padding:0 20px; border-radius:999px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-weight:600; transition:transform .2s var(--xpr-ease); }
.xpr-main:active { transform:scale(.97); }
@keyframes xpr-in { from { opacity:0; transform:translateY(4px) } }
@keyframes xpr-pop { from { opacity:0; transform:scale(.5) } }
@keyframes xpr-spin { to { transform:rotate(360deg) } }
@keyframes xpr-shimmer { from { background-position:100% 0 } to { background-position:0% 0 } }
@media (prefers-reduced-motion: reduce) { .xpr, .xpr * { animation:none !important; transition:none !important; } }`;

  // Three agents run at once; each step is [icon, text, real ms], and `secs` is the time the agent reports.
  const XPR_QUESTION = 'Which e-bike under $2,000 suits a 15 km hilly commute?';
  const XPR_AGENTS = [
    { name: 'Compare motor torque on climbs', secs: 4.7, sum: '3 bikes over 80 Nm', steps: [['search', 'Searching mid-drive torque tests', 900], ['fileText', 'Reading 6 reviews', 1100], ['table', 'Extracting torque figures', 1300]] },
    { name: 'Check real-world battery range', secs: 6.0, sum: 'All 3 cover 30 km on one charge', steps: [['search', 'Searching owner range reports', 1000], ['history', 'Retried after rate limit', 1200], ['fileText', 'Reading 4 long-term tests', 1300], ['table', 'Comparing range figures', 1100]] },
    { name: 'Find prices and warranty terms', secs: 4.3, sum: 'Best price $1,849', steps: [['search', 'Searching 5 retailers', 900], ['tag', 'Comparing prices', 1000], ['checkCircle', 'Reading warranty terms', 1000]] },
  ];
  const XPR_ANSWER = { lead: 'The Vela Trail fits best:', points: ['Its 85 Nm mid-drive handles the climbs', 'The battery covers the 30 km round trip with charge to spare', 'It costs $1,849 with a 2-year warranty'] };

  /* -------------------------------------------------------- Merge Conflicts */
  const XMC_CSS = `
.xmc { --xmc-ease:cubic-bezier(0.22,1,0.36,1); --xmc-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  --xmc-blue:var(--color-chart-6-active); --xmc-teal:var(--color-chart-1-active); --xmc-gray:var(--color-text-tertiary); --xmc-orange:var(--color-status-orange-text);
  --xmc-green:var(--color-chart-7-active); --xmc-purple:var(--color-chart-5-active);
  --xmc-ink-blue:color-mix(in oklab, var(--xmc-blue) 70%, var(--color-text-primary)); --xmc-ink-teal:color-mix(in oklab, var(--xmc-teal) 55%, var(--color-text-primary));
  --xmc-ink-green:color-mix(in oklab, var(--xmc-green) 62%, var(--color-text-primary)); --xmc-ink-purple:color-mix(in oklab, var(--xmc-purple) 72%, var(--color-text-primary));
  display:flex; flex-direction:column; gap:12px; width:540px; max-width:100%; color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
.dark .xmc { --xmc-gray:var(--color-text-secondary); }
:where(.xmc) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xmc button:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
.xmc-in { animation:xmc-in .4s var(--xmc-ease) both; }
.xmc-user { align-self:flex-end; padding:8px 14px; border-radius:999px; background:var(--color-background-secondary-default); }
.xmc-think { display:flex; align-items:center; gap:8px; color:var(--xmc-muted); }
.xmc-think svg { width:12px; height:12px; }
.xmc-think.is-run b { font-weight:400; background:linear-gradient(90deg, var(--xmc-muted) 0%, var(--xmc-muted) 35%, var(--color-text-primary) 50%, var(--xmc-muted) 65%, var(--xmc-muted) 100%); background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:xmc-shimmer 2s linear infinite; }
.xmc-think b { font-weight:400; }
.xmc-card { overflow:hidden; border-radius:12px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 6%, transparent); }
.xmc-chead { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px 8px; }
.xmc-chead b { font-weight:600; } .xmc-chead b span { font-weight:400; color:var(--xmc-muted); }
.xmc-state { flex:none; display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500; color:var(--xmc-ink-green); }
.xmc-state::before { content:""; width:6px; height:6px; border-radius:999px; background:currentColor; }
.xmc-state[data-tone=purple] { color:var(--xmc-ink-purple); }
.xmc-graph { position:relative; padding:0 14px; }
.xmc-graph svg { position:absolute; left:14px; top:0; width:44px; overflow:visible; pointer-events:none; }
.xmc-graph svg path { fill:none; stroke-width:1.5; transition:stroke .3s; }
.xmc-row { display:grid; grid-template-columns:44px minmax(0,1fr) auto; align-items:center; height:26px; column-gap:6px; }
.xmc-row.is-new { animation:xmc-row .9s var(--xmc-ease) both; }
.xmc-row.is-dim .xmc-msg { color:var(--xmc-muted); }
.xmc-row.is-conflict .xmc-msg { color:var(--xmc-orange); }
.xmc-msg { display:flex; align-items:center; gap:6px; min-width:0; }
.xmc-msg > span:first-child { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.xmc-chip { flex:none; padding:1px 5px; border-radius:4px; font-family:var(--font-mono); font-size:10.5px; line-height:15px; background:var(--color-background-secondary-default); color:var(--xmc-muted); }
.xmc-chip[data-tone=blue] { background:color-mix(in srgb, var(--xmc-blue) 12%, transparent); color:var(--xmc-ink-blue); }
.xmc-chip[data-tone=teal] { background:color-mix(in srgb, var(--xmc-teal) 14%, transparent); color:var(--xmc-ink-teal); }
.xmc-chip[data-tone=purple] { background:color-mix(in srgb, var(--xmc-purple) 12%, transparent); color:var(--xmc-ink-purple); }
.xmc-n { flex:none; display:grid; place-items:center; min-width:15px; height:15px; padding:0 4px; border-radius:4px; background:var(--color-status-orange-background); color:var(--xmc-orange); font-size:10.5px; font-weight:600; animation:xmc-pop .3s var(--xmc-ease) both; }
.xmc-meta { white-space:nowrap; font-size:11.5px; color:var(--xmc-muted); }
.xmc-meta code { margin-right:6px; font-family:var(--font-mono); font-size:10.5px; }
.xmc-top { color:var(--xmc-muted); }
.xmc-top .xmc-st { justify-self:start; display:grid; place-items:center; width:15px; height:15px; margin-left:0; border-radius:999px; }
.xmc-top .xmc-st svg { width:15px; height:15px; animation:xmc-pop .3s var(--xmc-ease) both; }
.xmc-top .xmc-right { font-size:12px; font-weight:500; }
.xmc-top[data-tone=orange] .xmc-st, .xmc-top[data-tone=orange] .xmc-right { color:var(--xmc-orange); }
.xmc-top[data-tone=green] .xmc-st, .xmc-top[data-tone=green] .xmc-right { color:var(--xmc-ink-green); }
.xmc-top[data-tone=purple] .xmc-st, .xmc-top[data-tone=purple] .xmc-right { color:var(--xmc-ink-purple); }
.xmc-checks { display:flex; flex-wrap:wrap; gap:6px; padding:8px 14px 0; }
.xmc-check { position:relative; display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px; border-radius:999px; border:1px solid var(--color-border-button-default); font-size:12px; color:var(--xmc-muted); animation:xmc-in .3s var(--xmc-ease) both; }
.xmc-check b { font-weight:500; color:var(--color-text-primary); }
.xmc-check svg { width:11px; height:11px; color:var(--xmc-ink-green); stroke-width:2.4; }
.xmc-check[data-tip]:hover::after, .xmc-check[data-tip]:focus-visible::after { content:attr(data-tip); position:absolute; left:50%; bottom:calc(100% + 6px); transform:translateX(-50%); z-index:2; padding:4px 8px; border-radius:6px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-size:11.5px; white-space:nowrap; }
.xmc-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:44px; padding:6px 10px 6px 14px; }
.xmc-fstat { display:flex; align-items:center; gap:8px; min-width:0; }
.xmc-fstat svg { flex:none; width:14px; height:14px; }
.xmc-fstat[data-tone=orange] { color:var(--xmc-orange); } .xmc-fstat[data-tone=purple] svg { color:var(--xmc-ink-purple); }
.xmc-fstat > span { animation:xmc-in .3s var(--xmc-ease) both; }
.xmc-act { flex:none; display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 12px; border-radius:999px; font-size:12px; font-weight:500; background:color-mix(in srgb, var(--xmc-blue) 12%, transparent); color:var(--xmc-ink-blue); transition:background-color .2s, opacity .2s; }
.xmc-act:hover { background:color-mix(in srgb, var(--xmc-blue) 20%, transparent); }
.xmc-act[disabled] { cursor:default; background:var(--color-background-secondary-default); color:var(--xmc-muted); }
.xmc-act.is-plain { background:var(--color-background-secondary-default); color:var(--color-text-primary); }
.xmc-act svg { width:13px; height:13px; }
.xmc-spin { flex:none; width:12px; height:12px; border-radius:999px; border:1.5px solid color-mix(in srgb, currentColor 25%, transparent); border-top-color:currentColor; animation:xmc-spin .8s linear infinite; }
.xmc-say { line-height:21px; }
.xmc-say code { padding:1px 4px; border-radius:4px; background:var(--color-background-secondary-default); font-family:var(--font-mono); font-size:11.5px; }
.xmc-say b { font-weight:600; }
.xmc-chips { display:flex; align-items:center; gap:6px; }
.xmc-pill { display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 9px; border-radius:999px; border:1px solid var(--color-border-button-default); font-size:12px; color:var(--xmc-muted); animation:xmc-in .3s var(--xmc-ease) both; }
.xmc-pill b { font-weight:500; color:var(--color-text-primary); }
.xmc-pill[data-tone=orange] span { color:var(--xmc-orange); } .xmc-pill[data-tone=green] span { color:var(--xmc-ink-green); } .xmc-pill[data-tone=purple] span { color:var(--xmc-ink-purple); }
.xmc-pill > i { width:6px; height:6px; border-radius:999px; background:currentColor; }
.xmc-pill svg { width:12px; height:12px; }
.xmc-diff { display:inline-flex; align-items:center; gap:4px; font-family:var(--font-mono); font-size:11.5px; }
.xmc-diff .a { color:var(--xmc-ink-green); } .xmc-diff .d { color:var(--color-status-rose-text); }
.xmc-diff .bars { display:inline-flex; gap:1px; margin-left:2px; } .xmc-diff .bars i { width:5px; height:5px; border-radius:1px; background:var(--xmc-green); } .xmc-diff .bars i.r { background:var(--color-status-rose-text); } .xmc-diff .bars i.o { background:var(--color-background-tertiary-default); }
.xmc-compose { border-radius:16px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); box-shadow:0 1px 3px color-mix(in srgb, var(--color-text-primary) 6%, transparent); }
.xmc-ph { padding:12px 14px 8px; color:var(--color-text-tertiary); }
.xmc-bar { display:flex; align-items:center; gap:6px; padding:6px 10px 10px; color:var(--xmc-muted); font-size:12px; }
.xmc-bar svg { width:13px; height:13px; }
.xmc-tool { display:inline-flex; align-items:center; gap:5px; height:28px; padding:0 9px; border-radius:999px; background:var(--color-background-secondary-default); }
.xmc-tool.is-round { width:28px; padding:0; justify-content:center; }
.xmc-send { display:grid; place-items:center; width:28px; height:28px; border-radius:999px; background:var(--color-accent-500); color:var(--color-background-primary-default); }
.xmc-send svg { stroke-width:2.2; }
@keyframes xmc-in { from { opacity:0; transform:translateY(5px) } }
@keyframes xmc-row { 0% { opacity:0; background:var(--color-status-orange-background) } 25% { opacity:1; background:var(--color-status-orange-background) } 100% { background:transparent } }
@keyframes xmc-pop { from { opacity:0; transform:scale(.5) } }
@keyframes xmc-spin { to { transform:rotate(360deg) } }
@keyframes xmc-shimmer { from { background-position:100% 0 } to { background-position:0% 0 } }
@media (prefers-reduced-motion: reduce) { .xmc, .xmc * { animation:none !important; transition:none !important; } }`;

  // Commits by id: message, optional branch chip [label, tone], hash, author and age, lane.
  const XMC_COMMITS = {
    merge: { text: 'Merge main into feat/session-refresh', chip: ['feat/session-refresh', 'blue'], hash: '7e0c3b', by: 'You · now', lane: 'feat', ring: true },
    tests: { text: 'Add session refresh tests', chip: ['feat/session-refresh', 'blue'], hash: 'd29f50', by: 'You · now', lane: 'feat' },
    read: { text: 'Read sessions with the current key', chip: ['main', ''], hash: '5be27d', by: 'Lena · 6m', lane: 'main' },
    rotate: { text: 'Rotate session keys', hash: 'a3f9c1', by: 'Lena · 18m', lane: 'main' },
    refresh: { text: 'Refresh sessions near expiry', hash: 'c70a92', by: 'You · 25m', lane: 'feat' },
    consent: { text: 'Add analytics consent banner', chip: ['feat/checkout-analytics', 'teal'], hash: 'e83c51', by: 'Sam · 32m', lane: 'ana' },
    expiry: { text: 'Read session expiry from the token', hash: '1f8e3b', by: 'You · 40m', lane: 'feat' },
    funnel: { text: 'Track checkout funnel events', hash: '62b8e4', by: 'Sam · 2h', lane: 'ana' },
    bump: { text: 'Bump next to 16.3', chip: ['main', ''], hash: '9c2d4a', by: 'Sam · 3h', lane: 'main' },
  };
  const XMC_ROW = 26, XMC_LANES = { main: 7, feat: 19, ana: 31 };
  const XMC_SAY = 'PR <b>#128</b> is open, but <code>main</code> moved on while we worked: Lena\'s session key rotation changed the same lines in <code>auth.ts</code> and <code>middleware.ts</code>. I can merge <code>main</code> in and resolve them.';

  /** Draws the commit graph for the rows shown: one rail per lane, curves where branches fork and merge. */
  function xmcGraph(svg, rows, merged, conflicts) {
    const y = (i) => i * XMC_ROW + XMC_ROW / 2, x = (lane) => XMC_LANES[lane];
    const at = (id) => rows.indexOf(id), laneRows = (lane) => rows.map((id, i) => [id, i]).filter(([id]) => (id === 'top' ? lane === 'main' : XMC_COMMITS[id].lane === lane)).map(([, i]) => i);
    const col = { main: 'var(--xmc-gray)', feat: merged ? 'var(--xmc-purple)' : 'var(--xmc-blue)', ana: 'var(--xmc-teal)' };
    const curve = (l1, i1, l2, i2) => `M${x(l1)} ${y(i1)} C${x(l1)} ${y(i1) - XMC_ROW * 0.6} ${x(l2)} ${y(i2) + XMC_ROW * 0.6} ${x(l2)} ${y(i2)}`;
    const out = [];
    for (const lane of ['main', 'ana', 'feat']) {
      const r = laneRows(lane); if (!r.length) continue;
      out.push(`<path d="M${x(lane)} ${y(Math.min(...r))} V${y(Math.max(...r))}" stroke="${col[lane]}"/>`);
    }
    // Fork and join curves only once both ends are on screen (rows arrive one by one).
    const bump = at('bump'), feat = laneRows('feat').filter((i) => rows[i] !== 'merge'), ana = laneRows('ana');
    if (bump >= 0 && feat.length) out.push(`<path d="${curve('main', bump, 'feat', Math.max(...feat))}" stroke="${col.feat}"/>`);
    if (bump >= 0 && ana.length) out.push(`<path d="${curve('main', bump, 'ana', Math.max(...ana))}" stroke="${col.ana}"/>`);
    if (ana.length && at('refresh') >= 0) out.push(`<path d="${curve('ana', Math.min(...ana), 'feat', at('refresh'))}" stroke="${col.ana}"/>`);
    if (at('merge') >= 0) out.push(`<path d="${curve('main', at('read'), 'feat', at('merge'))}" stroke="${col.main}"/>`);
    if (merged) out.push(`<path d="${curve('feat', Math.min(...feat), 'main', 0)}" stroke="${col.feat}"/>`);
    rows.forEach((id, i) => {
      if (id === 'top') return;
      const c = XMC_COMMITS[id], fill = conflicts.has(id) ? 'var(--xmc-orange)' : col[c.lane];
      out.push(c.ring ? `<circle cx="${x(c.lane)}" cy="${y(i)}" r="4" fill="var(--color-background-primary-default)" stroke="${fill}" stroke-width="1.5"/>` : `<circle cx="${x(c.lane)}" cy="${y(i)}" r="3.2" fill="${fill}"/>`);
    });
    svg.setAttribute('height', String(rows.length * XMC_ROW));
    svg.setAttribute('viewBox', `0 0 44 ${rows.length * XMC_ROW}`);
    svg.innerHTML = out.join('');
  }

  /* ------------------------------------------ Merge Conflicts · One-shot v1 */
  // The first, one-shot take: same thread, but a horizontal branch graph and a summary block under it.
  const XMV_CSS = `
.xmv-card { overflow:hidden; border-radius:14px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); }
.xmv-head { display:flex; align-items:flex-start; gap:10px; padding:14px 14px 6px; }
.xmv-head > svg { flex:none; width:15px; height:15px; margin-top:2px; color:var(--xmc-ink-green); }
.xmv-card[data-state=merged] .xmv-head > svg { color:var(--xmc-ink-purple); }
.xmv-title { min-width:0; flex:1; }
.xmv-title b { display:block; font-weight:600; } .xmv-title b span { font-weight:400; color:var(--xmc-muted); }
.xmv-sub { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:4px; font-size:12px; color:var(--xmc-muted); }
.xmv-pill { flex:none; display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px; border-radius:7px; border:1px solid color-mix(in srgb, var(--xmc-green) 35%, transparent); color:var(--xmc-ink-green); font-size:12px; font-weight:500; }
.xmv-pill svg { width:12px; height:12px; }
.xmv-pill[data-tone=purple] { border-color:color-mix(in srgb, var(--xmc-purple) 35%, transparent); background:color-mix(in srgb, var(--xmc-purple) 10%, transparent); color:var(--xmc-ink-purple); }
.xmv-graph { margin:6px 0 0; padding:6px 0 10px; background:color-mix(in srgb, var(--color-background-secondary-default) 55%, transparent); border-block:1px solid var(--color-border-button-default); }
.xmv-graph svg { display:block; width:100%; height:auto; overflow:visible; }
.xmv-graph path { fill:none; stroke-width:1.5; }
.xmv-graph text { font-family:var(--font-mono); font-size:10px; }
.xmv-graph .xmv-dash { stroke-dasharray:3 3; animation:xmv-dash 1s linear infinite; }
@keyframes xmv-dash { to { stroke-dashoffset:-12 } }
.xmv-sum { display:flex; align-items:center; gap:12px; padding:12px 14px; }
.xmv-sum > svg { flex:none; width:15px; height:15px; align-self:flex-start; margin-top:2px; }
.xmv-sum[data-tone=orange] > svg { color:var(--xmc-orange); } .xmv-sum[data-tone=green] > svg { color:var(--xmc-ink-green); } .xmv-sum[data-tone=purple] > svg { color:var(--xmc-ink-purple); }
.xmv-sum-t { min-width:0; flex:1; }
.xmv-sum-t b { display:block; font-weight:500; }
.xmv-sum-t > span { font-size:12px; color:var(--xmc-muted); }
.xmv-files { display:flex; gap:6px; margin-top:6px; }
.xmv-file { display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 7px; border-radius:6px; border:1px solid var(--color-border-button-default); font-family:var(--font-mono); font-size:11px; }
.xmv-file i { font-style:normal; font-size:9px; font-weight:700; color:var(--xmc-ink-blue); }
.xmv-file em { font-style:normal; color:var(--xmc-orange); font-weight:600; }
.xmv-file svg { width:11px; height:11px; color:var(--xmc-ink-green); stroke-width:2.4; }
.xmv-btn { flex:none; display:inline-flex; align-items:center; gap:6px; height:30px; padding:0 14px; border-radius:999px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-size:12px; font-weight:500; }
.xmv-btn[disabled] { background:var(--color-background-secondary-default); color:var(--xmc-muted); border:1px solid var(--color-border-button-default); cursor:default; }
.xmv-dark { display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 12px; border-radius:999px; background:var(--color-text-primary); color:var(--color-background-primary-default); font-size:12px; font-weight:500; animation:xmc-in .3s var(--xmc-ease) both; }
.xmv-dark > i { width:6px; height:6px; border-radius:999px; background:var(--xmc-orange); }
.xmv-dark[data-tone=purple] > i { background:var(--xmc-purple); }
@media (prefers-reduced-motion: reduce) { .xmv-card, .xmv-card * { animation:none !important; } }`;

  /** The v1 graph: main on top, the branch below, and the link back to main for the PR's current state. */
  function xmvGraph(state) {
    const blue = state === 'merged' ? 'var(--xmc-purple)' : 'var(--xmc-blue)', gray = 'var(--xmc-gray)';
    const dot = (x, y, c, r = 3.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
    const label = (x, y, text, c, anchor = 'middle') => `<text x="${x}" y="${y}" fill="${c}" text-anchor="${anchor}">${text}</text>`;
    const moved = state !== 'open';
    const out = [
      `<rect x="10" y="8" width="34" height="15" rx="4" fill="var(--color-background-tertiary-default)"/>`, label(27, 19, 'main', 'var(--xmc-muted)'),
      `<path d="M20 34 H${moved ? 420 : 140}" stroke="${gray}"/>`, dot(20, 34, gray), dot(80, 34, gray),
      `<path d="M80 34 C110 34 110 74 140 74 H${state === 'open' || state === 'conflicts' ? 270 : 330}" stroke="${blue}"/>`,
      dot(140, 74, blue), dot(205, 74, blue), dot(270, 74, blue), label(205, 92, 'feat/session-refresh', state === 'merged' ? 'var(--xmc-ink-purple)' : 'var(--xmc-ink-blue)'),
    ];
    if (moved) out.push(dot(240, 34, gray), dot(300, 34, gray));
    if (state === 'open') out.push(`<path class="xmv-dash" d="M270 74 H330" stroke="${blue}"/>`);
    if (state === 'conflicts') out.push(`<path class="xmv-dash" d="M270 74 C340 74 370 34 420 34" stroke="var(--xmc-orange)"/>`, dot(420, 34, 'var(--xmc-orange)', 5), label(420, 18, '3 conflicts', 'var(--xmc-orange)'));
    if (state === 'resolved' || state === 'merged') out.push(`<path d="M300 34 C320 34 315 74 330 74" stroke="${gray}"/>`, `<circle cx="330" cy="74" r="4.5" fill="var(--color-background-primary-default)" stroke="${blue}" stroke-width="1.5"/>`);
    if (state === 'resolved') out.push(`<path class="xmv-dash" d="M335 74 C370 74 390 34 420 34" stroke="var(--xmc-orange)"/>`, dot(420, 34, 'var(--xmc-orange)', 5), label(420, 18, 'Resolved', 'var(--xmc-muted)'));
    if (state === 'merged') out.push(`<path d="M335 74 C375 74 385 34 420 34" stroke="${blue}"/>`, dot(420, 34, 'var(--xmc-purple)', 5), `<rect x="392" y="6" width="56" height="16" rx="8" fill="color-mix(in srgb, var(--xmc-purple) 14%, transparent)"/>`, label(420, 18, 'Merged', 'var(--xmc-ink-purple)'));
    return `<svg viewBox="0 0 460 100" aria-hidden="true">${out.join('')}</svg>`;
  }

  /* ---------------------------------------------------- Agent Approval Card */
  const XAP_CSS = `
.xap { --xap-ease:cubic-bezier(0.22,1,0.36,1); --xap-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary));
  width:400px; max-width:100%; color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
:where(.xap) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xap button:focus-visible, .xap input:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
.xap-label { margin:0 0 8px 2px; font-size:10.5px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--xap-muted); }
.xap-tabs { display:flex; gap:6px; margin-bottom:18px; }
.xap-tab { height:28px; padding:0 12px; border-radius:999px; border:1px solid var(--color-border-button-default); color:var(--xap-muted); font-weight:500; transition:background-color .2s, color .2s, border-color .2s; }
.xap-tab[aria-pressed=true] { color:var(--color-text-primary); border-color:var(--color-border-button-hover); background:var(--color-background-primary-default); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 8%, transparent); }
.xap-tab[aria-disabled=true] { cursor:not-allowed; opacity:.6; }
.xap-card { padding:14px; border-radius:14px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); box-shadow:0 1px 3px color-mix(in srgb, var(--color-text-primary) 6%, transparent); animation:xap-in .3s var(--xap-ease) both; }
.xap-head { display:flex; align-items:center; gap:8px; }
.xap-head > b { flex:1; font-weight:500; }
.xap-badge { display:grid; place-items:center; width:20px; height:20px; border-radius:6px; background:color-mix(in srgb, var(--color-chart-7-active) 14%, transparent); color:color-mix(in oklab, var(--color-chart-7-active) 65%, var(--color-text-primary)); }
.xap-badge.is-blue { border-radius:999px; background:color-mix(in srgb, var(--color-chart-6-active) 14%, transparent); color:color-mix(in oklab, var(--color-chart-6-active) 70%, var(--color-text-primary)); }
.xap-badge svg { width:12px; height:12px; }
.xap-tools { display:flex; gap:10px; color:var(--xap-muted); } .xap-tools svg { width:14px; height:14px; }
.xap-title { margin-top:14px; font-size:15px; font-weight:600; }
.xap-desc { margin-top:2px; color:var(--xap-muted); }
.xap-todos { margin-top:12px; padding:10px 12px; border-radius:10px; background:var(--color-background-secondary-default); }
.xap-thead { display:flex; align-items:center; gap:8px; margin-bottom:4px; font-weight:500; }
.xap-thead svg { width:14px; height:14px; } .xap-thead span { margin-left:auto; color:var(--xap-muted); font-weight:400; }
.xap-todo { display:flex; align-items:center; gap:10px; height:26px; color:var(--xap-muted); }
.xap-todo svg { flex:none; width:13px; height:13px; }
.xap-todo.is-in { animation:xap-in .3s var(--xap-ease) both; }
.xap-more { display:flex; align-items:center; gap:10px; height:26px; color:var(--xap-muted); }
.xap-more:hover { color:var(--color-text-primary); }
.xap-foot { display:flex; align-items:center; gap:8px; margin-top:14px; }
.xap-auto { display:flex; align-items:center; gap:8px; flex:1; min-width:0; color:var(--xap-muted); font-size:12.5px; font-variant-numeric:tabular-nums; }
.xap-ring { flex:none; width:14px; height:14px; transform:rotate(-90deg); }
.xap-ring circle { fill:none; stroke-width:2; }
.xap-btn { height:28px; padding:0 12px; border-radius:999px; background:var(--color-background-secondary-default); font-weight:500; transition:background-color .2s; }
.xap-btn:hover { background:var(--color-background-tertiary-default); }
.xap-btn.is-dark { display:inline-flex; align-items:center; gap:6px; background:var(--color-text-primary); color:var(--color-background-primary-default); }
.xap-btn.is-dark[disabled] { cursor:default; background:var(--color-background-tertiary-default); color:var(--xap-muted); }
.xap-btn svg { width:12px; height:12px; }
.xap-q { margin-top:12px; font-weight:500; }
.xap-opts { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
.xap-opt { display:flex; align-items:center; gap:10px; width:100%; height:32px; padding:0 8px; border-radius:8px; border:1px solid var(--color-border-button-default); text-align:start; transition:background-color .2s, border-color .2s; animation:xap-in .25s var(--xap-ease) both; }
.xap-opt:hover { background:var(--color-background-secondary-default); }
.xap-key { flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:5px; background:var(--color-background-secondary-default); color:var(--xap-muted); font-size:10.5px; font-weight:600; transition:background-color .2s, color .2s; }
.xap-opt[aria-checked=true] { border-color:var(--color-border-button-hover); }
.xap-opt[aria-checked=true] .xap-key { background:var(--color-text-primary); color:var(--color-background-primary-default); }
.xap-opt input { min-width:0; flex:1; height:100%; border:0; background:none; color:inherit; font:inherit; outline:none; }
.xap-opt input::placeholder { color:var(--color-text-tertiary); }
.xap-pager { display:flex; align-items:center; gap:6px; flex:1; color:var(--xap-muted); font-variant-numeric:tabular-nums; }
.xap-pager button { display:grid; place-items:center; width:18px; height:18px; color:var(--xap-muted); } .xap-pager button[disabled] { opacity:.4; cursor:default; } .xap-pager svg { width:13px; height:13px; }
.xap-done { display:flex; align-items:center; gap:6px; color:color-mix(in oklab, var(--color-chart-7-active) 62%, var(--color-text-primary)); font-weight:500; animation:xap-in .3s var(--xap-ease) both; }
.xap-done svg { width:14px; height:14px; }
@keyframes xap-in { from { opacity:0; transform:translateY(4px) } }
@media (prefers-reduced-motion: reduce) { .xap, .xap * { animation:none !important; transition:none !important; } }`;

  const XAP_TODOS = ['Add migration for sessions table', 'Wire auth middleware', 'Update login flow + tests', 'Add account settings page', 'Tighten CSRF + rate limits', 'Write rollout notes'];
  const XAP_QUESTIONS = [
    { q: 'Which auth approach should we use?', opts: ['Session cookies', 'JWT bearer', 'OAuth only'] },
    { q: 'Where should secrets live?', opts: ['.env.local', 'Vault / secrets manager', 'CI only'] },
    { q: 'Ship behind a feature flag?', opts: ['Yes — gradual rollout', 'No — full release'] },
  ];

  /* ---------------------------------------------------- Floating Agent Chat */
  const XCP_CSS = `
.xcp { --xcp-ease:cubic-bezier(0.22,1,0.36,1); --xcp-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary)); --xcp-line:var(--color-border-button-default);
  --xcp-app:var(--color-background-primary-default); --xcp-panel:var(--color-background-secondary-default);
  container-type:inline-size; position:relative; width:640px; max-width:100%; height:440px; overflow:hidden; border-radius:14px; border:1px solid var(--xcp-line); background:var(--xcp-app);
  color:var(--color-text-primary); font-family:var(--font-sans); font-size:12.5px; line-height:18px; text-align:start; }
:where(.xcp) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.xcp button:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:1px; }
.xcp svg { flex:none; width:13px; height:13px; }
/* The CRM behind the chat */
.xcp-side { position:absolute; inset:0 auto 0 0; width:132px; padding:10px 8px; border-right:1px solid var(--xcp-line); display:flex; flex-direction:column; gap:2px; font-size:11.5px; color:var(--xcp-muted); }
.xcp-org { display:flex; align-items:center; gap:7px; height:24px; padding:0 4px; margin-bottom:6px; font-weight:600; color:var(--color-text-primary); }
.xcp-org i, .xcp-me i { width:12px; height:12px; border-radius:3px; background:var(--color-chart-5-active); }
.xcp-nav { display:flex; align-items:center; gap:7px; height:24px; padding:0 4px; border-radius:6px; }
.xcp-nav.is-on { background:var(--xcp-panel); color:var(--color-text-primary); font-weight:500; }
.xcp-me { margin-top:auto; display:flex; align-items:center; gap:7px; padding:0 4px; color:var(--color-text-primary); font-weight:500; } .xcp-me i { border-radius:999px; background:var(--color-chart-1-active); }
.xcp-main { position:absolute; inset:0 0 0 132px; display:flex; flex-direction:column; align-items:center; padding:46px 24px 0; }
.xcp-hello { font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:30px; }
.xcp-sub { margin-top:4px; font-size:11.5px; color:var(--xcp-muted); }
.xcp-ghost { width:100%; max-width:380px; height:64px; margin-top:18px; border-radius:10px; border:1px solid var(--xcp-line); background:var(--xcp-panel); }
.xcp-cards { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; width:100%; max-width:460px; margin-top:auto; margin-bottom:24px; }
.xcp-cards span { height:52px; border-radius:8px; border:1px solid var(--xcp-line); background:var(--xcp-panel); }
@container (max-width:520px) { .xcp-side { display:none } .xcp-main { left:0 } }
/* The chat window and its three layouts */
.xcp-win { position:absolute; z-index:2; display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--xcp-line); background:var(--xcp-app);
  box-shadow:0 24px 60px -24px color-mix(in srgb, var(--color-text-primary) 45%, transparent);
  transition:left .45s var(--xcp-ease), top .45s var(--xcp-ease), width .45s var(--xcp-ease), height .45s var(--xcp-ease), border-radius .45s var(--xcp-ease), opacity .3s, transform .45s var(--xcp-ease); }
.xcp-win[data-layout=popup] { left:22%; top:6%; width:64%; height:88%; border-radius:10px; }
.xcp-win[data-layout=drawer] { left:54%; top:0; width:46%; height:100%; border-radius:0; border-width:0 0 0 1px; }
.xcp-win[data-layout=full] { left:132px; top:0; width:calc(100% - 132px); height:100%; border-radius:0; border-width:0 0 0 1px; box-shadow:none; }
.xcp-win.is-hidden { opacity:0; transform:translateY(12px) scale(.97); pointer-events:none; }
@container (max-width:520px) { .xcp-win[data-layout] { left:0; top:0; width:100%; height:100%; border-radius:0; } }
.xcp-head { display:flex; align-items:center; gap:6px; height:36px; padding:0 8px 0 12px; border-bottom:1px solid var(--xcp-line); flex:none; }
.xcp-crumb { display:flex; align-items:center; gap:5px; min-width:0; flex:1; white-space:nowrap; overflow:hidden; color:var(--xcp-muted); }
.xcp-crumb b { font-weight:500; color:var(--color-text-primary); overflow:hidden; text-overflow:ellipsis; }
.xcp-hbtn { display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 6px; border-radius:6px; color:var(--xcp-muted); }
.xcp-hbtn:hover, .xcp-hbtn[aria-expanded=true] { background:var(--xcp-panel); color:var(--color-text-primary); }
.xcp-menu { position:absolute; z-index:3; top:34px; right:30px; min-width:150px; padding:4px; border-radius:8px; border:1px solid var(--xcp-line); background:var(--xcp-app); box-shadow:0 12px 30px -12px color-mix(in srgb, var(--color-text-primary) 40%, transparent); animation:xcp-in .2s var(--xcp-ease) both; }
.xcp-menu p { padding:4px 8px; font-size:11px; color:var(--xcp-muted); }
.xcp-menu button { display:flex; width:100%; height:26px; align-items:center; padding:0 8px; border-radius:5px; }
.xcp-menu button:hover, .xcp-menu button[aria-checked=true] { background:var(--xcp-panel); }
.xcp-feed { flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; display:flex; flex-direction:column; gap:18px; padding:14px; }
.xcp-user { align-self:flex-end; max-width:78%; padding:8px 12px; border-radius:8px; background:var(--xcp-panel); animation:xcp-in .35s var(--xcp-ease) both; }
.xcp-bot { display:flex; flex-direction:column; gap:10px; animation:xcp-in .35s var(--xcp-ease) both; }
.xcp-tool { display:flex; align-items:center; gap:7px; padding:0 4px; color:var(--xcp-muted); }
.xcp-tool i { width:12px; height:12px; border-radius:3px; background:linear-gradient(to top right, var(--color-chart-6-active), var(--color-chart-5-active)); }
.xcp-tool svg { width:11px; height:11px; }
.xcp-text { padding:0 4px; }
.xcp-choices { display:flex; flex-wrap:wrap; gap:8px; }
.xcp-choice { display:flex; align-items:center; gap:9px; width:196px; max-width:100%; height:36px; padding:0 10px; border-radius:9px; border:1px solid var(--xcp-line); background:var(--xcp-app); transition:opacity .3s, background-color .2s; }
.xcp-choice:hover { background:var(--xcp-panel); }
.xcp-choice[aria-pressed=false].is-decided { opacity:.5; }
.xcp-choice i { width:13px; height:13px; border-radius:3px; }
.xcp-choice span { flex:1; text-align:start; }
.xcp-choice svg { color:var(--color-status-lime-text); opacity:0; transition:opacity .2s; } .xcp-choice[aria-pressed=true] svg { opacity:1; }
.xcp-acts { display:flex; gap:12px; justify-content:center; color:var(--xcp-muted); }
.xcp-file { display:flex; flex-direction:column; gap:9px; max-width:400px; padding:11px; border-radius:9px; border:1px solid var(--xcp-line); background:var(--xcp-app); box-shadow:0 1px 2px color-mix(in srgb, var(--color-text-primary) 6%, transparent); }
.xcp-ftitle { display:flex; align-items:center; gap:8px; } .xcp-ftitle i { flex:none; width:15px; height:15px; border-radius:4px; background:var(--color-status-orange-text); }
.xcp-ftitle span { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.xcp-fdesc { font-size:11px; line-height:17px; color:var(--xcp-muted); }
.xcp-fbtns { display:flex; justify-content:flex-end; gap:6px; }
.xcp-fbtns button { display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 9px; border-radius:6px; border:1px solid var(--xcp-line); }
.xcp-fbtns button.is-solid { border-color:var(--color-text-primary); background:var(--color-text-primary); color:var(--xcp-app); }
.xcp-compose { flex:none; margin:0 12px 12px; padding:9px; display:flex; flex-direction:column; gap:10px; border-radius:10px; border:1px solid var(--xcp-line); background:var(--xcp-panel); }
.xcp-ph { color:var(--color-text-tertiary); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.xcp-cbar { display:flex; align-items:center; gap:10px; min-width:0; overflow:hidden; white-space:nowrap; color:var(--xcp-muted); }
.xcp-cbar .xcp-sep { width:1px; height:12px; background:var(--xcp-line); }
.xcp-dots { display:flex; } .xcp-dots i { width:10px; height:10px; margin-left:-3px; border-radius:999px; box-shadow:0 0 0 1.5px var(--xcp-panel); }
@keyframes xcp-in { from { opacity:0; transform:translateY(5px) } }
@media (prefers-reduced-motion: reduce) { .xcp, .xcp * { animation:none !important; transition:none !important; } }`;
  const XCP_DOTS = '<span class="xcp-dots" aria-hidden="true"><i style="background:var(--color-chart-1-active)"></i><i style="background:var(--color-chart-6-active)"></i><i style="background:var(--color-chart-5-active)"></i><i style="background:var(--color-chart-3-active)"></i></span>';

  /* ---------------------------------------------------------- Deploy Status */
  const XDS_CSS = `
.xds { --xds-ease:cubic-bezier(0.22,1,0.36,1); --xds-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary)); --xds-dim:var(--color-text-tertiary);
  --xds-live:color-mix(in oklab, var(--color-chart-7-active) 72%, var(--color-text-primary));
  display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-start; gap:16px; width:100%; max-width:720px; color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:18px; text-align:start; }
.dark .xds { --xds-dim:var(--color-text-secondary); }
.xds-card { width:340px; max-width:100%; padding:18px 20px 20px; border-radius:16px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); }
.xds-title { font-weight:500; } .xds-by { font-size:11px; color:var(--xds-muted); }
.xds-mono { font-family:var(--font-mono); font-size:11px; font-variant-numeric:tabular-nums; }
/* A: the vertical timeline */
.xds-tl { position:relative; margin-top:16px; }
.xds-tl::before { content:""; position:absolute; left:55px; top:30px; bottom:12px; width:1px; background:var(--color-border-button-default); }
.xds-row { position:relative; display:grid; grid-template-columns:44px 22px minmax(0,1fr) auto; align-items:start; min-height:28px; animation:xds-in .35s var(--xds-ease) both; }
.xds-row > .xds-mono:first-child { padding-top:3px; color:var(--xds-dim); }
.xds-row .xds-name { padding-top:1px; }
.xds-row .xds-d { padding-top:3px; color:var(--xds-muted); }
.xds-row.is-group .xds-name, .xds-row.is-skip .xds-name { color:var(--xds-muted); }
.xds-mark { position:relative; justify-self:center; width:5px; margin-top:7px; }
.xds-mark, .xds-dot, .xds-bar { display:block; }
.xds-dot { width:5px; height:5px; border-radius:999px; background:var(--color-text-primary); animation:xds-pop .3s var(--xds-ease) both; }
.xds-bar { position:relative; width:5px; margin-top:-2px; border-radius:3px; overflow:hidden; background:color-mix(in srgb, var(--color-text-primary) 35%, transparent); }
.xds-bar > i { position:absolute; inset:0 0 auto; border-radius:3px; background:var(--color-text-primary); transform:scaleY(0); transform-origin:top; transition:transform .12s linear; }
.xds-was { position:absolute; left:58px; bottom:0; color:var(--xds-dim); }
.xds-row.is-live .xds-name { color:var(--xds-live); } .xds-row.is-live .xds-dot { background:var(--color-chart-7-active); }
.xds-row.is-live .xds-d { font-family:var(--font-sans); font-size:13px; font-weight:600; color:var(--color-text-primary); }
/* B: the summary */
.xds-legend { position:relative; height:16px; margin-top:20px; color:var(--xds-muted); }
.xds-legend span { position:absolute; top:0; white-space:nowrap; } .xds-legend span.is-on { color:var(--color-text-primary); }
.xds-segs { display:flex; gap:2px; height:40px; margin-top:6px; }
.xds-segs i { min-width:4px; height:100%; border-radius:5px; background:var(--color-background-tertiary-default); transform:scaleY(.2); opacity:.4; transition:transform .35s var(--xds-ease), opacity .35s, background-color .3s; }
.xds-segs i.is-in { transform:none; opacity:1; background:var(--xds-dim); }
.xds-segs i.is-in.is-deploy { background:var(--color-text-primary); }
.xds-axis { position:relative; height:16px; margin-top:6px; color:var(--xds-dim); }
.xds-axis span { position:absolute; top:0; } .xds-axis span:last-child { right:0; }
.xds-list { display:flex; flex-direction:column; margin-top:18px; }
.xds-item { display:grid; grid-template-columns:16px minmax(0,1fr) auto 42px; align-items:center; gap:8px; height:26px; animation:xds-in .3s var(--xds-ease) both; }
.xds-item svg { width:14px; height:14px; }
.xds-item .is-build { color:var(--xds-dim); } .xds-item .is-deploy { color:var(--color-text-primary); }
.xds-item.is-skip { color:var(--xds-muted); }
.xds-item .xds-d { text-align:right; } .xds-item .xds-at { text-align:right; color:var(--xds-dim); }
.xds-live { display:flex; align-items:center; gap:6px; margin-top:20px; color:var(--xds-live); font-size:12px; animation:xds-in .35s var(--xds-ease) both; }
.xds-live::before { content:""; width:6px; height:6px; border-radius:999px; background:var(--color-chart-7-active); }
.xds-big { font-size:46px; line-height:52px; font-weight:500; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
@keyframes xds-in { from { opacity:0; transform:translateY(4px) } }
@keyframes xds-pop { from { opacity:0; transform:scale(.3) } }
@media (prefers-reduced-motion: reduce) { .xds, .xds * { animation:none !important; transition:none !important; } }`;

  // Steps in order: group, name, seconds, start (s), and the previous run's time for the long ones.
  const XDS_STEPS = [
    { group: 'build', name: 'Prepare environment', secs: 2, at: 0 },
    { group: 'build', name: 'Run build commands', secs: 19, at: 2, was: 31 },
    { group: 'build', name: 'Push application', secs: 3, at: 21 },
    { group: 'deploy', name: 'Prepare environment', secs: 1, at: 24 },
    { group: 'deploy', name: 'Run deploy commands', skipped: true, at: 25 },
    { group: 'deploy', name: 'Update environment', secs: 15, at: 25, was: 21 },
    { group: 'deploy', name: 'Route traffic', secs: 2, at: 40 },
  ];
  const XDS_TOTAL = 42, XDS_PX = 2.4; // timeline bars: pixels per second
  const xdsClock = (s) => `00:${String(Math.round(s)).padStart(2, '0')}`;

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

    { group: G, title: 'Release Pipeline Card', kind: 'scene',
      desc: 'Release pipeline by Akash (@a1x45h, https://x.com/a1x45h/status/2112964394825187349), cloned with permission: install, build, test, scan and deploy run node by node with their logs and timers; every other run ships to production with a failing security scan that you retry, and the target, failure toggle, Cancel and Reset all work.',
      async run(root, t, ctx) {
        xcStyle('x-release-card-css', XRP_CSS);
        const el = mk('section', 'xrp'); el.setAttribute('aria-label', 'Release v2.9.0');
        el.innerHTML = `<div class="xrp-head"><span class="xrp-logo" aria-hidden="true">${xcIcon('box')}</span><div class="xrp-name"><b>Release v2.9.0</b><span>checkout-api</span></div><span class="xrp-badge" role="status" aria-live="polite"></span></div>
<ol class="xrp-panel xrp-steps" aria-label="Pipeline">${XRP_STAGES.map((s) => `<li class="xrp-step" data-state="pending">${s === XRP_STAGES[XRP_STAGES.length - 1] ? '' : '<span class="xrp-link" aria-hidden="true"></span>'}<span class="xrp-node" aria-hidden="true"></span><span class="xrp-step-n">${s.name}</span><span class="xrp-step-t"></span></li>`).join('')}</ol>
<div class="xrp-panel xrp-detail"></div>
<div class="xrp-foot"><div class="xrp-seg" role="group" aria-label="Target">${Object.entries(XRP_TARGETS).map(([k, v]) => `<button type="button" data-target="${k}" aria-pressed="${k === 'staging'}">${v.label}</button>`).join('')}</div><button type="button" class="xrp-fail" aria-pressed="false" aria-label="Simulate a failing scan">${xcIcon('alert')}</button><button type="button" class="xrp-main"></button></div>`;
        root.append(el);
        const badge = $('.xrp-badge', el), detail = $('.xrp-detail', el), main = $('.xrp-main', el), failBtn = $('.xrp-fail', el), seg = $('.xrp-seg', el);
        const steps = [...el.querySelectorAll('.xrp-step')];
        let target = 'staging', failing = false, phase = 'ready', token = 0, resume = 0;

        const setBadge = (tone, html) => { badge.dataset.tone = tone; badge.innerHTML = html; };
        const setMain = (label, onclick) => { main.textContent = label; main.onclick = onclick; };
        const setTarget = (k) => { target = k; for (const b of seg.children) b.setAttribute('aria-pressed', String(b.dataset.target === k)); if (phase === 'ready') ready(); };
        const setFailing = (v) => { failing = v; failBtn.setAttribute('aria-pressed', String(v)); };
        const kv = (rows) => rows.map(([icon, k, v]) => `<div class="xrp-line">${xcIcon(icon)}<span class="xrp-k">${k}</span><b>${esc(v)}</b></div>`).join('');
        const setStep = (i, state, time) => { steps[i].dataset.state = state; $('.xrp-node', steps[i]).innerHTML = state === 'done' ? xcIcon('check') : state === 'fail' ? xcIcon('x') : ''; if (time !== undefined) $('.xrp-step-t', steps[i]).textContent = time; };
        seg.onclick = (e) => { const b = e.target.closest('button'); if (b && phase !== 'run') setTarget(b.dataset.target); };
        failBtn.onclick = () => setFailing(!failing);

        function ready() {
          phase = 'ready'; token += 1;
          steps.forEach((_, i) => { setStep(i, 'pending', ''); const l = $('.xrp-link', steps[i]); if (l) l.style.transform = ''; });
          setBadge('', '<i></i>Ready');
          detail.innerHTML = `<div class="xrp-dtop"><span class="xrp-dtitle">Ready to release</span></div><div class="xrp-lines">${kv([['gitBranch', 'Branch', 'main'], ['commit', 'Commit', 'a41f8c2'], ['cloud', 'Target', XRP_TARGETS[target].label], ['layers', 'Steps', String(XRP_STAGES.length)]])}</div>`;
          setMain('Run pipeline', () => release(0));
        }

        // Runs the stages from `from`; a newer run (Cancel, Reset, Retry) bumps the token and this one stops.
        async function release(from) {
          const my = ++token; phase = 'run';
          setMain('Cancel', () => ready());
          for (let i = from; i < XRP_STAGES.length; i++) {
            const s = XRP_STAGES[i], bad = s.fail && failing, run = bad ? s.fail : s;
            setBadge('run', `<i></i>Step ${i + 1}/${XRP_STAGES.length}`); setStep(i, 'run', '');
            detail.innerHTML = `<div class="xrp-dtop"><span class="xrp-dtitle is-run">${esc(s.name === 'Deploy' ? `${s.title} ${target}` : s.title)}</span><span class="xrp-dtime">0.0s</span></div><div class="xrp-lines"></div>`;
            const lines = $('.xrp-lines', detail), time = $('.xrp-dtime', detail), link = $('.xrp-link', steps[i]);
            const skel = mk('div', 'xrp-skel'); skel.innerHTML = '<i></i><span></span>'; skel.setAttribute('aria-hidden', 'true');
            const total = run.lines.length + 1;
            for (let j = 0; j < total; j++) {
              const entry = j < run.lines.length ? run.lines[j] : null;
              if (entry) { const ln = mk('div', 'xrp-line'); ln.innerHTML = `${xcIcon(entry[0])}<span>${esc(entry[1])}</span>`; lines.append(ln, skel); }
              for (let k = 1; k <= 6; k++) {
                const frac = (j + k / 6) / total;
                time.textContent = `${(run.secs * frac).toFixed(1)}s`;
                if (link && !bad) link.style.transform = `scaleX(${frac})`;
                await xcWait(t, 90);
                if (my !== token) return;
              }
            }
            skel.remove();
            $('.xrp-dtitle', detail).classList.remove('is-run');
            time.textContent = `${run.secs.toFixed(1)}s`;
            if (run.end) { const ln = mk('div', 'xrp-line'); ln.dataset.tone = bad ? 'err' : 'ok'; ln.innerHTML = `${xcIcon(run.end[0])}<span>${esc(run.end[1])}</span>`; lines.append(ln); }
            if (bad) {
              setStep(i, 'fail', `${run.secs.toFixed(1)}s`);
              setBadge('err', `${xcIcon('x')}Failed`); phase = 'failed'; resume = i;
              setMain('Retry scan', () => { setFailing(false); release(resume); });
              return;
            }
            setStep(i, 'done', `${s.secs.toFixed(1)}s`);
            if (link) link.style.transform = 'scaleX(1)';
            await xcWait(t, 380);
            if (my !== token) return;
          }
          phase = 'done';
          setBadge('ok', `${xcIcon('check')}Released`);
          detail.innerHTML = `<div class="xrp-dtop"><span class="xrp-dtitle">Live on ${target}</span></div><div class="xrp-lines">${kv([['clock', 'Duration', '1:42'], ['flask', 'Tests', '1,284 passed'], ['box', 'Bundle', '412 kB'], ['link', 'URL', XRP_TARGETS[target].url]])}</div>`;
          setMain('Reset', () => ready());
        }

        // Every other run plays the video's second take: production, a failing scan, then the retry.
        const second = (ctx.xrpRuns = (Number(ctx.xrpRuns) || 0) + 1) % 2 === 0;
        ready();
        await xcWait(t, 1100);
        if (second) { setTarget('production'); await xcWait(t, 500); setFailing(true); await xcWait(t, 600); }
        await release(0);
        if (phase === 'failed') { await xcWait(t, 1600); setFailing(false); await release(resume); }
      } },

    { group: G, title: 'Parallel Research Run', kind: 'scene',
      desc: 'Multi-agent run by Akash (@a1x45h, https://x.com/a1x45h/status/2113708491907215460), cloned with permission: a question splits into three agents that work in parallel on curved branches, each folds into a green finding as it lands, the answer streams as a numbered list, and time, sources and tokens count along; Stop and the chevrons work.',
      async run(root, t, ctx) {
        xcStyle('x-parallel-run-css', XPR_CSS);
        const el = mk('section', 'xpr'); el.setAttribute('aria-label', 'Research run');
        el.innerHTML = `<div class="xpr-head"><span class="xpr-logo" aria-hidden="true">${xcIcon('research')}</span><div class="xpr-name"><b>Research run</b><span>${XPR_AGENTS.length} agents in parallel</span></div><span class="xpr-badge" role="status" aria-live="polite"></span></div>
<div class="xpr-panel"><div class="xpr-q"></div><div class="xpr-split is-run">${xcIcon('fork')}<span>Planning tasks</span></div><div class="xpr-agents"></div></div>
<div class="xpr-foot"><div class="xpr-stat"><span>Time</span><b data-k="time">0.0s</b></div><div class="xpr-stat"><span>Sources</span><b data-k="src">0</b></div><div class="xpr-stat"><span>Tokens</span><b data-k="tok">0</b></div><button type="button" class="xpr-main">Stop</button></div>`;
        $('.xpr-q', el).textContent = XPR_QUESTION;
        root.append(el);
        const badge = $('.xpr-badge', el), split = $('.xpr-split', el), list = $('.xpr-agents', el), panel = $('.xpr-panel', el), main = $('.xpr-main', el);
        const stat = (k) => $(`[data-k=${k}]`, el);
        const SRC = [[3, 2, 0], [3, 0, 2, 0], [2, 2, 1]], TOK = [[1600, 2200, 1600], [1300, 300, 2400, 1800], [1500, 1600, 1500]];
        let stopped = false, sources = 0, tokens = 0, working = XPR_AGENTS.length;
        const setBadge = (html, tone) => { badge.innerHTML = html; if (tone) badge.dataset.tone = tone; else delete badge.dataset.tone; };
        const fmtTok = (v) => (v < 1000 ? String(Math.round(v)) : `${(v / 1000).toFixed(1)}k`);
        const addTokens = async (n) => { const from = tokens; tokens += n; for (let k = 1; k <= 5; k++) { stat('tok').textContent = fmtTok(from + (n * k) / 5); await xcWait(t, 40); } };
        main.onclick = () => { if (main.textContent === 'Stop') { stopped = true; setBadge('<i></i>Stopped'); main.textContent = 'Reset'; } else ctx.restart?.(); };

        const t0 = performance.now(), times = [];
        const clock = t.every(100, () => {
          stat('time').textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s`;
          for (const a of times) if (a.running) a.el.textContent = `${((performance.now() - a.t0) / 1000).toFixed(1)}s`;
        });

        setBadge('<i></i>Planning');
        await xcWait(t, 1300);
        split.classList.remove('is-run'); $('span', split).textContent = `Split into ${XPR_AGENTS.length} parallel tasks`;
        setBadge(`<i></i>${working} working`);

        const agent = async (a, i) => {
          await xcWait(t, i * 140);
          const row = mk('div', 'xpr-agent'); row.dataset.state = 'run';
          row.innerHTML = `<div class="xpr-atop"><span class="xpr-st"><span class="xpr-spin" aria-hidden="true"></span></span><span class="xpr-aname"></span><span class="xpr-atime">0.0s</span><button type="button" class="xpr-toggle" aria-expanded="false" aria-label="Show steps">${xcIcon('chevronRight')}</button></div><div class="xpr-steps"></div>`;
          $('.xpr-aname', row).textContent = a.name;
          list.append(row);
          const steps = $('.xpr-steps', row), timer = { el: $('.xpr-atime', row), t0: performance.now(), running: true };
          times.push(timer);
          for (const [j, [icon, text, ms]] of a.steps.entries()) {
            if (stopped) return;
            const st = mk('div', 'xpr-step'); st.dataset.state = 'run'; st.innerHTML = `${xcIcon(icon)}<span></span>`; $('span', st).textContent = text;
            steps.append(st);
            await xcWait(t, ms);
            if (stopped) return;
            st.dataset.state = 'done';
            sources += SRC[i][j]; stat('src').textContent = sources;
            addTokens(TOK[i][j]);
          }
          timer.running = false; timer.el.textContent = `${a.secs.toFixed(1)}s`;
          row.dataset.state = 'done';
          $('.xpr-st', row).innerHTML = `<span class="xpr-ok" aria-hidden="true">${xcIcon('check')}</span>`;
          steps.hidden = true;
          const sum = mk('div', 'xpr-sum'); sum.innerHTML = `<span class="xpr-ok" aria-hidden="true">${xcIcon('check')}</span><span></span>`; $('span:last-child', sum).textContent = a.sum;
          row.append(sum);
          const toggle = $('.xpr-toggle', row);
          toggle.onclick = () => { steps.hidden = !steps.hidden; toggle.setAttribute('aria-expanded', String(!steps.hidden)); toggle.setAttribute('aria-label', steps.hidden ? 'Show steps' : 'Hide steps'); };
          working -= 1;
          if (working) setBadge(`<i></i>${working} working`);
        };
        await Promise.all(XPR_AGENTS.map(agent));
        if (stopped) { t.stop(clock); return; }

        // The answer: a spinner while it writes, then the lead line and the numbered points stream in.
        setBadge('<i></i>Writing');
        const ans = mk('div', 'xpr-answer is-run');
        ans.innerHTML = `<div class="xpr-atop"><span class="xpr-st"><span class="xpr-spin" aria-hidden="true"></span></span><span class="xpr-aname">Writing answer</span></div><p></p><ol></ol>`;
        panel.append(ans);
        const stream = async (node, text) => { for (const w of text.split(/(?<= )/)) { node.append(w); await xcWait(t, 45); if (stopped) return; } };
        await xcWait(t, 500);
        await stream($('p', ans), XPR_ANSWER.lead);
        for (const [i, point] of XPR_ANSWER.points.entries()) {
          const li = mk('li'); li.innerHTML = `<i>${i + 1}</i><span></span>`; $('ol', ans).append(li);
          await stream($('span', li), point);
          if (stopped) { t.stop(clock); return; }
        }
        await addTokens(1800);
        t.stop(clock);
        if (REDUCE) stat('time').textContent = '11.9s';
        ans.classList.remove('is-run');
        $('.xpr-st', ans).innerHTML = `<span class="xpr-ok" aria-hidden="true">${xcIcon('check')}</span>`;
        $('.xpr-aname', ans).textContent = 'Answer';
        setBadge(`${xcIcon('check')}Done`, 'ok');
        main.textContent = 'Reset';
      } },

    { group: G, title: 'Merge Conflicts', kind: 'scene',
      desc: 'Generative UI #2 by Phil Pitus (@pitus_, https://x.com/pitus_/status/2111519352503873866), cloned with permission: "Create PR" opens a pull request card with a live commit graph, main moves on and three conflicts land in orange, the agent merges main in and resolves them one by one, checks pass and the PR merges in purple; Resolve conflicts and Merge can be clicked.',
      async run(root, t) {
        xcStyle('x-merge-conflicts-css', XMC_CSS);
        const el = mk('section', 'xmc'); el.setAttribute('aria-label', 'Create PR conversation');
        el.innerHTML = `<div class="xmc-thread" style="display:flex;flex-direction:column;gap:12px"></div><div class="xmc-chips" role="status" aria-live="polite"></div>
<div class="xmc-compose" aria-hidden="true"><div class="xmc-ph">Ask anything, or type / for skills</div><div class="xmc-bar"><span class="xmc-tool is-round">${xcIcon('plus')}</span><span class="xmc-tool">${xcIcon('folder')}acme-webapp</span><span class="xmc-tool">${xcIcon('laptop')}Local</span><span class="xmc-tool is-round">${xcIcon('cloud')}</span><span style="flex:1"></span><span class="xmc-tool" style="background:none">${xcIcon('signal')}Medium</span><span class="xmc-tool is-round" style="background:none">${xcIcon('mic')}</span><span class="xmc-send">${xcIcon('arrowUp')}</span></div></div>`;
        root.append(el);
        const thread = $('.xmc-thread', el), chips = $('.xmc-chips', el);
        const rows = [], conflicts = new Map(), dim = new Set(), seen = new Set();
        let merged = false, top = null, card = null;

        const setChips = (state) => {
          const diff = '<span class="xmc-pill"><span class="xmc-diff"><span class="a">+482</span><span class="d">−37</span><span class="bars"><i></i><i></i><i></i><i class="r"></i><i class="o"></i></span></span>' + xcIcon('chevronDown') + '</span>';
          chips.innerHTML = `<span class="xmc-pill" data-tone="${state.tone || ''}">${state.icon || ''}${state.pr ? '<b>#128</b>' : ''}<span>${esc(state.text)}</span></span>${state.diff === false ? '' : diff}`;
        };
        const spin = '<span class="xmc-spin" aria-hidden="true"></span>';
        const say = (cls, html) => { const n = mk('div', `${cls} xmc-in`); n.innerHTML = html; thread.append(n); return n; };

        // The rows and their graph are redrawn from the model on every change; only rows not seen before animate.
        const render = () => {
          const g = $('.xmc-graph', card);
          const html = rows.map((id) => {
            if (id === 'top') return `<div class="xmc-row xmc-top" data-tone="${top.tone}"><span class="xmc-st" aria-hidden="true">${top.icon}</span><div class="xmc-msg"><span>${esc(top.text)}</span>${top.chip ? `<span class="xmc-chip" data-tone="${top.chip[1]}">${top.chip[0]}</span>` : ''}</div><span class="xmc-right">${esc(top.right)}</span></div>`;
            const c = XMC_COMMITS[id], n = conflicts.get(id), right = id === 'merge' && top.progress ? top.progress : `<code>${c.hash}</code>${c.by}`;
            const cls = `${seen.has(id) ? '' : ' is-new'}${n ? ' is-conflict' : ''}${dim.has(id) ? ' is-dim' : ''}`;
            seen.add(id);
            return `<div class="xmc-row${cls}"><span></span><div class="xmc-msg"><span>${esc(c.text)}</span>${c.chip ? `<span class="xmc-chip" data-tone="${c.chip[1]}">${c.chip[0]}</span>` : ''}${n ? `<span class="xmc-n">${n}</span>` : ''}</div><span class="xmc-meta">${right}</span></div>`;
          }).join('');
          g.innerHTML = `<svg aria-hidden="true"></svg>${html}`;
          xmcGraph($('svg', g), rows, merged, conflicts);
        };
        const setTop = (patch) => { top = { ...top, ...patch }; render(); };
        const foot = (html, tone) => { const f = $('.xmc-fstat', card); f.innerHTML = html; if (tone) f.dataset.tone = tone; else delete f.dataset.tone; };
        const action = (html, opts = {}) => { const a = $('.xmc-act', card); a.innerHTML = html; a.disabled = !!opts.disabled; a.hidden = !html; a.classList.toggle('is-plain', !!opts.plain); return a; };
        // Resolves on a click, or after `ms` when nobody clicks: the demo plays on its own.
        const press = (btn, ms) => new Promise((resolve) => { let done = false; const go = () => { if (!done) { done = true; resolve(); } }; btn.onclick = go; xcWait(t, ms).then(go); });

        await xcWait(t, 600);
        say('xmc-user', 'Create PR');
        setChips({ icon: spin, text: 'Creating PR' });
        await xcWait(t, 500);
        const think = say('xmc-think is-run', `${xcIcon('chevronRight')}<b>Thinking</b><span class="xmc-sec">1s</span>`);
        let secs = 1;
        const tick = t.every(1000, () => { secs += 1; $('.xmc-sec', think).textContent = `${secs}s`; });
        await xcWait(t, 700);
        card = say('xmc-card', `<div class="xmc-chead"><b class="xmc-ctitle">Refresh sessions in the auth middleware</b><span class="xmc-state" hidden>Open</span></div><div class="xmc-graph"></div><div class="xmc-checks" hidden></div><div class="xmc-foot"><div class="xmc-fstat"></div><button type="button" class="xmc-act" hidden></button></div>`);
        foot(`${spin}<span>Pushing 3 commits to origin</span>`);
        for (const id of ['tests', 'refresh', 'consent', 'expiry', 'funnel', 'bump']) { rows.push(id); render(); await xcWait(t, 140); }
        await xcWait(t, 1300);

        // main moved on: fetch it, Lena's commits slide in and the merge row appears on top.
        $('.xmc-ctitle', card).innerHTML = 'Refresh sessions in the auth middleware <span>#128</span>';
        $('.xmc-state', card).hidden = false;
        foot(`${spin}<span>Fetching main</span>`);
        top = { text: 'Merge into main', tone: '', icon: `<svg viewBox="0 0 16 16" width="15" height="15"><circle cx="8" cy="8" r="3.2" fill="var(--xmc-gray)"/></svg>`, right: '' };
        rows.unshift('top'); rows.splice(2, 0, 'rotate'); render();
        await xcWait(t, 1100);
        rows.splice(2, 0, 'read'); render();
        await xcWait(t, 700);
        t.stop(tick); think.classList.remove('is-run'); $('b', think).textContent = 'Worked for'; $('.xmc-sec', think).textContent = '5s';
        conflicts.set('read', 1); conflicts.set('rotate', 2);
        setTop({ tone: 'orange', icon: xcIcon('alert'), right: '3 conflicts' });
        foot(`${xcIcon('alert')}<span>3 conflicts with main</span>`, 'orange');
        const resolveBtn = action('Resolve conflicts');
        setChips({ tone: 'orange', icon: '<i></i>', pr: true, text: '3 conflicts' });
        const para = say('xmc-say', '');
        for (const w of XMC_SAY.split(' ')) { para.insertAdjacentHTML('beforeend', `${w} `); await xcWait(t, 40); }
        await press(resolveBtn, 1800);

        // Merge main in and resolve the three conflicts one by one.
        rows.splice(1, 0, 'merge');
        action(`${spin}Resolving`, { disabled: true });
        setChips({ icon: spin, pr: true, text: 'Resolving' });
        for (let n = 1; n <= 3; n++) {
          setTop({ progress: `${n}/3` });
          foot(`${spin}<span>Resolving conflict ${n} of 3</span>`);
          await xcWait(t, 1100);
          const id = conflicts.get('rotate') > 1 || n === 2 ? 'rotate' : 'read';
          const left = conflicts.get(id) - 1;
          if (left) conflicts.set(id, left); else { conflicts.delete(id); dim.add(id); }
          setTop({ right: 3 - n ? `${3 - n} conflict${3 - n > 1 ? 's' : ''}` : '' });
        }
        setTop({ progress: null, tone: 'green', icon: xcIcon('checkCircle'), right: 'ready' });

        // Checks land, then the PR is ready to merge.
        const checks = $('.xmc-checks', card); checks.hidden = false;
        foot(`${spin}<span>Running checks</span>`);
        action('');
        for (const [name, val, tip] of [['Tests', '42 passed', 'bun test · 42 passed 14s'], ['Lint', 'passed', 'eslint · no problems 9s'], ['Types', 'passed', 'tsc · 0 errors 11s'], ['Preview', 'ready', 'preview.acme.dev/pr-128']]) {
          const c = mk('span', 'xmc-check'); c.tabIndex = 0; c.dataset.tip = tip;
          c.innerHTML = `${name === 'Preview' ? spin : xcIcon('check')}<b>${name}</b>${name === 'Preview' ? 'deploying' : val}`;
          checks.append(c);
          await xcWait(t, 260);
          if (name === 'Preview') { await xcWait(t, 700); c.innerHTML = `${xcIcon('check')}<b>${name}</b>${val}`; }
        }
        foot(`${xcIcon('chevronDown')}<span>Ready to merge</span>`);
        const mergeBtn = action(`${xcIcon('merge')}Merge`);
        setChips({ tone: 'green', icon: '<i></i>', pr: true, text: 'Ready to merge' });
        await press(mergeBtn, 2200);
        foot(`${spin}<span>Merging into main</span>`);
        action(`${spin}Merging`, { disabled: true });
        setChips({ icon: spin, pr: true, text: 'Merging' });
        await xcWait(t, 1500);

        merged = true;
        checks.hidden = true;
        const state = $('.xmc-state', card); state.textContent = 'Merged'; state.dataset.tone = 'purple';
        setTop({ text: 'Merged into main', chip: ['main', ''], tone: 'purple', icon: xcIcon('merge'), right: 'merged' });
        foot(`${xcIcon('merge')}<span>Merged into main</span>`, 'purple');
        action(`${xcIcon('github')}GitHub`, { plain: true });
        setChips({ tone: 'purple', icon: xcIcon('merge'), pr: true, text: 'Merged', diff: false });
      } },

    { group: G, title: 'Merge Conflicts · One-shot v1', kind: 'scene',
      desc: 'The one-shot first version of Phil Pitus\'s merge conflict component (@pitus_, https://x.com/pitus_/status/2111887566907802073), cloned with permission: the same thread with a horizontal branch graph whose dashed link to main turns orange on conflicts, resolves and merges in purple.',
      async run(root, t) {
        xcStyle('x-merge-conflicts-css', XMC_CSS);
        xcStyle('x-merge-v1-css', XMV_CSS);
        const el = mk('section', 'xmc'); el.setAttribute('aria-label', 'Fix and open a pull request');
        el.innerHTML = `<div class="xmc-thread" style="display:flex;flex-direction:column;gap:12px"></div><div class="xmc-chips" style="justify-content:flex-end" role="status" aria-live="polite"></div>
<div class="xmc-compose" aria-hidden="true"><div class="xmc-ph">Ask anything, or type / for skills</div><div class="xmc-bar"><span class="xmc-tool is-round">${xcIcon('plus')}</span><span class="xmc-tool">${xcIcon('folder')}acme-webapp</span><span class="xmc-tool">${xcIcon('laptop')}Local</span><span class="xmc-tool is-round">${xcIcon('cloud')}</span><span style="flex:1"></span><span class="xmc-tool" style="background:none">${xcIcon('signal')}Medium</span><span class="xmc-tool is-round" style="background:none">${xcIcon('mic')}</span><span class="xmc-send">${xcIcon('arrowUp')}</span></div></div>`;
        root.append(el);
        const thread = $('.xmc-thread', el), chips = $('.xmc-chips', el);
        const spin = '<span class="xmc-spin" aria-hidden="true"></span>';
        const say = (cls, html) => { const n = mk('div', `${cls} xmc-in`); n.innerHTML = html; thread.append(n); return n; };
        const files = '<span class="xmc-pill">' + xcIcon('fileText') + '4 files <span class="xmc-diff"><span class="a">+128</span><span class="d">−36</span><span class="bars"><i></i><i></i><i></i><i></i><i class="r"></i></span></span></span>';
        const setChips = (html, tone = '') => { chips.innerHTML = `${files}<span class="xmv-dark" data-tone="${tone}">${html}</span>`; };
        const think = (text, run = true) => say(`xmc-think${run ? ' is-run' : ''}`, `${xcIcon('chevronRight')}<b>${text}</b><span class="xmc-sec"></span>`);
        const stream = async (node, html) => { for (const w of html.split(' ')) { node.insertAdjacentHTML('beforeend', `${w} `); await xcWait(t, 35); } };

        say('xmc-user', 'Sessions keep expiring mid-checkout. Can you fix that?');
        await xcWait(t, 500);
        think('Thought for 14s', false);
        await stream(say('xmc-say', ''), 'Done. Sessions now refresh in the middleware when they\'re within five minutes of expiring, so checkout no longer drops you mid-payment. I added tests for both paths.');
        await xcWait(t, 600);
        say('xmc-user', 'Create PR');
        setChips(`${spin}Creating PR`);
        const opening = think('Opening the pull request');
        await xcWait(t, 1200);
        opening.classList.remove('is-run'); $('b', opening).textContent = 'Worked for 5s';

        const card = say('xmv-card', `<div class="xmv-head">${xcIcon('merge')}<div class="xmv-title"><b>Refresh sessions in the auth middleware</b><div class="xmv-sub"><span class="xmc-chip">feat/session-refresh</span>→<span class="xmc-chip">main</span><span class="xmv-commits">3 commits</span><span class="xmc-diff"><span class="a">+128</span><span class="d">−36</span></span></div></div><span class="xmv-pill" hidden>${xcIcon('merge')}<span>Open</span></span></div><div class="xmv-graph"></div><div class="xmv-sum"></div>`);
        const graph = $('.xmv-graph', card), sum = $('.xmv-sum', card), pill = $('.xmv-pill', card);
        const setSum = (tone, icon, title, sub, filesHtml, btn) => { sum.dataset.tone = tone; sum.innerHTML = `${xcIcon(icon)}<div class="xmv-sum-t"><b>${title}</b><span>${sub}</span>${filesHtml ? `<div class="xmv-files">${filesHtml}</div>` : ''}</div>${btn || ''}`; };
        graph.innerHTML = xmvGraph('open');
        setSum('', 'clock', 'Opening #128', 'Pushing 3 commits to origin');
        await xcWait(t, 1400);

        $('.xmv-title b', card).innerHTML = 'Refresh sessions in the auth middleware <span>#128</span>';
        pill.hidden = false;
        graph.innerHTML = xmvGraph('conflicts');
        setSum('orange', 'alert', '3 conflicts with main', 'Lena Park changed the same lines in main', '<span class="xmv-file"><i>TS</i>middleware.ts <em>1</em></span><span class="xmv-file"><i>TS</i>auth.ts <em>2</em></span>', '<button type="button" class="xmv-btn">Resolve conflicts</button>');
        setChips('<i></i>#128 3 conflicts');
        await stream(say('xmc-say', ''), XMC_SAY);
        const btn = $('.xmv-btn', sum);
        await new Promise((resolve) => { let done = false; const go = () => { if (!done) { done = true; resolve(); } }; btn.onclick = go; xcWait(t, 1800).then(go); });

        say('xmc-user', 'Resolve conflicts');
        $('.xmv-commits', card).textContent = '4 commits';
        graph.innerHTML = xmvGraph('resolved');
        setSum('green', 'checkCircle', 'Conflicts resolved', 'Lena Park changed the same lines in main', `<span class="xmv-file"><i>TS</i>middleware.ts ${xcIcon('check')}</span><span class="xmv-file"><i>TS</i>auth.ts ${xcIcon('check')}</span>`, `<button type="button" class="xmv-btn" disabled>${spin}Resolving</button>`);
        setChips(`${spin}#128 Resolving`);
        const tests = think('Running 0 of 42 tests');
        for (let n = 6; n <= 42; n += 6) { $('b', tests).textContent = `Running ${n} of 42 tests`; await xcWait(t, 260); }
        tests.classList.remove('is-run'); $('b', tests).textContent = 'Worked for 5s';
        await xcWait(t, 500);

        card.dataset.state = 'merged';
        pill.dataset.tone = 'purple'; $('span', pill).textContent = 'Merged';
        graph.innerHTML = xmvGraph('merged');
        setSum('purple', 'merge', 'Merged into main', '<code style="font-family:var(--font-mono);font-size:11px">feat/session-refresh</code> was deleted · just now');
        setChips(`${xcIcon('merge')}#128 Merged`, 'purple');
      } },

    { group: G, title: 'Agent Approval Card', kind: 'scene',
      desc: 'Agent approval components by Kevin (@kvnkld, aicss.dev, https://x.com/kvnkld/status/2089693820313366635), cloned with permission: a plan card with an expandable to-do list and an auto-approve countdown, and a three-step question card with lettered options and a free answer; every control works (the Command variant is not shown in the original post, so it stays disabled).',
      async run(root, t) {
        xcStyle('x-approval-card-css', XAP_CSS);
        const el = mk('section', 'xap'); el.setAttribute('aria-label', 'Agent approval');
        el.innerHTML = `<div class="xap-label">Select variant</div><div class="xap-tabs" role="group" aria-label="Variant"><button type="button" class="xap-tab" data-v="plan" aria-pressed="true">Plan</button><button type="button" class="xap-tab" data-v="questions" aria-pressed="false">Questions</button><button type="button" class="xap-tab" aria-disabled="true" title="Not shown in the original post">Command</button></div><div class="xap-label">Preview</div><div class="xap-stage"></div>`;
        root.append(el);
        const stage = $('.xap-stage', el), tabs = $('.xap-tabs', el);
        let plan = null, ask = null;

        // Plan: header, summary, to-dos folded to three, and the auto-approve countdown ring.
        const showPlan = () => {
          stage.innerHTML = `<div class="xap-card"><div class="xap-head"><span class="xap-badge">${xcIcon('listCheck')}</span><b>Plan Overview</b><span class="xap-tools" aria-hidden="true">${xcIcon('download')}${xcIcon('expand')}</span></div><div class="xap-title">Session auth migration</div><div class="xap-desc">Ship cookie-based sessions with middleware and tests. Includes a safe rollout path for production.</div><div class="xap-todos"><div class="xap-thead">${xcIcon('listCheck')}To-dos<span>${XAP_TODOS.length}</span></div><div class="xap-list"></div></div><div class="xap-foot"><div class="xap-auto" role="status" aria-live="polite"><svg class="xap-ring" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="var(--color-background-tertiary-default)"/><circle class="xap-arc" cx="8" cy="8" r="6" stroke="var(--xap-muted)" stroke-dasharray="37.7" stroke-dashoffset="32"/></svg><span>Auto Approve in 28s</span></div><button type="button" class="xap-btn">View Plan</button><button type="button" class="xap-btn is-dark">Approve ${xcIcon('enter')}</button></div></div>`;
          const list = $('.xap-list', stage);
          const draw = (open) => {
            const items = open ? XAP_TODOS : XAP_TODOS.slice(0, 3);
            list.innerHTML = items.map((x, i) => `<div class="xap-todo${open && i > 2 ? ' is-in' : ''}">${xcIcon('circleDashed')}<span>${esc(x)}</span></div>`).join('') + `<button type="button" class="xap-more" aria-expanded="${open}">${xcIcon(open ? 'minus' : 'dots')}${open ? 'Show less' : `${XAP_TODOS.length - 3} more`}</button>`;
            $('.xap-more', list).onclick = () => draw(!open);
          };
          draw(false);
          let left = 28; const arc = $('.xap-arc', stage), label = $('.xap-auto span', stage);
          const approve = () => { t.stop(timer); $('.xap-foot', stage).innerHTML = `<div class="xap-done">${xcIcon('checkCircle')}Plan approved</div>`; };
          const timer = t.every(1000, () => { left -= 1; label.textContent = `Auto Approve in ${left}s`; arc.style.strokeDashoffset = String(37.7 * (1 - Math.max(0.15, (28 - left) / 28))); if (!left) approve(); });
          $('.xap-btn.is-dark', stage).onclick = approve;
          plan = { toggle: () => $('.xap-more', list).click(), stop: () => t.stop(timer) };
        };

        // Questions: one at a time, lettered options plus a free answer; Continue unlocks once one is chosen.
        const showQuestions = () => {
          let at = 0; const picks = [];
          stage.innerHTML = '<div class="xap-card"></div>';
          const card = $('.xap-card', stage);
          const draw = () => {
            const q = XAP_QUESTIONS[at], free = String.fromCharCode(65 + q.opts.length);
            card.innerHTML = `<div class="xap-head"><span class="xap-badge is-blue">${xcIcon('question')}</span><b>Questions</b></div><div class="xap-q">${esc(q.q)}</div><div class="xap-opts" role="radiogroup" aria-label="${esc(q.q)}">${q.opts.map((o, i) => `<button type="button" class="xap-opt" role="radio" aria-checked="${picks[at] === o}" data-o="${esc(o)}"><span class="xap-key">${String.fromCharCode(65 + i)}</span>${esc(o)}</button>`).join('')}<label class="xap-opt" role="radio" aria-checked="false"><span class="xap-key">${free}</span><input type="text" placeholder="Something else..." aria-label="Something else"></label></div><div class="xap-foot"><div class="xap-pager"><button type="button" data-p="-1" aria-label="Previous question"${at ? '' : ' disabled'}>${xcIcon('chevronUp')}</button><span>${at + 1}/${XAP_QUESTIONS.length}</span><button type="button" data-p="1" aria-label="Next question"${at < XAP_QUESTIONS.length - 1 ? '' : ' disabled'}>${xcIcon('chevronDown')}</button></div><button type="button" class="xap-btn" data-skip>Skip</button><button type="button" class="xap-btn is-dark" data-next${picks[at] ? '' : ' disabled'}>Continue ${xcIcon('enter')}</button></div>`;
            const next = $('[data-next]', card), input = $('input', card), freeRow = input.closest('.xap-opt');
            const choose = (val, row) => { picks[at] = val; for (const r of card.querySelectorAll('.xap-opt')) r.setAttribute('aria-checked', String(r === row)); next.disabled = !val; };
            for (const b of card.querySelectorAll('button.xap-opt')) b.onclick = () => choose(b.dataset.o, b);
            input.oninput = () => choose(input.value.trim(), freeRow);
            const go = (d) => { at = Math.max(0, Math.min(XAP_QUESTIONS.length - 1, at + d)); draw(); };
            for (const p of card.querySelectorAll('[data-p]')) p.onclick = () => go(Number(p.dataset.p));
            $('[data-skip]', card).onclick = () => go(1);
            next.onclick = () => { if (at < XAP_QUESTIONS.length - 1) go(1); else $('.xap-foot', card).innerHTML = `<div class="xap-done">${xcIcon('checkCircle')}Answers sent</div>`; };
          };
          draw();
          ask = {
            pick: (label) => { const b = [...card.querySelectorAll('button.xap-opt')].find((x) => x.dataset.o === label); b?.click(); },
            type: async (text) => { const input = $('input', card); for (const ch of text) { input.value += ch; input.dispatchEvent(new Event('input')); await xcWait(t, 55); } },
            next: () => $('[data-next]', card).click(),
          };
        };
        const select = (v) => { for (const b of tabs.querySelectorAll('[data-v]')) b.setAttribute('aria-pressed', String(b.dataset.v === v)); plan?.stop(); if (v === 'plan') showPlan(); else showQuestions(); };
        tabs.onclick = (e) => { const b = e.target.closest('[data-v]'); if (b) select(b.dataset.v); };

        // The video's walkthrough: unfold the to-dos, then answer the three questions.
        showPlan();
        await xcWait(t, 1800); plan.toggle();
        await xcWait(t, 1800); plan.toggle();
        await xcWait(t, 1400); select('questions');
        await xcWait(t, 1000); ask.pick('Session cookies');
        await xcWait(t, 700); ask.next();
        await xcWait(t, 1000); ask.pick('CI only');
        await xcWait(t, 700); ask.next();
        await xcWait(t, 900); await ask.type('This is an example');
      } },

    { group: G, title: 'Floating Agent Chat', kind: 'scene',
      desc: 'Floating CRM agent chat by Louis Nguyen Studio (@louisnstudio, https://x.com/louisnstudio/status/2096525796714438833, demo crm-agent-pop.vercel.app), cloned with permission: an agent conversation pops up over a CRM, asks which Acme to use, delivers a PDF report, then switches between pop-up, side drawer and full page from its layout menu.',
      async run(root, t) {
        xcStyle('x-floating-chat-css', XCP_CSS);
        const el = mk('section', 'xcp'); el.setAttribute('aria-label', 'CRM with a floating agent chat');
        el.innerHTML = `<aside class="xcp-side" aria-hidden="true"><div class="xcp-org"><i></i>Locally inc.</div>${[['bubble', 'Agents', 1], ['home', 'Home'], ['inbox', 'Inbox'], ['bubble', 'Messages'], ['layers', 'Balances'], ['users', 'Customers'], ['fileText', 'Contracts']].map(([i, l, on]) => `<div class="xcp-nav${on ? ' is-on' : ''}">${xcIcon(i)}${l}</div>`).join('')}<div class="xcp-me"><i></i>Jane Moore</div></aside>
<div class="xcp-main" aria-hidden="true"><div class="xcp-hello">Good morning, Jane</div><div class="xcp-sub">I'm Rune, where should we start today?</div><div class="xcp-ghost"></div><div class="xcp-cards"><span></span><span></span><span></span></div></div>
<div class="xcp-win is-hidden" data-layout="popup" role="dialog" aria-label="Quarterly sales report"><div class="xcp-head"><div class="xcp-crumb">Agent<span>/</span>Rune<span>/</span><b>Quarterly sales report</b></div><button type="button" class="xcp-hbtn">${xcIcon('star')}Favorite</button><button type="button" class="xcp-hbtn" data-menu aria-haspopup="menu" aria-expanded="false" aria-label="Switch layout">${xcIcon('panel')}</button><button type="button" class="xcp-hbtn" data-close aria-label="Close">${xcIcon('x')}</button></div><div class="xcp-feed" aria-live="polite"></div><div class="xcp-compose"><div class="xcp-ph">Example: Summarise the report data and forecast the trends...</div><div class="xcp-cbar">${xcIcon('plus')}${xcIcon('at')}<span class="xcp-sep"></span><span style="display:flex;align-items:center;gap:5px">${xcIcon('code')}Skills</span>${XCP_DOTS}<span>Model Fusion</span><span style="flex:1"></span>${xcIcon('mic')}</div></div></div>`;
        root.append(el);
        const win = $('.xcp-win', el), feed = $('.xcp-feed', el), menuBtn = $('[data-menu]', el);
        const follow = () => { feed.scrollTop = feed.scrollHeight; };
        const add = (cls, html) => { const n = mk('div', cls); n.innerHTML = html; feed.append(n); follow(); return n; };
        const acts = `<div class="xcp-acts" aria-hidden="true">${xcIcon('copy')}${xcIcon('heart')}${xcIcon('rotate')}</div>`;
        const type = async (node, text) => { for (const w of text.split(/(?<= )/)) { node.append(w); follow(); await xcWait(t, 28); } };

        // Layout menu: Side Drawer, Full Page, Pop Up.
        const LAYOUTS = [['drawer', 'Side Drawer'], ['full', 'Full Page'], ['popup', 'Pop Up']];
        const setLayout = (k) => { win.dataset.layout = k; closeMenu(); };
        const closeMenu = () => { $('.xcp-menu', win)?.remove(); menuBtn.setAttribute('aria-expanded', 'false'); };
        menuBtn.onclick = () => {
          if ($('.xcp-menu', win)) return closeMenu();
          const m = mk('div', 'xcp-menu'); m.setAttribute('role', 'menu');
          m.innerHTML = `<p>Switch Layout:</p>${LAYOUTS.map(([k, l]) => `<button type="button" role="menuitemradio" aria-checked="${win.dataset.layout === k}" data-l="${k}">${l}</button>`).join('')}`;
          m.onclick = (e) => { const b = e.target.closest('[data-l]'); if (b) setLayout(b.dataset.l); };
          win.append(m); menuBtn.setAttribute('aria-expanded', 'true');
        };
        $('[data-close]', el).onclick = () => win.classList.add('is-hidden');

        await xcWait(t, 600);
        win.classList.remove('is-hidden');
        await xcWait(t, 500);
        add('xcp-user', 'Generate a quarterly sales report for Acme Corp.');
        await xcWait(t, 600);
        const a1 = add('xcp-bot', `<div class="xcp-tool"><i></i>3 tool used${xcIcon('chevronRight')}</div><div class="xcp-text"></div>`);
        await xcWait(t, 500);
        await type($('.xcp-text', a1), 'I have identified 2 companies named "Acme." Which one do you prefer:');
        const choices = mk('div', 'xcp-choices'); choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', 'Company');
        choices.innerHTML = [['Acme Corp', 'var(--color-chart-5-active)'], ['New Acme Corp', 'var(--color-status-rose-text)']].map(([l, c]) => `<button type="button" class="xcp-choice" aria-pressed="false"><i style="background:${c}"></i><span>${l}</span>${xcIcon('check')}</button>`).join('');
        a1.append(choices); a1.insertAdjacentHTML('beforeend', acts); follow();
        const choose = (b) => { for (const c of choices.children) { c.setAttribute('aria-pressed', String(c === b)); c.classList.add('is-decided'); } };
        let picked = false;
        for (const c of choices.children) c.onclick = () => { picked = true; choose(c); };
        await xcWait(t, 1300);
        if (!picked) choose(choices.children[0]);
        await xcWait(t, 500);
        add('xcp-user', 'The first one. Can you whip up the quarterly sales report using the data we have for this company?');
        await xcWait(t, 700);
        const a2 = add('xcp-bot', `<div class="xcp-tool"><i></i>1 tool used${xcIcon('chevronRight')}</div><div class="xcp-text"></div>`);
        await xcWait(t, 400);
        await type($('.xcp-text', a2), 'The quarterly sales report for Acme Corp has been successfully generated and is available in PDF format.');
        a2.insertAdjacentHTML('beforeend', `<div class="xcp-file"><div class="xcp-ftitle"><i></i><span>Quarterly sales report for Acme Corp.pdf</span></div><p class="xcp-fdesc">Explore your Stripe data thoroughly to uncover vital insights that can shape your business strategies. By analyzing trends and patterns, you can make informed decisions.</p><div class="xcp-fbtns"><button type="button">${xcIcon('share')}Share</button><button type="button" class="is-solid">${xcIcon('download')}Download</button></div></div>${acts}`);
        follow();

        // The layout tour from the video, through the menu each time.
        for (const k of ['drawer', 'full', 'popup']) {
          await xcWait(t, 1500);
          menuBtn.click();
          await xcWait(t, 700);
          $(`.xcp-menu [data-l=${k}]`, win)?.click();
          await xcWait(t, 500); follow();
        }
      } },

    { group: G, title: 'Deploy Status', kind: 'scene',
      desc: 'Deploy status by Charles Postiaux (@PostiauxCharles, https://x.com/PostiauxCharles/status/2109606436527366235), cloned with permission from its three stills: a timeline plays the deploy step by step, long steps grow against last run\'s time, and a summary fills a build-and-deploy bar chart beside it until the site is live in 42s.',
      async run(root, t) {
        xcStyle('x-deploy-status-css', XDS_CSS);
        const el = mk('section', 'xds'); el.setAttribute('aria-label', 'Deploy of Update pricing page');
        const head = '<div class="xds-title">Update pricing page</div><div class="xds-by">Charles Postiaux · main / a3f91c2</div>';
        const live = XDS_STEPS.filter((s) => !s.skipped);
        el.innerHTML = `<div class="xds-card">${head}<div class="xds-tl" role="list" aria-label="Deploy timeline"></div></div>
<div class="xds-card">${head}<div class="xds-legend xds-mono" aria-hidden="true"><span style="left:0">build · 24s</span><span class="is-on" style="left:${(24 / XDS_TOTAL) * 100}%">deploy · 18s</span></div><div class="xds-segs" aria-hidden="true">${live.map((s) => `<i class="${s.group === 'deploy' ? 'is-deploy' : ''}" style="flex:${s.secs} 1 0"></i>`).join('')}</div><div class="xds-axis xds-mono" aria-hidden="true"><span style="left:0">00:00</span><span style="left:${(24 / XDS_TOTAL) * 100}%;transform:translateX(-50%)">00:24</span><span>00:42</span></div><div class="xds-list" role="list" aria-label="Steps"></div><div class="xds-end" role="status" aria-live="polite"></div></div>`;
        root.append(el);
        const tl = $('.xds-tl', el), list = $('.xds-list', el), end = $('.xds-end', el), segs = [...el.querySelectorAll('.xds-segs i')];
        const row = (cls, time, mark, name, d) => { const r = mk('div', `xds-row${cls}`); r.setAttribute('role', 'listitem'); r.innerHTML = `<span class="xds-mono">${time}</span><span class="xds-mark">${mark}</span><span class="xds-name">${esc(name)}</span><span class="xds-mono xds-d">${d}</span>`; tl.append(r); return r; };
        const SIM = 200; // real ms per simulated second
        let group = '', seg = 0;
        await xcWait(t, 500);
        for (const s of XDS_STEPS) {
          if (s.group !== group) { group = s.group; row(' is-group', '', '', group === 'build' ? 'Build' : 'Deploy', group === 'build' ? '24s' : '18s'); await xcWait(t, 200); }
          if (s.skipped) {
            row(' is-skip', xdsClock(s.at), '', s.name, 'skipped');
            list.insertAdjacentHTML('beforeend', `<div class="xds-item is-skip" role="listitem">${xcIcon('circleDashed')}<span>${esc(s.name)}</span><span class="xds-mono xds-d">skipped</span><span class="xds-mono xds-at">${xdsClock(s.at)}</span></div>`);
            await xcWait(t, 300);
            continue;
          }
          const long = !!s.was;
          const r = row('', xdsClock(s.at), long ? `<span class="xds-bar" style="height:${s.was * XDS_PX}px"><i style="height:${s.secs * XDS_PX}px"></i></span>` : '<span class="xds-dot"></span>', s.name, '0s');
          if (long) { r.style.minHeight = `${s.was * XDS_PX + 18}px`; r.insertAdjacentHTML('beforeend', `<span class="xds-mono xds-was">was ${s.was}s</span>`); }
          const fill = $('.xds-bar > i', r), d = $('.xds-d', r);
          for (let k = 1; k <= s.secs; k++) {
            if (fill) fill.style.transform = `scaleY(${k / s.secs})`;
            d.textContent = `${k}s`;
            await xcWait(t, SIM);
          }
          segs[seg++].classList.add('is-in');
          list.insertAdjacentHTML('beforeend', `<div class="xds-item" role="listitem"><span class="is-${s.group}">${xcIcon('checkCircle')}</span><span>${esc(s.name)}</span><span class="xds-mono xds-d">${s.secs}s</span><span class="xds-mono xds-at">${xdsClock(s.at)}</span></div>`);
        }
        row(' is-live', xdsClock(XDS_TOTAL), '<span class="xds-dot"></span>', 'Live on baobun.studio', `${XDS_TOTAL}s`);
        end.innerHTML = '<div class="xds-live">Live on baobun.studio</div><div class="xds-big">0s</div>';
        const big = $('.xds-big', end);
        for (let v = 0; v <= XDS_TOTAL; v += 3) { big.textContent = `${v}s`; await xcWait(t, 30); }
        big.textContent = `${XDS_TOTAL}s`;
      } },
  ];
}
