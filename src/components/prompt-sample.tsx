import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

/** What every rebuild prompt carries, in the order it lists them. */
export const PROMPT_POINTS = [
  'Install command and registry dependencies',
  'Every source file from the registry, verbatim',
  'Theme tokens and global CSS',
  'The exact choreography, timings in milliseconds',
];

const PROMPT_SAMPLE: [string, string][] = [
  ['hljs-section', '# Recreate "Web Search" — Agent'],
  ['', ''],
  ['', 'Rebuild this streaming-response component **identically** in'],
  ['', 'React + TypeScript + Tailwind CSS v4. Do not redesign anything.'],
  ['', ''],
  ['hljs-section', '## Source of truth'],
  ['hljs-bullet', '- Registry item `web-search`: /r/web-search.json'],
  ['hljs-bullet', '- Install: `npx shadcn@latest add @agent/web-search`'],
  ['', ''],
  ['hljs-section', '## Demo to reproduce'],
  ['hljs-code', 'await webSearch(log, ['],
  ['hljs-code', "  { label: 'Ran 3 searches', icon: 'search-line', dwell: 1200 },"],
  ['hljs-code', "  { label: 'Searched X for', meta: '7 posts', dwell: 1900 },"],
  ['hljs-code', '], t);'],
];

/** The opening of a real rebuild prompt (Web Search), in a file window: the landing and /prompts show it. */
export function PromptSample({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border-button-default bg-docs-code-background shadow-card', className)}>
      <div className="flex h-11 items-center gap-2 border-b border-separator-border px-4">
        <Icon name="markdown-line" className="size-4 text-foreground-icon-secondary" />
        <span className="font-mono text-caption-1-medium text-text-primary">web-search.prompt.md</span>
        <span className="ms-auto inline-flex h-7 items-center gap-1 rounded-lg border border-border-button-default bg-background-primary-default px-2 text-body-2-medium text-text-primary">
          <Icon name="file-copy-line" className="size-3.5" />
          Copy prompt
        </span>
      </div>
      <pre className="scrollbar-thin overflow-x-auto p-5 text-[12.5px] leading-6">
        <code className="hljs font-mono">
          {PROMPT_SAMPLE.map(([cls, line], i) => (
            <span key={i} className={cn('block min-h-6', cls)}>
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
