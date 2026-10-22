/* Streaming / agent-response demos, part 2 — Chat (foundation.css tokens already live in .lib-chat), Assist
 * (+ shadcn marker / bubble / message primitives), Tool cards and Transitions, in vanilla JS.
 * Default export: a factory that receives the shared helpers*/
export default function pack(h) {
  'use strict';
  const { mk, $, $$, esc, REDUCE, frame, tick, lu, LUCIDE, EASE_BU, EASE_OUT } = h;
  const buStage = h.buStage;

  /* ------------------------------------------------------------ icons */
  Object.assign(LUCIDE, {
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'at-sign': '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    'folder-tree': '<path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/>',
    'panel-right-close': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    circle: '<circle cx="12" cy="12" r="10"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    'message-circle-question': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
    'image-off': '<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    'cloud-rain': '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
    'cloud-rain-wind': '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m9.2 22 3-7"/><path d="m9 13-3 7"/><path d="m17 13-3 7"/>',
    'cloud-sun': '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  });

  /* ------------------------------------------------------------ scoped CSS (plain CSS, injected once) */
  const CSS = `
/* Chat additions — foundation.css keyframes/tokens not shipped by the base scope */
.lib-chat { --orange-tint:oklch(0.964 0.021 67.581); --tooltip-bg:oklch(0.272 0.008 264.435); --tooltip-muted:oklch(0.731 0.008 260.731);
  --chat-shadow-raised:0 0 0 1px var(--line), 0 2px 4px oklch(0 0 0 / 0.04), 0 6px 16px oklch(0 0 0 / 0.08); }
.dark .lib-chat { --orange-tint:oklch(0.746 0.156 55.642 / 0.14); --tooltip-bg:oklch(0.182 0.004 264.459); --chat-shadow-raised:0 0 0 1px oklch(1 0 0 / 0.13), 0 2px 10px oklch(0 0 0 / 0.22); }
.lib-chat .chat-raised { box-shadow:var(--chat-shadow-raised); }
@keyframes chat-pixel-on { 0%,100% { opacity:.15 } 18%,42% { opacity:1 } 62% { opacity:.15 } }
@keyframes chat-eq-bounce { 0%,100% { transform:scaleY(.35) } 50% { transform:scaleY(1) } }
@keyframes chat-sweep { 0% { opacity:0; background-position:110% 0 } 25% { opacity:.95 } 100% { opacity:0; background-position:-10% 0 } }

/* Assist — shadcn neutral primary / destructive for buttons and mention chips */
.lib-assist { --primary:oklch(0.205 0 0); --primary-foreground:oklch(0.985 0 0); --destructive:oklch(0.577 0.245 27.325); --accent:oklch(0.97 0 0); }
.dark .lib-assist { --primary:oklch(0.922 0 0); --primary-foreground:oklch(0.205 0 0); --destructive:oklch(0.704 0.191 22.216); --accent:oklch(0.269 0 0); }
.lib-assist .assist-primary { background:var(--primary); color:var(--primary-foreground); }
.lib-assist .assist-destructive { color:var(--destructive); }
.lib-assist .assist-outline { border:1px solid var(--border); background:var(--background); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-assist .assist-outline:hover, .lib-assist .assist-ghost:hover { background:var(--accent); }
.lib-assist .assist-input { border:1px solid var(--border); background:var(--background); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.dark .lib-assist .assist-input { background:oklch(1 0 0 / .045); }
.lib-assist .assist-pop { background:var(--background); box-shadow:0 0 0 1px oklch(0.145 0 0 / .1), 0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1); }
.dark .lib-assist .assist-pop { box-shadow:0 0 0 1px oklch(1 0 0 / .1), 0 4px 6px -1px rgb(0 0 0 / .3); }
.lib-assist .assist-md code { border-radius:4px; background:var(--muted); padding:1px 4px; font-family:"Geist Mono",ui-monospace,monospace; font-size:.85em; }
.lib-assist .assist-md pre { margin:.5rem 0; overflow-x:auto; border-radius:10px; border:1px solid var(--border); padding:10px 12px; font-size:12px; line-height:1.55; }

/* Tool cards — :root / .dark (tint 106), Public Sans + JetBrains Mono */
.lib-cards { --tint:106; --background:oklch(.992 .002 106); --foreground:oklch(.145 .006 106); --card:oklch(.992 .002 106); --card-foreground:oklch(.145 .006 106);
  --primary:oklch(.205 .006 106); --primary-foreground:oklch(.985 .003 106); --secondary:oklch(.97 .004 106); --secondary-foreground:oklch(.205 .006 106);
  --muted:oklch(.97 .004 106); --muted-foreground:oklch(.556 .007 106); --accent:oklch(.97 .004 106); --accent-foreground:oklch(.205 .006 106);
  --destructive:#e40014; --border:oklch(.922 .005 106); --input:oklch(.922 .005 106); --ring:oklch(.708 .006 106);
  --chart-1:#f05100; --chart-2:#009588; --chart-3:#104e64; --chart-4:#fcbb00; --chart-5:#f99c00;
  --sh-fg:#070707; --sh-kw:#fc2b73; --sh-str:#199f43; --sh-fn:#7b43f8; --sh-num:#1ca1c7; --sh-com:#84848a; --sh-tag:#d52c36; --sh-type:#c635e4; --sh-punc:#79797f;
  font-family:"Public Sans",ui-sans-serif,system-ui,sans-serif; background:var(--background); color:var(--foreground); box-shadow:inset 0 0 0 1px var(--border); }
.dark .lib-cards { --background:oklch(.17 .003 106); --foreground:oklch(.985 .002 106); --card:oklch(.215 .003 106); --card-foreground:oklch(.985 .002 106);
  --primary:oklch(.922 .002 106); --primary-foreground:oklch(.215 .003 106); --secondary:oklch(.275 .004 106); --secondary-foreground:oklch(.985 .002 106);
  --muted:oklch(.275 .004 106); --muted-foreground:oklch(.708 .004 106); --accent:oklch(.275 .004 106); --accent-foreground:oklch(.985 .002 106);
  --destructive:#ff6568; --border:oklch(.985 .002 106 / 10%); --input:oklch(.985 .002 106 / 15%); --ring:oklch(.556 .004 106);
  --chart-1:#fc5d00; --chart-2:#00a295; --chart-3:#2e7f9e;
  --sh-fg:#fbfbfb; --sh-kw:#ff678d; --sh-str:#5ecc71; --sh-fn:#9d6afb; --sh-num:#68cdf2; --sh-tag:#ff6762; --sh-type:#d568ea; }
.lib-cards .font-mono, .lib-cards code, .lib-cards pre { font-family:"JetBrains Mono",ui-monospace,"SF Mono",monospace; }
.lib-cards .tu-card { background:var(--card); color:var(--card-foreground); border:1px solid var(--border); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-cards .tu-card-60 { background:color-mix(in oklab, var(--card) 60%, transparent); border:1px solid var(--border); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-cards .tu-pop { background:var(--card); color:var(--card-foreground); border:1px solid var(--border); box-shadow:0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1); }
.lib-cards .tu-sep { height:1px; flex-shrink:0; background:var(--border); }
.lib-cards .tu-primary { color:var(--primary); } .lib-cards .tu-destructive { color:var(--destructive); }
.lib-cards .tu-bg-primary { background:var(--primary); color:var(--primary-foreground); border-color:var(--primary); }
.lib-cards .tu-bg-destructive { background:var(--destructive); color:#fff; border-color:var(--destructive); }
.lib-cards .tu-bg-primary-5 { background:color-mix(in oklab, var(--primary) 5%, transparent); }
.lib-cards .tu-bg-primary-10 { background:color-mix(in oklab, var(--primary) 10%, transparent); color:var(--primary); }
.lib-cards .tu-bg-destructive-10 { background:color-mix(in oklab, var(--destructive) 10%, transparent); color:var(--destructive); }
.lib-cards .tu-ring { box-shadow:0 0 0 4px color-mix(in oklab, var(--primary) 10%, transparent); }
.lib-cards .tu-btn { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; white-space:nowrap; border-radius:9999px; font-size:.875rem; font-weight:500; height:2.25rem; padding:0 1rem; transition:background-color .15s, color .15s, box-shadow .15s, transform .15s; outline:none; }
.lib-cards .tu-btn:disabled { opacity:.5; pointer-events:none; }
.lib-cards .tu-btn:active { transform:scale(.97); }
.lib-cards .tu-btn-default { background:var(--primary); color:var(--primary-foreground); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-cards .tu-btn-default:hover { background:color-mix(in oklab, var(--primary) 90%, transparent); }
.lib-cards .tu-btn-ghost:hover, .lib-cards .tu-btn-ghost.is-hover { background:var(--accent); color:var(--accent-foreground); }
.lib-cards .tu-btn-outline { border:1px solid var(--border); background:var(--background); box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-cards .tu-btn-outline:hover { background:var(--accent); }
.lib-cards .tu-btn-secondary { background:var(--secondary); color:var(--secondary-foreground); }
.lib-cards .tu-btn-destructive { background:var(--destructive); color:#fff; }
.lib-cards .tu-actions { container-type:inline-size; container-name:actions; }
.lib-cards .tu-actions-row { display:flex; flex-direction:column; gap:.75rem; }
.lib-cards .tu-actions-row .tu-btn { min-height:2.75rem; width:100%; font-size:1rem; }
@container actions (min-width: 24rem) {
  .lib-cards .tu-actions-row { flex-direction:row; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:.5rem; }
  .lib-cards .tu-actions-row .tu-btn { min-height:0; width:auto; height:auto; padding:.5rem .75rem; font-size:.875rem; }
}
.lib-cards .tu-shimmer { background-image:linear-gradient(90deg, currentColor 0%, currentColor 38%, color-mix(in oklab, currentColor 25%, transparent) 50%, currentColor 62%, currentColor 100%);
  background-size:300% 100%; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:tu-shimmer 2.2s linear infinite; }
@keyframes tu-shimmer { from { background-position:100% 0 } to { background-position:0 0 } }
@keyframes tu-in { from { opacity:0; filter:blur(4px); transform:scale(.95) } to { opacity:1; filter:blur(0); transform:none } }
@keyframes tu-rise { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
@keyframes tu-zoom { from { opacity:0; transform:scale(.75) } to { opacity:1; transform:none } }
@keyframes tu-from-right { from { opacity:0; filter:blur(4px); transform:translateX(1rem) } to { opacity:1; filter:blur(0); transform:none } }
@keyframes tu-to-left { to { opacity:0; filter:blur(4px); transform:translateX(-1rem) } }
@keyframes tu-slide-up { from { opacity:0; transform:translateY(3rem) } to { opacity:1; transform:none } }
@keyframes tu-pulse-glow { 0%,100% { opacity:1 } 50% { opacity:.5 } }
.lib-cards .tu-in { animation:tu-in 300ms cubic-bezier(0.16,1,0.3,1) both; }
.lib-cards .tu-rise { animation:tu-rise 320ms cubic-bezier(0.16,1,0.3,1) both; }
.lib-cards .sh-kw { color:var(--sh-kw) } .lib-cards .sh-str { color:var(--sh-str) } .lib-cards .sh-fn { color:var(--sh-fn) } .lib-cards .sh-num { color:var(--sh-num) }
.lib-cards .sh-com { color:var(--sh-com); font-style:italic } .lib-cards .sh-tag { color:var(--sh-tag) } .lib-cards .sh-punc { color:var(--sh-punc) } .lib-cards .sh-type { color:var(--sh-type) }
.lib-cards .tu-switch { position:relative; display:inline-flex; height:1.15rem; width:2rem; flex-shrink:0; border-radius:9999px; background:var(--input); transition:background-color .2s; box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); }
.lib-cards .tu-switch[aria-checked="true"] { background:var(--primary); }
.lib-cards .tu-switch::after { content:""; position:absolute; top:50%; left:2px; width:.85rem; height:.85rem; border-radius:9999px; background:var(--background); transform:translateY(-50%); transition:transform .2s; }
.dark .lib-cards .tu-switch[aria-checked="false"]::after { background:var(--foreground); }
.dark .lib-cards .tu-switch[aria-checked="true"]::after { background:var(--primary-foreground); }
.lib-cards .tu-switch[aria-checked="true"]::after { transform:translate(calc(2rem - .85rem - 6px), -50%); }
.lib-cards .tu-toggle[data-on="true"] { background:var(--accent); color:var(--accent-foreground); }
.tu-rain { position:absolute; inset:-20% 0 0; pointer-events:none; opacity:.55;
  background-image:repeating-linear-gradient(103deg, transparent 0 9px, rgba(190,210,255,.35) 9px 10px, transparent 10px 23px), repeating-linear-gradient(100deg, transparent 0 15px, rgba(190,210,255,.22) 15px 16px, transparent 16px 37px);
  background-size:100% 140px, 100% 210px; animation:tu-rain .55s linear infinite; }
@keyframes tu-rain { to { background-position:-30px 140px, -45px 210px } }

/* Transitions — P28 thinking states, P29 reasoning stream, P30 streaming text, P33 matrix dot loaders */
.lib-transitions { --td-stage:#f9f9f9; --td-surface:#ffffff; --td-text:#2d2d2d; --td-ring:rgba(0,0,0,.06); --td-ease-smooth:cubic-bezier(0.22,1,0.36,1);
  --p28-base:#7c7c7c; --p28-highlight:#0d0d0d; --p33-base:#d9d9d9; --p33-active:#85858f;
  font-family:"Inter",ui-sans-serif,system-ui,sans-serif; background:var(--td-stage); color:var(--td-text); box-shadow:inset 0 0 0 1px var(--td-ring); }
.dark .lib-transitions { --td-stage:#131313; --td-surface:#181818; --td-text:#c6c6c6; --td-ring:rgba(255,255,255,.08); --p28-base:#9a9a9a; --p28-highlight:#f5f5f5; --p33-base:#3a3a3e; --p33-active:#b8b8c2; }
.td-swap { position:relative; display:inline-block; text-align:center; line-height:18px; }
.td-sizer { display:block; visibility:hidden; white-space:nowrap; font-weight:500; font-size:13px; line-height:18px; }
.td-think { position:absolute; top:0; left:0; right:0; display:block; font-weight:500; font-size:13px; line-height:18px; color:var(--p28-base); white-space:nowrap;
  transform:translateY(0); filter:blur(0); opacity:1; transition:transform 150ms ease-in-out, filter 150ms ease-in-out, opacity 150ms ease-in-out; will-change:transform,filter,opacity; }
.td-think::before { content:attr(data-text); position:absolute; inset:0; pointer-events:none;
  background-image:linear-gradient(90deg, transparent 0%, transparent 40%, var(--p28-highlight) 50%, transparent 60%, transparent 100%);
  background-size:400% 100%; background-repeat:no-repeat; -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent; animation:td-shimmer 2000ms linear infinite; }
@keyframes td-shimmer { 0% { background-position:100% 0 } 100% { background-position:0% 0 } }
.td-think.is-exit { transform:translateY(-8px); filter:blur(2px); opacity:0; }
.td-think.is-enter-start { transition:none; transform:translateY(8px); filter:blur(2px); opacity:0; }
.td-reason-card { width:256px; max-width:100%; height:144px; background:var(--td-surface); border-radius:12px; box-shadow:0 0 0 1px var(--td-ring); overflow:hidden; position:relative; }
.td-reason-viewport { position:absolute; inset:0 16px; overflow:hidden;
  -webkit-mask-image:linear-gradient(transparent 0, black 28px, black calc(100% - 28px), transparent 100%); mask-image:linear-gradient(transparent 0, black 28px, black calc(100% - 28px), transparent 100%); }
.td-reason-scroll { position:absolute; left:0; right:0; top:14px; transform:translateY(0); will-change:transform; }
.td-reason-text { font-size:13px; line-height:1.4; color:var(--td-text); } .td-reason-text p { margin:0 0 18.2px; }
.td-stream { width:224px; max-width:100%; font-size:13px; line-height:1.4; color:var(--td-text); }
.td-w { opacity:0; filter:blur(1px); transition:opacity 350ms var(--td-ease-smooth), filter 350ms var(--td-ease-smooth); }
.td-w.is-in { opacity:1; filter:blur(0); }
.td-matrix { display:grid; grid-template-columns:repeat(4, var(--dot, 2px)); grid-auto-rows:var(--dot, 2px); gap:var(--dot, 2px); }
.td-matrix i { display:block; background:var(--p33-base); animation:td-pulse 1200ms ease-in-out infinite; animation-delay:calc(var(--d, 0) * 1ms); }
.td-matrix[data-rounded="true"] i { border-radius:9999px; }
.td-matrix i.is-gap { visibility:hidden; animation:none; }
@keyframes td-pulse { 0%,45%,100% { background-color:var(--p33-base) } 15% { background-color:var(--p33-active) } }
@media (prefers-reduced-motion: reduce) { .td-think::before, .td-matrix i, .tu-rain, .lib-cards .tu-shimmer { animation:none } }
`;
  if (!document.getElementById('pack-chat-assist-cards-css')) {
    const st = document.createElement('style'); st.id = 'pack-chat-assist-cards-css'; st.textContent = CSS; document.head.append(st);
    const font = document.createElement('link'); font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300..700&display=swap'; document.head.append(font);
  }

  /* ------------------------------------------------------------ shared helpers */
  /** Applies a CSS animation unless the user asked for reduced motion. */
  const ani = (el, css) => { if (!REDUCE) el.style.animation = css; return el; };
  /** Presses a control the way a pointer would: a short scale-down, then a real click. */
  async function press(el, t, scale = 0.96) {
    if (!el || t.dead) return;
    const prev = el.style.transform; el.style.transform = `scale(${scale})`; await t.sleep(110); el.style.transform = prev; el.click();
  }
  /** Writes `text` into an input/textarea one character at a time, firing input events. */
  async function typeInto(input, text, t, ms = 38) {
    for (const ch of text) { input.value += ch; input.dispatchEvent(new Event('input', { bubbles: true })); await t.sleep(ms * (0.7 + Math.random() * 0.6)); }
  }
  /** A grid-rows disclosure: `set(open)` animates between 0fr and 1fr. */
  function rowsDisclosure(open, cls = 'duration-300', ease = EASE_BU) {
    const g = mk('div', `grid transition-[grid-template-rows,opacity] ${cls}`); Object.assign(g.style, { gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? '1' : '0', transitionTimingFunction: ease });
    g.innerHTML = '<div class="min-h-0 overflow-hidden"></div>'; g.inner = g.firstElementChild;
    g.set = (o) => { g.style.gridTemplateRows = o ? '1fr' : '0fr'; g.style.opacity = o ? '1' : '0'; };
    return g;
  }
  const svg = (inner, size = 14, sw = 2, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 ${extra}">${inner}</svg>`;

  /* Chat atoms */
  const buShimmer = (text, cls = '', dur = 1.8) => `<span class="inline-block bg-clip-text text-transparent ${cls}" style="background-image:linear-gradient(90deg,var(--ink-3) 35%,var(--ink) 50%,var(--ink-3) 65%);background-size:200% 100%;animation:chat-shimmer-text ${dur}s linear infinite">${esc(text)}</span>`;
  const BU_BTN = 'inline-flex items-center justify-center font-medium select-none transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50';
  const BU_SIZE = { xs: 'h-7 rounded-full px-2.5 text-[12px] font-normal leading-none gap-1', sm: 'h-[27px] rounded-full px-3 text-[13px] leading-none gap-1.5' };
  const FILLED = 'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]';
  const BU_VAR = {
    primary: `bg-ink text-[var(--canvas)] hover:opacity-90 ${FILLED}`, secondary: 'bg-surface text-ink chat-btn-shadow hover:bg-inset',
    ghost: 'bg-hover-2 text-ink hover:bg-line-strong', accent: `bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)] ${FILLED}`,
    success: `bg-green text-white hover:brightness-95 ${FILLED}`, quiet: 'text-ink hover:bg-hover',
  };
  const buBtn = (variant, size, html, cls = '') => { const b = mk('button', `${BU_BTN} ${BU_SIZE[size]} ${BU_VAR[variant]} ${cls}`, html); b.type = 'button'; b.dataset.variant = variant; return b; };
  const buSetVariant = (b, variant) => { b.classList.remove(...BU_VAR[b.dataset.variant].split(' ')); b.classList.add(...BU_VAR[variant].split(' ')); b.dataset.variant = variant; };
  /** GlideMenu: one highlight layer that glides to whichever row is "hovered". */
  function glide(container, highlightCls = 'inset-x-0 rounded-[8px] bg-hover') {
    container.classList.add('relative');
    const hl = mk('span', `pointer-events-none absolute ${highlightCls}`); hl.setAttribute('aria-hidden', 'true');
    Object.assign(hl.style, { top: '0px', height: '0px', opacity: '0', transition: 'top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease' });
    container.prepend(hl);
    const to = (row) => { if (!row) { hl.style.opacity = '0'; return; } hl.style.top = row.offsetTop + 'px'; hl.style.height = row.offsetHeight + 'px'; hl.style.opacity = '1'; };
    container.addEventListener('mouseover', (e) => { const r = e.target.closest('[data-menu-row]'); if (r && container.contains(r)) to(r); });
    container.addEventListener('mouseleave', () => to(null));
    return { to, hl };
  }

  /* Assist atoms */
  const saiStage = (root, cls = '') => { const s = mk('div', `lib-assist flex min-h-[460px] w-full justify-center rounded-[20px] px-4 py-8 sm:px-6 ${cls}`); root.append(s); return s; };
  const saiChev = (open) => lu('chevron-down', `size-3.5 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`);
  const saiUser = (text) => { const m = mk('div', 'flex w-full min-w-0 justify-end text-sm'); m.innerHTML = `<div class="max-w-[80%] min-w-0 overflow-hidden rounded-xl border border-transparent bg-secondary px-3 py-2 text-sm leading-relaxed text-secondary-foreground">${esc(text)}</div>`; return m; };
  /** Collapsible header + grid-rows body, the shape shared by Reasoning, Tool and Worked. */
  function saiCollapsible(label, open, { pulse = false, extra = '' } = {}) {
    const wrap = mk('div', 'not-prose my-1 w-full min-w-0');
    const trig = mk('button', 'group inline-flex max-w-full cursor-pointer items-center gap-1 text-sm text-muted-foreground tabular-nums transition-colors hover:text-foreground'); trig.type = 'button';
    trig.innerHTML = `<span class="assist-label truncate ${pulse ? 'animate-pulse' : ''}">${esc(label)}</span><span class="assist-extra contents">${extra}</span>${saiChev(open)}`;
    const body = rowsDisclosure(open, 'duration-200', 'ease-out');
    let isOpen = open;
    const set = (o) => { isOpen = o; body.set(o); const c = $('svg', trig); c.classList.toggle('rotate-0', o); c.classList.toggle('-rotate-90', !o); trig.setAttribute('aria-expanded', String(o)); };
    trig.onclick = () => set(!isOpen);
    wrap.append(trig, body);
    return { el: wrap, trig, body: body.inner, set, label: (txt, p) => { const l = $('.assist-label', trig); l.textContent = txt; l.classList.toggle('animate-pulse', !!p); }, extra: (html) => { $('.assist-extra', trig).innerHTML = html; }, get open() { return isOpen; } };
  }
  const saiPre = (v) => `<pre class="overflow-x-auto font-mono text-xs leading-relaxed">${esc(typeof v === 'string' ? v : JSON.stringify(v, null, 2))}</pre>`;
  /** Assist Tool: "Readable Name · input summary", pulsing while it runs. */
  function saiTool(name, input, { open = false } = {}) {
    const readable = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const sum = input.command || input.path || input.pattern || input.query;
    const c = saiCollapsible(sum ? `${readable} · ${sum.length > 72 ? sum.slice(0, 71) + '…' : sum}` : readable, open, { pulse: true });
    c.body.className = 'flex min-h-0 flex-col gap-1 overflow-hidden py-1 text-sm text-muted-foreground';
    c.body.innerHTML = `<div class="flex flex-col gap-0.5 overflow-hidden"><p class="text-xs text-muted-foreground">Input</p>${saiPre(input)}</div>`;
    c.done = (output) => { c.label($('.assist-label', c.trig).textContent, false); c.body.insertAdjacentHTML('beforeend', `<div class="flex flex-col gap-0.5 overflow-x-auto text-xs text-foreground"><p class="text-xs text-muted-foreground">Output</p>${saiPre(output)}</div>`); };
    return c;
  }
  /** Streams a tiny Markdown subset (**bold**, `code`) word by word into p. */
  async function saiMd(p, text, t, lo = 22, hi = 40) { await h.mdStream(p, text, t, lo, hi); }

  /* Tool cards frame: a chat column — user turn, tool call line, then the rendered tool result */
  function tuStage(root, cls = '') {
    const s = mk('div', `lib-cards flex min-h-[440px] w-full flex-col items-center justify-center rounded-[20px] px-3 py-6 sm:px-6 ${cls}`); root.append(s);
    const col = mk('div', 'relative flex w-full max-w-md min-w-0 flex-col gap-3'); s.append(col); return col;
  }
  async function tuAsk(col, t, text) {
    const b = mk('div', 'tu-rise ms-auto w-fit max-w-[85%] rounded-3xl bg-muted px-4 py-2 text-sm text-foreground', esc(text)); col.append(b); await t.sleep(450); return b;
  }
  /** Tool-call status line: spinner + shimmer while running, check once the result renders. */
  async function tuCall(col, t, name, ms = 1100) {
    const s = mk('div', 'tu-rise flex min-w-0 items-center gap-2 text-sm text-muted-foreground');
    s.innerHTML = `<span class="grid size-4 place-items-center">${lu('loader-circle', 'size-3.5 animate-spin')}</span><span class="truncate font-mono text-xs"><span class="tu-shimmer">${esc(name)}</span></span>`;
    col.append(s); await t.sleep(ms);
    s.innerHTML = `<span class="grid size-4 place-items-center">${lu('check', 'size-3.5')}</span><span class="truncate font-mono text-xs">${esc(name)}</span>`;
    return s;
  }
  const TU_BTN = { default: 'tu-btn tu-btn-default', ghost: 'tu-btn tu-btn-ghost', outline: 'tu-btn tu-btn-outline', secondary: 'tu-btn tu-btn-secondary', destructive: 'tu-btn tu-btn-destructive' };
  /** Tool cards ActionButtons: stacked full-width below 24rem of container width, a right-aligned pill row above. */
  function tuActions(actions) {
    const box = mk('div', 'tu-actions'); const row = mk('div', 'tu-actions-row'); box.append(row);
    box.btn = {};
    actions.forEach((a) => { const b = mk('button', TU_BTN[a.variant || 'default'], esc(a.label)); b.type = 'button'; if (a.disabled) b.disabled = true; if (a.onClick) b.onclick = a.onClick; row.append(b); box.btn[a.id] = b; });
    return box;
  }
  const tuSpinner = (cls = 'size-5') => lu('loader-circle', `tu-primary ${REDUCE ? '' : 'animate-spin'} ${cls}`);
  /** Plan / ProgressTracker step indicator (pending, in_progress, completed, failed/cancelled). */
  function tuStepIcon(status) {
    if (status === 'pending') return '<span class="tu-card flex size-6 shrink-0 items-center justify-center rounded-full !shadow-none" aria-hidden="true"></span>';
    if (status === 'in_progress' || status === 'in-progress') return `<span class="tu-card tu-ring flex size-6 shrink-0 items-center justify-center rounded-full" aria-hidden="true">${tuSpinner('size-5')}</span>`;
    if (status === 'completed') return `<span class="tu-bg-primary flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm" style="${REDUCE ? '' : 'animation:tu-zoom 300ms ease-out both'}" aria-hidden="true">${lu('check', 'size-4', 3)}</span>`;
    return `<span class="tu-bg-destructive flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm" style="${REDUCE ? '' : 'animation:tu-zoom 300ms ease-out both'}" aria-hidden="true">${lu('x', 'size-4', 3)}</span>`;
  }
  /** Tiny TS/Python highlighter mapped to the pierre-light / pierre-dark token colours the cards ship with. */
  const KW = new Set(['import', 'from', 'export', 'default', 'async', 'function', 'const', 'let', 'var', 'await', 'return', 'if', 'else', 'for', 'while', 'new', 'throw', 'try', 'catch', 'null', 'true', 'false', 'undefined', 'def', 'elif', 'in', 'not', 'and', 'or', 'type', 'interface']);
  function highlight(line) {
    const re = /(\/\/.*$|#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(\s*\()?|(<\/?)([A-Za-z][\w.]*)?/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      if (m.index === re.lastIndex) { re.lastIndex++; }
      out += esc(line.slice(last, m.index)); last = re.lastIndex;
      if (m[1]) out += `<span class="sh-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="sh-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="sh-num">${m[3]}</span>`;
      else if (m[4]) { const w = m[4]; out += KW.has(w) ? `<span class="sh-kw">${w}</span>` : m[5] ? `<span class="sh-fn">${w}</span>` : /^[A-Z]/.test(w) ? `<span class="sh-type">${w}</span>` : esc(w); if (m[5]) out += esc(m[5]); }
      else if (m[6]) { out += `<span class="sh-punc">${esc(m[6])}</span>`; if (m[7]) out += `<span class="sh-tag">${esc(m[7])}</span>`; }
    }
    return out + esc(line.slice(last));
  }
  const money = (n, cur = 'USD', d) => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: d ?? 2, maximumFractionDigits: d ?? 2 }).format(n);
  const g32 = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  const imgFallback = `onerror="this.style.opacity=0"`;

  return [
    /* ==================================================== Chat */
    { group: 'Chat', title: 'Context Cards', desc: 'The chunks an answer was grounded on: the header fades in, two retrieved chunks rise on a 100 ms stagger, then their source chips pop in 700 ms later and stay available.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root);
        const col = mk('div', 'flex w-full max-w-[380px] flex-col gap-2'); stage.append(col);
        const CHUNKS = [
          { title: 'Vendor onboarding rule', chars: '290 characters', body: 'Cold-chain certification must be verified before a new dairy can be added to the reorder workflow.', source: 'Dairy Onboarding SOP.pdf', badge: 'PDF', tone: 'bg-red' },
          { title: 'Seasonal demand row', chars: '1,250 characters', body: 'Q4 velocity table: pistachio +18%, vanilla +6%, rocky road -11%; retire flavors below 40 scoops weekly.', source: 'Sales Velocity Export.csv', badge: 'CSV', tone: 'bg-green' },
        ];
        const status = mk('div', 'flex h-5 items-center px-0.5', buShimmer('Retrieving context', 'text-[13px] font-medium')); col.append(status);
        await t.sleep(1300); status.remove();
        const head = mk('div', 'flex items-center gap-2 px-0.5', '<span class="text-[13px] font-semibold text-ink">All chunks</span><span class="inline-flex h-5 items-center rounded-md bg-inset px-1.5 text-[11.5px] font-medium text-ink-2 chat-hairline tabular-nums">32</span>');
        ani(head, 'chat-fade-in 400ms ease-out both'); col.append(head);
        const chips = CHUNKS.map((c, i) => {
          const card = mk('div', 'overflow-hidden rounded-[10px] bg-surface chat-card'); ani(card, `chat-fade-up 400ms ${EASE_BU} ${i * 100}ms both`);
          card.innerHTML = `<div class="flex items-center gap-2.5 border-b border-line px-3 py-2.5"><span class="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-ink">${svg('<path d="M4 6h16M4 12h16M4 18h10"/>', 11, 2.5)}<span class="truncate">${esc(c.title)}</span></span><span class="ml-auto shrink-0 text-[12px] text-ink-3 tabular-nums">${esc(c.chars)}</span></div>
            <p class="px-3 pt-2 pb-1 text-[12.5px] leading-relaxed text-ink-2">${esc(c.body)}</p>
            <div class="px-3 pb-3"><span class="chat-chip inline-flex h-6 max-w-full items-center gap-1.5 rounded-full bg-inset px-2 text-[12px] font-medium text-ink-2 chat-btn-shadow transition-[opacity,transform,background-color] duration-300 hover:bg-hover" style="opacity:0;transform:scale(0.95);transition-timing-function:${EASE_BU};transition-delay:${i * 80}ms"><span class="flex size-3.5 shrink-0 items-center justify-center rounded-[4px] ${c.tone} text-[7px] font-bold text-white">${c.badge}</span><span class="truncate">${esc(c.source)}</span>${svg('<path d="M7 17L17 7M7 7h10v10"/>', 9, 2.5)}</span></div>`;
          col.append(card); return $('.chat-chip', card);
        });
        await t.sleep(700);
        chips.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'scale(1)'; });
        await t.sleep(5600);
      } },

    { group: 'Chat', title: 'Chat Composer', desc: 'A fixed-size chat panel: the prompt is typed and sent, the bubble rises in, then two agent replies land 500 ms and 1.4 s later — the newest one stays soft and blurred while it resolves.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root);
        const card = mk('div', 'flex h-[288px] w-full max-w-[380px] flex-col overflow-hidden rounded-[14px] bg-surface chat-card'); stage.append(card);
        const MESSAGES = [
          { label: 'Sales History', sub: 'Flavor Data', time: '4s', body: 'Pulled 3 summers of mint chip sales for comparison.' },
          { label: 'Comparison', sub: 'Trend Detection', time: '2s', body: 'Mint chip is up 12% with stronger weekend peaks.' },
        ];
        const ICONS = ['<path d="M12 5v14M5 12h14"/>', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', '<g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></g>'];
        card.innerHTML = `<div class="flex shrink-0 items-center justify-between border-b border-line p-1.5"><div class="chat-tabs flex items-center">${['Flavors', 'Suppliers'].map((x, i) => `<button type="button" aria-pressed="${i === 0}" class="rounded-[6px] px-2 py-[3px] text-[13px] text-ink transition-[background-color,opacity] duration-100 ${i === 0 ? 'bg-field' : 'opacity-50 hover:opacity-75'}">${x}</button>`).join('')}</div><div class="flex items-center gap-1">${ICONS.map((ic) => `<button type="button" aria-label="Action" class="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink-2">${svg(ic, 15, 2)}</button>`).join('')}</div></div>
          <div class="chat-conv flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pt-2.5 pb-1"><div class="flex justify-end pl-14"><div class="chat-bubble rounded-xl bg-field px-3 py-1.5 text-[13px] leading-[1.4] text-ink transition-[opacity,transform] duration-300" style="opacity:0;transform:translateY(10px);transition-timing-function:${EASE_BU}"></div></div></div>
          <div class="mt-auto shrink-0 p-1.5"><div class="chat-field flex cursor-text flex-col gap-2 rounded-[8px] border border-line bg-field p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.035)] transition-[border-color,box-shadow] duration-150 focus-within:border-line-strong"><input aria-label="Chat prompt" placeholder="Prompt or tag a flavor with @" class="min-h-[18px] w-full bg-transparent text-[13px] leading-[1.4] text-ink outline-none placeholder:text-ink-3"><div class="flex items-center justify-end"><button type="button" aria-label="Send" disabled class="chat-send flex size-7 items-center justify-center rounded-[8px] transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.96]" style="background:var(--line-strong);color:var(--ink-2)">${svg('<path d="M12 19V5M5 12l7-7 7 7"/>', 16, 2.4)}</button></div></div></div>`;
        const tabs = $$('.chat-tabs button', card);
        tabs.forEach((b) => { b.onclick = () => tabs.forEach((x) => { const on = x === b; x.setAttribute('aria-pressed', on); x.classList.toggle('bg-field', on); x.classList.toggle('opacity-50', !on); x.classList.toggle('hover:opacity-75', !on); }); });
        const input = $('input', card), send = $('.chat-send', card), conv = $('.chat-conv', card), bubble = $('.chat-bubble', card), field = $('.chat-field', card);
        const sync = () => { const ok = input.value.trim().length > 0; send.disabled = !ok; send.style.background = ok ? 'var(--ink)' : 'var(--line-strong)'; send.style.color = ok ? 'var(--surface)' : 'var(--ink-2)'; };
        input.addEventListener('input', sync);
        const section = (m) => {
          const s = mk('div', 'flex w-full flex-col gap-1.5 transition-[opacity,filter,transform] duration-[400ms]');
          Object.assign(s.style, { opacity: '0.55', filter: 'blur(0.5px)', transform: 'scale(0.985)', transformOrigin: 'top left', transitionTimingFunction: EASE_BU });
          ani(s, `chat-fade-up 400ms ${EASE_BU} both`);
          s.innerHTML = `<div class="flex items-center gap-1 text-[12px] leading-[1.3]"><span class="font-medium text-ink">${esc(m.label)}</span><span class="text-ink-2">${esc(m.sub)}</span><span class="text-ink">for ${esc(m.time)}</span></div><p class="text-[13px] leading-normal text-ink">${esc(m.body)}</p>`;
          s.resolve = () => Object.assign(s.style, { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' });
          return s;
        };
        let busy = false;
        const go = async () => {
          if (busy || !input.value.trim()) return; busy = true;
          $$('.chat-reply', conv).forEach((x) => x.remove());
          bubble.textContent = input.value.trim(); input.value = ''; sync();
          bubble.style.opacity = '1'; bubble.style.transform = 'translateY(0)';
          await t.sleep(500); const a = section(MESSAGES[0]); a.classList.add('chat-reply'); conv.append(a); a.resolve();
          await t.sleep(1400); const b = section(MESSAGES[1]); b.classList.add('chat-reply'); conv.append(b);
          await t.sleep(1200); b.resolve(); busy = false;
        };
        send.onclick = go; input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
        await t.sleep(900);
        field.classList.add('border-line-strong'); await typeInto(input, 'Compare mint chip to last summer', t, 42);
        await t.sleep(350); field.classList.remove('border-line-strong'); await press(send, t);
        await t.sleep(3300 + 1400); await press(tabs[1], t, 0.98); await t.sleep(1800);
      } },

    { group: 'Chat', title: 'Shimmer', desc: 'The processing-label atom: a 35 / 50 / 65 % ink gradient clipped to the text sweeps across every 1.8 s while the agent works, and drops back to flat ink the moment work settles.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const card = h.buCard('max-w-[340px]'); stage.append(card);
        const STEPS = ['Reading flavor briefs', 'Scanning supplier lists', 'Comparing tasting notes', 'Writing the scoop report'];
        card.innerHTML = `<div class="flex items-center gap-2"><span class="chat-sp grid size-4 place-items-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="var(--ink-2)"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg></span><span role="status" class="chat-line relative inline-grid min-w-0 text-[13px] font-medium"></span><span class="chat-t ml-auto font-mono text-[12px] text-ink-3 tabular-nums">0.0s</span></div><div class="mt-3 flex flex-col gap-1.5 border-t border-line pt-3"><div class="chat-sm flex items-baseline gap-2 text-[12px] text-ink-3"><span class="w-14 shrink-0">inline</span><span class="text-[13px] text-ink-2">Pistachio is ${buShimmer('still churning', 'font-medium')} — check back in a minute.</span></div><div class="flex items-baseline gap-2 text-[12px] text-ink-3"><span class="w-14 shrink-0">button</span><button type="button" class="${BU_BTN} ${BU_SIZE.sm} ${BU_VAR.secondary}">${buShimmer('Generating…', 'font-medium')}</button></div></div>`;
        const line = $('.chat-line', card), timer = $('.chat-t', card); let ds = 0; const iv = t.every(100, () => { ds++; timer.textContent = (ds / 10).toFixed(1) + 's'; });
        const swap = (html) => {
          const old = line.lastElementChild; const n = mk('span', 'col-start-1 row-start-1 truncate', html);
          if (!REDUCE) { n.style.animation = `chat-fade-up 320ms ${EASE_BU} both`; }
          line.append(n); if (old) { old.style.transition = 'opacity 150ms ease'; old.style.opacity = '0'; t.sleep(160).then(() => old.remove()); }
        };
        for (const s of STEPS) { swap(buShimmer(s, 'text-[13px] font-medium')); await t.sleep(2100); }
        t.stop(iv); swap(`<span class="text-ink-2">Worked for ${(ds / 10).toFixed(0)} seconds</span>`); $('.chat-sp svg', card).setAttribute('fill', 'var(--ink-3)');
        await t.sleep(3200);
      } },

    { group: 'Chat', title: 'Loading State', desc: 'Pixel-grid loaders for long-running work, each paired with a 1.4 s shimmering label and a live elapsed timer: Drive and Dots run a chevron wavefront on a 650 ms cycle, Orbit laps a comet around the rim.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const card = h.buCard('max-w-[340px] flex flex-col gap-3.5 p-5'); stage.append(card);
        const chevron = Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return (c + Math.abs(r - 1)) * 90; });
        const ORDER = [0, 1, 2, 5, 8, 7, 6, 3]; const orbit = Array.from({ length: 9 }, (_, i) => { const k = ORDER.indexOf(i); return k === -1 ? null : k * 110; });
        const ROWS = [
          { name: 'Drive', label: 'Churning', delays: chevron, dur: 650, round: false },
          { name: 'Dots', label: 'Scooping the data', delays: chevron, dur: 650, round: true },
          { name: 'Orbit', label: 'Freezing a batch', delays: orbit, dur: 950, round: false },
        ];
        const timers = [];
        ROWS.forEach((r, i) => {
          const row = mk('div', 'flex items-center gap-2.5'); row.setAttribute('role', 'status'); ani(row, `chat-fade-up 380ms ${EASE_BU} ${i * 90}ms both`);
          row.innerHTML = `<span aria-hidden="true" class="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">${r.delays.map((d) => `<span class="size-[4px] bg-ink ${r.round ? 'rounded-full' : 'rounded-[1px]'}" style="opacity:${d === null ? 0.07 : 0.15};animation:${d === null || REDUCE ? 'none' : `chat-pixel-on ${r.dur}ms ease-in-out ${d}ms infinite`}"></span>`).join('')}</span>${buShimmer(r.label, 'text-[13px] font-medium', 1.4)}<span class="chat-el font-mono text-[12px] text-ink-3 tabular-nums">0.0s</span><span class="ml-auto rounded-[6px] bg-inset px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3 chat-hairline">${r.name}</span>`;
          card.append(row); timers.push($('.chat-el', row));
        });
        let ds = 0; t.every(100, () => { ds++; const s = ds / 10; const txt = s < 60 ? s.toFixed(1) + 's' : `${Math.floor(s / 60)}m ${(s % 60).toFixed(1)}s`; timers.forEach((el) => { el.textContent = txt; }); });
        await t.sleep(10000);
      } },

    { group: 'Chat', title: 'Approval Card', desc: 'Human-in-the-loop questions one at a time: single-choice answers auto-advance after 480 ms, the stack slides and the card height eases (360 ms), the step counter rolls like an odometer, and sending collapses into an "Answers sent" pill.', kind: 'lib',
      async run(root, t, ctx) {
        const stage = buStage(root); const wrap = mk('div', 'w-full max-w-80'); stage.append(wrap);
        const QS = [
          { q: 'How many flavors should we launch?', type: 'radio', options: ['Three (core line)', 'Five (full case)', 'Just one hero'] },
          { q: 'Which mix-ins should we stock?', type: 'check', options: ['Chocolate chips', 'Waffle bits', 'Sprinkles'] },
          { q: 'Which market do we enter first?', type: 'radio', options: ['Food trucks', 'Grocery freezers', 'Scoop shops'] },
        ];
        const SLIDE = '360ms cubic-bezier(0.22, 1, 0.36, 1)';
        const card = mk('div', 'relative overflow-hidden rounded-[10px] bg-surface chat-card'); ani(card, `chat-fade-up 380ms ${EASE_BU} both`); wrap.append(card);
        card.innerHTML = `<button type="button" aria-label="Dismiss" class="absolute top-2.5 right-2.5 z-10 inline-flex size-7 items-center justify-center rounded-[8px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink">${svg('<path d="M18 6L6 18M6 6l12 12"/>', 14, 2.2)}</button><div class="p-3"><div class="chat-vp overflow-hidden" aria-live="polite"><div class="chat-track flex flex-col gap-[26px]" style="will-change:transform"></div></div></div>
          <div class="flex items-center justify-between gap-3 p-2.5"><div class="flex items-center gap-1 text-ink-3"><button type="button" aria-label="Previous question" class="chat-prev flex size-[18px] items-center justify-center rounded-[5px] transition-colors duration-100 enabled:hover:text-ink disabled:opacity-30">${svg('<path d="M18 15l-6-6-6 6"/>', 14)}</button><span class="chat-count inline-flex items-center text-[12px] font-medium tabular-nums text-ink-3" style="letter-spacing:-0.1px;line-height:1"></span><button type="button" aria-label="Next question" class="chat-next flex size-[18px] items-center justify-center rounded-[5px] transition-colors duration-100 enabled:hover:text-ink disabled:opacity-30">${svg('<path d="M6 9l6 6 6-6"/>', 14)}</button></div><div class="chat-acts -mr-0.5 flex items-center gap-1.5"></div></div>`;
        const vp = $('.chat-vp', card), track = $('.chat-track', card), count = $('.chat-count', card);
        const skip = buBtn('ghost', 'sm', 'Skip'), cont = buBtn('accent', 'sm', 'Continue'); $('.chat-acts', card).append(skip, cont);
        let qi = 0; const answers = {}; const items = []; const menus = [];
        QS.forEach((q, qIdx) => {
          const it = mk('div'); it.style.transition = `opacity ${SLIDE}`;
          it.innerHTML = `<div class="pr-7 text-[14px] font-medium text-ink">${esc(q.q)}</div><div class="chat-menu mt-2.5 flex flex-col gap-1">${q.options.map((o, i) => `<button type="button" data-menu-row data-i="${i}" aria-pressed="false" class="relative z-10 flex items-center gap-1.5 rounded-[8px] py-1 pr-2 pl-1 text-left transition-colors duration-100"><span class="chat-box flex size-4 shrink-0 items-center justify-center text-transparent shadow-[inset_0_0_0_1.5px_var(--line-strong)] transition-colors duration-200 ${q.type === 'radio' ? 'rounded-full' : 'rounded-[5px]'}">${q.type === 'radio' ? '<span class="chat-dot size-1.5 rounded-full bg-[var(--canvas)] transition-transform duration-200" style="transform:scale(0)"></span>' : svg('<path d="M20 6L9 17l-5-5"/>', 12, 3)}</span><span class="chat-opt text-[13px] leading-none text-ink-2 transition-colors duration-200">${esc(o)}</span></button>`).join('')}<label data-menu-row class="relative z-10 flex items-center gap-1.5 rounded-[8px] py-1 pr-2 pl-1"><input aria-label="Custom answer" placeholder="Something else…" class="min-w-0 flex-1 bg-transparent pl-1.5 text-[13px] text-ink outline-none placeholder:text-ink-3"></label></div>`;
          track.append(it); items.push(it); menus.push(glide($('.chat-menu', it), 'inset-x-0 rounded-[8px] bg-hover'));
          $$('[data-i]', it).forEach((b) => { b.onclick = () => { if (qIdx === qi) toggle(+b.dataset.i); }; });
        });
        // Odometer: each changed character rolls up (or down when the number shrinks).
        let shown = '';
        const roll = (value) => {
          const from = shown; shown = value; if (!from || REDUCE) { count.textContent = value; return; }
          const dir = parseInt(value, 10) < parseInt(from, 10) ? 'down' : 'up';
          count.innerHTML = [...value].map((n, i) => { const o = from[i] ?? ''; if (o === n) return `<span>${esc(n)}</span>`; const top = dir === 'down' ? n : o, bottom = dir === 'down' ? o : n; return `<span style="display:inline-block;position:relative;overflow:hidden;height:1em;line-height:1em;vertical-align:-0.05em"><span class="chat-roll" data-dir="${dir}" style="display:flex;flex-direction:column;transition:transform 350ms cubic-bezier(0.4,0,0.2,1);transform:translateY(${dir === 'down' ? '-1em' : '0'})"><span style="height:1em;line-height:1em">${esc(top)}</span><span style="height:1em;line-height:1em">${esc(bottom)}</span></span></span>`; }).join('');
          tick(() => $$('.chat-roll', count).forEach((r) => { r.style.transform = `translateY(${r.dataset.dir === 'down' ? '0' : '-1em'})`; }));
          t.sleep(400).then(() => { if (shown === value) count.textContent = value; });
        };
        const sync = (anim) => {
          const it = items[qi];
          vp.style.transition = anim && !REDUCE ? `height ${SLIDE}` : ''; track.style.transition = anim && !REDUCE ? `transform ${SLIDE}` : '';
          vp.style.height = it.offsetHeight + 'px'; track.style.transform = `translate3d(0, ${-it.offsetTop}px, 0)`;
          items.forEach((x, i) => { x.style.opacity = i === qi ? '1' : '0'; x.style.pointerEvents = i === qi ? '' : 'none'; x.setAttribute('aria-hidden', String(i !== qi)); });
          const last = qi === QS.length - 1; cont.textContent = last ? 'Send' : 'Continue'; cont.disabled = !(answers[qi] || []).length;
          $('.chat-prev', card).disabled = qi <= 0; $('.chat-next', card).disabled = last; roll(`${qi + 1} / ${QS.length}`);
        };
        const paint = () => items.forEach((it, qIdx) => { const picked = answers[qIdx] || []; $$('[data-i]', it).forEach((b) => { const on = picked.includes(+b.dataset.i); b.setAttribute('aria-pressed', on); const box = $('.chat-box', b); box.classList.toggle('bg-ink', on); box.classList.toggle('text-[var(--canvas)]', on); box.classList.toggle('text-transparent', !on); box.style.boxShadow = on ? 'none' : ''; const dot = $('.chat-dot', b); if (dot) dot.style.transform = on ? 'scale(1)' : 'scale(0)'; $('.chat-opt', b).classList.toggle('text-ink', on); $('.chat-opt', b).classList.toggle('text-ink-2', !on); }); });
        const goTo = (n) => { qi = Math.max(0, Math.min(QS.length - 1, n)); sync(true); };
        let sent = false;
        const sendAll = () => {
          if (sent) return; sent = true;
          wrap.innerHTML = `<div class="flex w-full max-w-80 items-center gap-3"><span class="inline-flex items-center gap-1.5 rounded-full bg-green-tint py-1 pr-2.5 pl-1 text-[12.5px] font-medium text-green"><span class="flex size-[18px] items-center justify-center rounded-full bg-green text-white">${svg('<path d="M20 6L9 17l-5-5"/>', 11, 3)}</span>Answers sent</span><button type="button" class="chat-again text-[12px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink">Start over</button></div>`;
          ani(wrap.firstElementChild, `chat-pop-in 260ms ${EASE_BU} both`); $('.chat-again', wrap).onclick = () => ctx.restart();
        };
        const toggle = (i) => {
          const q = QS[qi]; const picked = answers[qi] || [];
          answers[qi] = q.type === 'radio' ? [i] : picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i];
          paint(); sync(false);
          if (q.type === 'radio') { const at = qi; t.sleep(480).then(() => { if (qi !== at || sent) return; if (qi === QS.length - 1) sendAll(); else goTo(qi + 1); }); }
        };
        cont.onclick = () => { if (qi === QS.length - 1) sendAll(); else goTo(qi + 1); };
        skip.onclick = () => { if (qi < QS.length - 1) goTo(qi + 1); };
        $('.chat-prev', card).onclick = () => goTo(qi - 1); $('.chat-next', card).onclick = () => goTo(qi + 1);
        await frame(); sync(false);
        const pick = async (q, i) => { const b = $(`[data-i="${i}"]`, items[q]); menus[q].to(b); await t.sleep(420); await press(b, t, 0.98); };
        await t.sleep(1100); await pick(0, 0);
        await t.sleep(1300); await pick(1, 0); await t.sleep(500); await pick(1, 1); await t.sleep(500); menus[1].to(null); await press(cont, t);
        await t.sleep(1300); await pick(2, 2);
        await t.sleep(3600);
      } },

    { group: 'Chat', title: 'Task Rows', desc: 'Agent tasks as capsules that run once: rows enter 80 ms apart, the running row expands to show its detail steps at 1.5 s, then the draft row flips to Failed with a spinning retry before resolving to Completed. Alternates with the List variant.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.tr = (ctx.tr || 0) + 1; const list = ctx.tr % 2 === 0;
        const stage = buStage(root);
        const ROWS = [
          { key: 'verify', label: 'Verified vendor records', amount: '12 suppliers', status: 'done', details: [['Matched tax and contact IDs', '12/12'], ['Flagged stale records', '0']] },
          { key: 'index', label: 'Build reorder task list', amount: '7 SKUs', status: 'running', step: 2, details: [['Reading POS export', '3 files'], ['Scoring stockout risk', '68%']] },
          { key: 'draft', label: 'Draft supplier emails', amount: '2 messages', status: 'sequence', step: 3, details: [['Cone supplier follow-up', 'draft'], ['Pistachio reorder note', 'draft']] },
        ];
        const box = mk('div', `flex w-full max-w-[440px] flex-col ${list ? 'gap-0 self-center overflow-hidden rounded-[10px] bg-surface chat-card' : 'min-h-[196px] gap-2'}`); stage.append(box);
        const ring = (active, n) => { const size = 24, sw = 2, r = (size - sw) / 2, c = 2 * Math.PI * r; return `<span class="relative inline-flex shrink-0 items-center justify-center" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" class="absolute inset-0" style="${active && !REDUCE ? 'animation:chat-spin 1.1s linear infinite' : ''}"><circle cx="12" cy="12" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/>${active ? `<circle cx="12" cy="12" r="${r}" fill="none" stroke="var(--ink-3)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c * 0.28} ${c * 0.72}"/>` : ''}</svg><span class="relative text-[10.5px] font-semibold tabular-nums text-ink">${n}</span></span>`; };
        const badge = (tone, icon) => `<span class="flex size-[22px] shrink-0 items-center justify-center rounded-full text-white ${tone === 'red' ? 'bg-red' : 'bg-green'}" style="animation:chat-pop-in 300ms ${EASE_BU} both">${icon}</span>`;
        const CHECK = svg('<path d="M20 6L9 17l-5-5"/>', 13, 3.5), X = svg('<path d="M18 6L6 18M6 6l12 12"/>', 12, 3.5), RETRY = svg('<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>', 12, 3);
        const pill = (tone, html) => `<span class="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2 text-[11.5px] font-medium ${tone === 'red' ? 'bg-red-tint text-red' : 'bg-green-tint text-green'}" style="animation:chat-fade-in 200ms ease-out both">${html}</span>`;
        let tickN = 0; const manual = {};
        const els = ROWS.map((row, i) => {
          const el = mk('div', `self-stretch overflow-hidden transition-[border-radius,background-color] duration-300 hover:bg-inset ${list ? 'border-b border-line last:border-0' : 'bg-surface chat-card'}`);
          el.style.borderRadius = list ? '0' : '22px'; ani(el, `chat-fade-up 450ms ${EASE_BU} ${i * 80}ms both`);
          const btn = mk('button', 'flex h-11 w-full items-center gap-2.5 px-2.5 text-left'); btn.type = 'button';
          btn.innerHTML = `<span class="chat-badge flex size-6 shrink-0 items-center justify-center"></span><span class="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">${esc(row.label)}</span><span class="hidden text-[12.5px] text-ink-2 tabular-nums min-[400px]:inline">${esc(row.amount)}</span><span class="chat-pill contents"></span><span aria-hidden="true" class="-ml-2 flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3">${svg('<path d="M6 9l6 6 6-6"/>', 15, 2.2, 'chat-chev transition-transform duration-300')}</span>`;
          const det = rowsDisclosure(false);
          det.inner.innerHTML = `<div class="mb-2.5 grid grid-cols-[24px_1fr] gap-2.5 px-2.5"><span aria-hidden="true" class="mx-auto h-full w-px bg-line"></span><div class="flex flex-col gap-1.5">${row.details.map(([l, m]) => `<div class="chat-d flex items-center justify-between"><span class="text-[12px] text-ink-2">${esc(l)}</span><span class="font-mono text-[11.5px] text-ink-3 tabular-nums">${esc(m)}</span></div>`).join('')}</div></div>`;
          btn.onclick = () => { manual[row.key] = !isOpen(row); render(); };
          el.append(btn, det); box.append(el); return { el, btn, det, row, last: '' };
        });
        const isOpen = (row) => manual[row.key] ?? (row.key === 'index' && tickN === 2);
        const render = () => els.forEach((x) => {
          const { row } = x; const r2 = tickN < 3 ? 'pending' : tickN === 3 ? 'failed' : 'done';
          const key = row.status === 'sequence' ? r2 : row.status;
          if (x.last !== key) {
            x.last = key;
            $('.chat-badge', x.btn).innerHTML = row.status === 'done' ? badge('green', CHECK) : row.status === 'running' ? ring(true, row.step) : r2 === 'pending' ? ring(false, row.step) : r2 === 'failed' ? badge('red', X) : badge('green', CHECK);
            $('.chat-pill', x.btn).innerHTML = row.status === 'done' ? '<span class="inline-flex h-[22px] shrink-0 items-center rounded-full bg-green-tint px-2 text-[11.5px] font-medium text-green">Completed</span>' : row.status === 'running' ? '' : r2 === 'failed' ? pill('red', `Failed <span class="flex" style="${REDUCE ? '' : 'animation:chat-spin 1.2s linear infinite'}">${RETRY}</span>`) : r2 === 'done' ? pill('green', 'Completed') : '';
          }
          const open = isOpen(row); const was = x.btn.getAttribute('aria-expanded') === 'true';
          x.btn.setAttribute('aria-expanded', open); x.det.set(open); $('.chat-chev', x.btn).style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
          if (!list) x.el.style.borderRadius = open ? '14px' : '22px';
          if (open && !was) $$('.chat-d', x.det).forEach((d, j) => ani(d, `chat-fade-up 300ms ${EASE_BU} ${120 + j * 100}ms both`));
        });
        render();
        for (const ms of [600, 900, 2400, 1400, 2400]) { await t.sleep(ms); tickN++; render(); }
        await t.sleep(2200);
      } },

    { group: 'Chat', title: 'Selection Actions', desc: 'A contextual AI bar under selected text: the chevron reveals more actions, Improve shows a shimmering "Improving…" for 700 ms, the rewrite streams into the selection while the bar re-anchors, then Keep / Discard / retry appear as the pill eases to its new width.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root); const box = mk('div', 'w-full max-w-[460px]'); stage.append(box);
        const host = mk('div', 'relative select-none pb-12'); box.append(host);
        const ORIGINAL = 'Churn it first thing Saturday so the batch has time to firm up before the afternoon rush.';
        const REWRITE = 'Churn pistachio first thing Saturday so the batch has time to fully firm before the afternoon rush.';
        host.innerHTML = `<p class="text-[13px] leading-relaxed text-ink">Pistachio holds the top slot all weekend. <span class="chat-sel box-decoration-clone rounded-[3px] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))] text-ink dark:bg-accent-tint"></span></p>
          <div class="chat-anchor absolute top-0 left-0 z-10" style="transition:transform 320ms cubic-bezier(0.77,0,0.175,1), opacity 180ms ease-out;opacity:0;pointer-events:none;will-change:transform"><div class="chat-bar flex h-9 w-fit max-w-[calc(100vw-48px)] items-center justify-center gap-0.5 overflow-hidden rounded-full bg-surface p-1 font-normal text-ink chat-overlay-shadow"><div class="chat-content flex w-fit shrink-0 items-center justify-center gap-0.5"></div></div></div>`;
        const sel = $('.chat-sel', host), anchor = $('.chat-anchor', host), bar = $('.chat-bar', host), content = $('.chat-content', host);
        sel.textContent = ORIGINAL;
        const I = (n) => lu(n, 'size-[14px]', 1.8);
        const quiet = (html, extra = '') => `<button type="button" class="${BU_BTN} ${BU_SIZE.xs} ${BU_VAR.quiet} shrink-0 ${extra}">${html}</button>`;
        const place = () => { const lines = sel.getClientRects(); const last = lines[lines.length - 1]; if (!last) return; const b = sel.getBoundingClientRect(), hb = host.getBoundingClientRect();
          // Keep the pill inside the card on narrow stages: cap its width and clamp its centre.
          bar.style.maxWidth = hb.width + 'px'; const half = Math.min(Math.ceil(content.getBoundingClientRect().width) + 8, hb.width) / 2;
          const x = Math.max(half, Math.min(hb.width - half, b.left - hb.left + b.width / 2));
          anchor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(last.bottom - hb.top + 8)}px, 0) translateX(-50%)`; };
        let expanded = false;
        const render = (mode, busyLabel) => {
          const prev = bar.getBoundingClientRect().width;
          if (mode === 'idle') content.innerHTML = `<div class="chat-in flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-[400ms]" style="max-width:${expanded ? 0 : 145}px;opacity:${expanded ? 0 : 1};transform:translateX(${expanded ? '-8px' : '0'});transition-timing-function:${EASE_BU}"><div class="flex h-7 w-[145px] shrink-0 items-center"><input aria-label="Describe edits" placeholder="Describe edits" class="h-7 w-full bg-transparent pr-2.5 pl-3 text-[12.5px] text-ink outline-none placeholder:text-ink-3"></div></div>
            <div class="flex min-w-0 items-center gap-0.5 overflow-hidden">${expanded ? '' : '<span class="mx-1 h-4 w-px shrink-0 bg-line-strong"></span>'}${quiet(`${I('message-circle-question')}Explain`)}${quiet(`${I('sparkles')}Improve`, 'chat-improve')}<div class="chat-more flex min-w-0 items-center gap-0.5 overflow-hidden transition-[max-width,opacity,margin] duration-[400ms]" style="max-width:${expanded ? 262 : 0}px;opacity:${expanded ? 1 : 0};margin-left:${expanded ? 2 : 0}px;transition-timing-function:${EASE_BU}">${quiet(`${I('scissors')}Shorten`)}${quiet(`${I('smile')}Tone`)}${quiet(`${I('type')}Grammar`)}</div><span class="mx-0.5 h-4 w-px shrink-0 bg-line"></span><button type="button" aria-label="Show more actions" aria-expanded="${expanded}" class="chat-exp flex size-7 shrink-0 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-200 hover:bg-hover active:scale-[0.96]"><span class="flex transition-transform duration-[400ms]" style="transform:rotate(${expanded ? 180 : 0}deg);transition-timing-function:${EASE_BU}">${I('chevron-right')}</span></button></div>`;
          else if (mode === 'thinking' || mode === 'streaming') content.innerHTML = `<span class="inline-flex h-7 items-center gap-1.5 px-2.5 text-[12.5px] font-normal whitespace-nowrap text-ink-2"><span class="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong" style="border-top-color:var(--ink-2);${REDUCE ? '' : 'animation:chat-spin 700ms linear infinite'}"></span>${mode === 'thinking' ? buShimmer(busyLabel + '…', 'text-[12.5px] font-normal') : `<span>${busyLabel}…</span>`}</span>`;
          else content.innerHTML = `<button type="button" class="chat-keep inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 text-[12.5px] font-normal text-[var(--canvas)] chat-hairline transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]">${I('check')}Keep</button>${quiet(`${I('x')}Discard`)}<span class="mx-0.5 h-4 w-px shrink-0 bg-line"></span><button type="button" aria-label="Try again" class="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink-2 active:scale-[0.96]">${I('rotate-ccw')}</button>`;
          const next = Math.ceil(content.getBoundingClientRect().width) + 8;
          if (!REDUCE && prev && Math.abs(next - prev) > 1 && bar.animate) bar.animate([{ width: prev + 'px' }, { width: next + 'px' }], { duration: 320, easing: 'cubic-bezier(0.23,1,0.32,1)' });
          const exp = $('.chat-exp', content); if (exp) exp.onclick = () => { expanded = !expanded; render('idle'); };
          place();
        };
        render('idle'); await t.sleep(280); place(); anchor.style.opacity = '1'; anchor.style.pointerEvents = 'auto'; ani(bar, `chat-pop-in 220ms ${EASE_BU} both`);
        await t.sleep(1300); await press($('.chat-exp', content), t); await t.sleep(1500); await press($('.chat-exp', content), t);
        await t.sleep(900); const imp = $('.chat-improve', content); imp.classList.add('bg-hover'); await t.sleep(380); await press(imp, t);
        render('thinking', 'Improving'); await t.sleep(700); render('streaming', 'Improving');
        // StreamText: two characters every 9 ms, the newest six blurred in a masked tail.
        const head = document.createTextNode(''), tail = mk('span', 'stream-tail'), caret = mk('span', 'stream-caret is-streaming'); sel.textContent = ''; sel.append(head, tail, caret);
        for (let i = 0; i < REWRITE.length;) { i = Math.min(i + 2, REWRITE.length); const s = REWRITE.slice(0, i); const split = i < REWRITE.length ? Math.max(0, s.length - 6) : s.length; head.textContent = s.slice(0, split); tail.textContent = s.slice(split); if (i % 8 === 0) place(); await t.sleep(9); }
        sel.textContent = REWRITE; render('result');
        await t.sleep(1600); const keep = $('.chat-keep', content); if (keep) keep.style.opacity = '0.9'; await t.sleep(3600);
      } },

    { group: 'Chat', title: 'Prompt Bar', desc: 'A composer with real controls running its own walkthrough: the @ menu walks sources and connects Gmail, the / menu walks commands, then the model picker upgrades to the flagship and a rainbow sweep crosses the field. Alternates Rounded and Pill.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.pb = (ctx.pb || 0) + 1; const pill = ctx.pb % 2 === 0;
        const stage = buStage(root); const wrap = mk('div', 'flex min-h-[340px] w-full max-w-[420px] flex-col justify-end pb-4'); stage.append(wrap);
        const BR = {
          figma: '<svg width="11" height="16" viewBox="0 0 38 57" aria-hidden="true"><path d="M9.5 57A9.5 9.5 0 0 0 19 47.5V38H9.5a9.5 9.5 0 0 0 0 19z" fill="#0ACF83"/><path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" fill="#A259FF"/><path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" fill="#F24E1E"/><path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" fill="#FF7262"/><path d="M38 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0z" fill="#1ABCFE"/></svg>',
          slack: '<svg width="15" height="15" viewBox="0 0 127 127" aria-hidden="true"><path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/><path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.3.7 54.4.7 47.1c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0"/><path d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V47.1zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33.2z" fill="#2EB67D"/><path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E"/></svg>',
          gmail: '<svg width="15" height="12" viewBox="0 0 256 193" aria-hidden="true"><path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" fill="#4285F4"/><path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" fill="#34A853"/><path d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504 58.182 93.14Z" fill="#EA4335"/><path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" fill="#FBBC04"/><path d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" fill="#C5221F"/></svg>',
        };
        const GL = { clip: '<path d="m21.4 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>', globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' };
        const SOURCES = [['Add photos & files', 'Upload from your computer', 'clip'], ['Scoop Data', 'Sales & churn metrics', 'chart'], ['Flavor records', '26 makers, tags, links', 'layers'], ['Web search', 'Real-time news and info', 'globe'], ['Figma', 'Design-to-code workflows', '', 'figma'], ['Slack', 'Read and manage Slack', '', 'slack'], ['Gmail', 'Read and manage Gmail', '', 'gmail', true]];
        const COMMANDS = [['/compare', 'Flavor vs. last summer'], ['/churn-plan', 'Draft a churn schedule'], ['/restock', 'Build a reorder list'], ['/draft-email', 'Write a supplier email'], ['/summarize', 'Digest the thread so far']];
        const MODELS = [['Sprinkles 5', 'Flagship'], ['Vanilla 1', 'Basic'], ['Freezer Burn 0.4', 'Stale']];
        const R = pill ? 'rounded-full' : 'rounded-[8px]';
        const anchorEl = mk('div', 'relative'); wrap.append(anchorEl);
        const comp = mk('div', `relative isolate flex flex-col gap-1.5 overflow-hidden border border-line bg-surface p-1.5 chat-card transition-[border-color,border-radius] duration-150 focus-within:border-line-strong ${pill ? 'rounded-full' : 'rounded-[14px]'}`);
        comp.innerHTML = `<span class="chat-sweep pointer-events-none absolute inset-0 -z-10" style="border-radius:inherit;opacity:0;background-image:linear-gradient(90deg,transparent 0%,#ff3b30 18%,#ff9500 28%,#ffcc00 38%,#34c759 48%,#32ade6 58%,#007aff 68%,#af52de 78%,transparent 92%);background-size:260% 100%;filter:saturate(1.2) blur(6px)"></span>
          <div class="grid grid-cols-[28px_minmax(0,1fr)_auto_28px_28px] items-end gap-x-1"><button type="button" aria-label="Add attachments and sources" class="flex size-7 shrink-0 items-center justify-center text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] ${R}">${svg('<path d="M12 5v14M5 12h14"/>', 16, 2)}</button><textarea rows="1" aria-label="Prompt" placeholder="Write a message…" class="min-h-7 w-full min-w-0 resize-none bg-transparent px-1 py-[5px] text-[13px] leading-[18px] text-ink outline-none [overflow-wrap:anywhere] placeholder:text-ink-3" style="height:28px;overflow:hidden"></textarea><button type="button" aria-label="Choose model" class="chat-model flex h-7 shrink-0 items-center gap-1 px-1.5 text-[12px] font-medium whitespace-nowrap text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink ${R}"><span class="chat-mname">Vanilla 1</span><span class="text-ink-3">${svg('<path d="M6 9l6 6 6-6"/>', 11, 2.4)}</span></button><button type="button" aria-label="Start dictation" class="flex size-7 shrink-0 items-center justify-center text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.94] ${R}">${svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>', 15, 2)}</button><button type="button" aria-label="Send" disabled class="chat-send flex size-7 shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.94] ${R}" style="background:var(--line-strong);color:var(--ink-2)">${svg('<path d="M12 19V5M5 12l7-7 7 7"/>', 16, 2.4)}</button></div>`;
        anchorEl.append(comp);
        const ta = $('textarea', comp), sendB = $('.chat-send', comp), modelB = $('.chat-model', comp);
        ta.addEventListener('input', () => setDraft(ta.value)); sendB.onclick = () => setDraft('');
        let menu = null, modelMenu = null;
        const closeMenus = () => { if (menu) { menu.remove(); menu = null; } if (modelMenu) { modelMenu.remove(); modelMenu = null; } };
        const openMenu = (kind) => {
          if (menu && menu.dataset.kind === kind) return menu; if (menu) menu.remove();
          menu = mk('div', 'absolute inset-x-0 bottom-full z-10 mb-2 rounded-[10px] bg-surface p-1 chat-raised'); menu.dataset.kind = kind; ani(menu, `chat-pop-in 180ms ${EASE_BU} both`); menu.style.transformOrigin = 'bottom center';
          const rows = kind === 'at' ? SOURCES.map(([n, d, g, b, c]) => `<button type="button" data-menu-row class="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[6px] px-2 text-left"><span class="flex size-[22px] shrink-0 items-center justify-center text-ink-2">${b ? BR[b] : svg(GL[g], 15, 1.8)}</span><span class="shrink-0 text-[12.5px] font-medium text-ink">${esc(n)}</span><span class="min-w-0 flex-1 truncate text-[12px] text-ink-3">${esc(d)}</span>${c ? '<span class="chat-conn shrink-0 text-[12px] font-medium text-accent-ink transition-colors duration-100 hover:underline">Connect</span>' : ''}</button>`).join('')
            : COMMANDS.map(([n, d]) => `<button type="button" data-menu-row class="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-[6px] px-2 text-left"><span class="shrink-0 text-[12.5px] font-medium text-ink">${esc(n)}</span><span class="min-w-0 flex-1 truncate text-[12px] text-ink-3">${esc(d)}</span></button>`).join('');
          menu.innerHTML = `<div class="chat-rows">${rows}</div><div class="mt-1 border-t border-line px-2 pt-1.5 pb-1 text-[11px] text-ink-3">${kind === 'at' ? 'Type to search sources & files' : 'Type to search commands'}</div>`;
          menu.g = glide($('.chat-rows', menu), 'inset-x-0 rounded-[6px] bg-hover'); anchorEl.prepend(menu); return menu;
        };
        const setDraft = (v) => { ta.value = v; const ok = v.trim().length > 0; sendB.disabled = !ok; sendB.style.background = ok ? 'var(--ink)' : 'var(--line-strong)'; sendB.style.color = ok ? 'var(--surface)' : 'var(--ink-2)'; };
        const openModels = (active) => {
          if (modelMenu) modelMenu.remove();
          modelMenu = mk('div', 'absolute z-10 w-44 rounded-[10px] bg-surface p-1 chat-raised'); ani(modelMenu, `chat-pop-in 180ms ${EASE_BU} both`); modelMenu.style.transformOrigin = 'bottom left';
          const ar = anchorEl.getBoundingClientRect(), tr = modelB.getBoundingClientRect();
          modelMenu.style.left = Math.max(0, Math.min(tr.left - ar.left, ar.width - 176)) + 'px'; modelMenu.style.bottom = (ar.bottom - tr.top + 8) + 'px';
          modelMenu.innerHTML = `<div class="chat-rows">${MODELS.map(([n, tg]) => `<button type="button" data-menu-row class="relative z-10 flex h-[30px] w-full items-center gap-2 rounded-[6px] px-2 text-left"><span class="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">${esc(n)}</span><span class="shrink-0 text-[11px] text-ink-3">${esc(tg)}</span><span class="shrink-0 text-ink ${n === active ? '' : 'invisible'}">${svg('<path d="M20 6L9 17l-5-5"/>', 13, 2.5)}</span></button>`).join('')}</div>`;
          modelMenu.g = glide($('.chat-rows', modelMenu), 'inset-x-0 rounded-[6px] bg-hover'); anchorEl.append(modelMenu);
        };
        const sweep = () => { const s = $('.chat-sweep', comp); if (REDUCE) return; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = 'chat-sweep 570ms cubic-bezier(0.16,1,0.3,1) both'; };
        const STEPS = [
          { draft: '', hold: 1100 }, { draft: '@', active: 0, hold: 900 }, { draft: '@', active: 1, hold: 620 }, { draft: '@', active: 4, hold: 620 }, { draft: '@', active: 6, hold: 700 }, { draft: '@', active: 6, connect: true, hold: 1000 },
          { draft: '', hold: 700 }, { draft: '/', active: 0, hold: 900 }, { draft: '/', active: 1, hold: 620 }, { draft: '/', active: 3, hold: 1000 }, { draft: '', hold: 800 },
          { draft: '', modelOpen: true, hold: 1200 }, { draft: '', model: 'Sprinkles 5', hold: 2400 }, { draft: '', hold: 900 },
        ];
        for (const s of STEPS) {
          setDraft(s.draft);
          if (s.draft === '@' || s.draft === '/') { const m = openMenu(s.draft === '@' ? 'at' : 'slash'); await frame(); m.g.to($$('[data-menu-row]', m)[s.active]); if (s.connect) { const c = $('.chat-conn', m); c.textContent = 'Connected'; c.classList.replace('text-accent-ink', 'text-green'); } }
          else if (menu) { menu.remove(); menu = null; }
          if (s.modelOpen) { openModels('Vanilla 1'); await frame(); modelMenu.g.to($$('[data-menu-row]', modelMenu)[0]); }
          if (s.model) { closeMenus(); $('.chat-mname', modelB).textContent = s.model; sweep(); }
          await t.sleep(s.hold);
        }
        closeMenus();
      } },

    { group: 'Chat', title: 'Recommendation Card', desc: 'An agent recommendation that holds its shape: Alternatives opens a drawer of other options with signal meters, picking one swaps the proposal in place, and the primary action turns into a green Accepted.', kind: 'lib',
      async run(root, t) {
        const stage = buStage(root);
        const chip = (name, color = '#e08a3c') => `<span class="mx-0.5 inline-flex items-center gap-1 rounded-full bg-field py-px pr-1.5 pl-[3px] align-middle chat-hairline"><span class="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] leading-none font-semibold text-white" style="background:${color}">${esc(name.charAt(0))}</span><span class="text-[12px] font-medium text-ink">${esc(name)}</span></span>`;
        const vpill = (txt, tone) => `<span class="mx-0.5 inline-flex items-center rounded-full px-1.5 py-0 align-middle text-[12px] font-medium ${tone === 'green' ? 'bg-green-tint text-green' : 'bg-field text-ink-2'}" style="box-shadow:${tone === 'green' ? '0 0 0 1px color-mix(in oklch, var(--green) 28%, transparent)' : '0 0 0 1px var(--line)'}">${esc(txt)}</span>`;
        const OPTS = [
          { body: `Reorder waffle cones from ${chip('Cone King')} with lead time ${vpill('7 days', 'green')}`, short: 'Reorder from Cone King · 7-day lead', signal: 3, tone: 'var(--green)', label: 'High confidence', cta: 'Accept', v: 'accent' },
          { body: `Switch vanilla to ${vpill('Vanilla Madagascar')} for peak season.`, short: 'Switch to Vanilla Madagascar', signal: 2, tone: 'var(--orange)', label: 'Needs review', cta: 'Configure', v: 'primary' },
          { body: 'Fall back to a <span class="font-medium text-ink">full restock</span> across every SKU.', short: 'Full restock across every SKU', signal: 0, tone: 'var(--ink-3)', label: 'No signal', cta: 'Accept full restock', v: 'primary' },
        ];
        const meter = (s, tone) => `<span class="flex items-end gap-0.5">${[0, 1, 2].map((b) => `<span class="w-1 rounded-full transition-colors duration-300" style="height:10px;background:${b < s ? tone : 'var(--line-strong)'}"></span>`).join('')}</span>`;
        const card = mk('div', 'w-full max-w-[380px] overflow-hidden rounded-[10px] bg-surface chat-card'); ani(card, `chat-fade-up 400ms ${EASE_BU} both`); stage.append(card);
        card.innerHTML = '<div class="p-3"><span class="text-[14px] font-medium text-ink">Want me to place this restock order?</span><p class="chat-body mt-1.5 min-h-12 text-[13px] leading-relaxed text-ink-2"></p></div>';
        const drawer = rowsDisclosure(false, 'duration-300', EASE_OUT); card.append(drawer);
        const foot = mk('div', 'flex items-center justify-between gap-3 bg-surface p-2.5', '<span class="chat-sig flex items-center gap-2"></span><span class="chat-acts -mr-0.5 flex items-center gap-2"></span>'); card.append(foot);
        const alt = buBtn('secondary', 'sm', 'Alternatives', 'px-2.5 text-[12.5px]'); const cta = buBtn('accent', 'sm', '', 'text-[12.5px]'); $('.chat-acts', foot).append(alt, cta);
        let sel = 0, open = false, accepted = false;
        const render = () => {
          const a = OPTS[sel]; const body = $('.chat-body', card); body.innerHTML = a.body; ani(body, 'none'); void body.offsetWidth; ani(body, 'chat-fade-in 180ms ease-out both');
          $('.chat-sig', foot).innerHTML = `${meter(a.signal, a.tone)}<span class="text-[12.5px] font-medium text-ink-2">${a.label}</span>`;
          buSetVariant(cta, accepted ? 'success' : a.v); cta.textContent = accepted ? 'Accepted' : a.cta;
          drawer.inner.innerHTML = `<div class="border-t border-line bg-surface p-2"><p class="px-1.5 pb-1 text-[11px] font-medium text-ink-3">Other options</p>${OPTS.map((o, i) => i === sel ? '' : `<button type="button" data-i="${i}" class="flex w-full items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-left transition-colors duration-100 hover:bg-hover">${meter(o.signal, o.tone)}<span class="min-w-0 flex-1 truncate text-[12.5px] text-ink">${esc(o.short)}</span><span class="shrink-0 text-[11px] text-ink-3">${o.label}</span></button>`).join('')}</div>`;
          $$('[data-i]', drawer).forEach((b) => { b.onclick = () => { sel = +b.dataset.i; accepted = false; render(); }; });
        };
        alt.onclick = () => { open = !open; alt.setAttribute('aria-expanded', open); alt.classList.toggle('bg-hover', open); drawer.set(open); };
        cta.onclick = () => { accepted = true; buSetVariant(cta, 'success'); cta.textContent = 'Accepted'; };
        render();
        await t.sleep(1500); await press(alt, t); await t.sleep(1100);
        const b = $('[data-i="1"]', drawer); b.classList.add('bg-hover'); await t.sleep(450); await press(b, t, 0.99);
        await t.sleep(900); await press(alt, t); await t.sleep(900); await press(cta, t); await t.sleep(3200);
      } },

    /* ======================================================= Assist */
    { group: 'Assist', title: 'Worked', desc: 'Fold the agent\'s work, keep the answer: reasoning and tool calls stream inside a pulsing "Working" disclosure, the answer streams below it, and when the message completes the work folds into "Worked for 27s".', kind: 'lib',
      async run(root, t) {
        const stage = saiStage(root); const thread = mk('div', 'flex w-full max-w-xl min-w-0 flex-col gap-2.5'); stage.append(thread);
        thread.append(saiUser('formatMinor is dropping cents on large invoice totals. Find and fix it.'));
        await t.sleep(600);
        const msg = mk('div', 'flex w-full min-w-0 flex-col gap-2.5 text-sm'); thread.append(msg);
        const worked = saiCollapsible('Working', true, { pulse: true }); worked.trig.setAttribute('role', 'status'); msg.append(worked.el);
        worked.body.className = 'flex min-h-0 flex-col gap-1 overflow-hidden py-1';
        const reasoning = saiCollapsible('Thinking...', true, { pulse: true }); reasoning.el.classList.replace('my-1', 'my-2'); worked.body.append(reasoning.el);
        reasoning.body.className = 'min-h-0 overflow-hidden py-1 text-sm text-muted-foreground';
        const rp = mk('p', 'assist-md'); reasoning.body.append(rp);
        await saiMd(rp, 'The report is lost cents on large invoice totals, which usually means we are formatting minor units with floating point. I will search for `formatMinor`, read the helper, then run the money tests before touching anything.', t, 16, 30);
        reasoning.label('Thought', false); reasoning.set(false);
        const TOOLS = [
          ['grep', { pattern: 'formatMinor', path: '/workspace/src' }, 1300, { matches: [{ path: '/workspace/src/lib/money.ts', line: 2, text: '  return (amount / 100).toFixed(2);' }] }],
          ['read', { path: '/workspace/src/lib/money.ts' }, 1200, { path: '/workspace/src/lib/money.ts', content: 'export function formatMinor(amount: number) {\n  return (amount / 100).toFixed(2);\n}\n' }],
          ['bash', { command: 'pnpm test -- src/lib/money.test.ts' }, 2200, 'FAIL  src/lib/money.test.ts\n  × formatMinor › keeps cents on 9_140_000  4ms\n    Expected: "91400.00"\n    Received: "91399.99"'],
        ];
        for (const [name, input, ms, out] of TOOLS) { const tl = saiTool(name, input); worked.body.append(tl.el); ani(tl.el, 'chat-fade-in 200ms ease-out both'); await t.sleep(ms); tl.done(out); }
        const ans = mk('div', 'assist-md text-sm leading-relaxed text-foreground'); msg.append(ans);
        for (const para of ['The helper was dividing minor units as a float and then calling `toFixed(2)`. That is fine for small values and wrong once `amount / 100` is not representable.', '`src/lib/money.ts` now splits dollars and cents with integer math, and `pnpm test -- src/lib/money.test.ts` is green, including a **negative-balance** case.']) { const p = mk('p', 'mb-3 last:mb-0'); ans.append(p); await saiMd(p, para, t, 20, 36); }
        worked.trig.removeAttribute('role'); worked.label('Worked for 27s', false); worked.set(false);
        const foot = mk('div', 'flex min-w-0 items-center text-xs font-medium text-muted-foreground'); foot.innerHTML = `<button type="button" aria-label="Copy" title="Copy" class="assist-ghost grid size-6 place-items-center rounded-md transition-colors hover:text-foreground">${lu('copy', 'size-3.5')}</button>`; ani(foot, 'chat-fade-in 300ms ease-out both'); msg.append(foot);
        await t.sleep(4200);
      } },

    { group: 'Assist', title: 'Chat Input', desc: 'The chat input\'s status cycle: a prompt is typed with an @mention chip, sending flips the submit button to a spinner (submitted) and then to a Stop square while the reply streams — pressing it cuts the stream and returns to the send arrow.', kind: 'lib',
      async run(root, t) {
        const stage = saiStage(root, 'items-end'); const col = mk('div', 'flex w-full max-w-xl min-w-0 flex-col gap-3'); stage.append(col);
        const thread = mk('div', 'flex min-h-[150px] w-full min-w-0 flex-col justify-end gap-2.5'); col.append(thread);
        const MEMBERS = ['Alice Chen', 'Bruno Silva', 'Cara Nguyen', 'Diego Okonkwo', 'Elena Rossi'];
        const group = mk('div', 'assist-input relative flex h-auto w-full min-w-0 flex-col rounded-2xl transition-[color,box-shadow]'); group.dataset.slot = 'chat-input'; col.append(group);
        group.innerHTML = `<div class="max-h-48 min-h-16 w-full flex-1 overflow-y-auto px-3 py-0"><div class="assist-ed relative py-2 text-sm leading-relaxed text-foreground" contenteditable="false"><span class="assist-ph pointer-events-none absolute text-muted-foreground">Ask anything...</span><span class="assist-txt"></span><span class="assist-caret ml-px inline-block h-[1.05em] w-px translate-y-[2px] bg-foreground align-baseline" style="opacity:0"></span></div></div>
          <div class="flex w-full items-center gap-2 px-3 pt-1 pb-3"><button type="button" aria-label="Insert @" class="assist-outline grid size-8 shrink-0 place-items-center rounded-md">${lu('at-sign', 'size-4')}</button><button type="button" aria-label="Add files" class="assist-outline grid size-8 shrink-0 place-items-center rounded-md">${lu('paperclip', 'size-4')}</button><div class="ml-auto flex items-center gap-2"><button type="button" aria-label="Send" class="assist-submit assist-primary grid size-8 place-items-center rounded-md transition-opacity disabled:opacity-50">${lu('arrow-up', 'size-4')}</button></div></div>`;
        const txt = $('.assist-txt', group), ph = $('.assist-ph', group), caret = $('.assist-caret', group), submit = $('.assist-submit', group);
        let status = 'ready', stopped = false;
        const setStatus = (s) => {
          status = s; const inFlight = s === 'submitted' || s === 'streaming';
          submit.innerHTML = s === 'streaming' ? lu('square', 'size-4') : s === 'submitted' ? lu('loader-circle', `size-4 ${REDUCE ? '' : 'animate-spin'}`) : lu('arrow-up', 'size-4');
          submit.setAttribute('aria-label', s === 'streaming' ? 'Stop' : 'Send'); submit.disabled = inFlight && s !== 'streaming';
        };
        submit.onclick = () => { if (status === 'streaming') { stopped = true; setStatus('ready'); } };
        const type = async (s) => { ph.style.display = 'none'; caret.style.opacity = '1'; for (const ch of s) { txt.append(document.createTextNode(ch)); await t.sleep(36 + Math.random() * 30); } };
        await t.sleep(700); await type('Can you review the parser with ');
        await type('@'); await t.sleep(250);
        const pop = mk('div', 'assist-pop absolute bottom-[calc(100%-36px)] left-3 z-10 flex max-h-48 min-w-48 max-w-64 flex-col overflow-hidden rounded-md p-1 text-foreground'); ani(pop, 'chat-pop-in 150ms ease-out both');
        pop.innerHTML = MEMBERS.map((m, i) => `<button type="button" data-i="${i}" class="relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm select-none ${i === 0 ? 'bg-[var(--accent)]' : ''}"><span class="truncate">${esc(m)}</span></button>`).join('');
        group.append(pop);
        const sel = (i) => $$('[data-i]', pop).forEach((b, j) => b.classList.toggle('bg-[var(--accent)]', i === j));
        await t.sleep(500); sel(1); await t.sleep(400); sel(0); await t.sleep(450); pop.remove();
        txt.lastChild.remove(); const chip = mk('span', 'assist-primary rounded-sm px-1 py-0.5 no-underline', '@Alice Chen'); txt.append(chip, document.createTextNode(' '));
        await type('before Friday?'); await t.sleep(500);
        const text = txt.textContent.trim(); txt.textContent = ''; ph.style.display = ''; caret.style.opacity = '0';
        thread.append(saiUser(text)); setStatus('submitted');
        await t.sleep(900); setStatus('streaming');
        const ans = mk('div', 'assist-md text-sm leading-relaxed text-foreground'); thread.append(ans); const p = mk('p'); ans.append(p);
        const REPLY = 'Sure — I will tag **Alice Chen** on the review. The parser rejects anything that is not `(-?)digits(.digits{1,2})?`, so the edge cases worth a second look are one-digit fractions, negative balances and inputs with more than two decimal places, which still throw until we agree on a rounding rule.';
        const words = h.words(REPLY); let host = p; let n = 0;
        for (const w of words) {
          if (stopped) break;
          if (!w.trim()) { host.append(document.createTextNode(w)); continue; }
          let rest = w; while (rest) { const m = rest.match(/\*\*|`/); const before = m ? rest.slice(0, m.index) : rest; if (before) host.append(document.createTextNode(before)); if (!m) break; if (host === p) { host = m[0] === '**' ? mk('strong', 'font-semibold') : mk('code'); p.append(host); } else host = p; rest = rest.slice(m.index + m[0].length); }
          n++; if (n === 26) { await t.sleep(200); await press(submit, t, 0.9); } else await t.sleep(30 + Math.random() * 30);
        }
        await t.sleep(3800);
      } },

    { group: 'Assist', title: 'Plan Markers & Approval', desc: 'Message parts from the chat-page block: a data-plan rendered as shadcn Markers (check or circle, done items struck through) and an edit tool that pulses "Needs approval" until it is approved — then the follow-up tools run and the plan ticks off.', kind: 'lib',
      async run(root, t) {
        const stage = saiStage(root); const thread = mk('div', 'flex w-full max-w-xl min-w-0 flex-col gap-2.5'); stage.append(thread);
        thread.append(saiUser('Add parseMinor and export it from the package entry. Cover round-trips in tests.'));
        await t.sleep(600);
        const PLAN = ['Read money.ts and the existing test file', 'Add parseMinor next to formatMinor', 'Re-export from src/index.ts', 'Add round-trip tests and run them'];
        const plan = mk('div', 'my-2 flex flex-col gap-1'); thread.append(plan);
        const markers = PLAN.map((c, i) => { const m = mk('div', 'group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground'); ani(m, `chat-fade-in 250ms ease-out ${i * 70}ms both`); plan.append(m); return m; });
        const mark = (i, done) => { markers[i].innerHTML = `<span aria-hidden="true" class="size-4 shrink-0">${lu(done ? 'check' : 'circle', 'size-4')}</span><span class="min-w-0 ${done ? 'line-through' : ''}">${esc(PLAN[i])}</span>`; };
        PLAN.forEach((_, i) => mark(i, i === 0));
        await t.sleep(700);
        const txt = mk('div', 'assist-md text-sm leading-relaxed text-foreground'); thread.append(txt); const p = mk('p'); txt.append(p);
        await saiMd(p, 'I\'ll add `parseMinor` next to the integer formatter, re-export it from `src/index.ts`, and cover a round-trip on `91400.00`. That writes three files — approve the patch to apply it.', t, 18, 32);
        await t.sleep(300);
        const edit = saiTool('edit', { path: '/workspace/src/lib/money.ts', old_string: 'export function formatMinor(…)', new_string: 'export function formatMinor(…)\n\nexport function parseMinor(value: string): number { … }' }, { open: true });
        edit.extra('<span class="shrink-0 text-xs">Needs approval</span>'); thread.append(edit.el); ani(edit.el, 'chat-fade-in 250ms ease-out both');
        const acts = mk('div', 'flex gap-2 py-1'); acts.innerHTML = '<button type="button" class="assist-ok assist-primary inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium">Approve</button><button type="button" class="assist-no assist-outline inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium">Deny</button>';
        edit.body.append(acts);
        let decided = null;
        const decide = async (ok) => {
          if (decided !== null) return; decided = ok; acts.remove(); edit.extra('');
          if (!ok) { edit.extra('<span class="assist-destructive shrink-0 text-xs">Denied</span>'); edit.label($('.assist-label', edit.trig).textContent, false); edit.body.insertAdjacentHTML('beforeend', '<p class="assist-destructive text-xs">Denied</p>'); return; }
          await t.sleep(700); edit.done({ path: '/workspace/src/lib/money.ts', ok: true }); edit.set(false); mark(1, true);
          const STEPS = [['edit', { path: '/workspace/src/index.ts' }, 1300, { path: '/workspace/src/index.ts', ok: true }, 2], ['edit', { path: '/workspace/src/lib/money.test.ts' }, 1200, { path: '/workspace/src/lib/money.test.ts', ok: true }, -1], ['bash', { command: 'pnpm test -- src/lib/money.test.ts' }, 2000, 'PASS  src/lib/money.test.ts\n  ✓ parseMinor › round-trip 91400.00\n  ✓ parseMinor › rejects junk\n      4 passed', 3]];
          for (const [name, input, ms, out, m] of STEPS) { const tl = saiTool(name, input); thread.append(tl.el); ani(tl.el, 'chat-fade-in 200ms ease-out both'); await t.sleep(ms); tl.done(out); if (m >= 0) mark(m, true); }
          const done = mk('div', 'assist-md text-sm leading-relaxed text-foreground'); thread.append(done); const q = mk('p'); done.append(q);
          await saiMd(q, '`parseMinor` now lives next to `formatMinor` and the package entry re-exports both — **4/4** tests pass.', t, 20, 34);
        };
        $('.assist-ok', acts).onclick = () => decide(true); $('.assist-no', acts).onclick = () => decide(false);
        await t.sleep(1800); await press($('.assist-ok', acts), t);
        while (decided === null && !t.dead) await t.sleep(200);
        await t.sleep(decided ? 8000 : 2500);
      } },

    { group: 'Assist', title: 'Chat Side Panel', desc: 'The chat-page workspace panel beside the thread: when the agent reads a file its tab opens with the explorer tree on the right, the file path and contents on the left, and the content updates in place when the edit tool lands.', kind: 'lib',
      async run(root, t) {
        const stage = saiStage(root, '@container items-center !px-3');
        const grid = mk('div', 'grid w-full max-w-3xl min-w-0 grid-cols-1 gap-3 @[620px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]'); stage.append(grid);
        const chat = mk('div', 'flex min-w-0 flex-col justify-center gap-2.5'); grid.append(chat);
        const panel = mk('div', 'flex h-[300px] min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-[color-mix(in_oklab,var(--muted)_15%,transparent)]'); grid.append(panel);
        panel.innerHTML = `<div class="assist-tabs flex items-center gap-1 border-b border-border bg-background px-2 py-1.5"><button type="button" class="assist-ghost ml-auto grid size-7 place-items-center rounded-md text-muted-foreground">${lu('panel-right-close', 'size-3.5')}</button></div><div class="assist-content min-h-0 flex-1 overflow-hidden"><div class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"><p class="text-sm text-muted-foreground">Open a tool to start exploring the assistant workspace.</p><div class="flex flex-wrap justify-center gap-2">${[['folder-tree', 'Files'], ['globe', 'Browser'], ['terminal', 'Terminal']].map(([i, l]) => `<span class="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium">${lu(i, 'size-3.5')}${l}</span>`).join('')}</div></div></div>`;
        const OLD = 'export function formatMinor(amount: number) {\n  return (amount / 100).toFixed(2);\n}\n';
        const NEW = 'export function formatMinor(amountMinor: number) {\n  const sign = amountMinor < 0 ? "-" : "";\n  const abs = Math.abs(Math.trunc(amountMinor));\n  const dollars = Math.floor(abs / 100);\n  const cents = abs % 100;\n  return `${sign}${dollars}.${cents.toString().padStart(2, "0")}`;\n}\n';
        chat.append(saiUser('formatMinor is dropping cents on large invoice totals. Find and fix it.'));
        await t.sleep(700);
        const read = saiTool('read', { path: '/workspace/src/lib/money.ts' }); chat.append(read.el); await t.sleep(1200); read.done({ path: '/workspace/src/lib/money.ts', ok: true });
        // Files tab opens: file content (65%) | explorer tree (35%)
        $('.assist-tabs', panel).insertAdjacentHTML('afterbegin', `<div class="group flex max-w-[180px] shrink-0 items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground" style="animation:chat-pop-in 200ms ease-out both"><span class="flex min-w-0 flex-1 items-center gap-1.5">${lu('folder-tree', 'size-3 shrink-0')}<span class="truncate">Files</span></span><span class="rounded-sm p-0.5 opacity-60">${lu('x', 'size-3')}</span></div><span class="grid size-7 shrink-0 place-items-center text-muted-foreground">${lu('plus', 'size-3.5')}</span>`);
        const node = (name, depth, folder, active) => `<div class="flex w-full items-center gap-${folder ? 1 : 2} rounded-md px-2 py-1.5 text-left ${folder ? '' : active ? 'bg-muted text-foreground' : 'text-muted-foreground'}">${folder ? `${lu('chevron-right', 'size-3.5 shrink-0 rotate-90 text-muted-foreground')}${lu('folder', 'size-3.5 shrink-0 text-muted-foreground')}<span class="truncate font-medium">${name}</span>` : `${lu('file', 'size-3.5 shrink-0')}<span class="truncate">${name}</span>`}</div>`;
        const tree = `<div class="flex flex-col gap-0.5 p-2 text-sm">${node('workspace', 0, true)}<div class="ml-3.5 flex flex-col gap-0.5 border-l border-border/60 pl-1.5">${node('src', 1, true)}<div class="ml-3.5 flex flex-col gap-0.5 border-l border-border/60 pl-1.5">${node('index.ts', 2)}${node('lib', 2, true)}<div class="ml-3.5 flex flex-col gap-0.5 border-l border-border/60 pl-1.5">${node('money.ts', 3, false, true)}${node('money.test.ts', 3)}${node('utils.ts', 3)}</div></div></div></div>`;
        const content = $('.assist-content', panel);
        content.innerHTML = `<div class="grid h-full min-h-0 grid-cols-[65%_35%]"><div class="flex h-full min-h-0 min-w-0 flex-col"><div class="truncate border-b border-border px-3 py-2 text-xs text-muted-foreground">/workspace/src/lib/money.ts</div><pre class="assist-file min-h-0 flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed"></pre></div><div class="min-h-0 overflow-auto border-l border-border bg-background">${tree}</div></div>`;
        ani(content.firstElementChild, 'chat-fade-in 250ms ease-out both');
        const file = $('.assist-file', content); file.textContent = OLD;
        await t.sleep(900);
        const bash = saiTool('bash', { command: 'pnpm test -- src/lib/money.test.ts' }); chat.append(bash.el); await t.sleep(1600); bash.done('FAIL  src/lib/money.test.ts\n  × keeps cents on 9_140_000');
        const edit = saiTool('edit', { path: '/workspace/src/lib/money.ts' }); chat.append(edit.el); await t.sleep(1500); edit.done({ path: '/workspace/src/lib/money.ts', ok: true });
        file.textContent = ''; for (const line of NEW.split('\n')) { file.textContent += line + '\n'; await t.sleep(70); }
        ani(file, 'none'); file.style.transition = 'background-color 600ms ease'; file.style.backgroundColor = 'color-mix(in oklab, var(--foreground) 6%, transparent)'; await t.sleep(600); file.style.backgroundColor = '';
        const ans = mk('div', 'assist-md text-sm leading-relaxed text-foreground'); chat.append(ans); const p = mk('p'); ans.append(p);
        await saiMd(p, 'Fixed: `formatMinor` now splits dollars and cents with integer math.', t, 20, 34);
        await t.sleep(3800);
      } },

    /* ================================================== Transitions */
    { group: 'Transitions', title: 'Thinking States', desc: 'One status line for what the agent is doing: a narrow highlight band sweeps the label every 2 s, and after each 2 s hold the line swaps — the old state exits up through a 2 px blur while the next enters from below, both in 150 ms.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-transitions flex min-h-[320px] w-full items-center justify-center rounded-[20px] p-6'); root.append(stage);
        const STATES = ['Setting up a workplace', 'Running a command', 'Browsing files'];
        const box = mk('span', 'td-swap'); box.setAttribute('role', 'status');
        box.innerHTML = `<span class="td-sizer" aria-hidden="true">${STATES[0]}</span><span class="td-think" data-text="${STATES[0]}">${STATES[0]}</span>`; stage.append(box);
        let live = $('.td-think', box); let i = 0;
        if (REDUCE) { await t.sleep(8000); return; }
        for (let n = 0; n < 4; n++) {
          await t.sleep(2000);
          const leaving = live; i = (i + 1) % STATES.length; leaving.classList.add('is-exit');
          const next = mk('span', 'td-think is-enter-start'); next.textContent = STATES[i]; next.dataset.text = STATES[i]; box.append(next); live = next;
          await t.sleep(50); void next.offsetWidth; next.classList.remove('is-enter-start');
          await t.sleep(150); leaving.remove();
        }
        await t.sleep(1200);
      } },

    { group: 'Transitions', title: 'Agent Reasoning Stream', desc: 'A 256 × 144 card is a viewport onto a long reasoning transcript: every 840 ms it steps up two lines with a 500 ms smooth-out ease, soft masked fades at the top and bottom edges, and a duplicated copy that makes the wrap seamless.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-transitions flex min-h-[320px] w-full items-center justify-center rounded-[20px] p-6'); root.append(stage);
        const PARAS = ['Two things could explain the lag: the blur is re-running every frame, or the mask is forcing a repaint. Worth separating them before picking a fix.', 'Animating mask-position never composites — it repaints the element. And the element being repainted sits inside a displacement chain, so the whole filter re-executes on the CPU each frame. That compounds: it isn\'t one cost, it\'s the repaint feeding the filter.', 'So the fix isn\'t tuning the blur radius. The animated property has to leave the paint path entirely. If the field is painted statically and covered by a same-coloured curtain, translating the curtain is visually identical to masking — and transform composites.', 'One trade-off: the waves travel with the band instead of rippling through noise fixed in space. In motion, near-indistinguishable.'];
        const card = mk('div', 'td-reason-card'); card.setAttribute('aria-hidden', 'true'); stage.append(card);
        const textHtml = `<div class="td-reason-text">${PARAS.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`;
        card.innerHTML = `<div class="td-reason-viewport"><div class="td-reason-scroll">${textHtml}${textHtml}</div></div>`;
        const scroll = $('.td-reason-scroll', card), text = $('.td-reason-text', card);
        if (REDUCE) { await t.sleep(9000); return; }
        let offset = 0; const end = performance.now() + 12500;
        while (performance.now() < end && !t.dead) {
          await t.sleep(840);
          const lineH = parseFloat(getComputedStyle(text).lineHeight) || 18.2; offset += lineH * 2;
          scroll.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'; scroll.style.transform = `translateY(${-offset}px)`;
          await t.sleep(530);
          const copyH = text.offsetHeight; if (offset >= copyH) { offset -= copyH; scroll.style.transition = 'none'; scroll.style.transform = `translateY(${-offset}px)`; void scroll.offsetWidth; }
        }
      } },

    { group: 'Transitions', title: 'Streaming Text', desc: 'Words materialise the way model output streams: the paragraph wipes back to nothing, then each word fades in through a 1 px cross-blur over 350 ms, 60 ms after the previous one — text condensing out of thin air rather than a fade-in.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-transitions flex min-h-[320px] w-full items-center justify-center rounded-[20px] p-6'); root.append(stage);
        const TEXT = 'Animating mask-position never composites — it repaints the element. And the element being repainted sits inside a displacement chain, so the whole filter re-executes on the CPU each frame. That compounds: it isn\'t one cost, it\'s the repaint feeding the filter.';
        const block = mk('div', 'td-stream'); stage.append(block);
        const spans = TEXT.split(/\s+/).map((w, i, a) => { const s = mk('span', 'td-w'); s.textContent = w; block.append(s); if (i < a.length - 1) block.append(document.createTextNode(' ')); return s; });
        if (REDUCE) { spans.forEach((s) => s.classList.add('is-in')); await t.sleep(8000); return; }
        await t.sleep(500);
        for (const s of spans) { s.classList.add('is-in'); await t.sleep(60); }
        await t.sleep(4800);
      } },

    { group: 'Transitions', title: 'Matrix Dot Loader', desc: 'Four 4 × 4 matrices of 2 px dots on one 1.2 s colour pulse with per-dot delays — column scan, baked random twinkle, a perimeter orbit around a steady centre and a centre-out pulse — shown at native size beside a status line and enlarged.', kind: 'lib',
      async run(root, t) {
        const stage = mk('div', 'lib-transitions flex min-h-[320px] w-full flex-col items-center justify-center gap-10 rounded-[20px] p-6'); root.append(stage);
        const CORNERS = [0, 3, 12, 15], RING = [1, 2, 7, 11, 14, 13, 8, 4], INNER = [5, 6, 9, 10], TWINKLE = [7, 2, 11, 5, 14, 9, 0, 12, 3, 15, 6, 10, 13, 1, 8, 4], cycle = 1200;
        const VARIANTS = [['scan', false, 'Scanning'], ['twinkle', false, 'Thinking'], ['orbit', true, 'Searching'], ['pulse', true, 'Writing']];
        const loader = (variant, rounded, dot) => {
          const l = mk('div', 'td-matrix'); l.dataset.variant = variant; l.dataset.rounded = String(rounded); l.style.setProperty('--dot', dot + 'px');
          for (let idx = 0; idx < 16; idx++) {
            const d = mk('i'); const col = idx % 4;
            if (rounded && CORNERS.includes(idx)) d.className = 'is-gap';
            else if (variant === 'scan') d.style.setProperty('--d', String(Math.round(col * (cycle / 10))));
            else if (variant === 'twinkle') d.style.setProperty('--d', String(Math.round(TWINKLE[idx] * (cycle / 16))));
            else if (variant === 'orbit') { const k = RING.indexOf(idx); if (k !== -1) d.style.setProperty('--d', String(Math.round(k * (cycle / 8)))); else d.style.animation = 'none'; }
            else if (variant === 'pulse') d.style.setProperty('--d', String(Math.round((INNER.includes(idx) ? 0 : 1) * (cycle * 0.16))));
            l.append(d);
          }
          return l;
        };
        const big = mk('div', 'flex flex-wrap items-center justify-center gap-10'); VARIANTS.forEach(([v, r]) => big.append(loader(v, r, 6))); stage.append(big);
        const rows = mk('div', 'flex flex-col gap-2.5'); stage.append(rows);
        VARIANTS.forEach(([v, r, label], i) => { const row = mk('div', 'flex items-center gap-2.5 text-[13px] font-medium'); row.append(loader(v, r, 2)); row.insertAdjacentHTML('beforeend', `<span style="color:var(--p28-base)">${label}</span>`); ani(row, `tu-rise 320ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`); rows.append(row); });
        await t.sleep(9000);
      } },

    /* ========================================================= Tool cards */
    { group: 'Tool cards', title: 'Approval Card', desc: 'Binary confirmation for an agent action, rendered as the tool result: icon tile, title, description and optional metadata, Deny / Approve pills — then the decision collapses into a receipt that zooms in from a 4 px blur. Cycles deploy, destructive and metadata presets.', kind: 'lib',
      async run(root, t, ctx) {
        const PRESETS = [
          { ask: 'Ship the latest build to production.', tool: 'request_approval · deploy', title: 'Deploy to Production', description: 'This will push the latest changes to all users.', icon: 'rocket', confirm: 'Deploy', choice: 'approved' },
          { ask: 'Delete the old marketing-site project.', tool: 'request_approval · delete_project', title: 'Delete Project', description: 'This action cannot be undone. All files, settings, and history will be permanently removed.', icon: 'trash-2', variant: 'destructive', confirm: 'Delete Project', cancel: 'Keep Project', choice: 'denied' },
          { ask: 'Send this week\'s digest to everyone.', tool: 'request_approval · send_campaign', title: 'Send Email Campaign', description: 'Review the details before sending to your subscribers.', icon: 'mail', metadata: [['Recipients', '12,847 subscribers'], ['Subject', 'Your Weekly Digest'], ['Scheduled', 'Immediately']], confirm: 'Send Now', choice: 'approved' },
        ];
        ctx.ac = ((ctx.ac ?? -1) + 1) % PRESETS.length; const P = PRESETS[ctx.ac]; const destructive = P.variant === 'destructive';
        const col = tuStage(root); await tuAsk(col, t, P.ask); await tuCall(col, t, P.tool, 900);
        const art = mk('article', 'tu-rise flex w-full min-w-0 flex-col gap-3 text-foreground'); art.setAttribute('role', 'dialog');
        art.innerHTML = `<div class="tu-card flex w-full flex-col gap-4 rounded-2xl p-5"><div class="flex items-start gap-3"><span class="flex size-10 shrink-0 items-center justify-center rounded-xl ${destructive ? 'tu-bg-destructive-10' : 'tu-bg-primary-10'}">${lu(P.icon, 'size-5')}</span><div class="flex min-w-0 flex-1 flex-col gap-1"><h2 class="text-base leading-tight font-semibold">${esc(P.title)}</h2><p class="text-sm text-muted-foreground">${esc(P.description)}</p></div></div>${P.metadata ? `<div class="tu-sep"></div><dl class="flex flex-col gap-2 text-sm">${P.metadata.map(([k, v]) => `<div class="flex justify-between gap-4"><dt class="shrink-0 text-muted-foreground">${esc(k)}</dt><dd class="min-w-0 truncate">${esc(v)}</dd></div>`).join('')}</dl>` : ''}</div>`;
        const decide = (choice) => {
          const ok = choice === 'approved'; const label = ok ? 'Approved' : 'Denied';
          const rc = mk('div', 'tu-in flex w-full min-w-0 flex-col text-foreground'); rc.setAttribute('role', 'status');
          rc.innerHTML = `<div class="tu-card-60 flex w-full items-center gap-3 rounded-2xl px-4 py-3"><span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted ${ok ? 'tu-primary' : 'text-muted-foreground'}">${lu(ok ? 'check' : 'x', 'size-4')}</span><div class="flex min-w-0 flex-col"><span class="text-sm font-medium">${label}</span><span class="truncate text-sm text-muted-foreground">${esc(P.title)}</span></div></div>`;
          art.replaceWith(rc);
        };
        const acts = tuActions([{ id: 'cancel', label: P.cancel || 'Deny', variant: 'ghost', onClick: () => decide('denied') }, { id: 'confirm', label: P.confirm, variant: destructive ? 'destructive' : 'default', onClick: () => decide('approved') }]);
        art.append(acts); col.append(art);
        await t.sleep(2200);
        const btn = acts.btn[P.choice === 'approved' ? 'confirm' : 'cancel']; btn.classList.add('is-hover'); await t.sleep(400); await press(btn, t, 0.97);
        await t.sleep(3800);
      } },

    { group: 'Tool cards', title: 'Message Draft', desc: 'Review a drafted message before it goes out: an email (subject, From / To / Cc table, body) or a Slack post with channel and member count. Send starts a 5-second undo window counting down beside an Undo pill, then settles into "Sent at" with a check.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.md = (ctx.md || 0) + 1; const slack = ctx.md % 2 === 0;
        const col = tuStage(root);
        await tuAsk(col, t, slack ? 'Let #eng-releases know v2.4.1 is out.' : 'Draft a reply to Dana about the Q4 budget.');
        await tuCall(col, t, slack ? 'draft_message · slack' : 'draft_message · email', 1000);
        const art = mk('article', 'tu-rise flex w-full min-w-0 flex-col gap-3 text-foreground');
        const row = (label, value, muted) => `<tr class="text-sm"><td class="w-0 pr-4 pb-1 text-right align-top font-medium whitespace-nowrap text-muted-foreground">${label}</td><td class="pb-1 align-top ${muted ? 'text-muted-foreground' : ''}">${value}</td></tr>`;
        const SLACK = '<svg class="size-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/><path fill="#2EB67D" d="M18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.52 2.521h-2.522V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312z"/><path fill="#ECB22E" d="M15.165 18.958a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.521-2.52v-2.522h2.521zm0-1.271a2.527 2.527 0 0 1-2.521-2.521 2.526 2.526 0 0 1 2.521-2.521h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z"/></svg>';
        const body = slack ? 'Shipped v2.4.1 to production. Changes:\n- Fixed auth token refresh bug\n- Improved search latency by 40%\n- Added keyboard shortcuts for power users\n\nMonitoring dashboards look good. Rollback plan ready if needed.'
          : 'Hi team,\n\nFollowing up on yesterday\'s meeting. I\'ve compiled the department requests and attached the consolidated spreadsheet.\n\nKey changes from last quarter:\n- Engineering: +15% for infrastructure scaling\n- Marketing: Flat (reallocating to digital)\n- Support: +8% for new hires\n\nPlease review and flag any concerns by Friday.\n\nThanks,\nDana';
        const head = slack ? `<div class="flex items-center gap-1.5 text-sm font-medium">${SLACK}<span>#eng-releases</span><span class="ml-auto text-sm font-normal text-muted-foreground">47 members</span></div>`
          : `<h2 class="pt-2 text-base leading-tight font-semibold">Re: Q4 Budget Review Meeting</h2><table class="w-full"><tbody>${row('From', 'dana.kim@example.com')}${row('To', 'finance-team@example.com')}${row('Cc', 'jamie.wright@example.com, ops@example.com')}${row('Bcc', 'cfo@example.com', true)}</tbody></table>`;
        art.innerHTML = `<div class="tu-card flex w-full flex-col gap-3 rounded-2xl px-5 pt-3 pb-5">${head}<div class="-mx-5 h-px bg-border" role="separator"></div><div class="relative"><div class="tu-body overflow-hidden text-sm leading-relaxed transition-[max-height] duration-300 ease-in-out" style="max-height:${slack ? 400 : 150}px"><p class="pt-1 whitespace-pre-wrap">${esc(body)}</p></div>${slack ? '' : '<div class="tu-fade pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--card)] to-transparent transition-[height] duration-300 ease-in-out"></div>'}</div>${slack ? '' : `<button type="button" class="tu-more tu-btn tu-btn-ghost !h-7 w-fit gap-1 !rounded-md !px-2 text-sm">Read more${lu('chevron-down', 'size-3')}</button>`}</div>`;
        const foot = mk('div'); art.append(foot); col.append(art);
        if (!slack) { const more = $('.tu-more', art); let open = false; more.onclick = () => { open = !open; $('.tu-body', art).style.maxHeight = open ? $('.tu-body', art).scrollHeight + 'px' : '150px'; $('.tu-fade', art).style.height = open ? '0' : ''; more.innerHTML = `${open ? 'Show less' : 'Read more'}${lu('chevron-down', `size-3 ${open ? 'rotate-180' : ''}`)}`; }; }
        let state = 'review', count = 5, timer = null;
        const render = () => {
          if (state === 'review') { foot.innerHTML = ''; const a = tuActions([{ id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: () => { state = 'cancelled'; art.remove(); } }, { id: 'send', label: 'Send', onClick: startSend }]); foot.append(a); foot.btn = a.btn; }
          else if (state === 'sending') { foot.innerHTML = `<div class="flex items-center justify-end gap-3" aria-live="polite"><span class="text-sm text-muted-foreground">Sending in <span class="tu-count tabular-nums">${count}</span>s</span><button type="button" class="tu-undo tu-btn tu-btn-outline !h-8 !rounded-full !px-3">Undo</button></div>`; $('.tu-undo', foot).onclick = () => { t.stop(timer); state = 'review'; render(); }; }
          else if (state === 'sent') { const time = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); foot.innerHTML = `<div class="tu-in flex items-center justify-end gap-2 text-sm" role="status" aria-label="Message sent"><span class="text-muted-foreground">Sent at ${time}</span><span class="tu-bg-primary-10 flex size-6 shrink-0 items-center justify-center rounded-full">${lu('check', 'size-3.5')}</span></div>`; }
        };
        const startSend = () => { state = 'sending'; count = 5; render(); timer = t.every(1000, () => { count = Math.max(0, count - 1); const c = $('.tu-count', foot); if (c) c.textContent = count; if (count === 0) { t.stop(timer); state = 'sent'; render(); } }); };
        render();
        await t.sleep(slack ? 1800 : 1200);
        if (!slack) { await press($('.tu-more', art), t); await t.sleep(1400); }
        foot.btn.send.classList.add('is-hover'); await t.sleep(300); await press(foot.btn.send, t, 0.97);
        await t.sleep(5600); await t.sleep(2600);
      } },

    { group: 'Tool cards', title: 'Plan', desc: 'A step-by-step plan the agent keeps current: todos enter on a 50 ms stagger, the active one spins with a shimmering label, completed steps zoom a check in and the progress bar eases forward — the overflow folds into "4 more", and a described step expands.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'Plan the move from sessions to JWT auth.'); await tuCall(col, t, 'update_plan', 900);
        const TODOS = [
          { label: 'Review existing auth flow', status: 'completed', description: 'Analyzed current session-based auth and identified pain points' },
          { label: 'Design new token structure', status: 'completed', description: 'Created JWT schema with access/refresh token separation' },
          { label: 'Implement JWT middleware', status: 'in_progress', description: 'Adding token validation and refresh logic to API routes' },
          { label: 'Add refresh token logic', status: 'pending' }, { label: 'Update user model', status: 'pending' },
          { label: 'Write integration tests', status: 'pending', description: 'Cover auth flows, token expiry, and edge cases' }, { label: 'Update API documentation', status: 'pending' }, { label: 'Deploy to staging', status: 'pending' },
        ];
        const card = mk('div', 'tu-card tu-rise isolate flex w-full min-w-0 flex-col gap-4 rounded-xl py-4');
        card.innerHTML = `<div class="flex flex-row items-start justify-between gap-4 px-6"><div class="space-y-1.5"><div class="leading-5 font-medium text-pretty">Feature Implementation Plan</div><div class="text-sm text-muted-foreground">Step-by-step guide for implementing the new authentication system</div></div><span class="tu-all hidden">${lu('check', 'mt-0.5 size-5 shrink-0 text-emerald-500')}</span></div><div class="min-w-0 px-4"><div class="min-w-0 rounded-lg bg-muted/70 px-4 py-4 sm:px-6"><div class="tu-sum mb-2 text-sm text-muted-foreground"></div><div class="relative mb-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar"><div class="tu-bar h-full rounded-full transition-all duration-500" style="width:0;background:var(--primary);box-shadow:inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)"></div></div><ul class="tu-list mt-4 min-w-0 space-y-1"></ul></div></div>`;
        col.append(card);
        const list = $('.tu-list', card);
        const label = (td) => `<span class="text-sm leading-6 font-medium break-words ${td.status === 'pending' || td.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'} ${td.status === 'in_progress' && !REDUCE ? 'tu-shimmer' : ''}">${esc(td.label)}</span>`;
        const items = TODOS.map((td, i) => {
          const li = mk('li', 'relative -mx-2 min-w-0 cursor-default rounded-md');
          li.innerHTML = `${i < TODOS.length - 1 && i !== 3 ? '<div class="absolute top-6 left-5 w-px bg-border" style="height:calc(100% + 0.25rem)" aria-hidden="true"></div>' : ''}<div class="tu-row min-w-0 rounded-md transition-all duration-200"><button type="button" class="group/todo flex w-full cursor-default items-start gap-3 px-2 py-1.5 text-left"><div class="tu-ic relative z-10"></div><span class="tu-lb min-w-0 flex-1"></span>${td.description ? lu('chevron-right', 'tu-chev mt-0.5 size-4 shrink-0 rotate-90 text-muted-foreground/50 transition-transform duration-300') : ''}</button>${td.description ? '' : ''}</div>`;
          if (td.description) { const d = rowsDisclosure(false, 'duration-200'); d.inner.innerHTML = `<p class="min-w-0 pr-2 pb-1.5 pl-11 text-sm text-pretty break-words text-muted-foreground">${esc(td.description)}</p>`; $('.tu-row', li).append(d); li.det = d; $('button', li).onclick = () => { li.open = !li.open; d.set(li.open); $('.tu-row', li).classList.toggle('tu-bg-primary-5', li.open); $('.tu-chev', li).style.transform = li.open ? 'rotateY(180deg) rotate(90deg)' : ''; }; }
          return li;
        });
        const paint = () => {
          const done = TODOS.filter((x) => x.status === 'completed').length; const pct = Math.round(done / TODOS.length * 100);
          $('.tu-sum', card).textContent = `${done} of ${TODOS.length} complete`; $('.tu-bar', card).style.width = pct + '%';
          items.forEach((li, i) => { const td = TODOS[i]; if (li.st !== td.status) { li.st = td.status; $('.tu-ic', li).innerHTML = tuStepIcon(td.status); $('.tu-lb', li).innerHTML = label(td); } });
        };
        // 4 visible + "N more" accordion
        items.slice(0, 4).forEach((li, i) => { ani(li, `tu-rise 300ms ease-out ${i * 50}ms backwards`); list.append(li); });
        const more = mk('li', 'mt-1'); const moreBtn = mk('button', 'flex cursor-default items-start justify-start gap-2 py-1 text-sm font-normal text-muted-foreground hover:text-foreground', `${lu('ellipsis', 'mt-0.5 size-4 shrink-0 text-muted-foreground/70')}<span>4 more</span>`); moreBtn.type = 'button';
        const moreBody = rowsDisclosure(false, 'duration-200'); const moreUl = mk('ul', '-mx-2 space-y-2 px-2 pt-2'); moreBody.inner.append(moreUl); items.slice(4).forEach((li) => moreUl.append(li));
        let moreOpen = false; moreBtn.onclick = () => { moreOpen = !moreOpen; moreBody.set(moreOpen); };
        more.append(moreBtn, moreBody); list.append(more);
        paint();
        await t.sleep(1600); await press($('button', items[2]), t, 0.99); await t.sleep(1600); $('button', items[2]).click();
        TODOS[2].status = 'completed'; TODOS[3].status = 'in_progress'; paint();
        await t.sleep(1800); TODOS[3].status = 'completed'; TODOS[4].status = 'in_progress'; paint();
        await t.sleep(900); await press(moreBtn, t, 0.99);
        await t.sleep(1700); TODOS[4].status = 'completed'; TODOS[5].status = 'in_progress'; paint();
        await t.sleep(3200);
      } },

    { group: 'Tool cards', title: 'Progress Tracker', desc: 'Live status for a multi-step operation: the current step is tinted and its label shimmers, its description opens in a grid-rows reveal, the elapsed timer ticks in mono — and the finished run becomes a receipt. Alternates a successful deploy with a failed migration.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.pt = (ctx.pt || 0) + 1; const fail = ctx.pt % 2 === 0;
        const col = tuStage(root);
        await tuAsk(col, t, fail ? 'Run the user_id migration on prod.' : 'Deploy the release branch.'); await tuCall(col, t, fail ? 'run_migration' : 'deploy', 800);
        const STEPS = fail
          ? [{ label: 'Connect to Database', description: 'postgres://prod-db-1.example.com', status: 'in-progress' }, { label: 'Create Backup', description: 'Snapshot before migration', status: 'pending' }, { label: 'Run Migrations', description: 'Failed: column \'user_id\' already exists', status: 'pending' }, { label: 'Verify Schema', status: 'pending' }]
          : [{ label: 'Building', description: 'Compiling TypeScript and bundling assets', status: 'in-progress' }, { label: 'Running Tests', description: '147 tests across 23 suites', status: 'pending' }, { label: 'Deploy to Production', description: 'Upload to edge nodes', status: 'pending' }];
        const fmt = (ms) => { const s = Math.round(Math.max(0, ms) / 100) / 10; return s < 60 ? s.toFixed(1) + 's' : `${Math.floor(s / 60)}m ${Math.floor(s) % 60}s`; };
        const art = mk('article', 'tu-rise isolate flex w-full min-w-0 flex-col gap-3 text-foreground select-none'); art.setAttribute('role', 'status'); art.setAttribute('aria-live', 'polite');
        art.innerHTML = `<div class="tu-card flex w-full flex-col gap-4 rounded-2xl p-5"><div class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">${lu('timer', '-mt-px size-3.5')}<time class="tu-el">0.0s</time></div><ol class="m-0 flex list-none flex-col gap-3 p-0"></ol></div>`;
        col.append(art);
        const ol = $('ol', art);
        const lis = STEPS.map((s, i) => {
          const li = mk('li', 'relative -mx-2');
          li.innerHTML = `${i < STEPS.length - 1 ? '<div class="absolute top-6 left-5 w-px bg-border" style="height:calc(100% + 0.25rem)" aria-hidden="true"></div>' : ''}<div class="tu-r relative z-10 flex items-start gap-3 rounded-lg px-2 py-1.5 transition-all duration-300"><div class="tu-ic relative z-10"></div><div class="flex flex-1 flex-col"><span class="tu-lb text-sm leading-6 font-medium">${esc(s.label)}</span>${s.description ? `<div class="tu-d grid transition-[grid-template-rows,opacity] duration-300 ease-out" style="grid-template-rows:0fr;opacity:0"><div class="overflow-hidden"><span class="block pt-0.5 text-sm text-muted-foreground">${esc(s.description)}</span></div></div>` : ''}</div></div>`;
          ol.append(li); return li;
        });
        const paint = () => {
          const cur = STEPS.findIndex((s) => s.status === 'in-progress') >= 0 ? STEPS.findIndex((s) => s.status === 'in-progress') : STEPS.findIndex((s) => s.status === 'failed');
          lis.forEach((li, i) => {
            const s = STEPS[i]; if (li.st !== s.status) { li.st = s.status; $('.tu-ic', li).innerHTML = tuStepIcon(s.status); }
            const lb = $('.tu-lb', li); lb.classList.toggle('text-muted-foreground', s.status === 'pending'); lb.classList.toggle('tu-shimmer', s.status === 'in-progress' && !REDUCE);
            $('.tu-r', li).classList.toggle('tu-bg-primary-5', i === cur); li.toggleAttribute('aria-current', i === cur);
            const d = $('.tu-d', li); if (d) { const show = s.status === 'in-progress' || s.status === 'failed'; d.style.gridTemplateRows = show ? '1fr' : '0fr'; d.style.opacity = show ? '1' : '0'; }
          });
        };
        let ms = fail ? 6100 : 41000; const el = $('.tu-el', art); const iv = t.every(100, () => { ms += 100; el.textContent = fmt(ms); });
        paint();
        const seq = fail ? [[1400, 0, 'completed', 1], [1400, 1, 'completed', 2], [1500, 2, 'failed', -1]] : [[1600, 0, 'completed', 1], [2200, 1, 'completed', 2], [1800, 2, 'completed', -1]];
        for (const [wait, i, st, next] of seq) { await t.sleep(wait); STEPS[i].status = st; if (next >= 0) STEPS[next].status = 'in-progress'; paint(); }
        t.stop(iv); await t.sleep(1300);
        const ok = !fail; const rc = mk('div', 'tu-in isolate flex w-full min-w-0 flex-col text-foreground select-none'); rc.setAttribute('role', 'status');
        rc.innerHTML = `<div class="tu-card-60 flex w-full flex-col gap-4 rounded-2xl p-5"><div class="flex items-center justify-between"><div class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">${lu('timer', '-mt-px size-3.5')}<time>${fmt(ms)}</time></div><span class="flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-600 dark:text-emerald-500' : 'tu-destructive'}">${lu(ok ? 'check' : 'circle-alert', 'size-3.5')}${ok ? 'Deployment complete' : 'Migration failed'}</span></div><ol class="m-0 flex list-none flex-col gap-2 p-0">${STEPS.map((s, i) => `<li class="relative -mx-2 flex items-start gap-3 rounded-lg px-2 py-1.5">${i < STEPS.length - 1 ? '<div class="absolute top-8 left-5 w-px bg-border" style="height:calc(100% + 0.5rem)" aria-hidden="true"></div>' : ''}<div class="relative z-10">${tuStepIcon(s.status)}</div><div class="flex flex-1 flex-col gap-0.5"><span class="text-sm leading-6 font-medium">${esc(s.label)}</span>${s.status === 'failed' ? `<span class="text-sm text-muted-foreground">${esc(s.description)}</span>` : ''}</div></li>`).join('')}</ol></div>`;
        art.replaceWith(rc);
        await t.sleep(3800);
      } },

    { group: 'Tool cards', title: 'Terminal', desc: 'A command\'s output as a tool result: header with cwd$ command, ANSI-coloured stdout streaming line by line (stderr in red), then the duration and exit code settle in and the copy button confirms. Alternates a passing test run with a failing build.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.term = (ctx.term || 0) + 1; const err = ctx.term % 2 === 0;
        const col = tuStage(root);
        await tuAsk(col, t, err ? 'Build it for production.' : 'Run the test suite.'); await tuCall(col, t, `run_command · ${err ? 'pnpm build' : 'pnpm test'}`, 700);
        const E = '\x1b';
        const P = err ? { command: 'pnpm build', stdout: 'Building application...\nCompiling TypeScript...', stderr: 'error TS2345: Argument of type \'string\' is not assignable to parameter of type \'number\'.\n  src/utils.ts:23:15\n    23   calculate(input);\n                  ~~~~~\nFound 1 error in src/utils.ts:23', exit: 1, dur: '1.5s' }
          : { command: 'pnpm test', stdout: `${E}[32m✓${E}[0m src/utils.test.ts ${E}[90m(5 tests)${E}[0m ${E}[33m23ms${E}[0m\n${E}[32m✓${E}[0m src/api.test.ts ${E}[90m(12 tests)${E}[0m ${E}[33m156ms${E}[0m\n${E}[32m✓${E}[0m src/components.test.ts ${E}[90m(8 tests)${E}[0m ${E}[33m89ms${E}[0m\n\n${E}[1mTest Files${E}[0m  ${E}[32m3 passed${E}[0m (3)\n${E}[1m     Tests${E}[0m  ${E}[32m25 passed${E}[0m (25)\n${E}[1m  Start at${E}[0m  10:23:45\n${E}[1m  Duration${E}[0m  312ms`, exit: 0, dur: '312ms' };
        const ANSI = { 1: 'font-bold', 32: 'text-green-600 dark:text-green-400', 33: 'text-yellow-600 dark:text-yellow-400', 36: 'text-cyan-600 dark:text-cyan-400', 90: 'text-muted-foreground' };
        const ansi = (s) => { let cls = [], out = ''; s.split(/\x1b\[(\d+)m/).forEach((part, i) => { if (i % 2) { cls = part === '0' ? [] : [...cls, ANSI[part] || '']; } else if (part) out += cls.length ? `<span class="${cls.join(' ')}">${esc(part)}</span>` : esc(part); }); return out; };
        const box = mk('div', 'tu-rise flex w-full min-w-0 flex-col gap-3');
        box.innerHTML = `<div class="tu-card overflow-hidden rounded-lg"><div class="flex items-center justify-between gap-2 border-b border-border bg-[var(--card)] px-4 py-2"><div class="flex min-w-0 items-center gap-2 overflow-hidden">${lu('terminal', 'h-4 w-4 shrink-0 text-muted-foreground')}<code class="truncate font-mono text-xs text-foreground"><span class="text-muted-foreground">~/project$ </span>${esc(P.command)}</code></div><div class="flex shrink-0 items-center gap-3"><span class="tu-dur font-mono text-sm text-muted-foreground tabular-nums"></span><span class="tu-exit font-mono text-sm tabular-nums"></span><button type="button" aria-label="Copy output" class="tu-copy tu-btn tu-btn-ghost !h-7 !w-7 !rounded-md !p-0">${lu('copy', 'h-4 w-4 text-muted-foreground')}</button></div></div><div class="relative font-mono text-[13px]"><div class="overflow-x-auto p-4"><div class="tu-out whitespace-pre text-foreground"></div><div class="tu-err mt-2 whitespace-pre text-red-500 dark:text-red-400" hidden></div></div></div></div>`;
        col.append(box);
        const out = $('.tu-out', box), errEl = $('.tu-err', box), copy = $('.tu-copy', box);
        copy.onclick = () => { copy.innerHTML = lu('check', 'h-4 w-4 text-green-700 dark:text-green-400'); t.sleep(2000).then(() => { copy.innerHTML = lu('copy', 'h-4 w-4 text-muted-foreground'); }); };
        for (const line of P.stdout.split('\n')) { out.insertAdjacentHTML('beforeend', ansi(line) + '\n'); await t.sleep(err ? 380 : 170); }
        if (P.stderr) { errEl.hidden = false; for (const line of P.stderr.split('\n')) { errEl.insertAdjacentHTML('beforeend', esc(line) + '\n'); await t.sleep(90); } }
        out.innerHTML = out.innerHTML.replace(/\n$/, ''); errEl.innerHTML = errEl.innerHTML.replace(/\n$/, '');
        const dur = $('.tu-dur', box), ex = $('.tu-exit', box); dur.textContent = P.dur; ex.textContent = P.exit; ex.className = `tu-exit font-mono text-sm tabular-nums ${P.exit === 0 ? 'text-muted-foreground' : 'text-red-600 dark:text-red-400'}`; ani(dur, 'chat-fade-in 250ms ease-out both'); ani(ex, 'chat-fade-in 250ms ease-out both');
        await t.sleep(1400); await press(copy, t, 0.9); await t.sleep(3600);
      } },

    { group: 'Tool cards', title: 'Code Block', desc: 'Syntax-highlighted code returned by a tool, in the pierre light / dark token colours the cards ship with: language • filename header with a copy button, line numbers at half opacity, and a highlighted line — here written out line by line.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.cb = (ctx.cb || 0) + 1; const py = ctx.cb % 2 === 0;
        const col = tuStage(root);
        const P = py ? { lang: 'Python', file: 'fibonacci.py', hl: [6], code: 'def fibonacci(n: int) -> list[int]:\n    """Generate Fibonacci sequence up to n terms."""\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    sequence = [0, 1]\n    while len(sequence) < n:\n        sequence.append(sequence[-1] + sequence[-2])\n    return sequence\n\n# Example usage\nprint(fibonacci(10))' }
          : { lang: 'TypeScript', file: 'Counter.tsx', hl: [4], code: 'import { useState } from "react";\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  );\n}' };
        await tuAsk(col, t, py ? 'Write a Fibonacci helper in Python.' : 'Give me a minimal React counter.'); await tuCall(col, t, `write_file · ${P.file}`, 800);
        const lines = P.code.split('\n'); const w = String(lines.length).length + 0.5;
        const box = mk('div', 'tu-rise flex w-full min-w-0 flex-col gap-3');
        box.innerHTML = `<div class="tu-card overflow-hidden rounded-lg"><div class="flex items-center justify-between border-b border-border bg-[var(--card)] px-4 py-2"><div class="flex min-w-0 items-center gap-1"><span class="text-sm text-muted-foreground">${P.lang}</span><span class="text-muted-foreground/50">•</span><span class="truncate text-sm font-medium text-foreground">${P.file}</span></div><button type="button" aria-label="Copy code" class="tu-copy tu-btn tu-btn-ghost !h-7 !w-7 !rounded-md !p-0">${lu('copy', 'h-4 w-4 text-muted-foreground')}</button></div><div class="overflow-x-auto overflow-y-clip text-[13px] leading-[1.4]"><pre class="py-4" style="color:var(--sh-fg)"><code class="tu-code block"></code></pre></div></div>`;
        col.append(box); const code = $('.tu-code', box), copy = $('.tu-copy', box);
        copy.onclick = () => { copy.innerHTML = lu('check', 'h-4 w-4 text-green-700 dark:text-green-400'); t.sleep(2000).then(() => { copy.innerHTML = lu('copy', 'h-4 w-4 text-muted-foreground'); }); };
        for (let i = 0; i < lines.length; i++) {
          const row = mk('span', 'block px-4'); row.dataset.line = i + 1; if (P.hl.includes(i + 1)) row.className += ' bg-black/5 dark:bg-white/10';
          row.innerHTML = `<span aria-hidden="true" style="display:inline-block;width:${w}ch;text-align:right;margin-right:1.5em;user-select:none;opacity:.5">${i + 1}</span>${highlight(lines[i]) || ' '}`;
          ani(row, 'chat-fade-in 220ms ease-out both'); code.append(row); await t.sleep(85);
        }
        await t.sleep(1500); await press(copy, t, 0.9); await t.sleep(4200);
      } },

    { group: 'Tool cards', title: 'Code Diff', desc: 'A unified diff as a tool result: language • file header with +additions / −deletions in the diffs teal and red, old and new line gutters, tinted rows and word-level emphasis on the changed span. Alternates a refactor and an off-by-one fix.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.cd = (ctx.cd || 0) + 1; const bug = ctx.cd % 2 === 0;
        const col = tuStage(root);
        const P = bug ? { file: 'hooks/use-pagination.ts', ask: 'Fix the last page being cut off.', rows: [['del', 1, null, [['const totalPages = Math.', 0], ['floor', 1], ['(items.length / pageSize);', 0]]], ['del', 2, null, [['const end = page * pageSize', 0], [' - 1', 1], [';', 0]]], ['add', null, 1, [['const totalPages = Math.', 0], ['ceil', 1], ['(items.length / pageSize);', 0]]], ['add', null, 2, [['const end = page * pageSize;', 0]]]] }
          : { file: 'lib/auth.ts', ask: 'fetchUser should not throw on a missing user.', rows: [['ctx', 1, 1, [['export async function fetchUser(id: string) {', 0]]], ['ctx', 2, 2, [['  const res = await db.users.findUnique({ where: { id } });', 0]]], ['del', 3, null, [['  if (!res) ', 0], ['throw new Error("User not found")', 1], [';', 0]]], ['add', null, 3, [['  if (!res) ', 0], ['return null', 1], [';', 0]]], ['ctx', 4, 4, [['  return res;', 0]]], ['ctx', 5, 5, [['}', 0]]]] };
        await tuAsk(col, t, P.ask); await tuCall(col, t, `edit_file · ${P.file}`, 900);
        const adds = P.rows.filter((r) => r[0] === 'add').length, dels = P.rows.filter((r) => r[0] === 'del').length;
        const box = mk('div', 'tu-rise flex w-full min-w-0 flex-col gap-3');
        box.innerHTML = `<div class="tu-card overflow-hidden rounded-lg"><div class="flex items-center gap-2 border-b border-border bg-[var(--card)] px-4 py-2"><div class="flex min-w-0 items-center gap-1"><span class="text-sm text-muted-foreground">TypeScript</span><span class="text-muted-foreground/50">&bull;</span><span class="truncate text-sm font-medium text-foreground">${P.file}</span></div><span class="ml-auto font-mono text-xs tabular-nums"><span style="color:#00cab1">+${adds}</span> <span style="color:#ff2e3f">-${dels}</span></span><button type="button" aria-label="Copy code" class="tu-btn tu-btn-ghost !h-7 !w-7 !rounded-md !p-0">${lu('copy', 'h-4 w-4 text-muted-foreground')}</button></div><div class="overflow-x-auto py-2 font-mono text-[12.5px] leading-[1.6]"><div class="tu-rows min-w-max"></div></div></div>`;
        col.append(box); const rows = $('.tu-rows', box);
        const TINT = { add: 'background:rgba(0,202,177,.1)', del: 'background:rgba(255,46,63,.1)', ctx: '' }, EMPH = { add: 'background:rgba(0,202,177,.28);border-radius:2px', del: 'background:rgba(255,46,63,.28);border-radius:2px' }, BAR = { add: '#00cab1', del: '#ff2e3f', ctx: 'transparent' };
        for (const [kind, o, n, segs] of P.rows) {
          const r = mk('div', 'flex pr-4'); r.style.cssText = `${TINT[kind]};box-shadow:inset 2px 0 0 ${BAR[kind]}`;
          r.innerHTML = `<span class="w-9 shrink-0 pr-2 text-right opacity-50 select-none">${o ?? ''}</span><span class="w-9 shrink-0 pr-2 text-right opacity-50 select-none">${n ?? ''}</span><span class="w-4 shrink-0 select-none" style="color:${BAR[kind] === 'transparent' ? 'inherit' : BAR[kind]}">${kind === 'add' ? '+' : kind === 'del' ? '-' : ' '}</span><span class="whitespace-pre" style="color:var(--sh-fg)">${segs.map(([txt, em]) => em ? `<span style="${EMPH[kind]}">${highlight(txt)}</span>` : highlight(txt)).join('')}</span>`;
          ani(r, 'chat-fade-in 220ms ease-out both'); rows.append(r); await t.sleep(160);
        }
        await t.sleep(6000);
      } },

    { group: 'Tool cards', title: 'Citation', desc: 'Source attribution inside an answer: inline domain chips land as the text streams and open a hover card with title and snippet, then the stacked variant — overlapping favicons and "6 sources" — opens its list of references.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        const SRC = [['react.dev', 'useState – React', 'useState is a React Hook that lets you add a state variable.', 'https://react.dev/reference/react/useState'], ['developer.mozilla.org', 'JavaScript - MDN Web Docs', 'JavaScript is a lightweight interpreted programming language.', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'], ['typescriptlang.org', 'TypeScript Documentation', 'TypeScript is a strongly typed programming language.', 'https://www.typescriptlang.org/docs/'], ['nodejs.org', 'Node.js Documentation', 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.', 'https://nodejs.org/docs/latest/api/'], ['nextjs.org', 'Next.js Documentation', 'Next.js is a React framework for production.', 'https://nextjs.org/docs'], ['tailwindcss.com', 'Tailwind CSS Documentation', 'A utility-first CSS framework for rapid UI development.', 'https://tailwindcss.com/docs']];
        await tuAsk(col, t, 'How should I hold state in a typed React component?'); await tuCall(col, t, 'web_search', 900);
        const ans = mk('div', 'text-sm leading-7 text-foreground'); col.append(ans); const p = mk('p'); ans.append(p);
        const fav = (d, cls = 'size-3.5 shrink-0 rounded bg-muted object-cover') => `<img src="${g32(d)}" alt="" aria-hidden="true" width="14" height="14" class="${cls}" referrerpolicy="no-referrer" ${imgFallback}>`;
        const chip = (i) => { const [d, title, snip, href] = SRC[i]; const b = mk('a', 'mx-0.5 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 align-middle text-sm leading-none outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2', `${fav(d)}<span class="text-muted-foreground">${d}</span>`); b.href = href; b.target = '_blank'; b.rel = 'noreferrer noopener'; b.setAttribute('aria-label', title); ani(b, `chat-pop-in 200ms ${EASE_OUT} both`); b._src = SRC[i]; return b; };
        const pop = mk('div', 'tu-pop absolute z-20 w-72 max-w-[calc(100%-8px)] rounded-md p-0'); pop.hidden = true; col.append(pop);
        const showPop = (b) => { const [d, title, snip] = b._src; pop.innerHTML = `<div class="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50"><div class="flex items-start gap-2">${fav(d)}<span class="text-xs text-muted-foreground">${d}</span></div><p class="text-sm leading-snug font-medium">${esc(title)}</p><p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">${esc(snip)}</p></div>`; const cr = col.getBoundingClientRect(), br = b.getBoundingClientRect(); pop.hidden = false; pop.style.left = Math.max(0, Math.min(br.left - cr.left, cr.width - pop.offsetWidth)) + 'px'; pop.style.top = (br.top - cr.top - pop.offsetHeight - 6) + 'px'; ani(pop, `chat-pop-in 150ms ${EASE_OUT} both`); };
        const PARTS = [['Use the ', null], ['useState', 'code'], [' hook for local component state', 0], [' — it returns the current value and a setter. Type the state by annotating the initial value or passing a generic, and let the compiler', null], [' catch mismatched updates.', 2]];
        for (const [txt, c] of PARTS) {
          if (c === 'code') { const k = mk('code', 'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]'); p.append(k); await h.streamInto(k, txt, t, 34); continue; }
          await h.streamInto(p, txt, t, 34); if (typeof c === 'number') { p.append(' '); const b = chip(c); p.append(b); b.onmouseenter = () => showPop(b); b.onmouseleave = () => { pop.hidden = true; }; await t.sleep(200); }
        }
        await t.sleep(700); const first = $('a', p); first.classList.add('bg-muted'); showPop(first); await t.sleep(2300); pop.hidden = true; first.classList.remove('bg-muted');
        const stack = mk('button', 'tu-rise isolate inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 outline-none transition-colors duration-150 hover:bg-muted/70'); stack.type = 'button';
        stack.innerHTML = `<div class="flex items-center">${SRC.slice(0, 4).map(([d], i) => `<div class="relative flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs ${i ? '-ml-2' : ''} dark:border-foreground/20" style="z-index:${4 - i}">${fav(d, 'size-[18px] rounded-full object-cover')}</div>`).join('')}<div class="relative -ml-2 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs dark:border-foreground/20"><span class="text-[10px] font-medium tracking-tight text-muted-foreground">•••</span></div></div><span class="text-sm text-muted-foreground tabular-nums">6 sources</span>`;
        col.append(stack);
        const list = mk('div', 'tu-pop absolute z-20 w-80 max-w-full rounded-md p-1'); list.hidden = true; col.append(list);
        list.innerHTML = `<div class="flex max-h-72 flex-col overflow-y-auto">${SRC.map(([d, title, , href]) => `<a href="${href}" target="_blank" rel="noreferrer noopener" class="group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted">${fav(d, 'size-4 shrink-0 rounded bg-muted object-cover')}<div class="min-w-0 flex-1"><p class="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-2">${esc(title)}</p><p class="truncate text-xs text-muted-foreground">${d}</p></div>${lu('external-link', 'mt-0.5 size-3.5 shrink-0 self-start text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100')}</a>`).join('')}</div>`;
        const openList = () => { list.hidden = false; const cr = col.getBoundingClientRect(), br = stack.getBoundingClientRect(); list.style.left = '0px'; list.style.top = (br.top - cr.top - list.offsetHeight - 6) + 'px'; ani(list, `chat-pop-in 150ms ${EASE_OUT} both`); };
        stack.onmouseenter = openList; stack.onmouseleave = () => { list.hidden = true; }; stack.onclick = openList;
        await t.sleep(1300); stack.classList.add('bg-muted/70'); openList(); await t.sleep(3800); list.hidden = true; stack.classList.remove('bg-muted/70'); await t.sleep(800);
      } },

    { group: 'Tool cards', title: 'Link Preview', desc: 'A rich link preview fetched by a tool: 16:9 Open Graph image over a muted placeholder, favicon and domain, a two-line clamped title and description — the image scales 1 % on hover. Alternates the image and text-only presets.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.lp = (ctx.lp || 0) + 1; const basic = ctx.lp % 2 === 0;
        const col = tuStage(root);
        const P = basic ? { href: 'https://react.dev/reference/rsc/server-components', title: 'React Server Components', description: 'Server Components are a new type of Component that renders ahead of time.', domain: 'react.dev' }
          : { href: 'https://en.wikipedia.org/wiki/History_of_computing_hardware', title: 'A brief history of computing hardware', description: 'Mechanical calculators, vacuum tubes, transistors, microprocessors — and what came next.', image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=1200', domain: 'wikipedia.org' };
        await tuAsk(col, t, basic ? 'What are server components? Link me the docs.' : 'Find me a good read on computing history.'); await tuCall(col, t, 'fetch_link_preview', 1000);
        const art = mk('article', 'tu-rise relative w-full min-w-0');
        art.innerHTML = `<a href="${P.href}" target="_blank" rel="noreferrer noopener" class="tu-lp tu-card group relative isolate flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl text-sm"><div class="flex flex-col">${P.image ? `<div class="relative aspect-video w-full overflow-hidden bg-muted"><img src="${P.image}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" ${imgFallback} class="tu-img absolute inset-0 h-full w-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.01]"></div>` : ''}<div class="flex flex-col gap-2 px-5 py-4"><div class="flex items-center gap-2 text-xs text-muted-foreground"><img src="${g32(P.domain)}" alt="" aria-hidden="true" width="16" height="16" referrerpolicy="no-referrer" ${imgFallback} class="size-4 rounded-full object-cover"><span>${P.domain}</span></div><h3 class="text-base font-medium text-pretty text-foreground"><span class="line-clamp-2">${esc(P.title)}</span></h3><p class="leading-snug text-pretty text-muted-foreground"><span class="line-clamp-2">${esc(P.description)}</span></p></div></div></a>`;
        col.append(art);
        await t.sleep(2600); const img = $('.tu-img', art); if (img) img.style.transform = 'scale(1.01)'; await t.sleep(1800); if (img) img.style.transform = ''; await t.sleep(3000);
      } },

    { group: 'Tool cards', title: 'Option List', desc: 'Choices the agent hands back: radio or checkbox indicators, hairline separators that hide around the hovered row, Reset / Confirm actions — confirming collapses the list into a receipt of what was picked. Alternates single-select travel modes and pick-two-of-three.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.ol = (ctx.ol || 0) + 1; const multi = ctx.ol % 2 === 0;
        const col = tuStage(root);
        const P = multi ? { ask: 'Scope this project for me.', options: [['good', 'Good', 'High quality work'], ['fast', 'Fast', 'Quick turnaround'], ['cheap', 'Cheap', 'Low cost']], mode: 'multi', max: 2, confirm: 'Confirm', picks: ['good', 'fast', 'cheap'] }
          : { ask: 'How should I get to the venue?', options: [['walk', 'Walking', 'Sidewalk-friendly route'], ['drive', 'Driving', 'Fastest ETA'], ['transit', 'Transit', 'Use subway and buses']], mode: 'single', confirm: 'Continue', picks: ['drive', 'transit'] };
        await tuAsk(col, t, P.ask); await tuCall(col, t, 'present_options', 900);
        const sel = new Set();
        const wrap = mk('div', 'tu-rise flex w-full min-w-0 flex-col gap-3 text-foreground'); wrap.setAttribute('role', 'group');
        const lb = mk('div', 'group/list tu-card flex w-full flex-col overflow-hidden rounded-2xl px-4 py-1.5'); lb.setAttribute('role', 'listbox'); wrap.append(lb);
        const btns = P.options.map(([id, label, desc], i) => {
          if (i) lb.append(mk('div', 'tu-sep tu-s transition-opacity'));
          const b = mk('button', `peer group relative h-auto min-h-[50px] w-full justify-start rounded-none border-0 bg-transparent px-0 text-left text-base font-medium sm:text-sm ${i === 0 ? 'pt-2 pb-2.5' : i === P.options.length - 1 ? 'py-2' : 'py-2.5'}`); b.type = 'button'; b.setAttribute('role', 'option'); b.dataset.id = id;
          b.innerHTML = `<span class="tu-hov tu-bg-primary-5 absolute inset-0 -mx-3 -my-0.5 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"></span><div class="relative flex items-start gap-3"><span class="flex h-6 items-center"><span class="tu-ind flex size-4 shrink-0 items-center justify-center border-2 transition-colors ${P.mode === 'single' ? 'rounded-full' : 'rounded'}"></span></span><div class="flex flex-col text-left"><span class="leading-6 text-pretty">${label}</span><span class="text-sm font-normal text-pretty text-muted-foreground">${desc}</span></div></div>`;
          b.onclick = () => { if (b.disabled) return; if (P.mode === 'single') { const had = sel.has(id); sel.clear(); if (!had) sel.add(id); } else if (sel.has(id)) sel.delete(id); else if (!P.max || sel.size < P.max) sel.add(id); paint(); };
          b.onmouseenter = () => hov(b, true); b.onmouseleave = () => hov(b, false);
          lb.append(b); return b;
        });
        const hov = (b, on) => { const prev = b.previousElementSibling, next = b.nextElementSibling; [prev, next].forEach((s) => { if (s && s.classList.contains('tu-s')) s.style.opacity = on ? '0' : ''; }); $('.tu-hov', b).style.opacity = on ? '1' : ''; };
        const acts = tuActions([{ id: 'cancel', label: 'Reset', variant: 'ghost', onClick: () => { sel.clear(); paint(); } }, { id: 'confirm', label: P.confirm, onClick: () => confirm() }]); wrap.append(acts);
        const paint = () => { btns.forEach((b) => { const on = sel.has(b.dataset.id); const locked = P.mode === 'multi' && P.max && sel.size >= P.max && !on; b.disabled = locked; b.style.opacity = locked ? '0.5' : ''; const ind = $('.tu-ind', b); ind.className = `tu-ind flex size-4 shrink-0 items-center justify-center border-2 transition-colors ${P.mode === 'single' ? 'rounded-full' : 'rounded'} ${on ? 'tu-bg-primary' : 'border-muted-foreground/50'}`; ind.innerHTML = on ? (P.mode === 'multi' ? lu('check', 'size-3', 3) : '<span class="size-2 rounded-full bg-current"></span>') : ''; }); acts.btn.confirm.disabled = sel.size < 1; };
        const confirm = () => {
          const picked = P.options.filter(([id]) => sel.has(id));
          const rc = mk('div', 'tu-in flex w-full min-w-0 flex-col text-foreground'); rc.setAttribute('role', 'status');
          rc.innerHTML = `<div class="tu-card-60 flex w-full flex-col overflow-hidden rounded-2xl px-5 py-2.5">${picked.map(([, l, d], i) => `${i ? '<div class="tu-sep my-1.5"></div>' : ''}<div class="flex items-start gap-3 py-1"><span class="flex h-6 items-center">${lu('check', 'tu-primary size-4 shrink-0')}</span><div class="flex flex-col text-left"><span class="text-base leading-6 font-medium text-pretty sm:text-sm">${l}</span><span class="text-sm font-normal text-pretty text-muted-foreground">${d}</span></div></div>`).join('')}</div>`;
          wrap.replaceWith(rc);
        };
        col.append(wrap); paint();
        for (const id of P.picks) { const b = btns.find((x) => x.dataset.id === id); await t.sleep(900); hov(b, true); await t.sleep(350); await press(b, t, 0.99); hov(b, false); }
        await t.sleep(1000); acts.btn.confirm.classList.add('is-hover'); await press(acts.btn.confirm, t, 0.97);
        await t.sleep(3600);
      } },

    { group: 'Tool cards', title: 'Question Flow', desc: 'A guided multi-step question flow: "Step 1 of 3" over a segmented progress bar that fills in 300 ms, each step slides out left through a blur while the next slides in from the right, and Complete folds the answers into a summary receipt.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        const STEPS = [['Select a programming language', 'This determines which frameworks and tools are available.', ['Python', 'TypeScript', 'Go'], 0], ['Choose a framework', 'Pick the framework you\'re most comfortable with.', ['FastAPI', 'Django', 'Flask'], 0], ['Select your database', 'Your data will be stored and queried from here.', ['PostgreSQL', 'MySQL', 'MongoDB'], 0]];
        await tuAsk(col, t, 'Help me set up a new backend project.'); await tuCall(col, t, 'ask_questions', 900);
        const wrap = mk('div', 'tu-rise flex w-full min-w-0 flex-col gap-3 text-foreground'); wrap.setAttribute('role', 'form');
        wrap.innerHTML = `<div class="tu-card flex w-full flex-col gap-4 rounded-2xl p-5"><div class="flex flex-col gap-2"><span class="tu-lbl text-xs font-medium tracking-wide text-muted-foreground uppercase"></span><div class="flex h-1.5 gap-1" role="progressbar">${STEPS.map(() => '<div class="relative flex-1 overflow-hidden rounded-full bg-muted"><div class="tu-seg absolute inset-0 origin-left rounded-full transition-transform duration-300 ease-in-out" style="background:var(--primary);transform:scaleX(0)"></div></div>').join('')}</div></div><div class="tu-body relative mt-1"></div><div class="flex items-center justify-between pt-2"><button type="button" class="tu-back tu-btn tu-btn-ghost gap-1 text-muted-foreground" style="visibility:hidden">${lu('chevron-left', 'size-4')}Back</button><button type="button" class="tu-next tu-btn tu-btn-default" disabled>Next</button></div></div>`;
        col.append(wrap);
        const body = $('.tu-body', wrap), next = $('.tu-next', wrap), back = $('.tu-back', wrap); let step = 0; const answers = [];
        const stepEl = (i) => { const [title, desc, opts] = STEPS[i]; const el = mk('div', 'flex flex-col gap-4'); el.innerHTML = `<div class="flex flex-col gap-1"><h2 class="text-lg leading-tight font-semibold">${esc(title)}</h2><p class="text-sm text-muted-foreground">${esc(desc)}</p></div><div class="flex flex-col px-1">${opts.map((o, j) => `${j ? '<div class="tu-sep"></div>' : ''}<button type="button" data-j="${j}" class="group relative min-h-[50px] w-full py-2.5 text-left text-base font-medium sm:text-sm"><span class="tu-hov tu-bg-primary-5 absolute inset-0 -mx-3 -my-0.5 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"></span><div class="relative flex items-start gap-3"><span class="flex h-6 items-center"><span class="tu-ind flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/50 transition-colors duration-200"></span></span><span class="leading-6">${o}</span></div></button>`).join('')}</div>`; $$('[data-j]', el).forEach((b) => { b.onclick = () => { answers[i] = +b.dataset.j; paintSel(el, i); next.disabled = false; }; }); return el; };
        const paintSel = (el, i) => $$('[data-j]', el).forEach((b) => { const on = answers[i] === +b.dataset.j; const ind = $('.tu-ind', b); ind.className = `tu-ind flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${on ? 'tu-bg-primary' : 'border-muted-foreground/50'}`; ind.innerHTML = on ? `<span class="size-2 rounded-full bg-current" style="${REDUCE ? '' : 'animation:tu-zoom 300ms ease-out both'}"></span>` : ''; });
        const show = (i, dir) => {
          $('.tu-lbl', wrap).textContent = `Step ${i + 1} of ${STEPS.length}`; $$('.tu-seg', wrap).forEach((s, k) => { s.style.transform = k <= i ? 'scaleX(1)' : 'scaleX(0)'; });
          const old = body.firstElementChild; const el = stepEl(i); if (answers[i] != null) paintSel(el, i);
          if (old && dir && !REDUCE) { old.style.cssText = 'position:absolute;inset:0;animation:tu-to-left 250ms ease-in-out forwards'; el.style.animation = 'tu-from-right 250ms ease-in-out both'; t.sleep(260).then(() => old.remove()); } else if (old) old.remove();
          body.append(el); next.textContent = i === STEPS.length - 1 ? 'Complete' : 'Next'; next.disabled = answers[i] == null; back.style.visibility = i > 0 ? 'visible' : 'hidden';
        };
        next.onclick = () => {
          if (step < STEPS.length - 1) { step++; show(step, 'forward'); return; }
          const rc = mk('div', 'tu-in flex w-full min-w-0 flex-col text-foreground'); rc.setAttribute('role', 'status');
          const sum = STEPS.map(([title, , opts], i) => [['Language', 'Framework', 'Database'][i], opts[answers[i]]]);
          rc.innerHTML = `<div class="tu-card-60 flex w-full flex-col gap-3 rounded-2xl px-5 py-4"><div class="flex items-center justify-between gap-3"><span class="text-base font-medium">Project configured</span><span class="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">${lu('check', 'size-3.5')}Complete</span></div><div class="flex flex-col">${sum.map(([l, v], i) => `${i ? '<div class="tu-sep my-2"></div>' : ''}<div class="flex flex-col gap-0.5 text-sm" style="${REDUCE ? '' : `animation:tu-rise 300ms ease-out ${150 + i * 75}ms both`}"><span class="text-muted-foreground">${l}</span><span class="font-medium">${esc(v)}</span></div>`).join('')}</div></div>`;
          wrap.replaceWith(rc);
        };
        back.onclick = () => { if (step > 0) { step--; show(step); } };
        show(0);
        for (let i = 0; i < STEPS.length; i++) { await t.sleep(1100); const b = $(`[data-j="${STEPS[i][3]}"]`, body.lastElementChild); $('.tu-hov', b).style.opacity = '1'; await t.sleep(300); await press(b, t, 0.99); await t.sleep(650); next.classList.add('opacity-90'); await press(next, t, 0.97); next.classList.remove('opacity-90'); }
        await t.sleep(3600);
      } },

    { group: 'Tool cards', title: 'Order Summary', desc: 'An itemized purchase confirmation: thumbnails, quantities and line totals, a subtotal / shipping / tax / total breakdown — and once the order goes through the same card becomes a receipt with a green check and "#order · date".', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'Order two bags of the house beans and a pour-over set.'); await tuCall(col, t, 'create_order', 1000);
        const ITEMS = [['Premium Coffee Beans', 'Single origin, medium roast', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop', 2, 24], ['Ceramic Pour-Over Set', 'Includes dripper and carafe', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop', 1, 45]];
        const card = (receipt) => `<div class="rounded-lg border border-border shadow-sm ${receipt ? 'bg-[color-mix(in_oklab,var(--card)_60%,transparent)]' : 'bg-[var(--card)]'} text-[var(--card-foreground)]"><div class="space-y-4 p-4 ${receipt ? 'opacity-95' : ''}"><div><h2 class="flex items-center gap-2 text-base font-semibold">${receipt ? lu('circle-check', 'h-5 w-5 text-green-600 dark:text-green-500') : ''}${receipt ? 'Order Confirmed' : 'Order Summary'}</h2>${receipt ? `<p class="mt-1 text-sm text-muted-foreground">#ORD-2024-8847 · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>` : ''}</div><div class="space-y-3">${ITEMS.map(([n, d, img, q, u]) => `<div class="flex gap-3"><span class="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted"><span class="absolute inset-0 grid place-items-center">${lu('package', 'h-5 w-5 text-muted-foreground')}</span><img src="${img}" alt="${esc(n)}" width="48" height="48" referrerpolicy="no-referrer" ${imgFallback} class="relative h-12 w-12 object-cover"></span><div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5"><div class="flex items-center justify-between gap-2"><span class="truncate text-sm font-medium">${esc(n)}</span><span class="shrink-0 text-sm tabular-nums">${money(u * q)}</span></div><div class="truncate text-sm text-muted-foreground">${esc(d)}${q > 1 ? ` · Qty: ${q}` : ''}</div></div></div>`).join('')}</div><div class="tu-sep"></div><dl class="flex flex-col gap-2 text-sm"><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Subtotal</dt><dd class="tabular-nums">${money(93)}</dd></div><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Shipping</dt><dd class="tabular-nums">${money(5.99)}</dd></div><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Tax</dt><dd class="tabular-nums">${money(7.44)}</dd></div><div class="flex justify-between gap-4"><dt class="font-medium">Total</dt><dd class="font-semibold tabular-nums">${money(106.43)}</dd></div></dl></div></div>`;
        const art = mk('article', 'tu-rise flex w-full min-w-0 flex-col gap-3', card(false)); col.append(art);
        await t.sleep(2800); const line = await tuCall(col, t, 'confirm_order', 1100); line.remove();
        const rc = mk('article', 'tu-in flex w-full min-w-0 flex-col gap-3', card(true)); art.replaceWith(rc);
        await t.sleep(4200);
      } },

    { group: 'Tool cards', title: 'Stats Display', desc: 'Key metrics in a compact card: each stat staggers in 175 ms after the last — the sparkline rises from 3 rem below, then the uppercase label and the light 3xl value — with signed delta pills where "down" can be the good direction.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        col.classList.replace('max-w-md', 'max-w-xl'); await tuAsk(col, t, 'How did Q4 go?'); await tuCall(col, t, 'get_metrics · q4_2024', 1100);
        const STATS = [
          { label: 'Revenue', value: money(847300, 'USD', 0), data: [72000, 68000, 74000, 81000, 78000, 85000, 89000, 91000, 86000, 94000, 97000, 102000], color: 'var(--chart-1)', diff: 12.4, d: 1 },
          { label: 'Active Users', value: '24.9<span class="ml-0.5 text-[0.65em] opacity-80" aria-hidden="true">K</span>', data: [18200, 19100, 19800, 20400, 21200, 21900, 22600, 23100, 23800, 24200, 24500, 24890], color: 'var(--chart-3)', diff: 8.2, d: 1 },
          { label: 'Churn Rate', value: '2.1<span class="ml-0.5 text-[0.65em] opacity-80" aria-hidden="true">%</span>', data: [3.2, 3.0, 2.8, 2.9, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.1, 2.1], color: 'var(--chart-4)', diff: -0.8, d: 1, down: true },
          { label: 'NPS Score', value: '72', data: [58, 61, 64, 62, 65, 68, 66, 69, 70, 71, 71, 72], color: 'var(--chart-5)', diff: 5, d: 0 },
        ];
        const spark = (data, color, delay, id) => {
          const W = 64, H = 24, mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
          const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - mn) / rg) * H}`).join(' ');
          return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" preserveAspectRatio="none" class="pointer-events-none absolute inset-x-0 top-2 bottom-2 h-[calc(100%-1rem)] w-full" style="${REDUCE ? '' : `animation:tu-slide-up 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.09"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${H} ${pts} ${W},${H}" fill="url(#${id})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.15" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="0.75" stroke-opacity="0.65" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pathLength="1" stroke-dasharray="0.24 0.76"/></svg>`;
        };
        const delta = (s) => { const good = s.down ? s.diff < 0 : s.diff > 0; return `<span class="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs tabular-nums ${good ? 'bg-green-500/10 text-green-600 dark:bg-green-600/15 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-500'}">${s.down ? `<span class="text-[0.9em]">${good ? '↓' : '↑'}</span>` : ''}${s.diff < 0 ? '−' : '+'}${Math.abs(s.diff).toFixed(s.d)}%</span>`; };
        const uid = 'tus' + Math.random().toString(36).slice(2, 7);
        const art = mk('article', 'w-full min-w-0 max-w-xl');
        art.innerHTML = `<div class="tu-card flex flex-col gap-0 overflow-clip rounded-xl pt-2 pb-0"><div class="grid gap-1.5 border-b border-border px-6 pt-3 pb-4"><div class="leading-none font-semibold text-pretty">Q4 Performance</div><div class="text-sm text-pretty text-muted-foreground">October through December 2024</div></div><div class="@container overflow-hidden p-0"><div class="grid @[440px]:-mt-px @[440px]:-ml-px" style="grid-template-columns:repeat(auto-fit, minmax(220px, 1fr))">${STATS.map((s, i) => { const base = i * 175; return `<div class="overflow-clip py-3 first:pt-0 @[440px]:border-t @[440px]:border-l @[440px]:border-border @[440px]:py-3 @[440px]:first:pt-3 ${i ? 'border-t border-border' : ''}"><div class="relative flex min-h-28 flex-col justify-end gap-1 px-6">${spark(s.data, s.color, base, uid + i)}<span class="relative text-xs font-normal tracking-wider text-muted-foreground uppercase opacity-90" style="${REDUCE ? '' : `animation:tu-rise 500ms cubic-bezier(0.16,1,0.3,1) ${base + 75}ms both`}">${s.label}</span><div class="relative flex items-baseline gap-2 pb-2" style="${REDUCE ? '' : `animation:tu-rise 500ms cubic-bezier(0.16,1,0.3,1) ${base + 150}ms both`}"><span class="text-3xl font-light tracking-normal"><span class="font-light tabular-nums">${s.value}</span></span>${delta(s)}</div></div></div>`; }).join('')}</div></div></div>`;
        col.append(art);
        await t.sleep(8000);
      } },

    { group: 'Tool cards', title: 'Parameter Slider', desc: 'Numeric controls the agent proposes: 48 px squircle tracks with tick marks and a fill that grows from zero on bipolar ranges, a hairline handle that thickens and splits around the text while dragged, signed values with units, Reset / Apply.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'This photo is a bit dark — fix the exposure.'); await tuCall(col, t, 'suggest_adjustments', 900);
        const SL = [{ id: 'exposure', label: 'Exposure', min: -3, max: 3, step: 0.1, value: 0.3, unit: 'EV', precision: 1 }, { id: 'contrast', label: 'Contrast', min: -100, max: 100, step: 5, value: 15, unit: '%' }, { id: 'highlights', label: 'Highlights', min: -100, max: 100, step: 5, value: -20, unit: '%' }, { id: 'shadows', label: 'Shadows', min: -100, max: 100, step: 5, value: 25, unit: '%' }];
        const fmt = (s, v) => { const fixed = s.precision !== undefined ? v.toFixed(s.precision) : String(v); return `${s.min < 0 && s.max > 0 && v >= 0 ? '+' + fixed : fixed} ${s.unit}`; };
        const art = mk('article', 'tu-rise isolate flex w-full min-w-0 flex-col gap-3 text-foreground'); const card = mk('div', 'tu-card flex w-full flex-col overflow-hidden rounded-2xl px-5 py-3'); art.append(card);
        const rows = SL.map((s) => {
          const r = mk('div', 'py-2'); const pct = (v) => ((v - s.min) / (s.max - s.min)) * 100; const zero = pct(0);
          const ticks = Array.from({ length: 21 }, (_, i) => { const p = i * 5; const major = i % 2 === 0; const edge = p === 0 || p === 100; const center = p === 50; return `<span class="pointer-events-none absolute bottom-px w-px ${major ? 'h-2' : 'h-1.5'} ${edge ? 'bg-transparent' : !major ? 'bg-foreground/[0.08] dark:bg-white/5' : center ? 'bg-foreground/30 dark:bg-white/25' : 'bg-foreground/15 dark:bg-white/[0.08]'}" style="left:calc(6px + (100% - 12px) * ${p / 100});transform:translateX(-50%)"></span>`; }).join('');
          r.innerHTML = `<div class="tu-sl group/slider relative isolate flex h-12 w-full touch-none items-center select-none"><div class="relative h-12 w-full grow overflow-hidden rounded-sm bg-muted shadow-[inset_0_0_0_1px_var(--border)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"><div class="tu-fill absolute inset-0 bg-[color-mix(in_oklab,var(--primary)_30%,transparent)] dark:bg-[color-mix(in_oklab,var(--primary)_40%,transparent)]" style="transition:clip-path 90ms cubic-bezier(0.22,1,0.36,1)"></div>${ticks}</div><span class="tu-th absolute top-1/2 z-0 block w-3 -translate-x-1/2 -translate-y-1/2 cursor-grab transition-[height] duration-150" style="height:48px;transition:left 90ms cubic-bezier(0.22,1,0.36,1), height 150ms ease-in-out"><span class="tu-seg-t absolute top-0 left-1/2 rounded-t-sm transition-all duration-100" style="background:var(--primary)"></span><span class="tu-seg-b absolute bottom-0 left-1/2 rounded-b-sm transition-all duration-100" style="background:var(--primary)"></span></span><div class="pointer-events-none absolute inset-x-3 top-1/2 z-10 flex items-center justify-between" style="transform:translateY(calc(-50% - 1px))"><span class="tu-primary -mt-px rounded-full px-2 py-px text-sm font-normal tracking-wide">${s.label}</span><span class="tu-val -mt-px -mb-0.5 flex h-6 items-center rounded-full px-2 font-mono text-xs text-foreground tabular-nums"></span></div></div>`;
          const fill = $('.tu-fill', r), th = $('.tu-th', r), top = $('.tu-seg-t', r), bot = $('.tu-seg-b', r), val = $('.tu-val', r);
          r.set = (v, state = 'rest') => {
            s.value = Math.round(Math.min(s.max, Math.max(s.min, v)) / s.step) * s.step; const p = pct(s.value);
            const a = s.min < 0 ? Math.min(zero, p) : 0, b = s.min < 0 ? Math.max(zero, p) : p;
            fill.style.clipPath = `inset(0 ${100 - b}% 0 ${a}%)`; th.style.left = `calc(6px + (100% - 12px) * ${p / 100})`;
            const active = state !== 'rest'; const atEdge = p <= 3 || p >= 97;
            th.style.height = state === 'drag' ? '56px' : state === 'hover' ? '54px' : '48px';
            [top, bot].forEach((seg, k) => { seg.style.width = state === 'drag' ? '8px' : active ? '6px' : '1px'; seg.style.transform = 'translateX(-50%)'; seg.style.opacity = active ? '1' : atEdge ? '0' : '0.25'; seg.style.height = active ? `calc(50% - ${k ? 6 : 10}px)` : '50%'; seg.style.borderRadius = active ? '9999px' : ''; });
            val.textContent = fmt(s, s.value);
          };
          // Real dragging too: pointer position → value.
          const slEl = $('.tu-sl', r); slEl.onpointerdown = (e) => { slEl.setPointerCapture(e.pointerId); const move = (ev) => { const rc = slEl.getBoundingClientRect(); r.set(s.min + ((ev.clientX - rc.left) / rc.width) * (s.max - s.min), 'drag'); }; move(e); slEl.onpointermove = move; slEl.onpointerup = () => { slEl.onpointermove = null; r.set(s.value, 'rest'); }; };
          r.set(s.value); card.append(r); return r;
        });
        const note = mk('div', 'hidden'); art.append(tuActions([{ id: 'reset', label: 'Reset', variant: 'ghost', onClick: () => { rows[0].set(0.3); rows[1].set(15); } }, { id: 'apply', label: 'Apply', onClick: () => { note.className = 'tu-in text-sm text-muted-foreground'; note.textContent = `Applied — Exposure ${fmt(SL[0], SL[0].value)}, Contrast ${fmt(SL[1], SL[1].value)}.`; } }]), note);
        col.append(art);
        const drag = async (r, s, to, steps = 18) => { const from = s.value; r.set(from, 'hover'); await t.sleep(300); for (let i = 1; i <= steps; i++) { r.set(from + (to - from) * (i / steps), 'drag'); await t.sleep(45); } await t.sleep(250); r.set(s.value, 'hover'); await t.sleep(350); r.set(s.value, 'rest'); };
        await t.sleep(1300); await drag(rows[0], SL[0], 1.4); await t.sleep(500); await drag(rows[1], SL[1], 35, 10); await t.sleep(500); await drag(rows[3], SL[3], 40, 8);
        await t.sleep(700); await press($('.tu-btn-default', art), t, 0.97); await t.sleep(3200);
      } },

    { group: 'Tool cards', title: 'Preferences Panel', desc: 'A compact settings panel the agent fills in: sections with tracked uppercase legends, a pill toggle group and switches, Save Changes enabled only once something changed — saving turns the panel into a receipt that reads each value back with a check.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'Make my profile less visible and stop the tracking.'); await tuCall(col, t, 'open_preferences · privacy', 900);
        const ITEMS = [{ sec: 'Visibility', id: 'vis', label: 'Profile Visibility', desc: 'Who can see your profile', type: 'toggle', options: [['public', 'Public'], ['connections', 'Friends'], ['private', 'Private']], value: 'connections' }, { sec: 'Visibility', id: 'act', label: 'Activity Status', desc: 'Show when you\'re active', type: 'switch', value: true }, { sec: 'Data', id: 'ana', label: 'Usage Analytics', desc: 'Help improve our service', type: 'switch', value: false }];
        const init = ITEMS.map((x) => x.value);
        const art = mk('article', 'tu-rise flex w-full min-w-0 flex-col gap-3');
        const card = mk('div', 'tu-card flex w-full flex-col overflow-hidden rounded-2xl'); art.append(card);
        card.innerHTML = '<div class="px-5 py-4"><h2 class="text-base leading-none font-semibold">Privacy Settings</h2></div><div class="tu-sep"></div><div class="tu-secs flex flex-col gap-4 px-5 py-6"></div>';
        const secs = $('.tu-secs', card); const ctl = {};
        ['Visibility', 'Data'].forEach((name) => {
          const fs = mk('fieldset', 'flex flex-col'); fs.innerHTML = `<legend class="pb-1 text-xs tracking-widest text-muted-foreground uppercase">${name}</legend>`;
          ITEMS.filter((x) => x.sec === name).forEach((x, i) => {
            if (i) fs.append(mk('div', 'tu-sep my-1'));
            const row = mk('div', `flex items-start justify-between gap-4 py-3 ${x.type !== 'switch' ? 'flex-col gap-3 min-[460px]:flex-row min-[460px]:gap-4' : ''}`);
            row.innerHTML = `<div class="flex flex-col gap-1"><span class="leading-6 font-medium text-pretty">${x.label}</span><p class="text-sm font-normal text-pretty text-muted-foreground">${x.desc}</p></div><div class="tu-c flex shrink-0"></div>`;
            const c = $('.tu-c', row);
            if (x.type === 'switch') { const sw = mk('button', 'tu-switch'); sw.type = 'button'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-checked', String(x.value)); sw.setAttribute('aria-label', x.label); sw.onclick = () => { x.value = !x.value; sw.setAttribute('aria-checked', String(x.value)); dirty(); }; c.append(sw); ctl[x.id] = sw; }
            else { const g = mk('div', 'flex items-center gap-1'); g.setAttribute('role', 'group'); x.options.forEach(([v, l]) => { const b = mk('button', 'tu-toggle inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground', l); b.type = 'button'; b.dataset.on = String(x.value === v); b.onclick = () => { x.value = v; $$('button', g).forEach((y) => { y.dataset.on = String(y === b); }); dirty(); }; g.append(b); ctl[x.id + v] = b; }); c.append(g); }
            fs.append(row);
          });
          secs.append(fs);
        });
        const acts = tuActions([{ id: 'cancel', label: 'Cancel', variant: 'ghost' }, { id: 'save', label: 'Save Changes', disabled: true, onClick: () => save() }]); art.append(acts);
        const dirty = () => { acts.btn.save.disabled = ITEMS.every((x, i) => x.value === init[i]); };
        const save = () => {
          const rc = mk('article', 'tu-in flex w-full min-w-0 flex-col'); rc.setAttribute('role', 'status');
          const disp = (x) => x.type === 'switch' ? (x.value ? 'On' : 'Off') : x.options.find(([v]) => v === x.value)[1];
          rc.innerHTML = `<div class="tu-card-60 flex w-full flex-col overflow-hidden rounded-2xl opacity-95"><div class="flex items-center justify-between gap-3 px-5 py-4"><h2 class="text-base leading-none font-semibold">Privacy Settings</h2><span class="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">${lu('check', 'size-3.5')}Saved</span></div><div class="tu-sep"></div><div class="flex flex-col gap-4 px-5 py-6">${['Visibility', 'Data'].map((name) => `<fieldset class="flex flex-col"><legend class="pb-1 text-xs tracking-widest text-muted-foreground uppercase">${name}</legend>${ITEMS.filter((x) => x.sec === name).map((x, i) => `${i ? '<div class="tu-sep my-1"></div>' : ''}<div class="flex items-start justify-between gap-4 py-3"><div class="flex flex-col gap-1"><span class="text-sm leading-6 font-medium text-pretty">${x.label}</span><span class="text-sm font-normal text-pretty text-muted-foreground">${x.desc}</span></div><div class="flex shrink-0 items-center gap-2"><span class="text-sm font-medium text-muted-foreground">${disp(x)}</span>${lu('check', 'size-3.5 text-emerald-600 dark:text-emerald-500')}</div></div>`).join('')}</fieldset>`).join('')}</div></div>`;
          art.replaceWith(rc);
        };
        col.append(art);
        await t.sleep(1500); await press(ctl.visprivate, t, 0.97); await t.sleep(900); await press(ctl.act, t, 0.97); await t.sleep(900); await press(ctl.ana, t, 0.97);
        await t.sleep(900); acts.btn.save.disabled = true; await t.sleep(10); acts.btn.save.disabled = false; await press(acts.btn.save, t, 0.97); await t.sleep(3800);
      } },

    { group: 'Tool cards', title: 'Image', desc: 'A single image result with attribution: a 4:3 frame over a muted placeholder that the photo fades into once loaded, then a source row with avatar, title and source label.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'Show me what early computers looked like.'); await tuCall(col, t, 'search_images', 1100);
        const art = mk('article', 'tu-rise relative w-full min-w-0');
        art.innerHTML = `<div class="tu-card group relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl text-sm"><div class="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-muted"><img src="https://images.unsplash.com/photo-1504548840739-580b10ae7715?w=900&auto=format&fit=crop" alt="Vintage mainframe with blinking lights" loading="lazy" decoding="async" referrerpolicy="no-referrer" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style="opacity:0" onload="this.style.opacity=1" onerror="this.remove()"></div><div class="flex items-center gap-3 px-4 py-3"><button type="button" class="flex w-full items-center gap-3 text-left hover:opacity-80"><div class="flex min-w-0 flex-1 items-center gap-3"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=archives" alt="" aria-hidden="true" width="32" height="32" referrerpolicy="no-referrer" ${imgFallback} class="size-8 shrink-0 rounded-full bg-muted object-cover"><div class="min-w-0 flex-1"><div class="line-clamp-1 text-sm font-medium text-foreground">From mainframes to microchips</div><div class="line-clamp-1 text-xs text-muted-foreground">Computing archives</div></div></div></button></div></div>`;
        col.append(art); await t.sleep(7000);
      } },

    { group: 'Tool cards', title: 'Image Gallery', desc: 'Image search results in a grid: square tiles with portrait shots spanning two rows, a 2 % scale on hover, and a lightbox that opens over the gallery with the title and caption, then closes back into the grid.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        col.classList.replace('max-w-md', 'max-w-lg'); await tuAsk(col, t, 'Find me some mountain landscapes.'); await tuCall(col, t, 'search_images · mountains', 1100);
        const IMGS = [['photo-1506905925346-21bda4d32df4', 'Alpine Sunrise', 'Dolomites, Italy', false], ['photo-1464822759023-fed622ff2c3b', 'Misty Valley', '', true], ['photo-1519681393784-d120267933ba', 'Night Summit', 'Mount Hood, Oregon', false], ['photo-1454496522488-7a8e488e8606', 'Mirror Lake', '', false], ['photo-1486870591958-9b9d0d1dda99', 'Summit View', '', true]];
        const art = mk('article', 'tu-rise relative w-full min-w-0');
        art.innerHTML = `<div class="tu-card @container relative isolate flex w-full min-w-0 flex-col rounded-xl text-sm"><div class="border-b border-border/60 px-4 pt-4 pb-3"><h3 class="text-[15px] leading-tight font-semibold tracking-tight">Mountain landscapes</h3><p class="mt-1 text-sm leading-snug text-muted-foreground">Here are some images matching your search</p></div><div class="p-3"><div class="tu-grid grid grid-cols-2 gap-2 @md:grid-cols-3" role="list"></div></div><div class="tu-lb absolute inset-0 z-30 hidden flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-black/90 p-6"></div></div>`;
        col.append(art);
        const grid = $('.tu-grid', art), lb = $('.tu-lb', art);
        const tiles = IMGS.map(([id, title, cap, tall], i) => {
          const d = mk('div', `group relative cursor-pointer ${tall ? 'row-span-2' : ''}`); d.setAttribute('role', 'listitem'); if (!tall) d.style.aspectRatio = '1 / 1';
          d.innerHTML = `<button type="button" aria-label="${title}" class="absolute inset-0 z-20 h-full w-full rounded-lg outline-none"></button><div class="relative h-full w-full overflow-hidden rounded-lg bg-muted transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02] group-active:scale-[0.98]"><img src="https://images.unsplash.com/${id}?w=500&h=${tall ? 750 : 500}&fit=crop" alt="${title}" loading="lazy" referrerpolicy="no-referrer" class="h-full w-full object-cover transition-opacity duration-300" style="opacity:0" onload="this.style.opacity=1" onerror="this.remove()"></div>`;
          ani(d, `tu-rise 300ms ease-out ${i * 60}ms both`);
          $('button', d).onclick = () => { lb.innerHTML = `<button type="button" aria-label="Close" class="tu-x absolute top-4 right-4 z-20 grid size-9 place-items-center rounded-md text-white/80 hover:bg-white/10 hover:text-white">${lu('x', 'h-5 w-5')}</button><img src="https://images.unsplash.com/${id}?w=900&fit=crop" alt="${title}" referrerpolicy="no-referrer" class="max-h-[70%] max-w-full rounded-lg object-contain" style="${REDUCE ? '' : 'animation:tu-in 300ms cubic-bezier(0.16,1,0.3,1) both'}"><div class="text-center"><h3 class="text-base font-medium tracking-tight text-white">${title}</h3>${cap ? `<p class="mt-1 text-sm text-white/60">${cap}</p>` : ''}</div>`; lb.classList.replace('hidden', 'flex'); $('.tu-x', lb).onclick = () => lb.classList.replace('flex', 'hidden'); };
          grid.append(d); return d;
        });
        await t.sleep(2600); const inner = $('.group > div', tiles[2]) || tiles[2].lastElementChild; inner.style.transform = 'scale(1.02)'; await t.sleep(500); inner.style.transform = ''; $('button', tiles[2]).click();
        await t.sleep(2800); const x = $('.tu-x', lb); if (x) x.click(); await t.sleep(2600);
      } },

    { group: 'Tool cards', title: 'Item Carousel', desc: 'Recommendations as a horizontal, snap-scrolling carousel of cards — colour or image tile, name, subtitle and per-item actions — with frosted nav buttons that fade and scale in on hover and scroll a card at a time.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root, '!px-3');
        await tuAsk(col, t, 'What should I watch next?'); await tuCall(col, t, 'recommend_shows', 1000);
        const ITEMS = [['Deadwood', 'HBO · 2004', '#8b6f47'], ['The Wire', 'HBO · 2002', '#1e293b'], ['Twin Peaks', 'ABC · 1990', '#7f1d1d'], ['The Simpsons', 'Fox · 1989', '#fbbf24', true], ['Mad Men', 'AMC · 2007', '#c2410c'], ['Peep Show', 'Channel 4 · 2003', '#1e40af'], ['The Sopranos', 'HBO · 1999', '#991b1b']];
        const box = mk('div', 'tu-rise relative isolate w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 @container');
        box.innerHTML = `<div class="group relative"><button type="button" aria-label="Scroll left" class="tu-nl absolute inset-y-0 left-1.5 z-20 my-auto flex h-[50px] w-8 scale-90 items-center justify-center rounded-2xl bg-background/60 opacity-0 backdrop-blur-lg transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">${lu('chevron-left', 'h-4 w-4')}</button><button type="button" aria-label="Scroll right" class="tu-nr absolute inset-y-0 right-1.5 z-20 my-auto flex h-[50px] w-8 scale-90 items-center justify-center rounded-2xl bg-background/60 opacity-0 backdrop-blur-lg transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">${lu('chevron-right', 'h-4 w-4')}</button><div class="tu-sc grid auto-cols-max grid-flow-col gap-4 overflow-x-auto overscroll-x-contain p-4 snap-x snap-mandatory scrollbar-hide" role="list" style="scroll-padding-inline:1rem"></div></div>`;
        col.append(box); const sc = $('.tu-sc', box), nl = $('.tu-nl', box), nr = $('.tu-nr', box);
        ITEMS.forEach(([n, sub, color, add], i) => {
          const it = mk('div', 'flex snap-start snap-always'); it.setAttribute('role', 'listitem'); ani(it, `tu-rise 300ms ease-out ${i * 60}ms both`);
          it.innerHTML = `<div class="tu-card group/card @container/card relative flex w-48 min-w-48 flex-col gap-0 self-stretch overflow-clip rounded-md p-0"><div class="relative aspect-square w-full overflow-hidden bg-muted"><div class="h-full w-full transition-transform duration-200 group-hover/card:scale-105" style="background-color:${color}" role="img" aria-label="${n}"></div></div><div class="flex flex-1 flex-col gap-1 p-3"><div class="flex flex-col gap-1"><h3 class="line-clamp-2 text-sm leading-tight font-medium">${n}</h3><p class="line-clamp-1 text-sm text-muted-foreground">${sub}</p></div><div class="relative z-20 mt-auto flex flex-row gap-2 pt-2">${add ? '<button type="button" class="tu-btn tu-btn-default !h-8 flex-1 !rounded-md !px-3">Add to List</button>' : '<button type="button" class="tu-btn tu-btn-secondary !h-8 flex-1 !rounded-md !px-3">Details</button><button type="button" class="tu-btn tu-btn-default !h-8 flex-1 !rounded-md !px-3">Watch</button>'}</div></div></div>`;
          sc.append(it);
        });
        const navState = () => { const l = sc.scrollLeft > 4, r = sc.scrollLeft + sc.clientWidth < sc.scrollWidth - 4; [[nl, l], [nr, r]].forEach(([b, on]) => { b.style.opacity = on && box.dataset.hover ? '1' : '0'; b.style.transform = on && box.dataset.hover ? 'scale(1)' : 'scale(0.9)'; b.style.pointerEvents = on && box.dataset.hover ? 'auto' : 'none'; }); };
        box.onmouseenter = () => { box.dataset.hover = '1'; navState(); }; box.onmouseleave = () => { delete box.dataset.hover; navState(); }; sc.onscroll = navState;
        nr.onclick = () => sc.scrollBy({ left: 208, behavior: REDUCE ? 'auto' : 'smooth' }); nl.onclick = () => sc.scrollBy({ left: -208, behavior: REDUCE ? 'auto' : 'smooth' });
        await t.sleep(1800); box.dataset.hover = '1'; navState(); await t.sleep(500); await press(nr, t, 0.92); await t.sleep(900); await press(nr, t, 0.92); await t.sleep(1200); await press(nl, t, 0.92);
        await t.sleep(900); delete box.dataset.hover; navState(); await t.sleep(2400);
      } },

    { group: 'Tool cards', title: 'Social Posts', desc: 'Social post previews rendered by a tool — the X post (avatar, verified badge, handle · time, Like / Share with pink hover), the LinkedIn post (headline, "see more", thumbs-up) and the Instagram post (square media, heart) — each liked once. Cycles X, LinkedIn, Instagram.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.sp = ((ctx.sp ?? -1) + 1) % 3; const v = ['x', 'linkedin', 'instagram'][ctx.sp];
        const col = tuStage(root);
        await tuAsk(col, t, v === 'x' ? 'What did Athia post about early computing?' : v === 'linkedin' ? 'Pull up Sarah\'s launch post.' : 'Show Alex\'s latest photo.'); await tuCall(col, t, `fetch_post · ${v}`, 1000);
        const rel = (d) => { const s = Math.round((Date.now() - new Date(d).getTime()) / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s / 60)}m` : s < 86400 ? `${Math.round(s / 3600)}h` : s < 604800 ? `${Math.round(s / 86400)}d` : `${Math.round(s / 604800)}w`; };
        const cnt = (c) => c >= 1e6 ? `${(c / 1e6).toFixed(1)}M` : c >= 1000 ? `${(c / 1000).toFixed(1)}K` : String(c);
        const avatar = (src, cls) => `<img src="${src}" alt="" referrerpolicy="no-referrer" ${imgFallback} class="${cls} shrink-0 rounded-full bg-muted object-cover">`;
        const wrap = mk('div', 'tu-rise flex w-full min-w-0 max-w-xl flex-col gap-3'); let likeBtn, likes, liked = false, onLike;
        if (v === 'x') {
          likes = 5;
          wrap.innerHTML = `<article class="tu-card rounded-xl p-3 shadow-sm"><div class="flex gap-3">${avatar('https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?w=200&h=200&fit=crop', 'size-10')}<div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><div class="flex min-w-0 items-center gap-1"><span class="truncate font-semibold">Athia Zohra</span><svg viewBox="0 0 24 24" class="size-[18px] shrink-0 text-blue-500" aria-label="Verified account"><path fill="currentColor" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/></svg><span class="truncate text-muted-foreground">@athiazohra</span><span class="text-muted-foreground">·</span><span class="shrink-0 text-muted-foreground">${rel('2025-11-05T14:01:00.000Z')}</span></div><svg viewBox="0 0 300 271" class="size-4 shrink-0 text-muted-foreground/40" aria-label="X logo"><path fill="currentColor" d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z"/></svg></div><p class="text-[15px] leading-normal text-pretty whitespace-pre-wrap">Wild to think: in the 1940s we literally rewired programs by hand. Today, we ship apps worldwide with a single command.</p><div class="mt-3 flex items-center gap-4"><button type="button" aria-label="Like" class="tu-like tu-btn !h-auto !gap-1.5 !rounded-md !px-2 !py-1 hover:bg-pink-500/10 hover:text-pink-500">${lu('heart', 'size-4')}<span class="tu-n text-sm">${likes}</span></button><button type="button" aria-label="Share" class="tu-btn !h-auto !gap-1.5 !rounded-md !px-2 !py-1 hover:bg-blue-500/10 hover:text-blue-500">${lu('share', 'size-4')}</button></div></div></div></article>`;
          onLike = (on) => { const b = $('.tu-like', wrap); b.classList.toggle('text-pink-500', on); $('svg', b).style.fill = on ? 'currentColor' : 'none'; };
        } else if (v === 'linkedin') {
          likes = 847;
          wrap.innerHTML = `<article class="tu-card flex flex-col gap-3 rounded-lg p-3 shadow-sm"><header class="flex items-start gap-3">${avatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', 'size-12')}<div class="flex min-w-0 flex-1 flex-col leading-tight"><span class="text-sm font-semibold">Dr. Sarah Chen</span><span class="line-clamp-1 text-xs text-muted-foreground">VP of Engineering at TechCorp | Building the future of AI</span><div class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><span>${rel('2025-11-05T09:15:00.000Z')}</span><span>·</span><span>Edited</span></div></div><svg viewBox="0 0 72 72" class="size-5 shrink-0 text-[#0077b5]" aria-label="LinkedIn logo"><g fill="none" fill-rule="evenodd"><path d="M8 72h56c4.42 0 8-3.58 8-8V8c0-4.42-3.58-8-8-8H8C3.58 0 0 3.58 0 8v56c0 4.42 3.58 8 8 8z" fill="currentColor"/><path d="M62 62H51.3V43.8c0-4.98-1.9-7.78-5.83-7.78-4.3 0-6.54 2.9-6.54 7.78V62H28.63V27.33h10.3v4.67c0 0 3.1-5.73 10.45-5.73 7.36 0 12.62 4.5 12.62 13.8V62zM16.35 22.8c-3.5 0-6.35-2.86-6.35-6.4 0-3.52 2.85-6.4 6.35-6.4 3.5 0 6.35 2.88 6.35 6.4 0 3.54-2.85 6.4-6.35 6.4zM11.03 62h10.74V27.33H11.03V62z" fill="#FFF"/></g></svg></header><div class="tu-txt text-sm leading-relaxed text-pretty whitespace-pre-wrap">Excited to share that our team just shipped a major update to our ML pipeline. Six months of hard work, countless iterations, and one incredible team.\n\nKey learnings:\n• Start with the problem, not the solution\n• Iterate fast, fail faster\n• Celebrate small wins\n\nProud of everyone who made this possible!</div><div class="flex items-center gap-1 border-t border-border pt-1"><button type="button" aria-label="Like" class="tu-like tu-btn !h-auto !gap-1.5 !rounded-md !px-2 !py-1 hover:bg-muted">${lu('thumbs-up', 'size-4')}<span class="tu-n text-sm">${cnt(likes)}</span></button><button type="button" aria-label="Share" class="tu-btn !h-auto !gap-1.5 !rounded-md !px-2 !py-1 hover:bg-muted">${lu('share', 'size-4')}</button></div></article>`;
          onLike = (on) => { const b = $('.tu-like', wrap); b.classList.toggle('text-blue-600', on); $('svg', b).style.fill = on ? 'currentColor' : 'none'; };
        } else {
          likes = 3842;
          wrap.innerHTML = `<article class="tu-card overflow-hidden rounded-lg shadow-sm"><header class="flex items-center gap-3 p-3">${avatar('https://images.unsplash.com/photo-1695840358933-16dd7baa6dfb?w=200&h=200&fit=crop', 'size-8')}<div class="flex min-w-0 flex-1 items-center gap-1.5"><span class="truncate text-sm font-semibold">alexrivera</span>${lu('badge-check', 'size-3.5 shrink-0 text-sky-500')}<span class="text-muted-foreground">·</span><span class="text-sm text-muted-foreground">${rel('2025-11-05T18:45:00.000Z')}</span></div><svg viewBox="0 0 24 24" class="size-5 shrink-0" aria-label="Instagram logo"><defs><radialGradient id="tuig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fd5"/><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#tuig)"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.4" cy="7.6" r="1" fill="#fff"/></svg></header><div class="aspect-square w-full overflow-hidden bg-muted"><img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&h=700&fit=crop" alt="City skyline at golden hour" referrerpolicy="no-referrer" ${imgFallback} class="size-full object-cover"></div><div class="flex flex-col gap-2 p-3"><div class="flex items-center gap-1"><button type="button" aria-label="Like" class="tu-like tu-btn !h-auto !rounded-md !px-2 !py-1 hover:opacity-60">${lu('heart', 'size-5')}</button><button type="button" aria-label="Share" class="tu-btn !h-auto !rounded-md !px-2 !py-1 hover:opacity-60">${lu('share', 'size-5')}</button><span class="tu-n ml-auto text-sm font-semibold tabular-nums">${likes.toLocaleString('en-US')} likes</span></div><div><span class="text-sm font-semibold">alexrivera</span> <span class="text-sm leading-relaxed text-pretty">Golden hour in the city. Sometimes you just have to stop and appreciate the view.</span></div></div></article>`;
          onLike = (on) => { const b = $('.tu-like', wrap); b.classList.toggle('text-red-500', on); $('svg', b).style.fill = on ? 'currentColor' : 'none'; };
        }
        col.append(wrap); likeBtn = $('.tu-like', wrap);
        likeBtn.onclick = () => { liked = !liked; const n = likes + (liked ? 1 : 0); $('.tu-n', wrap).textContent = v === 'instagram' ? `${n.toLocaleString('en-US')} likes` : v === 'x' ? String(n) : cnt(n); onLike(liked); if (!REDUCE) $('svg', likeBtn).animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }); };
        await t.sleep(2400); await press(likeBtn, t, 0.92); await t.sleep(4200);
      } },

    { group: 'Tool cards', title: 'Audio', desc: 'An audio result as a player card: the compact variant blurs and saturates the artwork behind the row, the full variant puts 4:3 artwork over title, scrubber and times — play swaps to pause and the progress advances. Alternates compact and full.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.au = (ctx.au || 0) + 1; const full = ctx.au % 2 === 0;
        const col = tuStage(root);
        await tuAsk(col, t, 'Play me something calm from the forest.'); await tuCall(col, t, 'find_audio · nature', 1000);
        const ART = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop'; const DUR = 42;
        const tm = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
        const playBtn = (cls) => `<button type="button" aria-label="Play" class="tu-play tu-btn tu-btn-default !p-0 ${cls}">${lu('play', 'size-4 ml-0.5')}</button>`;
        const art = mk('article', `tu-rise relative w-full min-w-0 ${full ? 'max-w-sm self-center' : 'max-w-md'}`);
        art.innerHTML = `<div class="tu-card group relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl text-sm">${full
          ? `<div class="flex w-full flex-col"><div class="relative aspect-[4/3] w-full overflow-hidden bg-muted"><img src="${ART}" alt="" referrerpolicy="no-referrer" ${imgFallback} class="absolute inset-0 h-full w-full object-cover"></div><div class="flex flex-col gap-5 p-4"><div class="space-y-0.5"><div class="line-clamp-2 leading-snug font-semibold text-foreground">Morning Forest</div><div class="line-clamp-2 text-sm leading-snug text-muted-foreground">Dawn chorus recorded in Olympic National Park</div></div><div class="flex items-start gap-3"><div class="flex flex-1 flex-col gap-2"><div class="relative flex h-4 items-center"><div class="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"><div class="tu-fill absolute inset-y-0 left-0 bg-foreground" style="width:0"></div></div><span class="tu-knob absolute size-3 -translate-x-1/2 rounded-full border-2 border-background bg-foreground" style="left:0"></span></div><div class="flex items-center justify-between text-xs text-muted-foreground tabular-nums"><span class="tu-cur">0:00</span><span>${tm(DUR)}</span></div></div>${playBtn('-mt-4 !size-10 !rounded-full shrink-0')}</div></div></div>`
          : `<div class="relative flex w-full items-center gap-3 overflow-hidden p-3"><img src="${ART}" alt="" aria-hidden="true" referrerpolicy="no-referrer" ${imgFallback} class="pointer-events-none absolute top-1/2 -left-1/4 h-[200%] w-auto -translate-y-1/2 object-cover opacity-40 blur-2xl saturate-150"><div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-[color-mix(in_oklab,var(--card)_60%,transparent)] to-[color-mix(in_oklab,var(--card)_90%,transparent)]"></div><div class="relative size-12 shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-background/20"><img src="${ART}" alt="" referrerpolicy="no-referrer" ${imgFallback} class="absolute inset-0 h-full w-full object-cover"></div><div class="relative flex min-w-0 flex-1 flex-col justify-center"><div class="truncate text-sm leading-tight font-semibold text-foreground">Morning Forest</div><div class="mt-0.5 truncate text-xs leading-tight text-muted-foreground">Olympic National Park</div><div class="mt-1 flex items-center gap-2"><div class="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/20"><div class="tu-fill absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-150" style="width:0"></div></div><span class="tu-cur text-xs text-muted-foreground tabular-nums">0:00</span></div></div>${playBtn('relative !size-10 !rounded-full shrink-0 shadow-md')}</div>`}</div>`;
        col.append(art);
        const play = $('.tu-play', art), fill = $('.tu-fill', art), knob = $('.tu-knob', art), cur = $('.tu-cur', art); let pos = 0, playing = false, iv = null;
        const paint = () => { const p = (pos / DUR) * 100; fill.style.width = p + '%'; if (knob) knob.style.left = p + '%'; cur.textContent = tm(pos); play.innerHTML = playing ? lu('pause', 'size-4') : lu('play', 'size-4 ml-0.5'); play.setAttribute('aria-label', playing ? 'Pause' : 'Play'); };
        play.onclick = () => { playing = !playing; if (playing) iv = t.every(250, () => { pos = Math.min(DUR, pos + 0.25); if (pos >= DUR) { playing = false; t.stop(iv); } paint(); }); else t.stop(iv); paint(); };
        await t.sleep(1400); await press(play, t, 0.92); await t.sleep(7200); await press(play, t, 0.92); await t.sleep(2200);
      } },

    { group: 'Tool cards', title: 'Video', desc: 'A video result: a 16:9 player on black with the native controls and poster, and on hover an eased black gradient fades in over the top with the title and a frosted Watch button.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'Find a short clip of a forest canopy.'); await tuCall(col, t, 'search_video', 1000);
        const GRAD = 'linear-gradient(to bottom, hsl(0,0%,0%) 0%, hsla(0,0%,0%,0.987) 8.3%, hsla(0,0%,0%,0.951) 16.6%, hsla(0,0%,0%,0.896) 24.6%, hsla(0,0%,0%,0.825) 32.5%, hsla(0,0%,0%,0.741) 40.1%, hsla(0,0%,0%,0.648) 47.6%, hsla(0,0%,0%,0.55) 54.8%, hsla(0,0%,0%,0.45) 61.7%, hsla(0,0%,0%,0.352) 68.3%, hsla(0,0%,0%,0.259) 74.5%, hsla(0,0%,0%,0.175) 80.4%, hsla(0,0%,0%,0.104) 86%, hsla(0,0%,0%,0.049) 91.1%, hsla(0,0%,0%,0.013) 95.8%, hsla(0,0%,0%,0) 100%)';
        const art = mk('article', 'tu-rise relative w-full min-w-0');
        art.innerHTML = `<div class="tu-card group relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl text-sm"><div class="tu-v group relative aspect-video w-full overflow-hidden bg-black"><video class="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" src="https://archive.org/download/NatureStockVideo/IMG_9500_.mp4" poster="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&auto=format&fit=crop" controls playsinline muted preload="none"></video><div class="tu-ov pointer-events-none absolute inset-x-0 top-0 z-20 h-32 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style="background-image:${GRAD}"></div><div class="tu-ov2 absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-5 pt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"><div class="line-clamp-2 max-w-[70%] font-semibold text-white drop-shadow-sm">Forest Canopy</div><button type="button" class="tu-watch tu-btn !h-8 !rounded-md bg-black/55 !px-3 text-white hover:bg-black/70">${lu('play', 'mr-1 h-4 w-4')}Watch</button></div></div><div class="flex items-center gap-3 px-4 py-3"><img src="https://api.dicebear.com/7.x/shapes/svg?seed=archive" alt="" referrerpolicy="no-referrer" ${imgFallback} class="size-8 shrink-0 rounded-full bg-muted"><div class="min-w-0 flex-1"><div class="line-clamp-1 text-sm text-muted-foreground">Sunlight filtering through the trees.</div><div class="line-clamp-1 text-xs text-muted-foreground">Archive.org · 0:08</div></div></div></div>`;
        col.append(art);
        const video = $('video', art); $('.tu-watch', art).onclick = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
        const hover = (on) => { $('.tu-ov', art).style.opacity = on ? '1' : ''; $('.tu-ov2', art).style.opacity = on ? '1' : ''; };
        await t.sleep(1800); hover(true); await t.sleep(3200); hover(false); await t.sleep(2500);
        if (!video.paused) video.pause();
      } },

    { group: 'Tool cards', title: 'Chart', desc: 'Data visualised in a card the way the recharts-based Chart does it: horizontal grid, quiet axes, bars with 4 px radius growing in over 1.5 s (or lines drawing in), a legend of 8 px swatches and a tooltip on hover. Alternates the bar and line presets.', kind: 'lib',
      async run(root, t, ctx) {
        ctx.ch = (ctx.ch || 0) + 1; const line = ctx.ch % 2 === 0;
        const col = tuStage(root);
        const P = line ? { title: 'System Performance', desc: 'CPU and Memory usage over time', x: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], series: [['CPU %', [45, 32, 67, 89, 76, 54], 'var(--chart-1)'], ['Memory %', [62, 58, 71, 85, 79, 68], 'var(--chart-2)']], max: 100, ticks: [0, 25, 50, 75, 100] }
          : { title: 'Monthly Revenue', desc: 'Revenue vs Expenses (2024)', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], series: [['Revenue', [4000, 3000, 5000, 2780, 1890, 2390], '#14B8A6'], ['Expenses', [2400, 1398, 3200, 3908, 4800, 3800], '#F87171']], max: 6000, ticks: [0, 1500, 3000, 4500, 6000] };
        await tuAsk(col, t, line ? 'How did the servers hold up today?' : 'Chart revenue against expenses for H1.'); await tuCall(col, t, `render_chart · ${line ? 'line' : 'bar'}`, 1000);
        const card = mk('div', 'tu-card tu-rise flex w-full min-w-0 flex-col gap-6 rounded-xl py-6 shadow-sm');
        card.innerHTML = `<div class="grid gap-1.5 px-6"><div class="leading-none font-semibold text-pretty">${P.title}</div><div class="text-sm text-pretty text-muted-foreground">${P.desc}</div></div><div class="relative px-6"><div class="tu-plot relative aspect-video w-full"></div><div class="flex items-center justify-center gap-4 pt-3">${P.series.map(([n, , c]) => `<div class="flex items-center gap-1.5"><div class="h-2 w-2 shrink-0 rounded-[2px]" style="background:${c}"></div><span class="text-xs">${n}</span></div>`).join('')}</div><div class="tu-tip pointer-events-none absolute z-10 grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl" hidden></div></div>`;
        col.append(card); await frame();
        const plot = $('.tu-plot', card), tip = $('.tu-tip', card); const W = Math.max(220, plot.clientWidth), H = Math.max(140, plot.clientHeight);
        const L = 44, R = 8, T = 8, B = 26, iw = W - L - R, ih = H - T - B; const y = (v) => T + ih - (v / P.max) * ih; const band = iw / P.x.length;
        let s = `<svg width="${W}" height="${H}" class="overflow-visible text-xs" aria-hidden="true">`;
        P.ticks.forEach((tk) => { s += `<line x1="${L}" x2="${L + iw}" y1="${y(tk)}" y2="${y(tk)}" stroke="var(--border)" stroke-opacity=".5"/><text x="${L - 10}" y="${y(tk)}" dy="0.32em" text-anchor="end" fill="var(--muted-foreground)" font-size="12">${tk}</text>`; });
        P.x.forEach((lab, i) => { s += `<text x="${L + band * i + band / 2}" y="${T + ih + 18}" text-anchor="middle" fill="var(--muted-foreground)" font-size="12">${lab}</text>`; });
        s += `<rect class="tu-cursor" x="0" y="${T}" width="${band}" height="${ih}" fill="var(--muted)" opacity="0"/>`;
        if (!line) {
          const gap = 4, bw = Math.max(4, (band * 0.8 - gap) / 2);
          P.series.forEach(([, data, c], k) => data.forEach((v, i) => { const x = L + band * i + band * 0.1 + k * (bw + gap); s += `<path class="tu-bar" data-h="${ih - (y(v) - T)}" d="" fill="${c}" data-x="${x}" data-w="${bw}" data-b="${T + ih}"/>`; }));
        } else {
          P.series.forEach(([, data, c]) => { const pts = data.map((v, i) => [L + band * i + band / 2, y(v)]); const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(''); s += `<path class="tu-line" d="${d}" fill="none" stroke="${c}" stroke-width="2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${REDUCE ? 0 : 1}"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${c}" class="tu-dot" opacity="${REDUCE ? 1 : 0}"/>`).join('')}`; });
        }
        plot.innerHTML = s + '</svg>';
        const ease = (x) => 1 - Math.pow(1 - x, 3);
        const bars = $$('.tu-bar', plot); const drawBars = (k) => bars.forEach((b) => { const hgt = +b.dataset.h * k, x = +b.dataset.x, w = +b.dataset.w, base = +b.dataset.b, r = Math.min(4, w / 2, hgt); b.setAttribute('d', hgt <= 0 ? '' : `M${x},${base}V${base - hgt + r}Q${x},${base - hgt} ${x + r},${base - hgt}H${x + w - r}Q${x + w},${base - hgt} ${x + w},${base - hgt + r}V${base}Z`); });
        if (!line) { if (REDUCE) drawBars(1); else { const t0 = performance.now(); const iv = t.every(16, () => { const k = Math.min(1, (performance.now() - t0) / 1500); drawBars(ease(k)); if (k >= 1) t.stop(iv); }); } }
        else if (!REDUCE) { $$('.tu-line', plot).forEach((p) => { p.style.transition = 'stroke-dashoffset 1500ms ease'; }); await frame(); $$('.tu-line', plot).forEach((p) => { p.style.strokeDashoffset = '0'; }); t.sleep(1300).then(() => $$('.tu-dot', plot).forEach((d) => { d.style.transition = 'opacity 300ms'; d.setAttribute('opacity', '1'); })); }
        const showTip = (i) => { const cur = $('.tu-cursor', plot); cur.setAttribute('x', L + band * i); cur.setAttribute('opacity', line ? '0' : '0.6'); tip.innerHTML = `<div class="font-medium">${P.x[i]}</div><div class="grid gap-1.5">${P.series.map(([n, d, c]) => `<div class="flex w-full items-center gap-2"><div class="h-2.5 w-2.5 shrink-0 rounded-[2px]" style="background:${c}"></div><div class="flex flex-1 items-center justify-between gap-3 leading-none"><span class="text-muted-foreground">${n}</span><span class="font-mono font-medium text-foreground tabular-nums">${d[i].toLocaleString('en-US')}</span></div></div>`).join('')}</div>`; tip.hidden = false; const tx = 24 + L + band * i + band; tip.style.left = Math.min(tx, W - 100) + 'px'; tip.style.top = (T + 10) + 'px'; };
        plot.onmousemove = (e) => { const r = plot.getBoundingClientRect(); const i = Math.floor((e.clientX - r.left - L) / band); if (i >= 0 && i < P.x.length) showTip(i); };
        plot.onmouseleave = () => { tip.hidden = true; $('.tu-cursor', plot).setAttribute('opacity', '0'); };
        await t.sleep(2600); showTip(2); await t.sleep(1400); showTip(3); await t.sleep(1400); plot.onmouseleave(); await t.sleep(2600);
      } },

    { group: 'Tool cards', title: 'Data Table', desc: 'Sortable, responsive table output: ghost header buttons with ⇅ / ↑ / ↓ indicators, currency, signed delta and percent formatting in green and red, compact volumes — secondary columns drop out in narrow containers, and a sort click reorders the rows with a FLIP glide.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root, '!px-3'); col.classList.replace('max-w-md', 'max-w-xl');
        await tuAsk(col, t, 'How are the big tech stocks doing today?'); await tuCall(col, t, 'get_quotes', 1000);
        const DATA = [['IBM', 'International Business Machines', 170.42, 1.12, 0.66, 18420000], ['AAPL', 'Apple', 178.25, 2.35, 1.34, 52430000], ['MSFT', 'Microsoft', 380, 1.24, 0.33, 31250000], ['INTC', 'Intel Corporation', 39.85, -0.42, -1.04, 29840000], ['ORCL', 'Oracle Corporation', 110.31, 0.78, 0.71, 14230000]];
        const COLS = [['Symbol', 'left', 0], ['Company', 'left', 0], ['Price', 'right', 0], ['Change', 'right', 1], ['Change %', 'right', 1], ['Volume', 'right', 1]];
        const compact = (n) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
        const tone = (v) => v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-600 dark:text-red-500' : '';
        const cell = (r, k) => k === 0 ? `<span class="font-medium">${r[0]}</span>` : k === 1 ? `<span class="block max-w-[9rem] truncate">${esc(r[1])}</span>` : k === 2 ? money(r[2]) : k === 3 ? `<span class="${tone(r[3])}">${r[3] > 0 ? '+' : ''}${r[3].toFixed(2)}</span>` : k === 4 ? `<span class="${tone(r[4])}">${r[4] > 0 ? '+' : ''}${r[4].toFixed(2)}%</span>` : compact(r[5]);
        const wrap = mk('div', 'tu-rise @container relative w-full min-w-0');
        wrap.innerHTML = `<div class="tu-card flex flex-col overflow-hidden rounded-2xl"><div class="overflow-x-auto"><table class="w-full caption-bottom text-sm"><thead class="[&_tr]:border-b [&_tr]:border-border"><tr>${COLS.map(([l, a, sec], i) => `<th scope="col" class="h-10 px-2 align-middle font-medium whitespace-nowrap text-foreground ${a === 'right' ? 'text-right' : 'text-left'} ${i === 0 ? 'pl-1' : ''} ${i === COLS.length - 1 ? 'pr-1' : ''} ${sec ? 'hidden @[540px]:table-cell' : ''}"><button type="button" data-k="${i}" class="tu-sort tu-btn tu-btn-ghost !h-8 !w-fit min-w-10 !gap-1 !rounded-md !px-3 font-normal ${i === 0 ? '!pl-4' : ''} ${i === COLS.length - 1 ? '!pr-4' : ''} ${a === 'right' ? 'text-right' : ''}"><span>${l}</span><span aria-hidden="true" class="tu-ar min-w-4 shrink-0 text-center opacity-20">⇅</span></button></th>`).join('')}</tr></thead><tbody class="tu-body [&_tr:last-child]:border-0"></tbody></table></div></div>`;
        col.append(wrap);
        const tbody = $('.tu-body', wrap); let sortBy = null, dir = null;
        const rows = DATA.map((r, i) => { const tr = mk('tr', 'border-b border-border transition-colors hover:bg-muted/50'); tr.innerHTML = COLS.map(([, a, sec], k) => `<td class="p-2 align-middle whitespace-nowrap tabular-nums ${a === 'right' ? 'text-right' : ''} ${k === 0 ? 'pl-5' : ''} ${k === COLS.length - 1 ? 'pr-5' : ''} ${sec ? 'hidden @[540px]:table-cell' : ''}">${cell(r, k)}</td>`).join(''); tr.r = r; ani(tr, `tu-rise 280ms ease-out ${i * 60}ms both`); tbody.append(tr); return tr; });
        const sort = (k) => {
          if (sortBy === k) dir = dir === 'asc' ? 'desc' : dir === 'desc' ? null : 'asc'; else { sortBy = k; dir = 'asc'; }
          $$('.tu-sort', wrap).forEach((b) => { const on = +b.dataset.k === sortBy && dir; const ar = $('.tu-ar', b); ar.textContent = on ? (dir === 'asc' ? '↑' : '↓') : '⇅'; ar.classList.toggle('opacity-20', !on); });
          const first = new Map(rows.map((tr) => [tr, tr.getBoundingClientRect().top]));
          const order = dir ? [...rows].sort((a, b) => { const x = a.r[k], y = b.r[k]; const c = typeof x === 'string' ? x.localeCompare(y) : x - y; return dir === 'asc' ? c : -c; }) : rows;
          order.forEach((tr) => tbody.append(tr));
          if (!REDUCE) order.forEach((tr) => { const dy = first.get(tr) - tr.getBoundingClientRect().top; if (dy) tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(0.22,1,0.36,1)' }); });
        };
        $$('.tu-sort', wrap).forEach((b) => { b.onclick = () => sort(+b.dataset.k); });
        await t.sleep(1900); const priceBtn = $('[data-k="2"]', wrap); priceBtn.classList.add('is-hover'); await t.sleep(350); await press(priceBtn, t, 0.97);
        await t.sleep(1500); await press(priceBtn, t, 0.97); priceBtn.classList.remove('is-hover'); await t.sleep(3200);
      } },

    { group: 'Tool cards', title: 'Weather Widget', desc: 'Current conditions and a five-day forecast for a location: a 4:3 night-sky card with rain and lightning (a CSS stand-in for Tool cards\'s WebGL effect layer), fluid clamp() type for place, temperature and H / L, and a frosted forecast strip.', kind: 'lib',
      async run(root, t) {
        const col = tuStage(root);
        await tuAsk(col, t, 'What\'s the weather in Kansas City tonight?'); await tuCall(col, t, 'get_weather · Kansas City, MO', 1100);
        const FC = [['Tue', 75, 62, 'cloud-rain-wind'], ['Wed', 70, 58, 'cloud-rain'], ['Thu', 68, 55, 'cloud'], ['Fri', 72, 52, 'cloud-sun'], ['Sat', 76, 58, 'sun']];
        const FONT = 'font-family:"SF Pro Text", Inter, "Noto Sans", system-ui, sans-serif;font-feature-settings:"tnum" 1, "case" 1';
        const box = mk('div', 'tu-rise isolate w-full max-w-md');
        box.innerHTML = `<div class="relative aspect-[4/3] overflow-clip rounded-2xl border-0 bg-gradient-to-b from-zinc-950 via-zinc-900/70 to-zinc-950 p-0 shadow-none [container-type:size]"><div class="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,rgba(80,90,130,0.35),transparent_60%)]"></div><div class="tu-rain"></div><div class="tu-flash pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_65%_10%,rgba(200,210,255,0.55),transparent_70%)]" style="opacity:0"></div>
          <div class="pointer-events-auto absolute inset-0 z-10 flex flex-col select-none"><div class="px-6 pt-6"><div class="flex flex-col items-start"><h2 class="leading-[1.08] font-medium tracking-tight text-white/80" style="font-size:clamp(13px, 7.5cqmin, 17px);${FONT};text-shadow:0 1px 8px rgba(0,0,0,0.3)">Kansas City, MO</h2><div class="-mt-0.5 flex items-start gap-1"><span class="leading-[1.02] font-[250] tracking-[-0.015em] text-white/95 tabular-nums" style="font-size:clamp(48px, 32cqmin, 72px);${FONT};text-shadow:0 2px 20px rgba(0,0,0,0.25)">72</span><span class="mt-2 font-[250] text-white/80 tabular-nums" style="font-size:clamp(18px, 12cqmin, 28px);${FONT}">°F</span></div><div class="mt-0.5 flex items-center gap-3" style="${FONT}"><span class="font-medium tabular-nums" style="font-size:clamp(11px, 6.5cqmin, 15px)"><span class="text-white/55">H </span><span class="text-white">78°</span></span><span class="font-medium tabular-nums" style="font-size:clamp(11px, 6.5cqmin, 15px)"><span class="text-white/55">L </span><span class="text-white">65°</span></span></div></div></div><div class="flex-1"></div><div class="px-3 pb-3"><div class="relative overflow-hidden rounded-xl px-3 py-2.5 backdrop-blur-md" style="background-color:rgba(255,255,255,0.08);box-shadow:inset 0 0 0 0.5px rgba(255,255,255,0.18)"><div class="relative flex items-center justify-between">${FC.map(([d, hi, lo, ic], i) => `<div class="flex flex-1 flex-col items-center gap-0.5" style="${FONT};${REDUCE ? '' : `animation:tu-rise 400ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 70}ms both`}"><span class="text-[10px] tracking-[0.08em] text-white uppercase ${i === 0 ? 'font-semibold' : 'font-medium'}">${d}</span>${lu(ic, `my-0.5 size-5 text-white ${i === 0 ? 'opacity-100' : 'opacity-70'} hidden [@container(min-height:250px)]:block`, 1.5)}<div class="flex flex-col items-center gap-0.5"><span class="text-[15px] leading-[1.2] tracking-[-0.01em] text-white tabular-nums ${i === 0 ? 'font-semibold' : 'font-medium'}">${hi}°</span><span class="text-[12px] leading-[1.3] font-normal text-white tabular-nums">${lo}°</span></div></div>`).join('')}</div></div></div></div></div>`;
        col.append(box);
        const flash = $('.tu-flash', box);
        const strike = async () => { if (REDUCE) return; flash.style.transition = 'opacity 60ms'; flash.style.opacity = '1'; await t.sleep(80); flash.style.opacity = '0.2'; await t.sleep(90); flash.style.opacity = '0.8'; await t.sleep(70); flash.style.transition = 'opacity 700ms ease-out'; flash.style.opacity = '0'; };
        await t.sleep(2200); await strike(); await t.sleep(3100); await strike(); await t.sleep(3200);
      } },
  ];
}
