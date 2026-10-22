import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreviewSkeleton, useFrameReady } from '@/components/preview-skeleton';

export type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 820, mobile: 390 };

/**
 * Browser mockup (tabs + address bar) around a live, interactive iframe — the docs-style live preview.
 * The iframe is a real document, so the template's breakpoints follow the device width.
 */
export function BrowserFrame({ src, title, device = 'desktop', height = 720, className }: { src: string; title: string; device?: Device; height?: number; className?: string }) {
  const [run, setRun] = useState(0);
  const { ready, onLoad } = useFrameReady(`${src}-${run}`);
  const width = DEVICE_WIDTH[device];
  const address = `${typeof window === 'undefined' ? '' : window.location.host}${src}`;

  return (
    <div className={cn('overflow-hidden rounded-[22px] border border-border-button-default bg-background-secondary-default p-1.5 shadow-xs', className)}>
      <div className="flex items-end gap-1 px-2 pt-1">
        <div className="me-2 flex items-center gap-1.5 self-center">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="size-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex h-8 min-w-0 items-center gap-2 rounded-t-lg border border-b-0 border-border-button-default bg-background-primary-default px-3 text-caption-1-medium text-text-primary">
          <span className="size-3 shrink-0 rounded-sm bg-text-primary" />
          <span className="truncate">{title}</span>
          <X className="ms-3 size-3 shrink-0 text-foreground-icon-tertiary" />
        </div>
        <span className="hidden h-8 items-center gap-2 px-3 text-caption-1-medium text-text-tertiary sm:flex">
          <span className="size-3 rounded-sm border border-border-button-default" /> New tab
        </span>
        <Plus className="mb-2 hidden size-3.5 text-foreground-icon-tertiary sm:block" />
      </div>
      <div className="flex items-center gap-2 rounded-t-xl border border-border-button-default bg-background-primary-default px-2 py-1.5">
        <ChevronLeft className="size-4 text-foreground-icon-tertiary" />
        <ChevronRight className="size-4 text-foreground-icon-tertiary" />
        <button type="button" onClick={() => setRun((n) => n + 1)} aria-label="Restart the conversation" className="grid size-6 place-items-center rounded-md text-foreground-icon-secondary hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover">
          <RotateCcw className="size-3.5" />
        </button>
        <span className="min-w-0 flex-1 truncate rounded-full bg-background-tertiary-default px-3 py-1 font-mono text-caption-2-regular text-text-secondary">{address}</span>
      </div>
      <div className={cn('relative isolate flex justify-center overflow-hidden rounded-b-xl border border-t-0 border-border-button-default', width ? 'bg-background-secondary-default py-5' : 'bg-background-full')}>
        {/* The dot grid fades with a mask, so it sits on its own layer: masking the container would fade the iframe too. */}
        {width && <div className="landing-dots absolute inset-0 -z-10" aria-hidden="true" />}
        <iframe
          key={`${src}-${run}`}
          onLoad={onLoad}
          src={src}
          title={`${title} — live preview`}
          className={cn('block max-w-full shrink-0 border-0 bg-background-full', width && 'rounded-xl border border-border-button-default shadow-card')}
          style={{ width: width ?? '100%', height: width ? height - 40 : height }}
        />
        <div className="@container pointer-events-none absolute inset-0 flex justify-center" style={width ? { paddingBlock: 20 } : undefined}>
          <div className={cn('relative h-full max-w-full overflow-hidden', width && 'rounded-xl')} style={{ width: width ?? '100%' }}>
            <PreviewSkeleton ready={ready} sidebar={!width || width >= 768} />
          </div>
        </div>
      </div>
    </div>
  );
}
