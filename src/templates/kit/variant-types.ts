import type { ComponentType, ReactNode } from 'react';
import type { ChatScriptApi, Script } from './engine';
import type { VariantProps } from './composer-kit';
import type { Decorate } from './markdown';

/* The contract every composer in kit/variants/* fulfils: the composer itself plus what the /composers page
 * shows for it (a schematic for the picker, a scripted demo and its comparison cells). One file
 * per variant, registered in kit/variants/index.ts. */

/** What the /composers demo hands a variant: the demo's model picker and how many messages the thread has. */
export interface DemoContext {
  picker: ReactNode;
  count: number;
}

/** Slots the demo passes to <Composer> for this variant. */
export interface DemoContent {
  model?: ReactNode;
  tools?: ReactNode;
  status?: ReactNode;
  placeholder?: string;
}

/** Rows of the comparison table on /composers ("Default in templates" is computed). */
export const COMPARE_ROWS = [
  'Input',
  'Shift+Enter newline',
  'Model slot',
  'Tools slot',
  'Built-in tools',
  'Status placement',
  'Modes',
  'Slash commands',
  'Busy indicator',
  'Stop control',
  'Esc to stop',
  'Best width',
] as const;
export type CompareRow = (typeof COMPARE_ROWS)[number];

export interface ComposerExtension {
  /** The composer; receives the same props as the five originals (see composer-kit.tsx). */
  Component: ComponentType<VariantProps>;
  /** 56×32 schematic for the composer picker, drawn with design tokens. */
  Glyph: ComponentType;
  demo: {
    /** Module-level and stable: it is an effect dependency. */
    intro: Script;
    /** Defaults to a generic answer naming the variant. */
    reply?: (api: ChatScriptApi, text: string) => Promise<void>;
    suggestions: string[];
    content: (ctx: DemoContext) => DemoContent;
    /** Renders plain text in the thread (user bubbles and answers) the way the composer shows it. */
    renderText?: Decorate;
  };
  compare: Record<CompareRow, ReactNode>;
}
