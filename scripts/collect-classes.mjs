// Regenerates src/styles/safelist.css from the class names the demos actually produce at runtime.
//
// 1. npm run dev
// 2. Start a Chromium browser with a debugging port, e.g.
//    msedge --headless=new --remote-debugging-port=9333 --user-data-dir=<temp dir> about:blank
// 3. node scripts/collect-classes.mjs [http://localhost:5173] [seconds=45] [port=9333]
//
// Every demo runs at once (very tall viewport, list view) while a MutationObserver records each class token.
import { readFileSync, writeFileSync } from 'node:fs';

const [base = 'http://localhost:5173', secs = '45', port = '9333'] = process.argv.slice(2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) pending.get(d.id)(d), pending.delete(d.id);
};
await new Promise((r) => (ws.onopen = r));
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 200000, deviceScaleFactor: 1, mobile: false });
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__cls = new Set(); const add = (el) => el && el.classList && el.classList.forEach((x) => window.__cls.add(x));
    new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'attributes') add(m.target); for (const n of m.addedNodes || []) if (n.nodeType === 1) { add(n); n.querySelectorAll('*').forEach(add); } } })
      .observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });`,
});
await send('Page.navigate', { url: `${base}/?view=list` });
await wait(Number(secs) * 1000);
const res = await send('Runtime.evaluate', { expression: `[...window.__cls]`, returnByValue: true });
// Merge with the current list: a run only sees the states each demo reached in the time given.
const file = new URL('../src/styles/safelist.css', import.meta.url);
let previous = [];
try {
  previous = [...readFileSync(file, 'utf8').matchAll(/@source inline\("([^"]*)"\)/g)].flatMap((m) => m[1].split(' '));
} catch {
  /* first run */
}
const classes = [...new Set([...previous, ...res.result.result.value])].filter((c) => c && !/["\\\s]/.test(c)).sort();

const lines = [];
for (let i = 0; i < classes.length; i += 40) lines.push(`@source inline("${classes.slice(i, i + 40).join(' ')}");`);
writeFileSync(
  file,
  `/* Class names the demos build at runtime (string concatenation, template values), collected by running
 * every demo headless. Tailwind cannot always see them in the source, so they are listed here explicitly.
 * Regenerate after adding demos: node scripts/collect-classes.mjs (see README.md). */
${lines.join('\n')}
`,
);
console.log(`${classes.length} classes written to src/styles/safelist.css`);
await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
ws.close();
