/* Research collection: streaming / agent-response patterns in vanilla JS (base-nova):
 *   c-message-*, c-message-scroller-*, c-trace-*, c-spinner-*, c-skeleton-3/10
 * on top of their shadcn primitives (message, bubble, trace, marker, spinner, skeleton,
 * attachment, avatar, message-scroller from ui.shadcn.com/r/styles/base-nova) and the collection's
 * badge, frame and code-block, with its own tokens (:root / .dark).
 * Larger blocks (agent-activity-*, ai-chat-*, solution-agents-3) are rebuilt by hand. */
(window.LIB_PACKS = window.LIB_PACKS || []).push(function (h) {
  'use strict';
  const { mk, esc, REDUCE, tick, rnd, LUCIDE, lu, streamInto } = h;
  const EO = 'cubic-bezier(0.23, 1, 0.32, 1)'; // message-scroller-button / frame ease

  /* ------------------------------------------------------------------ CSS */
  if (!document.getElementById('lib-research-css')) {
    const st = document.createElement('style'); st.id = 'lib-research-css';
    st.textContent = `
.lib-research{--background:#fff;--foreground:#0a0a0a;--card:#fff;--card-foreground:#0a0a0a;--popover:#fff;--primary:#171717;--primary-foreground:#fafafa;--secondary:#f5f5f5;--secondary-foreground:#171717;--muted:#f5f5f5;--muted-foreground:#737373;--accent:#f5f5f5;--accent-foreground:#171717;--destructive:#e40014;--destructive-foreground:#9f0712;--border:#e5e5e5;--input:#e5e5e5;--ring:#a1a1a1;--success:#00bb7f;--success-foreground:#004e3b;--info:#8e51ff;--info-foreground:#4d179a;--warning:#edb200;--warning-foreground:#733e0a;--radius:.625rem;
--sh-kw:#d73a49;--sh-str:#032f62;--sh-fn:#6f42c1;--sh-num:#005cc5;--sh-com:#6a737d;--sh-head:#005cc5;
position:relative;background:var(--background);color:var(--foreground);font-family:Inter,Geist,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;container-type:inline-size}
.dark .lib-research{--background:#0a0a0a;--foreground:#fafafa;--card:#171717;--card-foreground:#fafafa;--popover:#262626;--primary:#e5e5e5;--primary-foreground:#171717;--secondary:#262626;--secondary-foreground:#fafafa;--muted:#262626;--muted-foreground:#a1a1a1;--accent:#404040;--accent-foreground:#fafafa;--destructive:#ff6568;--destructive-foreground:#e40014;--border:#ffffff1a;--input:#ffffff26;--ring:#737373;--success-foreground:#009767;--info-foreground:#7f22fe;--warning-foreground:#cd8900;
--sh-kw:#f97583;--sh-str:#9ecbff;--sh-fn:#b392f0;--sh-num:#79b8ff;--sh-com:#959da5;--sh-head:#79b8ff}
.lib-research code,.lib-research pre,.lib-research .font-mono{font-family:"Geist Mono","JetBrains Mono",ui-monospace,monospace}
.lib-research button{font:inherit;color:inherit}
.lib-research .rui-shimmer,.lib-research .rui-tl[data-status=running]>.rui-tt,.lib-research .rui-att[data-state=processing] .rui-att-title,.lib-research .rui-att[data-state=uploading] .rui-att-title{--_s:calc(3ch + 40px);--_hl:color-mix(in oklch,currentColor 20%,transparent);background-image:linear-gradient(110deg,currentColor calc(50% - var(--_s)),color-mix(in oklch,var(--_hl),currentColor 50%) calc(50% - var(--_s) * .5),var(--_hl) 50%,color-mix(in oklch,var(--_hl),currentColor 50%) calc(50% + var(--_s) * .5),currentColor calc(50% + var(--_s)));background-repeat:no-repeat;background-size:calc(200% + var(--_s) * 2) 100%;background-position:0 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:rui-shimmer 2s linear infinite}
.dark .lib-research .rui-shimmer,.dark .lib-research .rui-tl[data-status=running]>.rui-tt,.dark .lib-research .rui-att[data-state] .rui-att-title{--_hl:color-mix(in oklch,currentColor 30%,#fff)}
@keyframes rui-shimmer{0%{background-position:100% 0}to{background-position:0 0}}
@keyframes rui-spin{to{transform:rotate(360deg)}}
@keyframes rui-pulse{50%{opacity:.5}}
@keyframes rui-bounce{0%,to{transform:translateY(-25%);animation-timing-function:cubic-bezier(.8,0,1,1)}50%{transform:none;animation-timing-function:cubic-bezier(0,0,.2,1)}}
@keyframes rui-dots{0%{background-position:0 0}to{background-position:22px 22px}}
.lib-research .rui-spin{animation:rui-spin 1s linear infinite}
.lib-research .rui-pulse{animation:rui-pulse 2s cubic-bezier(.4,0,.6,1) infinite}
.lib-research .rui-bounce{animation:rui-bounce 1s infinite}
@media (prefers-reduced-motion:reduce){.lib-research .rui-shimmer,.lib-research .rui-tl[data-status=running]>.rui-tt,.lib-research .rui-att[data-state] .rui-att-title{animation:none;background-image:none;-webkit-text-fill-color:currentColor}.lib-research .rui-pulse,.lib-research .rui-bounce{animation:none}}
.lib-research .rui-skel{border-radius:calc(var(--radius) - 2px);background:var(--muted);animation:rui-pulse 2s cubic-bezier(.4,0,.6,1) infinite}
@media (prefers-reduced-motion:reduce){.lib-research .rui-skel{animation:none}}
.lib-research .rui-trace{display:flex;width:100%;min-width:0;flex-direction:column;gap:.5rem}
.lib-research .rui-trace>a,.lib-research .rui-trace>button.rui-tlink{display:flex;width:fit-content;max-width:100%;min-width:0;border-radius:.375rem;text-align:left;outline:none;text-decoration:none;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.lib-research .rui-tl{display:flex;width:fit-content;max-width:100%;min-width:0;align-items:center;gap:.5rem;font-size:.875rem;line-height:1.25rem;color:var(--muted-foreground);transition:color .15s}
.lib-research :is(a,button) .rui-tl{cursor:pointer}
.lib-research :is(a,button):hover .rui-tl{color:var(--foreground)}
.lib-research .rui-tl[data-status=error],.lib-research :is(a,button):hover .rui-tl[data-status=error]{color:var(--destructive)}
.lib-research .rui-tl[data-status=pending]{opacity:.6}
.lib-research .rui-ti{display:flex;width:1rem;height:1rem;flex-shrink:0;align-items:center;justify-content:center}
.lib-research .rui-ti svg{pointer-events:none}
.lib-research .rui-ti svg:not([class*=size-]){width:1rem;height:1rem}
.lib-research .rui-tt~.rui-ti{margin-left:-.25rem}
.lib-research .rui-tt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lib-research .rui-td{flex-shrink:0;color:color-mix(in oklch,var(--muted-foreground) 70%,transparent);font-variant-numeric:tabular-nums}
.lib-research .rui-tc{display:flex;width:100%;min-width:0;flex-direction:column}
.lib-research .rui-tct{display:flex;width:fit-content;max-width:100%;min-width:0;cursor:pointer;align-items:center;gap:.25rem;border:0;background:none;padding:0;border-radius:.375rem;text-align:left;color:var(--muted-foreground);transition:color .15s;outline:none}
.lib-research .rui-tct:hover{color:var(--foreground)}
.lib-research .rui-tct:has([data-status=error]){color:var(--destructive)}
.lib-research :is(.rui-tct,.rui-btn,.rui-trace>a,.rui-tlink):focus-visible{box-shadow:0 0 0 3px color-mix(in oklch,var(--ring) 50%,transparent)}
.lib-research .rui-chev{transition:transform .15s}
.lib-research .rui-tct[aria-expanded=true]>.rui-chev{transform:rotate(90deg)}
.lib-research .rui-tcc{min-width:0;overflow:hidden}
.lib-research .rui-tcci{margin:.5rem 0 .25rem calc(.5rem - 1px);min-width:0;border-left:1px solid var(--border);padding:0 .25rem 0 1rem;font-size:.875rem;line-height:1.625;overflow-wrap:break-word;color:var(--muted-foreground)}
.lib-research .rui-msg{position:relative;display:flex;width:100%;min-width:0;gap:.5rem;font-size:.875rem;line-height:1.25rem}
.lib-research .rui-msg[data-align=end]{flex-direction:row-reverse}
.lib-research .rui-msg-av{display:flex;width:fit-content;min-width:2rem;flex-shrink:0;align-items:center;justify-content:center;align-self:flex-end;overflow:hidden;border-radius:9999px;background:var(--muted)}
.lib-research .rui-msg-av:empty{background:transparent}
.lib-research .rui-msg:has(.rui-msg-foot) .rui-msg-av{transform:translateY(-2rem)}
.lib-research .rui-msg-content{display:flex;width:100%;min-width:0;flex-direction:column;gap:.625rem;overflow-wrap:break-word}
.lib-research .rui-msg[data-align=end] .rui-msg-content>*{align-self:flex-end}
.lib-research .rui-msg-head,.lib-research .rui-msg-foot{display:flex;max-width:100%;min-width:0;align-items:center;padding:0 .75rem;font-size:.75rem;line-height:1rem;font-weight:500;color:var(--muted-foreground)}
.lib-research .rui-msg:has([data-variant=ghost]) :is(.rui-msg-head,.rui-msg-foot){padding:0}
.lib-research .rui-msg[data-align=end] .rui-msg-foot{justify-content:flex-end}
.lib-research .rui-msg-group{display:flex;min-width:0;flex-direction:column;gap:.5rem}
.lib-research .rui-bubble{position:relative;display:flex;width:fit-content;max-width:80%;min-width:0;flex-direction:column;gap:.25rem}
.lib-research .rui-bubble[data-align=end]{align-self:flex-end}
.lib-research .rui-bubble[data-variant=ghost]{max-width:100%}
.lib-research .rui-bc{width:fit-content;max-width:100%;min-width:0;overflow:hidden;border-radius:.75rem;border:1px solid transparent;padding:.5rem .75rem;font-size:.875rem;line-height:1.625;overflow-wrap:break-word;text-align:left}
.lib-research [data-variant=default]>.rui-bc{background:var(--primary);color:var(--primary-foreground)}
.lib-research [data-variant=muted]>.rui-bc{background:var(--muted)}
.lib-research [data-variant=secondary]>.rui-bc{background:var(--secondary);color:var(--secondary-foreground)}
.lib-research [data-variant=outline]>.rui-bc{border-color:var(--border);background:var(--background)}
.lib-research [data-variant=tinted]>.rui-bc{background:color-mix(in oklch,var(--primary) 8%,var(--background))}
.lib-research [data-variant=ghost]>.rui-bc{border-radius:0;background:transparent;padding:0}
.lib-research .rui-av{position:relative;display:flex;width:2rem;height:2rem;flex-shrink:0;border-radius:9999px;user-select:none}
.lib-research .rui-av::after{content:"";position:absolute;inset:0;border-radius:inherit;border:1px solid var(--border);mix-blend-mode:darken;z-index:2}
.dark .lib-research .rui-av::after{mix-blend-mode:lighten}
.lib-research .rui-av img{position:absolute;inset:0;width:100%;height:100%;border-radius:inherit;object-fit:cover;z-index:1}
.lib-research .rui-av-fb{display:flex;width:100%;height:100%;align-items:center;justify-content:center;border-radius:inherit;background:var(--muted);font-size:.75rem;color:var(--muted-foreground)}
.lib-research .rui-av-badge{position:absolute;right:0;bottom:0;z-index:3;width:.625rem;height:.625rem;border-radius:9999px;box-shadow:0 0 0 2px var(--background)}
.lib-research .rui-marker{position:relative;display:flex;min-height:1rem;width:100%;align-items:center;gap:.5rem;text-align:left;font-size:.875rem;color:var(--muted-foreground)}
.lib-research .rui-marker[data-variant=separator]::before,.lib-research .rui-marker[data-variant=separator]::after{content:"";height:1px;min-width:0;flex:1;background:var(--border)}
.lib-research .rui-marker[data-variant=separator]::before{margin-right:.25rem}
.lib-research .rui-marker[data-variant=separator]::after{margin-left:.25rem}
.lib-research .rui-badge{position:relative;display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;width:fit-content;height:1.25rem;min-width:1.25rem;gap:.25rem;border:1px solid transparent;border-radius:calc(var(--radius) - 4px);padding:0 .3125rem;font-size:.75rem;line-height:1;font-weight:500;white-space:nowrap}
.lib-research .rui-badge svg{width:.75rem;height:.75rem}
.lib-research .rui-badge[data-v=default]{background:var(--primary);color:var(--primary-foreground)}
.lib-research .rui-badge[data-v=secondary]{background:var(--secondary);color:var(--secondary-foreground)}
.lib-research .rui-badge[data-v=outline]{border-color:var(--border);color:var(--foreground)}
.lib-research .rui-badge[data-v=destructive]{background:var(--destructive);color:#fff}
${['primary', 'success', 'warning', 'info', 'destructive'].map((c) => `.lib-research .rui-badge[data-v=${c}-light]{border-color:color-mix(in oklch,var(--${c}) ${c === 'primary' ? 10 : 15}%,transparent);background:color-mix(in oklch,var(--${c}) 10%,transparent);color:var(--${c === 'primary' ? 'primary' : c + '-foreground'})}.dark .lib-research .rui-badge[data-v=${c}-light]{border-color:color-mix(in oklch,var(--${c}) 25%,transparent);background:color-mix(in oklch,var(--${c}) 15%,transparent);color:var(--${c})}`).join('\n')}
.lib-research .rui-badge[data-r=full]{border-radius:9999px}
.lib-research .rui-btn{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:.375rem;height:2rem;padding:0 .625rem;white-space:nowrap;border-radius:calc(var(--radius) - 2px);border:1px solid transparent;background:transparent;font-size:.875rem;font-weight:500;line-height:1;transition:background-color .15s,color .15s,border-color .15s,opacity .15s,transform .1s;outline:none;cursor:pointer;user-select:none}
.lib-research .rui-btn:active{transform:translateY(1px)}
.lib-research .rui-btn:disabled{pointer-events:none;opacity:.5}
.lib-research .rui-btn svg{width:1rem;height:1rem;flex-shrink:0;pointer-events:none}
.lib-research .rui-btn[data-v=default]{background:var(--primary);color:var(--primary-foreground)}
.lib-research .rui-btn[data-v=default]:hover{background:color-mix(in oklch,var(--primary) 85%,transparent)}
.lib-research .rui-btn[data-v=outline]{border-color:var(--border);background:var(--background);box-shadow:0 1px 2px 0 rgb(0 0 0/.05)}
.dark .lib-research .rui-btn[data-v=outline]{background:color-mix(in oklch,var(--input) 30%,transparent);border-color:var(--input)}
.lib-research .rui-btn:is([data-v=outline],[data-v=ghost]):hover,.lib-research .rui-btn.is-hover{background:var(--muted);color:var(--foreground)}
.lib-research .rui-btn[data-v=secondary]{background:var(--secondary);color:var(--secondary-foreground)}
.lib-research .rui-btn[data-v=secondary]:hover{background:color-mix(in oklch,var(--secondary),var(--foreground) 6%)}
.lib-research .rui-btn[data-v=link]{height:auto;padding:0;color:var(--primary);text-underline-offset:4px}
.lib-research .rui-btn[data-v=link]:hover{text-decoration:underline}
.lib-research .rui-btn[data-s=sm]{height:1.75rem;padding:0 .625rem;font-size:.8rem;gap:.25rem}
.lib-research .rui-btn[data-s=xs]{height:1.5rem;padding:0 .5rem;font-size:.75rem;gap:.25rem;border-radius:calc(var(--radius) - 4px)}
.lib-research .rui-btn[data-s=xs] svg{width:.75rem;height:.75rem}
.lib-research .rui-btn[data-s=icon]{width:2rem;padding:0}
.lib-research .rui-btn[data-s=icon-sm]{width:1.75rem;height:1.75rem;padding:0}
.lib-research .rui-btn[data-s=icon-xs]{width:1.5rem;height:1.5rem;padding:0;border-radius:calc(var(--radius) - 4px)}
.lib-research .rui-btn[data-s=icon-xs] svg{width:.875rem;height:.875rem}
.lib-research .rui-card{display:flex;flex-direction:column;min-width:0;border-radius:calc(var(--radius) + 4px);background:var(--card);color:var(--card-foreground);box-shadow:0 0 0 1px color-mix(in oklch,var(--foreground) 10%,transparent);font-size:.875rem;--card-spacing:1rem}
.lib-research .rui-frame{position:relative;display:flex;flex-direction:column;gap:3px;padding:3px;min-width:0;border:1px solid var(--border);border-radius:calc(var(--radius) + 4px);background:color-mix(in oklch,var(--muted) 50%,transparent);background-clip:padding-box}
.lib-research .rui-fpanel{position:relative;min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:calc(var(--radius) + 4px - 4px);background:var(--card);box-shadow:0 1px 2px 0 rgb(0 0 0/.05)}
.lib-research .rui-code{position:relative;min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:calc(var(--radius) - 2px);background:var(--card);color:var(--foreground);text-align:left}
.lib-research .rui-code-head{display:flex;height:2.25rem;align-items:center;justify-content:space-between;gap:.5rem;border-bottom:1px solid var(--border);padding:0 .375rem 0 .75rem;font-size:.75rem;color:var(--muted-foreground)}
.lib-research .rui-code pre{margin:0;padding:.625rem 0;overflow-x:auto;font-size:.75rem;line-height:1.375rem;counter-reset:cb-line var(--start,0);scrollbar-width:thin}
.lib-research .rui-cl{position:relative;display:block;min-height:1.375rem;padding:0 .75rem;white-space:pre}
.lib-research .rui-code[data-wrap] .rui-cl{white-space:pre-wrap;word-break:break-word}
.lib-research .rui-code[data-ln] .rui-cl{padding-left:3rem}
.lib-research .rui-code[data-ln] .rui-cl::before{counter-increment:cb-line;content:counter(cb-line);position:absolute;left:0;width:2.125rem;text-align:right;color:color-mix(in oklch,var(--muted-foreground) 50%,transparent);font-variant-numeric:tabular-nums;user-select:none}
.lib-research .rui-code[data-diff] .rui-cl{padding-left:1.25rem}
.lib-research .rui-cl[data-diff=add]{background:color-mix(in oklch,var(--success) 8%,transparent)}
.lib-research .rui-cl[data-diff=remove]{background:color-mix(in oklch,var(--destructive) 8%,transparent)}
.lib-research .rui-cl[data-diff]::after{position:absolute;left:0;width:1rem;text-align:center;user-select:none}
.lib-research .rui-cl[data-diff=add]::after{content:"+";color:var(--success)}
.lib-research .rui-cl[data-diff=remove]::after{content:"-";color:var(--destructive)}
.lib-research .rui-cl[data-level=error]{background:color-mix(in oklch,var(--destructive) 8%,transparent)}
.lib-research .rui-cl[data-hl]{background:color-mix(in oklch,var(--primary) 6%,transparent);box-shadow:inset 2px 0 0 color-mix(in oklch,var(--primary) 60%,transparent)}
.dark .lib-research .rui-cl[data-diff=add]{background:color-mix(in oklch,var(--success) 12%,transparent)}
.dark .lib-research :is(.rui-cl[data-diff=remove],.rui-cl[data-level=error]){background:color-mix(in oklch,var(--destructive) 12%,transparent)}
.lib-research .sh-kw{color:var(--sh-kw)}.lib-research .sh-str{color:var(--sh-str)}.lib-research .sh-fn{color:var(--sh-fn)}.lib-research .sh-num{color:var(--sh-num)}.lib-research .sh-com{color:var(--sh-com)}.lib-research .sh-head{color:var(--sh-head)}
.lib-research .rui-vp{min-height:0;flex:1;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-gutter:stable;-webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 20px),transparent);mask-image:linear-gradient(to bottom,#000 calc(100% - 20px),transparent)}
.lib-research .rui-sbtn{position:absolute;left:50%;bottom:1rem;z-index:5;display:grid;width:1.75rem;height:1.75rem;place-items:center;border-radius:9999px;border:1px solid var(--border);background:var(--background);color:var(--foreground);box-shadow:0 1px 3px rgb(0 0 0/.1);cursor:pointer;transform:translate(-50%,0) scale(1);opacity:1;transition:transform .2s ${EO},opacity .2s ${EO}}
.lib-research .rui-sbtn:hover{background:var(--muted)}
.lib-research .rui-sbtn[data-active=false]{pointer-events:none;opacity:0;transform:translate(-50%,100%) scale(.95);transition-duration:.4s;transition-timing-function:cubic-bezier(.7,0,.84,0)}
.lib-research .rui-att{position:relative;display:flex;width:fit-content;max-width:100%;min-width:10rem;flex-shrink:0;flex-wrap:wrap;align-items:center;gap:.5rem;border:1px solid var(--border);border-radius:.75rem;background:var(--card);color:var(--card-foreground);font-size:.875rem;padding:.5rem;transition:background-color .15s}
.lib-research .rui-att[data-orientation=vertical]{flex-direction:column;align-items:stretch;flex-wrap:nowrap}
.lib-research .rui-att-media{position:relative;display:flex;aspect-ratio:1;width:2.5rem;flex-shrink:0;align-items:center;justify-content:center;overflow:hidden;border-radius:.5rem;background:var(--muted);color:var(--foreground)}
.lib-research .rui-att[data-orientation=vertical] .rui-att-media{width:100%}
.lib-research .rui-att-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.6;transition:opacity .3s}
.lib-research .rui-att[data-state=done] .rui-att-media img{opacity:1}
.lib-research .rui-att-content{max-width:100%;min-width:0;flex:1;line-height:1.25}
.lib-research .rui-att[data-orientation=vertical] .rui-att-content{padding:0 .25rem}
.lib-research .rui-att-title{display:block;max-width:100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
.lib-research .rui-att-desc{display:block;margin-top:.125rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.75rem;color:var(--muted-foreground)}
.lib-research .rui-att[data-state=idle]{border-style:dashed}
.lib-research .rui-att[data-state=error]{border-color:color-mix(in oklch,var(--destructive) 30%,transparent)}
.lib-research .rui-att[data-state=error] .rui-att-media{background:color-mix(in oklch,var(--destructive) 10%,transparent);color:var(--destructive)}
.lib-research .rui-att[data-state=error] .rui-att-desc{color:color-mix(in oklch,var(--destructive) 80%,transparent)}
.lib-research .rui-att-media svg:not([class*=size-]){width:1rem;height:1rem}
.lib-research .rui-att-actions{position:relative;z-index:2;display:flex;flex-shrink:0;align-items:center}
.lib-research .rui-tabs{display:inline-flex;height:2rem;width:100%;align-items:center;justify-content:center;border-radius:calc(var(--radius) - 2px);background:var(--muted);padding:3px;color:var(--muted-foreground)}
.lib-research .rui-tab{display:inline-flex;height:100%;flex:1;align-items:center;justify-content:center;gap:.375rem;border-radius:calc(var(--radius) - 4px);border:1px solid transparent;padding:0 .5rem;font-size:.8125rem;font-weight:500;white-space:nowrap;cursor:pointer;background:none;transition:background-color .2s,color .2s,box-shadow .2s}
.lib-research .rui-tab[aria-selected=true]{background:var(--background);color:var(--foreground);box-shadow:0 1px 3px rgb(0 0 0/.1)}
.dark .lib-research .rui-tab[aria-selected=true]{background:color-mix(in oklch,var(--input) 30%,transparent);border-color:var(--input)}
.lib-research .rui-input{display:flex;min-width:0;align-items:center;gap:.25rem;border:1px solid var(--input);border-radius:calc(var(--radius) - 2px);background:transparent;box-shadow:0 1px 2px 0 rgb(0 0 0/.05);transition:border-color .15s,box-shadow .15s}
.dark .lib-research .rui-input{background:color-mix(in oklch,var(--input) 30%,transparent)}
.lib-research .rui-input.is-focus,.lib-research .rui-input:focus-within{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklch,var(--ring) 50%,transparent)}
.lib-research .rui-input input,.lib-research .rui-input textarea{min-width:0;flex:1;border:0;background:transparent;outline:none;font:inherit;font-size:.875rem;color:var(--foreground);padding:0 .625rem;height:2rem;resize:none}
.lib-research .rui-input input::placeholder,.lib-research .rui-input textarea::placeholder{color:var(--muted-foreground)}
.lib-research.rui-dotfield,.lib-research .rui-dotfield{background-image:radial-gradient(color-mix(in oklch,var(--foreground) 14%,transparent) 1px,transparent 1.2px);background-size:11px 11px;animation:rui-dots 6s linear infinite}
@media (prefers-reduced-motion:reduce){.lib-research.rui-dotfield,.lib-research .rui-dotfield{animation:none}}
.lib-research .is-focus{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklch,var(--ring) 30%,transparent)}
.lib-research .rui-caret{display:inline-block;width:2px;height:1em;margin-inline-start:2px;transform:translateY(2px);background:var(--foreground)}
.lib-research .rui-sel{background:color-mix(in oklch,var(--info) 22%,transparent);border-radius:2px;box-shadow:0 0 0 2px color-mix(in oklch,var(--info) 22%,transparent)}
`;
    document.head.append(st);
  }

  /* --------------------------------------------------------------- lucide */
  const MORE = {
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
    brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
    'scroll-text': '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    'circle-stop': '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    'chart-line': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'file-code': '<path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>',
    palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
    'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'circle-dashed': '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
    'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    'mouse-pointer-2': '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
    bug: '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'flask-conical': '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
    webhook: '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
    'file-spreadsheet': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    'arrow-left-right': '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'corner-down-right': '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
    'git-pull-request-arrow': '<circle cx="5" cy="6" r="3"/><path d="M5 9v12"/><circle cx="19" cy="18" r="3"/><path d="m15 9-3-3 3-3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/>',
    'git-branch': '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'message-square-text': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    'cloud-upload': '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
    mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    'maximize-2': '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
    'square-pen': '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    square: '<rect width="14" height="14" x="5" y="5" rx="2"/>',
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'panel-right': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
    'sliders-horizontal': '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  };
  Object.keys(MORE).forEach((k) => { if (!(k in LUCIDE)) LUCIDE[k] = MORE[k]; });

  /* ----------------------------------------------------------- primitives */
  const I = (n, cls = 'size-4') => lu(n, cls);
  const spin = (cls = 'size-4') => lu('loader-circle', `${cls} ${REDUCE ? '' : 'rui-spin'}`).replace('aria-hidden="true"', 'role="status" aria-label="Loading"');
  const badge = (text, v = 'secondary', extra = '') => `<span class="rui-badge ${extra}" data-v="${v}">${text}</span>`;
  const TEMPO = 1.25; // scripted beats run a little slower than the source timers so each card reads as one ~8-16s moment
  const sleep = (t, ms) => (REDUCE ? t.sleep(Math.min(ms, 220)) : t.sleep(Math.round(ms * TEMPO)));
  function btn(label, v = 'outline', s = 'sm', icon, cls = '') {
    const b = mk('button', 'rui-btn ' + cls); b.type = 'button'; b.dataset.v = v; b.dataset.s = s;
    b.innerHTML = (icon ? (icon.startsWith('<') ? icon : I(icon)) : '') + (label ? `<span>${label}</span>` : '');
    if (!label && icon && !icon.startsWith('<')) b.setAttribute('aria-label', icon.replace(/-/g, ' '));
    return b;
  }
  const clip = (s) => { try { const p = navigator.clipboard?.writeText?.(s); if (p && p.catch) p.catch(() => {}); } catch (e) { /* no clipboard */ } };
  async function press(b, t, ms = 260, click = true) { // a scripted click: hover tint, then the real click handler
    if (!b || t.dead) return; b.classList.add('is-hover'); b.style.transform = 'translateY(1px)';
    await t.sleep(ms); b.style.transform = ''; b.classList.remove('is-hover'); if (click && !t.dead) { if (b.onclick) await b.onclick(); else b.click(); } // await async handlers so run() spans the scripted flow
  }
  function appear(el, y = 6, dur = 260) {
    if (REDUCE || !el) return el;
    el.style.opacity = '0'; el.style.transform = `translateY(${y}px)`;
    tick(() => { el.style.transition = `opacity ${dur}ms ${EO}, transform ${dur}ms ${EO}`; el.style.opacity = '1'; el.style.transform = 'none'; });
    return el;
  }
  const add = (parent, el, y) => { parent.append(el); return appear(el, y); };
  function stage(root, cls = 'min-h-[440px]', inner = 'max-w-md') {
    const s = mk('div', `lib-research flex w-full min-w-0 items-center justify-center overflow-hidden rounded-[20px] px-4 py-8 sm:px-8 ${cls}`);
    root.append(s);
    const w = mk('div', `flex w-full min-w-0 flex-col ${inner}`); s.append(w); s.w = w; return s;
  }
  const words = (s) => s.split(/(\s+)/).filter((w) => w.length);
  async function stream(node, text, t, ms = 26) {
    if (REDUCE) { node.append(document.createTextNode(text)); return; }
    await streamInto(node, text, t, ms);
  }
  async function streamChars(node, text, t, step = 4, ms = 24) {
    if (REDUCE) { node.textContent = text; return; }
    for (let i = 0; i < text.length && !t.dead; i += step) { node.textContent = text.slice(0, i + step); await t.sleep(ms); }
  }
  async function streamParas(box, text, t, ms = 22, cls = '') {
    for (const para of text.split('\n\n')) { const p = mk('p', 'whitespace-pre-wrap ' + cls); box.append(p); await stream(p, para, t, ms); }
  }
  /** Streams a tiny markdown subset (**bold**, `code`) word by word. */
  async function md(p, text, t, ms = 24) {
    let host = p;
    for (const w of words(text)) {
      if (!w.trim()) { host.append(document.createTextNode(w)); continue; }
      let rest = w;
      while (rest) {
        const m = rest.match(/\*\*|`/);
        const before = m ? rest.slice(0, m.index) : rest;
        if (before) host.append(document.createTextNode(before));
        if (!m) break;
        if (host === p) { host = m[0] === '**' ? mk('strong', 'font-medium text-foreground') : mk('code', 'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]'); p.append(host); } else host = p;
        rest = rest.slice(m.index + m[0].length);
      }
      if (!REDUCE) await t.sleep(ms * rnd(0.6, 1.4));
    }
  }

  /* collapsible (Base UI Collapsible + TraceCollapsibleContent: height .2s) */
  function setOpen(o, open, instant) {
    const p = o.panel; o.isOpen = open; o.trigger.setAttribute('aria-expanded', String(open)); p.inert = !open;
    if (instant || REDUCE) { p.style.transition = 'none'; p.style.height = open ? 'auto' : '0px'; return; }
    const from = p.getBoundingClientRect().height; const to = open ? p.scrollHeight : 0;
    p.style.transition = 'none'; p.style.height = from + 'px';
    if (Math.abs(from - to) < 1) { p.style.height = open ? 'auto' : '0px'; return; }
    tick(() => {
      p.style.transition = `height .2s ${EO}`; p.style.height = to + 'px';
      const done = (e) => { if (e.target !== p) return; p.removeEventListener('transitionend', done); if (o.isOpen) { p.style.transition = 'none'; p.style.height = 'auto'; } };
      p.addEventListener('transitionend', done);
    });
  }
  function coll(line, { open = false, chevron = true, bodyCls = '' } = {}) {
    const el = mk('div', 'rui-tc');
    const trigger = mk('button', 'rui-tct'); trigger.type = 'button'; trigger.append(line);
    if (chevron) trigger.insertAdjacentHTML('beforeend', `<span class="rui-ti rui-chev" aria-hidden="true">${I('chevron-right')}</span>`);
    const panel = mk('div', 'rui-tcc'); const body = mk('div', 'rui-tcci ' + bodyCls); panel.append(body); el.append(trigger, panel);
    const o = { el, trigger, panel, body, line, isOpen: false, set: (v, i) => setOpen(o, v, i) };
    trigger.onclick = () => setOpen(o, !o.isOpen);
    setOpen(o, open, true); return o;
  }
  /** TraceLine: {icon|iconHtml, title (html), desc (html), status, extra (html), after (icon)} */
  function TL(p = {}) {
    const el = mk('span', 'rui-tl'); el.p = p;
    el.set = (q = {}) => {
      Object.assign(p, q);
      if (p.status) el.dataset.status = p.status; else delete el.dataset.status;
      el.innerHTML = (p.iconHtml || p.icon ? `<span class="rui-ti" aria-hidden="true">${p.iconHtml || I(p.icon)}</span>` : '')
        + `<span class="rui-tt">${p.title ?? ''}</span>`
        + (p.desc != null && p.desc !== '' ? `<span class="rui-td">${p.desc}</span>` : '')
        + (p.extra || '') + (p.after ? `<span class="rui-ti" aria-hidden="true">${I(p.after)}</span>` : '');
      return el;
    };
    return el.set();
  }
  const trace = (cls = '') => mk('div', 'rui-trace ' + cls);
  /** Wraps an element that is already in the DOM without losing its place (wrap may return {el} or a node). */
  const swapWrap = (node, wrap) => { const ph = document.createComment(''); node.replaceWith(ph); const w = wrap(node); ph.replaceWith(w.el || w); return w; };
  const linkWrap = (line) => { const a = mk('a'); a.href = '#'; a.onclick = (e) => e.preventDefault(); a.append(line); return a; };

  /* message / bubble / avatar */
  function row(align = 'start') { const r = mk('div', 'rui-msg'); r.dataset.align = align; r.content = mk('div', 'rui-msg-content'); r.append(r.content); return r; }
  function avSlot(r, html = '', cls = '') { const a = mk('div', 'rui-msg-av ' + cls, html); r.prepend(a); r.av = a; return a; }
  function bubble(variant = 'default', html = '', align) { const b = mk('div', 'rui-bubble'); b.dataset.variant = variant; if (align) b.dataset.align = align; b.c = mk('div', 'rui-bc', html); b.append(b.c); return b; }
  const avatar = (src, fb, alt = '', extra = '', cls = '') => `<span class="rui-av ${cls}">${src ? `<img src="${src}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<span class="rui-av-fb">${fb}</span>${extra}</span>`;
  const UNS = (id) => `https://images.unsplash.com/photo-${id}?w=96&h=96&dpr=2&q=80`;
  const AV = { michael: UNS('1584308972272-9e4e7685e80f'), sarah: UNS('1519699047748-de8e457a634e'), viewer: UNS('1535713875002-d1d0cf377fde'), emma: UNS('1485893086445-ed75865251e0') };
  const sparkAv = () => I('sparkles', 'size-4 text-muted-foreground');
  const dots = () => `<span class="flex h-5 items-center gap-1" role="status" aria-label="Typing">${[-0.3, -0.15, 0].map((d) => `<span class="size-1.5 rounded-full bg-muted-foreground/70 ${REDUCE ? '' : 'rui-bounce'}" style="animation-delay:${d}s"></span>`).join('')}</span>`;
  /** An incoming turn: typing dots in the bubble, then the words stream into it. */
  async function typeIn(b, text, t, wait = 800, ms = 26) {
    b.c.innerHTML = dots(); await sleep(t, wait); b.c.textContent = ''; await stream(b.c, text, t, ms);
  }
  const marker = (html, variant = 'default', cls = '') => { const m = mk('div', 'rui-marker ' + cls, html); m.dataset.variant = variant; return m; };

  /* code block (CodeBlock subset: label header, diff, line levels, line numbers, tiny highlighter) */
  const KW = {
    ts: /\b(const|let|var|await|async|return|export|function|if|else|throw|new|import|from|type|interface|true|false|null|undefined)\b/,
    sql: /\b(select|from|where|group|by|order|limit|and|or|as|case|when|then|else|end|create|index|concurrently|on|desc|asc|count|ilike|is|null|join|avg|round)\b/i,
    css: /(@theme|inline)\b/,
  };
  function hl(line, lang) {
    if (!lang || lang === 'bash' || lang === 'text') return esc(line);
    if (lang === 'md') return /^#/.test(line) ? `<span class="sh-head">${esc(line)}</span>` : esc(line);
    const re = /(\/\/.*$|--\s.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_.]*\b)|([A-Za-z_$@][\w$-]*)(?=\s*\()|([A-Za-z_$@][\w$]*)/g;
    const kw = KW[lang === 'tsx' || lang === 'typescript' || lang === 'json' ? 'ts' : lang] || KW.ts;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index)); last = re.lastIndex;
      const s = esc(m[0]);
      if (m[1]) out += `<span class="sh-com">${s}</span>`;
      else if (m[2]) out += `<span class="sh-str">${s}</span>`;
      else if (m[3]) out += `<span class="sh-num">${s}</span>`;
      else if (m[4]) out += kw.test(m[4]) ? `<span class="sh-kw">${s}</span>` : `<span class="sh-fn">${s}</span>`;
      else out += kw.test(m[5]) ? `<span class="sh-kw">${s}</span>` : s;
    }
    return out + esc(line.slice(last));
  }
  /** title shows a filename header (chat artifacts); label is only the accessible name (trace output). */
  function codeBlock(code, { lang = 'ts', diff, errors = [], hlLines = [], label, title, ln = false, start = 1, wrap = false, dl = false } = {}) {
    const el = mk('div', 'rui-code group/code'); el.setAttribute('role', 'group'); el.setAttribute('aria-label', label || title || 'Code');
    if (ln) { el.dataset.ln = ''; el.style.setProperty('--start', String(start - 1)); }
    if (diff) el.dataset.diff = ''; if (wrap) el.dataset.wrap = '';
    const copyBtn = `<button type="button" class="rui-btn rui-copy" data-v="ghost" data-s="icon-xs" aria-label="Copy code">${I('copy')}</button>`;
    if (title != null) el.insertAdjacentHTML('beforeend', `<div class="rui-code-head font-mono"><span class="truncate">${esc(title)}</span><span class="flex items-center">${dl ? `<button type="button" class="rui-btn" data-v="ghost" data-s="icon-xs" aria-label="Download">${I('download')}</button>` : ''}${copyBtn}</span></div>`);
    else el.insertAdjacentHTML('beforeend', `<span class="absolute top-1.5 right-1.5 z-10 rounded-md bg-[var(--card)] opacity-0 transition-opacity group-hover/code:opacity-100 focus-within:opacity-100">${copyBtn}</span>`);
    const cb = el.querySelector('.rui-copy');
    cb.onclick = () => { clip(code); cb.innerHTML = I('check'); cb.onmouseleave = () => { cb.innerHTML = I('copy'); }; };
    const pre = mk('pre'); const c = mk('code'); pre.append(c); el.append(pre);
    el.lines = [];
    code.split('\n').forEach((ln_, i) => {
      const n = i + 1; const l = mk('span', 'rui-cl', hl(ln_, lang) || ' ');
      if (diff?.added?.includes(n)) l.dataset.diff = 'add'; if (diff?.removed?.includes(n)) l.dataset.diff = 'remove';
      if (errors.includes(n)) l.dataset.level = 'error'; if (hlLines.includes(n)) l.dataset.hl = '';
      c.append(l); el.lines.push(l);
    });
    return el;
  }
  /** Reveals a code block line by line (streamed artifact). */
  async function typeCode(cb, t, ms = 70) {
    if (REDUCE) return; cb.lines.forEach((l) => { l.style.opacity = '0'; });
    for (const l of cb.lines) { if (t.dead) return; l.style.transition = 'opacity .18s'; l.style.opacity = '1'; await t.sleep(ms); }
  }

  /* message-scroller: bounded card + viewport + jump-to-latest button */
  function scroller(parent, { title, desc, action, height = 420, maxw = 'max-w-2xl' } = {}) {
    const card = mk('div', `rui-card w-full ${maxw} gap-0 overflow-hidden py-0`); card.style.height = height + 'px';
    const head = mk('div', 'flex shrink-0 items-start gap-3 border-b border-border px-4 py-3.5');
    head.innerHTML = `<div class="grid min-w-0 flex-1 gap-1"><div class="truncate text-[15px] leading-snug font-medium">${title}</div>${desc != null ? `<div class="rui-desc flex min-w-0 items-center gap-2 text-sm text-muted-foreground">${desc}</div>` : ''}</div>`;
    if (action) head.append(action);
    const sc = mk('div', 'rui-scroller relative flex min-h-0 flex-1 flex-col overflow-hidden');
    const vp = mk('div', 'rui-vp'); vp.setAttribute('role', 'region'); vp.tabIndex = 0; vp.setAttribute('aria-label', title.replace(/<[^>]+>/g, ''));
    const content = mk('div', 'relative flex h-max min-h-full flex-col gap-5 p-4'); vp.append(content);
    const sb = mk('button', 'rui-sbtn', I('arrow-down', 'size-3.5') + '<span class="sr-only">Scroll to end</span>'); sb.type = 'button'; sb.dataset.active = 'false';
    sc.append(vp, sb); card.append(head, sc); parent.append(card);
    const o = { card, head, vp, content, sb, follow: true };
    o.atEnd = () => vp.scrollHeight - vp.scrollTop - vp.clientHeight < 8;
    o.sync = () => { sb.dataset.active = String(!o.atEnd()); };
    o.toEnd = (smooth = true) => { vp.scrollTo({ top: vp.scrollHeight, behavior: smooth && !REDUCE ? 'smooth' : 'auto' }); };
    o.to = (top, smooth = true) => vp.scrollTo({ top, behavior: smooth && !REDUCE ? 'smooth' : 'auto' });
    let lastTop = 0;
    vp.addEventListener('scroll', () => { if (vp.scrollTop < lastTop - 2) o.follow = false; if (o.atEnd()) o.follow = true; lastTop = vp.scrollTop; o.sync(); }, { passive: true });
    sb.onclick = () => { o.follow = true; o.toEnd(); };
    o.stick = () => { if (o.follow) vp.scrollTop = vp.scrollHeight; o.sync(); };
    return o;
  }
  /** One transcript turn as message-scroller rows render it (user: muted bubble + avatar, assistant: ghost + sparkles). */
  function turn(tn, { avatars = true, text = true } = {}) {
    const user = tn.role === 'user';
    const r = row(user ? 'end' : 'start'); r.dataset.id = tn.id || '';
    if (avatars) avSlot(r, user ? avatar(AV.viewer, 'JW', tn.author || 'Jonas Weber') : sparkAv() + `<span class="sr-only">${tn.author || 'Nimbus'}</span>`, 'size-8');
    const b = bubble(user ? 'muted' : 'ghost', '', user ? 'end' : 'start'); b.c.classList.add('space-y-2'); r.content.append(b); r.b = b;
    if (text) tn.text.split('\n\n').forEach((p) => b.c.append(mk('p', 'whitespace-pre-wrap', esc(p))));
    return r;
  }

  const demos = [];

  /* ======================================================== c-message-* */
  const G = 'Research';
  const dotSep = '<span aria-hidden="true" class="size-1 shrink-0 rounded-full bg-muted-foreground/40"></span>';
  const michaelAv = (r) => { const a = avSlot(r, avatar(AV.michael, 'MR', 'Michael Rodriguez', '<span class="rui-av-badge bg-green-500"><span class="sr-only">Online</span></span>')); a.style.overflow = 'visible'; return a; };

  demos.push({ group: G, title: 'Two-Sided Conversation', kind: 'lib',
    desc: 'Incoming and outgoing turns differ only by align and bubble variant; the incoming side types in behind a dot bubble before its words stream.',
    async run(root, t) {
      const s = stage(root, 'min-h-[400px]', 'max-w-sm gap-6');
      const turns = [['start', 'muted', 'Staging is green on 4.2. Want me to promote it?'], ['end', 'default', 'Hold it. The billing migration has to go out in the same release.'], ['start', 'muted', 'Understood. The migration lands after the 2pm review.'], ['end', 'default', 'Then I will cut the tag straight after.']];
      await sleep(t, 300);
      for (const [al, v, text] of turns) {
        const r = row(al); const b = bubble(v); r.content.append(b); add(s.w, r);
        if (al === 'start') await typeIn(b, text, t, 900); else b.c.textContent = text;
        await sleep(t, al === 'start' ? 700 : 1000);
      }
    } });

  demos.push({ group: G, title: 'Avatars and Presence', kind: 'lib',
    desc: 'MessageAvatar anchors to the bottom of each turn, so the portrait rides down while a long reply wraps; the online badge keeps its own sr-only label.',
    async run(root, t) {
      const s = stage(root, 'min-h-[440px]', 'max-w-sm gap-6');
      const turns = [['m', 'eu-west checkout is timing out. It started around 14:05.'], ['s', 'Looking now. Is it every request or one route?'], ['m', 'Only POST /api/checkout/confirm. p95 went from 240ms to 3.1s and the error rate is sitting at 4.2 percent. Every other route in the region is flat.'], ['s', 'Pulling the traces for that window now.']];
      await sleep(t, 300);
      for (const [who, text] of turns) {
        const r = row(who === 'm' ? 'start' : 'end');
        if (who === 'm') michaelAv(r); else avSlot(r, avatar(AV.sarah, 'SC', 'Sarah Chen'));
        const b = bubble(who === 'm' ? 'muted' : 'default'); r.content.append(b); add(s.w, r);
        if (who === 'm') await typeIn(b, text, t, 800, 30); else b.c.textContent = text;
        await sleep(t, 800);
      }
    } });

  demos.push({ group: G, title: 'Header and Footer Metadata', kind: 'lib',
    desc: 'MessageHeader stays where the content starts while MessageFooter follows the row to its end: a read receipt lands, then an edit re-stamps the reply.',
    async run(root, t) {
      const s = stage(root, 'min-h-[420px]', 'max-w-sm gap-7');
      const head = (time) => mk('div', 'rui-msg-head gap-1.5', `Emma Wilson${dotSep}<span class="tabular-nums">${time}</span>`);
      await sleep(t, 300);
      const r1 = row(); const b1 = bubble('muted'); r1.content.append(head('09:38'), b1); add(s.w, r1);
      await typeIn(b1, 'The invoice template is missing the VAT line on EU orders.', t, 800);
      await sleep(t, 700);
      const r2 = row('end'); const b2 = bubble('default', 'Fixed on the 4.2 branch. It ships with tonight&apos;s release.'); const f2 = mk('div', 'rui-msg-foot', 'Delivered');
      r2.content.append(b2, f2); add(s.w, r2);
      await sleep(t, 1200); f2.textContent = 'Read 09:41'; appear(f2, 3);
      await sleep(t, 800);
      const r3 = row(); const b3 = bubble('muted'); r3.content.append(head('09:42'), b3); add(s.w, r3);
      await typeIn(b3, 'Then I will re-run the batch once it is out.', t, 800);
      await sleep(t, 1000);
      b3.c.textContent = ''; await stream(b3.c, 'Then I will re-run the January batch once it is out.', t, 18);
      const f3 = mk('div', 'rui-msg-foot gap-1.5', `<span>Edited</span>${dotSep}<span class="tabular-nums">09:44</span>`); r3.content.append(f3); appear(f3, 3);
    } });

  demos.push({ group: G, title: 'Reply Toolbar with Regenerate', kind: 'lib',
    desc: 'A ghost reply streams in, then its footer toolbar settles: copy flips to a check, Regenerate streams a visibly different draft and clears the rating.',
    async run(root, t) {
      const DRAFTS = [
        ['4.2 moves invoicing onto the new tax service, so EU orders now carry a VAT line on the PDF, the hosted receipt and the CSV export.', 'Two smaller changes ride along: the billing portal keeps the filters you left it on, and a failed payment retries twice before it is marked overdue.'],
        ['The headline in 4.2 is EU VAT. It is calculated per order rather than per account, and it shows up everywhere an amount does.', 'We also cleared a long-standing annoyance in the billing portal: filters survive a reload, and overdue is only set after two failed retries.'],
      ];
      const s = stage(root, 'min-h-[420px]', 'max-w-xl gap-6');
      let draft = 0; let vote = null;
      const u = row('end'); u.content.append(bubble('muted', 'Summarise what changed in 4.2 for the customer note.')); add(s.w, u);
      await sleep(t, 500);
      const r = row(); const b = bubble('ghost'); b.setAttribute('aria-live', 'polite'); const box = mk('div', 'space-y-3'); b.c.append(box);
      const foot = mk('div', 'rui-msg-foot gap-0.5'); foot.style.visibility = 'hidden';
      const copy = btn('', 'ghost', 'icon-xs', 'copy'); copy.setAttribute('aria-label', 'Copy reply'); copy.title = 'Copy';
      const regen = btn('', 'ghost', 'icon-xs', 'refresh-cw'); regen.setAttribute('aria-label', 'Regenerate reply'); regen.title = 'Regenerate';
      const up = btn('', 'ghost', 'icon-xs', 'thumbs-up'); up.setAttribute('aria-label', 'Good reply');
      const down = btn('', 'ghost', 'icon-xs', 'thumbs-down'); down.setAttribute('aria-label', 'Bad reply');
      foot.append(mk('span', 'pe-1 tabular-nums', '09:41'), copy, regen, up, down);
      r.content.append(b, foot); add(s.w, r);
      const paint = () => { up.dataset.v = vote === 'up' ? 'secondary' : 'ghost'; down.dataset.v = vote === 'down' ? 'secondary' : 'ghost'; up.setAttribute('aria-pressed', String(vote === 'up')); down.setAttribute('aria-pressed', String(vote === 'down')); };
      up.onclick = () => { vote = vote === 'up' ? null : 'up'; paint(); }; down.onclick = () => { vote = vote === 'down' ? null : 'down'; paint(); };
      copy.onclick = () => { clip(DRAFTS[draft].join('\n\n')); copy.innerHTML = I('check'); copy.setAttribute('aria-label', 'Reply copied'); };
      const fill = (d) => { box.innerHTML = ''; d.forEach((p) => box.append(mk('p', '', esc(p)))); };
      regen.onclick = () => { draft = (draft + 1) % DRAFTS.length; vote = null; paint(); fill(DRAFTS[draft]); };
      paint();
      const play = async () => { box.innerHTML = ''; foot.style.visibility = 'hidden'; for (const p of DRAFTS[draft]) { const el = mk('p'); box.append(el); await stream(el, p, t, 20); } foot.style.visibility = ''; appear(foot, 3); };
      await play();
      await sleep(t, 1100); await press(copy, t); await sleep(t, 1500); copy.innerHTML = I('copy'); copy.setAttribute('aria-label', 'Copy reply');
      await sleep(t, 500); await press(regen, t, 260, false); draft = 1; vote = null; paint(); await play();
      await sleep(t, 900); await press(up, t);
    } });

  function attachment({ orientation = 'horizontal', state = 'done', media = '', title = '', desc = '', actions = '', style = '' } = {}) {
    const a = mk('div', 'rui-att'); a.dataset.orientation = orientation; a.dataset.state = state; if (style) a.style.cssText = style;
    a.innerHTML = `<div class="rui-att-media">${media}</div><div class="rui-att-content"><span class="rui-att-title">${title}</span><span class="rui-att-desc">${desc}</span></div>${actions ? `<div class="rui-att-actions">${actions}</div>` : ''}`;
    a.set = (q) => { if (q.state) a.dataset.state = q.state; if (q.desc != null) a.querySelector('.rui-att-desc').innerHTML = q.desc; if (q.media != null) a.querySelector('.rui-att-media').innerHTML = q.media; if (q.actions != null) { let x = a.querySelector('.rui-att-actions'); if (!x) { x = mk('div', 'rui-att-actions'); a.append(x); } x.innerHTML = q.actions; } };
    return a;
  }

  demos.push({ group: G, title: 'Attachments in a Thread', kind: 'lib',
    desc: 'Attachment is a first-class child of MessageContent: an image uploads and processes before its caption bubble, then the reply generates a CSV that settles with a download action.',
    async run(root, t) {
      const s = stage(root, 'min-h-[480px]', 'max-w-sm gap-6');
      const IMG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=448&h=448&q=80';
      await sleep(t, 300);
      const r1 = row('end'); avSlot(r1, avatar(AV.sarah, 'SC', 'Sarah Chen'));
      const img = `${I('image', 'size-6 text-muted-foreground')}<img src="${IMG}" alt="Gradient artwork for the release banner" width="448" height="448" referrerpolicy="no-referrer" onerror="this.remove()">`;
      const a1 = attachment({ orientation: 'vertical', state: 'uploading', title: 'hero-gradient.png', desc: 'Uploading 0%', media: img + `<span class="absolute inset-0 z-10 grid place-items-center">${spin('size-6')}</span>`, style: 'width:100%;max-width:14rem' });
      r1.content.append(a1); add(s.w, r1);
      for (let p = 0; p <= 100 && !t.dead; p += 9) { a1.set({ desc: `Uploading ${Math.min(p, 100)}%` }); await sleep(t, 110); }
      a1.set({ state: 'processing', desc: 'Processing' }); await sleep(t, 700);
      a1.set({ state: 'done', desc: 'PNG, 212 KB', media: img });
      const b1 = bubble('default', 'Here is the new release banner. Can you send the palette over?'); add(r1.content, b1);
      await sleep(t, 900);
      const r2 = row(); avSlot(r2, avatar(AV.michael, 'MR', 'Michael Rodriguez'));
      const b2 = bubble('muted'); r2.content.append(b2); add(s.w, r2);
      await typeIn(b2, 'Exported, one row per token.', t, 800);
      const a2 = attachment({ state: 'processing', title: 'palette-tokens.csv', desc: 'Generating CSV', media: spin('size-4') });
      add(r2.content, a2); await sleep(t, 1500);
      a2.set({ state: 'done', desc: 'CSV, 184 KB', media: I('file-spreadsheet'), actions: `<button type="button" class="rui-btn" data-v="secondary" data-s="icon-sm" aria-label="Download palette-tokens.csv" title="Download">${I('download')}</button>` });
    } });

  demos.push({ group: G, title: 'Grouped Run, One Portrait', kind: 'lib',
    desc: 'A run from one sender gets a single portrait on its last row: as each new turn lands, the avatar steps down while empty MessageAvatar slots hold the spine.',
    async run(root, t) {
      const s = stage(root, 'min-h-[420px]', 'max-w-sm gap-6');
      const g = mk('div', 'rui-msg-group'); s.w.append(g);
      const portrait = mk('div', 'contents', avatar(UNS('1535713875002-d1d0cf377fde'), 'AJ', 'Alex Johnson'));
      const texts = ['I pulled the eu-west traces for 14:00 to 14:10.', 'Every slow request goes through the tax service.', 'It is a retry loop, not the database. Two retries at 400ms each.'];
      await sleep(t, 300);
      for (let i = 0; i < texts.length; i++) {
        const r = row(); const slot = avSlot(r); const b = bubble('muted');
        if (i === 0) r.content.append(mk('div', 'rui-msg-head', 'Alex Johnson'));
        r.content.append(b); add(g, r); slot.append(portrait); appear(portrait.firstElementChild, 4, 200);
        await typeIn(b, texts[i], t, 700); await sleep(t, 500);
      }
      await sleep(t, 300);
      const e = row('end'); avSlot(e, avatar(AV.emma, 'EW', 'Emma Wilson')); e.content.append(bubble('default', 'That lines up with the 14:04 deploy. Rolling the tax client back.')); add(s.w, e);
    } });

  demos.push({ group: G, title: 'Streaming Reply with Replay', kind: 'lib',
    desc: 'A spinner Marker holds the ghost bubble while the trace is read, then the answer reveals four characters every 24ms behind a caret; Replay restarts it in place.',
    async run(root, t) {
      const ANSWER = 'The tax service began retrying every confirm call at 14:05, twice at 400ms each, so p95 on POST /api/checkout/confirm went from 240ms to 3.1s. The database was never the bottleneck: connection wait stayed under 5ms for the whole window. Rolling the tax client back to 1.8.3 at 14:41 returned p95 to 260ms within two minutes.';
      const s = stage(root, 'min-h-[420px]', 'max-w-xl gap-6');
      const u = row('end'); u.content.append(bubble('muted', 'Why did eu-west checkout latency spike at 14:05?')); add(s.w, u);
      const r = row(); const status = mk('span', 'sr-only'); status.setAttribute('role', 'status');
      const b = bubble('ghost'); const foot = mk('div', 'rui-msg-foot gap-2'); const replay = btn('Replay', 'ghost', 'xs');
      foot.append(mk('span', 'tabular-nums', '14:45'), replay); r.content.append(status, b, foot); add(s.w, r);
      let tok = 0;
      const play = async () => {
        const my = ++tok; b.setAttribute('aria-busy', 'true'); status.textContent = 'Generating reply';
        b.c.innerHTML = ''; b.c.append(marker(`<span class="rui-ti size-4 shrink-0">${spin()}</span><span class="min-w-0"><span class="${REDUCE ? '' : 'rui-pulse'}">Reading the 14:00 to 14:10 trace...</span></span>`));
        await t.sleep(REDUCE ? 200 : 900); if (my !== tok) return;
        const p = mk('p', 'whitespace-pre-wrap'); const txt = document.createTextNode(''); const caret = mk('span', 'rui-caret'); caret.setAttribute('aria-hidden', 'true');
        p.append(txt, caret); b.c.innerHTML = ''; b.c.append(p); status.textContent = '';
        if (REDUCE) txt.data = ANSWER;
        else for (let n = 4; n <= ANSWER.length + 3; n += 4) { if (my !== tok || t.dead) return; txt.data = ANSWER.slice(0, n); await t.sleep(24); }
        caret.remove(); b.setAttribute('aria-busy', 'false'); status.textContent = 'Reply ready';
      };
      replay.onclick = () => play();
      await sleep(t, 400); await play();
      await sleep(t, 1600); await press(replay, t, 240);
    } });

  /* ======================================================== c-skeleton */
  demos.push({ group: G, title: 'Chat Skeleton to Live Thread', kind: 'lib',
    desc: 'The chat-thread skeleton holds the card while history loads; turns resolve one by one and the pending reply keeps paragraph skeleton lines until its words stream in.',
    async run(root, t) {
      const s = stage(root, 'min-h-[460px]', 'max-w-xs');
      const card = mk('div', 'rui-card w-full'); const body = mk('div', 'flex flex-col gap-4 p-4'); card.append(body); s.w.append(card);
      const sk = (c) => `<div class="rui-skel ${c}"></div>`;
      const A = mk('div', 'flex items-start gap-2.5', `${sk('size-8 shrink-0 rounded-full')}<div class="flex flex-col gap-1">${sk('h-3 w-16')}${sk('h-16 w-48 rounded-lg rounded-tl-none')}${sk('h-2.5 w-12')}</div>`);
      const B = mk('div', 'flex items-start justify-end gap-2.5', `<div class="flex flex-col items-end gap-1">${sk('h-10 w-40 rounded-lg rounded-tr-none')}${sk('h-2.5 w-12')}</div>`);
      const C = mk('div', 'flex items-start gap-2.5', `${sk('size-8 shrink-0 rounded-full')}<div class="flex flex-col gap-1">${sk('h-3 w-20')}${sk('h-24 w-56 max-w-full rounded-lg rounded-tl-none')}${sk('h-2.5 w-12')}</div>`);
      const D = mk('div', 'flex items-center gap-2 pt-2', `${sk('h-9 flex-1 rounded-md')}${sk('h-9 w-9 rounded-md')}`);
      body.append(A, B, C, D);
      await sleep(t, 2300);
      const swap = (oldEl, html, cls) => { const n = mk('div', cls, html); oldEl.replaceWith(n); appear(n, 3, 220); return n; };
      const av = `<span class="grid size-8 shrink-0 place-items-center rounded-full bg-muted">${sparkAv()}</span>`;
      swap(A, `${av}<div class="flex min-w-0 flex-col gap-1"><span class="text-xs font-medium">Nimbus</span><div class="rounded-lg rounded-tl-none bg-muted px-3 py-2 text-sm leading-relaxed">The 4.2 tag is cut. Billing migration is queued behind it.</div><span class="text-[10px] text-muted-foreground tabular-nums">09:40</span></div>`, 'flex items-start gap-2.5');
      await sleep(t, 450);
      swap(B, `<div class="flex min-w-0 flex-col items-end gap-1"><div class="rounded-lg rounded-tr-none bg-[var(--primary)] px-3 py-2 text-sm leading-relaxed text-[var(--primary-foreground)]">What still blocks the release?</div><span class="text-[10px] text-muted-foreground tabular-nums">09:41</span></div>`, 'flex items-start justify-end gap-2.5');
      await sleep(t, 450);
      const c = swap(C, `${av}<div class="flex min-w-0 flex-1 flex-col gap-1"><span class="text-xs font-medium">Nimbus</span><div class="rui-ans rounded-lg rounded-tl-none bg-muted px-3 py-2.5 text-sm leading-relaxed"><div class="flex flex-col gap-2">${sk('h-3 w-full bg-foreground/10')}${sk('h-3 w-full bg-foreground/10')}${sk('h-3 w-3/4 bg-foreground/10')}</div></div><span class="rui-time text-[10px] text-muted-foreground tabular-nums">typing</span></div>`, 'flex items-start gap-2.5');
      swap(D, `<div class="rui-input h-9 flex-1"><input aria-label="Message" placeholder="Reply to Nimbus" class="h-9"></div><button type="button" class="rui-btn size-9" data-v="default" data-s="icon" aria-label="Send">${I('arrow-up')}</button>`, 'flex items-center gap-2 pt-2');
      await sleep(t, 1400);
      const ans = c.querySelector('.rui-ans'); ans.innerHTML = ''; const p = mk('p'); ans.append(p);
      await stream(p, 'Only the VAT line on EU invoices. The fix is merged, and the re-run of the January batch starts as soon as 4.2 is live.', t, 30);
      c.querySelector('.rui-time').textContent = '09:41';
    } });

  /* ======================================================== c-spinner */
  demos.push({ group: G, title: 'Spinner States', kind: 'lib',
    desc: 'Every inline Spinner pattern in one generating flow: a button that flips to Processing, status badges that resolve, connection rows, coloured spinners and bouncing dots.',
    async run(root, t) {
      const s = stage(root, 'min-h-[460px]', 'max-w-md gap-7 items-center');
      const btns = mk('div', 'flex flex-wrap items-center justify-center gap-3');
      const gen = btn('Generate reply', 'default', 'default', 'sparkles'); const ld = btn('Loading…', 'outline', 'default', spin()); ld.disabled = true;
      const ic = btn('', 'outline', 'icon', spin()); ic.disabled = true; ic.setAttribute('aria-label', 'Loading');
      btns.append(gen, ld, ic); add(s.w, btns);
      await sleep(t, 300);
      const BADGES = [['default', 'Updating', 'Updated'], ['secondary', 'Syncing', 'Synced'], ['outline', 'Loading', 'Loaded'], ['destructive-light', 'Updating', 'Update failed'], ['success-light', 'Syncing', 'Synced'], ['info-light', 'Loading', 'Loaded']];
      const grid = mk('div', 'grid grid-cols-2 gap-3 justify-items-center @sm:grid-cols-3'); add(s.w, grid);
      const bs = BADGES.map(([v, l]) => { const b = mk('span', 'rui-badge', `${spin('size-3')}${l}`); b.dataset.v = v; grid.append(b); return b; });
      await sleep(t, 300);
      const rows = mk('div', 'flex w-full max-w-xs flex-col gap-3'); add(s.w, rows);
      const ROWS = [['', 'Checking availability...', ''], ['text-[var(--success)]', 'Connected', ' — syncing data'], ['text-[var(--warning)]', 'Reconnecting', ' — attempt 3 of 5']];
      for (const [c, a, b] of ROWS) {
        const r = mk('div', 'flex items-center gap-2', `${spin('size-3.5 ' + c)}<span class="text-sm">${b ? `<span class="font-medium ${c}">${a}</span><span class="text-muted-foreground">${b}</span>` : `<span class="text-muted-foreground">${a}</span>`}</span>`);
        add(rows, r); await sleep(t, 260);
      }
      const foot = mk('div', 'flex flex-wrap items-center justify-center gap-6');
      foot.innerHTML = `<span class="flex items-center gap-4">${['text-blue-500', 'text-green-500', 'text-red-500', 'text-yellow-500', 'text-purple-500'].map((c) => spin('size-4 ' + c)).join('')}</span><span class="flex items-center gap-1.5">${[-0.3, -0.15, 0].map((d) => `<span class="size-2 rounded-full bg-[var(--primary)] ${REDUCE ? '' : 'rui-bounce'}" style="animation-delay:${d}s"></span>`).join('')}</span>${spin()}`;
      add(s.w, foot);
      await sleep(t, 900);
      gen.onclick = async () => { gen.innerHTML = `${spin()}<span>Processing…</span>`; gen.disabled = true; };
      await press(gen, t);
      await sleep(t, 2200);
      for (let i = 0; i < bs.length; i++) { const [, , done] = BADGES[i]; bs[i].innerHTML = `${I(i === 3 ? 'circle-alert' : 'check')}${done}`; appear(bs[i], 2, 200); await sleep(t, 160); }
      rows.children[0].innerHTML = `${I('check', 'size-3.5 text-[var(--success)]')}<span class="text-sm text-muted-foreground">Available</span>`;
      gen.disabled = false; gen.innerHTML = `${I('check')}<span>Reply ready</span>`;
    } });

  demos.push({ group: G, title: 'Loading Overlays', kind: 'lib',
    desc: 'Workspace setup holds a centred spinner card, then a search field spins in its addon while a blurred overlay refreshes the stats card underneath. c-spinner-5 (Empty loading) is merged here.',
    async run(root, t) {
      const s = stage(root, 'min-h-[440px]', 'max-w-xs gap-4');
      const setup = mk('div', 'rui-card min-h-[200px] w-full items-center justify-center gap-4 p-6');
      setup.innerHTML = `${spin('size-4 opacity-50')}<div class="flex flex-col items-center gap-1 text-center"><p class="text-sm font-medium">Setting up your workspace</p><p class="text-xs text-muted-foreground">This may take a few seconds...</p></div>`;
      add(s.w, setup); await sleep(t, 2200);
      setup.remove();
      const field = mk('div', 'flex w-full flex-col gap-2'); field.innerHTML = `<label class="text-sm font-medium" for="rui-search-loading">Searching</label>`;
      const ig = mk('div', 'rui-input h-8'); const inp = mk('input'); inp.id = 'rui-search-loading'; inp.placeholder = 'Search records…';
      const addon = mk('span', 'flex shrink-0 items-center pe-2.5 text-muted-foreground', I('search')); ig.append(inp, addon); field.append(ig); add(s.w, field);
      const card = mk('div', 'rui-card relative w-full max-w-xs overflow-hidden');
      card.innerHTML = `<div class="space-y-3 p-4"><h3 class="text-sm font-semibold">Dashboard Overview</h3><p class="text-sm text-muted-foreground">Monthly revenue and user statistics for the current period.</p><div class="grid grid-cols-2 gap-4"><div class="rounded-md border border-border p-3"><p class="text-xs text-muted-foreground">Revenue</p><p class="rui-rev text-lg font-bold tabular-nums">$12,450</p></div><div class="rounded-md border border-border p-3"><p class="text-xs text-muted-foreground">Users</p><p class="rui-users text-lg font-bold tabular-nums">1,234</p></div></div></div>`;
      const ov = mk('div', 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[4px] transition-opacity duration-300', `${spin('size-5 opacity-60')}<span class="text-sm text-muted-foreground">Refreshing data...</span>`);
      ov.style.opacity = '0'; card.append(ov); add(s.w, card);
      await sleep(t, 600);
      ig.classList.add('is-focus');
      for (const ch of 'eu-west') { inp.value += ch; await sleep(t, 90); }
      addon.innerHTML = spin('size-4'); ov.style.opacity = '1';
      await sleep(t, 1800);
      ov.style.opacity = '0'; addon.innerHTML = I('check', 'size-4 text-[var(--success)]'); ig.classList.remove('is-focus');
      const rev = card.querySelector('.rui-rev'), us = card.querySelector('.rui-users');
      for (let i = 1; i <= 12 && !t.dead; i++) { rev.textContent = '$' + Math.round(12450 + (13920 - 12450) * i / 12).toLocaleString('en-US'); us.textContent = Math.round(1234 + 84 * i / 12).toLocaleString('en-US'); await sleep(t, 40); }
    } });

  /* ================================================= c-message-scroller-* */
  const T = (prefix, list) => list.map(([r, text], i) => ({ id: `${prefix}_${i + 1}`, role: r === 'u' ? 'user' : 'assistant', text }));
  /** Streams paragraphs into a bubble while the scroller follows the live edge (autoScroll). */
  async function streamFollow(sc, box, text, t, ms = 20, after) {
    for (const para of text.split('\n\n')) {
      const p = mk('p', 'whitespace-pre-wrap'); box.append(p);
      if (after) box.append(after);
      if (REDUCE) { p.textContent = para; sc.stick(); continue; }
      for (const w of words(para)) { p.append(document.createTextNode(w)); if (w.trim()) { sc.stick(); await t.sleep(ms * rnd(0.6, 1.4)); } if (t.dead) return; }
    }
  }
  const scStage = (root, h = 'min-h-[500px]') => stage(root, h, 'max-w-2xl items-center');

  const WEBHOOK = T('th_9f2k4m', [
    ['u', 'Our Stripe webhook is returning 500 on charge.refunded. It started at 09:42 and 41 events are queued behind it.'],
    ['a', 'The handler throws before it acknowledges, so Stripe keeps redelivering the same event.\n\nEvery retry lands on the same code path, which is why the queue grows instead of draining. No other event type on that endpoint is affected.'],
    ['u', 'What is actually throwing?'],
    ['a', 'The refund branch reads charge.payment_intent, and that field is null for refunds created in the dashboard.\n\nThe null reaches the lookup helper, which throws before the 200 goes out. Card refunds carry the intent, dashboard refunds do not, so it only fires for a subset.'],
    ['u', 'Can we drain the queue without shipping anything?'],
    ['a', 'Not safely. The queued events replay the same branch, so they would fail again and burn the retries you have left.\n\nShip the guard first, then replay. Stripe keeps failed events for three days, so the 41 are not at risk yet.'],
    ['u', 'Give me the smallest patch that unblocks it.'],
    ['a', 'Return 200 as soon as the signature verifies, then do the refund work on a queue. A webhook acknowledges receipt, not success.\n\nWith that in place a null payment_intent becomes a job that fails and retries on your side, instead of a 500 Stripe has to redeliver.'],
    ['a', 'I drafted the change on a branch and left the replay script beside it. Want me to open the pull request?'],
  ]);
  demos.push({ group: G, title: 'Transcript with Jump to Latest', kind: 'lib',
    desc: 'The card owns the height and the transcript overflows inside it; the jump-to-latest button slides up while you are away from the end, and the newest reply streams once you are back.',
    async run(root, t) {
      const s = scStage(root);
      const sc = scroller(s.w, { title: 'Stripe webhook 500s on charge.refunded', desc: 'th_9f2k4m, 9 messages', height: 430 });
      WEBHOOK.slice(0, 8).forEach((tn) => sc.content.append(turn(tn)));
      sc.vp.scrollTop = 0; sc.follow = false; await t.sleep(30); sc.sync();
      await sleep(t, 1200); sc.to(240); await sleep(t, 1500);
      sc.sb.style.background = 'var(--muted)'; await sleep(t, 220); sc.sb.style.background = ''; sc.sb.click();
      await sleep(t, 900);
      const r = turn(WEBHOOK[8], { text: false }); add(sc.content, r); sc.stick();
      await sleep(t, 300); await streamFollow(sc, r.b.c, WEBHOOK[8].text, t, 46);
    } });

  demos.push({ group: G, title: 'Live Run with Auto-Scroll', kind: 'lib',
    desc: 'autoScroll follows the reply only while you sit at the live edge: four characters land every 28ms behind a small spinner, and the header badge moves from Working to Answered.',
    async run(root, t) {
      const SETTLED = T('th_7c1x8p', [
        ['u', 'I want to reproduce the refund 500 locally before we patch anything.'],
        ['a', 'Point the Stripe CLI at your local endpoint and trigger charge.refunded.\n\nA dashboard style refund arrives with no payment_intent, which is the exact shape production is failing on.'],
        ['u', 'The CLI payload has a payment_intent on it though.'],
        ['a', 'That is the default fixture. Override the field to null and the handler takes the branch you care about.\n\nThe rest of the fixture can stay as it is, the failing helper reads that one field and nothing else.'],
        ['u', 'Reproduced it, the 500 is right there in the log.'],
        ['a', 'That log line is the lookup helper throwing, three frames above the response.'],
        ['u', 'So what does the smallest safe fix look like?'],
      ]);
      const REPLY = 'Move the acknowledgement above the work. Verify the signature, return 200, then hand the event to a queue.\n\nAfter that a null payment_intent is a job that retries on your own backoff, and Stripe sees a healthy endpoint the whole time. It also means one slow refund lookup can no longer time the webhook out.';
      const s = scStage(root, 'min-h-[520px]');
      const bd = mk('span', 'shrink-0'); const sc = scroller(s.w, { title: 'Reproduce webhook failure', action: bd, height: 450 });
      SETTLED.forEach((tn) => sc.content.append(turn(tn)));
      const r = turn({ id: 'reply', role: 'assistant', text: '' }, { text: false }); sc.content.append(r);
      const status = mk('p', 'sr-only'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); sc.card.append(status);
      const foot = mk('div', 'flex shrink-0 items-center border-t border-border px-4 py-3'); const replay = btn('Replay stream', 'outline', 'sm'); foot.append(replay); sc.card.append(foot);
      let tok = 0;
      const play = async () => {
        const my = ++tok; bd.innerHTML = badge('Working', 'primary-light'); status.textContent = 'Nimbus is replying'; sc.content.setAttribute('aria-busy', 'true');
        sc.follow = true; sc.vp.scrollTop = sc.vp.scrollHeight; sc.sync();
        const sp = mk('span', 'inline-flex', spin('size-3')); sp.firstElementChild.setAttribute('aria-hidden', 'true');
        let len = 0; const paint = () => { r.b.c.innerHTML = ''; REPLY.slice(0, len).split('\n\n').forEach((p) => r.b.c.append(mk('p', 'whitespace-pre-wrap', esc(p)))); if (len < REPLY.length) r.b.c.append(sp); sc.stick(); };
        paint(); await sleep(t, 700); if (my !== tok) return;
        if (REDUCE) len = REPLY.length;
        while (len < REPLY.length) { if (my !== tok || t.dead) return; len = Math.min(REPLY.length, len + 4); paint(); await t.sleep(28); }
        paint(); bd.innerHTML = badge('Answered', 'success-light'); status.textContent = 'Reply complete'; sc.content.setAttribute('aria-busy', 'false');
      };
      replay.onclick = () => play();
      await sleep(t, 300); await play();
      await sleep(t, 1400); await press(replay, t, 220, false); const again = play(); await sleep(t, 900);
      sc.follow = false; sc.to(Math.max(0, sc.vp.scrollTop - 260)); await again; await sleep(t, 700);
      sc.sb.style.background = 'var(--muted)'; await sleep(t, 220); sc.sb.style.background = ''; sc.sb.click();
    } });

  demos.push({ group: G, title: 'Anchored Turns with a Composer', kind: 'lib',
    desc: 'Each sent question becomes a scroll anchor: it moves to the top of the frame with a 64px peek of the turn before, and the answer streams into the room below it.',
    async run(root, t) {
      const SEEDED = T('th_4b8t2v', [
        ['u', 'Draft the release notes for 3.4 from the merged pull requests.'],
        ['a', 'Here is a first pass, grouped the way the changelog already reads.\n\nTwo entries need a decision from you. The webhook acknowledgement change is breaking for anyone parsing the 500, and the export worker change moves a default.'],
        ['u', 'Keep the breaking one at the top.'],
        ['a', 'Moved. Breaking changes lead, then features, then fixes.\n\nI also pulled the migration note out of the fix list, because the people who skip that section are the ones who need it.'],
        ['a', 'The draft is in the shared doc. Ask for any section and I will rewrite it in place.'],
      ]);
      const REPLIES = [
        'Pulled that into the draft. It sits under Breaking changes with the upgrade note directly beneath it.\n\nI kept the wording to a single line, since the detail belongs on the docs page the entry links to.',
        'That one needs a decision rather than an edit. The change sits behind a flag, so it reads as a feature for anyone who opts in and as nothing at all for everyone else.\n\nTell me which framing you want and I will write it both ways.',
      ];
      const ASKS = ['Add the webhook ack change with an upgrade note.', 'Is the export worker default breaking?'];
      const s = scStage(root, 'min-h-[540px]');
      const sc = scroller(s.w, { title: 'Q3 release notes draft', desc: 'Anchored turns, 64px peek', height: 470 });
      const spacer = mk('div', 'shrink-0'); spacer.style.marginTop = '-1.25rem';
      SEEDED.forEach((tn) => sc.content.append(turn(tn))); sc.content.append(spacer);
      const foot = mk('div', 'flex shrink-0 items-center border-t border-border px-4 py-3');
      const ig = mk('div', 'rui-input h-9 w-full pe-1'); const inp = mk('input'); inp.setAttribute('aria-label', 'Message Nimbus'); inp.placeholder = 'Ask about the 3.4 release notes';
      const send = btn('', 'default', 'icon-sm', 'arrow-up'); send.setAttribute('aria-label', 'Send'); send.disabled = true;
      ig.append(inp, send); foot.append(ig); sc.card.append(foot);
      await t.sleep(30); sc.vp.scrollTop = sc.vp.scrollHeight; sc.sync();
      let round = 0; let anchor = null;
      const fit = () => { if (!anchor) return; const top = anchor.offsetTop - 64; spacer.style.height = Math.max(0, top + sc.vp.clientHeight - spacer.offsetTop - 16) + 'px'; };
      inp.oninput = () => { send.disabled = !inp.value.trim(); };
      const submit = async () => {
        const q = inp.value.trim(); if (!q) return; const my = round++; inp.value = ''; send.disabled = true;
        const u = turn({ role: 'user', text: q }); sc.content.insertBefore(u, spacer); appear(u); anchor = u; fit();
        sc.follow = false; sc.to(u.offsetTop - 64);
        await sleep(t, 900);
        const a = turn({ role: 'assistant', text: '' }, { text: false }); sc.content.insertBefore(a, spacer); appear(a);
        for (const para of REPLIES[my % REPLIES.length].split('\n\n')) {
          const p = mk('p', 'whitespace-pre-wrap'); a.b.c.append(p);
          if (REDUCE) { p.textContent = para; fit(); continue; }
          for (const w of words(para)) { p.append(document.createTextNode(w)); if (w.trim()) { fit(); await t.sleep(rnd(14, 34)); } if (t.dead) return; }
        }
        fit(); sc.sync();
      };
      send.onclick = submit; inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } };
      for (const ask of ASKS) {
        await sleep(t, 1000); ig.classList.add('is-focus');
        for (const ch of ask) { inp.value += ch; inp.oninput(); await sleep(t, 28); }
        await sleep(t, 250); ig.classList.remove('is-focus'); await press(send, t, 200, false); await submit();
      }
    } });

  demos.push({ group: G, title: 'Default Scroll Position', kind: 'lib',
    desc: 'A saved thread hydrates row by row, then reopens wherever defaultScrollPosition says: on the last question (last-anchor), at the very start, or at the end of the long answer.',
    async run(root, t) {
      const TURNS = T('th_2m6r7d', [
        ['u', 'Churn is up for the second month running. Where is it concentrated?'],
        ['a', 'Almost all of it is on the starter tier, and almost all of that is inside the first 30 days.\n\nGrowth and scale are flat within noise, so nothing here points at a pricing problem on the paid tiers.'],
        ['u', 'Is it the same accounts every month?'],
        ['a', 'No. The starter cohort turns over completely, which makes this a first month experience problem rather than a slow leak.\n\nAccounts that survive month one behave like every other cohort we have measured.'],
        ['u', 'What do the ones who leave do before they go?'],
        ['a', 'They create a workspace, import once, and never invite anyone.\n\nA second seat is the strongest single predictor we have. Accounts that add one in the first week churn at about a third of the rate.'],
        ['u', 'Give me the full breakdown so I can take it into the pricing review.'],
        ['a', 'Starter is 84 percent of cancellations and 11 percent of revenue, so the revenue impact is much smaller than the count suggests. Median tenure before cancelling is 19 days.\n\nGrowth is 9 percent of cancellations and 38 percent of revenue, with a median tenure over 11 months, and most of those are consolidations onto one annual plan rather than losses. Scale is the remaining 7 percent, all contract driven and all known in advance.\n\nThe recommendation is to stop reading this as one number. Starter churn is an activation problem and belongs to onboarding, growth churn is a plan shape problem, and scale churn is a renewal conversation that already has an owner.'],
      ]);
      const s = scStage(root, 'min-h-[540px]');
      const sc = scroller(s.w, { title: 'Churn by plan tier', desc: 'Reopened 3 days later', height: 470 });
      const foot = mk('div', 'flex shrink-0 items-center border-t border-border px-4 py-3'); const tabs = mk('div', 'rui-tabs'); tabs.setAttribute('role', 'tablist'); foot.append(tabs); sc.card.append(foot);
      const POS = ['start', 'end', 'last-anchor']; let pos = 'last-anchor';
      const tb = POS.map((p) => { const b = mk('button', 'rui-tab', p); b.type = 'button'; b.setAttribute('role', 'tab'); b.onclick = () => openAt(p); tabs.append(b); return b; });
      const paintTabs = () => tb.forEach((b, i) => b.setAttribute('aria-selected', String(POS[i] === pos)));
      const openAt = (p) => {
        pos = p; paintTabs(); const vp = sc.vp; const last = [...sc.content.querySelectorAll('.rui-msg[data-align=end]')].pop();
        vp.scrollTop = p === 'start' ? 0 : p === 'end' || !last ? vp.scrollHeight : last.offsetTop - 16; sc.sync();
        if (!REDUCE) { vp.style.transition = 'none'; vp.style.opacity = '0'; vp.style.transform = 'translateY(4px)'; tick(() => { vp.style.transition = `opacity .25s ${EO}, transform .25s ${EO}`; vp.style.opacity = '1'; vp.style.transform = 'none'; }); }
      };
      paintTabs();
      const day = marker('<span class="min-w-0 flex-none text-center">Tuesday</span>', 'separator'); add(sc.content, day);
      for (const tn of TURNS) { add(sc.content, turn(tn), 4); sc.vp.scrollTop = sc.vp.scrollHeight; await sleep(t, 110); }
      openAt('last-anchor');
      for (const p of ['start', 'end', 'last-anchor']) { await sleep(t, 2200); await press(tb[POS.indexOf(p)], t, 200, false); openAt(p); }
    } });

  demos.push({ group: G, title: 'Load Earlier, Keep Your Place', kind: 'lib',
    desc: 'Load earlier prepends five rows after a spinner beat and the row under the reader stays put; the header chip reports whether earlier messages sit above.',
    async run(root, t) {
      const HISTORY = T('th_5p3w9k', [
        ['u', 'Pulling up ticket 4821. The customer says their exports have been empty since Friday.'], ['a', 'Empty, not failing. Every job in that window finished with a zero row result.'],
        ['u', 'Same workspace every time?'], ['a', 'One workspace, ws_3311. No other account shows the pattern.'],
        ['u', 'What changed for them on Friday?'], ['a', 'They moved their default view onto a saved filter whose date range ends last Thursday.'],
        ['u', 'So the export is right and the filter is wrong.'], ['a', 'Right for the filter, yes. The export inherits the active view, and that view now excludes everything recent.'],
        ['u', 'Does the interface show them that range anywhere?'], ['a', 'Only inside the filter chip, which is collapsed by default at their screen width.'],
        ['u', 'That is the actual bug then.'], ['a', 'It is at least why nobody caught it. The export dialog does show a row count, but it renders after the request, so a zero reads as loading.'],
        ['u', 'Can we tell them what to change today?'], ['a', 'Clear the saved range on the view, or export from the unfiltered table. Either one gives them Friday onward straight away.'],
        ['u', 'Send that, then flag the dialog for the product review.'], ['a', 'Sent, and the dialog is on the review list with a screenshot attached.\n\nI left a note on the ticket too, so the next person reads the filter before they open the worker logs.'],
      ]);
      const s = scStage(root, 'min-h-[520px]');
      const load = btn('Load earlier', 'outline', 'sm');
      const sc = scroller(s.w, { title: 'Support escalation', desc: '<span class="rui-chip"></span><span class="rui-count"></span>', action: load, height: 440 });
      const chip = sc.head.querySelector('.rui-chip'), count = sc.head.querySelector('.rui-count');
      let visible = 6; let loading = false;
      const paint = () => { chip.innerHTML = badge(sc.vp.scrollTop > 4 ? 'Earlier messages above' : 'Top of thread', 'info-light'); count.textContent = `${visible} of ${HISTORY.length} messages`; const all = visible >= HISTORY.length; load.disabled = loading || all; load.innerHTML = (loading ? spin('size-3') : '') + `<span>${all ? 'All loaded' : 'Load earlier'}</span>`; };
      HISTORY.slice(-visible).forEach((tn) => sc.content.append(turn(tn)));
      sc.content.append(marker('<span class="min-w-0 flex-none text-center">Escalated to Sam Okafor</span>', 'separator'));
      sc.vp.addEventListener('scroll', paint, { passive: true });
      await t.sleep(30); sc.vp.scrollTop = sc.vp.scrollHeight; paint();
      load.onclick = async () => {
        if (loading || visible >= HISTORY.length) return; loading = true; paint(); await sleep(t, 700); if (t.dead) return;
        const next = Math.min(visible + 5, HISTORY.length); const rows = HISTORY.slice(-next, HISTORY.length - visible).map((tn) => turn(tn));
        const vp = sc.vp; const prevH = vp.scrollHeight, prevTop = vp.scrollTop;
        rows.reverse().forEach((r) => sc.content.prepend(r)); vp.scrollTop = prevTop + (vp.scrollHeight - prevH);
        rows.forEach((r) => appear(r, 0, 300)); visible = next; loading = false; paint();
      };
      for (let i = 0; i < 2; i++) {
        await sleep(t, 1300); sc.to(0); await sleep(t, 1000);
        await press(load, t, 220); await sleep(t, 1000);
      }
      await sleep(t, 600); sc.to(0);
    } });

  demos.push({ group: G, title: 'Turn Navigator', kind: 'lib',
    desc: 'Only questions carry a scroll anchor, so the footer can name the turn you are reading and jump question to question with scrollToMessage and a 12px margin.',
    async run(root, t) {
      const TURNS = [['q1', 'u', 'Walk me through the export incident from Friday.'], ['2', 'a', 'It ran from 09:42 to 11:06. One workspace saw empty exports and nobody saw an error.\n\nThe trigger was a saved view whose date range excluded everything recent, and an export inherits the active view.'], ['3', 'a', 'No data was lost, and no other workspace was affected.'],
        ['q2', 'u', 'Why did it take 84 minutes to find?'], ['5', 'a', 'Because every signal read healthy. The jobs completed, the queue drained, and the error rate never moved.\n\nWe found it when support tied the ticket to the view change, not from an alert.'],
        ['q3', 'u', 'What would have caught it sooner?'], ['7', 'a', 'A zero row export from a workspace that exported thousands the day before. That is the signal we do not have yet.\n\nIt is cheap to add, because the job already records the row count it wrote.'], ['8', 'a', 'I drafted the threshold as a ratio rather than an absolute, so a genuinely small workspace never pages anyone.'],
        ['q4', 'u', 'Is the dialog change still the right fix?'], ['10', 'a', 'Yes, and it stands on its own next to the alert. The dialog renders its row count after the request, so a zero currently reads as loading.\n\nShowing the active filter with a settled count turns a silent wrong answer into an obvious one.'],
        ['q5', 'u', 'Write it up for the review on Thursday.'], ['12', 'a', 'Written. Timeline, contributing factors, and the two actions with owners and dates.\n\nI kept the blameless framing and moved the raw timeline into an appendix, so the meeting can stay on the actions.'],
      ].map(([id, r, text]) => ({ id: 'th_8n4d7s_' + id, role: r === 'u' ? 'user' : 'assistant', text }));
      const s = scStage(root, 'min-h-[520px]');
      const sc = scroller(s.w, { title: 'Export incident review', desc: '5 questions, 12 messages', height: 450 });
      const rows = TURNS.map((tn) => { const r = turn(tn); sc.content.append(r); return r; });
      const qs = rows.filter((r, i) => TURNS[i].role === 'user'); const QT = TURNS.filter((x) => x.role === 'user');
      const foot = mk('div', 'flex shrink-0 items-center border-t border-border px-3 py-2.5'); const nav = mk('div', 'flex w-full min-w-0 items-center gap-2');
      const prev = btn('', 'ghost', 'icon-sm', 'chevron-up'); prev.setAttribute('aria-label', 'Previous turn'); const next = btn('', 'ghost', 'icon-sm', 'chevron-down'); next.setAttribute('aria-label', 'Next turn');
      const label = mk('span', 'min-w-0 flex-1 truncate text-center text-sm text-muted-foreground'); nav.append(prev, label, next); foot.append(nav); sc.card.append(foot);
      let idx = 0;
      const current = () => { const y = sc.vp.scrollTop + 12 + 4; let k = 0; qs.forEach((q, i) => { if (q.offsetTop <= y) k = i; }); if (sc.atEnd()) { qs.forEach((q, i) => { if (q.offsetTop < sc.vp.scrollTop + sc.vp.clientHeight / 2) k = Math.max(k, i); }); } return k; };
      const paint = () => { idx = current(); label.innerHTML = `<span class="font-medium text-foreground">Turn ${idx + 1} of ${qs.length}</span> ${esc(QT[idx].text)}`; prev.disabled = idx <= 0; next.disabled = idx >= qs.length - 1; };
      const goTo = (i) => { const q = qs[i]; if (q) sc.to(q.offsetTop - 12); };
      prev.onclick = () => goTo(idx - 1); next.onclick = () => goTo(idx + 1);
      sc.vp.addEventListener('scroll', paint, { passive: true });
      await t.sleep(30); sc.vp.scrollTop = sc.vp.scrollHeight; paint();
      for (const b of [prev, prev, prev, prev, next, next]) { await sleep(t, 1250); await press(b, t, 200); }
    } });

  /* ============================================================ c-trace-* */
  const trStage = (root, h = 'min-h-[440px]', w = 'max-w-md') => stage(root, h, `${w} gap-4 text-sm`);
  const statusP = (text = '', cls = '') => { const p = mk('p', 'min-w-0 text-xs text-muted-foreground outline-none ' + cls, text); p.setAttribute('role', 'status'); p.tabIndex = -1; return p; };
  const ctl = (...kids) => { const d = mk('div', 'flex flex-wrap items-center gap-3'); d.append(...kids); return d; };
  const table = (head, rows, fixed = '') => `<div class="rui-card overflow-hidden p-0"><table class="w-full text-sm ${fixed}"><thead><tr class="border-b border-border">${head.map(([h, c = '']) => `<th class="h-8 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground ${c}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr class="border-b border-border last:border-0">${r.map((c, i) => `<td class="px-2 py-1.5 align-middle ${head[i][1] || ''} ${head[i][2] || ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const glyphRun = () => spin('size-4');

  demos.push({ group: G, title: 'Coding Run Trace', kind: 'lib',
    desc: 'A coding agent works through search, edit, test and lint: each TraceLine shimmers while running, edits open to their diff, the failing lint turns destructive and the fix starts.',
    async run(root, t) {
      const PATCH = 'export const csp = {\n  frameSrc: ["\'self\'"],\n  frameSrc: ["\'self\'", "*.stripe.com"],\n  connectSrc: ["\'self\'", "*.stripe.com"],\n}';
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const l1 = TL({ icon: 'search', title: 'Searching the codebase for frameSrc', status: 'running' }); add(tr, l1);
      await sleep(t, 1300); l1.set({ title: 'Searched the codebase for frameSrc', desc: '3 results', status: null });
      const e = coll(TL({ icon: 'pencil', title: 'Editing middleware/csp.ts', status: 'running' })); add(tr, e.el);
      const cb = codeBlock(PATCH, { lang: 'ts', diff: { added: [3, 4], removed: [2] }, label: 'Patch for middleware/csp.ts' }); e.body.append(cb);
      await sleep(t, 300); e.set(true); await typeCode(cb, t, 160);
      await sleep(t, 300); e.line.set({ title: 'Edited middleware/csp.ts', desc: '+2 -1', status: null });
      const v = coll(TL({ icon: 'terminal', title: 'Running pnpm vitest run csp', status: 'running' })); add(tr, v.el);
      v.body.append(codeBlock('✓ middleware/csp.test.ts (12 tests)\nTests  12 passed', { lang: 'bash', label: 'Test output' }));
      await sleep(t, 1500); v.line.set({ title: 'Ran pnpm vitest run csp', desc: '12 passed', status: null });
      const li = coll(TL({ icon: 'terminal', title: 'Running pnpm lint', status: 'running' })); add(tr, li.el);
      li.body.append(codeBlock("middleware/csp.ts\n  14:7  error  'nonce' is unused", { lang: 'bash', errors: [2], label: 'Lint output' }));
      await sleep(t, 1300); li.line.set({ title: 'pnpm lint failed with 1 error', status: 'error' });
      await sleep(t, 500); li.set(true);
      await sleep(t, 900); add(tr, TL({ icon: 'pencil', title: 'Removing the unused nonce', status: 'running' }));
    } });

  demos.push({ group: G, title: 'Live Run with Stop', kind: 'lib',
    desc: 'The live step shimmers and its reasoning streams open; finished steps collapse to their output, and Stop freezes the run with a stopped label on the step in flight.',
    async run(root, t, ctx) {
      const STEPS = [
        { kind: 'brain', running: 'Thinking', done: 'Thought for 4s', stopped: 'Stopped while thinking', ms: 0, text: 'A 502 means the function crashed or timed out. The logs will say which.' },
        { kind: 'scroll-text', running: 'Searching logs for POST /api/checkout', done: 'Searched logs for POST /api/checkout', stopped: 'Stopped searching logs', desc: '38 errors', ms: 1600, code: '14:02:11 POST /api/checkout 200 412ms\n14:02:19 POST /api/checkout 502 10.0s\n14:02:19 Task timed out after 10s', lang: 'bash', errors: [2, 3] },
        { kind: 'pencil', running: 'Editing app/api/checkout/route.ts', done: 'Edited app/api/checkout/route.ts', stopped: 'Stopped editing app/api/checkout/route.ts', desc: '+3 -1', ms: 1800, code: 'const rates = await shipping.quote(cart)\nconst rates = await shipping.quote(cart, {\n  signal: AbortSignal.timeout(3000),\n})', lang: 'ts', diff: { added: [2, 3, 4], removed: [1] } },
        { kind: 'terminal', running: 'Running pnpm test checkout', done: 'Ran pnpm test checkout', stopped: 'Stopped pnpm test checkout', desc: '9 passed', ms: 2200, code: '✓ checkout/route.test.ts (9 tests)\nTests  9 passed', lang: 'bash' },
      ];
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      let state = 'running';
      const b = btn('Stop', 'outline', 'sm'); const st = statusP('Working'); s.w.append(ctl(b, st));
      b.onclick = () => { if (state === 'running') { state = 'stopped'; b.innerHTML = '<span>Run again</span>'; st.textContent = 'Stopped by you'; } else ctx.restart(); };
      const wait = async (ms) => { for (let x = 0; x < ms && state === 'running' && !t.dead; x += 100) await sleep(t, 100); };
      let logs = null;
      for (const step of STEPS) {
        if (state !== 'running' || t.dead) break;
        const line = TL({ icon: step.kind, title: step.running, status: 'running' });
        let c = null;
        if (step.text) { c = coll(line, { open: true }); add(tr, c.el); const p = mk('p', 'text-pretty'); c.body.append(p); for (let i = 0; i < step.text.length && state === 'running' && !t.dead; i += 3) { p.textContent = step.text.slice(0, i + 3); await t.sleep(24); } }
        else add(tr, line);
        await wait(step.ms || 600);
        if (state !== 'running') { line.set({ status: null, title: step.stopped, iconHtml: I('circle-stop') }); if (c) c.set(false); break; }
        line.set({ status: null, title: step.done, desc: step.desc || '' });
        if (c) c.set(false);
        if (step.code) { const cc = swapWrap(line, (x) => coll(x)); cc.body.append(codeBlock(step.code, { lang: step.lang, diff: step.diff, errors: step.errors || [], label: 'Output of ' + step.done })); if (step.kind === 'scroll-text') logs = cc; }
      }
      if (state === 'running') { state = 'done'; b.innerHTML = '<span>Run again</span>'; st.textContent = `Finished in ${STEPS.length} steps`; await sleep(t, 900); if (logs) await press(logs.trigger, t, 200); }
    } });

  demos.push({ group: G, title: 'Worked-For Summary in a Reply', kind: 'lib',
    desc: 'An analytics answer: the Worked for row counts up while queries land inside it, the conclusion streams, and the dashboards it used fold underneath.',
    async run(root, t) {
      const QUERIES = [
        { title: 'Queried trial signups by day', desc: '28 rows', sql: "select date_trunc('day', created_at) as day, count(*)\nfrom trials\nwhere created_at >= current_date - 27\ngroup by 1 order by 1" },
        { title: 'Queried bounces by email domain', desc: '12 rows', sql: "select split_part(email, '@', 2) as domain, count(*)\nfrom verification_attempts\nwhere status = 'bounced' and created_at::date = '2026-10-06'\ngroup by 1 order by 2 desc limit 12" },
      ];
      const s = trStage(root, 'min-h-[460px]', 'max-w-md gap-6');
      const u = row('end'); u.content.append(bubble('muted', 'Why did trial signups drop last Tuesday?', 'end')); add(s.w, u);
      await sleep(t, 500);
      const r = row(); const col = mk('div', 'flex flex-col gap-4'); r.content.append(col); add(s.w, r);
      const tr = trace(); col.append(tr);
      const w = coll(TL({ title: 'Working for 0s', status: 'running' }), { open: true }); tr.append(w.el);
      const inner = trace(); w.body.append(inner);
      let sec = 0; const ticker = t.every(REDUCE ? 1000 : 90, () => { if (sec < 38) { sec++; w.line.set({ title: `Working for ${sec}s` }); } });
      for (const q of QUERIES) {
        await sleep(t, 900); const c = coll(TL({ icon: 'database', title: q.title.replace('Queried', 'Querying'), status: 'running' })); add(inner, c.el);
        c.body.append(codeBlock(q.sql, { lang: 'sql', label: q.title, wrap: true }));
        await sleep(t, 1000); c.line.set({ title: q.title, desc: q.desc, status: null });
      }
      await sleep(t, 700); t.stop(ticker); w.line.set({ title: 'Worked for 38s', desc: `${QUERIES.length} queries`, status: null });
      const p = mk('p', 'leading-relaxed text-pretty'); col.append(p);
      await stream(p, 'Signups fell 41% because verification emails to Gmail bounced for 4 hours after the DKIM record broke.', t, 38);
      await sleep(t, 400);
      const tr2 = trace(); const d = coll(TL({ icon: 'chart-line', title: 'Used 2 dashboards' })); tr2.append(d.el); add(col, tr2);
      const dl = trace(); ['Activation funnel, weekly', 'Email delivery health'].forEach((x) => dl.append(linkWrap(TL({ title: x, after: 'chevron-right' })))); d.body.append(dl);
      await sleep(t, 900); await press(d.trigger, t, 200);
    } });

  demos.push({ group: G, title: 'Subagents with Retry', kind: 'lib',
    desc: 'Three subagents fan out under one summary row: the explorer reports back, the test writer fails on a missing module, and Retry re-runs it once the implementer has created the file.',
    async run(root, t) {
      const EXP = [{ title: 'Searched for seatPrice', desc: '9 results' }, { title: 'Read lib/billing/plans.ts' }];
      const AGENTS = [
        { id: 'explorer', title: { running: 'Explorer is mapping the billing code', done: 'Explorer mapped the billing code' }, calls: { running: EXP.slice(0, 1).concat([{ title: 'Reading lib/billing/plans.ts', status: 'running' }]), done: EXP }, result: 'Found 3 fixed seat prices: plans.ts, the webhook and the invoice preview.' },
        { id: 'implementer', title: { running: 'Implementer is editing 2 files', done: 'Implementer edited 2 files' }, calls: { running: [{ title: 'Edited lib/billing/plans.ts', desc: '+38 -12' }, { title: 'Creating lib/billing/meter.ts', status: 'running' }], done: [{ title: 'Edited lib/billing/plans.ts', desc: '+38 -12' }, { title: 'Created lib/billing/meter.ts', desc: '+64' }] } },
        { id: 'tests', title: { running: 'Test writer is running the billing suite', done: 'Test writer added 6 passing tests', failed: "Test writer's suite did not compile" }, calls: { running: [{ title: 'Wrote tests/billing/meter.test.ts', desc: '+92' }, { title: 'Running pnpm test billing', status: 'running' }], done: [{ title: 'Wrote tests/billing/meter.test.ts', desc: '+92' }, { title: 'Ran pnpm test billing', desc: '6 passed' }], failed: [{ title: 'Wrote tests/billing/meter.test.ts', desc: '+92' }, { title: 'Failed to run pnpm test billing', status: 'error', output: "FAIL tests/billing/meter.test.ts\nError: Cannot find module '@/lib/billing/meter'" }] } },
      ];
      const s = trStage(root, 'min-h-[460px]', 'max-w-md gap-3');
      const states = { explorer: 'running', implementer: 'running', tests: 'running' };
      const tr = trace(); s.w.append(tr);
      const sum = coll(TL({ icon: 'workflow', title: '' }), { open: true }); add(tr, sum.el);
      const list = trace(); sum.body.append(list);
      const rows = {};
      const paintAgent = (a) => {
        const st = states[a.id]; const o = rows[a.id];
        o.line.set({ title: a.title[st], desc: `${a.calls[st].length} calls`, status: st === 'running' ? 'running' : st === 'failed' ? 'error' : null });
        o.body.innerHTML = ''; const box = mk('div', 'flex flex-col gap-2'); const calls = trace(); box.append(calls);
        a.calls[st].forEach((c) => {
          const ln = TL({ icon: 'terminal', title: c.title, desc: c.desc || '', status: c.status });
          if (c.output) { const cc = coll(ln, { open: true }); cc.body.append(codeBlock(c.output, { lang: 'bash', errors: [2], label: c.title, wrap: true })); calls.append(cc.el); } else calls.append(ln);
        });
        if (st === 'done' && a.result) box.append(mk('p', 'text-pretty', esc(a.result)));
        o.body.append(box);
      };
      const paint = () => {
        const v = Object.values(states); const running = v.filter((x) => x === 'running').length; const failed = v.filter((x) => x === 'failed').length;
        sum.line.set({ title: [`${running ? 'Running' : 'Ran'} ${AGENTS.length} subagents`, running ? `${running} still working` : null, failed ? `${failed} failed` : null].filter(Boolean).join(', '), status: running ? 'running' : failed ? 'error' : null });
        AGENTS.forEach(paintAgent);
        retry.disabled = !(states.tests === 'failed' && states.implementer === 'done');
        st.textContent = states.implementer === 'running' ? 'Retry opens once Implementer finishes' : states.tests === 'failed' ? 'lib/billing/meter.ts exists now' : states.tests === 'running' ? 'Retrying test writer' : 'All subagents finished';
      };
      const retry = btn('Retry test writer', 'outline', 'sm'); const st = statusP(); s.w.append(ctl(retry, st));
      for (const a of AGENTS) { rows[a.id] = coll(TL({ icon: 'bot' })); add(list, rows[a.id].el); paintAgent(a); await sleep(t, 250); }
      paint();
      retry.onclick = async () => { states.tests = 'running'; paint(); st.focus({ preventScroll: true }); await sleep(t, 3200); states.tests = 'done'; paint(); };
      rows.implementer.set(true);
      await sleep(t, 1600); states.explorer = 'done'; paint();
      await sleep(t, 1000); states.tests = 'failed'; paint(); rows.tests.set(true);
      await sleep(t, 1300); states.implementer = 'done'; paint(); rows.implementer.set(false);
      await sleep(t, 1300); await press(retry, t);
    } });

  demos.push({ group: G, title: 'Plan, Approve, Apply', kind: 'lib',
    desc: 'An infra agent refreshes state and plans three changes; an approval Item gates production, and Apply walks each change from pending to running to done.',
    async run(root, t, ctx) {
      const CH = [{ a: 'create', addr: 'aws_sqs_queue.invoices' }, { a: 'update', addr: 'aws_lambda_function.invoices', detail: '+512 MB' }, { a: 'destroy', addr: 'aws_sqs_queue.invoices_v1' }];
      const VERB = { create: ['Create', 'Creating', 'Created', 'plus'], update: ['Update', 'Updating', 'Updated', 'pencil'], destroy: ['Destroy', 'Destroying', 'Destroyed', 'trash-2'] };
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const l1 = TL({ icon: 'refresh-cw', title: 'Refreshing state', status: 'running' }); add(tr, l1);
      await sleep(t, 1200); l1.set({ title: 'Refreshed state for 42 resources', desc: '11s', status: null });
      const plan = coll(TL({ icon: 'list-checks', title: 'Planning changes', status: 'running' }), { open: true }); add(tr, plan.el);
      const ls = trace(); plan.body.append(ls);
      const lines = [];
      for (const c of CH) { await sleep(t, 450); const l = TL({ iconHtml: I(VERB[c.a][3]), title: `${VERB[c.a][0]} <span class="font-mono">${c.addr}</span>`, desc: c.detail || '', status: 'pending' }); add(ls, l); lines.push(l); }
      await sleep(t, 400); plan.line.set({ title: `Planned ${CH.length} changes`, desc: '<span aria-hidden="true">+1 ~1 -1</span><span class="sr-only">1 to add, 1 to change, 1 to destroy</span>', status: null });
      const item = mk('div', 'flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5');
      item.innerHTML = `<div class="flex min-w-0 flex-1 flex-col gap-0.5"><div class="text-sm font-medium">Apply ${CH.length} changes to production?</div><div class="text-xs text-muted-foreground">Destroys aws_sqs_queue.invoices_v1.</div></div>`;
      const acts = mk('div', 'flex items-center gap-2'); const deny = btn('Deny', 'outline', 'sm'); const apply = btn('Apply', 'default', 'sm'); acts.append(deny, apply); item.append(acts); add(s.w, item);
      const st = statusP(); const again = btn('Plan again', 'outline', 'sm'); again.onclick = () => ctx.restart();
      deny.onclick = () => { item.replaceWith(ctl(again, st)); plan.line.set({ title: `Planned ${CH.length} changes, apply denied` }); st.textContent = 'Apply denied. Nothing was changed.'; };
      apply.onclick = async () => {
        const c = ctl(st); item.replaceWith(c); plan.line.set({ title: `Applying ${CH.length} changes`, status: 'running' });
        for (let i = 0; i < CH.length; i++) {
          const v = VERB[CH[i].a]; lines[i].set({ title: `${v[1]} <span class="font-mono">${CH[i].addr}</span>`, status: 'running' }); st.textContent = `Applied ${i} of ${CH.length}`;
          await sleep(t, 900); lines[i].set({ title: `${v[2]} <span class="font-mono">${CH[i].addr}</span>`, status: null });
        }
        plan.line.set({ title: `Applied ${CH.length} changes`, status: null }); c.prepend(again); st.textContent = 'Apply complete: 1 added, 1 changed, 1 destroyed.';
      };
      await sleep(t, 1900); await press(apply, t);
    } });

  demos.push({ group: G, title: 'Web Research with Citations', kind: 'lib',
    desc: 'Searches and reads land as trace rows, the answer streams with numbered citation badges, and pressing a citation opens the sources and highlights the one it cites.',
    async run(root, t) {
      const SOURCES = [['Session management cheat sheet', 'owasp.org'], ['Window: localStorage property', 'developer.mozilla.org'], ['Set-Cookie header', 'developer.mozilla.org'], ['OAuth 2.0 for browser-based apps', 'datatracker.ietf.org']];
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const se = coll(TL({ icon: 'search', title: 'Searching the web', status: 'running' }), { open: true }); add(tr, se.el);
      const ql = trace(); se.body.append(ql);
      for (const [q, n] of [['localStorage session token xss risk', 8], ['httponly cookie spa refresh token', 6]]) { await sleep(t, 700); add(ql, TL({ title: q, desc: `${n} results` })); }
      await sleep(t, 500); se.line.set({ title: 'Searched the web 2 times', status: null }); se.set(false);
      const so = coll(TL({ icon: 'globe', title: 'Reading sources', status: 'running' })); add(tr, so.el);
      const sl = trace(); const links = SOURCES.map(([title, dom], i) => { const l = TL({ title: `<span class="rui-src">${i + 1}. ${title}</span><span class="sr-only"> (opens in a new tab)</span>`, desc: dom, after: 'arrow-up-right' }); const a = linkWrap(l); sl.append(a); return l; }); so.body.append(sl);
      await sleep(t, 1500); so.line.set({ title: `Read ${SOURCES.length} sources`, status: null });
      const p = mk('p', 'leading-relaxed text-pretty text-foreground'); add(s.w, p);
      const cite = (id) => { const b = mk('button', 'rui-badge ms-1 cursor-pointer align-middle', String(id)); b.type = 'button'; b.dataset.v = 'secondary'; b.dataset.r = 'full'; b.setAttribute('aria-label', `Source ${id}: ${SOURCES[id - 1][0]}`); b.onclick = () => show(id); return b; };
      const show = (id) => { so.set(true); links.forEach((l, i) => { l.querySelector('.rui-src').classList.toggle('text-foreground', i === id - 1); }); };
      const parts = [['No. Any XSS bug can read it', [1, 2]], ['. Use an HttpOnly cookie', [3]], [' and keep access tokens in memory', [4]], ['.', []]];
      const cites = [];
      for (const [text, ids] of parts) { const sp = mk('span'); p.append(sp); await stream(sp, text, t, 40); for (const id of ids) { const c = cite(id); p.append(c); appear(c, 2, 200); cites.push(c); await sleep(t, 120); } }
      await sleep(t, 1000); await press(cites[2], t, 240);
    } });

  demos.push({ group: G, title: 'Lookups Before a Draft', kind: 'lib',
    desc: 'A support agent ticks through order, carrier and policy lookups, then the drafted reply opens; Regenerate re-runs the lookups and drafts a new version.',
    async run(root, t) {
      const L = [
        { pending: 'Look up order #48213', running: 'Looking up order #48213', done: 'Looked up order #48213', finding: 'Shipped Oct 9', href: 1, icon: 'package' },
        { pending: 'Check carrier tracking for 1Z84F0', running: 'Checking carrier tracking for 1Z84F0', done: 'Checked carrier tracking for 1Z84F0', finding: 'Held at Louisville hub', icon: 'truck' },
        { pending: 'Read the late delivery policy', running: 'Reading the late delivery policy', done: 'Read the late delivery policy', finding: 'Section 4.2', href: 1, icon: 'book-open' },
      ];
      const DRAFTS = ["Hi Dana, your order is held in Louisville until Friday. I've refunded your $12 shipping.", 'Hi Dana, a carrier delay holds your order until Friday. Your $12 shipping is refunded.'];
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      const steps = coll(TL({ icon: 'search' })); tr.append(steps.el); const sl = trace(); steps.body.append(sl);
      const holder = mk('div', 'contents'); tr.append(holder);
      const ins = btn('Insert reply', 'default', 'sm'); const reg = btn('Regenerate', 'outline', 'sm'); const st = statusP('', 'ml-auto');
      const bar = mk('div', 'flex items-center gap-2'); bar.append(ins, reg, st); s.w.append(bar);
      let draft = 0;
      const runOnce = async () => {
        ins.disabled = reg.disabled = true; st.textContent = 'Drafting a new reply'; steps.set(true); sl.innerHTML = '';
        const ls = L.map((x) => { const l = TL({ icon: x.icon, title: x.pending, status: 'pending' }); sl.append(l); return l; });
        holder.innerHTML = ''; holder.append(TL({ icon: 'sparkles', title: 'Draft a reply to Dana', status: 'pending' }));
        for (let i = 0; i <= L.length; i++) {
          steps.line.set({ title: i < L.length ? 'Checking the order' : 'Checked the order and policy', desc: i < L.length ? `${i} of ${L.length}` : `${L.length} lookups`, status: i < L.length ? 'running' : null });
          if (i < L.length) { ls[i].set({ title: L[i].running, status: 'running' }); await sleep(t, 700); ls[i].set({ title: L[i].done, desc: L[i].finding, status: null }); if (L[i].href) swapWrap(ls[i], linkWrap); }
        }
        steps.set(false);
        const d = coll(TL({ icon: 'sparkles', title: 'Drafted a reply to Dana' }), { open: false }); holder.innerHTML = ''; holder.append(d.el);
        const p = mk('p', 'text-pretty text-foreground'); d.body.append(p); d.set(true); await stream(p, DRAFTS[draft], t, 30);
        ins.disabled = reg.disabled = false; st.textContent = '';
      };
      ins.onclick = () => { st.textContent = 'Added to the composer'; };
      reg.onclick = () => { draft = (draft + 1) % DRAFTS.length; runOnce(); };
      await sleep(t, 300); await runOnce();
      await sleep(t, 1000); await press(ins, t); await sleep(t, 1300); await press(reg, t, 260, false); draft = 1; await runOnce();
    } });

  demos.push({ group: G, title: 'Registry Install Log', kind: 'lib',
    desc: 'shadcn add resolves registry items, installs a package and writes files while the top row keeps running; the stylesheet change lands last as a diff.',
    async run(root, t) {
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const top = TL({ icon: 'terminal', title: 'Running shadcn add @ui/c-data-grid-1', status: 'running' }); add(tr, top);
      await sleep(t, 500);
      const res = coll(TL({ icon: 'box', title: 'Resolving registry items', status: 'running' }), { open: true }); add(tr, res.el); const rl = trace(); res.body.append(rl);
      for (const [n, k] of [['@ui/c-data-grid-1', 'example'], ['@ui/data-grid', 'component'], ['button', 'ui']]) { await sleep(t, 380); add(rl, TL({ title: `<code>${n}</code>`, desc: k })); }
      await sleep(t, 300); res.line.set({ title: 'Resolved 3 registry items', status: null }); res.set(false);
      const inst = TL({ icon: 'package', title: 'Installing @tanstack/react-table', status: 'running' }); add(tr, inst);
      await sleep(t, 1400); inst.set({ title: 'Installed @tanstack/react-table', desc: '6.1s', status: null });
      const wr = coll(TL({ icon: 'file-code', title: 'Writing files', status: 'running' }), { open: true }); add(tr, wr.el); const wl = trace(); wr.body.append(wl);
      for (const [p, c] of [['components/ui/data-grid/data-grid.tsx', 1], ['components/ui/button.tsx', 0], ['components/examples/c-data-grid-1.tsx', 1]]) { await sleep(t, 450); const l = TL({ title: c ? `Created ${p}` : `Kept ${p}, it already exists` }); add(wl, c ? linkWrap(l) : l); }
      await sleep(t, 300); wr.line.set({ title: 'Wrote 2 files, kept 1', status: null });
      const css = coll(TL({ icon: 'palette', title: 'Updating app/globals.css', status: 'running' })); add(tr, css.el);
      css.body.append(codeBlock('@theme inline {\n  --color-success: var(--success);\n  --color-info: var(--info);\n  --color-warning: var(--warning);\n}', { lang: 'css', diff: { added: [2, 3, 4] }, label: 'Changes to app/globals.css' }));
      await sleep(t, 900); css.line.set({ title: 'Updated app/globals.css', desc: '+3', status: null });
      top.set({ title: 'Ran shadcn add @ui/c-data-grid-1', desc: '9.4s', status: null });
      await sleep(t, 700); wr.set(false); await press(css.trigger, t, 200);
    } });

  demos.push({ group: G, title: 'CI Jobs with Re-run', kind: 'lib',
    desc: 'A failed pipeline opens straight to the failing test log; Re-run walks tests, build and deploy from pending to running to done, each with a state glyph.',
    async run(root, t) {
      const LOG = 'FAIL search-input.test.tsx\n  × debounces keystrokes\n    onSearch ran 3 times, expected 1\n  × cancels the timer on unmount\n    onSearch ran after unmount';
      const JOBS = [
        { id: 'install', title: { done: 'Installed dependencies' }, dur: '38s', init: 'done', steps: { done: [['Restored the pnpm store from cache', '4s'], ['Ran pnpm install --frozen-lockfile', '31s']] } },
        { id: 'test', title: { done: 'Ran 418 tests', failed: 'Tests failed, 2 of 418', running: 'Running 418 tests', pending: 'Run tests' }, dur: '1m 12s', init: 'failed', steps: { done: [['Ran unit tests', '48s'], ['Ran component tests', '24s']], failed: [['Ran unit tests', '48s'], ['Component tests failed', '24s', LOG]] } },
        { id: 'build', title: { done: 'Built the app', running: 'Building the app', pending: 'Build the app' }, dur: '1m 3s', init: 'pending' },
        { id: 'deploy', title: { done: 'Deployed a preview', running: 'Deploying a preview', pending: 'Deploy a preview' }, dur: '18s', init: 'pending' },
      ];
      const glyph = (st) => (st === 'failed' ? I('circle-x') : st === 'pending' ? I('circle-dashed') : st === 'running' ? glyphRun() : I('circle-check'));
      const s = trStage(root, 'min-h-[460px]'); const tr = trace(); s.w.append(tr);
      const state = {}; const slots = {};
      const render = (j) => {
        const st = state[j.id]; const line = TL({ iconHtml: glyph(st), title: j.title[st], desc: st === 'done' || st === 'failed' ? j.dur : '', status: st === 'failed' ? 'error' : st === 'done' ? null : st });
        const steps = j.steps?.[st]; let el = line;
        if (steps) {
          const c = coll(line, { open: st === 'failed' }); const sub = trace(); c.body.append(sub);
          steps.forEach(([ti, d, log]) => { const sl = TL({ title: ti, desc: d, status: log ? 'error' : null }); if (log) { const cc = coll(sl, { open: true }); cc.body.append(codeBlock(log, { lang: 'bash', errors: [2, 4], label: 'Failing test output' })); sub.append(cc.el); } else sub.append(sl); });
          el = c.el;
        }
        if (slots[j.id]) slots[j.id].replaceWith(el); slots[j.id] = el; return el;
      };
      await sleep(t, 300);
      for (const j of JOBS) { state[j.id] = j.init; add(tr, render(j)); await sleep(t, 380); }
      const re = btn('Re-run failed jobs', 'outline', 'sm'); const st = statusP('Build and deploy wait on the tests'); s.w.append(ctl(re, st));
      re.onclick = async () => {
        re.disabled = true; const RR = ['test', 'build', 'deploy'];
        for (let i = 0; i <= RR.length; i++) {
          RR.forEach((id, k) => { state[id] = k < i ? 'done' : k === i ? 'running' : 'pending'; }); JOBS.forEach((j) => { if (RR.includes(j.id)) render(j); });
          st.textContent = i < RR.length ? `Re-running ${RR.length} jobs` : 'All jobs passed';
          if (i < RR.length) await sleep(t, 1800);
        }
      };
      await sleep(t, 1800); await press(re, t);
    } });

  demos.push({ group: G, title: 'Request Span Tree', kind: 'lib',
    desc: 'Spans of one checkout request land as they close, nested by parent; the failed reservation turns destructive and the span with the most self time earns a share badge.',
    async run(root, t) {
      const ROOT = { id: 'root', name: 'POST /api/checkout', icon: 'server', ms: 842, children: [
        { id: 'cart', name: 'SELECT cart_items', icon: 'database', ms: 96, attrs: { 'db.system.name': 'postgresql', 'db.response.returned_rows': '7' } },
        { id: 'r1', name: 'POST /inventory/reserve', icon: 'globe', ms: 34, error: true, attrs: { 'http.response.status_code': '409', 'error.type': '409' } },
        { id: 'r2', name: 'POST /inventory/reserve', icon: 'globe', ms: 30, attrs: { 'http.response.status_code': '200', 'http.request.resend_count': '1' } },
        { id: 'pay', name: 'payments.createIntent', icon: 'code', ms: 610, children: [{ id: 'payh', name: 'POST /v1/payment_intents', icon: 'globe', ms: 598, attrs: { 'server.address': 'api.payments.example', 'http.response.status_code': '200' } }] },
      ] };
      const slowest = (sp) => (sp.children || []).map(slowest).reduce((b, n) => (n.self > b.self ? n : b), { sp, self: sp.ms - (sp.children || []).reduce((a, c) => a + c.ms, 0) });
      const HOT = slowest(ROOT).sp; const has = (sp, id) => sp.id === id || (sp.children || []).some((c) => has(c, id));
      const s = trStage(root, 'min-h-[440px]'); const tr = trace(); s.w.append(tr);
      const title = (sp) => `<code class="text-xs">${sp.name}</code>${sp.error ? ' failed' : ''}`;
      async function grow(sp, parent) {
        const line = TL({ iconHtml: I(sp.icon), title: title(sp), status: 'running' });
        const c = coll(line, { open: false }); add(parent, c.el);
        if (sp.children) { const sub = trace(); c.body.append(sub); if (has(sp, HOT.id)) c.set(true); for (const ch of sp.children) await grow(ch, sub); }
        else { c.body.append(mk('dl', 'flex flex-col gap-1 font-mono text-xs', Object.entries(sp.attrs).map(([k, v]) => `<div class="flex gap-3"><dt class="min-w-0 truncate">${k}</dt><dd class="ml-auto shrink-0 text-foreground">${v}</dd></div>`).join(''))); await sleep(t, Math.min(1500, 520 + sp.ms * 1.2)); }
        line.set({ status: sp.error ? 'error' : null, desc: `${sp.ms} ms`, extra: sp.id === HOT.id ? badge(`${Math.round(sp.ms / ROOT.ms * 100)}%<span class="sr-only"> of the request time</span>`, 'warning-light') : '' });
      }
      await sleep(t, 300); await grow(ROOT, tr);
      await sleep(t, 1200); const leaf = tr.querySelectorAll('.rui-tct')[1]; if (leaf) await press(leaf, t, 220);
    } });

  demos.push({ group: G, title: 'Breadcrumbs to Stack Trace', kind: 'lib',
    desc: 'An error report replays its breadcrumbs up to the TypeError, then the stack opens on the in-app frame; the network crumb opens a dialog with the response that caused it.',
    async run(root, t) {
      const RESPONSE = '{\n  "interval": "year",\n  "plans": [\n    {\n      "id": "pro",\n      "prices": {\n        "month": { "priceId": "price_1Q8sZ7" },\n        "year": { "priceId": "price_1Q8sZ9" }\n      }\n    },\n    {\n      "id": "team",\n      "prices": {\n        "month": { "priceId": "price_1Q8t02" }\n      }\n    }\n  ]\n}';
      const FRAME = 'export function CheckoutButton({ plan }: Props) {\n  const { interval } = useBilling()\n  const price = plan.prices[interval]\n  const priceId = price.priceId\n  return <Button onClick={() => checkout(priceId)}>Upgrade</Button>\n}';
      const s = trStage(root, 'min-h-[480px]'); const tr = trace(); s.w.append(tr);
      const bc = coll(TL({ title: 'Breadcrumbs', desc: '0 events' }), { open: true }); add(tr, bc.el); const bl = trace(); bc.body.append(bl);
      const dlg = mk('div', 'absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-200'); dlg.style.opacity = '0'; dlg.hidden = true; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true');
      const box = mk('div', 'rui-card relative max-h-full w-full max-w-md gap-3 overflow-auto p-4 shadow-lg'); const x = btn('', 'ghost', 'icon-xs', 'x', 'absolute top-2 right-2'); x.setAttribute('aria-label', 'Close');
      box.innerHTML = '<div class="flex flex-col gap-1 pe-6"><div class="text-base leading-snug font-medium">GET /api/plans?interval=year</div><div class="text-sm text-muted-foreground">200 in 209 ms. The team plan has no yearly price.</div></div>';
      box.append(x, codeBlock(RESPONSE, { lang: 'json', hlLines: [13, 14, 15], label: 'Response body' })); dlg.append(box); s.append(dlg);
      const openDlg = (v) => { if (v) { dlg.hidden = false; tick(() => { dlg.style.opacity = '1'; }); } else { dlg.style.opacity = '0'; dlg.hidden = true; } };
      x.onclick = () => openDlg(false); dlg.onclick = (e) => { if (e.target === dlg) openDlg(false); };
      const crumbs = [['navigation', 'Navigated from / to /pricing', '14:31:02.118'], ['globe', 'GET /api/plans?interval=year, 200', '14:31:05.611', 1], ['mouse-pointer-2', 'Clicked Upgrade on Team', '14:31:09.023'], ['bug', 'Threw TypeError in CheckoutButton', '14:31:09.024', 0, 'error']];
      let net = null;
      for (let i = 0; i < crumbs.length; i++) {
        const [ic, ti, ts, dialog, stt] = crumbs[i]; await sleep(t, 550);
        const l = TL({ icon: ic, title: ti, desc: ts, status: stt, after: dialog ? 'chevron-right' : null });
        if (dialog) { const b = mk('button', 'rui-tlink'); b.type = 'button'; b.append(l); b.onclick = () => openDlg(true); add(bl, b); net = b; } else add(bl, l);
        bc.line.set({ desc: `${i + 1} events` });
      }
      await sleep(t, 500);
      const stk = coll(TL({ title: 'Stack trace', desc: '1 in app, 5 framework' })); add(tr, stk.el); const sk = trace(); stk.body.append(sk);
      const app = coll(TL({ title: '<code class="text-xs">CheckoutButton</code>', desc: '<code class="text-xs">checkout-button.tsx:14:25</code>', status: 'error' }), { open: true });
      app.body.append(codeBlock(FRAME, { lang: 'tsx', ln: true, start: 11, errors: [4], label: 'checkout-button.tsx around line 14' })); sk.append(app.el);
      const fw = coll(TL({ title: '5 frames in react-dom' })); const fl = trace(); ['renderWithHooks', 'updateFunctionComponent', 'beginWork', 'performUnitOfWork', 'workLoopSync'].forEach((f) => fl.append(TL({ title: `<code class="text-xs">${f}</code>` }))); fw.body.append(fl); sk.append(fw.el);
      await sleep(t, 700); bc.set(false); await press(stk.trigger, t, 220);
      await sleep(t, 2200); if (net) { net.style.opacity = '.7'; await sleep(t, 200); net.style.opacity = ''; openDlg(true); }
      await sleep(t, 2600); openDlg(false);
    } });

  demos.push({ group: G, title: 'Query Plan with Hot Node', kind: 'lib',
    desc: 'An EXPLAIN ANALYZE plan unfolds node by node with timings; the sequential scan that eats 80% of the query gets a badge and the agent suggests the index that fixes it.',
    async run(root, t) {
      const TOTAL = 798.1;
      const PLAN = { id: 'join', op: 'Hash Join on customer_id', ms: 798.1, children: [
        { id: 'orders', op: 'Seq Scan on orders', ms: 641.7, details: [['Filter', "status = 'paid', last 30 days"], ['Rows', '41,966 of 1,235,368 read'], ['Estimate', '1,204 rows, off by 35x']] },
        { id: 'hash', op: 'Hash', ms: 21.9, children: [{ id: 'customers', op: 'Seq Scan on customers', ms: 18.4, details: [['Rows', '8,412']] }] },
      ] };
      const hot = (n) => n.id === 'orders' || (n.children || []).some(hot);
      const s = trStage(root, 'min-h-[460px]', 'max-w-lg'); const tr = trace(); s.w.append(tr);
      async function grow(n, parent) {
        const line = TL({ title: n.op, status: 'running' }); const c = coll(line); add(parent, c.el);
        const box = mk('div', 'flex flex-col gap-2'); c.body.append(box); if (hot(n) || n.children) c.set(true);
        if (n.details) { const dl = mk('dl', 'flex flex-col gap-0.5 text-xs'); box.append(dl); for (const [k, v] of n.details) { await sleep(t, 420); add(dl, mk('div', 'flex gap-3', `<dt class="w-16 shrink-0">${k}</dt><dd class="min-w-0 text-foreground">${v}</dd>`), 3); } }
        if (n.children) { const sub = trace(); box.append(sub); for (const ch of n.children) await grow(ch, sub); }
        else await sleep(t, n.ms > 100 ? 1100 : 500);
        line.set({ status: null, desc: `${Math.round(n.ms)} ms`, extra: n.id === 'orders' ? badge(`${Math.round(n.ms / TOTAL * 100)}%<span class="sr-only"> of the query time</span>`, 'warning-light') : '' });
        if (!hot(n) && !n.children) c.set(false);
      }
      await sleep(t, 300); await grow(PLAN, tr);
      const tr2 = trace(); const sg = coll(TL({ icon: 'lightbulb', title: 'Suggesting an index', status: 'running' })); tr2.append(sg.el); add(s.w, tr2);
      sg.body.append(codeBlock('create index concurrently orders_status_created_at_idx\n  on orders (status, created_at desc);', { lang: 'sql', label: 'Index to add' }));
      await sleep(t, 1100); sg.line.set({ title: 'Suggested an index on orders', desc: 'est. 641 to 9 ms', status: null });
      await sleep(t, 500); await press(sg.trigger, t, 200);
    } });

  demos.push({ group: G, title: 'Model Build with a Failing Test', kind: 'lib',
    desc: 'Four models build in turn, the unique test on fct_revenue fails open onto a duplicates table, and the downstream model is skipped as pending.',
    async run(root, t) {
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const b = coll(TL({ icon: 'database', title: 'Building 4 models', status: 'running' }), { open: true }); add(tr, b.el); const bl = trace(); b.body.append(bl);
      for (const [n, r] of [['stg_orders', '1.2M rows'], ['stg_customers', '84K rows'], ['int_order_items', '3.4M rows'], ['fct_revenue', '1.1M rows']]) { const l = TL({ title: n, status: 'running' }); add(bl, l); await sleep(t, 650); l.set({ desc: r, status: null }); }
      b.line.set({ title: 'Built 4 models', desc: '1m 24s', status: null }); await sleep(t, 300); b.set(false);
      const u = coll(TL({ icon: 'flask-conical', title: 'Testing unique order_id on fct_revenue', status: 'running' })); add(tr, u.el);
      u.body.innerHTML = table([['order_id'], ['Copies', 'text-right']], [['<code class="text-xs">ord_8821340</code>', '2'], ['<code class="text-xs">ord_8823004</code>', '3']]);
      await sleep(t, 1400); u.line.set({ title: 'Unique test failed on fct_revenue', desc: '2 duplicates', status: 'error' }); u.set(true);
      await sleep(t, 700); add(tr, TL({ icon: 'circle-dashed', title: 'Skipped dim_customer_ltv', desc: 'upstream failed', status: 'pending' }));
    } });

  demos.push({ group: G, title: 'Webhook Delivery Attempts', kind: 'lib',
    desc: 'Delivery attempts stack up with their responses, the latest open; Resend adds a running attempt that resolves into a fresh 200.',
    async run(root, t) {
      const PAYLOAD = '{\n  "id": "evt_3Q9xLm2",\n  "type": "invoice.paid",\n  "invoice": "in_1Q9xKt",\n  "amount_paid": 18400\n}';
      const H = [[1, '14:02:11', false, 'Attempt 1 timed out after 30s', 'No response from hooks.northwind.dev within 30000 ms', 'bash'], [2, '14:03:12', false, 'Attempt 2 failed with 500', '{ "error": "database is in recovery mode" }', 'json'], [3, '14:07:40', true, 'Attempt 3 delivered, 200 in 214 ms', PAYLOAD, 'json']];
      const s = trStage(root, 'min-h-[460px]'); const tr = trace(); s.w.append(tr);
      const cs = []; let n = 0;
      const addAttempt = ([num, at, ok, ti, body, lang]) => { cs.forEach((c) => c.set(false)); const c = coll(TL({ icon: 'webhook', title: ti, desc: at, status: ok ? null : 'error' }), { open: true }); c.body.append(codeBlock(body, { lang, label: ok ? 'Request payload' : 'Response', wrap: true })); add(tr, c.el); cs.push(c); n = num; };
      const re = btn('Resend event', 'outline', 'sm'); const st = statusP(); s.w.append(ctl(re, st));
      re.onclick = async () => {
        re.disabled = true; st.textContent = 'Sending'; const l = TL({ icon: 'webhook', title: `Sending attempt ${n + 1}`, status: 'running' }); add(tr, l);
        await sleep(t, 1400); l.remove(); addAttempt([n + 1, new Date().toLocaleTimeString('en-GB'), true, `Attempt ${n + 1} delivered, 200 in 188 ms`, PAYLOAD, 'json']); re.disabled = false; st.textContent = `${n} attempts`;
      };
      for (const a of H) { await sleep(t, 1000); addAttempt(a); st.textContent = `${n} attempts`; }
      await sleep(t, 1500); await press(re, t);
    } });

  demos.push({ group: G, title: 'CSV Import Progress', kind: 'lib',
    desc: 'Parse and mapping rows settle, the rejected rows open onto a table with a download link, and the import line counts up 143 rows at a time until it reports its time.',
    async run(root, t) {
      const s = trStage(root, 'min-h-[460px]'); const tr = trace(); s.w.append(tr);
      await sleep(t, 300);
      const p1 = TL({ icon: 'file-spreadsheet', title: 'Parsing contacts-october.csv', status: 'running' }); add(tr, p1); await sleep(t, 800); p1.set({ title: 'Parsed contacts-october.csv', desc: '2,418 rows', status: null });
      const p2 = TL({ icon: 'arrow-left-right', title: 'Mapping columns', status: 'running' }); add(tr, p2); await sleep(t, 800); p2.set({ title: 'Mapped 8 of 9 columns', desc: '1 ignored', status: null });
      const rj = coll(TL({ icon: 'circle-alert', title: 'Rejected 14 invalid rows', status: 'error' }), { open: false }); add(tr, rj.el);
      rj.body.innerHTML = `<div class="flex flex-col gap-2">${table([['Row', 'w-14'], ['Field'], ['Problem']], [['12', '<code class="text-xs">email</code>', 'Missing'], ['87', '<code class="text-xs">phone</code>', 'Not a phone number'], ['233', '<code class="text-xs">email</code>', 'Invalid domain']])}<a href="#" onclick="return false" class="rui-btn self-start" data-v="link" data-s="xs">Download all 14 rows as CSV</a></div>`;
      await sleep(t, 400); rj.set(true);
      const im = TL({ icon: 'users', title: 'Importing 2,404 contacts', desc: '0 of 2,404', status: 'running' }); add(tr, im);
      const sr = mk('p', 'sr-only'); sr.setAttribute('role', 'status'); s.w.append(sr);
      await sleep(t, 500);
      for (let n = 0; n < 2404 && !t.dead;) { n = Math.min(n + 143, 2404); im.set({ desc: `${n.toLocaleString('en-US')} of 2,404` }); await sleep(t, 120); }
      im.set({ title: 'Imported 2,404 contacts', desc: 'in 2.1s', status: null }); sr.textContent = 'Imported 2404 contacts';
    } });

  demos.push({ group: G, title: 'Dependency Audit Fixes', kind: 'lib',
    desc: 'An audit lists advisories with severity badges; each opens onto its dependency path, and applying the fix swaps the row to a shield check with the reason it worked.',
    async run(root, t) {
      const ADV = [
        { id: 'CVE-2024-45296', pkg: 'path-to-regexp', ver: '0.1.7', sev: 'high', kind: 'ReDoS', issue: 'Backtracking regex in route parsing, fixed in 0.1.10', path: ['express 4.19.2', 'path-to-regexp 0.1.7'], fixed: ['express 4.20.0', 'path-to-regexp 0.1.10'], action: 'Upgrade express to 4.20.0', done: 'Upgraded express to 4.20.0', why: 'express 4.19.2 pins 0.1.7, so express itself has to move.' },
        { id: 'CVE-2024-4068', pkg: 'braces', ver: '3.0.2', sev: 'high', kind: 'Memory exhaustion', issue: 'No limit on input length, fixed in 3.0.3', path: ['lint-staged 15.2.2', 'micromatch 4.0.5', 'braces 3.0.2'], fixed: ['lint-staged 15.2.2', 'micromatch 4.0.5', 'braces 3.0.3'], action: 'Update the lockfile', done: 'Updated braces to 3.0.3', why: 'micromatch asks for ^3.0.2, which already allows 3.0.3.' },
        { id: 'CVE-2024-55565', pkg: 'nanoid', ver: '3.3.7', sev: 'moderate', kind: 'Predictable IDs', issue: 'Non-integer sizes weaken the output, fixed in 3.3.8', path: ['postcss 8.4.38', 'nanoid 3.3.7'], fixed: ['postcss 8.4.38', 'nanoid 3.3.8'], action: 'Update the lockfile', done: 'Updated nanoid to 3.3.8', why: 'postcss asks for ^3.3.7, which already allows 3.3.8.' },
      ];
      const s = trStage(root, 'min-h-[460px]'); const tr = trace(); s.w.append(tr);
      const fixed = new Set();
      const head = TL({ icon: 'package', title: 'Auditing 1,284 dependencies', status: 'running' }); add(tr, head);
      const paintHead = () => { const open = ADV.filter((a) => !fixed.has(a.id)); head.set({ title: 'Audited 1,284 dependencies', desc: open.length ? `${open.length} open, ${open.filter((a) => a.sev === 'high').length} high` : 'all fixed', status: null }); };
      await sleep(t, 1100); paintHead();
      const cs = {};
      const paint = (a) => {
        const c = cs[a.id]; const done = fixed.has(a.id);
        c.line.set({ iconHtml: I(done ? 'shield-check' : 'shield-alert'), title: done ? a.done : `${a.kind} in ${a.pkg} ${a.ver}`, extra: done ? '' : badge(a.sev, a.sev === 'high' ? 'destructive-light' : 'warning-light') });
        c.body.innerHTML = ''; const box = mk('div', 'flex flex-col gap-3'); box.append(mk('p', '', esc(a.issue) + '.'));
        const pt = trace(); pt.append(TL({ title: 'apps/web' })); (done ? a.fixed : a.path).forEach((x) => pt.append(TL({ icon: 'corner-down-right', title: `<code class="text-xs">${x}</code>` }))); box.append(pt);
        if (done) box.append(mk('p', '', esc(a.why)));
        else { const r = mk('div', 'flex items-center gap-3'); const fb = btn(a.action, 'outline', 'xs'); fb.onclick = () => { fixed.add(a.id); paint(a); paintHead(); }; c.fix = fb; r.append(fb, mk('code', 'text-xs', a.id)); box.append(r); }
        c.body.append(box);
      };
      for (const a of ADV) { await sleep(t, 380); cs[a.id] = coll(TL({})); add(tr, cs[a.id].el); paint(a); }
      for (const a of ADV) { await sleep(t, 700); cs[a.id].set(true); await sleep(t, 900); await press(cs[a.id].fix, t, 240); await sleep(t, 700); cs[a.id].set(false); }
    } });

  demos.push({ group: G, title: 'Review Comments in a Sheet', kind: 'lib',
    desc: 'A PR review leaves comments as trace rows; each opens a sheet with the flagged lines and a suggested diff, and applying it turns the row into a done check.',
    async run(root, t) {
      const F = [
        { id: 'a', kind: 'bug', title: 'Null user in getInvoice', fixed: 'Guarded the null user', file: 'lib/billing/invoice.ts', line: 42, expl: 'getUser returns null for a deleted account, and the export job runs for those too.', code: 'const user = await getUser(userId)\nreturn user.invoices.find((i) => i.id === id)', focus: 2, sug: 'const user = await getUser(userId)\nif (!user) throw new NotFoundError("user")\nreturn user.invoices.find((i) => i.id === id)', diff: { added: [2], removed: [] } },
        { id: 'b', kind: 'lock', title: 'Password in the error log', fixed: 'Dropped the password from the log', file: 'lib/auth/login.ts', line: 17, expl: 'Log lines are shipped to a third party and kept for 30 days.', code: 'logger.error("login failed", { email, password })', focus: 1, sug: 'logger.error("login failed", { email, password })\nlogger.error("login failed", { email })', diff: { added: [2], removed: [1] } },
      ];
      const s = trStage(root, 'min-h-[460px]'); const tr = trace(); s.w.append(tr);
      const res = {};
      const sheetWrap = mk('div', 'absolute inset-0 z-20 overflow-hidden'); sheetWrap.hidden = true; s.append(sheetWrap);
      const scrim = mk('div', 'absolute inset-0 bg-black/30 transition-opacity duration-300'); const sheet = mk('div', 'absolute inset-y-0 right-0 flex w-[min(100%,26rem)] flex-col gap-3 overflow-y-auto border-l border-border bg-background p-4 shadow-lg');
      sheet.setAttribute('role', 'dialog'); sheetWrap.append(scrim, sheet);
      const openSheet = (f, v) => {
        if (!v) { sheet.style.transform = 'translateX(100%)'; scrim.style.opacity = '0'; sheetWrap.hidden = true; return; }
        sheet.innerHTML = `<div class="flex flex-col gap-1.5"><div class="text-base font-medium text-foreground">${f.title}</div><div class="text-sm text-muted-foreground">${f.expl}</div></div>`;
        sheet.append(codeBlock(f.code, { lang: 'ts', ln: true, start: f.line - f.focus + 1, hlLines: [f.focus], label: `${f.file} at line ${f.line}` }), mk('p', 'text-sm text-muted-foreground', 'Suggested change'), codeBlock(f.sug, { lang: 'ts', diff: f.diff, wrap: true, label: 'Suggested change' }));
        const ft = mk('div', 'mt-auto flex gap-2'); const ap = btn('Apply suggestion', 'default', 'default'); const di = btn('Dismiss', 'outline', 'default');
        ap.onclick = () => resolve(f, 'applied'); di.onclick = () => resolve(f, 'dismissed'); ft.append(ap, di); sheet.append(ft); sheet.ap = ap;
        sheetWrap.hidden = false; sheet.style.transition = 'none'; sheet.style.transform = 'translateX(100%)'; scrim.style.opacity = '0';
        tick(() => { sheet.style.transition = `transform .35s ${EO}`; sheet.style.transform = 'none'; scrim.style.opacity = '1'; });
      };
      scrim.onclick = () => openSheet(null, false);
      const lines = {};
      const paintF = (f) => { const r = res[f.id]; lines[f.id].set({ iconHtml: I(r === 'applied' ? 'circle-check' : f.kind), title: r === 'applied' ? f.fixed : r === 'dismissed' ? `Dismissed: ${f.title}` : f.title, desc: `${f.file.split('/').pop()}:${f.line}` }); };
      const resolve = (f, r) => { res[f.id] = r; paintF(f); openSheet(null, false); cm.line.set({ desc: `${F.filter((x) => !res[x.id]).length} open` }); };
      await sleep(t, 300);
      const l1 = TL({ icon: 'git-pull-request-arrow', title: 'Reviewing 6 changed files', status: 'running' }); add(tr, l1);
      await sleep(t, 1300); l1.set({ title: 'Reviewed 6 changed files', desc: '+214 -38', status: null });
      const cm = coll(TL({ icon: 'message-square-text', title: 'Leaving comments', status: 'running' }), { open: true }); add(tr, cm.el); const cl = trace(); cm.body.append(cl);
      const trig = {};
      for (const f of F) { await sleep(t, 600); lines[f.id] = TL({}); paintF(f); const b = mk('button', 'rui-tlink'); b.type = 'button'; b.append(lines[f.id]); b.onclick = () => openSheet(f, true); add(cl, b); trig[f.id] = b; }
      cm.line.set({ title: `Left ${F.length} comments`, desc: `${F.length} open`, status: null });
      for (const f of F) { await sleep(t, 1000); trig[f.id].style.opacity = '.7'; await sleep(t, 180); trig[f.id].style.opacity = ''; openSheet(f, true); await sleep(t, 2200); await press(sheet.ap, t, 260); }
    } });

  demos.push({ group: G, title: 'Eval Run with Failures Filter', kind: 'lib',
    desc: 'Eval cases score in one by one against a 0.70 pass mark; failures open onto expected, got and judge, and the Failures only switch hides the passes.',
    async run(root, t) {
      const CASES = [['Unopened item within 30 days', 0.98], ['Damaged item refund', 0.31, 'A new jug or a 40% refund', 'A full refund once returned', 'Policy 3.1 keeps full refunds for items that do not work.'], ['Refund request in German', 0.92], ['Chargeback already opened', 0.18, 'Hand off to billing', 'Refunded on top of the dispute', 'Refunding during a chargeback pays the customer twice.']];
      const s = trStage(root, 'min-h-[460px]');
      const sw = mk('button', 'relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full border border-transparent bg-[var(--input)] transition-colors'); sw.type = 'button'; sw.setAttribute('role', 'switch'); sw.id = 'rui-fail-only';
      const knob = mk('span', 'pointer-events-none block size-3 rounded-full bg-background shadow-sm transition-transform'); sw.append(knob);
      const lab = mk('label', 'text-sm font-medium', 'Failures only'); lab.htmlFor = sw.id; const head = mk('div', 'flex items-center gap-2'); head.append(sw, lab); s.w.append(head);
      const tr = trace(); s.w.append(tr); let only = false; const passEls = [];
      const setSw = (v) => { only = v; sw.setAttribute('aria-checked', String(v)); sw.style.background = v ? 'var(--primary)' : ''; knob.style.transform = v ? 'translateX(10px)' : 'none'; passEls.forEach((e) => { e.hidden = v; }); };
      sw.onclick = () => setSw(!only); setSw(false);
      let firstFail = true;
      for (const [name, score, exp, got, judge] of CASES) {
        await sleep(t, 500); const pass = score >= 0.7;
        const l = TL({ icon: 'loader-circle', iconHtml: glyphRun(), title: `Scoring ${name}`, status: 'running' });
        const c = pass ? null : coll(l); add(tr, c ? c.el : l);
        for (let k = 1; k <= 6; k++) { l.set({ desc: (score * k / 6).toFixed(2) }); await sleep(t, 90); }
        if (pass) { l.set({ iconHtml: I('circle-check'), title: name, status: null }); passEls.push(l); }
        else { l.set({ iconHtml: I('circle-x'), title: `Failed: ${name}`, status: 'error' }); c.body.append(mk('dl', 'flex flex-col gap-1 text-xs', [['Expected', exp], ['Got', got], ['Judge', judge]].map(([k, v]) => `<div class="flex gap-3"><dt class="w-14 shrink-0">${k}</dt><dd class="min-w-0 text-foreground">${v}</dd></div>`).join(''))); if (firstFail) { c.set(true); firstFail = false; } }
      }
      await sleep(t, 400); const more = TL({ title: '44 more cases passed' }); add(tr, more); passEls.push(more);
      await sleep(t, 1500); await press(sw, t, 200); await sleep(t, 2200); await press(sw, t, 200);
    } });

  demos.push({ group: G, title: 'Access Check Rules', kind: 'lib',
    desc: 'Pick a member and a page and the policy rules evaluate in order: the first allow or deny decides, and every rule after it is marked as not reached.',
    async run(root, t) {
      const MEM = [['maria', 'Maria Lopez', 'viewer', true], ['sam', 'Sam Okafor', 'billing', false], ['priya', 'Priya Shah', 'admin', true]];
      const RES = [['billing', 'Billing settings', ['billing', 'admin'], false, []], ['keys', 'API keys', ['admin'], true, []], ['deck', 'Q3 board deck', ['admin'], false, ['maria']]];
      const RN = { viewer: 'Viewer', billing: 'Billing admin', admin: 'Admin' }; const PRE = { allow: 'Allowed: ', deny: 'Denied: ', pass: '', skipped: 'Not reached: ' };
      const VG = { deny: 'ban', allow: 'key-round', skipped: 'circle-dashed', pass: 'circle-check' };
      const evaluate = (mid, rid) => {
        const [mv, label, role, mfa] = MEM.find((m) => m[0] === mid); const [, rl, roles, needsMfa, shared] = RES.find((r) => r[0] === rid); const first = label.split(' ')[0];
        const checks = [`${first} is a member of Northwind`]; const vs = ['pass'];
        if (needsMfa) { checks.push(mfa ? `Needs 2FA, and ${first} has it on` : `Needs 2FA, and ${first} has it off`); vs.push(mfa ? 'pass' : 'deny'); }
        const sh = shared.includes(mv); checks.push(sh ? `Shared with ${first} directly` : `Not shared with ${first} directly`); vs.push(sh ? 'allow' : 'pass');
        const ok = roles.includes(role); checks.push(ok ? `The ${RN[role]} role can open ${rl}` : `Needs ${roles.map((r) => RN[r]).join(' or ')}, not ${RN[role]}`); vs.push(ok ? 'allow' : 'deny');
        const at = vs.findIndex((v) => v === 'allow' || v === 'deny');
        return { rules: checks.map((c, i) => ({ text: c, v: i > at ? 'skipped' : vs[i] })), allowed: vs[at] === 'allow', verdict: `${first} ${vs[at] === 'allow' ? 'can open' : 'cannot open'} ${rl}` };
      };
      const s = trStage(root, 'min-h-[440px]');
      const sel = (id, label, opts) => { const f = mk('div', 'flex min-w-0 flex-col gap-2'); f.innerHTML = `<label class="text-sm font-medium" for="${id}">${label}</label>`; const sl = mk('select', 'h-8 w-full min-w-0 rounded-md border border-[var(--input)] bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-[var(--ring)] dark:bg-[var(--input)]/30'); sl.id = id; opts.forEach(([v, l]) => { const o = mk('option', '', l); o.value = v; sl.append(o); }); f.append(sl); return [f, sl]; };
      const [f1, mSel] = sel('rui-acc-m', 'Member', MEM); const [f2, rSel] = sel('rui-acc-p', 'Page', RES);
      const grid = mk('div', 'grid grid-cols-2 gap-3'); grid.append(f1, f2); s.w.append(grid);
      const tr = trace(); s.w.append(tr); const c = coll(TL({}), { open: true }); tr.append(c.el); const rl = trace(); c.body.append(rl);
      const sr = mk('p', 'sr-only'); sr.setAttribute('role', 'status'); s.w.append(sr);
      let tok = 0;
      const run = async () => {
        const my = ++tok; const { rules, allowed, verdict } = evaluate(mSel.value, rSel.value); rl.innerHTML = '';
        c.line.set({ iconHtml: glyphRun(), title: 'Checking access', desc: `${rules.length} rules`, status: 'running' });
        for (const r of rules) {
          const l = TL({ iconHtml: glyphRun(), title: r.text, status: 'running' }); add(rl, l, 3); await sleep(t, 380); if (my !== tok) return;
          l.set({ iconHtml: I(VG[r.v]), title: PRE[r.v] ? PRE[r.v] + r.text[0].toLowerCase() + r.text.slice(1) : r.text, status: r.v === 'deny' ? 'error' : r.v === 'skipped' ? 'pending' : null });
        }
        c.line.set({ iconHtml: I(allowed ? 'key-round' : 'ban'), title: verdict, status: allowed ? null : 'error' }); sr.textContent = verdict;
      };
      mSel.onchange = run; rSel.onchange = run;
      await sleep(t, 300); await run();
      for (const [m, r] of [['sam', 'keys'], ['maria', 'deck']]) { await sleep(t, 1600); mSel.value = m; rSel.value = r; await run(); }
    } });

  demos.push({ group: G, title: 'Identity Check Needs a Document', kind: 'lib',
    desc: 'Verification steps settle, the sanctions screen finishes after a beat, and the rejected proof of address offers a request that turns the row into a pending wait.',
    async run(root, t) {
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      for (const [ic, ti, d] of [['badge-check', 'Verified the passport', 'chip and MRZ match'], ['user-check', 'Matched the selfie to the photo', '97% similar']]) { await sleep(t, 500); add(tr, TL({ icon: ic, title: ti, desc: d })); }
      const scr = TL({ icon: 'shield-check', title: 'Screening sanctions and PEP lists', status: 'running' }); add(tr, scr);
      const addr = coll(TL({ icon: 'map-pin', title: 'Rejected the proof of address', desc: 'too old', status: 'error' }), { open: true });
      const box = mk('div', 'flex flex-col items-start gap-3'); box.innerHTML = '<p class="text-pretty">The utility bill is from June 2, and policy needs one from the last 90 days.</p>';
      const req = btn('Request a new document', 'outline', 'xs'); box.append(req); addr.body.append(box);
      const sr = mk('p', 'sr-only'); sr.setAttribute('role', 'status'); s.w.append(sr);
      await sleep(t, 600); add(tr, addr.el);
      req.onclick = () => { addr.line.set({ title: 'Waiting for a new proof of address', desc: 'requested just now', status: 'pending' }); box.innerHTML = '<p class="text-pretty">Jordan was emailed a link to upload a recent one.</p>'; sr.textContent = 'New proof of address requested'; addr.trigger.focus({ preventScroll: true }); };
      await sleep(t, 1800); scr.set({ title: 'Screened sanctions and PEP lists', desc: 'no matches', status: null }); sr.textContent = 'Screening finished, no matches';
      await sleep(t, 1500); await press(req, t);
    } });

  demos.push({ group: G, title: 'DNS Verification', kind: 'lib',
    desc: 'Records to add sit in a copyable table; the DNS check runs, finds DMARC missing, and Check again re-runs it until the domain is ready to send.',
    async run(root, t) {
      const REC = [['spf', 'SPF', 'TXT', 'mail', 'v=spf1 include:_spf.mailer.dev ~all'], ['dkim', 'DKIM', 'CNAME', 'k1._domainkey.mail', 'k1.dkim.mailer.dev'], ['dmarc', 'DMARC', 'TXT', '_dmarc.mail', 'v=DMARC1; p=none; rua=mailto:dmarc@northwind.dev']];
      const s = trStage(root, 'min-h-[480px]'); const tr = trace(); s.w.append(tr);
      const add1 = coll(TL({ icon: 'list', title: 'Add 3 records at your DNS provider' }), { open: true });
      add1.body.innerHTML = table([['Type', 'w-14'], ['Name', 'w-24'], ['Value'], ['<span class="sr-only">Copy</span>', 'w-8']], REC.map(([id, l, ty, n, v]) => [ty, `<code class="block truncate text-xs">${n}</code>`, `<code class="block truncate text-xs" title="${esc(v)}">${esc(v)}</code>`, `<button type="button" class="rui-btn" data-v="ghost" data-s="icon-xs" data-copy="${esc(v)}" aria-label="Copy the ${l} value">${I('copy')}</button>`]), 'table-fixed');
      add1.body.querySelectorAll('[data-copy]').forEach((b) => { b.onclick = () => { clip(b.dataset.copy); b.innerHTML = I('check'); }; });
      add(tr, add1.el);
      const chk = coll(TL({ icon: 'search' }), { open: true }); const cl = trace(); chk.body.append(cl);
      const send = TL({ icon: 'send', title: 'Start sending from mail.northwind.dev', status: 'pending' });
      await sleep(t, 500); add(tr, chk.el); add(tr, send);
      const again = btn('Check DNS again', 'outline', 'sm'); const st = statusP(); s.w.append(ctl(again, st));
      const paint = (phase) => {
        const checking = phase === 'checking' || phase === 'rechecking'; const found = phase === 'partial' ? ['spf', 'dkim'] : phase === 'ready' ? REC.map((r) => r[0]) : [];
        chk.line.set({ title: checking ? 'Checking DNS for the records' : phase === 'ready' ? 'Verified all 3 records' : 'Found 2 of 3 records, DMARC is missing', status: checking ? 'running' : phase === 'partial' ? 'error' : null });
        cl.innerHTML = ''; REC.forEach(([id, l, , n]) => { const ok = found.includes(id); cl.append(TL({ title: checking ? `Look up ${l}` : ok ? `${l} resolves` : `${l} not found on ${n}`, status: checking ? 'pending' : ok ? null : 'error' })); });
        send.set({ title: phase === 'ready' ? 'Ready to send from mail.northwind.dev' : 'Start sending from mail.northwind.dev', status: phase === 'ready' ? null : 'pending' });
        again.disabled = phase !== 'partial'; st.textContent = checking ? 'Checking' : phase === 'partial' ? 'DNS changes can take up to an hour' : 'Domain verified';
      };
      again.onclick = async () => { paint('rechecking'); await sleep(t, 1600); paint('ready'); };
      paint('checking'); await sleep(t, 1600); paint('partial');
      await sleep(t, 1800); await press(again, t);
    } });

  demos.push({ group: G, title: 'Video Encode Pipeline', kind: 'lib',
    desc: 'Three renditions encode in parallel at different speeds with live percentages; once all finish the group folds and thumbnails and CDN publish run in turn.',
    async run(root, t) {
      const R = [['2160p HEVC', 4, '1.4 GB'], ['1080p H.264', 7, '612 MB'], ['720p H.264', 11, '318 MB']];
      const s = trStage(root); const tr = trace(); s.w.append(tr);
      await sleep(t, 300); add(tr, TL({ icon: 'cloud-upload', title: 'Uploaded launch-keynote.mov', desc: '1.8 GB' }));
      const enc = coll(TL({ icon: 'video', title: 'Encoding 3 renditions', desc: '0 of 3', status: 'running' }), { open: true }); add(tr, enc.el); const el = trace(); enc.body.append(el);
      const ls = R.map(([l]) => { const x = TL({ title: `Encoding ${l}`, desc: '0%', status: 'running' }); el.append(x); return x; });
      const th = TL({ icon: 'image', title: 'Generate thumbnails', status: 'pending' }); const pb = TL({ icon: 'globe', title: 'Publish to the CDN', status: 'pending' }); add(tr, th); add(tr, pb);
      const prog = R.map(() => 0);
      while (prog.some((p) => p < 100) && !t.dead) {
        await sleep(t, 160); R.forEach(([l, sp, size], i) => { if (prog[i] >= 100) return; prog[i] = Math.min(100, prog[i] + sp); ls[i].set(prog[i] >= 100 ? { title: `Encoded ${l}`, desc: size, status: null } : { desc: `${prog[i]}%` }); });
        enc.line.set({ desc: `${prog.filter((p) => p >= 100).length} of 3` });
      }
      enc.line.set({ title: 'Encoded 3 renditions', status: null }); enc.set(false);
      th.set({ title: 'Generating 24 thumbnails', status: 'running' }); await sleep(t, 1200); th.set({ title: 'Generated 24 thumbnails', status: null });
      pb.set({ title: 'Publishing to the CDN', status: 'running' }); await sleep(t, 1200); pb.set({ title: 'Published to the CDN', status: null });
    } });

  /* ================================================ Pro blocks (rebuilt) */
  const PRO = ' (Pro block rebuilt from its public preview; source is license-gated.)';
  const ib = (name, label, v = 'ghost', s = 'icon-sm') => { const b = btn('', v, s, name); b.setAttribute('aria-label', label); b.title = label; return b; };
  const ibh = (name, label, s = 'icon-sm') => `<button type="button" class="rui-btn" data-v="ghost" data-s="${s}" aria-label="${label}" title="${label}">${I(name)}</button>`;
  const mono = (s, cls = '') => `<span class="min-w-0 truncate font-mono text-xs text-muted-foreground ${cls}">${s}</span>`;
  const toolChip = (s) => `<span class="shrink-0 rounded border border-border bg-muted px-1 font-mono text-[11px] leading-4 text-foreground">${s}</span>`;
  const blockStage = (root, h = 'min-h-[520px]', w = 'max-w-xl') => stage(root, h, `${w} gap-4`);
  function vpBox(h, cls = 'gap-5 p-4') {
    const v = mk('div', 'rui-vp'); v.style.height = h + 'px'; v.style.flex = 'none';
    const c = mk('div', `flex min-h-full flex-col justify-end ${cls}`); v.append(c); v.c = c;
    v.stick = () => { v.scrollTop = v.scrollHeight; }; return v;
  }
  async function streamStick(v, node, text, t, ms = 24) {
    if (REDUCE) { node.append(document.createTextNode(text)); v.stick(); return; }
    for (const w of words(text)) { node.append(document.createTextNode(w)); if (w.trim()) { v.stick(); await t.sleep(ms * rnd(0.6, 1.4)); } if (t.dead) return; }
  }
  async function mdStick(v, node, text, t, ms = 24) { const id = t.every(60, () => v.stick()); await md(node, text, t, ms); t.stop(id); v.stick(); }
  function aiMsg(av = true) {
    const r = mk('div', 'flex min-w-0 gap-3');
    if (av) r.innerHTML = `<span class="grid size-7 shrink-0 place-items-center rounded-full bg-muted">${I('sparkles', 'size-3.5 text-muted-foreground')}</span>`;
    r.body = mk('div', 'flex min-w-0 flex-1 flex-col gap-3 pt-0.5 text-sm leading-relaxed'); r.append(r.body); return r;
  }
  const userMsg = (text, av, variant = 'muted') => { const r = row('end'); if (av) avSlot(r, avatar(av, 'MP', 'Maya Perez', '', 'size-7')); r.content.append(bubble(variant, esc(text), 'end')); return r; };
  function composer({ placeholder = 'Ask anything', tools = '', right = '', top = '', cls = '', send = 'arrow-up' } = {}) {
    const el = mk('div', 'overflow-hidden rounded-xl border border-border bg-[var(--card)] shadow-xs ' + cls);
    el.innerHTML = `${top}<div class="px-3 pt-2.5"><textarea rows="1" aria-label="${placeholder}" class="block h-6 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground" placeholder="${placeholder}"></textarea></div><div class="flex items-center gap-1 px-2 pt-1 pb-2"><div class="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">${tools}</div><div class="flex shrink-0 items-center gap-1">${right}<button type="button" class="rui-btn rui-send rounded-full" data-v="default" data-s="icon-sm" aria-label="Send">${I(send)}</button></div></div>`;
    el.ta = el.querySelector('textarea'); el.send = el.querySelector('.rui-send'); return el;
  }
  async function typeTa(ta, text, t, ms = 30) { ta.value = ''; const box = ta.closest('.rounded-xl, .rui-fpanel'); box?.classList.add('is-focus'); for (const ch of text) { if (t.dead) return; ta.value += ch; await sleep(t, ms); } box?.classList.remove('is-focus'); }
  const thinking = (label = 'Thinking') => `<span class="inline-flex items-center gap-2 text-sm text-muted-foreground"><span class="flex items-center gap-1">${[0, 0.15, 0.3].map((d) => `<span class="size-1.5 rounded-full bg-muted-foreground/60 ${REDUCE ? '' : 'rui-pulse'}" style="animation-delay:${d}s;animation-duration:1.2s"></span>`).join('')}</span><span class="rui-shimmer">${label}</span></span>`;
  const pageSkel = (rows = 8, cls = '') => `<div class="flex flex-col gap-3 ${cls}"><div class="rui-skel h-4 w-28"></div><div class="rui-skel h-3 w-44"></div><div class="mt-2 grid grid-cols-3 gap-2"><div class="rui-skel h-14"></div><div class="rui-skel h-14"></div><div class="rui-skel h-14"></div></div>${Array.from({ length: rows }, (_, i) => `<div class="flex items-center gap-2"><div class="rui-skel size-5 rounded-full"></div><div class="rui-skel h-2.5" style="width:${30 + (i * 17) % 35}%"></div><div class="rui-skel ml-auto h-2.5 w-8"></div></div>`).join('')}</div>`;
  const disclaimer = (s = 'Research Chat can make mistakes. Check important info.') => mk('p', 'text-center text-[11px] text-muted-foreground', s);

  /* ------------------------------------------------- agent-activity-1 */
  function actRow(p) {
    const el = mk('div', 'flex items-start gap-2.5 px-3 py-2 text-sm'); el.p = p;
    el.set = (q = {}) => {
      Object.assign(p, q); const st = p.status;
      const icon = p.iconHtml || (st === 'running' ? spin('size-4 text-muted-foreground') : st === 'pending' ? I('circle-dashed', 'size-4 text-muted-foreground') : I(p.icon || 'circle-check', 'size-4 text-muted-foreground'));
      el.className = `flex items-start gap-2.5 px-3 py-2 text-sm ${p.bg || ''}`;
      el.innerHTML = `<span class="mt-0.5 flex shrink-0">${icon}</span><div class="min-w-0 flex-1"><div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">${p.tool ? toolChip(p.tool) : ''}<span class="${st === 'pending' ? 'text-muted-foreground' : 'text-foreground'} ${st === 'running' ? 'rui-shimmer' : ''}">${p.title}</span>${p.badge || ''}${p.mono ? mono(p.mono) : ''}</div>${p.sub ? `<div class="mt-0.5 text-xs text-muted-foreground">${p.sub}</div>` : ''}<div class="rui-x"></div></div>${p.right != null ? `<span class="shrink-0 text-xs text-muted-foreground tabular-nums">${p.right}</span>` : ''}`;
      if (p.extra) el.querySelector('.rui-x').append(p.extra);
      return el;
    };
    return el.set();
  }
  function frame(title) {
    const f = mk('div', 'rui-frame w-full');
    const head = mk('div', 'flex min-w-0 items-center gap-2 px-3 py-1.5'); head.innerHTML = `<span class="truncate text-sm font-semibold">${title}</span><span class="rui-st flex"></span><span class="flex-1"></span>`; head.append(ib('ellipsis', 'More actions', 'ghost', 'icon-xs'));
    const panel = mk('div', 'rui-fpanel divide-y divide-border'); const foot = mk('div', 'flex min-w-0 flex-wrap items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground');
    f.append(head, panel, foot); f.head = head; f.panel = panel; f.foot = foot; f.status = (html) => { head.querySelector('.rui-st').innerHTML = html; }; return f;
  }
  demos.push({ group: G, title: 'Agent Run with Approval Gates', kind: 'lib',
    desc: 'A run console that stops for you: it asks a question you answer inline, then waits on a high-impact approval before the gated steps run.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[500px]', 'max-w-lg');
      const f = frame('Reproduce webhook failure'); s.w.append(f); f.status(badge('Running', 'primary-light'));
      let sec = 0; const clock = () => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; let step = 0;
      const foot = () => { f.foot.innerHTML = `<span>Step ${step} of 9</span>${dotSep}<span class="tabular-nums">${clock()}</span>`; };
      const tick1 = t.every(REDUCE ? 1000 : 260, () => { sec++; foot(); }); foot();
      const DONE = [['Traced the failing event', 'charge.refunded', '0:08'], ['41 events queued', 'events', '0:03', badge('Check', 'warning-light'), '39 still pending, 2 already past the retry window'], ['Read 4 pages', 'stripe.com/docs/webhooks', '0:06'], ['Reproduced the 500', 'stripe-webhook.test.ts', '0:12']];
      for (const [ti, m, r, b, sub] of DONE) { step++; const x = actRow({ title: ti.replace(/^(Traced|Read|Reproduced)/, (w) => ({ Traced: 'Tracing', Read: 'Reading', Reproduced: 'Reproducing' }[w])), mono: m, status: 'running' }); add(f.panel, x); await sleep(t, 800); x.set({ title: ti, status: null, right: r, badge: b, sub }); }
      step++; f.status(badge('Needs you', 'warning-light'));
      const ig = mk('div', 'rui-input mt-2 h-8 pe-1'); const inp = mk('input'); inp.placeholder = 'Type your answer'; inp.setAttribute('aria-label', 'Answer'); const send = btn('Send', 'secondary', 'xs'); ig.append(inp, send);
      const q = actRow({ iconHtml: I('circle-help', 'size-4 text-[var(--success)]'), title: 'Needs your answer', mono: 'src/api/stripe-webhook.ts', sub: '<span class="text-sm">The same guard covers disputes. Fix both branches, or refunds only?</span>', extra: ig, bg: 'bg-muted/40' }); add(f.panel, q);
      const pend = [['Editing the refund branch', 'src/api/stripe-webhook.ts'], ['Needs your approval', 'webhook-consumer', 'fly'], ['scale_app', 'webhook-consumer', 'fly'], ['create_issue', 'engineering backlog', 'linear']].map(([ti, m, tool]) => { const x = actRow({ title: ti, mono: m, tool, status: 'pending' }); f.panel.append(x); return x; });
      await sleep(t, 1000); ig.classList.add('is-focus'); for (const ch of 'Both branches') { inp.value += ch; await sleep(t, 45); } await press(send, t, 220, false);
      q.set({ iconHtml: null, title: 'Answered: both branches', sub: '', extra: null, bg: '', right: '0:09' }); f.status(badge('Running', 'primary-light'));
      step++; pend[0].set({ status: 'running' }); await sleep(t, 1300); pend[0].set({ status: null, title: 'Edited the refund branch', right: '0:14' });
      step++; f.status(badge('Needs you', 'warning-light'));
      const acts = mk('div', 'mt-2 flex flex-wrap gap-2'); const ap = btn('Approve', 'default', 'xs', 'check'); acts.append(ap, btn('Revise', 'outline', 'xs'), btn('Deny', 'outline', 'xs'));
      pend[1].set({ status: null, iconHtml: I('shield-alert', 'size-4 text-[var(--destructive)]'), badge: badge('High impact', 'destructive-light'), sub: 'Scales webhook-consumer from 2 to 6 machines.', extra: acts });
      await sleep(t, 1700); await press(ap, t, 260, false);
      pend[1].set({ iconHtml: null, title: 'Approved by you', badge: '', sub: '', extra: null, right: '0:03' }); f.status(badge('Running', 'primary-light'));
      for (const [i, r] of [[2, '0:05'], [3, '0:02']]) { step++; pend[i].set({ status: 'running' }); await sleep(t, 1000); pend[i].set({ status: null, right: r }); }
      t.stop(tick1); f.status(badge('Done', 'success-light')); foot();
    } });

  /* ------------------------------------------------- agent-activity-2 */
  demos.push({ group: G, title: 'Live Agent Run Feed', kind: 'lib',
    desc: 'Narrates a run as it works, each step naming the file, command or query it touched; Summary, Detailed and Raw views re-render the same feed.' + PRO,
    async run(root, t) {
      const STEPS = [
        ['sparkles', 'Thinking', 'Thought for 8s', 'the 500 on charge.refunded', '8.0s', 'reasoning'],
        ['file-text', 'Reading src/api/stripe-webhook.ts', 'Read 412 lines', 'src/api/stripe-webhook.ts', '5.0s', 'read_file'],
        ['code', 'Searching handlers', '6 files, 2 of them handlers', 'grep -rn "charge.refunded" src', '2.0s', 'run_command'],
        ['database', 'Querying events', '41 rows in 320ms', "events where type = 'charge.refunded'", '320ms', 'query_db'],
        ['pencil', 'Editing the webhook', '+12 -3 in the webhook', 'src/api/stripe-webhook.ts', '9.0s', 'edit_file'],
        ['code', 'Running tests', 'Exit 0 in 12.4s', 'pnpm test src/api/__tests__/stripe-webhook.test.ts', '12.4s', 'run_command'],
        ['pencil', 'Editing the worker', '+8 -1 in the worker', 'src/queue/events-worker.ts', '6.0s', 'edit_file'],
        ['link', 'Creating a Linear issue', 'Created HAL-482', 'engineering backlog', '2.0s', 'linear.create_issue', 'linear'],
      ];
      const s = blockStage(root, 'min-h-[520px]', 'max-w-lg');
      const card = mk('div', 'rui-card w-full overflow-hidden'); s.w.append(card);
      const head = mk('div', 'flex min-w-0 items-center gap-3 border-b border-border px-3 py-3');
      head.innerHTML = `${avatar(AV.viewer, 'JW', 'Jonas Weber')}<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="truncate text-sm font-medium">Fix Refund Webhook</span><span class="rui-st flex"></span></div><div class="flex items-center gap-1.5 text-xs text-muted-foreground">Jonas Weber${dotSep}Started 14:02</div></div>`;
      const tabs = mk('div', 'rui-tabs h-7 w-auto'); const VIEWS = ['Summary', 'Detailed', 'Raw']; let view = 'Summary';
      const tb = VIEWS.map((v) => { const b = mk('button', 'rui-tab px-2 text-xs', v); b.type = 'button'; b.onclick = () => { view = v; paint(); }; tabs.append(b); return b; });
      head.append(tabs); card.append(head);
      const list = mk('div', 'flex flex-col gap-0.5 px-2 py-2'); card.append(list);
      const foot = mk('div', 'flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground'); const fl = mk('span', 'min-w-0 flex-1 truncate'); const act = btn('Stop', 'outline', 'xs', 'square'); foot.append(fl, act); card.append(foot);
      const st = head.querySelector('.rui-st'); let n = 0; let running = true;
      const paint = () => {
        tb.forEach((b, i) => b.setAttribute('aria-selected', String(VIEWS[i] === view)));
        list.innerHTML = '';
        if (view === 'Raw') {
          const pre = mk('pre', 'overflow-x-auto rounded-md bg-muted/50 px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground');
          pre.textContent = STEPS.slice(0, n).map(([, , , m, d, tool], i) => `14:02:${String(8 + i * 5).padStart(2, '0')}  ${tool.padEnd(19)} ${d.padStart(6)}  ${m}`).join('\n') + (running && n < STEPS.length ? `\n14:02:${String(8 + n * 5).padStart(2, '0')}  ${STEPS[n][5].padEnd(19)}    ...` : '');
          list.append(pre); return;
        }
        STEPS.forEach(([ic, run, done, m, d, tool, chip], i) => {
          if (i > n || (i === n && !running)) return; const live = i === n;
          const r = mk('div', 'flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1.5 text-sm');
          r.innerHTML = `<span class="flex shrink-0 text-muted-foreground">${live ? spin('size-4') : I(ic)}</span><span class="flex min-w-0 flex-1 flex-col"><span class="flex min-w-0 items-center gap-2">${chip ? toolChip(chip) : ''}<span class="shrink-0 ${live ? 'rui-shimmer text-muted-foreground' : 'text-foreground'}">${live ? run : done}</span>${mono(m)}</span>${view === 'Detailed' && !live ? `<span class="font-mono text-[11px] text-muted-foreground/70">${tool}</span>` : ''}</span><span class="shrink-0 text-xs text-muted-foreground tabular-nums">${live ? '' : d}</span>`;
          list.append(r);
        });
        if (n >= STEPS.length) list.insertAdjacentHTML('beforeend', `<div class="flex items-center gap-2 px-1.5 py-1.5 text-sm"><span class="flex text-muted-foreground">${I('check')}</span><span class="text-foreground">Run complete</span><span class="flex items-center gap-1.5 text-xs text-muted-foreground">8 steps${dotSep}44.7s</span></div>`);
        if (!running && n < STEPS.length) list.insertAdjacentHTML('beforeend', `<div class="flex items-center gap-2 px-1.5 py-1.5 text-sm text-muted-foreground line-through">${I('circle-stop')}<span>${STEPS.length - n} steps cancelled</span></div>`);
      };
      act.onclick = () => { running = false; st.innerHTML = badge('Stopped', 'warning-light'); act.innerHTML = `${I('refresh-cw')}<span>Rerun</span>`; paint(); };
      st.innerHTML = badge('Running', 'primary-light');
      for (n = 0; n < STEPS.length && running; n++) {
        const files = new Set(STEPS.slice(0, n).filter((x) => x[0] === 'pencil').map((x) => x[3])).size; const tools = new Set(STEPS.slice(0, n).map((x) => x[5])).size;
        fl.innerHTML = `${files} files touched · ${tools} tools called`; paint();
        if (n === 4) { await sleep(t, 500); await press(tb[2], t, 200); await sleep(t, 1500); }
        if (n === 6) { await press(tb[0], t, 200); }
        await sleep(t, 800);
      }
      if (!running) return;
      fl.innerHTML = '2 files touched · 4 tools called'; paint(); st.innerHTML = badge('Done', 'success-light'); act.innerHTML = `${I('refresh-cw')}<span>Rerun</span>`; act.onclick = null;
    } });

  /* ------------------------------------------------- agent-activity-3 */
  demos.push({ group: G, title: 'Research Timeline', kind: 'lib',
    desc: 'How an agent reached its answer: the search, the sources it reviewed with publisher marks, the repo files it checked, then a confidence-rated answer, landing live.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[500px]', 'max-w-md');
      const top = mk('div', 'flex items-center gap-2 text-sm text-muted-foreground', `${spin('size-4')}<span class="rui-shimmer">Researching</span>`); s.w.append(top);
      const tl = mk('div', 'relative flex flex-col gap-4 ps-6'); tl.innerHTML = '<span class="absolute top-2 bottom-2 left-[5px] w-px bg-border"></span>'; s.w.append(tl);
      const step = (title, count) => { const it = mk('div', 'relative flex flex-col gap-2'); it.innerHTML = `<span class="rui-dot absolute top-1 -left-6 grid size-[11px] place-items-center rounded-full border border-border bg-background"></span><div class="flex items-center gap-2 text-sm font-medium">${title}<span class="rui-n"></span></div>`; add(tl, it); it.count = (n) => { it.querySelector('.rui-n').innerHTML = n ? badge(String(n), 'outline', 'h-4 min-w-4 rounded-full px-1 text-[10px]') : ''; }; if (count) it.count(count); return it; };
      await sleep(t, 300);
      const s1 = step('Searching'); const box = mk('div', 'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm', `${I('search', 'size-4 text-muted-foreground')}<span class="rui-q min-w-0 truncate"></span>`); s1.append(box);
      for (const ch of 'stripe webhook 500 on charge.refunded') { box.querySelector('.rui-q').textContent += ch; await sleep(t, 28); }
      await sleep(t, 400);
      const s2 = step('Reviewing sources'); const sl = mk('div', 'flex flex-col rounded-xl border border-border p-1'); s2.append(sl);
      const SRCS = [['Retry behaviour for failed webhook endpoints', 'Stripe', 'https://stripe.com'], ['charge.refunded double delivery in stripe-node', 'GitHub', 'https://github.com'], ['Function timeouts on long running handlers', 'Vercel', 'https://vercel.com'], ['Statement timeouts on long transactions', 'Supabase', 'https://supabase.com']];
      for (let i = 0; i < SRCS.length; i++) { const [ti, pub, url] = SRCS[i]; add(sl, mk('div', 'flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50', `<span class="grid size-5 shrink-0 place-items-center rounded border border-border text-[10px] text-muted-foreground tabular-nums">${i + 1}</span><span class="min-w-0 flex-1 truncate">${ti}</span><span class="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground @sm:flex">${h.favicon ? h.favicon(url, 'size-4') : ''}${pub}</span>`), 3); s2.count(i + 1); await sleep(t, 450); }
      const s3 = step('Checking the repo'); const fl = mk('div', 'flex flex-col rounded-xl border border-border p-1'); s3.append(fl);
      for (const [p, l] of [['src/api/stripe-webhook.ts', '412 lines'], ['src/queue/events-worker.ts', '146 lines']]) { add(fl, mk('div', 'flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5', `${I('file-text', 'size-4 shrink-0 text-muted-foreground')}${mono(p, 'flex-1 text-foreground')}<span class="shrink-0 text-xs text-muted-foreground">${l}</span>`), 3); s3.count(fl.children.length); await sleep(t, 500); }
      const s4 = step(`Answer ${badge('High confidence', 'success-light')}`); const p = mk('p', 'text-sm leading-relaxed text-foreground'); s4.append(p);
      await stream(p, 'The handler acknowledges after the write, so a refund write that hits the statement timeout throws a 500 and Stripe retries it.', t, 34);
      top.innerHTML = `${I('check', 'size-4 text-[var(--success)]')}<span>Read 4 sources and 2 files</span>`; appear(top, 2);
    } });

  /* ------------------------------------------------- agent-activity-4 */
  demos.push({ group: G, title: 'MCP Call Table', kind: 'lib',
    desc: 'Every tool call in a run attributed to its MCP server: rows stream in over skeletons, a denied call names the scope it lacked and can be granted, a dropped server keeps what it returned.' + PRO,
    async run(root, t) {
      const ROWS = [
        ['postgres-mcp', '#00bb7f', 'execute', 'denied', 'Needs <code class="font-mono">tables:write</code>', '14:06'],
        ['mcp.sentry.dev', '#737373', 'list_issues', 'dropped', '3 issues kept', '14:08'],
        ['mcp.linear.app', '#8e51ff', 'create_issue', 'flight', 'In flight', '14:10'],
        ['github-mcp-server', '#00bb7f', 'search_code', 'ok', '6 files matched charge.refunded', '14:02'],
        ['github-mcp-server', '#00bb7f', 'get_file_contents', 'ok', 'src/api/stripe-webhook.ts, 412 lines', '14:03'],
        ['postgres-mcp', '#00bb7f', 'query', 'ok', '41 rows from events', '14:05'],
      ];
      const s = blockStage(root, 'min-h-[440px]', 'max-w-2xl');
      const head = mk('div', 'flex flex-wrap items-center gap-2'); head.innerHTML = '<span class="text-sm font-semibold">6 calls across 5 servers</span><span class="rui-den flex"></span><span class="flex-1"></span>';
      const tg = mk('div', 'inline-flex rounded-md border border-border p-0.5 text-xs'); let filter = 'all';
      const fb = [['all', 'All'], ['denied', 'Denied only']].map(([v, l]) => { const b = mk('button', 'rounded px-2 py-1 font-medium transition-colors', l); b.type = 'button'; b.onclick = () => { filter = v; paintF(); }; tg.append(b); return b; });
      head.append(tg); s.w.append(head);
      const wrap = mk('div', 'w-full overflow-x-auto'); const tbl = mk('table', 'w-full min-w-[520px] text-sm');
      tbl.innerHTML = '<thead><tr class="border-b border-border text-left"><th class="h-9 px-2 font-medium">Server</th><th class="px-2 font-medium">Tool</th><th class="px-2 font-medium">Result</th><th class="px-2 font-medium">Time</th></tr></thead>';
      const tbody = mk('tbody'); tbl.append(tbody); wrap.append(tbl); s.w.append(wrap);
      const note = mk('p', 'flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground', `<code class="font-mono">mcp.slack.com</code> received nothing${dotSep}Timing lives in AI settings${dotSep}Payloads open in the tool call view`); s.w.append(note);
      let denied = 1; const den = head.querySelector('.rui-den'); const paintDen = () => { den.innerHTML = denied ? badge(`${denied} denied`, 'destructive-light') : badge('0 denied', 'success-light'); };
      const trs = ROWS.map(() => { const r = mk('tr', 'border-b border-border last:border-0'); r.innerHTML = `<td class="px-2 py-2.5"><div class="rui-skel h-3 w-28"></div></td><td class="px-2"><div class="rui-skel h-3 w-20"></div></td><td class="px-2"><div class="rui-skel h-3 w-36"></div></td><td class="px-2"><div class="rui-skel h-3 w-10"></div></td>`; tbody.append(r); return r; });
      const res = (st, txt) => st === 'denied' ? `<span class="flex items-center gap-2">${badge('Denied', 'destructive-light')}<span class="text-xs text-muted-foreground">${txt}</span><button type="button" class="rui-btn rui-grant" data-v="outline" data-s="xs">Grant</button></span>` : st === 'dropped' ? `<span class="flex items-center gap-2">${badge('Dropped 14:09', 'outline')}<span class="text-xs text-muted-foreground">${txt}</span></span>` : `<span class="text-xs text-muted-foreground">${txt}</span>`;
      const ico = (st) => st === 'denied' ? I('shield-alert', 'size-4 text-[var(--destructive)]') : st === 'flight' ? spin('size-4 text-muted-foreground') : I('check', 'size-4 text-muted-foreground');
      const fill = (i, st, txt) => { const [sv, col, tool, , , tm] = ROWS[i]; trs[i].dataset.st = st; trs[i].innerHTML = `<td class="px-2 py-2.5"><span class="flex items-center gap-2"><span class="size-1.5 shrink-0 rounded-full" style="background:${col}"></span>${mono(sv, 'text-foreground')}</span></td><td class="px-2"><span class="flex items-center gap-2">${ico(st)}${mono(tool, 'text-foreground')}</span></td><td class="px-2">${res(st, txt)}</td><td class="px-2 text-xs tabular-nums">${tm}</td>`; const g = trs[i].querySelector('.rui-grant'); if (g) g.onclick = () => grant(i); };
      const paintF = () => { fb.forEach((b, k) => { const on = (k === 0) === (filter === 'all'); b.className = `rounded px-2 py-1 font-medium transition-colors ${on ? 'bg-muted text-foreground' : 'text-muted-foreground'}`; b.setAttribute('aria-pressed', String(on)); }); trs.forEach((r) => { r.hidden = filter === 'denied' && r.dataset.st !== 'denied'; }); };
      const grant = async (i) => { fill(i, 'flight', 'Granted <code class="font-mono">tables:write</code>, retrying'); denied = 0; paintDen(); paintF(); await sleep(t, 1300); fill(i, 'ok', '1 row updated in refunds'); };
      paintDen(); paintF();
      await sleep(t, 700);
      for (let i = 0; i < ROWS.length; i++) { fill(i, ROWS[i][3], ROWS[i][4]); appear(trs[i], 2, 220); await sleep(t, 320); }
      await sleep(t, 1300); fill(2, 'ok', 'Created HAL-482'); appear(trs[2], 0, 200);
      await sleep(t, 1000); await press(fb[1], t, 200); await sleep(t, 1300);
      await press(trs[0].querySelector('.rui-grant'), t, 240); await sleep(t, 1700); await press(fb[0], t, 200);
    } });

  /* ------------------------------------------------- agent-activity-5 */
  demos.push({ group: G, title: 'Run Outcome Report', kind: 'lib',
    desc: 'A finished task settles row by row into done, failed or skipped with the reason behind each; Grant fixes the missing scope and a scoped retry finishes the rest.' + PRO,
    async run(root, t) {
      const OUT = [
        ['Reproduce the 500 on charge.refunded', 'done', '<code class="font-mono">pnpm test src/api/__tests__/stripe-webhook.test.ts</code>', '2m 28s'],
        ['Patch the refund branch in stripe-webhook.ts', 'done', 'Nothing checked this', '1m 32s', badge('Unsupported', 'outline')],
        ['Drain the 41 queued events', 'failed', 'Stripe returned 429 on the replay endpoint. The limit resets in 60s', '31s'],
        ['Restart the events worker', 'skipped', 'Waiting on the queue drain above', '0s'],
        ['File the regression in Linear', 'failed', 'A workspace admin has to grant the scope. A retry alone will fail again.', '12s', '', 1],
      ];
      const s = blockStage(root, 'min-h-[460px]', 'max-w-lg');
      const f = frame('Reproduce webhook failure'); s.w.append(f); f.status(badge('Running', 'primary-light')); f.head.querySelector('.flex-1').classList.add('order-1'); f.head.querySelector('.rui-st').classList.add('order-2'); f.head.lastElementChild.classList.add('order-3');
      const BADGE = { done: badge('Done', 'success-light'), failed: badge('Failed', 'destructive-light'), skipped: badge('Skipped', 'warning-light') };
      const ICON = { done: I('check', 'size-4 text-[var(--success)]'), failed: I('x', 'size-4 text-[var(--destructive)]'), skipped: I('circle-dashed', 'size-4 text-muted-foreground') };
      const rows = []; const state = OUT.map(() => 'running');
      const retry = btn('Retry 2 failed', 'default', 'xs'); const keep = btn('Keep what succeeded', 'outline', 'xs'); const grp = mk('div', 'flex'); retry.classList.add('rounded-e-none'); keep.classList.add('rounded-s-none', 'border-s-0'); grp.append(retry, keep);
      const sum = mk('span', 'ms-auto tabular-nums');
      const paintFoot = () => { const ok = state.filter((x) => x === 'done').length; const fail = state.filter((x) => x === 'failed').length; retry.innerHTML = `<span>Retry ${fail} failed</span>`; retry.disabled = !fail; sum.innerHTML = `${state.filter((x) => x !== 'running').length} settled, ${ok} succeeded · ran 4m 43s`; };
      const paintRow = (i) => {
        const [ti, , sub, d, extraBadge, needsGrant] = OUT[i]; const st = state[i];
        let extra = null; if (needsGrant && st === 'failed') { extra = mk('div', 'mt-1.5'); const g = btn('Grant issues:create', 'outline', 'xs'); g.onclick = () => { OUT[i][5] = 0; OUT[i][2] = 'Scope granted. The retry can file it now.'; paintRow(i); }; extra.append(g); rows[i].grant = g; }
        rows[i].set({ iconHtml: st === 'running' ? spin('size-4 text-muted-foreground') : ICON[st], title: ti, status: st === 'running' ? 'running' : null, badge: st === 'running' ? '' : BADGE[st] + (extraBadge || ''), sub: st === 'running' ? '' : (sub.includes('<code') ? sub.replace('<code', '<code class="text-foreground/80"').replace('class="font-mono"', '') : sub), right: st === 'running' ? '' : d, extra });
      };
      OUT.forEach((o, i) => { rows[i] = actRow({ title: o[0] }); f.panel.append(rows[i]); paintRow(i); });
      f.foot.append(grp, sum); paintFoot();
      const finals = ['done', 'done', 'failed', 'skipped', 'failed'];
      for (let i = 0; i < OUT.length; i++) { await sleep(t, 700); state[i] = finals[i]; paintRow(i); appear(rows[i], 2, 200); paintFoot(); }
      f.status(badge('Completed with issues', 'warning-light'));
      retry.onclick = async () => {
        const idx = state.map((x, i) => (x === 'failed' || x === 'skipped' ? i : -1)).filter((i) => i >= 0);
        f.status(badge('Retrying', 'primary-light'));
        for (const i of idx) { state[i] = 'running'; paintRow(i); paintFoot(); await sleep(t, 900); state[i] = 'done'; OUT[i][2] = i === 2 ? 'Replayed after the limit reset. 41 of 41 delivered' : i === 3 ? 'Restarted after the drain' : 'Filed HAL-483 in Engineering'; paintRow(i); paintFoot(); }
        f.status(badge('Completed', 'success-light'));
      };
      await sleep(t, 1300); await press(rows[4].grant, t, 240);
      await sleep(t, 900); await press(retry, t, 240);
    } });

  /* --------------------------------------------------------- ai-chat-1 */
  demos.push({ group: G, title: 'Copilot Chat Shell', kind: 'lib',
    desc: 'The copilot surface scaled to one thread: a reply streams with a numbered code artifact, a follow-up is typed and sent, and the context meter in the composer ticks up.' + PRO,
    async run(root, t) {
      const CODE = 'const intent = event.data.object.payment_intent\nconst order = intent\n  ? await orders.byIntent(intent)\n  : await orders.byCharge(event.data.object.id)';
      const s = blockStage(root, 'min-h-[560px]', 'max-w-2xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); s.w.append(shell);
      const bar = mk('div', 'flex min-w-0 items-center gap-1 border-b border-border px-3 py-2');
      bar.innerHTML = `<span class="flex min-w-0 flex-1 items-center gap-1 text-sm font-medium"><span class="truncate">Stripe webhook 500s on charge.refunded</span>${I('chevron-down', 'size-3.5 text-muted-foreground')}</span><span class="hidden @md:flex">${ibh('plus', 'New chat')}${ibh('star', 'Bookmark')}</span><span class="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium">Claude Sonnet 5${I('chevron-down', 'size-3')}</span>`;
      shell.append(bar);
      const v = vpBox(300); shell.append(v);
      const ctxBar = mk('div', 'flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground');
      const cmp = composer({ placeholder: 'Ask anything, or describe what you want changed...', top: '', tools: `${ibh('plus', 'Attach')}<span class="inline-flex h-7 items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium text-foreground">${I('brain', 'size-3.5')}Think</span><span class="hidden h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground @sm:inline-flex">${I('globe', 'size-3.5')}Search</span><span class="hidden items-center gap-1 text-[11px] text-muted-foreground @md:inline-flex"><span class="size-1.5 rounded-full bg-foreground"></span>1 tool</span>`, right: ibh('mic', 'Dictate'), cls: 'mx-3 mb-2' });
      cmp.prepend(ctxBar); const ctxPct = (n) => { ctxBar.innerHTML = `${I('activity', 'size-3.5')}<span>Context ${n} percent full</span>${dotSep}<span class="truncate">Plan limit resets Friday 12:00 PM</span>`; };
      ctxPct(61); shell.append(cmp, mk('div', 'pb-2', '')); shell.lastElementChild.append(disclaimer());
      const u1 = userMsg("makes sense. what's the smallest fix", AV.viewer); v.c.append(u1);
      await sleep(t, 500);
      const a = aiMsg(); add(v.c, a); a.body.innerHTML = thinking(); await sleep(t, 900); a.body.innerHTML = '';
      const p1 = mk('p'); a.body.append(p1); await streamStick(v, p1, 'Guard the lookup and fall back to the charge id, which is always present on a refund event:', t, 26);
      const cb = codeBlock(CODE, { lang: 'ts', title: 'stripe-webhook.ts', ln: true, dl: true }); a.body.append(cb); v.stick(); await typeCode(cb, t, 110); v.stick();
      const p2 = mk('p'); a.body.append(p2); await streamStick(v, p2, "That clears 39 of the 41 on replay. The other two are past Stripe's 3 day retry window, so they need a manual resend from the Dashboard.", t, 24);
      ctxPct(63);
      await sleep(t, 700); await typeTa(cmp.ta, 'ok patch it', t, 55); await press(cmp.send, t, 220, false);
      cmp.ta.value = ''; cmp.classList.remove('is-focus'); add(v.c, userMsg('ok patch it', AV.viewer)); v.stick();
      const b = aiMsg(); add(v.c, b); b.body.innerHTML = thinking('Patching'); v.stick(); await sleep(t, 1100); b.body.innerHTML = '';
      const p3 = mk('p'); b.body.append(p3); await mdStick(v, p3, 'Patched `stripe-webhook.ts` and started the replay. 39 of 41 have cleared so far, and the last two are outside the retry window and need a manual resend.', t, 26);
      ctxPct(64);
    } });

  /* --------------------------------------------------------- ai-chat-2 */
  demos.push({ group: G, title: 'Docked Assistant with Insert', kind: 'lib',
    desc: 'An assistant docked beside a release-notes draft: the reply streams a markdown artifact, and Insert writes it into the page section (Undo takes it back). The page pane hides on narrow cards.' + PRO,
    async run(root, t) {
      const DRAFT = '## Webhook reliability\n\nRefund confirmations now reach your endpoint within a minute of the refund itself. Between 08:46 and 09:12 on Aug 19, confirmations for 41 refunds were held while refund events without a payment reference were being rejected. A fix shipped the same morning, the held confirmations were replayed, and every confirmation was delivered.';
      const s = blockStage(root, 'min-h-[560px]', 'max-w-4xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); shell.style.height = '500px'; shell.style.flexDirection = 'row'; s.w.append(shell);
      const doc = mk('div', 'hidden min-w-0 flex-1 flex-col gap-4 overflow-hidden border-e border-border p-5 @[640px]:flex');
      doc.innerHTML = `<div class="flex items-center gap-2 font-mono text-xs text-muted-foreground">${I('file-text', 'size-3.5')}release-notes-3.4.md</div><div class="rui-skel h-4 w-24"></div><div class="rui-skel h-6 w-52"></div><div class="flex flex-col gap-2"><div class="rui-skel h-2.5 w-full"></div><div class="rui-skel h-2.5 w-11/12"></div><div class="rui-skel h-2.5 w-3/4"></div></div><div class="flex flex-col gap-2"><div class="rui-skel h-2.5 w-full"></div><div class="rui-skel h-2.5 w-4/5"></div></div><div class="mt-2 text-sm font-medium">Webhook reliability</div><div class="rui-slot text-sm text-muted-foreground italic">Draft this from the Aug 19 incident notes.</div>`;
      const panel = mk('div', 'flex w-full min-w-0 flex-col @[640px]:w-[22rem] @[640px]:shrink-0');
      panel.innerHTML = `<div class="flex items-center gap-2 border-b border-border px-3 py-2">${I('sparkles', 'size-4')}<span class="flex-1 text-sm font-medium">Webhook section</span>${ibh('plus', 'New chat', 'icon-xs')}${ibh('panel-right', 'Hide panel', 'icon-xs')}</div>`;
      const v = vpBox(330, 'gap-4 p-3'); v.style.flex = '1'; v.style.height = 'auto'; panel.append(v);
      const cmp = composer({ placeholder: 'Ask about this draft...', tools: `${ibh('plus', 'Attach', 'icon-xs')}<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">Claude Sonnet 5${I('chevron-down', 'size-3')}</span>`, cls: 'm-3 mb-1' }); panel.append(cmp, mk('div', 'pb-2'));
      panel.lastElementChild.append(disclaimer()); shell.append(doc, panel);
      add(v.c, userMsg('no apology, we stayed inside the SLA'));
      await sleep(t, 500);
      const a = aiMsg(false); add(v.c, a); a.body.innerHTML = thinking('Drafting'); await sleep(t, 900); a.body.innerHTML = '';
      const p1 = mk('p'); a.body.append(p1); await streamStick(v, p1, 'Draft below. Window named, resend line kept, no apology.', t, 28);
      const cb = codeBlock(DRAFT, { lang: 'md', title: 'release-notes-3.4.md', wrap: true, dl: true }); a.body.append(cb); v.stick(); await typeCode(cb, t, 160); v.stick();
      const p2 = mk('p'); a.body.append(p2); await streamStick(v, p2, 'Tense matches Highlights, so you can drop it in without a second pass.', t, 26);
      const actRowEl = mk('div', 'flex items-center gap-2'); const ins = btn('Insert', 'outline', 'xs', 'plus'); const hint = mk('span', 'text-xs text-muted-foreground', 'Fills Webhook reliability'); actRowEl.append(ins, hint); add(a.body, actRowEl);
      const qr = mk('div', 'flex flex-col items-end gap-2'); ['Shorten to two lines', 'Add the retry window'].forEach((x) => qr.append(btn(`${x}`, 'outline', 'sm', 'corner-down-right', 'rounded-full text-muted-foreground'))); add(v.c, qr); v.stick();
      const slot = doc.querySelector('.rui-slot'); let inserted = false;
      ins.onclick = async () => {
        if (inserted) { inserted = false; slot.className = 'rui-slot text-sm text-muted-foreground italic'; slot.textContent = 'Draft this from the Aug 19 incident notes.'; ins.innerHTML = `${I('plus')}<span>Insert</span>`; hint.textContent = 'Fills Webhook reliability'; return; }
        inserted = true; ins.innerHTML = `${I('rotate-ccw')}<span>Undo</span>`; hint.textContent = 'Inserted into Webhook reliability';
        slot.className = 'rui-slot text-sm leading-relaxed text-foreground'; slot.textContent = ''; slot.style.background = 'color-mix(in oklch,var(--success) 10%,transparent)';
        await stream(slot, DRAFT.split('\n\n')[1], t, 10); slot.style.transition = 'background-color 1.2s'; slot.style.background = 'transparent';
      };
      await sleep(t, 1000); await press(ins, t, 260);
      await sleep(t, 1200); const q1 = qr.firstElementChild; await press(q1, t, 240, false); qr.remove();
      add(v.c, userMsg('Shorten to two lines')); const b2 = aiMsg(false); add(v.c, b2); b2.body.innerHTML = thinking('Shortening'); v.stick(); await sleep(t, 900); b2.body.innerHTML = '';
      const p3 = mk('p'); b2.body.append(p3); await streamStick(v, p3, 'Refund confirmations now arrive within a minute. The 41 held on Aug 19 were replayed and delivered the same morning.', t, 30);
    } });

  /* --------------------------------------------------------- ai-chat-3 */
  demos.push({ group: G, title: 'Prompt Starter Welcome', kind: 'lib',
    desc: 'A new-chat zero state: a greeting, Start and Resume rails that fill the composer and attach context, then the reply streams with a Stop control until it lands.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[560px]', 'max-w-xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); shell.style.height = '500px'; s.w.append(shell);
      shell.innerHTML = `<div class="flex items-center gap-2 px-3 py-2.5"><span class="grid size-7 place-items-center rounded-md bg-muted">${I('sparkles', 'size-4')}</span><span class="flex-1 text-sm font-medium">Research Chat</span><span class="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium">Claude Sonnet 5${I('chevron-down', 'size-3')}</span></div>`;
      const mid = mk('div', 'relative min-h-0 flex-1'); shell.append(mid);
      const welcome = mk('div', 'absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-hidden px-6 transition-opacity duration-300');
      welcome.innerHTML = '<div class="text-center"><div class="text-2xl font-semibold tracking-tight">Morning, Maya</div><div class="mt-1 text-sm text-muted-foreground">Release 3.4 ships Thursday</div></div>';
      const start = mk('div', 'flex w-full max-w-sm flex-col gap-1.5'); start.innerHTML = '<div class="text-xs text-muted-foreground">Start</div>';
      const STARTS = [['message-square', 'Explain the webhook 500s'], ['file-text', 'Draft Q3 release notes'], ['chart-column', 'Summarize churn by plan'], ['users', 'Plan the onboarding revamp']];
      const sb = STARTS.map(([ic, l]) => { const b = mk('button', 'flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60', `${I(ic, 'size-4 text-muted-foreground')}${l}`); b.type = 'button'; start.append(b); return b; });
      const resume = mk('div', 'flex w-full max-w-sm flex-col gap-1.5 text-sm'); resume.innerHTML = `<div class="text-xs text-muted-foreground">Resume</div>${[['activity', 'p95 latency on eu-west', '22m'], ['mail', 'Trial expiry email rewrite', 'Yesterday'], ['shield-check', 'Audit log export scope', 'Tue']].map(([ic, l, w]) => `<div class="flex items-center gap-2 text-muted-foreground">${I(ic, 'size-3.5')}<span class="text-foreground/80">${l}</span><span class="text-xs">${w}</span></div>`).join('')}`;
      welcome.append(start, resume); mid.append(welcome);
      const v = vpBox(0, 'gap-5 p-4'); v.style.cssText += ';position:absolute;inset:0;height:auto'; v.hidden = true; mid.append(v);
      const chips = mk('div', 'flex flex-wrap gap-1.5 px-3 pt-2');
      const cmp = composer({ placeholder: 'Ask anything', tools: ibh('plus', 'Attach'), right: `<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">Instant${I('chevron-down', 'size-3')}</span>`, cls: 'mx-3 rounded-2xl' });
      cmp.prepend(chips); shell.append(cmp, mk('div', 'py-2')); shell.lastElementChild.append(disclaimer());
      await sleep(t, 1800); await press(sb[0], t, 260, false);
      chips.innerHTML = `<span class="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 text-xs">${I('file-code', 'size-3.5')}stripe-webhook.ts${I('x', 'size-3 text-muted-foreground')}</span>`; appear(chips.firstElementChild, 3);
      await typeTa(cmp.ta, 'Explain the webhook 500s', t, 24); await sleep(t, 300); await press(cmp.send, t, 200, false);
      cmp.ta.value = ''; chips.innerHTML = ''; welcome.style.opacity = '0'; await sleep(t, 300); welcome.hidden = true; v.hidden = false;
      add(v.c, userMsg('Explain the webhook 500s')); cmp.send.innerHTML = I('square', 'size-3.5 fill-current'); cmp.send.setAttribute('aria-label', 'Stop');
      const a = aiMsg(); add(v.c, a); a.body.innerHTML = thinking('Reading stripe-webhook.ts'); await sleep(t, 1100); a.body.innerHTML = '';
      for (const para of ['The 500s come from the refund branch: it reads **payment_intent**, which is null for refunds created in the Dashboard, and the lookup throws before the handler returns 200.', 'Stripe treats every 500 as a failed delivery and retries, which is why 41 events are queued behind the same code path.', 'The smallest fix is to fall back to the charge id when the intent is missing, then replay the queue.']) { const p = mk('p'); a.body.append(p); await mdStick(v, p, para, t, 22); }
      cmp.send.innerHTML = I('arrow-up'); cmp.send.setAttribute('aria-label', 'Send');
    } });

  /* --------------------------------------------------------- ai-chat-4 */
  demos.push({ group: G, title: 'Reply to a Quoted Sentence', kind: 'lib',
    desc: 'A floating assistant panel: the findings stream with their sources, one sentence is selected and quoted into the composer, and the answer to that line arrives after a thinking beat.' + PRO,
    async run(root, t) {
      const PARAS = ['Across both sessions the same three asks came up, and none of them was about accuracy.', 'People wanted to know where an answer came from before they read it. Nine of eleven scrolled to the sources first.', 'They wanted the reply to hold still. Two participants lost their place when the text reflowed mid answer.', 'And they wanted to argue with one sentence rather than the whole answer. That one is worth building.'];
      const s = blockStage(root, 'min-h-[580px]', 'max-w-md');
      const panel = mk('div', 'rui-card w-full overflow-hidden shadow-lg'); panel.style.height = '540px'; s.w.append(panel);
      panel.innerHTML = `<div class="flex items-center gap-2 border-b border-border px-3 py-2">${I('bot', 'size-4')}<span class="flex flex-1 items-center gap-1 text-sm font-medium">Trust in AI replies${I('chevron-down', 'size-3.5 text-muted-foreground')}</span>${ibh('square-pen', 'New chat', 'icon-xs')}${ibh('sliders-horizontal', 'Personalize', 'icon-xs')}${ibh('x', 'Close', 'icon-xs')}</div>`;
      const v = vpBox(0, 'gap-4 p-3'); v.style.flex = '1'; v.style.height = 'auto'; panel.append(v);
      const quote = mk('div', 'flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground'); quote.hidden = true;
      const cmp = composer({ placeholder: 'Ask AI anything', tools: `${ibh('plus', 'Attach', 'icon-xs')}<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">Claude Sonnet 5 · Auto${I('chevron-down', 'size-3')}</span>`, cls: 'm-3 mb-1' }); cmp.prepend(quote);
      panel.append(cmp, mk('div', 'pb-2')); panel.lastElementChild.append(disclaimer('Research Chat can browse the web. Check important info.'));
      add(v.c, userMsg('Both sessions are attached. Pull out what people actually asked for, not what we assumed.'));
      await sleep(t, 500);
      const a = aiMsg(false); add(v.c, a);
      const hd = mk('div', 'flex items-center gap-2 text-sm font-medium', `<span class="size-1.5 rounded-full bg-foreground"></span><span class="flex-1">Session Findings</span><span class="rui-tm inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">${I('clock', 'size-3')}<span>0s</span></span>${I('chevron-up', 'size-3.5 text-muted-foreground')}`); a.body.append(hd);
      let sec = 0; const tm = t.every(REDUCE ? 1000 : 300, () => { sec++; hd.querySelector('.rui-tm span').textContent = sec + 's'; });
      const ps = []; for (const para of PARAS) { const p = mk('p'); a.body.append(p); ps.push(p); await streamStick(v, p, para, t, 18); }
      t.stop(tm); hd.querySelector('.rui-tm span').textContent = '12s';
      const src = mk('div', 'flex flex-wrap gap-1.5', ['Trust research sync', 'Design review, AI states'].map((x) => `<span class="inline-flex h-6 items-center gap-1 rounded-md border border-border px-1.5 text-xs text-muted-foreground">${I('file-text', 'size-3')}${x}</span>`).join('')); add(a.body, src); v.stick();
      await sleep(t, 1000);
      const target = ps[2]; const sent = 'They wanted the reply to hold still.'; target.innerHTML = `<span class="rui-q">${sent}</span>${esc(target.textContent.slice(sent.length))}`;
      const q = target.querySelector('.rui-q'); q.classList.add('rui-sel');
      const pop = btn('Reply', 'default', 'xs', 'corner-down-right', 'absolute z-10 shadow-md'); target.style.position = 'relative'; pop.style.left = '0'; pop.style.top = '-1.9rem'; target.append(pop); appear(pop, 3);
      await sleep(t, 1000); await press(pop, t, 220, false); pop.remove(); q.classList.remove('rui-sel');
      quote.hidden = false; quote.innerHTML = `${I('corner-down-right', 'size-3')}<span class="min-w-0 flex-1 truncate">${sent}</span>${I('x', 'size-3')}`; appear(quote, 3);
      await typeTa(cmp.ta, 'How would we build that?', t, 34); await press(cmp.send, t, 200, false);
      cmp.ta.value = ''; quote.hidden = true;
      const u = row('end'); const ub = bubble('muted', '', 'end'); ub.c.innerHTML = `<div class="mb-1 border-s-2 border-border ps-2 text-xs text-muted-foreground">${sent}</div>How would we build that?`; u.content.append(ub); add(v.c, u); v.stick();
      const b = aiMsg(false); add(v.c, b); b.body.innerHTML = thinking(); v.stick(); await sleep(t, 1200); b.body.innerHTML = '';
      const p = mk('p'); b.body.append(p); await mdStick(v, p, 'Reserve the reply\'s height while it streams and only grow it at paragraph boundaries. Pair that with **aria-busy** so the reader keeps their place.', t, 24);
    } });

  /* --------------------------------------------------------- ai-chat-5 */
  demos.push({ group: G, title: 'Connected Apps Set the Scope', kind: 'lib',
    desc: 'The composer sits in a Frame whose footer is a live strip of connected apps; switching one off changes what the assistant reads, and the reply returns a receipt per source.' + PRO,
    async run(root, t) {
      const APPS = [['Google Drive', 'https://drive.google.com', '6 docs'], ['Slack', 'https://slack.com', '14 threads'], ['Calendar', 'https://calendar.google.com', '3 meetings'], ['Dropbox', 'https://www.dropbox.com', '2 files']];
      const on = [true, true, true, true];
      const s = blockStage(root, 'min-h-[560px]', 'max-w-lg items-center');
      const hero = mk('div', 'flex flex-col items-center gap-3 text-center'); hero.innerHTML = `<span class="grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">${I('sparkles', 'size-4')}</span><div class="text-lg font-medium">What should I look through?</div>`; s.w.append(hero);
      const fr = mk('div', 'rui-frame w-full'); const ta = mk('textarea', 'block h-14 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground'); ta.placeholder = 'Ask across your apps'; ta.setAttribute('aria-label', 'Ask across your apps');
      const pnl = mk('div', 'rui-fpanel px-3 pt-2.5 pb-2'); const tools = mk('div', 'flex items-center gap-1'); const send = btn('', 'default', 'icon-sm', 'arrow-up', 'rounded-full'); send.setAttribute('aria-label', 'Send');
      tools.innerHTML = `${ibh('paperclip', 'Attach', 'icon-xs')}<span class="flex-1"></span><span class="inline-flex items-center gap-1 text-xs text-muted-foreground">Auto${I('chevron-down', 'size-3')}</span>`; tools.append(send); pnl.append(ta, tools);
      const strip = mk('div', 'flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground'); const cnt = mk('span', 'flex-1'); const logos = mk('span', 'flex items-center gap-1');
      const lb = APPS.map(([n, url], i) => { const b = mk('button', 'grid size-6 place-items-center rounded-md transition-opacity hover:bg-muted', h.favicon ? h.favicon(url, 'size-4') : n[0]); b.type = 'button'; b.title = n; b.setAttribute('aria-pressed', 'true'); b.onclick = () => { on[i] = !on[i]; paint(); }; logos.append(b); return b; });
      const paint = () => { lb.forEach((b, i) => { b.style.opacity = on[i] ? '1' : '.35'; b.setAttribute('aria-pressed', String(on[i])); }); cnt.textContent = `Reading ${on.filter(Boolean).length} of 9 apps`; };
      strip.append(cnt, logos, mk('span', 'grid size-6 place-items-center rounded-md border border-border', I('plus', 'size-3.5'))); fr.append(pnl, strip); s.w.append(fr); paint();
      const modes = mk('div', 'flex flex-wrap justify-center gap-2'); const MB = [['list-checks', 'Digest'], ['pencil', 'Draft'], ['video', 'Recap'], ['search', 'Audit']].map(([ic, l], i) => { const b = btn(l, 'outline', 'sm', ic); if (!i) b.style.background = 'var(--muted)'; modes.append(b); return b; }); s.w.append(modes);
      const out = mk('div', 'flex w-full flex-col gap-3'); s.w.append(out);
      await sleep(t, 600); await typeTa(ta, 'Catch me up on the 3.4 release since Monday', t, 26);
      await sleep(t, 500); await press(lb[3], t, 220);
      await sleep(t, 700); await press(send, t, 220, false); ta.value = '';
      hero.hidden = true; modes.hidden = true;
      const rc = mk('div', 'flex flex-col divide-y divide-border rounded-lg border border-border text-sm'); add(out, rc);
      for (let i = 0; i < APPS.length; i++) {
        const [n, url, got] = APPS[i]; const r = mk('div', 'flex items-center gap-2 px-3 py-2', `${h.favicon ? h.favicon(url, 'size-4') : ''}<span class="flex-1 text-foreground">${n}</span><span class="rui-r flex items-center gap-1.5 text-xs text-muted-foreground">${spin('size-3.5')}Reading</span>`); add(rc, r);
        await sleep(t, 500);
        r.querySelector('.rui-r').innerHTML = on[i] ? `${I('check', 'size-3.5 text-[var(--success)]')}${got}` : `<span>Skipped, switched off</span><button type="button" class="rui-btn" data-v="outline" data-s="xs">Connect</button>`;
      }
      const ul = mk('ul', 'flex list-disc flex-col gap-1.5 ps-5 text-sm leading-relaxed'); add(out, ul);
      for (const li of ['**Webhook fix** shipped Tuesday; 39 of 41 held refunds replayed, 2 need a manual resend.', '**VAT line** is merged on 4.2 and goes out with Thursday’s release.', 'Thursday review moved to **3pm**; Maya and Jonas are presenting.']) { const l = mk('li'); ul.append(l); await md(l, li, t, 24); }
    } });

  /* --------------------------------------------------------- ai-chat-6 */
  demos.push({ group: G, title: 'Agentic Panel: Brief, Plan, Run', kind: 'lib',
    desc: 'A docked panel runs a task end to end: confirm what it may read, then an ordered plan executes step by step, a failed step retries, and the result is assigned as a ticket.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[580px]', 'max-w-md');
      const panel = mk('div', 'rui-card w-full overflow-hidden shadow-lg'); panel.style.height = '540px'; s.w.append(panel);
      const hdr = mk('div', 'flex items-center gap-2 border-b border-border px-3 py-2'); hdr.innerHTML = `${I('bot', 'size-4')}<span class="flex flex-1 items-center gap-1 text-sm font-medium">Claude Sonnet 5${I('chevron-down', 'size-3.5 text-muted-foreground')}</span><span class="rui-run flex"></span>${ibh('plus', 'New chat', 'icon-xs')}${ibh('x', 'Close', 'icon-xs')}`; panel.append(hdr);
      const runSt = (html) => { hdr.querySelector('.rui-run').innerHTML = html; };
      const v = vpBox(0, 'gap-4 p-3'); v.style.flex = '1'; v.style.height = 'auto'; panel.append(v);
      const cmp = composer({ placeholder: 'Ask about the signup drop', tools: `${ibh('paperclip', 'Attach', 'icon-xs')}<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">${I('box', 'size-3.5')}3${I('chevron-down', 'size-3')}</span>`, cls: 'm-3' }); panel.append(cmp);
      add(v.c, userMsg("Signup completion dropped 12% after 4.2 shipped on Tuesday. Work out what changed and get a fix moving before Thursday's review."));
      await sleep(t, 500);
      const a = aiMsg(false); add(v.c, a);
      const hd = mk('div', 'flex items-center gap-2', '<span class="flex-1 text-sm font-semibold">Scoping the Drop</span><span class="rui-s text-xs text-muted-foreground tabular-nums">0s</span>'); a.body.append(hd);
      let sec = 0; const tm = t.every(REDUCE ? 1000 : 400, () => { sec++; hd.querySelector('.rui-s').textContent = sec + 's'; });
      const p1 = mk('p'); a.body.append(p1); await streamStick(v, p1, 'Your export agrees with the funnel: completion fell from 71% to 59% between Monday and Wednesday, and all of it sits on the email verification step.', t, 18);
      const p2 = mk('p'); a.body.append(p2); await streamStick(v, p2, 'Three questions before I start. I have pre-picked what I would choose, so confirming is enough.', t, 18);
      const brief = mk('div', 'flex flex-col gap-2'); a.body.append(brief);
      const QS = [['What may I read?', [['funnel-export.csv', 'Attached, CSV, 1,204 rows', 1], ['Signup funnel', 'Analytics, last 14 days', 1], ['Support queue', '14 tickets tagged signup', 1], ['Session replay', '18 signups, Aug 25', 0]]], ['Which window?', [['Monday to Wednesday', 'Before and after 4.2', 1], ['Last 30 days', 'Wider baseline', 0]]], ['Who should own the fix?', [['Maya Perez', 'Growth', 1], ['Jonas Weber', 'Platform', 0]]]];
      for (let qi = 0; qi < QS.length; qi++) {
        const [q, opts] = QS[qi]; brief.innerHTML = `<div class="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Brief</div><div class="flex gap-1">${QS.map((_, k) => `<span class="h-1 flex-1 rounded-full ${k <= qi ? 'bg-foreground' : 'bg-muted'}"></span>`).join('')}</div><div class="text-xs text-muted-foreground">Question ${qi + 1} of 3</div><div class="text-sm font-medium">${q}</div>`;
        const ol = mk('div', 'flex flex-col gap-1.5'); brief.append(ol);
        const items = opts.map(([ti, sub], k) => { const it = mk('div', 'flex items-center gap-3 rounded-lg border border-border px-3 py-2', `<span class="rui-cb grid size-4 shrink-0 place-items-center rounded-[4px] border border-[var(--input)]"></span><span class="min-w-0 flex-1"><span class="block text-sm">${ti}</span><span class="block text-xs text-muted-foreground">${sub}</span></span><span class="grid size-5 place-items-center rounded border border-border text-[10px] text-muted-foreground">${'ABCD'[k]}</span>`); ol.append(it); return it; });
        const nx = btn('Next', 'default', 'xs', '', 'self-end'); brief.append(nx); v.stick();
        for (let k = 0; k < opts.length; k++) { if (!opts[k][2]) continue; await sleep(t, 280); const cb = items[k].querySelector('.rui-cb'); cb.style.background = 'var(--primary)'; cb.style.borderColor = 'var(--primary)'; cb.innerHTML = I('check', 'size-3 text-[var(--primary-foreground)]'); items[k].style.background = 'var(--muted)'; }
        await sleep(t, 600); await press(nx, t, 200, false);
      }
      t.stop(tm); brief.innerHTML = `<div class="flex items-center gap-1.5 text-xs text-muted-foreground">${I('check', 'size-3.5 text-[var(--success)]')}Brief confirmed: 3 sources, Mon to Wed, Maya owns the fix</div>`; v.stick();
      runSt(badge(`${spin('size-3')}Running`, 'primary-light'));
      const plan = mk('ol', 'flex flex-col gap-1.5'); a.body.append(mk('div', 'text-sm font-medium', 'Plan')); a.body.append(plan); v.stick();
      const STEPS = [['Compare the funnel step by step', 'Verification is the only step that moved'], ['Diff the verification email template', 'The 4.2 template drops the magic link on Gmail'], ['Draft the template fix', '2 files changed'], ['Open a ticket for Thursday', 'SIGN-214 assigned to Maya']];
      const lis = STEPS.map(([ti], i) => { const li = mk('li', 'flex items-start gap-2 text-sm', `<span class="rui-i mt-0.5 grid size-4 shrink-0 place-items-center text-[10px] text-muted-foreground">${i + 1}.</span><span class="min-w-0 flex-1"><span class="rui-t text-muted-foreground">${ti}</span><span class="rui-d block text-xs text-muted-foreground"></span></span>`); plan.append(li); return li; });
      const setLi = (i, st, d = '') => { const li = lis[i]; li.querySelector('.rui-i').innerHTML = st === 'running' ? spin('size-3.5') : st === 'done' ? I('check', 'size-3.5 text-[var(--success)]') : st === 'failed' ? I('x', 'size-3.5 text-[var(--destructive)]') : `${i + 1}.`; const tt = li.querySelector('.rui-t'); tt.className = `rui-t ${st === 'running' ? 'rui-shimmer text-muted-foreground' : st === 'failed' ? 'text-[var(--destructive)]' : 'text-foreground'}`; li.querySelector('.rui-d').innerHTML = d; v.stick(); };
      for (let i = 0; i < STEPS.length; i++) {
        setLi(i, 'running'); await sleep(t, 1000);
        if (i === 1) {
          setLi(i, 'failed', 'Template service timed out after 30s '); const r = btn('Retry', 'outline', 'xs', 'refresh-cw', 'ms-1 align-middle'); lis[i].querySelector('.rui-d').append(r); v.stick();
          await sleep(t, 1000); await press(r, t, 220, false); setLi(i, 'running'); await sleep(t, 900);
        }
        setLi(i, 'done', STEPS[i][1]);
      }
      runSt(badge('Done', 'success-light'));
      const tk = mk('div', 'flex items-center gap-3 rounded-lg border border-border px-3 py-2.5', `${I('circle-check', 'size-4 text-[var(--success)]')}<div class="min-w-0 flex-1"><div class="text-sm font-medium">SIGN-214 · Restore the magic link</div><div class="text-xs text-muted-foreground">Assigned to Maya · 2 files from this run</div></div>`); add(a.body, tk); v.stick();
    } });

  /* --------------------------------------------------------- ai-chat-7 */
  demos.push({ group: G, title: 'Two-Model Comparison', kind: 'lib',
    desc: 'One prompt answered by two models side by side: the panes stream at different speeds with live latency, token and rate counters, then a scoreboard settles into a verdict you can vote on.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[600px]', 'max-w-4xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); s.w.append(shell);
      const hd = mk('div', 'flex items-center gap-2 border-b border-border px-3 py-2', `<span class="text-sm font-medium">Compare Models</span><span class="hidden @[440px]:flex">${badge('1 exchange', 'success-light')}</span><span class="flex-1"></span>${ibh('link', 'Copy link', 'icon-xs')}`); hd.append(btn('New comparison', 'default', 'xs', 'plus')); shell.append(hd);
      const prompt = mk('div', 'border-b border-border bg-muted/40 px-3 py-2 text-sm', `<span class="text-muted-foreground">Prompt:</span> Why did team-plan churn go from 2.6 to 4.1 percent in August?`); shell.append(prompt);
      const panes = mk('div', 'grid grid-cols-1 divide-y divide-border @[600px]:grid-cols-2 @[600px]:divide-x @[600px]:divide-y-0'); shell.append(panes);
      const M = [
        { name: 'Claude Sonnet 5', ms: 34, lat: 3.1, tok: 612, rate: 249, text: ['Seat reductions drive it. Five team accounts fell below five seats in August and cancelled instead of downgrading.', 'All nine promo accounts signed in March on the six month discount and cancelled within days of the first full price invoice.'] },
        { name: 'GPT-5.1', ms: 62, lat: 4.6, tok: 848, rate: 230, text: ['Ranking raw counts puts the promo cohort on top, and I think that is the wrong lead.', 'Measured as excess over July, seat reductions are the actual change: every one of the five fell below five seats first.'] },
      ];
      const TABLE = [['Seat reductions', 1, 5], ['Promo renewals', 6, 9], ['Missing SSO', 3, 4], ['No signal', 3, 3]];
      const mkPane = (m) => {
        const p = mk('div', 'flex min-w-0 flex-col');
        p.innerHTML = `<div class="flex items-center gap-1 px-3 py-2"><span class="inline-flex h-7 min-w-0 flex-1 items-center justify-between gap-1 rounded-md border border-border px-2 text-xs font-medium @[600px]:max-w-44"><span class="truncate">${m.name}</span>${I('chevron-down', 'size-3')}</span>${ibh('refresh-cw', 'Regenerate', 'icon-xs')}${ibh('ellipsis', 'More', 'icon-xs')}</div>`;
        const body = mk('div', 'flex min-h-[230px] flex-col gap-3 px-3 pb-2 text-sm leading-relaxed'); const stats = mk('div', 'px-3 pb-2 text-xs text-muted-foreground tabular-nums', '0.0s · 0 tokens');
        const ft = mk('div', 'flex items-center gap-2 border-t border-border px-3 py-1.5 text-xs text-muted-foreground', `<button type="button" class="rui-btn" data-v="ghost" data-s="xs">${I('copy')}<span>Copy</span></button><span class="ms-auto">1 answer</span>`);
        p.append(body, stats, ft); panes.append(p); p.body = body; p.stats = stats; return p;
      };
      const P = M.map(mkPane);
      const score = mk('div', 'flex flex-wrap items-center justify-center gap-2 border-t border-border px-3 py-2.5 text-sm'); score.hidden = true; shell.append(score);
      const cmp = composer({ placeholder: 'Ask both models about this file...', top: '', tools: `<span class="inline-flex h-6 items-center gap-1 rounded-md border border-border px-1.5 text-xs">${I('file-spreadsheet', 'size-3.5')}churn-aug.csv <span class="text-muted-foreground">18,402 rows</span></span>`, cls: 'm-3' }); shell.append(cmp);
      const runPane = async (m, p) => {
        const t0 = performance.now(); let words = 0;
        const upd = () => { const el = (performance.now() - t0) / 1000; p.stats.textContent = `${el.toFixed(1)}s · ${Math.round(words * 1.6)} tokens`; };
        const id = t.every(100, upd);
        const p1 = mk('p'); p.body.append(p1); for (const w of m.text[0].split(' ')) { p1.append(w + ' '); words++; await sleep(t, m.ms * rnd(0.7, 1.3)); }
        const tb = mk('div', 'overflow-x-auto'); tb.innerHTML = `<table class="w-full text-xs"><thead><tr class="border-b border-border text-left text-muted-foreground"><th class="py-1.5 pe-2 font-medium">Driver</th><th class="px-2 text-right font-medium">July</th><th class="px-2 text-right font-medium">August</th><th class="ps-2 text-right font-medium">Change</th></tr></thead><tbody></tbody></table>`; p.body.append(tb);
        for (const [d, a, b] of TABLE) { const r = mk('tr', 'border-b border-border', `<td class="py-1.5 pe-2">${d}</td><td class="px-2 text-right tabular-nums">${a}</td><td class="px-2 text-right tabular-nums">${b}</td><td class="ps-2 text-right tabular-nums">${b - a}</td>`); tb.querySelector('tbody').append(r); appear(r, 2, 180); words += 6; await sleep(t, m.ms * 5); }
        const p2 = mk('p'); p.body.append(p2); for (const w of m.text[1].split(' ')) { p2.append(w + ' '); words++; await sleep(t, m.ms * rnd(0.7, 1.3)); }
        t.stop(id); p.stats.textContent = `${m.lat}s · ${m.tok} tokens · ${m.rate} tok/s`;
      };
      await sleep(t, 500); await Promise.all(M.map((m, i) => runPane(m, P[i])));
      score.hidden = false; score.innerHTML = `<span>Claude Sonnet 5: 1.5s faster, $0.003 more</span>${dotSep}<span class="text-xs text-muted-foreground">Prefer</span>`;
      const seg = mk('div', 'inline-flex rounded-md border border-border p-0.5 text-xs'); const sb = M.map((m) => { const b = mk('button', 'rounded px-2 py-1 font-medium text-muted-foreground', m.name); b.type = 'button'; b.onclick = () => sb.forEach((x) => { const o = x === b; x.className = `rounded px-2 py-1 font-medium ${o ? 'bg-muted text-foreground' : 'text-muted-foreground'}`; x.setAttribute('aria-pressed', String(o)); }); seg.append(b); return b; });
      score.append(seg); appear(score, 3);
      await sleep(t, 1300); await press(sb[0], t, 220);
    } });

  /* --------------------------------------------------------- ai-chat-8 */
  demos.push({ group: G, title: 'Voice Turn to Approval Plan', kind: 'lib',
    desc: 'A voice-first panel: the spoken take lands as a playable turn whose transcription streams, the agent checks the day, and the answer arrives as a move plan behind Approve.' + PRO,
    async run(root, t) {
      const s = blockStage(root, 'min-h-[600px]', 'max-w-md');
      const panel = mk('div', 'rui-card w-full overflow-hidden shadow-lg'); panel.style.height = '560px'; s.w.append(panel);
      panel.innerHTML = `<div class="flex items-center gap-2 border-b border-border px-3 py-2">${I('sparkles', 'size-4')}<span class="flex flex-1 items-center gap-1 text-sm font-medium">Thursday reshuffle${I('chevron-down', 'size-3.5 text-muted-foreground')}</span>${ibh('panel-right', 'Widen', 'icon-xs')}${ibh('square-pen', 'New chat', 'icon-xs')}${ibh('x', 'Close', 'icon-xs')}</div>`;
      const v = vpBox(0, 'gap-3 p-3'); v.style.flex = '1'; v.style.height = 'auto'; panel.append(v);
      const cmpw = mk('div', 'm-3 mb-2 rounded-xl border border-border'); cmpw.innerHTML = `<div class="flex items-center px-3 py-2 text-sm text-muted-foreground"><span class="flex-1">Ask me anything</span>${I('mic', 'size-4')}</div><div class="flex items-center gap-3 border-t border-border px-3 py-1.5 text-xs text-muted-foreground"><span class="inline-flex items-center gap-1">Swift 2.4 · Act${I('chevron-down', 'size-3')}</span><span class="flex-1"></span><span class="inline-flex items-center gap-1">${I('key-round', 'size-3')}Shortcuts</span><span class="inline-flex items-center gap-1">${I('paperclip', 'size-3')}Attach</span></div>`; panel.append(cmpw);
      v.c.append(marker('<span class="min-w-0 flex-none text-center text-xs">Today</span>', 'separator'));
      v.c.append(mk('div', 'w-fit rounded-xl border border-border px-3 py-2 text-sm', 'Welcome back. How can I help?'));
      await sleep(t, 600);
      const voice = mk('div', 'ms-auto flex w-[88%] flex-col gap-2 rounded-xl bg-muted px-3 py-2.5');
      const bars = Array.from({ length: 28 }, (_, i) => `<span class="w-[3px] rounded-full bg-foreground/40 transition-[height] duration-150" style="height:${4 + ((i * 37) % 14)}px"></span>`).join('');
      voice.innerHTML = `<div class="flex items-center gap-2"><span class="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">${I('mic', 'size-3.5')}</span><span class="rui-wave flex h-5 min-w-0 flex-1 items-center gap-[3px] overflow-hidden">${bars}</span><span class="rui-dur text-xs text-muted-foreground tabular-nums">0:00</span></div><div class="text-[11px] text-muted-foreground">Transcription</div><p class="rui-tx text-sm"></p>`;
      add(v.c, voice); v.stick();
      const bs = [...voice.querySelectorAll('.rui-wave span')]; let ds = 0;
      const wave = t.every(REDUCE ? 1000 : 120, () => { bs.forEach((b) => { b.style.height = `${4 + Math.round(Math.random() * 14)}px`; }); });
      const dur = t.every(REDUCE ? 1000 : 160, () => { if (ds < 18) ds++; voice.querySelector('.rui-dur').textContent = `0:${String(ds).padStart(2, '0')}`; });
      await streamStick(v, voice.querySelector('.rui-tx'), "I've got a lunch with Sarah on Thursday at noon. Can you move things around so it fits?", t, 70);
      t.stop(wave); t.stop(dur); voice.querySelector('.rui-dur').textContent = '0:18'; voice.firstElementChild.firstElementChild.innerHTML = I('play', 'size-3 fill-current');
      await sleep(t, 500);
      const chk = mk('div', 'flex w-[92%] flex-col gap-2 rounded-xl border border-border px-3 py-2.5 text-sm', '<p>Checked the day before answering:</p>'); add(v.c, chk); v.stick();
      for (const [a, b] of [['Read the calendar', '5 entries on Thursday'], ['Found the clashes', '2 sit on top of noon'], ['Checked the guests', 'Maya and Jonas are flexible']]) {
        const l = mk('div', 'flex min-w-0 items-center gap-2', `${spin('size-3.5 text-muted-foreground')}<span class="rui-shimmer text-muted-foreground">${a}</span>`); chk.append(l); v.stick(); await sleep(t, 650);
        l.innerHTML = `${I('check', 'size-3.5 text-[var(--success)]')}<span>${a}</span>${dotSep}<span class="min-w-0 truncate text-muted-foreground">${b}</span>`;
      }
      const cp = mk('p'); chk.append(cp); await streamStick(v, cp, 'Both clashes can move without asking anyone to give up a morning.', t, 26);
      await sleep(t, 400);
      const plan = mk('div', 'flex w-[92%] flex-col gap-2 rounded-xl border border-border px-3 py-2.5 text-sm', '<p>Here is what I would move:</p>'); add(v.c, plan); v.stick();
      for (const [a, b] of [['Lunch With Sarah', 'books at 12:00 PM.'], ['Sync With Maya', 'moves to 1:30 PM.'], ['Strategy Session', 'moves to Friday, 3:00 PM.']]) { add(plan, mk('div', 'flex items-center gap-2', `${I('calendar', 'size-3.5 text-muted-foreground')}<span><span class="underline underline-offset-2">${a}</span> ${b}</span>`), 3); v.stick(); await sleep(t, 300); }
      plan.insertAdjacentHTML('beforeend', `<div class="flex items-center gap-2 text-xs text-muted-foreground"><span class="flex -space-x-1.5">${[AV.sarah, AV.emma, AV.viewer].map((u, i) => avatar(u, 'ABC'[i], '', '', 'size-5 ring-2 ring-[var(--background)]')).join('')}</span>Will be notified</div><p>Shall I update your calendar and let them know?</p>`);
      const acts = mk('div', 'grid w-[92%] grid-cols-2 gap-2'); const no = btn('Not Now', 'outline', 'sm', 'x'); const ok = btn('Approve', 'default', 'sm', 'check'); acts.append(no, ok); add(v.c, acts);
      const hint = mk('p', 'text-xs text-muted-foreground', 'Need another option? Just ask.'); v.c.append(hint); v.stick();
      await sleep(t, 1600); await press(ok, t, 260, false);
      acts.remove(); hint.remove(); add(v.c, marker(`<span class="flex min-w-0 flex-none items-center gap-1.5 text-xs">${I('check', 'size-3.5 text-[var(--success)]')}Calendar updated, 3 people notified</span>`, 'separator')); v.stick();
    } });

  /* --------------------------------------------------------- ai-chat-9 */
  demos.push({ group: G, title: 'Branching Reply Versions', kind: 'lib',
    desc: 'A regenerate adds a version on a fork rail instead of overwriting: each reply folds its working behind a Thought row, streams a markdown artifact and lists the documents it read.' + PRO,
    async run(root, t) {
      const VERS = [
        { model: 'GPT-5.1', time: '10:34', lead: 'Number out. The sentence still carries the change:', md: '## Highlights\n\nThree things get out of your way in 3.4. Refund confirmations arrive in under a minute instead of on the next queue drain. Group membership syncs on the user schedule, so access stops drifting between runs.' },
        { model: 'Sonnet 5', time: '10:36', lead: 'Dropped the count and led with the effect instead:', md: '## Highlights\n\n3.4 is about things arriving when you expect them. Refund confirmations land within a minute, group membership follows your user schedule, and large CSV exports finish instead of timing out.' },
      ];
      const s = blockStage(root, 'min-h-[600px]', 'max-w-2xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); s.w.append(shell);
      shell.innerHTML = `<div class="flex items-center gap-1 border-b border-border px-3 py-2"><span class="flex min-w-0 items-center gap-1 text-sm font-medium"><span class="truncate">Highlights opener for 3.4</span>${I('chevron-down', 'size-3.5 text-muted-foreground')}</span>${I('star', 'size-4 fill-current ms-1')}<span class="flex-1"></span>${ibh('ellipsis', 'More', 'icon-xs')}</div>`;
      const v = vpBox(400, 'gap-4 p-4'); shell.append(v);
      const cmp = composer({ placeholder: 'Reply to this thread...', tools: `${ibh('sparkles', 'Tools', 'icon-xs')}${ibh('paperclip', 'Attach', 'icon-xs')}<span class="inline-flex items-center gap-1 text-xs">Claude Sonnet 5${I('chevron-down', 'size-3')}</span>`, cls: 'm-3' }); shell.append(cmp);
      v.c.append(userMsg('drop the row count, ops will argue about the number'));
      const rail = mk('div', 'rui-marker', ''); rail.dataset.variant = 'separator'; add(v.c, rail);
      const reply = mk('div', 'flex flex-col gap-3 text-sm'); v.c.append(reply);
      let cur = 0; const pills = [];
      const paintRail = () => { rail.innerHTML = `<span class="flex min-w-0 flex-none flex-wrap items-center justify-center gap-1.5 text-xs">${I('git-branch', 'size-3.5')}<span class="hidden @[460px]:inline">Regenerated here</span></span>`; const wrap = mk('span', 'flex flex-none items-center gap-1'); pills.length = 0; VERS.forEach((x, i) => { const b = mk('button', `rounded-full border px-2 py-0.5 text-[11px] font-medium ${i === cur ? 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-border text-muted-foreground'}`, `${x.model} <span class="opacity-70">${x.time}</span>`); b.type = 'button'; b.onclick = () => show(i); wrap.append(b); pills.push(b); }); wrap.append(mk('span', 'text-[11px] text-muted-foreground tabular-nums', `${cur + 1} / ${VERS.length}`)); rail.append(wrap); };
      let tok = 0;
      const show = async (i) => {
        const my = ++tok; cur = i; paintRail(); const x = VERS[i]; reply.innerHTML = '';
        reply.append(mk('div', 'flex items-center gap-1.5 text-sm font-medium', `${x.model}${dotSep}<span class="font-normal text-muted-foreground">${x.time}</span>`));
        const th = coll(TL({ icon: 'brain', title: 'Thinking', status: 'running' })); th.body.append(mk('p', 'text-pretty', 'Ops reads numbers as commitments. Lead with the effect, keep the claim checkable.')); reply.append(th.el); v.stick();
        await sleep(t, 1300); if (my !== tok) return; th.line.set({ title: 'Thought for 6s', status: null });
        const p = mk('p'); reply.append(p); await streamStick(v, p, x.lead, t, 26); if (my !== tok) return;
        const cb = codeBlock(x.md, { lang: 'md', title: 'release-notes-3.4.md', wrap: true }); reply.append(cb); v.stick(); await typeCode(cb, t, 150); if (my !== tok) return;
        reply.append(mk('div', 'text-xs text-muted-foreground', '2 Documents Read'));
        const docs = mk('div', 'flex flex-wrap gap-2'); [['release-notes-3.4.md', 'Draft, edited 14m ago'], ['release-notes-3.3.md', 'Published Jul 30']].forEach(([n, d]) => docs.append(attachment({ title: n, desc: d, media: I('file-text') }))); add(reply, docs);
        add(reply, mk('div', 'flex items-center gap-0.5', ['copy', 'refresh-cw', 'thumbs-up', 'thumbs-down'].map((n) => ibh(n, n.replace('-', ' '), 'icon-xs')).join('')));
        const fu = mk('div', 'flex flex-col items-start gap-1.5', '<span class="text-xs text-muted-foreground">Follow Ups</span>'); ['Check it against the 3.3 opener', 'List every number I need to verify'].forEach((f) => fu.append(btn(f, 'outline', 'sm', 'corner-down-right', 'rounded-full text-muted-foreground'))); add(reply, fu); v.stick();
      };
      await sleep(t, 400); await show(0);
      await sleep(t, 1400); v.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' }); await sleep(t, 600); await press(pills[1], t, 240, false); await show(1);
    } });

  /* --------------------------------------------------------- ai-chat-10 */
  demos.push({ group: G, title: 'Scoped Sources, Structured Answer', kind: 'lib',
    desc: 'The ask box header toggles which files the chat may read; a starter ask returns a structured document with a table and proportional bars, and the switched-off file is named as a gap.' + PRO,
    async run(root, t) {
      const FILES = [['chart-column', 'churn-q3.csv'], ['code', 'stripe-webhook.ts'], ['file-text', 'release-notes-3.4.md'], ['book-open', 'onboarding-research.md']]; const on = FILES.map(() => true);
      const s = blockStage(root, 'min-h-[600px]', 'max-w-2xl');
      const shell = mk('div', 'rui-card w-full overflow-hidden'); shell.style.height = '560px'; s.w.append(shell);
      shell.innerHTML = `<div class="flex items-center gap-1 px-3 py-2"><span class="flex flex-1 items-center gap-1 text-sm font-medium">New chat${I('chevron-down', 'size-3.5 text-muted-foreground')}</span>${ibh('plus', 'New chat', 'icon-xs')}${ibh('ellipsis', 'More', 'icon-xs')}</div>`;
      const body = mk('div', 'relative flex min-h-0 flex-1 flex-col'); shell.append(body);
      const hero = mk('div', 'flex flex-1 flex-col items-center justify-center gap-4 px-4 transition-opacity duration-300'); hero.innerHTML = `<span class="grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">${I('sparkles', 'size-4')}</span><div class="text-xl font-medium">Good morning, Maya.</div>`; body.append(hero);
      const chips = mk('div', 'flex flex-wrap gap-1.5 border-b border-border bg-muted/40 px-2.5 py-2'); const cbs = FILES.map(([ic, n], i) => { const b = mk('button', 'inline-flex h-6 items-center gap-1 rounded-md border border-border bg-[var(--card)] px-1.5 text-xs transition-opacity', `${I(ic, 'size-3.5')}<span>${n}</span>`); b.type = 'button'; b.onclick = () => { on[i] = !on[i]; b.style.opacity = on[i] ? '1' : '.45'; b.querySelector('span').classList.toggle('line-through', !on[i]); b.setAttribute('aria-pressed', String(on[i])); }; chips.append(b); return b; });
      const cmp = composer({ placeholder: 'Ask about churn, the webhook, or anything you connected...', tools: ibh('paperclip', 'Attach', 'icon-xs'), right: `<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">Claude Sonnet 5${I('chevron-down', 'size-3')}</span>`, send: 'send', cls: 'w-full max-w-xl' }); cmp.prepend(chips); hero.append(cmp);
      const starters = mk('div', 'grid w-full max-w-xl grid-cols-1 gap-2 @[560px]:grid-cols-3'); const STS = ['Read <b class="font-medium text-foreground">12,480 churn records</b> and rank the plans losing the most accounts.', 'Trace the <b class="font-medium text-foreground">charge.refunded 500s</b> to the line in stripe-webhook.ts that throws.', 'Sit <b class="font-medium text-foreground">18 onboarding interviews</b> next to the accounts that cancel first.'];
      const sbs = STS.map((x, i) => { const b = mk('button', `rounded-lg border border-border px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:bg-muted/50 ${i ? 'hidden @[560px]:block' : ''}`, x); b.type = 'button'; starters.append(b); return b; }); hero.append(starters);
      await sleep(t, 1300); await press(cbs[3], t, 220); await sleep(t, 800); await press(sbs[0], t, 260, false);
      hero.style.opacity = '0'; await sleep(t, 300); hero.remove();
      const v = vpBox(0, 'gap-4 p-4'); v.style.flex = '1'; v.style.height = 'auto'; body.append(v);
      const c2 = composer({ placeholder: 'Ask a follow-up', send: 'send', cls: 'm-3' }); body.append(c2);
      add(v.c, userMsg('Read 12,480 churn records and rank the plans losing the most accounts.'));
      const a = aiMsg(); add(v.c, a); a.body.innerHTML = thinking('Reading churn-q3.csv'); v.stick(); await sleep(t, 1100); a.body.innerHTML = '';
      const p1 = mk('p'); a.body.append(p1); await mdStick(v, p1, 'Starter loses the most accounts by far, but **Team** is where the rate moved.', t, 24);
      const tbw = mk('div', 'overflow-x-auto rounded-lg border border-border'); tbw.innerHTML = `<table class="w-full text-xs"><thead><tr class="border-b border-border bg-muted/40 text-left"><th class="px-2.5 py-2 font-medium"><span class="inline-flex items-center gap-1">Plan${I('arrow-down', 'size-3')}</span></th><th class="px-2.5 text-right font-medium">Accounts lost</th><th class="px-2.5 text-right font-medium">Share</th></tr></thead><tbody></tbody></table>`; a.body.append(tbw);
      const DATA = [['Starter', 6120, 49], ['Team', 3870, 31], ['Growth', 1620, 13], ['Scale', 870, 7]];
      for (const [p, n, sh] of DATA) { const r = mk('tr', 'border-b border-border last:border-0', `<td class="px-2.5 py-1.5">${p}</td><td class="px-2.5 text-right tabular-nums">${n.toLocaleString('en-US')}</td><td class="px-2.5 text-right tabular-nums">${sh}%</td>`); tbw.querySelector('tbody').append(r); appear(r, 2, 180); v.stick(); await sleep(t, 220); }
      const bars = mk('div', 'flex flex-col gap-1.5'); a.body.append(bars);
      for (const [p, , sh] of DATA) { const b = mk('div', 'flex items-center gap-2 text-xs', `<span class="w-14 shrink-0 text-muted-foreground">${p}</span><span class="h-2 flex-1 rounded-full bg-muted"><span class="block h-full rounded-full bg-foreground/70 transition-[width] duration-700" style="width:0%"></span></span><span class="w-8 text-right tabular-nums">${sh}%</span>`); bars.append(b); v.stick(); const fillEl = b.querySelector('span span'); tick(() => { fillEl.style.width = (sh / 49 * 100).toFixed(0) + '%'; }); await sleep(t, 200); }
      const gap = mk('div', 'flex items-start gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground', `${I('circle-alert', 'size-3.5 mt-px shrink-0')}<span><code class="font-mono">onboarding-research.md</code> is switched off, so I did not read the interviews behind the starter number.</span>`); add(a.body, gap); v.stick();
    } });

  /* --------------------------------------------------------- ai-chat-11 */
  demos.push({ group: G, title: 'Framed Answer Receipts', kind: 'lib',
    desc: 'Replies render as framed receipts on a drifting dot field: the chrome bar counts latency and tokens while the answer streams, then the run behind it lands as a tool trace or a metric row.' + PRO,
    async run(root, t) {
      const s = stage(root, 'min-h-[620px] rui-dotfield', 'max-w-xl gap-4');
      const v = vpBox(470, 'gap-4 py-2'); v.style.webkitMaskImage = 'linear-gradient(to bottom,transparent,#000 24px,#000 calc(100% - 12px),transparent)'; v.style.maskImage = v.style.webkitMaskImage; s.w.append(v);
      const receipt = () => {
        const f = mk('div', 'rui-frame w-full bg-[var(--background)]/80 backdrop-blur-[2px]'); const head = mk('div', 'flex items-center gap-2 px-2 py-1 text-xs', '<span class="text-sm font-medium">Nimbus</span><span class="text-muted-foreground">Claude Sonnet 5</span><span class="flex-1"></span><span class="rui-meta text-muted-foreground tabular-nums"></span>');
        const pn = mk('div', 'rui-fpanel'); const body = mk('div', 'px-3 py-3 text-sm leading-relaxed'); pn.append(body); f.append(head, pn); f.body = body; f.pn = pn; f.meta = head.querySelector('.rui-meta'); return f;
      };
      const r1 = receipt(); r1.meta.textContent = '4.2s · 2,140 tokens'; r1.body.textContent = 'The retry fix was never the problem. stripe-webhook.ts line 118 reads balance_transaction.fee before the null guard, and a refund on a disputed charge arrives with balance_transaction set to null.';
      const trc = mk('div', 'flex flex-col gap-1 border-t border-border bg-muted/30 px-3 py-2 text-xs'); [['#00bb7f', 'read_file', 'stripe-webhook.ts:96-140'], ['#00bb7f', 'query_db', 'webhook_events, 41 rows'], ['#e40014', 'run_code', 'replay harness, 3 of 3 threw']].forEach(([c, n, d]) => trc.insertAdjacentHTML('beforeend', `<div class="flex min-w-0 items-center gap-2"><span class="size-1.5 shrink-0 rounded-full" style="background:${c}"></span><code class="font-mono text-foreground">${n}</code><span class="truncate text-muted-foreground">${d}</span></div>`));
      r1.pn.append(trc); v.c.append(r1);
      const cmp = composer({ placeholder: 'Ask anything about this incident', tools: `${ibh('plus', 'Attach', 'icon-xs')}<span class="inline-flex items-center gap-1 text-xs">Claude Sonnet 5${I('chevron-down', 'size-3')}</span>`, right: '<kbd class="hidden rounded border border-border px-1 text-[10px] text-muted-foreground @sm:inline">Enter</kbd>', top: `<div class="flex gap-1.5 overflow-hidden border-b border-border px-2 py-1.5">${[['code', 'billing-service'], ['database', 'webhook_events'], ['globe', 'Stripe API docs']].map(([ic, l], i) => `<span class="${i === 2 ? 'hidden @sm:inline-flex' : 'inline-flex'} h-6 shrink-0 items-center gap-1 rounded-md border border-border px-1.5 text-xs">${I(ic, 'size-3.5')}${l}</span>`).join('')}</div>`, cls: 'bg-[var(--background)]' });
      s.w.append(cmp, disclaimer('Nimbus can be wrong. Check the run trace before you ship.'));
      v.stick(); await sleep(t, 700);
      await typeTa(cmp.ta, 'how bad is the backlog', t, 45); await press(cmp.send, t, 200, false); cmp.ta.value = '';
      const u = mk('div', 'flex flex-col items-end gap-1', `<span class="w-fit rounded-xl border border-border bg-[var(--background)] px-3 py-2 text-sm">how bad is the backlog</span><span class="text-[11px] text-muted-foreground tabular-nums">14:49</span>`); add(v.c, u); v.stick();
      const r2 = receipt(); add(v.c, r2); v.stick(); const t0 = performance.now(); let tokens = 0;
      const meter = t.every(100, () => { r2.meta.textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s · ${tokens.toLocaleString('en-US')} tokens`; });
      r2.body.innerHTML = thinking('Querying webhook_events'); await sleep(t, 900); r2.body.innerHTML = '';
      const txt = '41 events are queued and 6 of the 50 retry attempts are left. Stripe stops redelivering at zero, so the oldest event drops in about 40 minutes. I have a patch ready that moves the guard above the dereference.';
      for (const w of words(txt)) { r2.body.append(w); if (w.trim()) { tokens += 31; v.stick(); await sleep(t, 30 * rnd(0.6, 1.4)); } }
      t.stop(meter); r2.meta.textContent = '2.6s · 1,315 tokens';
      const met = mk('div', 'grid grid-cols-3 gap-2 border-t border-border bg-muted/30 px-3 py-2.5'); [['Queued', '41', ''], ['Retries left', '6 of 50', 'text-[var(--destructive)]'], ['Oldest event', '2h 14m', 'text-[var(--warning)]']].forEach(([l, val, c]) => met.insertAdjacentHTML('beforeend', `<div class="min-w-0"><div class="text-xs text-muted-foreground">${l}</div><div class="text-base font-semibold tabular-nums ${c}">${val}</div></div>`));
      r2.pn.append(met); appear(met, 3); v.stick();
      const sug = mk('div', 'flex flex-wrap gap-2'); ['Show the patch', 'Replay one event', 'Restart the worker'].forEach((x) => { const b = btn(x, 'outline', 'xs', '', 'rounded-full bg-[var(--background)]'); b.insertAdjacentHTML('beforeend', I('arrow-right')); sug.append(b); }); add(v.c, sug); v.stick();
      await sleep(t, 1400); await press(sug.firstElementChild, t, 240, false); sug.remove();
      add(v.c, mk('div', 'flex justify-end', '<span class="w-fit rounded-xl border border-border bg-[var(--background)] px-3 py-2 text-sm">Show the patch</span>')); v.stick();
      const r3 = receipt(); add(v.c, r3); v.stick(); const t1 = performance.now(); let tk = 0; const m3 = t.every(100, () => { r3.meta.textContent = `${((performance.now() - t1) / 1000).toFixed(1)}s · ${tk.toLocaleString('en-US')} tokens`; });
      const lead = mk('p', 'mb-2'); r3.body.append(lead); for (const w of words('The guard moves above the dereference, so a disputed refund skips the fee lookup:')) { lead.append(w); if (w.trim()) { tk += 27; v.stick(); await sleep(t, 30 * rnd(0.6, 1.4)); } }
      const cb = codeBlock('const txn = refund.balance_transaction\nconst fee = txn.fee\nif (!txn) return ack(event)\nconst fee = txn.fee', { lang: 'ts', title: 'stripe-webhook.ts', diff: { added: [3, 4], removed: [2] } }); r3.body.append(cb); v.stick(); await typeCode(cb, t, 200); tk = 862;
      t.stop(m3); r3.meta.textContent = '1.9s · 862 tokens'; v.stick();
    } });

  /* --------------------------------------------------------- ai-chat-12 */
  demos.push({ group: G, title: 'Docs Assistant Shows Its Reading', kind: 'lib',
    desc: 'A docs support panel that answers only from the knowledge base: the search runs, matched articles tick from queued to read, and the answer folds that reading into a receipt above numbered steps.' + PRO,
    async run(root, t) {
      const ARTS = [['Webhook retries and backoff', 1], ['Responding to webhook events', 1], ['Verifying webhook signatures', 1], ['Ignoring event types', 1], ['Event delivery log', 0], ['Rate limits', 0]];
      const s = blockStage(root, 'min-h-[600px]', 'max-w-md');
      const panel = mk('div', 'rui-card w-full overflow-hidden'); panel.style.height = '560px'; s.w.append(panel);
      panel.innerHTML = `<div class="flex items-center gap-1 border-b border-border px-3 py-2"><span class="flex-1 text-sm font-medium">Ask AI</span>${ibh('square-pen', 'New chat', 'icon-xs')}${ibh('sliders-horizontal', 'Settings', 'icon-xs')}${ibh('x', 'Close', 'icon-xs')}</div>`;
      const v = vpBox(0, 'gap-3 p-3'); v.style.flex = '1'; v.style.height = 'auto'; panel.append(v);
      const cmp = mk('div', 'm-3 rounded-xl border border-border'); cmp.innerHTML = `<div class="px-3 pt-2 text-sm text-muted-foreground">Ask about Research Pro</div><div class="flex items-center px-3 pb-2 pt-3 text-xs text-muted-foreground"><span class="flex-1 tabular-nums">0 / 1000</span><span class="grid size-6 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">${I('arrow-up', 'size-3.5')}</span></div>`; panel.append(cmp);
      v.c.append(marker('<span class="min-w-0 flex-none text-center text-xs">Today</span>', 'separator'));
      const u = row('start'); u.content.append(bubble('default', 'Why do my webhook deliveries keep retrying?')); add(v.c, u);
      await sleep(t, 500);
      const tr = trace(); add(v.c, tr);
      const se = TL({ icon: 'search', title: 'Searching the knowledge base', status: 'running' }); tr.append(se); v.stick(); await sleep(t, 900); se.remove();
      const rd = coll(TL({ icon: 'book-open', title: 'Reading 6 articles', status: 'running' }), { open: true }); tr.append(rd.el); const al = trace(); rd.body.append(al);
      const ls = ARTS.map(([n]) => { const l = TL({ title: n, desc: 'queued', status: 'pending' }); al.append(l); return l; }); v.stick();
      for (let i = 0; i < ls.length; i++) { ls[i].set({ desc: 'reading', status: 'running' }); await sleep(t, 380); ls[i].set({ desc: ARTS[i][1] ? 'used' : 'not used', status: ARTS[i][1] ? null : 'pending' }); }
      rd.line.set({ title: `Read 6 articles${dotSep.replace('size-1', 'size-1 mx-0.5 inline-block align-middle')}Used 4`, status: null }); rd.set(false);
      const wr = TL({ icon: 'pencil', title: 'Writing', status: 'running' }); tr.append(wr); v.stick(); await sleep(t, 800); wr.remove();
      const card = mk('div', 'flex flex-col gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm leading-relaxed'); add(v.c, card); v.stick();
      const p = mk('p'); card.append(p); await streamStick(v, p, 'Research Pro retries whenever your endpoint answers with anything outside the 200 range, or takes longer than ten seconds to answer at all.', t, 20);
      const ol = mk('ol', 'flex flex-col gap-2'); card.append(ol);
      const STEPS = ['Open the delivery log for the failing event and read the status recorded against each attempt.', 'Acknowledge inside ten seconds. Return the response first, then do the work in a background job.', 'Check the signature step. A rejected signature answers with 400, which counts as a failure and starts the backoff again.', 'Return 200 for events you mean to ignore, so they leave the queue instead of retrying for a day.'];
      for (let i = 0; i < STEPS.length; i++) { const li = mk('li', 'flex gap-3', `<span class="w-3 shrink-0 text-muted-foreground tabular-nums">${i + 1}</span><span class="rui-x min-w-0"></span>`); ol.append(li); await streamStick(v, li.querySelector('.rui-x'), STEPS[i], t, 16); }
      const cv = mk('p', 'text-muted-foreground'); card.append(cv); await streamStick(v, cv, 'Every attempt carries the same event id, so the handler has to be safe to run twice.', t, 20);
      add(v.c, mk('div', 'flex items-center gap-0.5', ibh('thumbs-up', 'Helpful', 'icon-xs') + ibh('thumbs-down', 'Not helpful', 'icon-xs')));
      const fu = mk('div', 'flex flex-col gap-1 text-xs text-muted-foreground', ['How do I replay a dead lettered event?', 'How long does the backoff run?'].map((x) => `<span class="flex items-center gap-1.5">${I('corner-down-right', 'size-3')}${x}</span>`).join('')); add(v.c, fu); v.stick();
    } });

  /* --------------------------------------------------------- ai-chat-13 */
  demos.push({ group: G, title: 'Corner Chat Popup', kind: 'lib',
    desc: 'An in-app assistant launched from a corner button: the non-modal window opens over the page with starter questions, one is asked, and the reply streams after reading the page.' + PRO,
    async run(root, t) {
      const s = stage(root, 'min-h-[600px] !items-stretch !p-0', 'max-w-none');
      const page = mk('div', 'relative h-[600px] w-full overflow-hidden');
      page.innerHTML = `<div class="flex items-center gap-2 border-b border-border px-4 py-3 text-sm"><span class="font-medium">Halcyon Labs</span>${dotSep}<span class="text-muted-foreground">API Health</span><span class="flex-1"></span>${avatar(AV.sarah, 'MP', 'Maya Perez', '', 'size-6')}</div><div class="p-4">${pageSkel(9)}</div>`;
      s.w.append(page);
      const launch = mk('button', 'absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg transition-transform', I('message-square', 'size-5')); launch.type = 'button'; launch.setAttribute('aria-label', 'Open chat'); page.append(launch);
      const pop = mk('div', 'rui-card absolute right-3 bottom-3 z-20 w-[min(calc(100%-1.5rem),22rem)] overflow-hidden shadow-xl'); pop.style.height = 'min(500px, calc(100% - 1.5rem))'; pop.style.transformOrigin = 'bottom right'; pop.hidden = true;
      pop.innerHTML = `<div class="flex items-center gap-1.5 px-3 py-2"><span class="text-sm font-medium">Research Chat</span>${badge('Beta', 'secondary')}<span class="flex-1"></span>${ibh('square-pen', 'New chat', 'icon-xs')}${ibh('history', 'History', 'icon-xs')}${ibh('maximize-2', 'Expand', 'icon-xs')}${ibh('minus', 'Minimize', 'icon-xs')}${ibh('x', 'End chat', 'icon-xs')}</div>`;
      const v = vpBox(0, 'gap-3 px-3 pb-3'); v.style.flex = '1'; v.style.height = 'auto'; pop.append(v);
      const cmp = composer({ placeholder: 'Ask about this page', tools: ibh('plus', 'Attach', 'icon-xs'), cls: 'mx-3' }); pop.append(cmp, mk('div', 'py-1.5')); pop.lastElementChild.append(disclaimer('Replies can be wrong. Check before acting.'));
      const intro = mk('div', 'flex flex-col gap-3 pt-2 text-sm'); intro.innerHTML = '<div><div class="font-medium">Hi Maya</div><div class="text-muted-foreground">I read API Health and anything you attach.</div></div><div class="text-xs text-muted-foreground">Try Asking</div>';
      const asks = ['Why did p95 double on eu-west?', 'Which endpoints fail the most?', 'How do we fix the slowdown?', 'Draft a status update for customers', 'What changed in release 3.4?'].map((q) => { const b = mk('button', 'flex items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm text-foreground/80 hover:bg-muted', `${I('chevron-right', 'size-3.5 text-muted-foreground')}${q}`); b.type = 'button'; intro.append(b); return b; });
      v.c.classList.remove('justify-end'); v.c.append(intro); page.append(pop);
      const open = () => { pop.hidden = false; launch.style.transform = 'scale(0)'; if (!REDUCE) { pop.style.opacity = '0'; pop.style.transform = 'scale(.92) translateY(8px)'; tick(() => { pop.style.transition = `opacity .25s ${EO}, transform .3s ${EO}`; pop.style.opacity = '1'; pop.style.transform = 'none'; }); } };
      launch.onclick = open;
      await sleep(t, 1000); await press(launch, t, 220);
      await sleep(t, 1500); await press(asks[0], t, 240, false);
      intro.remove(); v.c.classList.add('justify-end');
      add(v.c, userMsg('Why did p95 double on eu-west?'));
      const a = aiMsg(false); add(v.c, a); a.body.append(marker(`<span class="rui-ti size-4 shrink-0">${spin()}</span><span class="rui-shimmer">Reading API Health</span>`)); await sleep(t, 1200); a.body.innerHTML = '';
      for (const para of ['p95 on eu-west went from **240ms to 510ms** at 14:05, and the whole rise sits on **POST /api/checkout/confirm**.', 'The tax client began retrying twice at 400ms each. Rolling it back to 1.8.3 should bring p95 home within minutes.']) { const p = mk('p'); a.body.append(p); await mdStick(v, p, para, t, 22); }
    } });

  /* --------------------------------------------------- solution-agents-3 */
  demos.push({ group: G, title: 'Agent Run Step Trace', kind: 'lib',
    desc: 'One run of an agent as a vertical step trace: steps settle with their tool calls, a declined capture fails step 3 into an alert, and Retry Step finishes the run.' + PRO + ' The Run Settings side panel is left out.',
    async run(root, t) {
      const STEPS = [['Plan the refund approach', '14s', 2], ['Validate the refund policy', '9s', 1], ['Capture the partial refund', '12s', 2], ['Verify the refund landed', '6s', 1], ['Notify the customer', '3s', 1], ['Write back to the order record', '2s', 1]];
      const s = blockStage(root, 'min-h-[620px]', 'max-w-xl');
      const hd = mk('div', 'flex flex-wrap items-start gap-2');
      hd.innerHTML = `<span class="mt-1 text-muted-foreground">${I('arrow-left')}</span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><span class="text-sm text-muted-foreground">Run Queue /</span><span class="text-base font-semibold">RUN-4822</span><span class="rui-b flex"></span></div><div class="text-xs text-muted-foreground">Refund Resolver · Production</div></div>`;
      const retryTop = btn('Retry Step', 'default', 'sm', 'refresh-cw'); retryTop.disabled = true; hd.append(retryTop); s.w.append(hd);
      const setB = (html) => { hd.querySelector('.rui-b').innerHTML = html; };
      const fr = mk('div', 'rui-frame w-full'); const fh = mk('div', 'px-3 py-1.5'); fh.innerHTML = '<div class="text-sm font-semibold">Step Trace</div><div class="rui-sub text-xs text-muted-foreground">Running step 1 of 6</div>'; const pn = mk('div', 'rui-fpanel px-3 py-3'); fr.append(fh, pn); s.w.append(fr);
      const sub = (x) => { fh.querySelector('.rui-sub').textContent = x; };
      const list = mk('div', 'relative flex flex-col gap-3'); pn.append(list);
      const items = STEPS.map(([ti, d, n], i) => {
        const it = mk('div', 'relative flex gap-3'); it.innerHTML = `${i < STEPS.length - 1 ? '<span class="rui-ln absolute top-6 -bottom-3 left-[9px] w-px bg-border"></span>' : ''}<span class="rui-dot relative z-[1] mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border bg-[var(--card)]"></span><div class="flex min-w-0 flex-1 flex-col gap-1.5"><div class="flex items-center gap-2 text-sm"><span class="font-medium">${ti}</span><span class="rui-d text-xs text-muted-foreground tabular-nums"></span></div></div>`;
        const tc = coll(mk('span', 'rui-cnt text-sm text-muted-foreground', '0 tool calls'), { chevron: false });
        tc.trigger.className = 'rui-tct justify-between rounded-md border border-border bg-muted/40 px-3 py-1.5'; tc.trigger.style.width = '100%'; tc.trigger.insertAdjacentHTML('beforeend', `<span class="rui-ti rui-chev">${I('chevron-right')}</span>`); tc.body.className = 'flex flex-col gap-2 rounded-b-md border border-t-0 border-border px-3 py-2.5 text-xs text-muted-foreground';
        it.querySelector('.flex-1').append(tc.el); list.append(it); it.tc = tc; return it;
      });
      const dot = (i, st) => { const d = items[i].querySelector('.rui-dot'); d.className = 'rui-dot relative z-[1] mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border'; if (st === 'done') { d.classList.add('border-transparent', 'bg-[var(--primary)]', 'text-[var(--primary-foreground)]'); d.innerHTML = I('check', 'size-3'); } else if (st === 'failed') { d.classList.add('border-transparent', 'bg-[var(--destructive)]/15', 'text-[var(--destructive)]'); d.innerHTML = I('x', 'size-3'); } else if (st === 'running') { d.classList.add('border-border', 'bg-[var(--card)]'); d.innerHTML = spin('size-3'); } else { d.classList.add('border-border', 'bg-[var(--card)]'); d.innerHTML = ''; } };
      const call = (name, note, dur, ok) => `<div class="flex items-center gap-2"><div class="min-w-0 flex-1"><div class="font-mono text-foreground">${name}</div><div>${note}</div></div><span class="tabular-nums">${dur}</span>${ok === true ? badge('Done', 'success-light') : ok === false ? badge('Failed', 'destructive-light') : spin('size-3.5')}</div>`;
      STEPS.forEach((_, i) => dot(i, 'pending')); setB(badge('Running', 'info-light'));
      const runStep = async (i) => { sub(`Running step ${i + 1} of 6`); dot(i, 'running'); const n = STEPS[i][2]; for (let k = 1; k <= n; k++) { await sleep(t, 450); items[i].tc.line.textContent = `${k} tool call${k > 1 ? 's' : ''}`; } await sleep(t, 300); dot(i, 'done'); items[i].querySelector('.rui-d').textContent = STEPS[i][1]; };
      await sleep(t, 400); await runStep(0); await runStep(1);
      sub('Running step 3 of 6'); dot(2, 'running'); const tc = items[2].tc; tc.set(true);
      tc.body.innerHTML = '<p>The processor declined the partial capture on the original card.</p><div class="h-px bg-border"></div>';
      for (const [k, d] of [[1, '6.1s'], [2, '5.8s']]) { tc.body.insertAdjacentHTML('beforeend', call('payments.refunds.create', `402 card_declined, attempt ${k} of 3`, '', null)); await sleep(t, 1000); tc.body.lastElementChild.outerHTML = call('payments.refunds.create', `402 card_declined, attempt ${k} of 3`, d, false); tc.line.textContent = `${k} tool call${k > 1 ? 's' : ''}`; }
      dot(2, 'failed'); items[2].querySelector('.rui-d').textContent = '12s'; setB(badge(`${I('triangle-alert')}Failed`, 'destructive-light')); sub('Failed at step 3 of 6');
      const alert = mk('div', 'flex flex-wrap items-start gap-2 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-3 py-2.5 text-[var(--destructive)]', `${I('circle-alert', 'size-4 mt-px shrink-0')}<div class="min-w-0 flex-1"><div class="text-sm font-medium">Partial Capture Declined</div><div class="text-xs opacity-90">payments.refunds.create returned 402 card_declined. Retry with a manual amount or credit the account instead.</div></div>`);
      const retry = btn('Retry Step', 'default', 'xs'); alert.append(retry); tc.body.append(alert); appear(alert, 3); retryTop.disabled = false;
      const doRetry = async () => {
        retry.disabled = retryTop.disabled = true; alert.remove(); setB(badge('Running', 'info-light')); sub('Retrying step 3 of 6'); dot(2, 'running');
        tc.body.insertAdjacentHTML('beforeend', call('payments.refunds.create', 'manual amount $48.00, attempt 3 of 3', '', null)); await sleep(t, 1100);
        tc.body.lastElementChild.outerHTML = call('payments.refunds.create', '200 refunded $48.00, attempt 3 of 3', '4.9s', true); tc.line.textContent = '3 tool calls'; dot(2, 'done');
        await sleep(t, 500); tc.set(false);
        for (let i = 3; i < STEPS.length; i++) await runStep(i);
        setB(badge(`${I('check')}Completed`, 'success-light')); sub('Completed 6 of 6 steps');
      };
      retry.onclick = doRetry; retryTop.onclick = doRetry;
      await sleep(t, 1800); await press(retry, t, 260);
    } });


  /* ============================================ c-bubble / c-marker / c-attachment */
  demos.push({ group: G, title: 'Long Reply with Show More', kind: 'lib',
    desc: 'A long assistant answer streams its lead paragraph, then folds the rest behind a Show more link that opens the Collapsible and rotates its chevron.',
    async run(root, t) {
      const LEAD = 'Checkout slowed down at 21:40 because the connection pool hit its ceiling and every new request queued behind one that was already running.';
      const REST = ['The payments worker had retried a batch of 1,200 webhook deliveries after a processor timeout, and each retry opened a connection of its own.', 'We raised the pool to 60 and capped the worker at 8 concurrent deliveries. The p95 was back under 400ms four minutes later.', 'The follow up is a backoff on that worker, so a single processor timeout cannot turn into a retry storm again.'];
      const s = stage(root, 'min-h-[420px]', 'max-w-sm gap-4');
      add(s.w, bubble('default', 'Why did checkout slow down last night?', 'end'));
      await sleep(t, 500);
      const b = bubble('muted'); add(s.w, b); b.c.innerHTML = dots(); await sleep(t, 800); b.c.innerHTML = '';
      const col = mk('div', 'flex flex-col gap-2'); b.c.append(col);
      const lead = mk('p'); col.append(lead); await stream(lead, LEAD, t, 30);
      const panel = mk('div', 'overflow-hidden'); const inner = mk('div', 'flex flex-col gap-2'); REST.forEach((p) => inner.append(mk('p', '', esc(p)))); panel.append(inner); col.append(panel);
      const trig = mk('button', 'rui-btn w-fit', ''); trig.type = 'button'; trig.dataset.v = 'link'; trig.dataset.s = 'sm';
      const o = { panel, trigger: trig, isOpen: false };
      const paint = () => { trig.innerHTML = `<span>${o.isOpen ? 'Show less' : 'Show more'}</span><span class="inline-flex transition-transform" style="transform:rotate(${o.isOpen ? 180 : 0}deg)">${I('chevron-down')}</span>`; };
      setOpen(o, false, true); paint(); trig.onclick = () => { setOpen(o, !o.isOpen); paint(); };
      col.append(trig); appear(trig, 3);
      await sleep(t, 1500); await press(trig, t, 240);
      await sleep(t, 3200); await press(trig, t, 240);
    } });

  demos.push({ group: G, title: 'Formatted Assistant Answer', kind: 'lib',
    desc: 'A ghost bubble streams a small document: an intro, a heading, a bulleted list with emphasis and inline code, then a muted closing line with a link.',
    async run(root, t) {
      const s = stage(root, 'min-h-[460px]', 'max-w-xl gap-4');
      add(s.w, bubble('muted', 'Summarise what changed in 3.4 for the release note.', 'end'));
      await sleep(t, 500);
      const b = bubble('ghost'); add(s.w, b); b.c.innerHTML = thinking('Reading the 3.4 changelog'); await sleep(t, 1000); b.c.innerHTML = '';
      const col = mk('div', 'flex flex-col gap-3'); b.c.append(col);
      const p = mk('p'); col.append(p); await md(p, '3.4 is a reliability release. Nothing in it changes an API, and three fixes are worth naming in the note.', t, 26);
      add(col, mk('h4', 'font-semibold', 'What changed'), 3); await sleep(t, 250);
      const ul = mk('ul', 'ms-4 list-disc space-y-1 marker:text-muted-foreground'); col.append(ul);
      for (const li of ['**Refund webhooks** retry for up to a minute, so a `charge.refunded` event no longer drops when the processor is slow to answer.', '**Group membership** stays in step with the identity provider, including the removals that used to need a manual resync.', '**CSV exports** finish at every accepted size. The 250MB ceiling that failed silently is gone.']) { const l = mk('li'); ul.append(l); await md(l, li, t, 24); }
      const end = mk('p', 'text-muted-foreground'); col.append(end); await stream(end, 'Everything else is unchanged. ', t, 30);
      const a = mk('a', 'underline underline-offset-4', 'Open the full diff'); a.href = '#'; a.onclick = (e) => e.preventDefault(); end.append(a); appear(a, 2);
    } });

  const mIcon = (html) => `<span class="rui-marker-ic flex size-4 shrink-0 items-center justify-center">${html}</span>`;
  demos.push({ group: G, title: 'Tool Call Log with Icon Markers', kind: 'lib',
    desc: 'Tool calls land as icon Markers one under another; each shows its present-tense label with a spinner while it runs, then settles to its icon and past-tense result.',
    async run(root, t) {
      const CALLS = [['git-branch', 'Checking out fix/rate-limit-window', 'Checked out fix/rate-limit-window'], ['search', 'Searching 214 files for rateLimit(', 'Searched 214 files for rateLimit('], ['file-text', 'Reading src/lib/rate-limit.ts', 'Read src/lib/rate-limit.ts'], ['pencil', 'Editing src/lib/rate-limit.ts', 'Edited src/lib/rate-limit.ts, 2 hunks'], ['terminal', 'Running pnpm test rate-limit', 'Ran pnpm test rate-limit'], ['book-open', 'Reading the Upstash quota docs', 'Read the Upstash quota docs']];
      const s = stage(root, 'min-h-[360px]', 'max-w-sm gap-3');
      await sleep(t, 300);
      for (const [ic, run, done] of CALLS) {
        const m = marker(`${mIcon(spin())}<span class="min-w-0 rui-shimmer">${run}</span>`); m.setAttribute('role', 'status'); add(s.w, m, 4);
        await sleep(t, 800); m.removeAttribute('role'); m.innerHTML = `${mIcon(I(ic))}<span class="min-w-0">${done}</span>`;
      }
    } });

  demos.push({ group: G, title: 'Run Status Markers with a Live Step', kind: 'lib',
    desc: 'An agent-run card fills with status Markers: checks for finished steps, a destructive badge for the failed type check, and a pulsing live step with a spinner that keeps working.',
    async run(root, t) {
      const s = stage(root, 'min-h-[380px]', 'max-w-sm');
      const card = mk('div', 'rui-card w-full'); card.innerHTML = '<div class="grid gap-1 px-4 pt-4 pb-3"><div class="text-base leading-snug font-medium">Agent run</div><div class="font-mono text-sm text-muted-foreground">fix/rate-limit-window</div></div>';
      const list = mk('div', 'flex flex-col gap-3 px-4 pb-4'); card.append(list); s.w.append(card);
      const live = (label) => { const m = marker(`${mIcon(spin('size-full'))}<span class="min-w-0"><span class="sr-only">In progress: </span><span class="${REDUCE ? '' : 'rui-pulse'}">${label}</span></span>`); m.setAttribute('role', 'status'); return m; };
      const STEPS = [['Reading src/lib/rate-limit.ts', 'Read src/lib/rate-limit.ts', 1], ['Reproducing the 429 on staging', 'Reproduced the 429 on staging', 1], ['Widening the window to 60s', 'Widened the window to 60s', 1], ['Type checking the change', 'Type check failed in src/db/schema.ts', 0]];
      await sleep(t, 400);
      for (const [run, done, ok] of STEPS) {
        const m = live(run); add(list, m, 4); await sleep(t, 1000);
        m.removeAttribute('role'); m.innerHTML = ok ? `${mIcon(I('circle-check'))}<span class="min-w-0">${done}</span>` : `${mIcon(I('x'))}<span class="min-w-0 flex-1">${done}</span>${badge('failed', 'destructive-light')}`;
      }
      await sleep(t, 500); add(list, live('Re-running the test suite'), 4);
    } });

  demos.push({ group: G, title: 'Run Log Grouped by Phase', kind: 'lib',
    desc: 'Separator Markers split an agent run into Plan, Edit and Verify; each phase divider lands first and its steps tick in beneath it while the run timer counts.',
    async run(root, t) {
      const PH = [['Plan', [['search', 'Searched 214 files for rateLimit('], ['file-text', 'Read src/lib/rate-limit.ts'], ['list-checks', 'Drafted a 3 step plan']]], ['Edit', [['pencil', 'Widened the window to 60s'], ['code', 'Wired the limiter into the send route'], ['git-branch', 'Committed to fix/rate-limit-window']]], ['Verify', [['terminal', 'Ran pnpm test rate-limit'], ['flask-conical', 'Confirmed the 429 no longer fires']]]];
      const s = stage(root, 'min-h-[460px]', 'max-w-md');
      const card = mk('div', 'rui-card w-full'); card.innerHTML = '<div class="grid gap-1 px-4 pt-4 pb-3"><div class="text-base leading-snug font-medium">Agent run</div><div class="rui-sub text-sm text-muted-foreground tabular-nums">auth-rate-limit, 0s</div></div>';
      const list = mk('div', 'flex flex-col gap-2 px-4 pb-4'); card.append(list); s.w.append(card);
      let sec = 0; const sub = card.querySelector('.rui-sub'); const fmt = (n) => (n >= 60 ? `${Math.floor(n / 60)}m ${n % 60}s` : `${n}s`);
      const clock = t.every(REDUCE ? 1000 : 110, () => { if (sec < 108) { sec++; sub.textContent = `auth-rate-limit, ${fmt(sec)}`; } });
      await sleep(t, 300);
      for (const [name, steps] of PH) {
        add(list, marker(`<span class="min-w-0 flex-none text-center">${name}</span>`, 'separator'), 3); await sleep(t, 300);
        for (const [ic, label] of steps) { const m = marker(`${mIcon(spin())}<span class="min-w-0 rui-shimmer">${label}</span>`); add(list, m, 3); await sleep(t, 650); m.innerHTML = `${mIcon(I(ic))}<span class="min-w-0">${label}</span>`; }
      }
      t.stop(clock); sub.textContent = 'auth-rate-limit, 1m 48s';
    } });

  const attDot = '<span aria-hidden="true" class="mx-1.5 inline-block size-1 rounded-full bg-muted-foreground/40 align-middle"></span>';
  demos.push({ group: G, title: 'File Attachment in a Reply', kind: 'lib',
    desc: 'The reply text streams, then the file it produced lands as an Attachment, shimmering while it is generated before it settles with its type, size and a download action.',
    async run(root, t) {
      const s = stage(root, 'min-h-[320px]', 'max-w-sm gap-3');
      await sleep(t, 300);
      const p = mk('p', 'text-sm'); s.w.append(p); await stream(p, 'Here is the cohort breakdown you asked for. Numbers run through 30 September.', t, 32);
      const a = attachment({ state: 'processing', title: 'retention-cohorts-q3.pdf', desc: 'Generating PDF', media: spin(), style: 'width:100%' }); add(s.w, a);
      await sleep(t, 1700);
      a.set({ state: 'done', media: I('file-text'), desc: `PDF${attDot}1.9 MB`, actions: `<button type="button" class="rui-btn" data-v="secondary" data-s="icon-sm" aria-label="Download retention-cohorts-q3.pdf">${I('download')}</button>` });
    } });

  demos.push({ group: G, title: 'Upload Queue in Five States', kind: 'lib',
    desc: 'An upload queue moves through idle, uploading, processing, error and done: progress ticks, a scan shimmers, a dropped file is retried and the counter above keeps score.',
    async run(root, t) {
      const MEDIA = { idle: I('clock'), uploading: spin(), processing: I('file-text'), error: I('triangle-alert'), done: I('check') };
      const rows = [['annual-plan-terms.pdf', 'idle', 'Ready to upload', '1.2 MB'], ['session-replay.mp4', 'uploading', 'Uploading', '0%'], ['chargeback-export.csv', 'processing', 'Scanning for card numbers', '3.1 MB'], ['ledger-2024.xlsx', 'uploading', 'Uploading', '0%'], ['dispute-evidence.pdf', 'done', 'Uploaded', '840 KB']].map(([name, state, note, detail]) => ({ name, state, note, detail }));
      const s = stage(root, 'min-h-[460px]', 'max-w-xl gap-2');
      const count = mk('p', 'text-xs text-muted-foreground'); count.setAttribute('aria-live', 'polite'); s.w.append(count);
      const paint = (r) => {
        const busy = r.state === 'uploading' || r.state === 'processing';
        r.el.set({ state: r.state, media: MEDIA[r.state], desc: `${r.note}${attDot}${r.detail}`, actions: `${r.state === 'error' ? `<button type="button" class="rui-btn rui-retry" data-v="ghost" data-s="icon-xs" aria-label="Retry ${r.name}">${I('rotate-ccw')}</button>` : ''}<button type="button" class="rui-btn rui-rm" data-v="ghost" data-s="icon-xs" aria-label="${busy ? 'Cancel upload of' : 'Remove'} ${r.name}">${I('x')}</button>` });
        r.el.querySelector('.rui-att-desc').title = `${r.note} (${r.detail})`;
        const rt = r.el.querySelector('.rui-retry'); if (rt) rt.onclick = () => retry(r);
        r.el.querySelector('.rui-rm').onclick = () => { r.el.remove(); rows.splice(rows.indexOf(r), 1); paintCount(); };
        paintCount();
      };
      const paintCount = () => { count.textContent = rows.length ? `${rows.filter((r) => r.state === 'done').length} of ${rows.length} uploaded` : 'Nothing left in the queue.'; };
      const set = (r, q) => { Object.assign(r, q); paint(r); };
      const retry = async (r) => { set(r, { state: 'uploading', note: 'Uploading', detail: '0%' }); for (let p = 20; p <= 100; p += 20) { await sleep(t, 220); set(r, { detail: p + '%' }); } set(r, { state: 'done', note: 'Uploaded', detail: '640 KB' }); };
      for (const r of rows) { r.el = attachment({ title: r.name, style: 'width:100%' }); paint(r); add(s.w, r.el, 4); await sleep(t, 150); }
      const [terms, replay, scan, ledger] = rows;
      for (let p = 0; p <= 60; p += 12) { set(replay, { detail: p + '%' }); if (p <= 36) set(ledger, { detail: p + '%' }); await sleep(t, 220); }
      set(ledger, { state: 'error', note: 'Failed', detail: 'connection dropped' });
      set(terms, { state: 'uploading', note: 'Uploading', detail: '0%' });
      for (let p = 72; p <= 100; p += 14) { set(replay, { detail: Math.min(p, 100) + '%' }); set(terms, { detail: Math.round(p - 60) * 2 + '%' }); await sleep(t, 260); }
      set(replay, { state: 'processing', note: 'Transcoding', detail: '24 MB' }); set(scan, { state: 'done', note: 'Uploaded', detail: '3.1 MB' });
      set(terms, { state: 'done', note: 'Uploaded', detail: '1.2 MB' });
      await sleep(t, 1000); set(replay, { state: 'done', note: 'Uploaded', detail: '24 MB' });
      await sleep(t, 800); await press(ledger.el.querySelector('.rui-retry'), t, 240);
    } });

  return demos;
});
