import { AtSign } from 'lucide-react';
import type { ComposerExtension } from '../variant-types';

import { MentionComposerView, renderMentions } from './mention';

/* The /composers showcase for Mention: picker glyph, scripted demo, spec sheet and comparison cells. */

/* ------------------------------------------------------------------ glyph, demo, spec */

function MentionGlyph() {
  return (
    <span className="relative h-8 w-14 shrink-0 overflow-hidden">
      <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default" />
      <span className="absolute top-[9px] left-2 h-0.5 w-2.5 rounded bg-text-tertiary/50" />
      <span className="absolute top-1.5 left-[22px] h-2 w-4 rounded-[3px] bg-sky-500/25 ring-1 ring-sky-500/50" />
      <span className="absolute top-[9px] left-[42px] h-0.5 w-1.5 rounded bg-text-tertiary/50" />
      <span className="absolute bottom-1.5 left-1.5 size-2 rounded-full bg-background-tertiary-default" />
      <span className="absolute bottom-[5px] left-[13px] font-mono text-[8px] leading-none text-text-tertiary">@</span>
      <span className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-text-primary" />
    </span>
  );
}

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

export const mention: ComposerExtension = {
  Component: MentionComposerView,
  Glyph: MentionGlyph,
  demo: {
    async intro(api) {
      await api.sleep(500);
      await api.user('Review @app.tsx with @Ana before release, and check @schema.sql for risky migrations', { type: true });
      const a = api.assistant();
      await a.think('Thinking', ['Opening the mentioned files', 'Noting what Ana should look at'], 550);
      await a.tool('Read', 'src/app.tsx', { meta: '212 lines', ms: 700 });
      await a.tool('Read', 'db/schema.sql', { meta: '96 lines', ms: 700 });
      await a.stream(
        `Two things to settle before release:

- @app.tsx: the new onboarding route skips the auth guard. Worth a look with @Ana, since it changes the first screen people see.
- @schema.sql: \`ALTER TABLE orders DROP COLUMN legacy_ref\` is not reversible. Ship it behind a backup, or split it into its own release.

Everything else reads as safe.`,
        26,
      );
      a.done();
    },
    renderText: renderMentions,
    suggestions: ['Loop in @Léo on the migration', 'Check @Linear for open release bugs', 'Summarize @README.md'],
    content: ({ picker, count }) => ({
      placeholder: 'Type @ to mention a file, person or source',
      model: picker,
      status: (
        <>
          <span className="flex items-center gap-1">
            <AtSign /> Files, people, sources
          </span>
          <span className="tabular-nums">{count ? `${count} messages` : 'Mentions travel as context'}</span>
        </>
      ),
    }),
  },
  spec: {
    anatomy: ['Mention menu at the caret (Files · People · Sources · Tools)', 'Attachment strip', 'Rich field with atomic @ chips, tinted by kind', 'Add button', '@ button', 'Tools slot', 'Model slot', 'Send / Stop', 'Status line under the box'],
    behaviour: [
      { keys: ['@'], text: 'opens the menu at the caret; the text after it filters' },
      { keys: ['↑', '↓'], text: 'move through the matches' },
      { keys: ['Enter'], text: 'inserts the chip (Tab too) when the menu is open, sends otherwise' },
      { keys: ['Shift', 'Enter'], text: 'inserts a newline' },
      { keys: ['Backspace'], text: 'right after a chip removes it whole' },
      { keys: ['Esc'], text: 'closes the menu, or stops while busy' },
      { keys: null, text: 'The value stays plain text: a chip serializes to “@label”, and known labels in an incoming value come back as chips. Paste is plain text only. Busy: Send turns into Stop.' },
    ],
    bestFor: 'Agents that take context by name: point at files, teammates and connected sources without leaving the prompt.',
    usage: `<Composer
  variant="mention"
  value={draft}
  onChange={setDraft}
  onSend={send}
  onStop={stop}
  busy={busy}
  placeholder="Type @ to mention a file, person or source"
  model={<ModelPicker value={model} onChange={setModel} />}
  status={
    <>
      <span><AtSign /> Files, people, sources</span>
      <span>{count} messages</span>
    </>
  }
/>`,
  },
  compare: {
    Input: 'Rich text with @ chips',
    'Shift+Enter newline': YES,
    'Model slot': 'Action row, right',
    'Tools slot': 'After the @ button',
    'Built-in tools': 'Add, mention menu',
    'Status placement': 'Under',
    Modes: NO,
    'Slash commands': NO,
    'Busy indicator': 'Stop button',
    'Stop control': 'Stop button',
    'Esc to stop': YES,
    'Best width': 'Thread column',
  },
};
