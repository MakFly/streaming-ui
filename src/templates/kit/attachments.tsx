import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { CAT_JPG as cat, CODE_ICON as codeIcon, DOC_DARK_ICON as docDarkIcon, DOC_ICON as docIcon, SHEET_ICON as sheetIcon, SLIDES_ICON as slidesIcon, VIDEO_ICON as videoIcon } from './attachments-assets';

/* Composer Attachments: a strip of 56px tiles above
 * the prompt. Images fill the tile and get a frosted white dismiss; the other five kinds carry the kit's 24px
 * plugin icons over a 9px file name. A queued file scales in, an accent ring draws clockwise around the tile
 * while a 9px percentage counts up in the corner, then at 100 the percentage blurs out and the dismiss blurs in
 * on the same spot. Uploads are simulated (defaults: 1100 ms each, 240 ms apart). */

export type AttachmentKind = 'image' | 'document' | 'spreadsheet' | 'presentation' | 'code' | 'video';
export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  src?: string;
  /** 0–100 while uploading; undefined once landed. */
  progress?: number;
}

const ICONS: Record<Exclude<AttachmentKind, 'image'>, { light: string; dark?: string }> = {
  document: { light: docIcon, dark: docDarkIcon },
  spreadsheet: { light: sheetIcon },
  presentation: { light: slidesIcon },
  code: { light: codeIcon },
  video: { light: videoIcon },
};

/** The demo files, handed out in turn by the + button. */
const SAMPLES: Omit<Attachment, 'id'>[] = [
  { name: 'cat.jpg', kind: 'image', src: cat },
  { name: 'payrollz-2026.docx', kind: 'document' },
  { name: 'timetable.xlsx', kind: 'spreadsheet' },
  { name: 'presentation.key', kind: 'presentation' },
  { name: 'reactypes.tsx', kind: 'code' },
  { name: 'birthday.mp4', kind: 'video' },
];

/** The rounded-rect outline the ring traces, starting top-centre (pathLength 100). */
const RING = 'M 28 1 H 44 A 11 11 0 0 1 55 12 V 44 A 11 11 0 0 1 44 55 H 12 A 11 11 0 0 1 1 44 V 12 A 11 11 0 0 1 12 1 Z';

export function AttachmentTile({ attachment: a, onRemove }: { attachment: Attachment; onRemove?: () => void }) {
  const uploading = a.progress !== undefined;
  const image = a.kind === 'image';
  const icon = a.kind === 'image' ? null : ICONS[a.kind];
  return (
    <div className="tpl-tile-in">
      <div title={a.name} className="relative size-14 shrink-0 rounded-xl border border-composer-panel-tile-border">
        {image ? (
          <img alt={a.name} src={a.src} className={cn('absolute inset-0 size-full rounded-[11px] object-cover transition-opacity duration-300 ease-out', uploading && 'opacity-60')} />
        ) : (
          <div className={cn('transition-opacity duration-300 ease-out', uploading && 'opacity-60')}>
            <img alt="" aria-hidden="true" src={icon!.light} className={cn('absolute start-[3px] top-1 size-6', icon!.dark && 'dark:hidden')} />
            {icon!.dark && <img alt="" aria-hidden="true" src={icon!.dark} className="absolute start-[3px] top-1 hidden size-6 dark:block" />}
            <span className="absolute start-1.5 top-9 max-w-[44px] truncate text-[9px] leading-[15px] font-medium tracking-[0.2px] text-text-secondary">{a.name}</span>
          </div>
        )}
        <svg aria-hidden="true" viewBox="0 0 56 56" className={cn('pointer-events-none absolute -inset-px size-14 transition-opacity duration-300 ease-out', uploading ? 'opacity-100' : 'opacity-0')}>
          <path d={RING} fill="none" stroke="var(--color-accent-400)" strokeWidth="2" strokeLinecap="round" pathLength={100} strokeDasharray={`${uploading ? a.progress : 102} 200`} className="transition-[stroke-dasharray] duration-200 ease-linear" />
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute end-[3px] top-[3px] text-[9px] leading-4 font-medium tabular-nums transition-[opacity,filter] duration-300 ease-out',
            image ? 'text-white' : 'text-accent-500',
            uploading ? 'opacity-100 blur-[0px]' : 'opacity-0 blur-[3px]',
          )}
        >
          {Math.round(a.progress ?? 100)}%
        </span>
        <button
          type="button"
          aria-label={`Remove ${a.name}`}
          onClick={onRemove}
          disabled={uploading}
          className={cn(
            'ease absolute start-[35px] top-[3px] inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none select-none transition-[opacity,filter,color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2',
            image ? 'bg-white/50 text-white backdrop-blur-[2px] hover:text-white' : 'bg-background-tertiary-default/50 text-foreground-icon-secondary hover:text-text-primary',
            uploading ? 'pointer-events-none opacity-0 blur-[3px]' : 'opacity-100 blur-[0px]',
          )}
        >
          <svg width="6.8" height="6.8" viewBox="0 0 6.8 6.8" fill="none" aria-hidden="true">
            <path d="M0.57 0.57L6.23 6.23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6.23 0.57L0.57 6.23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** The strip above the prompt; collapses to nothing when empty. */
export function AttachmentStrip({ attachments, onRemove, className }: { attachments: Attachment[]; onRemove: (id: string) => void; className?: string }) {
  return (
    <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out', attachments.length ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
      <div className="min-h-0 overflow-hidden">
        <div className={cn('flex flex-wrap items-start gap-2 pb-1', className)}>
          {attachments.map((a) => (
            <AttachmentTile key={a.id} attachment={a} onRemove={() => onRemove(a.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

let seq = 0;

/**
 * The upload queue: `add()` queues the next sample file at progress 0; one file uploads at a time
 * over `uploadDuration`, then the next starts after `uploadGap`.
 */
export function useAttachments({ uploadDuration = 1100, uploadGap = 240 } = {}) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const next = useRef(0);
  const add = useCallback(() => {
    const s = SAMPLES[next.current++ % SAMPLES.length];
    setFiles((f) => [...f, { ...s, id: `att-${++seq}`, progress: 0 }]);
  }, []);
  const remove = useCallback((id: string) => setFiles((f) => f.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setFiles([]), []);

  // Drive the first file still uploading; when it lands the effect re-runs for the next one.
  const active = files.find((f) => f.progress !== undefined);
  useEffect(() => {
    if (!active) return;
    const id = active.id;
    // Progress is read off the clock, not counted per frame: an interval (unlike rAF) keeps running in a
    // background tab, so an upload started there still lands on time.
    const start = performance.now() + (active.progress === 0 ? uploadGap : 0);
    const timer = window.setInterval(() => {
      const p = Math.max(0, Math.min(100, ((performance.now() - start) / uploadDuration) * 100));
      setFiles((f) => f.map((x) => (x.id === id ? { ...x, progress: p >= 100 ? undefined : p } : x)));
      if (p >= 100) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
    // Only restart when a different file becomes the active upload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, uploadDuration, uploadGap]);

  return { files, add, remove, clear };
}
