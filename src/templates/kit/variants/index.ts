import type { ComposerExtension } from '../variant-types';
import { inline } from './inline.showcase';
import { voice } from './voice.showcase';
import { halo } from './halo.showcase';
import { media } from './media.showcase';
import { palette } from './palette.showcase';
import { mention } from './mention.showcase';

/** The six composers added after the original five, keyed by their variant id. */
export const EXTENSIONS = { inline, voice, halo, media, palette, mention } satisfies Record<string, ComposerExtension>;
export type ExtensionVariant = keyof typeof EXTENSIONS;
export const isExtension = (v: string): v is ExtensionVariant => v in EXTENSIONS;
