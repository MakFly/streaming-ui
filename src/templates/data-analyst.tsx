import { useState } from 'react';
import { ChartColumn, ChevronDown, Database, Download, Hash, NotebookPen, Plus, Table2, Type, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatEngine, type ChatScriptApi, type Part } from './kit/engine';
import { CodeBlock } from './kit/markdown';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, FramePanel, HeaderButton, Suggestions, Surface, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Data Analyst — ask a question about a dataset. Each answer is a "framed receipt": the SQL streams
 * into a code panel, the query runs, a dense data grid fills row by row and a chart with a stat header
 * grows into place; the takeaways stream underneath as a normal assistant turn. */

const COLUMNS: [string, 'num' | 'text' | 'date'][] = [
  ['order_id', 'num'],
  ['created_at', 'date'],
  ['region', 'text'],
  ['plan', 'text'],
  ['revenue', 'num'],
  ['seats', 'num'],
];

const SQL = `SELECT region,
       SUM(revenue)           AS revenue,
       COUNT(*)               AS orders,
       ROUND(AVG(revenue), 2) AS avg_order
FROM orders
WHERE created_at >= DATE '2025-01-01'
GROUP BY region
ORDER BY revenue DESC;`;

type Row = [string, number, number, number];
const ROWS: Row[] = [
  ['North America', 482_300, 9_412, 51.24],
  ['Europe', 391_850, 8_133, 48.18],
  ['Asia Pacific', 266_400, 6_027, 44.2],
  ['Latin America', 118_900, 3_311, 35.91],
  ['Middle East & Africa', 64_200, 1_874, 34.26],
];

const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const compact = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}K`);

type Receipt = { name: string; dim: string; sql: string; shown: number; status: 'writing' | 'running' | 'done'; rows: Row[]; grown: boolean; delta: string };

async function analyse(api: ChatScriptApi, name: string, dim: string, sql: string, rows: Row[], delta: string, insight: string) {
  const a = api.assistant();
  await a.think('Thinking', ['orders has revenue, region and created_at', `Group by ${dim} for 2025, sort by revenue`], 550);
  const set = a.custom('receipt', { name, dim, sql, shown: 0, status: 'writing', rows: [], grown: false, delta } satisfies Receipt);
  for (let i = 0; i <= sql.length; i += 4) {
    set({ shown: i });
    await api.sleep(18);
  }
  set({ shown: sql.length, status: 'running' });
  await api.sleep(1100);
  set({ status: 'done' });
  for (let i = 1; i <= rows.length; i++) {
    set({ rows: rows.slice(0, i) });
    await api.sleep(150);
  }
  await api.sleep(80);
  set({ grown: true });
  await api.sleep(700);
  await a.stream(insight, 26);
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(500);
  await api.user('Which regions drove revenue this year?', { type: true });
  await analyse(
    api,
    'revenue_by_region.sql',
    'region',
    SQL,
    ROWS,
    '+18.4%',
    `**North America leads with $482K (36%)**, but Europe is close behind at $392K with almost the same order count.

- Average order value falls steadily from NA ($51) to MEA ($34).
- Asia Pacific has the third-largest volume (6K orders) at a lower ticket, a good upsell target.
- The top two regions make up **66%** of revenue.`,
  );
}

async function reply(api: ChatScriptApi, text: string) {
  await analyse(
    api,
    'revenue_by_plan.sql',
    'plan',
    `-- ${text.replace(/\n/g, ' ').slice(0, 70)}\nSELECT plan,\n       SUM(revenue)           AS revenue,\n       COUNT(*)               AS orders,\n       ROUND(AVG(revenue), 2) AS avg_order\nFROM orders\nGROUP BY plan\nORDER BY revenue DESC;`,
    [
      ['Business', 612_400, 7_820, 78.31],
      ['Pro', 488_150, 14_207, 34.36],
      ['Team', 223_100, 6_730, 33.15],
    ],
    '+11.2%',
    `**Business** brings in the most revenue from far fewer orders: its average order is more than twice Pro's. Pro wins on volume with 14K orders.`,
  );
}

/** Data grid, dense: muted header, hairline rows, numeric columns right-aligned, an inline share bar. */
function DataGrid({ rows, dim }: { rows: Row[]; dim: string }) {
  const total = rows.reduce((a, r) => a + r[1], 0);
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[480px] border-separate border-spacing-0 text-body-2-regular">
        <thead>
          <tr className="text-caption-1-medium text-text-tertiary">
            {[dim, 'revenue', 'share', 'orders', 'avg_order'].map((h, i) => (
              <th key={h} className={cn('h-8 border-b border-separator-border bg-background-secondary-default/60 px-3 font-mono font-medium', i === 0 ? 'text-start' : 'text-end', i === 2 && 'w-[120px]')}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} className="sui-row transition-colors hover:bg-background-secondary-default/60">
              <td className={cn('px-3 py-1.5 text-text-primary', i < rows.length - 1 && 'border-b border-separator-border')}>{r[0]}</td>
              <td className={cn('px-3 py-1.5 text-end font-medium tabular-nums', i < rows.length - 1 && 'border-b border-separator-border')}>{money(r[1])}</td>
              <td className={cn('px-3 py-1.5', i < rows.length - 1 && 'border-b border-separator-border')}>
                <span className="flex items-center justify-end gap-2">
                  <span className="h-1.5 w-14 overflow-hidden rounded-full bg-background-tertiary-default">
                    <span className="block h-full rounded-full bg-accent-500" style={{ width: `${(r[1] / max) * 100}%` }} />
                  </span>
                  <span className="w-9 text-end text-caption-1-regular text-text-secondary tabular-nums">{Math.round((r[1] / total) * 100)}%</span>
                </span>
              </td>
              <td className={cn('px-3 py-1.5 text-end text-text-secondary tabular-nums', i < rows.length - 1 && 'border-b border-separator-border')}>{r[2].toLocaleString('en-US')}</td>
              <td className={cn('px-3 py-1.5 text-end text-text-secondary tabular-nums', i < rows.length - 1 && 'border-b border-separator-border')}>${r[3].toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Stat header (card numbers) over bars that grow on the design system's ease, with light gridlines. */
function Chart({ rows, grown, delta }: { rows: Row[]; grown: boolean; delta: string }) {
  const max = Math.max(...rows.map((r) => r[1]));
  const total = rows.reduce((a, r) => a + r[1], 0);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-caption-1-medium text-text-tertiary">Total revenue · 2025</span>
          <span className="flex items-center gap-2">
            <span className="text-title-2-semibold tracking-[-0.02em] tabular-nums">{compact(total)}</span>
            <Badge tone="success">{delta}</Badge>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
          <span className="size-2 rounded-sm bg-accent-500" /> Revenue
        </span>
      </div>
      <div className="relative h-40">
        <div aria-hidden className="absolute inset-0 flex flex-col justify-between pb-5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="border-t border-dashed border-separator-border" />
          ))}
        </div>
        <div className="relative flex h-full items-end gap-3">
          {rows.map((r, i) => (
            <div key={r[0]} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                <div
                  className={cn('relative w-full max-w-12 rounded-t-md transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', i === 0 ? 'bg-accent-500' : 'bg-accent-500/45 group-hover:bg-accent-500/70')}
                  style={{ height: grown ? `${(r[1] / max) * 88}%` : '0%', transitionDelay: `${i * 70}ms` }}
                >
                  <span className={cn('absolute -top-5 left-1/2 -translate-x-1/2 text-caption-1-medium whitespace-nowrap text-text-secondary tabular-nums transition-opacity duration-500', grown ? 'opacity-100' : 'opacity-0')}>{compact(r[1])}</span>
                </div>
              </div>
              <span className="w-full truncate text-center text-caption-2-regular text-text-tertiary">{r[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReceiptView({ r }: { r: Receipt }) {
  const [view, setView] = useState<'table' | 'chart'>('table');
  const status = r.status === 'writing' ? <Badge tone="info">Writing SQL…</Badge> : r.status === 'running' ? <Badge tone="warning">Running…</Badge> : <Badge tone="success" dot>{r.rows.length} rows</Badge>;
  const seg = (on: boolean) => cn('flex h-6 items-center gap-1 rounded-md px-2 text-caption-1-medium transition-colors [&_svg]:size-3.5', on ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary');
  return (
    <Frame>
      <FrameHeader icon={<Database />} title={<span className="font-mono text-body-2-medium">{r.name}</span>}>
        {status}
        {r.status === 'done' && <Badge tone="outline">184 ms</Badge>}
      </FrameHeader>
      <CodeBlock className="rounded-[13px]" lang="sql" title="Postgres · orders" code={r.sql.slice(0, r.shown)} caret={r.status === 'writing'} />
      {r.status === 'running' && (
        <FramePanel className="flex h-24 flex-col justify-center gap-2 px-3">
          {[90, 70, 80].map((w, i) => (
            <span key={i} className="sui-skeleton h-3 rounded bg-background-tertiary-default" style={{ width: `${w}%` }} />
          ))}
        </FramePanel>
      )}
      {r.rows.length > 0 && (
        <FramePanel className="animate-in fade-in-0 duration-300">
          <div className="flex items-center gap-2 border-b border-separator-border px-3 py-1.5">
            <div role="tablist" className="flex rounded-lg bg-background-tertiary-default p-0.5">
              <button type="button" role="tab" aria-selected={view === 'table'} onClick={() => setView('table')} className={seg(view === 'table')}>
                <Table2 /> Table
              </button>
              <button type="button" role="tab" aria-selected={view === 'chart'} onClick={() => setView('chart')} className={seg(view === 'chart')}>
                <ChartColumn /> Chart
              </button>
            </div>
            <span className="ms-auto text-caption-1-regular text-text-tertiary tabular-nums">
              {r.rows.length} of {r.rows.length} rows
            </span>
          </div>
          {view === 'table' ? <DataGrid rows={r.rows} dim={r.dim} /> : <Chart rows={r.rows} grown={r.grown} delta={r.delta} />}
        </FramePanel>
      )}
      {r.grown && view === 'table' && (
        <FramePanel className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
          <Chart rows={r.rows} grown={r.grown} delta={r.delta} />
        </FramePanel>
      )}
      {r.status === 'done' && (
        <FrameFooter>
          <HeaderButton className="h-7 text-caption-1-medium">
            <NotebookPen /> Open in notebook
          </HeaderButton>
          <HeaderButton className="h-7 text-caption-1-medium">
            <Download /> Export CSV
          </HeaderButton>
        </FrameFooter>
      )}
    </Frame>
  );
}

const TYPE_ICON = { num: <Hash className="size-3 text-blue-500" />, text: <Type className="size-3 text-emerald-500" />, date: <CalendarDays className="size-3 text-amber-500" /> };

function DatasetPanel() {
  return (
    <Surface className="h-full w-[260px] shrink-0 gap-5 p-3">
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-headline-semibold">Datasets</span>
        <button type="button" aria-label="Add dataset" className="grid size-7 place-items-center rounded-md text-foreground-icon-secondary hover:bg-background-secondary-hover">
          <Plus className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {[['orders', '48.2K rows', true], ['customers', '9.4K rows', false], ['refunds', '1.1K rows', false]].map(([n, c, on]) => (
          <div key={String(n)} className={cn('flex items-center gap-2 rounded-2lg px-2 py-2 text-body-2-medium', on ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:bg-background-secondary-hover')}>
            <Database className="size-4 shrink-0 text-foreground-icon-secondary" />
            {n}
            <span className="ms-auto text-caption-1-regular text-text-tertiary">{c}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="px-1 pb-1 text-body-2-medium text-text-tertiary">orders · columns</p>
        {COLUMNS.map(([c, t]) => (
          <div key={c} className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-caption-1-regular text-text-secondary hover:bg-background-secondary-hover">
            {TYPE_ICON[t]}
            {c}
            <span className="ms-auto font-sans text-caption-2-regular text-text-tertiary">{t === 'num' ? 'numeric' : t === 'date' ? 'date' : 'text'}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-2lg bg-background-primary-default px-3 py-2.5 shadow-xs">
        <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgb(16_185_129/0.18)]" />
        <span className="flex flex-col leading-tight">
          <span className="text-body-2-medium">Postgres</span>
          <span className="text-caption-1-regular text-text-tertiary">analytics-prod · read-only</span>
        </span>
      </div>
    </Surface>
  );
}

const STARTERS = ['Break it down by plan', 'Show the monthly trend', 'Which region is growing fastest?'];

export default function DataAnalystTemplate() {
  const chat = useChatEngine({ intro, reply });
  const empty = chat.messages.length === 0;
  const last = chat.messages[chat.messages.length - 1];
  const lastUser = [...chat.messages].reverse().find((m) => m.role === 'user');

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => (p.type === 'receipt' ? <ReceiptView r={p.data as unknown as Receipt} /> : null);

  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      variant="panel"
      context={Math.min(88, 22 + chat.messages.length * 9)}
      branch="Main"
      project="analytics"
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder="Ask a question about your data"
      tools={
        <span className="flex h-8 items-center gap-1.5 rounded-full border border-border-button-default px-2.5 font-mono text-caption-1-regular text-text-secondary">
          <Database className="size-3.5 text-accent-500" /> orders
        </span>
      }
    />
  );

  return (
    <Canvas>
      <aside className="hidden lg:flex">
        <DatasetPanel />
      </aside>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        width="max-w-[48rem]"
        header={
          <>
            <HeaderButton outline className="font-mono">
              <Database className="text-accent-500" /> orders <ChevronDown className="text-foreground-icon-secondary" />
            </HeaderButton>
            <Badge tone="success" dot className="hidden sm:inline-flex">
              Connected
            </Badge>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton onClick={chat.reset}>
                <NotebookPen /> <span className="hidden sm:inline">New notebook</span>
              </HeaderButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome title="Ask your data anything" subtitle="Questions become SQL, tables and charts on the orders dataset.">
            <div className="mt-2 w-full text-start">{composer}</div>
            <Suggestions variant="list" items={STARTERS} onPick={chat.send} className="text-start" />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
                {textOf(m)}
              </UserMessage>
            ) : (
              <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} renderCustom={renderCustom} onRegenerate={() => lastUser && chat.send(textOf(lastUser))} />
            ),
          )
        )}
        {last?.role === 'assistant' && last.done && !chat.busy && <Suggestions items={STARTERS} onPick={chat.send} />}
      </ChatSurface>
    </Canvas>
  );
}
