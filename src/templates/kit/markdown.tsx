import { Fragment, useMemo, useState, type ReactNode } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Minimal markdown for streamed answers: headings, paragraphs, lists, quotes, fenced code, inline code,
 * bold, links and [n] citation chips. It parses whatever prefix has arrived, so half-written blocks
 * (an unclosed code fence, a list still growing) render sensibly; each block blurs in once (BoardUI line motion, .tpl-stream-in). */

hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);

type Block =
  | { t: 'h'; level: number; text: string }
  | { t: 'p' | 'quote'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'code'; lang: string; code: string; open: boolean };

function parse(src: string): Block[] {
  const out: Block[] = [];
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('```')) body.push(lines[j++]);
      out.push({ t: 'code', lang: fence[1] || 'text', code: body.join('\n'), open: j >= lines.length });
      i = j;
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      out.push({ t: 'h', level: h[1].length, text: h[2] });
      continue;
    }
    const q = line.match(/^>\s?(.*)/);
    if (q) {
      out.push({ t: 'quote', text: q[1] });
      continue;
    }
    const li = line.match(/^\s*(?:([-*])|(\d+)\.)\s+(.*)/);
    if (li) {
      const type = li[1] ? 'ul' : 'ol';
      const last = out[out.length - 1];
      if (last && last.t === type) last.items.push(li[3]);
      else out.push({ t: type, items: [li[3]] });
      continue;
    }
    if (!line.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.t === 'p' && lines[i - 1]?.trim()) last.text += ` ${line}`;
    else out.push({ t: 'p', text: line });
  }
  return out;
}

/** Outline badge, full radius: the default citation chip. */
export function Cite({ n, title }: { n: number; title?: string }) {
  return (
    <span
      title={title}
      className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px cursor-default items-center justify-center rounded-full border border-border-button-default bg-background-primary-default px-1 align-middle text-[10.5px] font-semibold text-text-secondary tabular-nums transition-colors hover:border-accent-500/40 hover:bg-accent-500/10 hover:text-accent-500"
    >
      {n}
    </span>
  );
}

/** Turns the plain runs between markdown tokens into richer nodes (mention chips, say). */
export type Decorate = (text: string) => ReactNode;

const plain = (text: string, key: number, decorate?: Decorate) => (decorate ? <Fragment key={key}>{decorate(text)}</Fragment> : text);

function inline(text: string, cite?: (n: number) => ReactNode, decorate?: Decorate): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[\d+\]|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) nodes.push(plain(text.slice(last, m.index), k++, decorate));
    const tok = m[0];
    if (tok.startsWith('`')) nodes.push(<code key={k++} className="rounded-md border border-separator-border bg-background-tertiary-default px-1.5 py-px font-mono text-[0.85em] text-text-primary">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) nodes.push(<strong key={k++} className="font-semibold text-text-primary">{tok.slice(2, -2)}</strong>);
    else if (/^\[\d+\]$/.test(tok)) {
      const n = Number(tok.slice(1, -1));
      nodes.push(<span key={k++}>{cite ? cite(n) : <Cite n={n} />}</span>);
    } else {
      const [, label, href] = tok.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      nodes.push(<a key={k++} href={href} target="_blank" rel="noreferrer" className="text-accent-500 underline underline-offset-2 hover:text-accent-600">{label}</a>);
    }
    last = m.index! + tok.length;
  }
  if (last < text.length) nodes.push(plain(text.slice(last), k++, decorate));
  return nodes;
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={done ? 'Copied' : 'Copy'}
      onClick={() => {
        void navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className={cn('grid size-7 place-items-center rounded-md text-foreground-icon-tertiary transition-[color,background-color,scale] hover:bg-background-tertiary-default hover:text-foreground-icon-primary active:scale-90 [&_svg]:size-3.5', className)}
    >
      {done ? <Check className="animate-in zoom-in-50 fade-in-0 duration-200" /> : <Copy />}
    </button>
  );
}

export type DiffMark = '+' | '-' | ' ' | '@';

/**
 * CodeBlock: a card with a `min-h-9` header (file or label, language tag, copy), highlighted body
 * and optional diff marks per line (8% success / destructive washes with a +/− gutter).
 */
export function CodeBlock({
  lang,
  code,
  title,
  diff,
  numbers,
  caret,
  actions,
  className,
  bodyClassName,
}: {
  lang: string;
  code: string;
  title?: ReactNode;
  diff?: DiffMark[];
  numbers?: boolean;
  caret?: boolean;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const html = useMemo(() => {
    const lines = code.split('\n');
    if (!hljs.getLanguage(lang)) return lines.map((l) => l.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!));
    // Highlight line by line so diff rows and numbers stay aligned with the source.
    return lines.map((l) => hljs.highlight(l, { language: lang, ignoreIllegals: true }).value);
  }, [code, lang]);
  let n = 0;
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border-button-default bg-background-primary-default shadow-xs', className)}>
      <div className="flex min-h-9 items-center gap-2 border-b border-separator-border bg-background-secondary-default/60 ps-3 pe-1">
        {title && <span className="min-w-0 truncate font-mono text-caption-1-regular text-text-secondary">{title}</span>}
        <span className="rounded-md border border-separator-border bg-background-tertiary-default px-1.5 py-px font-mono text-[10.5px] tracking-wide text-text-tertiary uppercase">{lang}</span>
        <span className="ms-auto flex items-center gap-0.5">
          {actions}
          <CopyButton text={code} />
        </span>
      </div>
      <pre className={cn('scrollbar-thin overflow-x-auto py-2.5 font-mono text-[13px] leading-6 [font-variant-ligatures:none]', bodyClassName)}>
        <code className="hljs block min-w-fit">
          {html.map((h, i) => {
            const mark = diff?.[i];
            if (mark !== '@' && mark !== '-') n++;
            return (
              <div
                key={i}
                className={cn(
                  'flex pe-4',
                  mark === '+' && 'bg-[color-mix(in_oklab,#16a34a_9%,transparent)]',
                  mark === '-' && 'bg-[color-mix(in_oklab,#dc2626_9%,transparent)]',
                  mark === '@' && 'bg-background-tertiary-default/70 text-text-tertiary',
                )}
              >
                {numbers && <span className="w-10 shrink-0 pe-3 text-end text-text-tertiary/70 select-none">{mark === '@' || mark === '-' ? '' : n}</span>}
                {diff && <span className={cn('w-5 shrink-0 text-center select-none', mark === '+' && 'text-[#16a34a]', mark === '-' && 'text-[#dc2626]')}>{mark === '@' ? '' : mark === ' ' ? '' : mark === '-' ? '−' : mark}</span>}
                <span className={cn('whitespace-pre', !numbers && !diff && 'ps-3.5')} dangerouslySetInnerHTML={{ __html: h || ' ' }} />
                {caret && i === html.length - 1 && <span className="sui-caret ms-px inline-block h-4 w-[2px] translate-y-1 bg-text-primary" />}
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

/** Renders `text`. No caret while `streaming` (BoardUI): new blocks blur in, then only grow. `cite` overrides the [n] chip; `decorate` enriches plain text. */
export function Markdown({ text, cite, decorate, className }: { text: string; streaming?: boolean; cite?: (n: number) => ReactNode; decorate?: Decorate; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={cn('flex flex-col gap-3 text-body-regular leading-7 text-text-primary', className)}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h':
            return (
              <p key={i} className={cn('tpl-stream-in text-text-primary', b.level === 1 ? 'text-title-3-semibold' : 'text-headline-semibold', i > 0 && 'pt-2')}>
                {inline(b.text, cite, decorate)}
              </p>
            );
          case 'p':
            return (
              <p key={i} className="tpl-stream-in text-pretty">
                {inline(b.text, cite, decorate)}
              </p>
            );
          case 'quote':
            return (
              <blockquote key={i} className="tpl-stream-in border-s-2 border-separator-border ps-4 text-text-secondary">
                {inline(b.text, cite, decorate)}
              </blockquote>
            );
          case 'ul':
          case 'ol': {
            const List = b.t;
            return (
              <List key={i} className={cn('flex flex-col gap-1.5 ps-5 marker:text-text-tertiary', b.t === 'ul' ? 'list-disc' : 'list-decimal')}>
                {b.items.map((it, j) => (
                  <li key={j} className="tpl-stream-in ps-1">
                    {inline(it, cite, decorate)}
                  </li>
                ))}
              </List>
            );
          }
          case 'code':
            return <CodeBlock key={i} className="tpl-stream-in my-1" lang={b.lang} code={b.code} />;
        }
      })}
    </div>
  );
}
