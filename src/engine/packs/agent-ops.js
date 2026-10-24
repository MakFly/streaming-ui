/* Agent ops — eight agent-run patterns for the Agent collection, drawn with the app's semantic tokens only
 * (text-*, background-*, border-*, status-*, accent-*), so they follow light, dark and every palette:
 *   Activity Panel · Cited Answer · Release Pipeline · Live Log Explorer · Multi-File Diff ·
 *   Plan, Then Execute · Agent Handoff · Context Budget Meter
 * Motion: ease cubic-bezier(0.22, 1, 0.36, 1) (core SOFT_EASE), entrances 240–420 ms, transform and opacity first.
 * Reduced motion: every wait resolves at once and the stylesheet drops animations, so each demo lands on its
 * final, static state. Every state reads without colour: an icon and a word ride along with each tone. */
export default function pack(h) {
  'use strict';
  const { mk, $, esc, REDUCE } = h;
  const G = 'Agent';

  /* ------------------------------------------------------------------ CSS */
  const AOP_CSS = `
/* --aop-muted: text-secondary pulled toward text-primary, so secondary copy clears AA on every surface and palette */
.aop-card { --aop-ease:cubic-bezier(0.22,1,0.36,1); --aop-muted:color-mix(in oklab, var(--color-text-secondary) 68%, var(--color-text-primary)); container-type:inline-size; position:relative; width:100%; max-width:560px; display:flex; flex-direction:column; overflow:hidden;
  border-radius:20px; border:1px solid var(--color-border-button-default); background:var(--color-background-primary-default); box-shadow:var(--shadow-xs);
  color:var(--color-text-primary); font-family:var(--font-sans); font-size:13px; line-height:1.45; text-align:start; }
:where(.aop-card) button { font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; }
.aop-head { display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid var(--color-separator-border); }
.aop-head-ic { flex:none; display:grid; place-items:center; width:28px; height:28px; border-radius:9px; background:var(--color-background-secondary-default); color:var(--color-foreground-icon-secondary); }
.aop-head-ic .aop-ic { width:16px; height:16px; }
.aop-head-txt { min-width:0; flex:1; }
.aop-title { font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.aop-sub { font-size:12px; color:var(--aop-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.aop-clock { flex:none; font-size:12px; }
.aop-body { display:flex; flex-direction:column; gap:12px; min-width:0; padding:14px; }
.aop-muted { color:var(--aop-muted); }
.aop-num { font-variant-numeric:tabular-nums; }
.aop-mono { font-family:var(--font-mono); font-size:11.5px; }
.aop-ic { flex:none; width:14px; height:14px; }
.aop-spin { animation:aop-spin .9s linear infinite; }
.aop-in { animation:aop-in .42s var(--aop-ease) both; }
.aop-swap { display:block; min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; animation:aop-swap .28s var(--aop-ease) both; }
.aop-pop { display:grid; place-items:center; animation:aop-pop .3s var(--aop-ease) both; }
@keyframes aop-spin { to { transform:rotate(360deg) } }
@keyframes aop-in { from { opacity:0; transform:translateY(6px) } }
@keyframes aop-swap { from { opacity:0; transform:translateY(5px) } }
@keyframes aop-pop { from { opacity:0; transform:scale(.6) } }
@container (max-width:380px) { .aop-clock { display:none } .aop-body { padding:12px } }

/* Status pill — the live region of every card */
.aop-pill { flex:none; display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 8px; border-radius:999px; font-size:11.5px; font-weight:500; white-space:nowrap;
  background:var(--color-background-secondary-default); color:var(--color-text-primary); transition:background-color .3s var(--aop-ease), color .3s var(--aop-ease); }
.aop-pill:empty { display:none; }
.aop-pill .aop-ic { width:12px; height:12px; }
.aop-pill[data-tone=run] .aop-ic { color:var(--color-accent-500); }
.aop-pill[data-tone=idle] { color:var(--aop-muted); }
.aop-pill[data-tone=ok] { background:var(--color-status-lime-background); color:var(--color-status-lime-text); }
.aop-pill[data-tone=warn] { background:var(--color-status-orange-background); color:var(--color-status-orange-text); }
.aop-pill[data-tone=err] { background:var(--color-status-rose-background); color:var(--color-status-rose-text); }

/* State glyphs: an icon in a disc, one per row */
.aop-glyph { flex:none; display:grid; place-items:center; width:20px; height:20px; border-radius:999px; color:var(--color-foreground-icon-tertiary); font-size:11px; font-weight:600; font-variant-numeric:tabular-nums; }
.aop-glyph .aop-ic { width:13px; height:13px; }
[data-state=num] .aop-glyph { background:var(--color-background-secondary-default); color:var(--aop-muted); }
[data-state=run] .aop-glyph { color:var(--color-accent-500); }
[data-state=done] .aop-glyph { background:var(--color-status-lime-background); color:var(--color-status-lime-text); }
[data-state=fail] .aop-glyph { background:var(--color-status-rose-background); color:var(--color-status-rose-text); }
[data-state=retry] .aop-glyph, [data-state=warn] .aop-glyph { background:var(--color-status-orange-background); color:var(--color-status-orange-text); }
.aop-bar { height:3px; border-radius:2px; overflow:hidden; background:var(--color-background-tertiary-default); }
.aop-bar > span { display:block; height:100%; border-radius:inherit; background:var(--color-accent-500); transform:scaleX(0); transform-origin:left; transition:transform .32s var(--aop-ease), background-color .3s; }
[data-state=done] .aop-bar > span, .aop-bar[data-state=done] > span { background:var(--color-status-lime-text); }
[data-state=fail] .aop-bar > span { background:var(--color-status-rose-text); }
.aop-events { display:flex; flex-direction:column; gap:6px; }
.aop-event { display:flex; align-items:flex-start; gap:8px; font-size:12px; animation:aop-in .32s var(--aop-ease) both; }
.aop-event .aop-glyph { width:18px; height:18px; }
.aop-event-t { min-width:0; flex:1; padding-top:1px; }
.aop-event-d { flex:none; padding-top:1px; }
.aop-result { display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:12px; background:var(--color-background-secondary-default); }
.aop-result b { font-weight:600; }

/* Activity Panel */
.aop-phase { display:flex; align-items:flex-start; gap:10px; }
.aop-phase-main { min-width:0; flex:1; display:flex; flex-direction:column; gap:6px; }
.aop-phase-top { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
.aop-phase-label { min-width:0; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:color .3s; }
.aop-phase[data-state=pending] .aop-phase-label { color:var(--aop-muted); }
.aop-slot { display:flex; min-width:0; min-height:17px; }

/* Cited Answer */
.aop-cited { position:relative; display:grid; gap:16px; }
.aop-prose { line-height:1.65; min-height:4.9em; }
.aop-cite { display:inline-grid; place-items:center; min-width:17px; height:17px; padding:0 4px; margin-inline:1px; border-radius:6px; vertical-align:1px; font-size:10.5px; font-weight:600; font-variant-numeric:tabular-nums;
  background:var(--color-background-tertiary-default); color:var(--color-text-primary); transition:background-color .2s, color .2s; animation:aop-pop .3s var(--aop-ease) both; }
.aop-cite:hover, .aop-cite:focus-visible, .aop-cite.is-on { background:var(--color-text-primary); color:var(--color-background-primary-default); }
.aop-cite:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:1px; }
.aop-sources { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; align-content:start; }
.aop-src { display:flex; align-items:flex-start; gap:8px; min-width:0; padding:8px 10px; border-radius:12px; border:1px solid var(--color-border-button-default); opacity:.75;
  transition:opacity .35s var(--aop-ease), border-color .35s var(--aop-ease), transform .35s var(--aop-ease), box-shadow .35s var(--aop-ease); }
.aop-src.is-lit { opacity:1; border-color:var(--color-accent-500); }
.aop-src.is-flash { transform:translateX(-3px); box-shadow:0 0 0 3px var(--color-badge-new-background); }
.aop-src-n { flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:6px; font-size:10.5px; font-weight:600; background:var(--color-background-tertiary-default); transition:background-color .3s, color .3s; }
.aop-src.is-lit .aop-src-n { background:var(--color-text-primary); color:var(--color-background-primary-default); }
.aop-src-body { min-width:0; display:flex; flex-direction:column; gap:1px; }
.aop-src-t { font-size:12px; font-weight:500; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.aop-src-s, .aop-src-c { font-size:11px; color:var(--aop-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.aop-link { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; overflow:visible; display:none; opacity:1; transition:opacity .4s var(--aop-ease); }
.aop-link.is-fading { opacity:0; }
.aop-link path { fill:none; stroke:var(--color-accent-500); stroke-width:1.5; stroke-linecap:round; stroke-dasharray:1; stroke-dashoffset:1; }
.aop-link.is-drawn path { stroke-dashoffset:0; transition:stroke-dashoffset .45s var(--aop-ease); }
.aop-link circle { fill:var(--color-accent-500); }
@container (min-width:500px) { .aop-cited { grid-template-columns:minmax(0,1fr) 184px; gap:30px; } .aop-sources { grid-template-columns:minmax(0,1fr); } .aop-link { display:block; } }

/* Release Pipeline */
.aop-stages { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
.aop-stage { display:flex; flex-direction:column; gap:6px; min-width:0; padding:10px; border-radius:12px; border:1px solid var(--color-border-button-default); transition:border-color .3s var(--aop-ease), background-color .3s var(--aop-ease); }
.aop-stage[data-state=run], .aop-stage[data-state=retry] { border-color:var(--color-border-button-active); background:var(--color-background-secondary-default); }
.aop-stage-top { display:flex; align-items:center; gap:6px; min-width:0; }
.aop-stage-name { font-weight:500; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.aop-stage[data-state=pending] .aop-stage-name { color:var(--aop-muted); }
.aop-stage-cmd, .aop-stage-note { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.aop-stage-foot { display:flex; flex-direction:column; font-size:11.5px; }
@container (max-width:440px) { .aop-stages { grid-template-columns:repeat(2,minmax(0,1fr)); } }

/* Live Log Explorer */
.aop-filters { display:flex; flex-wrap:wrap; gap:6px; }
.aop-filter { display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:999px; border:1px solid var(--color-border-button-default);
  background:var(--color-background-primary-default); color:var(--aop-muted); font-size:12px; font-weight:500; transition:background-color .2s, color .2s, border-color .2s; }
.aop-filter:hover { background:var(--color-background-primary-hover); color:var(--color-text-primary); }
.aop-filter[aria-pressed=true] { background:var(--color-text-primary); border-color:var(--color-text-primary); color:var(--color-background-primary-default); }
.aop-filter:focus-visible, .aop-jump:focus-visible, .aop-toggle:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
.aop-logs-wrap { position:relative; }
.aop-logs { height:216px; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; display:flex; flex-direction:column; gap:1px; padding:6px; border-radius:12px; background:var(--color-background-secondary-default); }
.aop-logs:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:2px; }
.aop-log { display:grid; grid-template-columns:auto 44px minmax(0,1fr); align-items:baseline; gap:8px; padding:3px 6px; border-radius:6px; animation:aop-in .28s var(--aop-ease) both; }
.aop-log[data-level=error] { background:var(--color-status-rose-background); }
.aop-log-msg { min-width:0; overflow-wrap:anywhere; }
.aop-lvl { border-radius:4px; padding:1px 0; text-align:center; font-size:10px; font-weight:600; letter-spacing:.02em; }
.aop-log[data-level=info] .aop-lvl { background:var(--color-background-tertiary-default); color:var(--aop-muted); }
.aop-log[data-level=warn] .aop-lvl { background:var(--color-status-orange-background); color:var(--color-status-orange-text); }
.aop-log[data-level=error] .aop-lvl { background:var(--color-background-primary-default); color:var(--color-status-rose-text); }
.aop-logs[data-filter=info] > :not([data-level=info]), .aop-logs[data-filter=warn] > :not([data-level=warn]), .aop-logs[data-filter=error] > :not([data-level=error]) { display:none; }
.aop-jump { position:absolute; left:50%; bottom:10px; transform:translateX(-50%); display:inline-flex; align-items:center; gap:5px; height:26px; padding:0 10px; border-radius:999px;
  background:var(--color-text-primary); color:var(--color-background-primary-default); font-size:12px; font-weight:500; box-shadow:var(--shadow-xs); white-space:nowrap; }
.aop-jump[hidden] { display:none !important; }
@container (max-width:380px) { .aop-log { grid-template-columns:40px minmax(0,1fr); } .aop-log-time { display:none; } }

/* Multi-File Diff */
.aop-files { display:flex; flex-direction:column; gap:2px; }
.aop-file { display:flex; align-items:center; gap:8px; min-width:0; padding:4px 6px; border-radius:8px; transition:background-color .3s var(--aop-ease); }
.aop-file[data-state=run] { background:var(--color-background-secondary-default); }
.aop-file-path { min-width:0; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.aop-file[data-state=pending] .aop-file-path { color:var(--aop-muted); }
.aop-delta { flex:none; display:flex; gap:6px; }
.aop-add { color:var(--color-status-lime-text); }
.aop-del { color:var(--color-status-rose-text); }
.aop-diff { overflow:hidden; border-radius:12px; border:1px solid var(--color-border-button-default); }
.aop-diff-head { display:flex; justify-content:space-between; gap:10px; padding:6px 10px; border-bottom:1px solid var(--color-separator-border); background:var(--color-background-secondary-default); color:var(--aop-muted); }
.aop-diff-head > span { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.aop-diff-lines { height:184px; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; padding:4px 0; }
.aop-diff-lines:focus-visible { outline:2px solid var(--color-border-focus-ring); outline-offset:-2px; }
.aop-dl { display:grid; grid-template-columns:30px 14px minmax(0,1fr); padding-right:8px; line-height:18px; animation:aop-in .24s var(--aop-ease) both; }
.aop-dl code { white-space:pre-wrap; overflow-wrap:anywhere; font:inherit; }
.aop-dl-n { padding-right:6px; text-align:right; color:var(--aop-muted); user-select:none; }
.aop-dl-s { color:var(--aop-muted); user-select:none; }
.aop-dl[data-k=add] { background:color-mix(in srgb, var(--color-status-lime-background) 60%, transparent); }
.aop-dl[data-k=add] .aop-dl-s { color:var(--color-status-lime-text); }
.aop-dl[data-k=del] { background:color-mix(in srgb, var(--color-status-rose-background) 60%, transparent); }
.aop-dl[data-k=del] .aop-dl-s { color:var(--color-status-rose-text); }
.aop-summary { display:flex; align-items:center; gap:8px; font-size:12px; animation:aop-in .32s var(--aop-ease) both; }
.aop-summary b { font-weight:600; }

/* Plan, Then Execute */
.aop-plan { display:flex; flex-direction:column; gap:2px; }
.aop-step { display:flex; align-items:flex-start; gap:10px; padding:5px 6px; border-radius:10px; transition:background-color .3s var(--aop-ease); }
.aop-step[data-state=run] { background:var(--color-background-secondary-default); }
.aop-step-txt { min-width:0; flex:1; padding-top:1px; }
.aop-step[data-state=done] .aop-step-label { color:var(--aop-muted); }
.aop-caret { display:inline-block; width:2px; height:1em; margin-left:2px; vertical-align:-2px; border-radius:1px; background:var(--color-accent-500); animation:aop-blink 1s step-end infinite; }
@keyframes aop-blink { 50% { opacity:0 } }
.aop-subs { display:grid; grid-template-rows:0fr; margin-left:36px; transition:grid-template-rows .36s var(--aop-ease); }
.aop-subs.is-open { grid-template-rows:1fr; }
.aop-subs > ol { min-height:0; overflow:hidden; display:flex; flex-direction:column; gap:2px; }
.aop-sub-step { display:flex; align-items:flex-start; gap:8px; padding:3px 0; font-size:12px; }
.aop-sub-step .aop-glyph { width:16px; height:16px; }
.aop-sub-step .aop-glyph .aop-ic { width:11px; height:11px; }
.aop-toggle { display:flex; align-items:center; gap:3px; width:fit-content; margin-top:2px; border-radius:6px; font-size:11.5px; color:var(--aop-muted); }
.aop-toggle:hover { color:var(--color-text-primary); }
.aop-toggle .aop-ic { width:12px; height:12px; transition:transform .3s var(--aop-ease); }
.aop-toggle[aria-expanded=true] .aop-ic { transform:rotate(180deg); }

/* Agent Handoff */
.aop-crew { display:flex; align-items:flex-start; }
.aop-agent { flex:none; width:76px; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
.aop-agent-name { font-size:12px; font-weight:500; }
.aop-agent-state { font-size:11px; color:var(--aop-muted); }
.aop-crew-line { position:relative; flex:1; height:2px; margin-top:17px; overflow:hidden; border-radius:2px; background:var(--color-background-tertiary-default); }
.aop-crew-line > i { position:absolute; top:0; left:0; width:30%; height:100%; border-radius:inherit; background:var(--color-accent-500); transform:translateX(-100%); animation:aop-travel .8s var(--aop-ease) both; }
.aop-crew-line > i.is-back { animation-name:aop-travel-back; }
@keyframes aop-travel { from { transform:translateX(-100%) } to { transform:translateX(340%) } }
@keyframes aop-travel-back { from { transform:translateX(340%) } to { transform:translateX(-100%) } }
.aop-avatar { position:relative; flex:none; display:grid; place-items:center; width:36px; height:36px; border-radius:12px; border:1px solid var(--color-border-button-default); font-size:12px; font-weight:600;
  background:var(--color-background-secondary-default); color:var(--aop-muted); transition:background-color .3s var(--aop-ease), color .3s var(--aop-ease), border-color .3s var(--aop-ease); }
.aop-agent[data-state=active] .aop-avatar { background:var(--color-text-primary); border-color:var(--color-text-primary); color:var(--color-background-primary-default); }
.aop-agent[data-state=active] .aop-avatar::after { content:""; position:absolute; inset:-5px; border-radius:15px; border:2px solid var(--color-accent-500); animation:aop-ping 1.6s var(--aop-ease) infinite; }
.aop-agent[data-state=done] .aop-avatar { color:var(--color-text-primary); }
@keyframes aop-ping { from { opacity:.9; transform:scale(.92) } to { opacity:0; transform:scale(1.2) } }
.aop-feed { height:212px; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; display:flex; flex-direction:column; gap:10px; padding:2px 2px 2px 0; }
.aop-msg { display:flex; align-items:flex-start; gap:10px; animation:aop-in .42s var(--aop-ease) both; }
.aop-msg .aop-avatar { width:26px; height:26px; border-radius:9px; font-size:10.5px; }
.aop-msg-main { min-width:0; flex:1; }
.aop-msg-who { font-size:12px; font-weight:500; }
.aop-handoff { align-self:center; display:inline-flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:4px 6px; max-width:100%; padding:4px 10px; border-radius:999px;
  border:1px dashed var(--color-border-button-hover); font-size:11.5px; color:var(--aop-muted); text-align:center; animation:aop-in .42s var(--aop-ease) both; }
.aop-handoff b { font-weight:500; color:var(--color-text-primary); }

/* Context Budget Meter */
.aop-meter-top { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 6px; }
.aop-big { font-size:22px; font-weight:600; letter-spacing:-.01em; }
.aop-pct { margin-left:auto; font-weight:500; }
.aop-track { position:relative; height:10px; border-radius:999px; background:var(--color-background-tertiary-default); }
.aop-track-clip { position:absolute; inset:0; overflow:hidden; border-radius:inherit; }
.aop-seg { position:absolute; inset:0; transform:scaleX(0); transform-origin:left; transition:transform .5s var(--aop-ease), background-color .4s var(--aop-ease); }
.aop-seg[data-seg=msgs], .aop-sw[data-seg=msgs] { background:var(--color-accent-500); }
.aop-seg[data-seg=tools], .aop-sw[data-seg=tools] { background:var(--color-accent-800); }
.aop-seg[data-seg=sys], .aop-sw[data-seg=sys] { background:var(--aop-muted); }
.aop-card[data-tone=warn] .aop-seg[data-seg=msgs], .aop-card[data-tone=warn] .aop-sw[data-seg=msgs] { background:var(--color-status-orange-text); }
.aop-track.is-compacting .aop-seg[data-seg=msgs] { transition:transform .9s var(--aop-ease); animation:aop-breathe .45s ease-in-out infinite alternate; }
@keyframes aop-breathe { to { opacity:.5 } }
.aop-limit { position:absolute; top:-4px; bottom:-4px; left:80%; width:2px; border-radius:1px; background:var(--color-text-primary); }
.aop-scale { position:relative; height:14px; margin-top:-6px; font-size:10.5px; }
.aop-scale > span { position:absolute; left:80%; transform:translateX(-50%); }
.aop-legend { display:flex; flex-wrap:wrap; gap:4px 14px; font-size:12px; }
.aop-legend li { display:flex; align-items:center; gap:6px; }
.aop-sw { width:8px; height:8px; border-radius:2px; transition:background-color .4s var(--aop-ease); }

/* Dark: the light rose text sits too close to AA on dark surfaces, use the notification foreground */
.dark .aop-pill[data-tone=err], .dark [data-state=fail] .aop-glyph, .dark .aop-del, .dark .aop-dl[data-k=del] .aop-dl-s, .dark .aop-log[data-level=error] .aop-lvl { color:var(--color-notification-error-foreground); }

@media (prefers-reduced-motion: reduce) {
  .aop-card *, .aop-card *::before, .aop-card *::after { animation:none !important; transition:none !important; }
}`;
  function aopStyles() {
    if (document.getElementById('agent-ops-css')) return;
    const s = document.createElement('style'); s.id = 'agent-ops-css'; s.textContent = AOP_CSS; document.head.append(s);
  }

  /* --------------------------------------------------------------- shared */
  const AOP_ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    alert: '<path d="M12 4.5l8.5 15h-17z"/><path d="M12 10.5v3.5M12 17v.01"/>',
    dot: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
    ring: '<circle cx="12" cy="12" r="6.5"/>',
    spin: '<path d="M12 4.5a7.5 7.5 0 1 1-7.5 7.5"/>',
    retry: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    pause: '<path d="M9 6.5v11M15 6.5v11"/>',
    down: '<path d="M12 5v14M6.5 13.5L12 19l5.5-5.5"/>',
    chev: '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
    arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
    compress: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    pulse: '<path d="M3.5 12h4l2.2-5.5 4.6 11 2.2-5.5h4"/>',
    book: '<path d="M5 5.5a2 2 0 0 1 2-2h11v14H7a2 2 0 0 0-2 2z"/><path d="M5 19.5a2 2 0 0 0 2 2h11v-4"/>',
    upload: '<path d="M12 16V5M7 9.5L12 4.5l5 5"/><path d="M5 19.5h14"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v5.5L5.6 18a1.7 1.7 0 0 0 1.5 2.5h9.8a1.7 1.7 0 0 0 1.5-2.5L13.5 9V3.5"/><path d="M7.5 15h9"/>',
    shield: '<path d="M12 3.5l7 2.5v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    terminal: '<path d="M4 5h16v14H4z"/><path d="M7.5 9.5l3 2.5-3 2.5M12.5 15h4"/>',
    diff: '<path d="M8 4.5v7M4.5 8h7M13 17.5h7"/><path d="M4 20L20 4"/>',
    list: '<path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
    users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2.2 3 4.4"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
  };
  const aopIcon = (name, cls = '') => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="aop-ic ${cls}">${AOP_ICONS[name] || ''}</svg>`;

  // A wait that resolves at once under reduced motion, so a demo lands straight on its final state.
  const aopWait = (t, ms) => (REDUCE ? Promise.resolve() : t.sleep(ms));

  /** The card every demo sits in: icon, title, subtitle, a quiet clock and the status pill (the live region). */
  function aopFrame(root, { icon, title, sub = '' }) {
    aopStyles();
    const card = mk('section', 'aop-card');
    card.setAttribute('aria-label', title);
    card.innerHTML = `<header class="aop-head"><span class="aop-head-ic">${aopIcon(icon)}</span><div class="aop-head-txt"><div class="aop-title">${esc(title)}</div>${sub ? `<div class="aop-sub">${esc(sub)}</div>` : ''}</div><span class="aop-clock aop-num aop-muted" aria-hidden="true"></span><span class="aop-pill" role="status" aria-live="polite"></span></header><div class="aop-body"></div>`;
    root.append(card);
    return { card, body: $('.aop-body', card), pill: $('.aop-pill', card), clock: $('.aop-clock', card) };
  }

  const AOP_TONE_ICON = { run: 'spin', idle: 'pause', ok: 'check', warn: 'alert', err: 'x' };
  function aopPill(el, tone, text, icon = AOP_TONE_ICON[tone]) {
    el.dataset.tone = tone;
    el.innerHTML = `${aopIcon(icon, icon === 'spin' ? 'aop-spin' : '')}<span>${esc(text)}</span>`;
  }

  const AOP_STATE_ICON = { pending: 'ring', run: 'spin', done: 'check', fail: 'x', retry: 'retry', warn: 'alert' };
  /** Sets a row's state and redraws its glyph; `num` shows a step number instead of an icon. */
  function aopState(el, state, num) {
    el.dataset.state = state;
    const g = el.querySelector('.aop-glyph');
    if (g) g.innerHTML = `<span class="aop-pop">${state === 'num' ? num : aopIcon(AOP_STATE_ICON[state], state === 'run' ? 'aop-spin' : '')}</span>`;
  }

  // Swaps a one-line slot for a new span that slides in: a CSS animation, no timer.
  function aopSwap(slot, text) {
    const s = mk('span', 'aop-swap'); s.textContent = text; slot.replaceChildren(s);
  }

  const aopSecs = (ms) => (ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.floor(ms / 60000)}m ${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}s`);
  const aopK = (v) => `${(v / 1000).toFixed(1)}k`;

  /** Elapsed time on a 100 ms tick. stop(finalMs) freezes it; under reduced motion it shows finalMs. */
  function aopClock(t, el) {
    const t0 = performance.now(); el.textContent = '0.0s';
    const id = t.every(100, () => { el.textContent = aopSecs(performance.now() - t0); });
    return (finalMs) => { t.stop(id); if (REDUCE && finalMs) el.textContent = aopSecs(finalMs); };
  }

  /** Counts from → to in ~40 ms steps, calling draw(value) on each; reduced motion draws the end value. */
  async function aopCount(t, from, to, ms, draw) {
    const steps = REDUCE ? 1 : Math.max(1, Math.round(ms / 40));
    for (let i = 1; i <= steps; i++) { draw(from + ((to - from) * i) / steps); if (i < steps) await t.sleep(ms / steps); }
  }

  /** One line of a run log: a state glyph, the text and an optional figure on the right. */
  function aopEvent(list, state, text, meta = '') {
    const li = mk('li', 'aop-event');
    li.innerHTML = `<span class="aop-glyph" aria-hidden="true"></span><span class="aop-event-t"></span>${meta ? `<span class="aop-event-d aop-num aop-muted">${esc(meta)}</span>` : ''}`;
    $('.aop-event-t', li).textContent = text; aopState(li, state); list.append(li);
    return li;
  }

  /* ------------------------------------------------------- Activity Panel */
  const AOP_READ = ['package.json', 'src/app/router.tsx', 'src/api/client.ts', 'src/api/invoices.ts', 'src/types/invoice.ts', 'src/hooks/use-invoices.ts',
    'src/lib/date.ts', 'src/lib/format.ts', 'src/components/invoice-table.tsx', 'src/components/invoice-row.tsx', 'tests/date.test.ts', 'tests/invoice-table.test.tsx'];
  const AOP_EDITS = [{ file: 'src/lib/date.ts', add: 14, del: 6 }, { file: 'src/components/invoice-row.tsx', add: 5, del: 3 }, { file: 'tests/date.test.ts', add: 12, del: 0 }];
  const AOP_TESTS = ['date.test.ts › formats due dates in the account time zone', 'date.test.ts › keeps end-of-month dates', 'invoice-table.test.tsx › sorts by due date',
    'invoice-table.test.tsx › flags overdue rows', 'format.test.ts › formats currency per locale', 'api.test.ts › retries a 503 once'];

  /** A counted phase: glyph, label, n / total, a thin bar and a slot where the current item scrolls past. */
  function aopPhase(parent, label, total) {
    const row = mk('div', 'aop-phase');
    row.innerHTML = `<span class="aop-glyph" aria-hidden="true"></span><div class="aop-phase-main"><div class="aop-phase-top"><span class="aop-phase-label"></span><span class="aop-num aop-muted"><span class="aop-n">0</span> / ${total}</span></div><div class="aop-bar" aria-hidden="true"><span></span></div><div class="aop-slot aop-mono aop-muted"><span class="aop-swap">Queued</span></div></div>`;
    $('.aop-phase-label', row).textContent = label; aopState(row, 'pending'); parent.append(row);
    const n = $('.aop-n', row), fill = $('.aop-bar > span', row), slot = $('.aop-slot', row);
    return {
      state: (s) => aopState(row, s),
      note: (text) => aopSwap(slot, text),
      step(i, text) { n.textContent = i; fill.style.transform = `scaleX(${i / total})`; if (text) aopSwap(slot, text); },
      finish(state, text, note) { aopState(row, state); $('.aop-phase-label', row).textContent = text; aopSwap(slot, note); },
    };
  }

  /* --------------------------------------------------------- Cited Answer */
  const AOP_SOURCES = [
    { title: 'QUIC: A UDP-Based Multiplexed and Secure Transport', site: 'RFC 9000 · rfc-editor.org' },
    { title: 'Using TLS to Secure QUIC', site: 'RFC 9001 · rfc-editor.org' },
    { title: 'QPACK: Field Compression for HTTP/3', site: 'RFC 9204 · rfc-editor.org' },
    { title: 'HTTP/3 explained', site: 'http3-explained.haxx.se' },
  ];
  // Text runs and the source numbers that close each claim.
  const AOP_ANSWER = [
    'HTTP/3 gives every request its own QUIC stream, so a lost packet only stalls the stream it belongs to, not the whole connection', [1, 4], '.',
    ' QUIC folds the TLS 1.3 handshake into its own, which saves a round trip when a connection opens', [2], '.',
    ' When a phone moves from Wi-Fi to cellular, connection IDs let the session carry on without a new handshake', [1], '.',
    ' Header compression moves to QPACK, built to limit blocking when streams arrive out of order', [3], '.',
  ];

  /** Lights a source card and, when the cards sit beside the answer, draws a curve from the cited line to it. */
  async function aopLightSource(t, wrap, marker, card) {
    card.classList.add('is-lit', 'is-flash'); marker.classList.add('is-on');
    const svg = $('.aop-link', wrap), path = $('path', svg), dot = $('circle', svg), prose = $('.aop-prose', wrap);
    const w = wrap.getBoundingClientRect(), a = marker.getBoundingClientRect(), p = prose.getBoundingClientRect(), b = card.getBoundingClientRect();
    const drawn = !REDUCE && b.left > p.right; // stacked layout on narrow cards: the card lights up, no line
    const key = String(Number(svg.dataset.k || 0) + 1); svg.dataset.k = key;
    if (drawn) {
      const x1 = p.right - w.left + 6, y1 = a.top + a.height / 2 - w.top, x2 = b.left - w.left - 2, y2 = b.top + b.height / 2 - w.top;
      svg.classList.remove('is-drawn', 'is-fading');
      svg.setAttribute('viewBox', `0 0 ${w.width} ${w.height}`);
      path.setAttribute('d', `M${x1} ${y1} C${x1 + 14} ${y1} ${x2 - 14} ${y2} ${x2} ${y2}`);
      dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', '2.5');
      await aopWait(t, 20); svg.classList.add('is-drawn');
    }
    await aopWait(t, 420);
    card.classList.remove('is-flash');
    t.sleep(900).then(() => { if (svg.dataset.k !== key) return; svg.classList.add('is-fading'); marker.classList.remove('is-on'); });
  }

  /* ----------------------------------------------------- Release Pipeline */
  const AOP_STAGES = [
    { name: 'Build', cmd: 'bun run build', secs: 18.4, done: 'Build passed' },
    { name: 'Test', cmd: 'bun test --ci', secs: 30, retry: 12.6, why: 'checkout.spec.ts timed out after 30s', done: 'Test passed on attempt 2' },
    { name: 'Deploy', cmd: 'production · eu-west-1', secs: 22.8, done: 'Deployed to production' },
    { name: 'Verify', cmd: 'smoke checks · 6 routes', secs: 9.7, done: 'Verify passed: 6 of 6 routes healthy' },
  ];

  /* ---------------------------------------------------- Live Log Explorer */
  const AOP_LOGS = [
    ['info', '[run] started "Sync open PRs to the board"'],
    ['info', '[github] GET /repos/acme/web/pulls?state=open → 200 (312 ms)'],
    ['info', '[github] 14 open pull requests'],
    ['info', '[fs] read config/board.json (2.1 kB)'],
    ['warn', '[github] rate limit at 82% (4,100 of 5,000)'],
    ['info', '[linear] GET /issues?team=WEB → 200 (188 ms)'],
    ['info', '[match] PR #482 → WEB-311'],
    ['info', '[match] PR #487 → WEB-318'],
    ['warn', '[match] PR #490 has no linked issue, skipped'],
    ['info', '[linear] PATCH WEB-311 status=In Review → 200'],
    ['error', '[linear] PATCH WEB-318 → 409 Conflict (issue was moved)'],
    ['info', '[run] retrying WEB-318 in 2s (attempt 2 of 3)'],
    ['info', '[linear] GET WEB-318 → 200 (141 ms)'],
    ['info', '[linear] PATCH WEB-318 status=In Review → 200'],
    ['info', '[match] PR #493 → WEB-322'],
    ['warn', '[github] PR #493 checks still pending'],
    ['info', '[linear] PATCH WEB-322 status=In Progress → 200'],
    ['error', '[fs] write .cache/board-sync.json: EACCES (permission denied)'],
    ['warn', '[run] cache disabled for this run'],
    ['info', '[match] PR #495 → WEB-325'],
    ['info', '[linear] PATCH WEB-325 status=In Review → 200'],
    ['info', '[match] PR #497 → WEB-326'],
    ['info', '[linear] PATCH WEB-326 status=Done → 200'],
    ['warn', '[github] rate limit at 91% (4,550 of 5,000)'],
    ['info', '[slack] POST chat.postMessage #web-standup → ok'],
    ['info', '[run] finished: 12 updated, 1 skipped, 1 recovered (8.4 s)'],
  ];
  // Wall-clock stamp of a log line, `ms` after 14:02:07.
  const aopTime = (ms) => { const d = new Date(Date.UTC(2026, 0, 1, 14, 2, 7) + ms); return `${d.toISOString().slice(11, 23)}`; };

  /* ------------------------------------------------------ Multi-File Diff */
  const AOP_DIFF = [
    { path: 'src/server/rate-limit.ts', isNew: true, lines: [
      "+import type { Context, Next } from 'hono';",
      '+',
      '+const WINDOW_MS = 60_000;',
      '+const hits = new Map<string, number[]>();',
      '+',
      '+export function rateLimit(max = 30) {',
      '+  return async (c: Context, next: Next) => {',
      "+    const key = c.req.header('x-forwarded-for') ?? 'local';",
      '+    const now = Date.now();',
      '+    const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);',
      '+    if (recent.length >= max) {',
      "+      c.header('Retry-After', String(WINDOW_MS / 1000));",
      "+      return c.json({ error: 'Too many requests' }, 429);",
      '+    }',
      '+    hits.set(key, [...recent, now]);',
      '+    await next();',
      '+  };',
      '+}',
    ] },
    { path: 'src/server/routes/upload.ts', lines: [
      " import { Hono } from 'hono';",
      "+import { rateLimit } from '../rate-limit';",
      ' ',
      ' export const upload = new Hono();',
      ' ',
      "-upload.post('/', async (c) => {",
      "+upload.post('/', rateLimit(10), async (c) => {",
      '   const body = await c.req.parseBody();',
      '-  const file = body.file as File;',
      "-  console.log('upload', file.name);",
      '+  const file = body.file;',
      '+  if (!(file instanceof File)) {',
      "+    return c.json({ error: 'Missing file' }, 400);",
      '+  }',
      '+  if (file.size > 25 * 1024 * 1024) {',
      "+    return c.json({ error: 'File is larger than 25 MB' }, 413);",
      '+  }',
      '   const key = await store.put(file);',
      '-  return c.json({ key });',
      '+  return c.json({ key }, 201);',
      ' });',
    ] },
    { path: 'tests/server.test.ts', lines: [
      " import { describe, expect, it } from 'bun:test';",
      "-import { app } from '../src/server';",
      "+import { Hono } from 'hono';",
      "+import { rateLimit } from '../src/server/rate-limit';",
      ' ',
      "-describe('upload', () => {",
      "-  it.todo('limits requests');",
      "+describe('rateLimit', () => {",
      "+  const app = new Hono().get('/', rateLimit(2), (c) => c.text('ok'));",
      "+  const hit = () => app.request('/', { headers: { 'x-forwarded-for': '10.0.0.1' } });",
      "+  it('lets the first requests through', async () => {",
      '+    expect((await hit()).status).toBe(200);',
      '+    expect((await hit()).status).toBe(200);',
      '+  });',
      "+  it('answers 429 with Retry-After past the limit', async () => {",
      '+    const res = await hit();',
      '+    expect(res.status).toBe(429);',
      "+    expect(res.headers.get('Retry-After')).toBe('60');",
      '+  });',
      ' });',
    ] },
  ];

  /* ---------------------------------------------------- Plan, Then Execute */
  const AOP_PLAN = [
    { text: 'Reproduce the flaky checkout test locally', ms: 900 },
    { text: 'Trace the race between the cart fetch and the first render', ms: 1100 },
    { text: 'Replace the fixed 500 ms wait with a wait on the cart response', subs: ['Wait for GET /api/cart before asserting', 'Remove the fixed 500 ms sleep', 'Run the spec 20 times: 20 of 20 passed'] },
    { text: 'Run the full end-to-end suite', ms: 1300 },
    { text: 'Summarize the fix in the pull request', ms: 800 },
  ];

  /* -------------------------------------------------------- Agent Handoff */
  const AOP_CREW = [{ name: 'Researcher', mark: 'Re' }, { name: 'Writer', mark: 'Wr' }, { name: 'Reviewer', mark: 'Rv' }];
  const AOP_TURNS = [
    { by: 0, text: 'Pulled the 6 merged PRs behind offline mode. Three change what users see, and #812 notes that large attachments only sync online.' },
    { from: 0, to: 1, text: '3 user-facing changes, 1 known limit' },
    { by: 1, text: 'Offline mode is here: edits you make without a connection are saved on your device and sync as soon as you are back online.' },
    { from: 1, to: 2, text: 'Draft, 1 paragraph' },
    { by: 2, text: 'One change: say that attachments over 20 MB wait for a connection.' },
    { from: 2, to: 1, text: '1 requested change' },
    { by: 1, text: 'Added: "Attachments over 20 MB upload once you reconnect."' },
    { from: 1, to: 2, text: 'Revised draft' },
    { by: 2, text: 'Approved. Ready to publish.' },
  ];

  /* ------------------------------------------------- Context Budget Meter */
  const AOP_LIMIT = 200000;
  const AOP_SPEND = [
    { text: 'Read src/checkout (14 files)', add: 21400 },
    { text: 'Ran the e2e suite, kept the output', add: 18900 },
    { text: 'Fetched the payments API reference', add: 26300 },
    { text: 'Read 3 days of checkout logs', add: 22700 },
    { text: 'Wrote the fix in 3 files', add: 12400, after: 'compact' },
  ];

  /* ---------------------------------------------------------------- demos */
  return [
    { group: G, title: 'Activity Panel', kind: 'scene',
      desc: 'An agent run as three counted phases: file names scroll past while Reading 12 files and Editing 3 files tick up, the test count climbs, and the panel settles on a pass or, every other run, a failure naming the broken tests.',
      async run(root, t, ctx) {
        const failing = (ctx.aopActivityRuns = (Number(ctx.aopActivityRuns) || 0) + 1) % 2 === 0;
        const f = aopFrame(root, { icon: 'pulse', title: 'Agent activity', sub: 'Fix due-date formatting in invoices' });
        aopPill(f.pill, 'run', 'Reading');
        const stopClock = aopClock(t, f.clock);
        const read = aopPhase(f.body, 'Reading 12 files', AOP_READ.length);
        const edit = aopPhase(f.body, 'Editing 3 files', AOP_EDITS.length);
        const test = aopPhase(f.body, 'Running 48 tests', 48);
        await aopWait(t, 500);
        read.state('run');
        for (const [i, file] of AOP_READ.entries()) { read.step(i + 1, file); await aopWait(t, 230); }
        read.finish('done', 'Read 12 files', 'src/, tests/ and package.json');
        edit.state('run'); aopPill(f.pill, 'run', 'Editing');
        for (const [i, e] of AOP_EDITS.entries()) { edit.note(`${e.file}  +${e.add} −${e.del}`); await aopWait(t, 650); edit.step(i + 1); }
        edit.finish('done', 'Edited 3 files', '+31 −9 across 3 files');
        test.state('run'); aopPill(f.pill, 'run', 'Testing');
        for (let n = 4; n <= 48; n += 4) { test.step(n, AOP_TESTS[(n / 4 - 1) % AOP_TESTS.length]); await aopWait(t, 170); }
        stopClock(failing ? 9800 : 9600);
        const res = mk('div', 'aop-result aop-in');
        res.innerHTML = `<span class="aop-glyph" aria-hidden="true"></span><p></p>`;
        if (failing) {
          test.finish('fail', '2 of 48 tests failed', 'date.test.ts › keeps end-of-month dates');
          aopPill(f.pill, 'err', 'Failed');
          aopState(res, 'fail');
          $('p', res).innerHTML = '<b>Stopped with 2 failing tests.</b> End-of-month due dates still shift by a day in date.test.ts and invoice-table.test.tsx.';
        } else {
          test.finish('done', '48 tests passed', 'date, invoice-table, format and api suites');
          aopPill(f.pill, 'ok', 'Passed');
          aopState(res, 'done');
          $('p', res).innerHTML = '<b>Done.</b> Due dates now render in the account time zone. 3 files changed, 48 of 48 tests pass.';
        }
        f.body.append(res);
      } },

    { group: G, title: 'Cited Answer', kind: 'scene',
      desc: 'A sourced answer streams in and each citation lights its source card in the side column, with a line drawn from the cited sentence to the card; hover or focus a marker to trace it again.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'book', title: 'Answer with sources', sub: 'How does HTTP/3 cut latency on lossy mobile networks?' });
        const wrap = mk('div', 'aop-cited');
        wrap.innerHTML = '<p class="aop-prose"></p><ol class="aop-sources" aria-label="Sources"></ol><svg class="aop-link" aria-hidden="true"><path pathLength="1"></path><circle r="0"></circle></svg>';
        f.body.append(wrap);
        const prose = $('.aop-prose', wrap), list = $('.aop-sources', wrap);
        aopPill(f.pill, 'run', 'Searching');
        const cards = [];
        for (const [i, s] of AOP_SOURCES.entries()) {
          const li = mk('li', 'aop-src aop-in');
          li.innerHTML = `<span class="aop-src-n" aria-hidden="true">${i + 1}</span><div class="aop-src-body"><span class="aop-src-t"></span><span class="aop-src-s"></span><span class="aop-src-c">Not cited yet</span></div>`;
          $('.aop-src-t', li).textContent = s.title; $('.aop-src-s', li).textContent = s.site;
          list.append(li); cards.push(li);
          await aopWait(t, 180);
        }
        aopPill(f.pill, 'run', 'Writing answer');
        const cited = AOP_SOURCES.map(() => 0);
        for (const part of AOP_ANSWER) {
          if (!Array.isArray(part)) {
            for (const word of part.split(/(?<= )/)) { prose.append(word); await aopWait(t, 42); }
            continue;
          }
          for (const n of part) {
            const card = cards[n - 1];
            const b = mk('button', 'aop-cite'); b.type = 'button'; b.textContent = n;
            b.setAttribute('aria-label', `Source ${n}: ${AOP_SOURCES[n - 1].title}`);
            b.onmouseenter = b.onfocus = () => aopLightSource(t, wrap, b, card);
            prose.append(b);
            cited[n - 1] += 1;
            $('.aop-src-c', card).textContent = cited[n - 1] === 1 ? 'Cited once' : `Cited ${cited[n - 1]} times`;
            await aopLightSource(t, wrap, b, card);
          }
        }
        aopPill(f.pill, 'ok', `${cited.filter(Boolean).length} sources cited`);
      } },

    { group: G, title: 'Release Pipeline', kind: 'scene',
      desc: 'Build, test, deploy and verify run one after another with a live duration each; the test stage times out, retries once on its own and passes, and the release lands with a total time.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'upload', title: 'Release v2.14.0', sub: 'main · 8f3c2a1 → production' });
        const bar = mk('div', 'aop-bar'); bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<span></span>';
        const grid = mk('ol', 'aop-stages'); grid.setAttribute('aria-label', 'Pipeline stages');
        const events = mk('ol', 'aop-events'); events.setAttribute('aria-label', 'Pipeline events');
        f.body.append(bar, grid, events);
        const cells = AOP_STAGES.map((s) => {
          const li = mk('li', 'aop-stage');
          li.innerHTML = `<div class="aop-stage-top"><span class="aop-glyph" aria-hidden="true"></span><span class="aop-stage-name">${esc(s.name)}</span></div><span class="aop-stage-cmd aop-mono aop-muted">${esc(s.cmd)}</span><div class="aop-stage-foot"><span class="aop-stage-time aop-num">Queued</span><span class="aop-stage-note aop-muted"></span></div>`;
          aopState(li, 'pending'); grid.append(li);
          return li;
        });
        let total = 0;
        f.clock.textContent = '0.0s';
        // Runs one attempt: the stage clock climbs to `secs` (simulated) over `realMs`, the header clock follows.
        const attempt = async (cell, secs, realMs) => {
          const time = $('.aop-stage-time', cell); let s = 0;
          const id = t.every(100, () => { s = Math.min(secs, s + secs / (realMs / 100)); time.textContent = `${s.toFixed(1)}s`; f.clock.textContent = aopSecs((total + s) * 1000); });
          await aopWait(t, realMs); t.stop(id);
          time.textContent = `${secs.toFixed(1)}s`; total += secs; f.clock.textContent = aopSecs(total * 1000);
        };
        await aopWait(t, 500);
        for (const [i, s] of AOP_STAGES.entries()) {
          const cell = cells[i], note = $('.aop-stage-note', cell);
          aopState(cell, 'run'); aopPill(f.pill, 'run', `${s.name}…`);
          await attempt(cell, s.secs, s.retry ? 1500 : 1300);
          if (s.retry) {
            aopState(cell, 'fail'); note.textContent = 'Timed out';
            aopEvent(events, 'fail', `${s.name} failed: ${s.why}`); aopPill(f.pill, 'warn', 'Retrying');
            await aopWait(t, 900);
            aopState(cell, 'retry'); note.textContent = 'Attempt 2 of 2';
            aopEvent(events, 'retry', `Retrying ${s.name}, attempt 2 of 2`); aopPill(f.pill, 'run', `${s.name}, attempt 2`);
            await attempt(cell, s.retry, 1100);
            $('.aop-stage-time', cell).textContent = `${(s.secs + s.retry).toFixed(1)}s`; note.textContent = 'Passed on retry';
          }
          aopState(cell, 'done');
          $('span', bar).style.transform = `scaleX(${(i + 1) / AOP_STAGES.length})`;
          aopEvent(events, 'done', s.done, `${(s.retry || s.secs).toFixed(1)}s`);
          await aopWait(t, 260);
        }
        bar.dataset.state = 'done';
        aopEvent(events, 'done', 'Released v2.14.0', aopSecs(total * 1000));
        aopPill(f.pill, 'ok', 'Released');
      } },

    { group: G, title: 'Live Log Explorer', kind: 'scene',
      desc: 'Tool logs stream into a live viewer with level filters and per-level counts; it follows the newest line, pauses while you hover or focus it, and offers a jump back to the latest lines.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'terminal', title: 'Tool logs', sub: 'Sync open PRs to the board' });
        const LEVELS = [['all', 'All'], ['info', 'Info'], ['warn', 'Warn'], ['error', 'Error']];
        const bar = mk('div', 'aop-filters'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter by level');
        bar.innerHTML = LEVELS.map(([k, l]) => `<button type="button" class="aop-filter" data-level="${k}" aria-pressed="${k === 'all'}">${l}<span class="aop-num" data-count="${k}">0</span></button>`).join('');
        const box = mk('div', 'aop-logs-wrap');
        box.innerHTML = `<ol class="aop-logs" tabindex="0" aria-label="Log lines, newest last" data-filter="all"></ol><button type="button" class="aop-jump" hidden>${aopIcon('down')}<span></span></button>`;
        f.body.append(bar, box);
        const logs = $('.aop-logs', box), jump = $('.aop-jump', box);
        const counts = { all: 0, info: 0, warn: 0, error: 0 };
        let paused = false, ended = false, touched = false, unseen = 0;
        const toEnd = () => { logs.scrollTop = logs.scrollHeight; unseen = 0; jump.hidden = true; };
        const setFilter = (level) => {
          logs.dataset.filter = level;
          for (const b of bar.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.level === level));
          if (!paused) toEnd();
        };
        const showLive = () => { if (!ended) aopPill(f.pill, paused ? 'idle' : 'run', paused ? 'Paused' : 'Live', paused ? 'pause' : 'dot'); };
        const pause = (v) => { if (paused === v) return; paused = v; showLive(); if (!v) toEnd(); };
        bar.onclick = (e) => { const b = e.target.closest('button'); if (b) { touched = true; setFilter(b.dataset.level); } };
        box.onmouseenter = () => pause(true);
        box.onmouseleave = () => pause(false);
        box.onfocusin = () => pause(true);
        box.onfocusout = (e) => { if (!box.contains(e.relatedTarget)) pause(false); };
        jump.onclick = toEnd;
        showLive();
        let ms = 0;
        for (const [i, [level, msg]] of AOP_LOGS.entries()) {
          const li = mk('li', 'aop-log'); li.dataset.level = level;
          li.innerHTML = `<span class="aop-log-time aop-mono aop-muted">${aopTime(ms)}</span><span class="aop-lvl">${level.toUpperCase()}</span><span class="aop-log-msg aop-mono"></span>`;
          $('.aop-log-msg', li).textContent = msg;
          logs.append(li);
          counts.all += 1; counts[level] += 1;
          for (const k of ['all', level]) bar.querySelector(`[data-count="${k}"]`).textContent = counts[k];
          if (!paused) toEnd();
          else if (logs.dataset.filter === 'all' || logs.dataset.filter === level) {
            unseen += 1; jump.hidden = false; $('span', jump).textContent = `${unseen} new line${unseen > 1 ? 's' : ''}`;
          }
          // Show the filter once, unless the reader is already driving the viewer.
          if (i === 15 && !touched && !paused && !REDUCE) { setFilter('warn'); await t.sleep(2400); if (!touched) setFilter('all'); }
          const gap = 220 + ((i * 7) % 5) * 90;
          ms += gap * 1.7;
          await aopWait(t, gap);
        }
        ended = true;
        aopPill(f.pill, 'ok', `Ended · ${counts.all} lines`);
      } },

    { group: G, title: 'Multi-File Diff', kind: 'scene',
      desc: 'A changeset written file by file: each file in the list goes queued, writing, written while its diff streams line by line with live +/− counts, then the run closes on a +42 −7 · 3 files summary.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'diff', title: 'Applying changes', sub: 'Rate-limit the upload endpoint' });
        const files = mk('ul', 'aop-files'); files.setAttribute('aria-label', 'Changed files');
        const diff = mk('div', 'aop-diff');
        diff.innerHTML = '<div class="aop-diff-head aop-mono"><span class="aop-diff-path"></span><span class="aop-diff-hunk"></span></div><ol class="aop-diff-lines aop-mono" tabindex="0" aria-label="Diff of the file being written"></ol>';
        f.body.append(files, diff);
        const rows = AOP_DIFF.map((d) => {
          const li = mk('li', 'aop-file');
          li.innerHTML = `<span class="aop-glyph" aria-hidden="true"></span><span class="aop-file-path aop-mono"></span><span class="aop-delta aop-mono aop-num"><span class="aop-add">+0</span><span class="aop-del">−0</span></span>`;
          $('.aop-file-path', li).textContent = d.path; aopState(li, 'pending'); files.append(li);
          return li;
        });
        const lines = $('.aop-diff-lines', diff);
        let add = 0, del = 0;
        await aopWait(t, 400);
        for (const [i, d] of AOP_DIFF.entries()) {
          const row = rows[i];
          const kinds = d.lines.map((l) => (l[0] === '+' ? 'add' : l[0] === '-' ? 'del' : 'ctx'));
          const oldN = kinds.filter((k) => k !== 'add').length, newN = kinds.filter((k) => k !== 'del').length;
          aopState(row, 'run'); aopPill(f.pill, 'run', `Writing ${d.path.split('/').pop()}`);
          $('.aop-diff-path', diff).textContent = d.path;
          $('.aop-diff-hunk', diff).textContent = d.isNew ? `new file · @@ -0,0 +1,${newN} @@` : `@@ -1,${oldN} +1,${newN} @@`;
          lines.replaceChildren();
          let n = 0, fa = 0, fd = 0;
          for (const [j, line] of d.lines.entries()) {
            const k = kinds[j];
            if (k !== 'del') n += 1;
            const li = mk('li', 'aop-dl'); li.dataset.k = k;
            li.innerHTML = `<span class="aop-dl-n">${k === 'del' ? '' : n}</span><span class="aop-dl-s">${k === 'add' ? '+' : k === 'del' ? '−' : ''}</span><code></code>`;
            $('code', li).textContent = line.slice(1);
            lines.append(li); lines.scrollTop = lines.scrollHeight;
            if (k === 'add') { fa += 1; add += 1; }
            if (k === 'del') { fd += 1; del += 1; }
            $('.aop-add', row).textContent = `+${fa}`; $('.aop-del', row).textContent = `−${fd}`;
            await aopWait(t, k === 'ctx' ? 40 : 75);
          }
          aopState(row, 'done');
          await aopWait(t, 420);
        }
        const sum = mk('p', 'aop-summary');
        sum.innerHTML = `<span class="aop-glyph" aria-hidden="true"></span><span><b class="aop-add">+${add}</b> <b class="aop-del">−${del}</b> · ${AOP_DIFF.length} files</span>`;
        aopState(sum, 'done'); f.body.append(sum);
        aopPill(f.pill, 'ok', 'Applied');
      } },

    { group: G, title: 'Plan, Then Execute', kind: 'scene',
      desc: 'The agent writes a five-step plan word by word, then runs it: each number turns into a spinner and a check, the third step unfolds its sub-steps while they run and folds them away when they are done.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'list', title: 'Fix the flaky checkout test', sub: 'Plan first, then run each step' });
        aopPill(f.pill, 'run', 'Planning');
        const list = mk('ol', 'aop-plan'); list.setAttribute('aria-label', 'Plan'); f.body.append(list);
        const steps = [];
        for (const [i, s] of AOP_PLAN.entries()) {
          const li = mk('li', 'aop-in');
          li.innerHTML = '<div class="aop-step"><span class="aop-glyph" aria-hidden="true"></span><div class="aop-step-txt"><span class="aop-step-label"></span><span class="aop-caret" aria-hidden="true"></span></div></div>';
          list.append(li);
          const step = $('.aop-step', li); aopState(step, 'num', i + 1);
          const label = $('.aop-step-label', li);
          for (const word of s.text.split(/(?<= )/)) { label.append(word); await aopWait(t, 38); }
          $('.aop-caret', li).remove();
          steps.push({ li, step });
        }
        await aopWait(t, 500);
        for (const [i, s] of AOP_PLAN.entries()) {
          const { li, step } = steps[i];
          aopState(step, 'run'); aopPill(f.pill, 'run', `Step ${i + 1} of ${AOP_PLAN.length}`);
          if (s.subs) {
            const box = mk('div', 'aop-subs'); box.id = `aop-subs-${i}-${Date.now()}`;
            box.innerHTML = '<ol aria-label="Sub-steps"></ol>'; li.append(box);
            const subs = s.subs.map((text) => {
              const r = mk('li', 'aop-sub-step'); r.innerHTML = '<span class="aop-glyph" aria-hidden="true"></span><span></span>';
              r.lastChild.textContent = text; aopState(r, 'pending'); $('ol', box).append(r);
              return r;
            });
            await aopWait(t, 20); box.classList.add('is-open');
            for (const r of subs) { await aopWait(t, 280); aopState(r, 'run'); await aopWait(t, 700); aopState(r, 'done'); }
            await aopWait(t, 450); box.classList.remove('is-open');
            const toggle = mk('button', 'aop-toggle'); toggle.type = 'button';
            toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', box.id);
            toggle.innerHTML = `${s.subs.length} sub-steps ${aopIcon('chev')}`;
            toggle.onclick = () => toggle.setAttribute('aria-expanded', String(box.classList.toggle('is-open')));
            $('.aop-step-txt', step).append(toggle);
          } else await aopWait(t, s.ms);
          aopState(step, 'done');
        }
        aopPill(f.pill, 'ok', `Done · ${AOP_PLAN.length} of ${AOP_PLAN.length}`);
        const res = mk('div', 'aop-result aop-in');
        res.innerHTML = '<span class="aop-glyph" aria-hidden="true"></span><p><b>Fixed.</b> The checkout spec now waits for the cart response instead of sleeping 500 ms. It passed 20 of 20 local runs and the full suite is green.</p>';
        aopState(res, 'done'); f.body.append(res);
      } },

    { group: G, title: 'Agent Handoff', kind: 'scene',
      desc: 'A Researcher, a Writer and a Reviewer pass one task along: the active agent pulses, each handoff travels down the line with a short note, and a requested change sends the draft back once before approval.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'users', title: 'Release note for offline mode', sub: '3 agents, one task' });
        const crew = mk('div', 'aop-crew'); crew.setAttribute('aria-label', 'Agents');
        crew.innerHTML = AOP_CREW.map((a, i) => `${i ? '<span class="aop-crew-line" aria-hidden="true"></span>' : ''}<div class="aop-agent" data-state="waiting"><span class="aop-avatar" aria-hidden="true">${a.mark}</span><span class="aop-agent-name">${a.name}</span><span class="aop-agent-state">Waiting</span></div>`).join('');
        const feed = mk('ol', 'aop-feed'); feed.setAttribute('aria-label', 'Conversation between agents');
        f.body.append(crew, feed);
        const agents = [...crew.querySelectorAll('.aop-agent')], lines = [...crew.querySelectorAll('.aop-crew-line')];
        const mark = (i, state, word) => { agents[i].dataset.state = state; $('.aop-agent-state', agents[i]).textContent = word; };
        const follow = () => { feed.scrollTop = feed.scrollHeight; };
        await aopWait(t, 400);
        for (const turn of AOP_TURNS) {
          if (turn.by !== undefined) {
            const a = AOP_CREW[turn.by];
            mark(turn.by, 'active', 'Working'); aopPill(f.pill, 'run', `${a.name} is working`);
            const li = mk('li', 'aop-msg');
            li.innerHTML = `<span class="aop-avatar" aria-hidden="true">${a.mark}</span><div class="aop-msg-main"><div class="aop-msg-who">${a.name}</div><p></p></div>`;
            feed.append(li); follow();
            const p = $('p', li);
            await aopWait(t, 500);
            for (const word of turn.text.split(/(?<= )/)) { p.append(word); follow(); await aopWait(t, 34); }
            await aopWait(t, 450);
            continue;
          }
          const line = lines[Math.min(turn.from, turn.to)];
          line.replaceChildren(mk('i', turn.to < turn.from ? 'is-back' : ''));
          mark(turn.from, 'done', turn.from === 0 ? 'Done' : 'Waiting');
          const li = mk('li', 'aop-handoff');
          li.innerHTML = `${aopIcon('arrow')}<span><b>${AOP_CREW[turn.from].name}</b> handed off to <b>${AOP_CREW[turn.to].name}</b></span><span></span>`;
          li.lastChild.textContent = `· ${turn.text}`;
          feed.append(li); follow();
          await aopWait(t, 800);
        }
        AOP_CREW.forEach((_, i) => mark(i, 'done', 'Done'));
        aopPill(f.pill, 'ok', 'Approved');
      } },

    { group: G, title: 'Context Budget Meter', kind: 'scene',
      desc: 'A context-window gauge fills as the agent reads files and tool output, turns orange past 80%, then compacts the older turns into a summary and drops back before the run finishes.',
      async run(root, t) {
        const f = aopFrame(root, { icon: 'gauge', title: 'Context window', sub: 'Fable 5 · 200k tokens' });
        const top = mk('div', 'aop-meter-top');
        top.innerHTML = '<span class="aop-big aop-num">0.0k</span><span class="aop-muted">of 200k tokens</span><span class="aop-pct aop-num">0%</span>';
        const track = mk('div', 'aop-track');
        track.setAttribute('role', 'meter'); track.setAttribute('aria-label', 'Context used');
        track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', String(AOP_LIMIT));
        track.innerHTML = '<div class="aop-track-clip"><span class="aop-seg" data-seg="msgs"></span><span class="aop-seg" data-seg="tools"></span><span class="aop-seg" data-seg="sys"></span></div><span class="aop-limit" aria-hidden="true"></span>';
        const scale = mk('div', 'aop-scale aop-muted aop-num'); scale.setAttribute('aria-hidden', 'true'); scale.innerHTML = '<span>80%</span>';
        const legend = mk('ul', 'aop-legend'); legend.setAttribute('aria-label', 'Breakdown');
        legend.innerHTML = [['sys', 'System'], ['tools', 'Tool definitions'], ['msgs', 'Messages']].map(([k, l]) => `<li><span class="aop-sw" data-seg="${k}" aria-hidden="true"></span>${l}<span class="aop-num aop-muted" data-v="${k}"></span></li>`).join('');
        const events = mk('ol', 'aop-events'); events.setAttribute('aria-label', 'What filled the context');
        f.body.append(top, track, scale, legend, events);
        const big = $('.aop-big', top), pct = $('.aop-pct', top);
        const b = { sys: 4200, tools: 12000, msgs: 58000 };
        let shown = 0, warned = false;
        // Moves the stacked bars (transform only), the legend and the meter value, then counts the total.
        const paint = async (ms = 480) => {
          const total = b.sys + b.tools + b.msgs, share = Math.round((total / AOP_LIMIT) * 100);
          track.querySelector('[data-seg=sys]').style.transform = `scaleX(${b.sys / AOP_LIMIT})`;
          track.querySelector('[data-seg=tools]').style.transform = `scaleX(${(b.sys + b.tools) / AOP_LIMIT})`;
          track.querySelector('[data-seg=msgs]').style.transform = `scaleX(${total / AOP_LIMIT})`;
          for (const k of ['sys', 'tools', 'msgs']) legend.querySelector(`[data-v=${k}]`).textContent = aopK(b[k]);
          track.setAttribute('aria-valuenow', String(total)); track.setAttribute('aria-valuetext', `${aopK(total)} of 200k tokens, ${share}%`);
          await aopCount(t, shown, total, ms, (v) => { big.textContent = aopK(v); pct.textContent = `${Math.round((v / AOP_LIMIT) * 100)}%`; });
          shown = total;
          return share;
        };
        aopPill(f.pill, 'ok', 'Healthy');
        await aopWait(t, 300);
        await paint(600);
        for (const e of AOP_SPEND) {
          if (e.after === 'compact') {
            await aopWait(t, 900);
            aopPill(f.pill, 'run', 'Compacting'); track.classList.add('is-compacting');
            const ev = aopEvent(events, 'run', 'Summarizing 31 older turns');
            await aopWait(t, 1400);
            const before = b.msgs; b.msgs = 31600;
            const share = await paint(900);
            track.classList.remove('is-compacting'); delete f.card.dataset.tone;
            aopState(ev, 'done'); $('.aop-event-t', ev).textContent = `Compacted messages ${aopK(before)} → ${aopK(b.msgs)}`;
            aopPill(f.pill, 'ok', `Compacted · ${share}%`);
          }
          await aopWait(t, 700);
          b.msgs += e.add;
          aopEvent(events, 'done', e.text, `+${aopK(e.add)}`);
          const share = await paint();
          if (share >= 80 && !warned) {
            warned = true; f.card.dataset.tone = 'warn';
            aopPill(f.pill, 'warn', `Near limit · ${share}%`);
            aopEvent(events, 'warn', 'Past 80% of the context window');
          }
        }
        aopPill(f.pill, 'ok', `Healthy · ${Math.round((shown / AOP_LIMIT) * 100)}%`);
      } },
  ];
}
