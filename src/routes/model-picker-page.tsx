import { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { InstallButton } from '@/components/composers/install-button';
import { PromptButton } from '@/components/prompt-button';
import { EFFORTS, ModelPicker, PROVIDERS, hasFastMode } from '@/templates/kit/model-picker';
import { MODEL_PICKER, applyHead } from '@/seo/routes';

/* `/model-picker`: the composers' model picker on its own, installable from our registry as `model-picker`.
 * Just the demo (open on arrival) with its live state, plus Install and the rebuild prompt. */

const loadPrompt = () => import('@/templates/model-picker-prompt').then((m) => m.buildModelPickerPrompt());

const MODELS = PROVIDERS.reduce((n, p) => n + p.models.length, 0);

export function ModelPickerPage() {
  useEffect(() => {
    applyHead(MODEL_PICKER);
  }, []);
  const [model, setModel] = useState('Fable 5');
  const [effort, setEffort] = useState(1);
  const [fast, setFast] = useState(false);
  const provider = PROVIDERS.find((p) => p.models.includes(model))!;
  const canFast = hasFastMode(provider.id, model);
  const state = [model, provider.name, EFFORTS[effort], canFast ? (fast ? 'Fast on' : 'Fast off') : null].filter(Boolean);

  return (
    <PageShell width="wide">
      <div className="flex w-full flex-col gap-8">
        <header className="flex flex-col items-start gap-3">
          <p className="font-mono text-caption-1-medium tracking-[0.12em] text-text-tertiary uppercase">Model picker</p>
          <h1 className="text-display-4-semibold tracking-[-0.02em] text-text-primary">One picker, every model</h1>
          <p className="max-w-[720px] text-headline-regular text-text-secondary">
            The picker every composer carries in its model slot: {PROVIDERS.length} providers on a rail, {MODELS} models, a search across all of them, and an effort slider
            with fast mode. It works inside a composer or on its own.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <InstallButton item="model-picker" label="Install ModelPicker" />
            <PromptButton title="Model picker" fileName="model-picker.prompt.md" downloadName="model-picker.prompt.md" load={loadPrompt} />
          </div>
        </header>

        {/* The popover opens above the trigger, aligned to its start: a 341px column keeps it centred on the stage. */}
        <section aria-label="Demo" className="relative flex h-[460px] items-end justify-center rounded-2xl bg-background-secondary-default px-4 pb-[88px]">
          <div className="flex w-[341px] max-w-full">
            <ModelPicker value={model} onChange={setModel} effort={effort} onEffortChange={setEffort} fast={fast} onFastChange={setFast} defaultOpen className="border border-border-button-default shadow-xs" />
          </div>
          <p aria-live="polite" className="absolute inset-x-0 bottom-5 text-center font-mono text-caption-1-regular text-text-tertiary">
            {state.join(' · ')}
          </p>
        </section>
      </div>
    </PageShell>
  );
}
