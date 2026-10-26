import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { demos, getDemo, libraries } from '@/engine/registry';
import { templates } from '@/templates/registry';
import { COMPOSER_VARIANTS, type ComposerVariant } from '@/templates/kit/composer-variant';
import { THINKING_ORBS, type ThinkingStyle } from '@/templates/kit/thinking-style';
import { PALETTES, useTheme, type Palette } from '@/providers/theme-provider';
import type { PlaygroundState } from './state';
import { Row, Section, Select, Swatches, Switch, ThemePair, type Option } from './ui';

/* The /playground sidebar (assistant-ui's UI Builder layout): a preset on top, then one dashed section per piece.
 * Picking a template or a response also switches the canvas to it. */

interface Preset {
  id: string;
  label: string;
  composer: ComposerVariant;
  model: boolean;
  thinking: ThinkingStyle;
  palette: Palette;
  theme: 'light' | 'dark';
}

/** Named combinations; the preset select shows "Custom" once a piece moves off all of them. */
const PRESETS: Preset[] = [
  { id: 'default', label: 'Default', composer: 'pill', model: true, thinking: 'dots', palette: 'graphite', theme: 'dark' },
  { id: 'terminal', label: 'Terminal', composer: 'command', model: false, thinking: 'working', palette: 'dusk', theme: 'dark' },
  { id: 'research', label: 'Research', composer: 'box', model: true, thinking: 'searching', palette: 'slate', theme: 'dark' },
  { id: 'studio', label: 'Studio', composer: 'media', model: true, thinking: 'shaping', palette: 'sand', theme: 'light' },
  { id: 'voice', label: 'Voice', composer: 'voice', model: false, thinking: 'listening', palette: 'slate', theme: 'light' },
];

const COMPOSERS: Option<ComposerVariant>[] = COMPOSER_VARIANTS.map((v) => ({ value: v.id, label: v.name, hint: v.from }));
const THINKING: Option<ThinkingStyle>[] = [{ value: 'dots', label: 'Dots', hint: "The kit's dot grid", icon: <Sparkles className="size-3.5 shrink-0 text-text-tertiary" /> }, ...THINKING_ORBS.map((o) => ({ value: o.id, label: o.name, hint: 'Thinking orb' }))];
const TEMPLATES: Option<string>[] = templates.map((t) => ({ value: t.slug, label: t.name, hint: t.tagline }));
const COLLECTIONS: Option<string>[] = libraries.map((l) => ({ value: l.slug, label: l.name, hint: `${l.count} responses` }));
const PALETTE_OPTIONS: Option<Palette>[] = PALETTES.map((p) => ({ value: p.id, label: p.name, hint: p.hint }));

export function PlaygroundSidebar({ state, set }: { state: PlaygroundState; set: (patch: Partial<PlaygroundState>) => void }) {
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const response = getDemo(state.response) ?? demos[0];
  // The collection is a filter for the response list, so it follows the response picked from a link.
  const [collection, setCollection] = useState(response.library.slug);
  const responses = useMemo<Option<string>[]>(() => demos.filter((d) => d.library.slug === collection).map((d) => ({ value: d.slug, label: d.title })), [collection]);

  const preset = PRESETS.find((p) => p.composer === state.composer && p.model === state.model && p.thinking === state.thinking && p.palette === palette && p.theme === theme);
  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    set({ composer: p.composer, model: p.model, thinking: p.thinking, view: 'chat' });
    setPalette(p.palette);
    if (p.theme !== theme) toggleTheme();
  };

  return (
    <div className="space-y-5">
      <div className="flex h-8 items-center justify-between">
        <span className="text-xs font-medium text-text-primary/45">Preset</span>
        <Select label="Preset" value={preset?.id ?? 'custom'} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} onChange={applyPreset} />
      </div>

      <Section title="Composer">
        <Row label="Variant">
          <Select label="Composer" value={state.composer} options={COMPOSERS} onChange={(composer) => set({ composer })} />
        </Row>
        <Row label="Model picker">
          <Switch label="Model picker" checked={state.model} onChange={(model) => set({ model })} />
        </Row>
        {state.composer === 'box' && (
          <>
            <Row label="Writing coach" indent>
              <Switch label="Writing coach" checked={state.coach} onChange={(coach) => set({ coach })} />
            </Row>
            <Row label="@ Mentions" indent>
              <Switch label="@ Mentions" checked={state.mentions} onChange={(mentions) => set({ mentions })} />
            </Row>
          </>
        )}
      </Section>

      <Section title="Thinking">
        <Row label="Indicator">
          <Select label="Thinking indicator" value={state.thinking} options={THINKING} onChange={(thinking) => set({ thinking })} />
        </Row>
      </Section>

      <Section title="Template">
        <Row label="App">
          <Select label="Template" value={state.template} options={TEMPLATES} onChange={(template) => set({ template, view: 'template' })} />
        </Row>
      </Section>

      <Section title="Response">
        <Row label="Collection">
          <Select label="Collection" value={collection} options={COLLECTIONS} onChange={setCollection} />
        </Row>
        <Row label="Pattern">
          <Select label="Response" placeholder="Pick one" value={response.library.slug === collection ? response.slug : ''} options={responses} onChange={(r) => set({ response: r, view: 'response' })} />
        </Row>
      </Section>

      <Section title="Colors" theme={<ThemePair theme={theme} onToggle={toggleTheme} />}>
        <Row label="Palette">
          <Select label="Palette" value={palette} options={PALETTE_OPTIONS} onChange={setPalette} />
        </Row>
        <Row label="Swatches" indent>
          <Swatches colors={PALETTES.find((p) => p.id === palette)?.swatches ?? []} />
        </Row>
      </Section>
    </div>
  );
}
