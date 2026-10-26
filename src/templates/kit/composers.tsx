import { useEffect, useRef, type ComponentType } from 'react';
import { ReplyChip, type ReplyRef } from './reply';
import { useComposerVariant, type ComposerVariant } from './composer-variant';
import { useAttachments } from './attachments';
import type { ComposerProps as BaseProps, VariantProps } from './composer-kit';
import { PillComposerView } from './variants/pill';
import { BoxComposerView } from './variants/box';
import { PanelComposerView } from './variants/panel';
import { DockComposerView } from './variants/dock';
import { CommandComposerView } from './variants/command';
import { InlineComposerView } from './variants/inline';
import { VoiceComposerView } from './variants/voice';
import { HaloComposerView } from './variants/halo';
import { MediaComposerView } from './variants/media';
import { PaletteComposerView } from './variants/palette';
import { MentionComposerView } from './variants/mention';

/* The template-facing composer: one prop picks among the eleven composers in kit/variants/ (one file each, each
 * also installable alone from the registry). The attachment queue lives here so switching variant keeps the files. */

/* ------------------------------------------------------------------ switch */

const VARIANTS: Record<ComposerVariant, ComponentType<VariantProps>> = {
  pill: PillComposerView,
  box: BoxComposerView,
  panel: PanelComposerView,
  dock: DockComposerView,
  command: CommandComposerView,
  inline: InlineComposerView,
  voice: VoiceComposerView,
  halo: HaloComposerView,
  media: MediaComposerView,
  palette: PaletteComposerView,
  mention: MentionComposerView,
};

export interface ComposerProps extends BaseProps {
  /** The template's own pick, used while the global choice is `auto`. */
  variant?: ComposerVariant;
  /** Always render `variant`, ignoring the global choice (the /composers showcase). */
  lock?: boolean;
  /** The answer being replied to (the engine's `replyTo`): pinned above the composer until the send. */
  reply?: ReplyRef | null;
  /** × on the reply bar, or Esc in an empty field. */
  onClearReply?: () => void;
}

/** Every composer behind one switch: the template's pick, or the global one from the header picker. */
export function Composer({ variant, lock, placeholder = 'Ask me anything', reply, onClearReply, ...rest }: ComposerProps) {
  const global = useComposerVariant(variant ?? 'pill');
  const active = lock && variant ? variant : global;
  const att = useAttachments();
  const V = VARIANTS[active];
  const box = useRef<HTMLDivElement>(null);
  // Sending takes the landed files with the message, as a composer clears its strip on send.
  const onSend = (v: string) => {
    rest.onSend(v);
    att.clear();
  };
  // A new reply puts the caret in the field, ready to write it.
  useEffect(() => {
    if (reply) box.current?.querySelector<HTMLElement>('textarea, input, [contenteditable=true]')?.focus();
  }, [reply?.id]);
  return (
    // One wrapper whether or not a reply is pinned (`contents` without one), so the field never remounts and keeps focus.
    <div
      ref={box}
      className={reply ? 'flex w-full flex-col gap-2' : 'contents'}
      onKeyDownCapture={(e) => {
        if (e.key === 'Escape' && reply && !rest.value && !rest.busy) {
          e.stopPropagation();
          onClearReply?.();
        }
      }}
    >
      {reply && <ReplyChip reply={reply} onClear={() => onClearReply?.()} />}
      <V {...rest} onSend={onSend} placeholder={placeholder} att={att} />
    </div>
  );
}
