import { useEffect, useState, type ReactNode } from 'react';
import { DocsPage, DocsPreview } from '@/components/docs/docs-page';
import { cn } from '@/lib/utils';
import { BLOUB_NAMES, BLOUBS, Bloub, COLORS, EXPRESSIONS, POSES, stateFor, statesFor, type BloubVariant, type StateId } from '@/templates/kit/bloub';
import { CodeBlock } from '@/templates/kit/markdown';
import { useLocale } from '@/templates/kit/i18n';
import { BLOUB, applyHead } from '@/seo/routes';

/* `/components/bloub`: our animated agent avatar, after bloub (github.com/jeremy-prt/bloub, MIT), in four
 * characters. A character is only the body silhouette, so every animation, colour and expression works on all four. */

const USAGE = `import { Bloub } from '@/templates/kit/bloub';

// A character, a colour and a resting expression. \`state\` plays one of the 14 animations; a character
// plays eight: the ones that keep its body, plus alert, exclaim and sleep drawn beside it. The others swap (thinking -> swirl). statesFor('chat') lists them.
<Bloub variant="chat" color="orange" expression="heureux" state={busy ? 'thinking' : 'idle'} size={40} />

// Eyes follow the pointer while the bloub rests.
<Bloub variant="chien" size={136} follow />

// A still frame, no animation loop: thumbnails and lists.
<Bloub variant="fleur" frozenAt={0.4} />`;

const PAPER = 'rounded-3xl bg-background-primary-default shadow-xs';

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn('h-7 rounded-full px-3 text-caption-1-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring', on ? 'bg-text-primary text-background-primary-default' : 'bg-background-tertiary-default text-text-secondary hover:text-text-primary')}
    >
      {children}
    </button>
  );
}

function Playground() {
  const [variant, setVariant] = useState<BloubVariant>('default');
  const [color, setColor] = useState('encre');
  const [picked, setState] = useState<StateId>('idle');
  // A character keeps its body: switching to one moves a body-swapping animation to its stand-in.
  const state = stateFor(picked, variant);
  return (
    <DocsPreview className="flex-col gap-6">
      <div className={cn(PAPER, 'flex flex-col items-center px-4 pt-2 pb-3')}>
        <Bloub size={168} variant={variant} color={color} state={state} paper="panel" follow label={BLOUB_NAMES[variant]} />
        <span className="text-caption-1-medium text-text-tertiary">
          {BLOUB_NAMES[variant]} · {BLOUB_NAMES[state]}
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {BLOUBS.map((b) => (
          <Chip key={b.id} on={variant === b.id} onClick={() => setVariant(b.id)}>
            {BLOUB_NAMES[b.id]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {statesFor(variant).map((s) => (
          <Chip key={s} on={state === s} onClick={() => setState(s)}>
            {BLOUB_NAMES[s]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={BLOUB_NAMES[c.id]}
            aria-label={BLOUB_NAMES[c.id]}
            aria-pressed={color === c.id}
            onClick={() => setColor(c.id)}
            className={cn('size-6 rounded-full border border-black/10 ring-offset-2 ring-offset-background-primary-default transition-[box-shadow,scale] hover:scale-110 dark:border-white/15', color === c.id && 'ring-2 ring-text-primary')}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </DocsPreview>
  );
}

/** The four characters, alive, side by side. */
function Characters() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BLOUBS.map((b) => (
        <div key={b.id} className={cn(PAPER, 'flex flex-col items-center pt-2 pb-3')}>
          <Bloub size={112} variant={b.id} paper="panel" follow label={BLOUB_NAMES[b.id]} />
          <span className="text-body-2-medium text-text-primary">{BLOUB_NAMES[b.id]}</span>
          <code className="text-caption-2-regular text-text-tertiary">variant="{b.id}"</code>
        </div>
      ))}
    </div>
  );
}

/** Every resting expression on every character, as still frames. */
function Expressions() {
  return (
    <div className={cn(PAPER, 'scrollbar-thin overflow-x-auto p-3')}>
      <table className="border-separate border-spacing-1">
        <tbody>
          {BLOUBS.map((b) => (
            <tr key={b.id}>
              <th scope="row" className="pe-2 text-start text-caption-1-medium whitespace-nowrap text-text-secondary">
                {BLOUB_NAMES[b.id]}
              </th>
              {EXPRESSIONS.map((e) => (
                <td key={e.id} title={BLOUB_NAMES[e.id]}>
                  <Bloub size={44} variant={b.id} expression={e.id} frozenAt={POSES.idle} paper="panel" label={`${BLOUB_NAMES[b.id]}, ${BLOUB_NAMES[e.id]}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BloubPage() {
  // BLOUB_NAMES reads the locale when it is read: re-render the page on a switch.
  useLocale();
  useEffect(() => {
    applyHead(BLOUB);
  }, []);

  return (
    <DocsPage
      title="Bloub: an animated agent avatar, in four characters"
      description="One filled shape with two eyes cut out of it, morphing through 14 states: thinking, notifying, orbiting, sleeping and more. Pick a character (Bloub, Cat, Dog or Flower), a colour and a resting expression; the eyes follow the pointer while it rests. Plain SVG, no animation library."
      sections={[
        {
          id: 'preview',
          title: 'Preview',
          lead: 'Pick a character, an animation and a colour. Move the pointer around: the eyes follow it at rest. Bloub plays all 14 animations; Cat, Dog and Flower play eight: the ones that keep their silhouette, with the alert, exclamation and sleep signs drawn beside the head.',
          children: <Playground />,
        },
        {
          id: 'characters',
          title: 'Characters',
          lead: 'A character is the body silhouette. All four share every colour and expression; the animations that swap the body for another shape (egg, hexagon, orbit...) stay with the default Bloub.',
          children: <Characters />,
        },
        {
          id: 'expressions',
          title: 'Expressions',
          lead: 'The 16 resting expressions, fitted to each silhouette so the eyes never touch the edge.',
          children: <Expressions />,
        },
        {
          id: 'usage',
          title: 'Usage',
          children: <CodeBlock lang="tsx" title="avatar.tsx" code={USAGE} />,
        },
      ]}
    />
  );
}
