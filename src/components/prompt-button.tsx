import { useState, type ComponentType } from 'react';
import { Icon } from '@/components/icon';
import type { PromptDialogProps } from '@/components/prompt-dialog';

/* "Prompt" button for the showcase pages (/composers, /model-picker): opens the rebuild prompt in PromptDialog.
 * The dialog's chunk and the prompt start loading on hover or focus, and the dialog renders directly once its
 * chunk is in: React.lazy would suspend on the click even with the chunk cached, and React 19 holds a Suspense
 * boundary's reveal back ~300 ms, which read as lag. */

let Dialog: ComponentType<PromptDialogProps> | null = null;
const loadDialog = () => import('@/components/prompt-dialog').then((m) => (Dialog = m.default));

export function PromptButton({ load, ...dialog }: Omit<PromptDialogProps, 'onClose'>) {
  const [open, setOpen] = useState(false);
  const warm = () => void Promise.all([loadDialog(), load()]);
  return (
    <>
      <button
        type="button"
        onPointerEnter={warm}
        onFocus={warm}
        onClick={() => (Dialog ? setOpen(true) : void loadDialog().then(() => setOpen(true)))}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-body-2-medium text-text-primary shadow-xs transition-colors hover:bg-background-primary-hover"
      >
        <Icon name="markdown-line" className="size-4" /> Prompt
      </button>
      {open && Dialog && <Dialog {...dialog} load={load} onClose={() => setOpen(false)} />}
    </>
  );
}
