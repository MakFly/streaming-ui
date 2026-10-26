import type { ReactNode } from 'react';
import { Badge } from '@/templates/kit/parts';
import { COMPOSER_VARIANTS, type ComposerVariant } from '@/templates/kit/composer-variant';
import { EXTENSIONS, isExtension } from '@/templates/kit/variants';
import type { CompareRow } from '@/templates/kit/variant-types';

/* Comparison table for the /composers showcase. Every line below describes what
 * src/templates/kit/composers.tsx actually renders; keep them in sync when a variant changes. */

/** Templates that render each variant by default (a <Composer> without `variant` falls back to pill). */
const DEFAULT_IN: Partial<Record<ComposerVariant, string[]>> = {
  pill: ['Assistant', 'Agent Builder', 'Model Compare'],
  box: ['Research', 'Deep Research'],
  panel: ['Data Analyst', 'Agent Approvals'],
  dock: ['Support Copilot', 'Canvas'],
  command: ['Coding Agent'],
};

const YES = <span className="text-emerald-600 dark:text-emerald-400">✓</span>;
const NO = <span className="text-text-tertiary">—</span>;

const ROWS: { label: string; cells: Partial<Record<ComposerVariant, ReactNode>> }[] = [
  {
    label: 'Input',
    cells: { pill: 'Single line', box: 'Growing textarea', panel: 'Growing textarea', dock: 'Growing textarea', command: 'Monospace textarea' },
  },
  {
    label: 'Shift+Enter newline',
    cells: { pill: NO, box: YES, panel: YES, dock: YES, command: YES },
  },
  {
    label: 'Model slot',
    cells: { pill: 'In the row', box: 'Action row, right', panel: 'Action row, right', dock: 'Before send', command: 'Key-hint footer' },
  },
  {
    label: 'Tools slot',
    cells: { pill: <Badge tone="warning">Not rendered</Badge>, box: 'After add button', panel: 'After add button', dock: 'Inline from @2xl, else below', command: 'Row under the box' },
  },
  {
    label: 'Built-in tools',
    cells: { pill: 'Add, mic', box: 'Add, mic', panel: 'Add', dock: 'Add, mention, web toggle', command: 'Attach' },
  },
  {
    label: 'Status placement',
    cells: { pill: 'Under', box: 'Under', panel: 'On the rail', dock: 'Under, centred', command: 'Under, monospace' },
  },
  {
    label: 'Modes',
    cells: { pill: NO, box: NO, panel: <Badge tone="purple">Permission menu</Badge>, dock: NO, command: NO },
  },
  {
    label: 'Slash commands',
    cells: { pill: NO, box: NO, panel: NO, dock: NO, command: <Badge tone="info">4 commands</Badge> },
  },
  {
    label: 'Busy indicator',
    cells: { pill: 'Stop button', box: 'Stop button', panel: 'Stop button', dock: 'Stop button', command: 'Scan line + timer' },
  },
  {
    label: 'Stop control',
    cells: { pill: 'Stop button', box: 'Stop button', panel: 'Stop button', dock: 'Stop button', command: 'esc hint button' },
  },
  {
    label: 'Esc to stop',
    cells: { pill: YES, box: YES, panel: YES, dock: YES, command: YES },
  },
  {
    label: 'Best width',
    cells: { pill: 'Any', box: 'Thread column', panel: 'Main column', dock: 'Any (container query)', command: 'Dev pane' },
  },
  {
    label: 'Default in templates',
    cells: Object.fromEntries(COMPOSER_VARIANTS.map((v) => [v.id, (DEFAULT_IN[v.id] ?? []).join(', ') || '—'])),
  },
];

export function ComposerCompare() {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border-button-default bg-background-primary-default">
      <table className="w-full min-w-[760px] border-collapse text-start text-body-2-medium">
        <thead>
          <tr className="h-9 bg-background-tertiary-default/70 text-caption-1-medium text-text-tertiary">
            <th scope="col" className="sticky start-0 bg-background-tertiary-default px-3 text-start font-medium">
              Feature
            </th>
            {COMPOSER_VARIANTS.map((v) => (
              <th key={v.id} scope="col" className="px-3 text-start font-medium">
                <span className="text-text-primary">{v.name}</span> <span className="hidden lg:inline">· {v.from}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label} className="border-t border-border-button-default">
              <th scope="row" className="sticky start-0 bg-background-primary-default px-3 py-2 text-start text-caption-1-medium whitespace-nowrap text-text-tertiary">
                {r.label}
              </th>
              {COMPOSER_VARIANTS.map((v) => (
                <td key={v.id} className="px-3 py-2 align-middle text-text-secondary">
                  {r.cells[v.id] ?? (isExtension(v.id) ? EXTENSIONS[v.id].compare[r.label as CompareRow] : null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
