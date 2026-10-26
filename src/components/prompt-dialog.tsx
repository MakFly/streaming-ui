import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

// Every language the prompts fence (typescript covers ts/tsx, javascript covers js/jsx/mjs through their aliases).
for (const [name, lang] of Object.entries({ markdown, bash, typescript, javascript, css, json })) hljs.registerLanguage(name, lang);

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/**
 * hljs's markdown grammar paints a fenced block in one colour. Split on the fences instead: the prose stays
 * Markdown, each block's body is highlighted in the language its fence names (plain text when unknown).
 * A fence closes on a line of exactly its own backticks, so blocks quoting ``` inside (longer fences) stay whole.
 */
function highlightPrompt(prompt: string) {
  // 30–50 ms for a 50 KB prompt: reopening the same prompt (or StrictMode's second pass) reuses the result.
  const hit = highlighted.get(prompt);
  if (hit !== undefined) return hit;
  const html = highlightFences(prompt);
  highlighted.set(prompt, html);
  if (highlighted.size > 8) highlighted.delete(highlighted.keys().next().value!);
  return html;
}
const highlighted = new Map<string, string>();

function highlightFences(prompt: string) {
  const lines = prompt.split('\n');
  const out: string[] = [];
  let prose: string[] = [];
  const flush = () => {
    if (prose.length) out.push(hljs.highlight(prose.join('\n'), { language: 'markdown', ignoreIllegals: true }).value);
    prose = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(`{3,})([\w+-]*)\s*$/);
    const close = open ? lines.findIndex((l, j) => j > i && l.trimEnd() === open[1]) : -1;
    if (!open || close < 0) {
      prose.push(lines[i]);
      continue;
    }
    flush();
    const body = lines.slice(i + 1, close).join('\n');
    const lang = open[2] && hljs.getLanguage(open[2]) ? open[2] : null;
    const code = lang ? hljs.highlight(body, { language: lang, ignoreIllegals: true }).value : escapeHtml(body);
    out.push([`<span class="hljs-code">${escapeHtml(lines[i])}</span>`, ...(close > i + 1 ? [code] : []), `<span class="hljs-code">${escapeHtml(lines[close])}</span>`].join('\n'));
    i = close;
  }
  flush();
  return out.join('\n');
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export interface PromptDialogProps {
  title: string;
  /** Docs or source link shown under the title. */
  href?: string;
  hrefLabel?: string;
  /** Name shown on the code block, e.g. web-search.prompt.md */
  fileName: string;
  /** Name of the downloaded .md file. */
  downloadName: string;
  /** Builds the prompt; must be stable (memoized) for a given subject. */
  load: () => Promise<string>;
  onClose: () => void;
}

/**
 * Markdown rebuild prompt in a dialog (demos and templates): highlighted, copyable, downloadable.
 * Full screen on phones.
 */
export default function PromptDialog({ title, href, hrefLabel, fileName, downloadName, load, onClose }: PromptDialogProps) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setPrompt(null);
    load().then((p) => alive && setPrompt(p));
    return () => {
      alive = false;
    };
  }, [load]);

  const html = useMemo(() => {
    if (!prompt) return '';
    try {
      return highlightPrompt(prompt);
    } catch {
      return escapeHtml(prompt);
    }
  }, [prompt]);

  const copy = async () => {
    if (!prompt) return;
    await copyText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const download = () => {
    if (!prompt) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([prompt], { type: 'text/markdown' }));
    a.download = downloadName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-none rounded-2xl border border-border-button-default max-sm:inset-2 max-sm:h-auto max-sm:w-auto max-sm:translate-x-0 max-sm:translate-y-0 sm:h-[min(88vh,900px)] sm:w-[min(94vw,1040px)] sm:rounded-3xl sm:border sm:border-border-button-default">
        <DialogHeader className="border-b border-separator-border px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="flex min-w-0 flex-col gap-0.5 pe-10">
            <DialogTitle className="truncate">
              {title}
            </DialogTitle>
            {href && (
              <a
                className="w-fit max-w-full truncate font-mono text-caption-1-regular text-text-tertiary underline decoration-transparent underline-offset-2 hover:text-text-secondary hover:decoration-current"
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                {hrefLabel ?? href}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DialogDescription className="min-w-0 truncate">
              {prompt ? `${prompt.length.toLocaleString()} characters · Markdown` : 'Rebuild prompt · Markdown'}
            </DialogDescription>
            {prompt && (
              <div className="ms-auto flex items-center gap-2">
                <Button className="gap-1 px-2.5" onClick={copy}>
                  <Icon name="file-copy-line" className="size-4" />
                  <span aria-live="polite">{copied ? 'Copied' : 'Copy prompt'}</span>
                </Button>
                <Button className="gap-1 px-2.5" onClick={download}>
                  <Icon name="download-2-line" className="size-4" />
                  <span>.md</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6">
          {prompt ? (
            <section className="shrink-0 overflow-hidden rounded-xl border border-border-button-default bg-docs-code-background">
              <header className="flex min-h-10 items-center gap-2 border-b border-separator-border px-3 py-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-caption-1-medium text-text-primary" title={fileName}>
                  {fileName}
                </span>
                <span className="font-mono text-caption-2-regular text-text-tertiary uppercase">markdown</span>
              </header>
              <pre className="scrollbar-thin m-0 overflow-auto p-4 text-[12.5px] leading-5 break-words whitespace-pre-wrap">
                <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
              </pre>
            </section>
          ) : (
            <div className="flex flex-1 items-center justify-center py-20 text-body-regular text-text-tertiary">Building the prompt…</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
