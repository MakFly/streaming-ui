import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

hljs.registerLanguage('markdown', markdown);

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

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
      return hljs.highlight(prompt, { language: 'markdown', ignoreIllegals: true }).value;
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
