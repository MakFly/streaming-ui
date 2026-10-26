import { Children, Fragment, isValidElement, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ComposerLoader } from '../primitives';
import { AttachmentStrip } from '../attachments';
import { withAttachments, AddButton, MicButton, SendButton, Status, useField, type VariantProps } from '../composer-kit';

/* Pill (Single row): a single 52px row: add, input, model, mic, send.
 * Long drafts behave like ChatGPT's: once the text wraps (or has a line break) the field takes the full width
 * above the buttons and grows upward to 8 lines. The radius stays 26px, a perfect pill at the 52px
 * row height, so growing into a rounded card never jumps. It folds back into one row when the text fits again
 * or is sent.
 * Use <PillComposer> on its own, or the view inside a switcher that owns the attachments. */

/** Width the text needs on one line, measured with the field's own font. */
let canvas: HTMLCanvasElement | null = null;
function textWidth(text: string, el: HTMLElement) {
  canvas ??= document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx.measureText(text).width;
}

/** Below `sm` the row keeps its room for the text: the model moves under the pill, to the status line's start. */
const NARROW = '(max-width: 639.98px)';
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useNarrow = () => useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);

/** The status line with the model in front: its left span gives way, the counters keep the right. */
function withModel(model: ReactNode, status: ReactNode) {
  const flat = Children.toArray(status).flatMap((c) => (isValidElement<{ children?: ReactNode }>(c) && c.type === Fragment ? Children.toArray(c.props.children) : [c]));
  return (
    <>
      {/* A quiet text trigger, like the status around it, instead of the row's filled chip. */}
      <span className="-ms-1.5 flex [&>button]:h-6 [&>button]:rounded-lg [&>button]:bg-transparent [&>button]:ps-1.5 [&>button]:hover:bg-background-tertiary-default [&>button_span]:text-body-2-medium">{model}</span>
      {flat.slice(1)}
    </>
  );
}

export function PillComposerView(p: VariantProps) {
  const field = useField(p);
  const narrow = useNarrow();
  const below = narrow && !!p.model;
  const form = useRef<HTMLFormElement>(null);
  const [multi, setMulti] = useState(false);

  // Before paint, so the layout never flashes between the two shapes. The text gets the grid's 1fr track in
  // both shapes (the field on one row, the empty middle of the button row when stacked), so that track's width
  // is the room the single row would give it.
  useLayoutEffect(() => {
    const el = field.ref.current;
    const grid = form.current;
    if (!el || !grid) return;
    if (!p.value) return setMulti(false);
    if (p.value.includes('\n')) return setMulti(true);
    const room = parseFloat(getComputedStyle(grid).gridTemplateColumns.split(' ')[1] ?? '0') - 10;
    setMulti(textWidth(p.value, el) > room);
  }, [p.value, field.ref]);

  // The field just moved: size it for its new width before the frame paints.
  useLayoutEffect(field.fit, [multi, field.fit]);

  return (
    <div className={cn('flex w-full flex-col gap-1.5', p.className)}>
      {/* One row has no room for tiles: they sit just above the pill. */}
      <AttachmentStrip attachments={p.att.files} onRemove={p.att.remove} className="px-3" />
      <ComposerLoader active={!!p.busy} radius={26}>
        {/* One grid for both shapes, so the field stays the same element (and keeps focus) when it moves. */}
        <form
          ref={form}
          onSubmit={(e) => {
            e.preventDefault();
            field.submit();
          }}
          onClick={(e) => e.target === e.currentTarget && field.ref.current?.focus()}
          className={cn('grid w-full cursor-text grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-x-2 p-2', multi ? 'gap-y-2' : 'min-h-[52px]')}
        >
          <textarea
            ref={field.ref}
            rows={1}
            value={p.value}
            onChange={(e) => p.onChange(e.target.value)}
            onKeyDown={field.onKeyDown}
            placeholder={p.placeholder}
            aria-label="Message"
            className={cn(
              'scrollbar-thin min-w-0 resize-none bg-transparent text-body-regular text-text-primary caret-text-primary outline-none placeholder:text-text-tertiary',
              multi ? 'col-span-5 row-start-1 px-2 pt-1.5 leading-6' : 'col-start-2 row-start-1 h-5! overflow-hidden px-1 leading-5',
            )}
          />
          <AddButton onClick={p.att.add} className={cn('col-start-1', multi ? 'row-start-2' : 'row-start-1')} />
          <span className={cn('col-start-3 flex', multi ? 'row-start-2' : 'row-start-1')}>{!below && p.model}</span>
          <span className={cn('col-start-4 flex', multi ? 'row-start-2' : 'row-start-1')}>
            <MicButton value={p.value} onChange={p.onChange} />
          </span>
          <span className={cn('col-start-5 flex', multi ? 'row-start-2' : 'row-start-1')}>
            <SendButton busy={p.busy} onStop={p.onStop} disabled={!p.value.trim()} />
          </span>
        </form>
      </ComposerLoader>
      <Status context={p.context}>{below ? withModel(p.model, p.status) : p.status}</Status>
    </div>
  );
}

export const PillComposer = withAttachments(PillComposerView);
