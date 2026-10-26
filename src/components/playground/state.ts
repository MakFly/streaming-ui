import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { demos, getDemo } from '@/engine/registry';
import { templates } from '@/templates/registry';
import { COMPOSER_VARIANTS, type ComposerVariant } from '@/templates/kit/composer-variant';
import { THINKING_ORBS, type ThinkingStyle } from '@/templates/kit/thinking-style';
import type { Device } from '@/components/browser-frame';

/* The /playground combination, kept in the URL: the address bar is always the share link, Back and reload keep
 * it, and an unknown value falls back to its own default without spoiling the rest of the link. Palette and theme
 * are the site's (useTheme); a link's `palette` / `theme` are applied once by the page. */

export type PlaygroundView = 'chat' | 'template' | 'response';

export interface PlaygroundState {
  composer: ComposerVariant;
  model: boolean;
  /** Box: its Writing coach chip, and the @ menu for files, people and sources. */
  coach: boolean;
  mentions: boolean;
  thinking: ThinkingStyle;
  response: string;
  view: PlaygroundView;
  template: string;
  device: Device;
  /** A width dragged with the frame's handles (px); null keeps the device's own. */
  width: number | null;
}

export const THINKING_STYLES: ThinkingStyle[] = ['dots', ...THINKING_ORBS.map((o) => o.id)];
/** Styles drawn by the orb engine (the others need no thinking-orb install). */
export const isOrb = (s: ThinkingStyle) => THINKING_ORBS.some((o) => o.id === s);
/** Frame width per device; desktop fills the canvas. */
export const DEVICES: { id: Device; name: string; width: number | null }[] = [
  { id: 'desktop', name: 'Desktop', width: null },
  { id: 'tablet', name: 'Tablet', width: 768 },
  { id: 'mobile', name: 'Mobile', width: 390 },
];

export const DEFAULTS: PlaygroundState = {
  composer: 'pill',
  model: true,
  coach: true,
  mentions: false,
  thinking: 'dots',
  response: (demos.find((d) => d.library.slug === 'agent') ?? demos[0]).slug,
  view: 'chat',
  template: 'assistant',
  device: 'desktop',
  width: null,
};

const oneOf = <T extends string>(v: string | null, all: readonly T[], fallback: T): T => (v !== null && (all as readonly string[]).includes(v) ? (v as T) : fallback);

const widthOf = (v: string | null) => {
  const n = Number(v);
  return v && Number.isInteger(n) && n >= 320 && n <= 2560 ? n : null;
};

export function parseState(q: URLSearchParams): PlaygroundState {
  return {
    composer: oneOf(q.get('composer'), COMPOSER_VARIANTS.map((v) => v.id), DEFAULTS.composer),
    model: q.get('model') !== 'off',
    coach: q.get('coach') !== 'off',
    mentions: q.get('mentions') === 'on',
    thinking: oneOf(q.get('thinking'), THINKING_STYLES, DEFAULTS.thinking),
    response: getDemo(q.get('response') ?? undefined)?.slug ?? DEFAULTS.response,
    view: oneOf(q.get('view'), ['chat', 'template', 'response'] as const, DEFAULTS.view),
    template: oneOf(q.get('template'), templates.map((t) => t.slug), DEFAULTS.template),
    device: oneOf(q.get('device'), DEVICES.map((d) => d.id), DEFAULTS.device),
    width: widthOf(q.get('vw')),
  };
}

/** Only what differs from the defaults goes in the URL, so a plain /playground stays plain. */
function writeState(s: PlaygroundState, q: URLSearchParams) {
  const next = new URLSearchParams(q);
  const entries: [string, string, string][] = [
    ['composer', s.composer, DEFAULTS.composer],
    ['model', s.model ? 'on' : 'off', 'on'],
    ['coach', s.coach ? 'on' : 'off', 'on'],
    ['mentions', s.mentions ? 'on' : 'off', 'off'],
    ['thinking', s.thinking, DEFAULTS.thinking],
    ['response', s.response, DEFAULTS.response],
    ['view', s.view, DEFAULTS.view],
    ['template', s.template, DEFAULTS.template],
    ['device', s.device, DEFAULTS.device],
    ['vw', s.width === null ? '' : String(s.width), ''],
  ];
  for (const [key, value, fallback] of entries) {
    if (value === fallback) next.delete(key);
    else next.set(key, value);
  }
  return next;
}

export function usePlaygroundState(): [PlaygroundState, (patch: Partial<PlaygroundState>) => void] {
  const [q, setQ] = useSearchParams();
  const state = useMemo(() => parseState(q), [q]);
  const set = useCallback(
    // From the latest params, not this render's: two patches in one tick must both land.
    (patch: Partial<PlaygroundState>) => setQ((prev) => writeState({ ...parseState(prev), ...patch }, prev), { replace: true }),
    [setQ],
  );
  return [state, set];
}

const pick = <T,>(all: readonly T[], not?: T) => {
  const pool = all.length > 1 ? all.filter((x) => x !== not) : all;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Surprise me: a new composer (so never the same combination), thinking style and response; the rest stays. */
export function shuffle(s: PlaygroundState): Partial<PlaygroundState> {
  return {
    composer: pick(COMPOSER_VARIANTS.map((v) => v.id), s.composer),
    thinking: pick(THINKING_STYLES, s.thinking),
    response: pick(demos, getDemo(s.response))!.slug,
    model: Math.random() < 0.75,
  };
}

/** Registry items that rebuild the combination: its composer, the model picker if on, the orb engine if an orb is picked. */
export function installItems(s: PlaygroundState): string[] {
  return [`composer-${s.composer}`, ...(s.model ? ['model-picker'] : []), ...(isOrb(s.thinking) ? ['thinking-orb'] : [])];
}
