import { useState } from 'react';
import { Popover } from 'radix-ui';
import { Check, Copy, Download, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

/* "Install": the shadcn command that copies a composer into your project from this site's registry (public/r,
 * built by `npm run registry:build`). The command points at the origin the page is served from, so a
 * deployed copy of the site installs from itself. */

export const PMS = [
  { id: 'npm', run: 'npx shadcn@latest add' },
  { id: 'pnpm', run: 'pnpm dlx shadcn@latest add' },
  { id: 'bun', run: 'bunx --bun shadcn@latest add' },
] as const;

export function CopyLine({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className={cn('group flex items-start gap-2 rounded-lg border border-border-button-default bg-background-secondary-default py-2 ps-3 pe-1.5', className)}>
      <code className="min-w-0 flex-1 font-mono text-[12px] leading-5 break-all text-text-primary">{text}</code>
      <button
        type="button"
        aria-label={done ? 'Copied' : 'Copy'}
        onClick={() => {
          void navigator.clipboard?.writeText(text).catch(() => {});
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        }}
        className="grid size-6 shrink-0 place-items-center rounded-md text-text-tertiary transition-colors hover:bg-background-tertiary-default hover:text-text-primary [&_svg]:size-3.5"
      >
        {done ? <Check className="text-emerald-500" /> : <Copy />}
      </button>
    </div>
  );
}

export function InstallButton({ item, label = 'Install', className }: { item: string; label?: string; className?: string }) {
  const [pm, setPm] = useState<(typeof PMS)[number]['id']>('npm');
  const json = `${window.location.origin}/r/${item}.json`;
  const command = `${PMS.find((p) => p.id === pm)!.run} ${json}`;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg bg-text-primary px-3 text-body-2-medium text-background-primary-default shadow-xs transition-opacity hover:opacity-90 data-[state=open]:opacity-90',
            className,
          )}
        >
          <Download className="size-4" /> {label}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 flex w-[min(440px,calc(100vw-24px))] flex-col gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-4 shadow-dropdown outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-body-semibold text-text-primary">Install with shadcn</span>
            <div role="tablist" aria-label="Package manager" className="flex gap-0.5 rounded-lg border border-border-button-default bg-background-secondary-default p-0.5">
              {PMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={pm === p.id}
                  onClick={() => setPm(p.id)}
                  className={cn('h-6 rounded-md px-2 text-caption-1-medium transition-colors', pm === p.id ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-tertiary hover:text-text-secondary')}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>
          <CopyLine text={command} />
          <ol className="flex list-decimal flex-col gap-1.5 ps-4 text-body-2-regular text-text-secondary marker:text-text-tertiary">
            <li>
              The files land in <code className="font-mono text-[12px] text-text-primary">components/composer/</code>, with the kit and the Streaming UI tokens they need.
            </li>
            <li>
              Import the tokens once in your global CSS (src/index.css), after Tailwind:
              <CopyLine text={'@import "./styles/streaming-ui.css";'} className="mt-1.5" />
            </li>
          </ol>
          <a href={json} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 self-start text-caption-1-medium text-text-tertiary transition-colors hover:text-text-primary">
            <FileJson className="size-3.5" /> {item}.json
          </a>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
