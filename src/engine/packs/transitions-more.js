/* Transitions — six more library transitions (free tier), ported from the transition library and staged
 * as real agent replies: user message → the transition carries the agent's state → the answer streams in.
 *   P6 Text states swap · P9 Number pop-in · P14 Skeleton loader and reveal · P15 Shimmer text
 *   P18 Texts reveal · P34 Banner stacking · P30 Streaming text (the reply itself, 350 ms cross-blur, 60 ms per word)
 * Motion tokens: duration quick 150 · slow 400 · very-slow 500 · stagger 40 — distance micro 4 ·
 * base 8 · medium 12 — blur small 2 · medium 3 — ease smooth-out cubic-bezier(0.22,1,0.36,1). */
export default function pack(h) {
  'use strict';
  const { mk, $, $$, esc, REDUCE } = h;

  if (!document.getElementById('lib-transitions-more-css')) {
    const css = document.createElement('style'); css.id = 'lib-transitions-more-css';
    css.textContent = `
.lib-transitions { --tdm-text:#0d0d0d; --tdm-muted:#5e6073; --tdm-subtle:#8f8f8f; --tdm-surface:#ffffff; --tdm-bubble:#f1f1f1; --tdm-chip:#f4f4f5; --tdm-skeleton:#eeeeef; --tdm-p14-skeleton:#eeeeee;
  --tdm-material-shadow:0 4px 42px 0 rgba(0,0,0,.06), 0 2px 6px 0 rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.06);
  --tdm-p14-shadow:0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.03); --tdm-p15-base:#7c7c7c; --tdm-p15-highlight:#0d0d0d;
  --tdm-green:#1a9e5c; --tdm-ease:cubic-bezier(0.22,1,0.36,1); }
.dark .lib-transitions { --tdm-text:#ffffff; --tdm-muted:#767676; --tdm-subtle:#8f8f8f; --tdm-surface:#181818; --tdm-bubble:#232323; --tdm-chip:rgba(255,255,255,.07); --tdm-skeleton:rgba(238,238,239,.1); --tdm-p14-skeleton:rgba(255,255,255,.08);
  --tdm-material-shadow:0 1px 3px 0 rgba(0,0,0,.04), inset 0 1px 0 0 rgba(255,255,255,.04), inset 0 0 0 1px rgba(0,0,0,.06), inset 0 -1px 0 0 rgba(0,0,0,.06), inset 0 0 0 1px rgba(196,196,196,.08);
  --tdm-p14-shadow:0 0 0 1px rgba(255,255,255,.06), 0 1px 2px rgba(0,0,0,.4); --tdm-p15-base:#6e6e6e; --tdm-p15-highlight:#ededed; --tdm-green:#3ccf86; }

/* Chat scene — a material card holding one turn */
.tdm-chat { position:relative; width:100%; max-width:440px; min-height:300px; display:flex; flex-direction:column; gap:14px; padding:18px;
  background:var(--tdm-surface); border-radius:20px; box-shadow:var(--tdm-material-shadow); font-size:13px; line-height:1.5; color:var(--tdm-text); overflow:hidden; }
.tdm-user { align-self:flex-end; max-width:82%; padding:8px 12px; border-radius:18px; background:var(--tdm-bubble); color:var(--tdm-text);
  opacity:0; transform:translateY(8px); filter:blur(2px); transition:opacity 400ms var(--tdm-ease), transform 400ms var(--tdm-ease), filter 400ms var(--tdm-ease); }
.tdm-user.is-in { opacity:1; transform:none; filter:blur(0); }
.tdm-agent { display:flex; gap:10px; align-items:flex-start; min-width:0; }
.tdm-mark { flex:none; width:22px; height:22px; border-radius:50%; display:grid; place-items:center; background:var(--tdm-text); color:var(--tdm-surface); margin-top:-1px; }
.tdm-body { display:flex; flex-direction:column; gap:10px; min-width:0; flex:1; }
.tdm-status { min-height:18px; display:flex; align-items:center; }
.tdm-reply { color:var(--tdm-text); }
.tdm-reply p + p, .tdm-reply ol { margin-top:8px; }
.tdm-reply ol { padding-left:18px; list-style:decimal; } .tdm-reply li + li { margin-top:2px; }
.tdm-reply code { font-family:"JetBrains Mono",ui-monospace,monospace; font-size:12px; padding:1px 5px; border-radius:6px; background:var(--tdm-chip); }
.tdm-w { opacity:0; filter:blur(1px); transition:opacity 350ms var(--tdm-ease), filter 350ms var(--tdm-ease); }
.tdm-w.is-in { opacity:1; filter:blur(0); }
.tdm-meta { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--tdm-subtle); opacity:0; transition:opacity 400ms var(--tdm-ease); }
.tdm-meta.is-in { opacity:1; }

/* P6 — Text states swap */
.tdm-p6 { font-weight:500; font-size:13px; line-height:18px; color:var(--tdm-muted); white-space:nowrap; display:inline-block;
  transform:translateY(0); filter:blur(0); opacity:1; will-change:transform,filter,opacity;
  transition:transform 150ms ease-in-out, filter 150ms ease-in-out, opacity 150ms ease-in-out; }
.tdm-p6.is-exit { transform:translateY(-4px); filter:blur(2px); opacity:0; }
.tdm-p6.is-enter-start { transform:translateY(4px); filter:blur(2px); opacity:0; transition:none; }

/* P9 — Number pop-in */
.tdm-p9 { font-weight:500; font-size:13px; line-height:18px; color:var(--tdm-text); font-variant-numeric:tabular-nums; display:inline-flex; align-items:baseline; position:relative; user-select:none; }
.tdm-p9 .c { display:inline-block; transform:translateY(0); opacity:1; will-change:transform,opacity; }
.tdm-p9.is-animating > .c { animation:tdm-p9-in 500ms cubic-bezier(0.34,1.45,0.64,1) both; }
.tdm-p9.is-animating > .c[data-stagger="1"], .tdm-p9 .g .c[data-stagger="1"] { animation-delay:70ms; }
.tdm-p9.is-animating > .c[data-stagger="2"], .tdm-p9 .g .c[data-stagger="2"] { animation-delay:140ms; }
.tdm-p9 .g { position:absolute; inset:0; display:inline-flex; align-items:baseline; pointer-events:none; }
.tdm-p9 .g .c { animation:tdm-p9-out 500ms cubic-bezier(0.34,1.45,0.64,1) both; }
@keyframes tdm-p9-in { 0% { transform:translate(0,8px); opacity:0; filter:blur(2px) } 100% { transform:translate(0,0); opacity:1; filter:blur(0) } }
@keyframes tdm-p9-out { 0% { transform:translate(0,0); opacity:1; filter:blur(0) } 100% { transform:translate(0,-8px); opacity:0; filter:blur(2px) } }
.tdm-pill { display:inline-flex; align-items:center; gap:8px; height:28px; padding:0 12px; border-radius:999px; background:var(--tdm-chip); font-size:12px; color:var(--tdm-muted); }
.tdm-pill .dot { width:6px; height:6px; border-radius:50%; background:var(--tdm-green); box-shadow:0 0 0 3px color-mix(in srgb, var(--tdm-green) 20%, transparent); }

/* P14 — Skeleton loader and reveal */
.tdm-p14 { position:relative; width:256px; max-width:100%; height:56px; border-radius:12px; background:var(--tdm-surface); box-shadow:var(--tdm-p14-shadow); overflow:hidden; flex:none; }
.tdm-p14 .sk, .tdm-p14 .ct { position:absolute; inset:0; display:flex; align-items:center; gap:12px; padding:12px 16px; }
.tdm-p14 .sk { gap:6px; z-index:1; opacity:1; filter:blur(0); transition:opacity 400ms ease-in-out, filter 400ms ease-in-out; }
.tdm-p14 .ct { z-index:2; opacity:0; filter:blur(2px); transition:opacity 400ms ease-in-out, filter 400ms ease-in-out; }
.tdm-p14 .sk-av { width:32px; height:32px; border-radius:50%; background:var(--tdm-p14-skeleton); flex:none; }
.tdm-p14 .sk-lines { display:flex; flex-direction:column; gap:6px; margin-left:4px; }
.tdm-p14 .sk-name, .tdm-p14 .sk-email { height:12px; border-radius:4px; background:var(--tdm-p14-skeleton); }
.tdm-p14 .sk-name { width:100px; } .tdm-p14 .sk-email { width:131px; max-width:100%; }
.tdm-p14 .sk.is-pulsing > *, .tdm-p14 .sk.is-pulsing .sk-lines > * { animation:tdm-p14-pulse 1000ms ease-in-out infinite; }
@keyframes tdm-p14-pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
.tdm-p14.is-revealed .sk { opacity:0; filter:blur(2px); }
.tdm-p14.is-revealed .ct { opacity:1; filter:blur(0); }
.tdm-p14 .av { width:32px; height:32px; border-radius:50%; flex:none; display:grid; place-items:center; font-size:12px; font-weight:600; color:#fff; background:linear-gradient(135deg,#f59e0b,#ef4444); }
.tdm-p14 .tx { display:flex; flex-direction:column; gap:2px; min-width:0; }
.tdm-p14 .nm { font-size:13px; font-weight:500; color:var(--tdm-text); line-height:16px; }
.tdm-p14 .em { font-size:12px; color:var(--tdm-muted); line-height:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tdm-cards { display:flex; flex-direction:column; gap:8px; }

/* P15 — Shimmer text */
.tdm-p15 { position:relative; display:inline-block; font-size:13px; font-weight:500; line-height:18px; color:var(--tdm-p15-base); white-space:nowrap; }
.tdm-p15::before { content:attr(data-text); position:absolute; inset:0; pointer-events:none;
  background-image:linear-gradient(90deg, transparent 0%, transparent 40%, var(--tdm-p15-highlight) 50%, transparent 60%, transparent 100%);
  background-size:400% 100%; background-repeat:no-repeat; -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent;
  animation:tdm-p15 2000ms linear infinite; }
@keyframes tdm-p15 { 0% { background-position:100% 0 } 100% { background-position:0% 0 } }

/* P18 — Texts reveal (each finished step lands as a headline + detail) */
.tdm-steps { display:flex; flex-direction:column; gap:12px; }
.tdm-step { display:flex; gap:10px; align-items:flex-start; }
.tdm-step .ck { flex:none; width:18px; height:18px; border-radius:50%; display:grid; place-items:center; background:var(--tdm-green); color:#fff; margin-top:2px;
  opacity:0; transform:scale(.6); transition:opacity 400ms var(--tdm-ease), transform 500ms cubic-bezier(0.34,1.45,0.64,1); }
.tdm-step.is-shown .ck { opacity:1; transform:none; }
.tdm-p18 { display:flex; flex-direction:column; gap:2px; min-width:0; }
.tdm-p18 .l { display:block; opacity:0; transform:translateY(12px); filter:blur(3px); will-change:transform,opacity,filter;
  transition:opacity 500ms cubic-bezier(0.22,1,0.36,1), transform 500ms cubic-bezier(0.22,1,0.36,1), filter 500ms cubic-bezier(0.22,1,0.36,1); }
.tdm-p18 .l1 { font-size:13px; font-weight:500; color:var(--tdm-text); line-height:18px; }
.tdm-p18 .l2 { font-size:12px; color:var(--tdm-muted); line-height:16px; transition-delay:40ms; overflow-wrap:anywhere; }
.tdm-step.is-shown .tdm-p18 .l { opacity:1; transform:translateY(0); filter:blur(0); }

/* P34 — Banner stacking (agent notifications) */
.tdm-p34-wrap { margin-top:auto; padding-top:76px; display:flex; justify-content:center; }
.tdm-p34 { position:relative; width:280px; max-width:100%; height:46px; }
.tdm-p34 .b { position:absolute; left:0; bottom:0; display:flex; align-items:center; gap:10px; width:100%; height:46px; padding:0 14px 0 12px;
  background:var(--tdm-surface); border-radius:52px; box-shadow:var(--tdm-material-shadow); transform-origin:50% 50%; filter:blur(0); will-change:transform,opacity,filter;
  transition:transform 350ms cubic-bezier(0.22,1,0.36,1), opacity 350ms cubic-bezier(0.22,1,0.36,1), filter 350ms cubic-bezier(0.22,1,0.36,1); }
.tdm-p34 .b[data-depth="0"] { z-index:3; transform:translateY(0) scale(1); opacity:1; }
.tdm-p34 .b[data-depth="1"] { z-index:2; transform-origin:50% 100%; transform:translateY(-12px) scale(.94); opacity:.6; filter:blur(1px); }
.tdm-p34 .b[data-depth="2"] { z-index:1; transform-origin:50% 100%; transform:translateY(-24px) scale(.88); opacity:.36; filter:blur(2px); }
.tdm-p34.is-spread .b[data-depth="1"], .tdm-p34.is-spread .b[data-depth="2"] { opacity:1; filter:blur(0); }
.tdm-p34.is-spread .b[data-depth="1"] { transform:translateY(calc((100% + 8px) * -1)) scale(1); }
.tdm-p34.is-spread .b[data-depth="2"] { transform:translateY(calc((100% + 8px) * -2)) scale(1); }
.tdm-p34 .b.is-enter { transition:none; transform:translateY(60px) scale(.97); opacity:0; filter:blur(2px); }
.tdm-p34 .b.is-leaving { z-index:0; transform-origin:50% 100%; transform:translateY(-36px) scale(.82); opacity:0; filter:blur(2px);
  transition:transform 250ms cubic-bezier(0.22,1,0.36,1), opacity 250ms cubic-bezier(0.22,1,0.36,1), filter 250ms cubic-bezier(0.22,1,0.36,1); }
.tdm-p34 .ic { flex:none; width:22px; height:22px; border-radius:50%; display:grid; place-items:center; color:#fff; }
.tdm-p34 .tt { display:flex; flex-direction:column; min-width:0; line-height:15px; }
.tdm-p34 .tt b { font-size:12.5px; font-weight:500; color:var(--tdm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tdm-p34 .tt span { font-size:11.5px; color:var(--tdm-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tdm-p34 .ago { margin-left:auto; font-size:11px; color:var(--tdm-subtle); flex:none; }

@media (prefers-reduced-motion: reduce) {
  .tdm-user, .tdm-w, .tdm-meta, .tdm-p6, .tdm-p14 .sk, .tdm-p14 .ct, .tdm-p18 .l, .tdm-step .ck { transition:none !important; }
  .tdm-p9 .c, .tdm-p14 .sk.is-pulsing > *, .tdm-p14 .sk.is-pulsing .sk-lines > * { animation:none !important; }
  .tdm-p15::before { animation:none !important; }
  .tdm-p34 .b { transition:none !important; transform:none !important; filter:none !important; }
}`;
    document.head.append(css);
  }

  /* ------------------------------------------------------------ scene helpers */
  const reflow = (el) => void el.offsetWidth;
  const SPARK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>';
  const CHECK = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  /** Stage + one chat turn: the user's message lands, then the agent column (status slot + reply) is returned. */
  async function chatScene(root, t, userText) {
    const stage = mk('div', 'lib-transitions flex min-h-[380px] w-full items-center justify-center rounded-[20px] p-4 sm:p-6'); root.append(stage);
    const chat = mk('div', 'tdm-chat'); stage.append(chat);
    const user = mk('div', 'tdm-user'); user.textContent = userText; chat.append(user);
    const agent = mk('div', 'tdm-agent'); agent.innerHTML = `<span class="tdm-mark">${SPARK}</span><div class="tdm-body"><div class="tdm-status" role="status"></div><div class="tdm-reply" aria-live="polite"></div></div>`;
    agent.style.opacity = '0'; chat.append(agent);
    await t.sleep(250); user.classList.add('is-in');
    await t.sleep(650); agent.style.transition = 'opacity 300ms ease'; agent.style.opacity = '1';
    return { stage, chat, agent, status: $('.tdm-status', agent), reply: $('.tdm-reply', agent), body: $('.tdm-body', agent) };
  }

  /** P30 streaming text: every word resolves through a 1 px cross-blur over 350 ms, 60 ms apart.
   *  Blocks: strings become paragraphs, arrays become an ordered list; `code` spans keep their chip. */
  async function streamReply(reply, t, blocks, ms = 60) {
    const words = [];
    for (const block of blocks) {
      const host = Array.isArray(block) ? mk('ol') : mk('p'); reply.append(host);
      for (const item of Array.isArray(block) ? block : [block]) {
        const line = Array.isArray(block) ? mk('li') : host; if (line !== host) host.append(line);
        item.split(/(`[^`]+`)/).filter(Boolean).forEach((part) => {
          if (part.startsWith('`')) { const c = mk('code', 'tdm-w'); c.textContent = part.slice(1, -1); line.append(c); words.push(c); return; }
          part.split(/(\s+)/).forEach((w) => { if (!w) return; if (!w.trim()) { line.append(document.createTextNode(w)); return; } const s = mk('span', 'tdm-w'); s.textContent = w; line.append(s); words.push(s); });
        });
      }
    }
    if (REDUCE) { words.forEach((w) => w.classList.add('is-in')); return; }
    for (const w of words) { w.classList.add('is-in'); await t.sleep(ms); }
  }
  const meta = (body, html) => { const m = mk('div', 'tdm-meta', html); body.append(m); h.tick(() => m.classList.add('is-in')); return m; };

  /** P6 three-phase swap: exit up + blur, swap text, jump below without transition, release. */
  async function swapText(el, text, t) {
    if (REDUCE) { el.textContent = text; return; }
    el.classList.add('is-exit'); await t.sleep(150);
    el.textContent = text; el.classList.add('is-enter-start'); reflow(el); el.classList.remove('is-exit', 'is-enter-start');
  }

  return [
    { group: 'Transitions', title: 'Text States Swap',
      desc: 'An agent runs a migration: its status line steps through each phase with the Text states swap — the old label lifts 4 px into a 2 px blur over 150 ms, the next drops in from below — then the reply streams word by word through a soft cross-blur.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Add a created_at column to orders and backfill it.');
        const label = mk('span', 'tdm-p6'); label.textContent = 'Reading 4 files…'; s.status.append(label);
        for (const next of ['Writing the migration…', 'Backfilling 18,204 rows…', 'Running the test suite…', 'Done in 14s']) { await t.sleep(1500); await swapText(label, next, t); }
        await t.sleep(500);
        await streamReply(s.reply, t, ['Added `created_at` to `orders` with a default of `now()`, then backfilled 18,204 existing rows from `order_events`.', 'All 12 tests pass. The migration is reversible and runs in a single transaction.']);
        await t.sleep(3200);
      } },

    { group: 'Transitions', title: 'Number Pop-in',
      desc: 'While a contract summary streams, a live throughput pill ticks with Number pop-in: new digits rise 8 px out of a 2 px blur on a bouncy 500 ms curve, decimals 70 ms apart, as the old ones leave upward — then it settles on the final tally.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Summarize this 40-page vendor contract.');
        const pill = mk('span', 'tdm-pill', '<span class="dot"></span>');
        const num = mk('span', 'tdm-p9'); pill.append(num, document.createTextNode(' tok/s')); s.status.append(pill);
        const render = (str, animate) => {
          $$('.g', num).forEach((g) => g.remove());
          const live = $$(':scope > .c', num);
          if (animate && live.length) { const g = mk('span', 'g'); live.forEach((c) => g.append(c.cloneNode(true))); num.append(g); setTimeout(() => g.remove(), 500 + 140 + 50); }
          num.classList.remove('is-animating'); live.forEach((c) => c.remove());
          const chars = str.split(''); const g = $('.g', num);
          chars.forEach((ch, i) => { const sp = mk('span', 'c'); sp.textContent = ch; if (i === chars.length - 2) sp.dataset.stagger = '1'; else if (i === chars.length - 1) sp.dataset.stagger = '2'; g ? num.insertBefore(sp, g) : num.append(sp); });
          reflow(num); if (animate) num.classList.add('is-animating');
        };
        render('38.40', false);
        let live = true;
        (async () => { while (live && !t.dead) { await t.sleep(900); if (!live) break; render(`${Math.floor(Math.random() * 14) + 34}.${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`, !REDUCE); } })();
        await streamReply(s.reply, t, ['The contract renews automatically for 12 months unless either side gives 60 days’ notice.', ['Fees rise 4% a year, capped at 8% over the term.', 'Liability is capped at 12 months of fees, excluding data breaches.', 'Termination for convenience needs 90 days’ notice and a 15% exit fee.']], 55);
        live = false; await t.sleep(200); render('41.20', !REDUCE);
        await t.sleep(400); meta(s.body, '1,284 tokens · 31.2 s');
        await t.sleep(3200);
      } },

    { group: 'Transitions', title: 'Skeleton Loader and Reveal',
      desc: 'The agent looks up two people: their contact cards pulse as skeletons, then each one cross-fades into the real card with a matching 2 px cross-blur over 400 ms — in place, no layout shift — and the answer streams underneath.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Who owns the Acme account, and who’s their backup?');
        const label = mk('span', 'tdm-p15'); label.dataset.text = 'Looking up the account team'; label.textContent = label.dataset.text; s.status.append(label);
        const cards = mk('div', 'tdm-cards'); s.reply.before(cards);
        const PEOPLE = [['JC', 'Jane Cooper', 'Account owner · jane.cooper@example.com', 'linear-gradient(135deg,#f59e0b,#ef4444)'], ['WW', 'Wade Warren', 'Backup · wade.warren@example.com', 'linear-gradient(135deg,#6366f1,#06b6d4)']];
        const els = PEOPLE.map(([ini, name, line, bg]) => {
          const c = mk('div', 'tdm-p14');
          c.innerHTML = `<div class="sk is-pulsing" aria-hidden="true"><div class="sk-av"></div><div class="sk-lines"><div class="sk-name"></div><div class="sk-email"></div></div></div><div class="ct"><span class="av" style="background:${bg}" aria-hidden="true">${ini}</span><div class="tx"><span class="nm">${esc(name)}</span><span class="em">${esc(line)}</span></div></div>`;
          cards.append(c); return c;
        });
        await t.sleep(1800); els[0].classList.add('is-revealed');
        await t.sleep(900); els[1].classList.add('is-revealed');
        await t.sleep(450); await swapText(label, '', t); label.remove();
        await streamReply(s.reply, t, ['Jane Cooper has owned Acme since March and runs the quarterly reviews. Wade Warren covers renewals while she’s out.']);
        await t.sleep(3400);
      } },

    { group: 'Transitions', title: 'Shimmer Text',
      desc: 'A planning request: the status reads in Shimmer text — a narrow highlight band clipped to the glyphs sweeps the label every 2 s, pure CSS through a data-text ::before layer — until the plan streams in as a numbered list.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Plan the Q3 launch in four steps.');
        const label = mk('span', 'tdm-p15'); label.dataset.text = 'Planning next moves'; label.textContent = label.dataset.text; s.status.append(label);
        await t.sleep(3600);
        await swapText(label, '', t); label.remove(); s.status.remove();
        await streamReply(s.reply, t, ['Here’s a four-step plan:', ['Lock scope by July 8 and freeze the feature list.', 'Run a two-week private beta with 30 design partners.', 'Ship docs, pricing page and changelog together.', 'Launch on a Tuesday with the email and the live demo.']], 55);
        await t.sleep(3400);
      } },

    { group: 'Transitions', title: 'Texts Reveal',
      desc: 'An agent ships a fix: each finished step lands with Texts reveal — the headline and its detail rise 12 px out of a 3 px blur over 500 ms on a smooth-out ease, the detail 40 ms behind — and the reply streams once the run is done.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Fix the flaky checkout test and open a PR.');
        const label = mk('span', 'tdm-p15'); label.dataset.text = 'Working on it'; label.textContent = label.dataset.text; s.status.append(label);
        const steps = mk('div', 'tdm-steps'); s.reply.before(steps);
        const STEPS = [['Found the race', 'checkout.spec.ts waits on a timer instead of the request'], ['Pull request opened', '#482 · Review requested from 3 teammates'], ['All checks passed', '42 tests in 1.8 s, 0 flaky over 20 runs']];
        for (const [a, b] of STEPS) {
          await t.sleep(1300);
          const step = mk('div', 'tdm-step', `<span class="ck">${CHECK}</span><div class="tdm-p18"><strong class="l l1">${esc(a)}</strong><span class="l l2">${esc(b)}</span></div>`);
          steps.append(step); reflow(step); await t.sleep(30); step.classList.add('is-shown');
        }
        await t.sleep(900); await swapText(label, '', t); s.status.remove();
        await streamReply(s.reply, t, ['The test now awaits the `/api/cart` response instead of a 500 ms timeout. PR #482 is ready for review.']);
        await t.sleep(3400);
      } },

    { group: 'Transitions', title: 'Banner Stacking',
      desc: 'A release run reports progress as Banner stacking notifications, three deep: each event rises 60 px out of a 2 px blur at 97 % over 350 ms while older ones step back 12 px — smaller, dimmer, blurrier — and the fourth leaves in 250 ms. Hover the stack to fan it out.', kind: 'lib',
      async run(root, t) {
        const s = await chatScene(root, t, 'Ship v2.4 to production.');
        s.chat.style.minHeight = '360px';
        const label = mk('span', 'tdm-p15'); label.dataset.text = 'Releasing v2.4'; label.textContent = label.dataset.text; s.status.append(label);
        const wrap = mk('div', 'tdm-p34-wrap'); const stack = mk('div', 'tdm-p34'); wrap.append(stack); s.chat.append(wrap);
        // Spread is pointer geometry: it opens over the collapsed stack and holds inside the taller fanned-out column.
        s.chat.addEventListener('pointermove', (e) => {
          const r = stack.getBoundingClientRect(); const spread = stack.classList.contains('is-spread');
          const top = spread ? r.top - (r.height + 8) * 2 : r.top;
          stack.classList.toggle('is-spread', e.clientX >= r.left && e.clientX <= r.right && e.clientY >= top && e.clientY <= r.bottom);
        });
        s.chat.addEventListener('pointerleave', () => stack.classList.remove('is-spread'));
        const EVENTS = [
          ['#6366f1', 'Build started', 'web · api · worker', '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/>'],
          ['#0ea5e9', 'Tests passed', '1,204 tests · 3m 12s', '<path d="M20 6 9 17l-5-5"/>'],
          ['#f59e0b', 'Migration applied', '2 schema changes', '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/>'],
          ['#10b981', 'Deployed to production', 'eu-west · us-east', '<path d="M5 12l5 5L20 7"/>'],
          ['#ec4899', 'Release notes drafted', 'v2.4 · 9 changes', '<path d="M4 4h16v12H5.2L4 17.2V4z"/>'],
        ];
        let banners = [];
        const add = ([color, title, sub, icon]) => {
          const el = mk('div', 'b is-enter', `<span class="ic" style="background:${color}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></span><span class="tt"><b>${esc(title)}</b><span>${esc(sub)}</span></span><span class="ago">now</span>`);
          el.dataset.depth = '0'; banners.unshift(el); stack.append(el);
          banners.forEach((b, i) => {
            if (i === 0) return;
            if (i > 2) { if (!b.classList.contains('is-leaving')) { b.classList.add('is-leaving'); setTimeout(() => b.remove(), 250 + 60); } }
            else { b.dataset.depth = String(i); $('.ago', b).textContent = `${i * 2}s ago`; }
          });
          banners = banners.slice(0, 3);
          reflow(el); el.classList.remove('is-enter');
        };
        for (const ev of EVENTS) { await t.sleep(1300); add(ev); }
        await t.sleep(700); await swapText(label, '', t); s.status.remove();
        await streamReply(s.reply, t, ['v2.4 is live in both regions. Two schema changes applied cleanly and the release notes are drafted for review.']);
        await t.sleep(3600);
      } },
  ];
}
