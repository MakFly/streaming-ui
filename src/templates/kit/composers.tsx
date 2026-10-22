import type { ComponentType } from 'react';
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
}

/** Every composer behind one switch: the template's pick, or the global one from the header picker. */
export function Composer({ variant, lock, placeholder = 'Ask me anything', ...rest }: ComposerProps) {
  const global = useComposerVariant(variant ?? 'pill');
  const active = lock && variant ? variant : global;
  const att = useAttachments();
  const V = VARIANTS[active];
  // Sending takes the landed files with the message, as a composer clears its strip on send.
  const onSend = (v: string) => {
    rest.onSend(v);
    att.clear();
  };
  return <V {...rest} onSend={onSend} placeholder={placeholder} att={att} />;
}
