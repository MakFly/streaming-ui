import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Copy, Ellipsis, Eye as EyeIcon, EyeOff, Menu, MessageCircle, PanelLeft, Pencil, Pin, PinOff, Repeat, Search, SlidersHorizontal, SquarePen, FlaskConical, Trash2, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatEngine, type ChatScriptApi, type Message } from './kit/engine';
import { copyOf, defineCopy, useLocale } from './kit/i18n';
import { ActionBar, Avatar, ChatSurface, Canvas, Composer, Drawer, HeaderTools, IconButton, SideRail, Suggestions, Surface, textOf } from './kit/parts';

/* Mascot Chat — a messenger whose assistants are characters. Twelve mascots, each with its own shape, motion and
 * voice: the one that answers wiggles or hops in the typing bubble, then its reply streams in and it reacts (a hop
 * when it lands, happy eyes when you say thanks, a shrug when you stop it). The strip above the composer picks who
 * answers next, or the dice lets a new one take each reply. The sidebar lists the cast by voice (pinned ones first)
 * and the chats they hosted; it folds to a rail of the pinned mascots, and becomes a drawer on phones. */

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
/** Follows the system setting live, not only at load. */
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      motionQuery?.addEventListener('change', cb);
      return () => motionQuery?.removeEventListener('change', cb);
    },
    () => motionQuery?.matches ?? false,
    () => false,
  );
}

/* ---------- The twelve mascots: shape, colour, motion, eyes, and a voice ---------- */

type Eyes = { kind: 'path'; d: string; d2?: string; stroke?: number } | { kind: 'dot'; className: string };
/** How a mascot words its replies: brief ones cut to the point, dreamy ones wander a little. */
type Voice = 'brief' | 'warm' | 'careful' | 'dreamy';
interface MascotDef {
  name: string;
  /** One word for its character, shown next to its name. */
  trait: string;
  voice: Voice;
  /** A style tag under its replies ("Cloud · drifting off"): never a claim, so it can't contradict the answer. */
  signoff: string;
  /** Typing time multiplier: Diamond is quick, Cloud takes its time. */
  pace: number;
  color: string;
  /** rotate: a 15° wiggle. jump: a small hop. Then a rest of `rest` seconds before the next one. */
  motion: 'rotate' | 'jump';
  rest: number;
  body: string;
  gap: string;
  pad?: string;
  eyes: Eyes;
}

const circles = (list: [number, number, number][]) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
const chevrons: Eyes = { kind: 'path', d: 'M3 2L7 5L3 8', d2: 'M7 2L3 5L7 8' };

const MASCOTS: MascotDef[] = [
  { name: 'Flower', trait: 'sunny', signoff: 'stay sunny', voice: 'warm', pace: 1, color: 'fill-orange-600 stroke-orange-600 dark:fill-orange-400 dark:stroke-orange-400', motion: 'rotate', rest: 2.5, body: circles([[50, 50, 26], [74, 50, 16], [62, 70.8, 16], [38, 70.8, 16], [26, 50, 16], [38, 29.2, 16], [62, 29.2, 16]]), gap: 'gap-2', eyes: chevrons },
  { name: 'Bear', trait: 'cuddly', signoff: 'warmly', voice: 'warm', pace: 1.1, color: 'fill-amber-700 stroke-amber-700 dark:fill-amber-300 dark:stroke-amber-300', motion: 'jump', rest: 3, body: '<rect x="18" y="30" width="64" height="52" rx="24"/>' + circles([[31, 30, 12], [69, 30, 12]]), gap: 'gap-2.5', pad: 'pt-2', eyes: { kind: 'dot', className: 'size-2.5' } },
  { name: 'Scallop', trait: 'fussy', signoff: 'fussily yours', voice: 'careful', pace: 1.2, color: 'fill-teal-600 stroke-teal-600 dark:fill-teal-400 dark:stroke-teal-400', motion: 'rotate', rest: 2, body: circles([[50, 50, 32], [80, 50, 11], [76, 65, 11], [65, 76, 11], [50, 80, 11], [35, 76, 11], [24, 65, 11], [20, 50, 11], [24, 35, 11], [35, 24, 11], [50, 20, 11], [65, 24, 11], [76, 35, 11]]), gap: 'gap-2', eyes: { kind: 'path', d: 'M2 7L5 3L8 7' } },
  { name: 'Drop', trait: 'calm', signoff: 'calmly', voice: 'dreamy', pace: 1.1, color: 'fill-blue-500 stroke-blue-500', motion: 'jump', rest: 2.5, body: '<path d="M50 14 C50 14 22 44 22 64 a28 28 0 0 0 56 0 C78 44 50 14 50 14Z" stroke-width="6" stroke-linejoin="round" transform="rotate(-25 50 50)"/>', gap: 'gap-2.5', pad: 'pt-3', eyes: { kind: 'dot', className: 'h-3 w-1.5' } },
  { name: 'Diamond', trait: 'blunt', signoff: 'D.', voice: 'brief', pace: 0.7, color: 'fill-cyan-600 stroke-cyan-600 dark:fill-cyan-400 dark:stroke-cyan-400', motion: 'rotate', rest: 3, body: '<polygon points="50,20 80,50 50,80 20,50" stroke-width="18" stroke-linejoin="round"/>', gap: 'gap-2', eyes: { kind: 'path', d: 'M5 1.5V8.5M1.9 3.25L8.1 6.75M1.9 6.75L8.1 3.25', stroke: 1.6 } },
  { name: 'Triangle', trait: 'sharp', signoff: 'to the point', voice: 'brief', pace: 0.8, color: 'fill-lime-700 stroke-lime-700 dark:fill-lime-400 dark:stroke-lime-400', motion: 'jump', rest: 2, body: '<polygon points="50,24 80,74 20,74" stroke-width="14" stroke-linejoin="round"/>', gap: 'gap-2', pad: 'pt-4', eyes: { kind: 'path', d: 'M5 2V8M2 5H8' } },
  { name: 'Clover', trait: 'lucky', signoff: 'with luck', voice: 'warm', pace: 1, color: 'fill-emerald-600 stroke-emerald-600 dark:fill-emerald-400 dark:stroke-emerald-400', motion: 'rotate', rest: 2.5, body: circles([[50, 50, 22], [64.1, 64.1, 20], [35.9, 64.1, 20], [35.9, 35.9, 20], [64.1, 35.9, 20]]), gap: 'gap-2', eyes: { kind: 'path', d: 'M2 4Q5 8 8 4' } },
  { name: 'Squircle', trait: 'steady', signoff: 'steadily', voice: 'careful', pace: 1, color: 'fill-rose-500 stroke-rose-500 dark:fill-rose-400 dark:stroke-rose-400', motion: 'jump', rest: 3, body: '<rect x="14" y="14" width="72" height="72" rx="20"/>', gap: 'gap-3.5', eyes: { kind: 'dot', className: 'size-2' } },
  { name: 'Hexagon', trait: 'methodical', signoff: 'methodically', voice: 'careful', pace: 1.2, color: 'fill-violet-500 stroke-violet-500 dark:fill-violet-400 dark:stroke-violet-400', motion: 'rotate', rest: 2, body: '<polygon points="50,16 78,32 78,68 50,84 22,68 22,32" stroke-width="12" stroke-linejoin="round"/>', gap: 'gap-2', eyes: chevrons },
  { name: 'Circle', trait: 'chill', signoff: 'no rush', voice: 'dreamy', pace: 1.3, color: 'fill-yellow-700 stroke-yellow-700 dark:fill-yellow-300 dark:stroke-yellow-300', motion: 'jump', rest: 2.5, body: '<circle cx="50" cy="50" r="38"/>', gap: 'gap-2', eyes: { kind: 'path', d: 'M2 5H8' } },
  { name: 'Cloud', trait: 'dreamy', signoff: 'drifting off', voice: 'dreamy', pace: 1.4, color: 'fill-sky-600 stroke-sky-600 dark:fill-sky-300 dark:stroke-sky-300', motion: 'rotate', rest: 3, body: circles([[50, 50, 26], [50, 28, 17], [70.9, 43.2, 17], [62.9, 67.8, 17], [37.1, 67.8, 17], [29.1, 43.2, 17]]), gap: 'gap-2.5', eyes: { kind: 'dot', className: 'h-3 w-1.5' } },
  { name: 'Pebble', trait: 'grounded', signoff: 'one step at a time', voice: 'brief', pace: 0.9, color: 'fill-indigo-500 stroke-indigo-500 dark:fill-indigo-400 dark:stroke-indigo-400', motion: 'jump', rest: 2, body: '<path d="M40 14 C56 10 64 28 76 44 C90 62 86 84 64 86 L36 86 C14 86 10 66 22 46 C30 32 28 18 40 14Z" stroke-width="6" stroke-linejoin="round"/>', gap: 'gap-2.5', pad: 'pt-5', eyes: { kind: 'dot', className: 'size-2.5' } },
];

/** Each mascot's character word and sign-off, per language (names stay as they are). */
const PERSONA = defineCopy({
  en: [
    ['sunny', 'stay sunny'], ['cuddly', 'warmly'], ['fussy', 'fussily yours'], ['calm', 'calmly'], ['blunt', 'D.'], ['sharp', 'to the point'],
    ['lucky', 'with luck'], ['steady', 'steadily'], ['methodical', 'methodically'], ['chill', 'no rush'], ['dreamy', 'drifting off'], ['grounded', 'one step at a time'],
  ] as [string, string][],
  fr: [
    ['solaire', 'reste solaire'], ['câlin', 'chaleureusement'], ['tatillon', 'tatillonnement vôtre'], ['calme', 'calmement'], ['franc', 'D.'], ['vif', 'droit au but'],
    ['chanceux', 'avec chance'], ['posé', 'posément'], ['méthodique', 'méthodiquement'], ['cool', 'sans stress'], ['rêveur', 'dans les nuages'], ['ancré', 'pas à pas'],
  ] as [string, string][],
});
// trait and signoff read the current language whenever they are read, so every `m.trait` in the file follows it.
MASCOTS.forEach((m, i) =>
  Object.defineProperties(m, {
    trait: { get: () => copyOf(PERSONA)[i][0], enumerable: true },
    signoff: { get: () => copyOf(PERSONA)[i][1], enumerable: true },
  }),
);

/** idle: still. typing: moving. happy: smiling eyes. stopped: flat eyes and a tilt, a small shrug. */
type Mood = 'idle' | 'typing' | 'happy' | 'stopped';
const MOOD_EYES: Partial<Record<Mood, Eyes>> = {
  happy: { kind: 'path', d: 'M2 6.5Q5 2.5 8 6.5' },
  stopped: { kind: 'path', d: 'M2.5 5.5H7.5' },
};

function Eye({ eyes, second }: { eyes: Eyes; second?: boolean }) {
  if (eyes.kind === 'dot') return <div className={cn('rounded-full bg-gray-950', eyes.className)} />;
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" className="size-3 fill-none stroke-gray-950" strokeWidth={eyes.stroke ?? 2} strokeLinecap="round" strokeLinejoin="round">
      <path d={second && eyes.d2 ? eyes.d2 : eyes.d} />
    </svg>
  );
}

/**
 * One mascot. `typing` makes it move: the body wiggles or hops, then rests; the eyes glance about on a spring and
 * blink now and then. `hop` plays one hop each time it changes (a reply landing). Still otherwise, and under reduced motion.
 */
function Mascot({ index, size = 40, mood = 'idle', hop = 0, label, className }: { index: number; size?: number; mood?: Mood; hop?: number; /** Names it for assistive tech; omit when a parent already does. */ label?: string; className?: string }) {
  const m = MASCOTS[index];
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<SVGSVGElement>(null);
  const eyes = useRef<HTMLDivElement>(null);
  const typing = mood === 'typing';

  useEffect(() => {
    const el = root.current;
    const b = body.current;
    const e = eyes.current;
    if (!typing || reduce || !el || !b || !e) return;
    // The move takes its own duration, then the rest: one keyframe set per cycle, repeated.
    const move = m.motion === 'rotate' ? 0.6 : 0.45;
    const total = (move + m.rest) * 1000;
    const end = (move * 1000) / total;
    const frames: Keyframe[] =
      m.motion === 'rotate'
        ? [{ transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)', offset: end / 2 }, { transform: 'rotate(0deg)', offset: end }, { transform: 'rotate(0deg)' }]
        : [{ transform: 'translateY(0)' }, { transform: `translateY(${-(size / 96) * 10}px)`, offset: end / 2 }, { transform: 'translateY(0)', offset: end }, { transform: 'translateY(0)' }];
    const loop = (m.motion === 'rotate' ? b : el).animate(frames, { duration: total, iterations: Infinity, easing: 'ease-in-out' });
    e.style.transition = `translate .5s ${SPRING}, scale .1s linear`;
    const timers: number[] = [];
    const glance = () => {
      const centre = Math.random() < 0.25;
      e.style.translate = centre ? '0px 0px' : `${(Math.random() * 2 - 1) * 6}px ${(Math.random() * 1.4 - 0.7) * 5}px`;
      timers.push(window.setTimeout(glance, 1200 + Math.random() * 1600));
    };
    const blink = () => {
      e.style.scale = '1 0.1';
      timers.push(window.setTimeout(() => (e.style.scale = '1 1'), 140));
      timers.push(window.setTimeout(blink, 2000 + Math.random() * 3000));
    };
    timers.push(window.setTimeout(glance, 800), window.setTimeout(blink, 2000 + Math.random() * 3000));
    return () => {
      loop.cancel();
      timers.forEach(clearTimeout);
      e.style.translate = '';
      e.style.scale = '';
    };
  }, [typing, reduce, m, size]);

  useEffect(() => {
    if (!hop || reduce) return;
    root.current?.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-size * 0.22}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }, [hop, reduce, size]);

  const shownEyes = MOOD_EYES[mood] ?? m.eyes;
  return (
    <div ref={root} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <div className={cn('absolute inset-0 transition-transform duration-300 motion-reduce:transition-none', mood === 'stopped' && '-rotate-12')}>
        <svg ref={body} viewBox="0 0 100 100" aria-hidden="true" className={cn('size-full origin-center', m.color)} dangerouslySetInnerHTML={{ __html: m.body }} />
        <div className={cn('absolute top-1/2 left-1/2 flex size-24 items-center justify-center', m.pad)} style={{ transform: `translate(-50%,-50%) scale(${size / 96})` }}>
          <div ref={eyes} className={cn('flex items-center', m.gap)}>
            <Eye eyes={shownEyes} />
            <Eye eyes={shownEyes} second />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- The conversation ---------- */

/** The mascot about to answer, kept in sync by the component: the scripts read its pace and voice. */
const speaker: {
  index: number;
  /** Set by the intro: hands a turn to a given mascot whatever the pick. */
  cast: number | null;
  /** Huddle on: every question worth looking up goes to a team of four. */
  huddle: boolean;
  /** From the config: whether huddles happen at all, and how many mascots join the lead. */
  mode: MascotChatConfig['huddle'];
  crewSize: number;
} = { index: 0, cast: null, huddle: false, mode: 'research', crewSize: 3 };
const speakerNow = () => speaker.cast ?? speaker.index;
/** Slow motion for the test menu: every huddle timing (script, dust, fold, entrances) is multiplied by `scale`. */
const tempo = { scale: 1 };

/* ---------- Configuration: everything the component lets you set, and what the preview's Configure panel edits ---------- */

export interface MascotChatConfig {
  /** Who answers first (index in the cast: 0 Flower ... 11 Pebble). */
  defaultMascot: number;
  /** Start with Take turns on: each reply goes to the next mascot. */
  takeTurns: boolean;
  /** off: never huddle. research: questions that read as research huddle (the toggle extends it). always: every
   *  question but small talk. */
  huddle: 'off' | 'research' | 'always';
  /** How many mascots join the lead in a huddle. */
  crewSize: 1 | 2 | 3;
  /** Numbered citations in huddle answers, the sources pill and the Sources tab. */
  sources: boolean;
  sidebar: 'open' | 'folded' | 'hidden';
  /** The "who answers next" row above the composer. */
  strip: boolean;
  /** The scripted opening conversation. */
  intro: boolean;
  /** Streamed words clear in from a blur; off, they appear as they arrive. */
  wordBlur: boolean;
  /** Huddle rows leave as dust; off, they fade. */
  dust: boolean;
  /** Huddle tempo: 1 normal, 2 or 4 for slow motion. */
  speed: 1 | 2 | 4;
  /** The flask menu in the header that replays scripted test runs. */
  testMenu: boolean;
}

export const DEFAULT_CONFIG: MascotChatConfig = {
  defaultMascot: 0,
  takeTurns: false,
  huddle: 'research',
  crewSize: 3,
  sources: true,
  sidebar: 'open',
  strip: true,
  intro: true,
  wordBlur: true,
  dust: true,
  speed: 1,
  testMenu: true,
};

/** The settings the thread's pieces read while they render (the rest is wired where it is used). */
const LookCtx = createContext<Pick<MascotChatConfig, 'wordBlur' | 'dust' | 'sources'>>(DEFAULT_CONFIG);

type Intent = 'thanks' | 'hello' | 'who' | 'bug' | 'tests' | 'other';
/** English and French both: the template answers in the locale, but people type what they type. */
function intentOf(text: string): Intent {
  const t = text.toLowerCase();
  // Thanks first: "thank you" must not read as a question about "you".
  if (/\b(thanks|thank you|thx|merci|cheers)\b/.test(t)) return 'thanks';
  if (/\b(hi|hello|hey|salut|bonjour|coucou)\b/.test(t)) return 'hello';
  if (/\bwho are you\b|\byour name\b|\bwho is this\b|qui es-tu|qui êtes-vous|qui es tu|\bton nom\b/.test(t)) return 'who';
  // Tests before bugs: "it only fails in CI" is a flaky-test question, not a stack trace.
  if (/\b(test|tests|flaky|ci|instables?)\b/.test(t)) return 'tests';
  // \w*error catches TypeError and friends, which a plain \berror\b misses.
  if (/\b(bug|\w*error|exception|fail|fails|failing|broken|crash|crashes|erreur|plante|cassé)\b|doesn'?t work|not working|marche pas|fonctionne pas/.test(t)) return 'bug';
  return 'other';
}

/** The conversation's copy: the same help in four voices (`{name}` and `{trait}` are the mascot's own), the
 *  follow-ups, the starters and the opening conversation. */
const TALK = defineCopy({
  en: {
    replies: {
      thanks: {
        brief: 'Anytime.',
        warm: 'Aw, any time. I am right here if anything else comes up.',
        careful: 'Glad it helped. If something still looks off later, send it my way and we will check it properly.',
        dreamy: 'Mm, any time. I will be floating around here, blinking, until you need me again.',
      },
      hello: {
        brief: '{name}. What do you need?',
        warm: 'Hey, {name} here! What are we working on today?',
        careful: 'Hello, {name} here. Tell me what you are working on and what you have tried so far.',
        dreamy: 'Oh, hello. {name} here, just drifting by. What shall we look at today?',
      },
      who: {
        brief: '{name}. The {trait} one. Short answers.',
        warm: 'I am {name}, the {trait} one. Pick anyone above the message box if you want a different voice next time.',
        careful: 'I am {name}, the {trait} one: I like to check every detail before I answer. The row above the message box picks who replies next.',
        dreamy: 'I am {name}, the {trait} one. I take my time and wander a little before I land on an answer. The others are waiting just above the message box.',
      },
      bug: {
        brief: 'Stack trace and last diff. Send both.',
        warm: 'Oh no. Send me the stack trace and the last change you made, and we will find it together.',
        careful: 'Send me the full stack trace, the last change you made and how to reproduce it. Nine times out of ten the bug lives in that diff.',
        dreamy: 'Bugs usually hide where we changed things last. Share the stack trace and that diff, and we will follow the trail together.',
      },
      tests: {
        brief: 'Run it ten times. Shared state or a timer.',
        warm: 'Flaky tests are the worst. Run it ten times in a row; if it fails once, look for shared state or a timer.',
        careful: 'Run it ten times in a row and note which runs fail. Then look for shared state between tests, real timers and network calls, in that order.',
        dreamy: 'Flaky tests are like weather. Run it ten times and watch the pattern: shared state or a stray timer is usually the cloud overhead.',
      },
      other: {
        brief: 'Smallest change that proves it. Then polish.',
        warm: 'Good one. Start with the smallest change that proves it, then we can make it pretty together.',
        careful: 'Start with the smallest change that proves it, check it does what you expect, then we can make it pretty.',
        dreamy: 'Hmm. Start small, with the tiniest change that proves the idea, and let the pretty part come later.',
      },
    },
    followUps: {
      thanks: ['Who are you?', 'I found a bug'],
      hello: ['Who are you?', 'My tests are flaky'],
      who: ['I found a bug', 'My tests are flaky'],
      bug: ['It only fails in CI', 'Thanks!'],
      tests: ['It only fails in CI', 'Thanks!'],
      other: ['Best way to cache API calls?', 'My tests are flaky'],
    },
    starters: ['Hi there!', 'Best way to cache API calls?', 'My tests are flaky'],
    intro: [
      {
        q: 'What can you help with?',
        a: {
          brief: 'Drafts, reviews, shipping. Paste a diff.',
          warm: 'Drafting, reviewing and shipping, mostly! Paste a diff and I will walk you through it.',
          careful: 'Drafting, reviewing and shipping. Paste a diff and I will go through it line by line.',
          dreamy: 'Drafting, reviewing, shipping, the usual clouds. Paste a diff and we will wander through it.',
        },
      },
      {
        q: 'Is this regex safe?',
        a: {
          brief: 'Mostly. Anchor it: the nested quantifier backtracks.',
          warm: 'Mostly! The nested quantifier can backtrack on long input, so anchor it first.',
          careful: 'Mostly. The nested quantifier can backtrack on long input: anchor it first, then test it on a 10 kB string.',
          dreamy: 'Mostly. That nested quantifier can loop around on long input for ages, so anchor it first.',
        },
      },
      {
        q: 'Thanks!',
        a: {
          brief: 'Anytime.',
          warm: 'Aw, any time. I am right here if anything else comes up.',
          careful: 'Glad it helped. If something still looks off later, send it my way and we will check it properly.',
          dreamy: 'Mm, any time. I will be floating around here, blinking, until you need me again.',
        },
      },
    ],
  },
  fr: {
    replies: {
      thanks: {
        brief: 'Avec plaisir.',
        warm: "Oh, avec plaisir. Je suis juste là s'il y a autre chose.",
        careful: "Content que ça aide. Si quelque chose cloche encore plus tard, envoie-le-moi et on vérifiera ça proprement.",
        dreamy: "Mm, avec plaisir. Je vais flotter par ici en clignant des yeux, jusqu'à ce que tu aies de nouveau besoin de moi.",
      },
      hello: {
        brief: '{name}. Tu as besoin de quoi ?',
        warm: "Salut, c'est {name} ! On travaille sur quoi aujourd'hui ?",
        careful: "Bonjour, ici {name}. Dis-moi sur quoi tu travailles et ce que tu as déjà essayé.",
        dreamy: "Oh, bonjour. C'est {name}, je passais par là. On regarde quoi aujourd'hui ?",
      },
      who: {
        brief: '{name}. Le côté {trait}. Réponses courtes.',
        warm: "Je suis {name}, côté {trait}. Choisis quelqu'un d'autre au-dessus de la zone de message si tu veux une autre voix la prochaine fois.",
        careful: "Je suis {name}, côté {trait} : j'aime vérifier chaque détail avant de répondre. La rangée au-dessus de la zone de message choisit qui répond ensuite.",
        dreamy: "Je suis {name}, côté {trait}. Je prends mon temps et je flâne un peu avant d'atterrir sur une réponse. Les autres attendent juste au-dessus de la zone de message.",
      },
      bug: {
        brief: 'Stack trace et dernier diff. Envoie les deux.',
        warm: 'Oh non. Envoie-moi la stack trace et ta dernière modification, on va le trouver ensemble.',
        careful: "Envoie-moi la stack trace complète, ta dernière modification et comment reproduire. Neuf fois sur dix, le bug vit dans ce diff.",
        dreamy: "Les bugs se cachent souvent là où on a changé quelque chose en dernier. Partage la stack trace et ce diff, et on suivra la piste ensemble.",
      },
      tests: {
        brief: "Lance-le dix fois. État partagé ou timer.",
        warm: "Les tests instables, c'est le pire. Lance-le dix fois d'affilée ; s'il échoue une fois, cherche un état partagé ou un timer.",
        careful: "Lance-le dix fois d'affilée et note les exécutions qui échouent. Cherche ensuite un état partagé entre tests, de vrais timers et des appels réseau, dans cet ordre.",
        dreamy: "Les tests instables, c'est comme la météo. Lance-le dix fois et observe : un état partagé ou un timer égaré, c'est souvent le nuage au-dessus.",
      },
      other: {
        brief: 'La plus petite modif qui le prouve. Puis on peaufine.',
        warm: 'Bonne question. Commence par la plus petite modification qui le prouve, puis on le rendra joli ensemble.',
        careful: "Commence par la plus petite modification qui le prouve, vérifie qu'elle fait ce que tu attends, puis on le rendra joli.",
        dreamy: "Hmm. Commence petit, avec la toute petite modification qui prouve l'idée, et laisse le joli venir après.",
      },
    },
    followUps: {
      thanks: ['Qui es-tu ?', "J'ai trouvé un bug"],
      hello: ['Qui es-tu ?', 'Mes tests sont instables'],
      who: ["J'ai trouvé un bug", 'Mes tests sont instables'],
      bug: ["Ça n'échoue qu'en CI", 'Merci !'],
      tests: ["Ça n'échoue qu'en CI", 'Merci !'],
      other: ["Meilleur cache pour des appels d'API ?", 'Mes tests sont instables'],
    },
    starters: ['Salut !', "Meilleur cache pour des appels d'API ?", 'Mes tests sont instables'],
    intro: [
      {
        q: 'Tu peux m’aider sur quoi ?',
        a: {
          brief: 'Brouillons, relectures, mises en prod. Colle un diff.',
          warm: 'Surtout rédiger, relire et livrer ! Colle un diff et je te guide.',
          careful: 'Rédiger, relire et livrer. Colle un diff et je le passe en revue ligne par ligne.',
          dreamy: 'Rédiger, relire, livrer, les nuages habituels. Colle un diff et on s’y promènera.',
        },
      },
      {
        q: 'Cette regex est sûre ?',
        a: {
          brief: 'Presque. Ancre-la : le quantificateur imbriqué fait du backtracking.',
          warm: "Presque ! Le quantificateur imbriqué peut faire du backtracking sur une longue entrée, alors ancre-la d'abord.",
          careful: "Presque. Le quantificateur imbriqué peut faire du backtracking sur une longue entrée : ancre-la d'abord, puis teste-la sur une chaîne de 10 ko.",
          dreamy: "Presque. Ce quantificateur imbriqué peut tourner en rond très longtemps sur une longue entrée, alors ancre-la d'abord.",
        },
      },
      {
        q: 'Merci !',
        a: {
          brief: 'Avec plaisir.',
          warm: "Oh, avec plaisir. Je suis juste là s'il y a autre chose.",
          careful: "Content que ça aide. Si quelque chose cloche encore plus tard, envoie-le-moi et on vérifiera ça proprement.",
          dreamy: "Mm, avec plaisir. Je vais flotter par ici en clignant des yeux, jusqu'à ce que tu aies de nouveau besoin de moi.",
        },
      },
    ],
  },
});

function replyFor(text: string, m: MascotDef) {
  return copyOf(TALK).replies[intentOf(text)][m.voice].replace('{name}', m.name).replace('{trait}', m.trait);
}

/** How long the mascot types: longer answers take longer, at the mascot's own pace. */
const typingFor = (text: string, m: MascotDef) => Math.min(3200, (1000 + text.length * 12) * m.pace);

async function answer(api: ChatScriptApi, text: string) {
  const m = MASCOTS[speakerNow()];
  const a = api.assistant();
  await api.sleep(typingFor(text, m));
  await a.stream(text, 26);
  a.done();
}

/** The intro is a relay: three voices answer in turn (warm Flower, brief Diamond, dreamy Cloud), so the cast shows
 *  before anyone touches the picker. Then the pick takes over again. */
const INTRO_CAST = [0, 4, 10];

/** The empty state's cast, one mascot per voice: Flower (warm), Diamond (brief), Hexagon (careful), Cloud (dreamy). */
const CAST = [0, 4, 8, 10];

async function intro(api: ChatScriptApi) {
  const turns = copyOf(TALK).intro;
  try {
    for (const [i, { q, a }] of turns.entries()) {
      speaker.cast = INTRO_CAST[i];
      await api.sleep(500);
      await api.user(q, { type: true });
      await answer(api, a[MASCOTS[speakerNow()].voice]);
    }
  } finally {
    speaker.cast = null;
  }
}

async function reply(api: ChatScriptApi, text: string) {
  if (wantsHuddle(text)) return huddle(api, text);
  await answer(api, replyFor(text, MASCOTS[speakerNow()]));
}

/* ---------- Huddle: the lead mascot looks it up with three others, one per other voice ---------- */

/** A site stand-in: its initial on its brand colour (real favicons are third-party assets). */
interface Source {
  site: string;
  title: string;
  domain: string;
}
type HuddleItem =
  | { id: string; kind: 'search'; who: number; query: string; results: number; sites: string[]; pending?: boolean }
  | { id: string; kind: 'visit'; who: number; url: string }
  | { id: string; kind: 'msg'; who: number; text: string }
  | { id: string; kind: 'status'; text: string };
interface HuddleData {
  lead: number;
  crew: number[];
  /** Who has joined so far, the lead first: the stack in the header grows one mascot at a time. */
  joined: number[];
  items: HuddleItem[];
  sources: Source[];
  started: number;
  done: boolean;
  seconds?: number;
}

type Topic = 'cache' | 'bug' | 'tests' | 'other';
const SITES = {
  mdn: { site: 'M:#1b1b1b', title: 'MDN Web Docs', domain: 'developer.mozilla.org' },
  webdev: { site: 'W:#1a73e8', title: 'web.dev', domain: 'web.dev' },
  redis: { site: 'R:#dc382d', title: 'Redis docs', domain: 'redis.io' },
  so: { site: 'S:#f48024', title: 'Stack Overflow', domain: 'stackoverflow.com' },
  fowler: { site: 'F:#2e7d32', title: 'Martin Fowler', domain: 'martinfowler.com' },
  git: { site: 'G:#f05032', title: 'Git docs', domain: 'git-scm.com' },
  sentry: { site: 'S:#362d59', title: 'Sentry blog', domain: 'blog.sentry.io' },
  google: { site: 'G:#4285f4', title: 'Google Testing Blog', domain: 'testing.googleblog.com' },
  vitest: { site: 'V:#729b1b', title: 'Vitest', domain: 'vitest.dev' },
  github: { site: 'G:#24292f', title: 'GitHub Docs', domain: 'docs.github.com' },
} satisfies Record<string, Source>;

/** One research script per topic: a query and a page for each helper, and the sources the answer cites ([n] is the
 *  nth source). Queries stay in English, as developers search; what the mascots say is in HUDDLE_COPY. */
const TOPICS: Record<Topic, { queries: string[]; visits: string[]; sources: Source[] }> = {
  cache: {
    queries: ['api response caching strategies', 'stale-while-revalidate http cache', 'redis cache invalidation patterns'],
    visits: ['developer.mozilla.org/docs/Web/HTTP/Caching', 'web.dev/articles/stale-while-revalidate', 'redis.io/docs/manual/client-side-caching'],
    sources: [SITES.mdn, SITES.webdev, SITES.redis, SITES.fowler, SITES.so],
  },
  bug: {
    queries: ['typeerror cannot read properties of undefined', 'git bisect find breaking commit', 'source maps production stack trace'],
    visits: ['developer.mozilla.org/docs/Web/JavaScript/Reference/Errors', 'git-scm.com/docs/git-bisect', 'blog.sentry.io/source-maps'],
    sources: [SITES.mdn, SITES.git, SITES.sentry, SITES.so, SITES.webdev],
  },
  tests: {
    queries: ['flaky tests shared state', 'fake timers vitest', 'test fails only in ci parallel'],
    visits: ['testing.googleblog.com/2016/05/flaky-tests-at-google.html', 'vitest.dev/guide/mocking#timers', 'martinfowler.com/articles/nonDeterminism.html'],
    sources: [SITES.google, SITES.vitest, SITES.fowler, SITES.github, SITES.so],
  },
  other: {
    queries: [],
    visits: ['web.dev/articles', 'martinfowler.com/articles', 'stackoverflow.com/questions'],
    sources: [SITES.webdev, SITES.fowler, SITES.so, SITES.mdn, SITES.github],
  },
};

/** What the mascots say during a huddle and in its answer, per topic and voice. */
const HUDDLE_COPY = defineCopy({
  en: {
    topics: {
      cache: {
        findings: ['HTTP caching first: Cache-Control headers do most of the work for free.', 'stale-while-revalidate serves the old copy while it refreshes in the background.', 'For shared data, Redis with a short TTL beats clever invalidation.'],
        answer: {
          brief: 'Cache-Control first [1]. Add stale-while-revalidate [2]. Redis with a short TTL for shared data [3]. Skip clever invalidation.',
          warm: 'Good news: most of it is free! Start with Cache-Control headers [1], add stale-while-revalidate so nobody waits on a refresh [2], and keep a Redis layer with a short TTL for shared data [3]. Clever invalidation can wait.',
          careful: 'Three layers, in order. First, correct Cache-Control headers on every response [1]. Second, stale-while-revalidate, so a stale copy is served while it refreshes [2]. Third, Redis with a short TTL for data shared across users [3]. Measure the hit rate before adding invalidation logic [4].',
          dreamy: 'Think of it as layers of fog. Cache-Control is the first, softest layer [1]; stale-while-revalidate lets the old view linger while the new one rolls in [2]; and Redis, with a short TTL, holds what everyone shares [3].',
        },
      },
      bug: {
        findings: ['Most undefined errors come from data arriving after the first render.', 'git bisect finds the breaking commit in a handful of steps.', 'Without source maps, the production trace points at the wrong line.'],
        answer: {
          brief: 'Likely data arriving after the render [1]. Bisect to the commit [2]. Turn on source maps first [3].',
          warm: 'We will find it! It is usually data arriving after the first render [1]. If not, git bisect walks you to the guilty commit in a few steps [2], and source maps make the trace point at the right line [3].',
          careful: 'Check three things in order. Is the value read before its data arrives? That is the usual cause [1]. If the trace is unclear, enable source maps so it points at your code [3]. Then run git bisect between the last good and first bad commit [2].',
          dreamy: 'Bugs like this usually hide in timing: the data drifts in after the first render [1]. Follow the trail back with git bisect [2], and let source maps light the way [3].',
        },
      },
      tests: {
        findings: ['Shared state between tests is the top cause of flakiness.', 'Fake timers remove most time-based failures.', 'CI runs tests in parallel, so order-dependent tests break there first.'],
        answer: {
          brief: 'Shared state [1]. Fake the timers [2]. Run in random order locally, as CI does [3].',
          warm: 'Flaky tests, we have all been there! The usual culprit is shared state between tests [1]. Swap real timers for fake ones [2], and shuffle the test order locally so you see what CI sees [3].',
          careful: 'Look at three causes, most likely first. Shared state between tests [1]. Real timers, which fake timers replace [2]. Order dependence, which CI exposes because it runs in parallel [3]. Reproduce locally with a random order before changing anything.',
          dreamy: 'Flaky tests are weather, and the clouds are usually shared state [1]. Calm the clock with fake timers [2], and shuffle the order to see the storm CI sees [3].',
        },
      },
      other: {
        findings: ['Most guides start with the smallest version that proves the idea.', 'Measuring before optimising comes up again and again.', 'The common pitfall: polishing before anyone has used it.'],
        answer: {
          brief: 'Smallest version first [1]. Measure [2]. Polish last [3].',
          warm: 'The sources agree with my gut! Ship the smallest version that proves it [1], measure what people actually do [2], and save the polish for after someone has used it [3].',
          careful: 'Three steps the sources agree on. Build the smallest version that proves the idea [1]. Measure before optimising anything [2]. Polish only once real use shows where it matters [3].',
          dreamy: 'Start small, like a single cloud [1]. Watch where it drifts and measure it [2], and let the polish come once someone has walked through it [3].',
        },
      },
    },
    report: { brief: '', warm: 'Found something nice!', careful: 'Checked it twice.', dreamy: 'Mm, drifted onto this.' },
    kickoff: {
      brief: 'Splitting it three ways.',
      warm: 'Let me grab some friends for this one!',
      careful: 'I will split the research three ways and compare.',
      dreamy: 'Let us drift off in three directions and meet back here.',
    },
    comparing: 'Comparing notes',
    bestPractices: 'best practices',
    pitfalls: 'common pitfalls',
  },
  fr: {
    topics: {
      cache: {
        findings: ['Le cache HTTP d’abord : les en-têtes Cache-Control font l’essentiel du travail gratuitement.', 'stale-while-revalidate sert l’ancienne copie pendant le rafraîchissement en arrière-plan.', 'Pour les données partagées, Redis avec un TTL court bat une invalidation astucieuse.'],
        answer: {
          brief: "Cache-Control d'abord [1]. Ajoute stale-while-revalidate [2]. Redis avec un TTL court pour les données partagées [3]. Oublie l'invalidation astucieuse.",
          warm: "Bonne nouvelle : l'essentiel est gratuit ! Commence par les en-têtes Cache-Control [1], ajoute stale-while-revalidate pour que personne n'attende un rafraîchissement [2], et garde une couche Redis avec un TTL court pour les données partagées [3]. L'invalidation astucieuse peut attendre.",
          careful: "Trois couches, dans l'ordre. D'abord, des en-têtes Cache-Control corrects sur chaque réponse [1]. Ensuite, stale-while-revalidate, pour servir une copie périmée pendant le rafraîchissement [2]. Enfin, Redis avec un TTL court pour les données partagées entre utilisateurs [3]. Mesure le taux de hit avant d'ajouter de la logique d'invalidation [4].",
          dreamy: "Vois ça comme des couches de brume. Cache-Control est la première, la plus douce [1] ; stale-while-revalidate laisse l'ancienne vue s'attarder pendant que la nouvelle arrive [2] ; et Redis, avec un TTL court, garde ce que tout le monde partage [3].",
        },
      },
      bug: {
        findings: ['La plupart des erreurs undefined viennent de données qui arrivent après le premier rendu.', 'git bisect trouve le commit fautif en une poignée d’étapes.', 'Sans source maps, la trace de prod pointe sur la mauvaise ligne.'],
        answer: {
          brief: "Sûrement des données qui arrivent après le rendu [1]. Bisect jusqu'au commit [2]. Active d'abord les source maps [3].",
          warm: "On va le trouver ! C'est souvent une donnée qui arrive après le premier rendu [1]. Sinon, git bisect te mène au commit coupable en quelques étapes [2], et les source maps font pointer la trace sur la bonne ligne [3].",
          careful: "Vérifie trois choses dans l'ordre. La valeur est-elle lue avant que ses données arrivent ? C'est la cause habituelle [1]. Si la trace est floue, active les source maps pour qu'elle pointe sur ton code [3]. Puis lance git bisect entre le dernier bon commit et le premier mauvais [2].",
          dreamy: "Les bugs comme celui-ci se cachent souvent dans le timing : la donnée arrive en flottant après le premier rendu [1]. Remonte la piste avec git bisect [2], et laisse les source maps éclairer le chemin [3].",
        },
      },
      tests: {
        findings: ['Un état partagé entre tests est la première cause d’instabilité.', 'Les fake timers suppriment la plupart des échecs liés au temps.', 'La CI lance les tests en parallèle : les tests dépendants de l’ordre y cassent en premier.'],
        answer: {
          brief: "État partagé [1]. Simule les timers [2]. Lance-les en ordre aléatoire en local, comme la CI [3].",
          warm: "Les tests instables, on est tous passés par là ! Le coupable habituel, c'est un état partagé entre tests [1]. Remplace les vrais timers par des faux [2], et mélange l'ordre des tests en local pour voir ce que voit la CI [3].",
          careful: "Regarde trois causes, de la plus probable à la moins probable. Un état partagé entre tests [1]. De vrais timers, que les fake timers remplacent [2]. Une dépendance à l'ordre, que la CI révèle parce qu'elle tourne en parallèle [3]. Reproduis en local avec un ordre aléatoire avant de changer quoi que ce soit.",
          dreamy: "Les tests instables, c'est la météo, et les nuages sont souvent un état partagé [1]. Calme l'horloge avec des fake timers [2], et mélange l'ordre pour voir l'orage que voit la CI [3].",
        },
      },
      other: {
        findings: ['La plupart des guides commencent par la plus petite version qui prouve l’idée.', 'Mesurer avant d’optimiser revient sans cesse.', 'Le piège courant : peaufiner avant que quiconque l’ait utilisé.'],
        answer: {
          brief: "La plus petite version d'abord [1]. Mesure [2]. Peaufine en dernier [3].",
          warm: "Les sources confirment mon intuition ! Livre la plus petite version qui le prouve [1], mesure ce que les gens font vraiment [2], et garde le peaufinage pour quand quelqu'un l'aura utilisé [3].",
          careful: "Trois étapes sur lesquelles les sources s'accordent. Construis la plus petite version qui prouve l'idée [1]. Mesure avant d'optimiser quoi que ce soit [2]. Ne peaufine qu'une fois que l'usage réel montre où ça compte [3].",
          dreamy: "Commence petit, comme un seul nuage [1]. Regarde où il dérive et mesure-le [2], et laisse le peaufinage venir quand quelqu'un l'aura traversé [3].",
        },
      },
    },
    report: { brief: '', warm: 'Trouvé un truc chouette !', careful: 'Vérifié deux fois.', dreamy: 'Mm, je suis tombé là-dessus en flânant.' },
    kickoff: {
      brief: 'On se répartit en trois.',
      warm: 'Je rameute des copains pour celle-là !',
      careful: 'Je répartis la recherche en trois et je compare.',
      dreamy: 'Partons dans trois directions et retrouvons-nous ici.',
    },
    comparing: 'Comparaison des notes',
    bestPractices: 'bonnes pratiques',
    pitfalls: 'pièges courants',
  },
});

function topicOf(text: string): Topic {
  if (/\bcach/i.test(text)) return 'cache';
  const i = intentOf(text);
  return i === 'bug' || i === 'tests' ? i : 'other';
}
/** Huddle on: anything but small talk. Off: only questions that read as research. */
function wantsHuddle(text: string) {
  const i = intentOf(text);
  if (speaker.mode === 'off' || i === 'thanks' || i === 'hello' || i === 'who') return false;
  return speaker.huddle || speaker.mode === 'always' || /\b(best|compare|vs|versus|which|sources?|research|look up|cach\w*|meilleure?s?|comparer|compare|lequel|laquelle|recherche|cherche)\b/i.test(text);
}

/** The crew: for each voice the lead does not have, the first mascot with it, so the four lines never sound alike. */
function crewFor(lead: number) {
  const voices = (['warm', 'brief', 'careful', 'dreamy'] as Voice[]).filter((v) => v !== MASCOTS[lead].voice);
  return voices.map((v) => MASCOTS.findIndex((m, i) => i !== lead && m.voice === v)).slice(0, speaker.crewSize);
}

async function huddle(api: ChatScriptApi, text: string) {
  const lead = speakerNow();
  const crew = crewFor(lead);
  const topic = topicOf(text);
  const t = TOPICS[topic];
  const say = copyOf(HUDDLE_COPY);
  const told = say.topics[topic];
  const short = text.replace(/[?!.]+$/, '').toLowerCase().slice(0, 48);
  // Open questions search for what was asked; the known topics have their own queries.
  const queries = topic === 'other' ? [short, `${short} ${say.bestPractices}`, `${short} ${say.pitfalls}`] : t.queries;
  const a = api.assistant();
  const wait = (ms: number) => api.sleep(ms * tempo.scale);
  let data: HuddleData = { lead, crew, joined: [], items: [], sources: t.sources, started: Date.now(), done: false };
  const patch = a.custom('huddle', { ...data });
  let seq = 0;
  const set = (next: Partial<HuddleData>) => {
    data = { ...data, ...next };
    patch({ ...data });
  };
  const push = (item: HuddleItem) => set({ items: [...data.items, item] });
  const update = (id: string, p: Partial<HuddleItem>) => set({ items: data.items.map((it) => (it.id === id ? ({ ...it, ...p } as HuddleItem) : it)) });

  // Grok's opening: the dot matrix while the crew is called (~2s), then each mascot springs in, 220ms apart.
  await wait(2000);
  for (const c of [lead, ...crew]) {
    set({ joined: [...data.joined, c] });
    await wait(220);
  }
  push({ id: `h${seq++}`, kind: 'msg', who: lead, text: say.kickoff[MASCOTS[lead].voice] });
  for (const [i, c] of crew.entries()) {
    await wait(650);
    const id = `h${seq++}`;
    push({ id, kind: 'search', who: c, query: queries[i], results: 0, sites: [], pending: true });
    await wait(950);
    update(id, { pending: false, results: 9 + i * 7, sites: [t.sources[i].site, t.sources[(i + 3) % t.sources.length].site] });
    await wait(550);
    push({ id: `h${seq++}`, kind: 'visit', who: c, url: t.visits[i] });
    await wait(900);
    push({ id: `h${seq++}`, kind: 'msg', who: c, text: `${say.report[MASCOTS[c].voice]} ${told.findings[i]}`.trim() });
  }
  await wait(700);
  push({ id: `h${seq++}`, kind: 'status', text: say.comparing });
  await wait(1100);
  set({ done: true, seconds: Math.max(1, Math.round((Date.now() - data.started) / 1000)) });
  // The feed turns to dust and folds first, so the answer lands where it stood rather than under an empty gap.
  await wait(DUST_MS + 300);
  await a.stream(told.answer[MASCOTS[lead].voice], 26 / tempo.scale);
  a.done();
}

/* ---------- Pieces of the layout ---------- */

function Bubble({ mine, children }: { mine?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'w-fit max-w-[80%] rounded-2xl px-3.5 py-2 text-body-regular break-words whitespace-pre-wrap',
        // A reply mounts once with the streamed-block motion (BoardUI: opacity 0, blur 5px, y 4px, 420ms); its text then only grows.
        mine ? 'self-end rounded-ee-md bg-blue-600 text-white' : 'tpl-stream-in rounded-es-md bg-background-tertiary-default text-text-primary',
      )}
    >
      {children}
    </div>
  );
}

/** Each word of a streamed reply in its own span, keyed by position: words already shown keep their node and never
 *  replay, each new one clears from a blur as it lands (.tpl-word-in). */
function StreamWords({ text, onCite }: { text: string; /** Turns [n] into a source chip that opens source n. */ onCite?: (n: number) => void }) {
  const ui = copyOf(UI);
  const { wordBlur } = useContext(LookCtx);
  const blur = wordBlur ? 'tpl-word-in' : undefined;
  // A marker still arriving ("[" or "[2") stays hidden until its closing bracket lands.
  const clean = onCite ? text.replace(/\[\d?$/, '') : text;
  return (
    <>
      {clean.split(onCite ? /(\s+|\[\d\])/ : /(\s+)/).map((w, i) => {
        if (!w || /^\s+$/.test(w)) return w;
        const cite = onCite && /^\[(\d)\]$/.exec(w);
        if (cite)
          return (
            <button
              key={i}
              type="button"
              aria-label={ui.source(cite[1])}
              onClick={() => onCite(Number(cite[1]))}
              className={cn(blur, 'mx-px inline-grid h-4 min-w-4 cursor-pointer place-items-center rounded-full bg-background-primary-default px-1 align-[2px] text-[10px] leading-none font-semibold text-text-secondary tabular-nums outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring')}
            >
              {cite[1]}
            </button>
          );
        return (
          <span key={i} className={blur}>
            {w}
          </span>
        );
      })}
    </>
  );
}

/** Eases the bubble's height as a reply wraps onto a new line, instead of the bubble jumping a line at a time. */
function SmoothHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="overflow-hidden transition-[height] duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none" style={{ height: h }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

/* ---------- Huddle in the thread: who joined, a rolling feed, then a folded summary and the sources ---------- */

const huddleOf = (m?: Message) => (m?.parts.find((p) => p.kind === 'custom' && p.type === 'huddle') as Extract<Message['parts'][number], { kind: 'custom' }> | undefined)?.data as HuddleData | undefined;
type PanelTab = 'log' | 'sources';

function useElapsed(started: number, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);
  return Math.max(1, Math.floor((now - started) / 1000));
}

function SiteIcon({ site, size = 16 }: { site: string; size?: number }) {
  const [letter, color] = site.split(':');
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.55 }}>
      {letter}
    </span>
  );
}

function SiteStack({ sites, size = 16 }: { sites: string[]; size?: number }) {
  return (
    <span className="flex">
      {sites.map((s, i) => (
        <span key={i} className="grid place-items-center rounded-full ring-2 ring-background-secondary-default" style={{ marginInlineStart: i ? -size / 2.5 : 0 }}>
          <SiteIcon site={s} size={size} />
        </span>
      ))}
    </span>
  );
}

/** One line of the huddle: a search, a page read, a helper's report in its voice, or a status. `full` (the side
 *  panel) shows whole reports; the live feed clamps them to two lines. */
function HuddleRow({ item, full }: { item: HuddleItem; full?: boolean }) {
  const ui = copyOf(UI);
  if (item.kind === 'status') return <p className="py-0.5 ps-6 text-body-2-regular text-text-tertiary">{item.text}…</p>;
  const m = MASCOTS[item.who];
  const head = (label: ReactNode, pulse?: boolean) => <span className={cn('block truncate text-caption-1-regular text-text-tertiary', pulse && 'animate-pulse motion-reduce:animate-none')}>{label}</span>;
  return (
    <div className="flex gap-2 py-0.5">
      <Mascot index={item.who} size={16} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {item.kind === 'search' ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              {head(<>{m.name} {item.pending ? ui.searching : ui.searched}</>, item.pending)}
              <span className="block truncate font-mono text-caption-1-regular text-text-primary">{item.query}</span>
            </div>
            <span className={cn('flex shrink-0 items-center gap-1.5 text-caption-1-regular text-text-tertiary tabular-nums transition-opacity duration-150', item.pending && 'opacity-0')}>
              <span className="max-sm:hidden">{ui.results(item.results)}</span>
              <SiteStack sites={item.sites} size={14} />
            </span>
          </div>
        ) : item.kind === 'visit' ? (
          <>
            {head(<>{m.name} {ui.read}</>)}
            <span className="block truncate font-mono text-caption-1-regular text-text-primary">{item.url}</span>
          </>
        ) : (
          <>
            {/* In the panel the group heading already names the mascot. */}
            {!full && head(<span className="font-medium text-text-secondary">{m.name}</span>)}
            <p className={cn('mt-0.5 w-fit rounded-xl rounded-ss-sm bg-background-tertiary-default px-2.5 py-1 text-body-2-regular text-text-primary', !full && 'line-clamp-2')}>{item.text}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** How long a row takes to turn to dust, and to give its space back (the rows below rise meanwhile). */
const DUST_MS = 1400;
const FOLD_MS = 650;

/**
 * A row turning to dust, as in a snap: an SVG filter scatters its pixels on fine noise (feDisplacementMap) while
 * the same noise, thresholded higher and higher, eats them grain by grain (feComponentTransfer as an alpha mask).
 * A soft mask sweeps from left to right so it goes from one side, and the whole row drifts up and away.
 * One filter per row, so rows leaving together each keep their own grain. Reduced motion: a short fade.
 */
function DustOut({ children, onDone }: { children: ReactNode; onDone: () => void }) {
  const id = `dust${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // Dust turned off in the config plays the same short fade as reduced motion.
  const reduce = useReducedMotion() || !useContext(LookCtx).dust;
  const el = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const alpha = useRef<SVGFEFuncAElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const [seed] = useState(() => Math.floor(Math.random() * 1000));

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reduce) {
      const a = node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      a.onfinish = () => done.current();
      return () => a.cancel();
    }
    const start = performance.now();
    const total = DUST_MS * tempo.scale;
    let raf = 0;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      // Grains go steadily (smoothstep), the drift speeds up as they thin out.
      const eat = t * t * (3 - 2 * t);
      disp.current?.setAttribute('scale', String(6 + 70 * t));
      alpha.current?.setAttribute('intercept', String(1 - 9 * eat * 1.05));
      const sweep = -20 + 150 * eat;
      node.style.maskImage = node.style.webkitMaskImage = `linear-gradient(100deg, transparent ${sweep - 35}%, #000 ${sweep + 5}%)`;
      node.style.transform = `translate(${t * t * 36}px, ${-t * t * 18}px)`;
      if (t < 1) raf = requestAnimationFrame(frame);
      else done.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div ref={el} style={reduce ? undefined : { filter: `url(#${id})` }}>
      {!reduce && (
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id={id} x="-30%" y="-150%" width="170%" height="400%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed={seed} result="noise" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" result="moved" />
            <feComponentTransfer in="noise" result="grain">
              <feFuncA ref={alpha} type="linear" slope="9" intercept="1" />
            </feComponentTransfer>
            <feComposite in="moved" in2="grain" operator="in" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}

/** Three rows at a time: a new one blurs in below; the oldest turns to dust as the rows slide up past it, so the
 *  feed moves on at once. `ended` (the huddle has its answer): every row left turns to dust as the feed folds up. */
function HuddleFeed({ items, ended }: { items: HuddleItem[]; ended?: boolean }) {
  const visible = ended ? [] : items.slice(-3);
  const [leaving, setLeaving] = useState<HuddleItem[]>([]);
  const prev = useRef<HuddleItem[]>([]);
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const ids = new Set(visible.map((v) => v.id));
    const gone = prev.current.filter((p) => !ids.has(p.id));
    prev.current = visible;
    if (gone.length) setLeaving((l) => [...l, ...gone]);
  });

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The feed's box reaches 28px above its first row (into the gap under the header): dust rising out of the feed
  // stays on show there and thins out over that band instead of being cut at the row's edge. It clips vertically
  // only, so dust still drifts sideways.
  const edge = leaving.length ? 'linear-gradient(to bottom, transparent, #000 28px)' : undefined;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative -mt-7 pt-7 [overflow-y:clip] transition-[height] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ height: height === undefined ? undefined : height + 28, transitionDuration: `${FOLD_MS * tempo.scale}ms`, maskImage: edge, WebkitMaskImage: edge }}
    >
      <div ref={inner} className="flex flex-col">
        {leaving.map((it) => (
          <FoldAway key={`out-${it.id}`} onGone={() => setLeaving((l) => l.filter((x) => x.id !== it.id))}>
            <HuddleRow item={it} />
          </FoldAway>
        ))}
        {visible.map((it) => (
          <div key={it.id} className="tpl-feed-in pb-1" style={{ animationDuration: `${0.42 * tempo.scale}s` }}>
            <HuddleRow item={it} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gives back its row's space at once (the content rides up with the rows below, anchored to the slot's bottom)
 *  while the row turns to dust; reports it gone once the last grain is. */
function FoldAway({ children, onGone }: { children: ReactNode; onGone: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || reduce) return;
    const a = el.animate([{ height: `${el.offsetHeight}px` }, { height: '0px' }], { duration: FOLD_MS * tempo.scale, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'forwards' });
    return () => a.cancel();
  }, [reduce]);
  return (
    <div ref={box} className="pointer-events-none flex flex-col justify-end">
      <div className="shrink-0 pb-1">
        <DustOut onDone={onGone}>{children}</DustOut>
      </div>
    </div>
  );
}

/** Grok's 3x3 dot loader: a wave of opacity runs across the grid while the crew is being called. */
function DotMatrix() {
  const xs = [5.6, 12, 18.4];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current">
      {xs.flatMap((y, r) => xs.map((x, c) => <circle key={`${r}${c}`} cx={x} cy={y} r={1.6} className="tpl-dot" style={{ animationDelay: `${(r + c) * 150}ms` }} />))}
    </svg>
  );
}

const SEAT = 14;

/** Live: the dot matrix until the first mascot joins, then the mascots overlapping, each springing in where it
 *  lands while the row widens to fit (300ms). Done: the whole team, still. */
function HuddleStack({ data, running, size = 22 }: { data: HuddleData; running: boolean; size?: number }) {
  if (!running)
    return (
      <span className="flex items-center">
        {[data.lead, ...data.crew].map((i, n) => (
          <span key={i} className="grid place-items-center rounded-full bg-background-secondary-default" style={{ width: size + 4, height: size + 4, marginInlineStart: n ? -size / 3 : 0, zIndex: 10 - n }}>
            <Mascot index={i} size={size} />
          </span>
        ))}
      </span>
    );
  const joined = data.joined.length > 0;
  return (
    <span className="relative flex items-center transition-[width] duration-300" style={{ width: size + Math.max(0, data.joined.length - 1) * SEAT, height: size }}>
      <span className={cn('absolute inset-y-0 -start-1 flex items-center text-text-primary transition-opacity duration-150', joined && 'opacity-0')}>
        <DotMatrix />
      </span>
      <span className={cn('absolute inset-0 transition-opacity duration-500 ease-out', joined ? 'opacity-100' : 'opacity-0')}>
        {data.joined.map((i, n) => (
          <span key={i} className="tpl-spring absolute top-0 grid place-items-center rounded-full bg-background-secondary-default" style={{ insetInlineStart: n * SEAT - 2, top: -2, width: size + 4, height: size + 4, zIndex: 10 - n }}>
            <Mascot index={i} size={size} mood="typing" />
          </span>
        ))}
      </span>
    </span>
  );
}

/** Live: "Flower + 3 are looking it up · 4s". Done: "Huddled for 6s · 4 mascots", which opens the log. Cut short by
 *  Stop: "Huddle stopped after 4s", still openable if anything was found. */
function HuddleHeader({ data, live, onOpen }: { data: HuddleData; live: boolean; onOpen: () => void }) {
  const ui = copyOf(UI);
  const running = live && !data.done;
  const secs = useElapsed(data.started, running);
  // One wording for the whole run, as grok's "Les agents réfléchissent · Ns".
  const label = running
    ? ui.thinking
    : data.done
      ? ui.huddled(data.seconds ?? secs, data.crew.length + 1)
      : ui.huddleStopped(secs);
  const openable = !running && data.items.length > 0;
  const firstLabel = useRef(label);
  return (
    <button
      type="button"
      disabled={!openable}
      onClick={onOpen}
      className={cn('group/hh flex h-8 w-fit items-center gap-2 rounded-full pe-2.5 text-body-2-medium text-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring', openable && 'cursor-pointer ps-1 transition-colors hover:bg-background-tertiary-default hover:text-text-primary')}
    >
      <HuddleStack data={data} running={running} />
      {/* Keyed by its wording: each new step clears in from a blur instead of the text swapping in place. Not on
          mount, so the waiting turn handing over to the real one (same words) does not flash. */}
      <span key={label.replace(/\d+s/, '')} className={label === firstLabel.current ? undefined : 'tpl-word-in'}>
        {label}
      </span>
      {running && <span className="text-text-tertiary tabular-nums">· {secs}s</span>}
      {openable && <ChevronRight className="size-4 text-foreground-icon-tertiary transition-transform group-hover/hh:translate-x-0.5" />}
    </button>
  );
}

function SourcesPill({ sources, onOpen }: { sources: Source[]; onOpen: () => void }) {
  const ui = copyOf(UI);
  return (
    <button type="button" onClick={onOpen} className="tpl-stream-in flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-border-button-default ps-1.5 pe-2.5 text-caption-1-medium text-text-secondary outline-none transition-colors hover:bg-background-tertiary-default hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring">
      <SiteStack sites={sources.slice(0, 3).map((s) => s.site)} size={16} />
      {ui.sources(sources.length)}
    </button>
  );
}

/** The huddle's side panel: the log grouped by mascot (the lead first), or the numbered sources the answer cites. */
function HuddlePanel({ data, tab, onTab, onClose }: { data: HuddleData; tab: PanelTab; onTab: (t: PanelTab) => void; onClose: () => void }) {
  const ui = copyOf(UI);
  const team = [data.lead, ...data.crew];
  const { sources } = useContext(LookCtx);
  const tabs: [PanelTab, string][] = [['log', ui.huddleTab], ...(sources ? [['sources', ui.sourcesTab(data.sources.length)] as [PanelTab, string]] : [])];
  if (!sources) tab = 'log';
  return (
    <Surface className="h-full w-[340px] shrink-0">
      <div className="flex h-12 shrink-0 items-center gap-1 ps-3 pe-2">
        <div role="tablist" aria-label={ui.huddleTab} className="flex gap-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => onTab(id)}
              className={cn('h-8 cursor-pointer rounded-full px-3 text-body-2-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus-ring', tab === id ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary')}
            >
              {label}
            </button>
          ))}
        </div>
        <IconButton label={ui.closePanel} onClick={onClose} className="ms-auto">
          <X />
        </IconButton>
      </div>
      <div role="tabpanel" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {tab === 'log' ? (
          <div className="flex flex-col gap-5 pt-1">
            {team.map((who) => {
              const rows = data.items.filter((it) => (it.kind === 'status' ? who === data.lead : it.who === who));
              if (!rows.length) return null;
              const m = MASCOTS[who];
              return (
                <section key={who} className="flex flex-col gap-1.5">
                  <h3 className="flex items-center gap-2 text-body-2-medium text-text-primary">
                    <Mascot index={who} size={22} />
                    {m.name}
                    <span className="text-caption-1-regular text-text-tertiary">{who === data.lead ? ui.leads : m.trait}</span>
                  </h3>
                  {rows.map((it) => (
                    <HuddleRow key={it.id} item={it} full />
                  ))}
                </section>
              );
            })}
          </div>
        ) : (
          <ol className="flex flex-col gap-1 pt-1">
            {data.sources.map((s, i) => (
              <li key={s.domain + i} className="flex items-center gap-2.5 rounded-2lg px-2 py-2 transition-colors hover:bg-background-secondary-hover">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-background-primary-default text-[10px] font-semibold text-text-secondary tabular-nums">{i + 1}</span>
                <SiteIcon site={s.site} size={20} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body-2-medium text-text-primary">{s.title}</span>
                  <span className="truncate text-caption-1-regular text-text-tertiary">{s.domain}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Surface>
  );
}

/**
 * An assistant turn. While it types, the typing bubble is the only mascot on show; once the reply lands its
 * mascot takes the avatar spot with a hop (happy eyes after a thanks). A stopped turn says so and offers a retry.
 */
function AssistantTurn({
  message,
  mascot,
  typing,
  stopped,
  happy,
  onRetry,
  onPanel,
  huddleSoon,
}: {
  message?: Message;
  mascot: number;
  typing: boolean;
  stopped?: boolean;
  happy?: boolean;
  onRetry?: () => void;
  /** Opens the huddle panel on a tab (a cited source opens Sources). */
  onPanel?: (tab: PanelTab) => void;
  /** This turn will huddle but its data has not arrived yet: show the huddle's first beat, not the typing bubble. */
  huddleSoon?: boolean;
}) {
  const ui = copyOf(UI);
  const { sources } = useContext(LookCtx);
  const raw = message ? textOf(message) : '';
  // Sources off: the answer reads without its [n] markers.
  const text = sources ? raw : raw.replace(/ ?\[\d\]?/g, '');
  const landed = !typing && !stopped && !!text;
  const m = MASCOTS[mascot];
  const [opening] = useState<HuddleData>(() => ({ lead: mascot, crew: crewFor(mascot), joined: [], items: [], sources: [], started: Date.now(), done: false }));
  const h = huddleOf(message) ?? (huddleSoon && typing ? opening : undefined);
  // A stopped turn reads as grok's: no huddle left on show, the italic notice (or the partial reply), then the
  // action row with "Interrupted".
  return (
    <div className="group/message flex flex-col gap-1">
      {h && !stopped && (
        <div className="flex flex-col gap-1.5 ps-9 pb-1">
          <HuddleHeader data={h} live={typing} onOpen={() => onPanel?.('log')} />
          {typing && <HuddleFeed items={h.items} ended={h.done} />}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="size-7 shrink-0">{!typing || text ? (h && !text && !stopped ? null : <Mascot index={mascot} size={28} mood={stopped ? 'stopped' : happy && landed ? 'happy' : 'idle'} hop={landed ? 1 : 0} />) : null}</div>
        {stopped && !text ? (
          <p className="tpl-stream-in py-1 text-body-regular text-text-secondary italic">{ui.interruptedNotice}</p>
        ) : typing && !text && h ? null : typing && !text ? (
          <div className="rounded-2xl rounded-es-md bg-background-tertiary-default px-2.5 py-1.5">
            <Mascot index={mascot} size={30} mood="typing" />
          </div>
        ) : text ? (
          <Bubble>
            <SmoothHeight>
              <span className="sr-only">{m.name}: </span>
              <StreamWords text={text} onCite={h && sources ? () => onPanel?.('sources') : undefined} />
            </SmoothHeight>
          </Bubble>
        ) : null}
      </div>
      {/* Who said it, and its style tag: off the reply itself, so the tag never reads as part of the answer. */}
      {landed && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 ps-9">
          <p aria-hidden="true" className="tpl-stream-in text-caption-1-regular text-text-primary/70">
            <span className="font-medium text-text-primary">{m.name}</span> · {m.signoff}
          </p>
          {h && sources && <SourcesPill sources={h.sources} onOpen={() => onPanel?.('sources')} />}
        </div>
      )}
      {stopped && (
        <div className="flex items-center gap-1.5 ps-9">
          {/* Regenerate is the retry: it answers the same message again. */}
          <ActionBar message={message ?? { id: 'stopped', role: 'assistant', parts: [], done: true }} isLast={!!onRetry} onRegenerate={onRetry} />
          <span className="pt-1 text-caption-1-regular text-text-tertiary">{ui.interrupted}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Who answers next: the twelve mascots as a radio group above the composer (arrow keys move and pick). The checked
 * one is always the next to answer (your pick, or whose turn it is), widened to show its name and character; while
 * another mascot is still writing (`writing`), it reads "Next: Name" so the header and the strip never seem to
 * disagree. "Take turns" hands each reply to the next mascot in order.
 */
/** A quiet on/off pill under the strip's row: a pressed outline, not a filled pill that outshouts Send. Its name is
 *  its visible text (Label in Name), so "click Take turns" works by voice; below sm only the icon shows. */
function StripToggle({ on, label, title, icon, onClick }: { on: boolean; label: string; title: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-body-2-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus-ring [&_svg]:size-4',
        on ? 'border-border-button-default bg-background-primary-default text-text-primary shadow-xs' : 'border-transparent text-text-primary/70 hover:bg-background-tertiary-default hover:text-text-primary',
      )}
    >
      {icon}
      <span className="max-sm:hidden">{label}</span>
    </button>
  );
}

function MascotStrip({ next, writing, shuffle, huddle, huddleAvailable, onPick, onShuffle, onHuddle }: { next: number; writing: number | null; shuffle: boolean; huddle: boolean; /** The toggle only exists in "research" mode (off never huddles, always always does). */ huddleAvailable: boolean; onPick: (i: number) => void; onShuffle: () => void; onHuddle: () => void }) {
  const ui = copyOf(UI);
  const row = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Keep the next mascot in view inside the strip (scrolls the strip only, never the page).
  useEffect(() => {
    const r = row.current;
    const el = r?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    if (!r || !el) return;
    const left = el.offsetLeft - r.clientWidth / 2 + el.offsetWidth / 2;
    r.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
  }, [next, reduce]);
  // The edges fade where more mascots hide, so a narrow strip reads as scrollable.
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const r = row.current;
    if (!r) return;
    const update = () => setEdges({ start: r.scrollLeft > 2, end: r.scrollLeft < r.scrollWidth - r.clientWidth - 2 });
    update();
    r.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(r);
    return () => {
      r.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);
  const mask =
    edges.start || edges.end ? `linear-gradient(to right, ${edges.start ? 'transparent, #000 24px' : '#000 0'}, ${edges.end ? '#000 calc(100% - 24px), transparent' : '#000 100%'})` : undefined;

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? MASCOTS.length - 1 : step ? (i + step + MASCOTS.length) % MASCOTS.length : -1;
    if (n < 0) return;
    e.preventDefault();
    onPick(n);
    row.current?.querySelector<HTMLElement>(`[data-index="${n}"]`)?.focus();
  };

  return (
    <div className="mb-2 flex items-center gap-1.5">
      <div
        ref={row}
        role="radiogroup"
        aria-label={ui.whoNext}
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto p-1"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {MASCOTS.map((m, i) => {
          const on = i === next;
          return (
            <button
              key={m.name}
              type="button"
              role="radio"
              data-index={i}
              aria-checked={on}
              aria-label={`${m.name}, ${m.trait}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onPick(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full outline-none transition-[background-color,padding] duration-200 focus-visible:ring-2 focus-visible:ring-border-focus-ring motion-reduce:transition-none',
                on ? 'bg-background-primary-default ps-1.5 pe-3 shadow-xs' : 'px-1.5 hover:bg-background-tertiary-default',
              )}
            >
              <Mascot index={i} size={on ? 26 : 22} hop={on ? i + 1 : 0} />
              {on &&
                (writing !== null && writing !== i ? (
                  <span className="text-body-2-medium whitespace-nowrap text-text-primary">
                    <span className="text-text-primary/70">{ui.next}</span> {m.name}
                  </span>
                ) : (
                  <span className="text-body-2-medium whitespace-nowrap text-text-primary">
                    {m.name} <span className="text-text-primary/70">· {m.trait}</span>
                  </span>
                ))}
            </button>
          );
        })}
      </div>
      {huddleAvailable && <StripToggle on={huddle} label={ui.huddle} title={ui.huddleTitle} icon={<Users />} onClick={onHuddle} />}
      <StripToggle on={shuffle} label={ui.takeTurns} title={ui.takeTurnsTitle} icon={<Repeat />} onClick={onShuffle} />
    </div>
  );
}

/* ---------- Sidebar: the cast and the chats they hosted (grok's layout, worded for mascots) ---------- */

/** A past chat: its first question, and the mascot that answered it (reopening replays that exchange). */
interface ChatRec {
  id: string;
  title: string;
  q: string;
  mascot: number;
  pinned?: boolean;
}


const VOICES: Voice[] = ['warm', 'brief', 'careful', 'dreamy'];

/** The intro's relay cast starts pinned: the three voices already on show. */
const PINNED = INTRO_CAST;

const excerpt = (t: string) => (t.length > 40 ? `${t.slice(0, 39).trimEnd()}…` : t);

const SIDE_ROW = 'group/row relative flex h-9 w-full items-center gap-2 rounded-2lg ps-1.5 pe-1 text-start transition-colors hover:bg-background-secondary-hover has-[[data-state=open]]:bg-background-secondary-hover';
const ROW_ON = 'bg-background-secondary-hover';
const GHOST = 'grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-secondary outline-none transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring dark:hover:bg-background-primary-hover [&_svg]:size-4';

/** Folds a section: the rows keep their height in a 0fr / 1fr grid row, and are inert while hidden. */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div inert={!open} className={cn('grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** A section header: the label folds it; the chevron shows on hover (or focus) and turns when folded. */
function SectionHeader({ label, open, onToggle, small, action }: { label: string; open: boolean; onToggle: () => void; small?: boolean; action?: ReactNode }) {
  return (
    <div className={cn('flex items-center justify-between gap-1 px-2', small ? 'h-7 pt-1' : 'h-8 pt-3')}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn('group/sh flex items-center gap-1 rounded-md text-text-tertiary outline-none select-none focus-visible:ring-2 focus-visible:ring-border-focus-ring', small ? 'text-caption-1-regular' : 'text-body-2-medium')}
      >
        {label}
        <ChevronDown className={cn('size-3.5 opacity-0 transition-[opacity,rotate] duration-200 group-hover/section:opacity-100 group-focus-visible/sh:opacity-100', !open && '-rotate-90')} />
      </button>
      {action}
    </div>
  );
}

/** The row's quiet end (a count) that crossfades to its menu on hover or focus, and stays while the menu is open. */
function RowEnd({ hint, menu, label }: { hint?: ReactNode; menu: ReactNode; label: string }) {
  return (
    <span className="relative z-10 grid size-7 shrink-0 place-items-center">
      {hint !== undefined && <span className="text-caption-1-regular text-text-tertiary tabular-nums transition-opacity group-focus-within/row:opacity-0 group-hover/row:opacity-0 group-has-[[data-state=open]]/row:opacity-0">{hint}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={label} className={cn(GHOST, 'absolute inset-0 opacity-0 group-focus-within/row:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100 max-md:opacity-100')}>
            <Ellipsis />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

/** A mascot row: picks who answers next (same as the strip). It types along in the sidebar while it writes. */
function MascotRow({ index, next, writing, huddling, replies, pinned, onPick, onPin, onHide }: { index: number; next: boolean; writing: boolean; huddling: boolean; replies: number; pinned: boolean; onPick: () => void; onPin: () => void; onHide: () => void }) {
  const ui = copyOf(UI);
  const m = MASCOTS[index];
  return (
    <li className={cn(SIDE_ROW, next && ROW_ON)}>
      <Mascot index={index} size={22} mood={writing || huddling ? 'typing' : 'idle'} hop={next ? index + 1 : 0} />
      <button type="button" aria-pressed={next} onClick={onPick} className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate rounded-md text-start outline-none after:absolute after:inset-0 focus-visible:after:rounded-2lg focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring">
        <span className={cn('truncate text-body-2-medium', next ? 'text-text-primary' : 'text-text-secondary')}>{m.name}</span>
        <span className="truncate text-caption-1-regular text-text-tertiary">{huddling ? ui.lookingUp : writing ? ui.typing : next ? ui.answersNext : m.trait}</span>
      </button>
      <RowEnd
        label={ui.optionsFor(m.name)}
        hint={replies > 0 ? replies : undefined}
        menu={
          <>
            <DropdownMenuItem onSelect={onPick}>
              <MessageCircle /> {ui.answerNext}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onPin}>{pinned ? <><PinOff /> {ui.unpin}</> : <><Pin /> {ui.pin}</>}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onHide}>
              <EyeOff /> {ui.hide}
            </DropdownMenuItem>
          </>
        }
      />
    </li>
  );
}

/** A chat row: the host mascot, the title, and Pin / Rename / Delete (renaming in place: Enter keeps, Escape cancels). */
function ChatRow({ rec, active, onOpen, onPatch }: { rec: ChatRec; active: boolean; onOpen: () => void; onPatch: (p: Partial<ChatRec> | null) => void }) {
  const ui = copyOf(UI);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(rec.title);
  const commit = () => {
    const t = val.trim();
    if (t && t !== rec.title) onPatch({ title: t });
    setEditing(false);
  };
  if (editing)
    return (
      <li>
        <input
          autoFocus
          value={val}
          aria-label={ui.renameChat}
          onChange={(e) => setVal(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              e.stopPropagation();
              setEditing(false);
            }
          }}
          className="h-9 w-full rounded-2lg border border-border-focus-ring bg-background-primary-default px-2 text-body-2-regular text-text-primary outline-none"
        />
      </li>
    );
  return (
    <li className={cn(SIDE_ROW, active && ROW_ON)}>
      <Mascot index={rec.mascot} size={18} className="ms-0.5" />
      <a
        href="#"
        aria-current={active ? 'page' : undefined}
        onClick={(e) => {
          e.preventDefault();
          onOpen();
        }}
        className={cn('min-w-0 flex-1 truncate rounded-md text-body-2-regular outline-none after:absolute after:inset-0 focus-visible:after:rounded-2lg focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring', active ? 'text-text-primary' : 'text-text-secondary')}
      >
        {rec.title}
      </a>
      {rec.id !== 'live' && (
        <RowEnd
          label={ui.optionsFor(rec.title)}
          menu={
            <>
              <DropdownMenuItem onSelect={() => onPatch({ pinned: !rec.pinned })}>{rec.pinned ? <><PinOff /> {ui.unpin}</> : <><Pin /> {ui.pin}</>}</DropdownMenuItem>
              {/* The menu hands focus back to its trigger as it closes: the field mounts just after, so that does not blur it. */}
              <DropdownMenuItem onSelect={() => setTimeout(() => (setVal(rec.title), setEditing(true)), 40)}>
                <Pencil /> {ui.rename}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onPatch(null)} className="text-text-error-primary [&_svg]:text-current">
                <Trash2 /> {ui.remove}
              </DropdownMenuItem>
            </>
          }
        />
      )}
    </li>
  );
}

interface SidebarProps {
  next: number;
  writing: number | null;
  typing: boolean;
  /** The mascots in a huddle still running: they move in the sidebar too. */
  huddlers: number[];
  shuffle: boolean;
  huddle: boolean;
  huddleAvailable: boolean;
  replies: Record<number, number>;
  pinned: number[];
  hidden: number[];
  chats: ChatRec[];
  active: string;
  onPick: (i: number) => void;
  onShuffle: () => void;
  onHuddle: () => void;
  onPin: (i: number) => void;
  onHide: (i: number | null) => void;
  onNew: () => void;
  onOpenChat: (rec: ChatRec) => void;
  onPatchChat: (id: string, p: Partial<ChatRec> | null) => void;
}

function MascotSidebar({ onClose, onFold, ...p }: SidebarProps & { onClose?: () => void; onFold?: () => void }) {
  const ui = copyOf(UI);
  const [open, setOpen] = useState({ pinned: true, cast: true, chats: true });
  const [voiceOpen, setVoiceOpen] = useState<Record<Voice, boolean>>({ warm: true, brief: true, careful: true, dreamy: true });
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const flip = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const query = q.trim().toLowerCase();
  const hit = (i: number) => {
    const m = MASCOTS[i];
    return !query || `${m.name} ${m.trait} ${m.voice}`.toLowerCase().includes(query);
  };
  const visible = MASCOTS.map((_, i) => i).filter((i) => !p.hidden.includes(i) && hit(i));
  const pinnedRows = p.pinned.filter((i) => visible.includes(i));
  const groups = VOICES.map((voice) => ({ voice, label: ui.voices[voice], rows: visible.filter((i) => MASCOTS[i].voice === voice && !p.pinned.includes(i)) })).filter((g) => g.rows.length > 0);
  const chats = p.chats.filter((c) => !query || c.title.toLowerCase().includes(query));
  const chatPinned = chats.filter((c) => c.pinned);
  const chatRest = chats.filter((c) => !c.pinned);

  const row = (i: number) => (
    <MascotRow
      key={i}
      index={i}
      next={i === p.next}
      writing={p.typing && p.writing === i}
      huddling={p.huddlers.includes(i)}
      replies={p.replies[i] ?? 0}
      pinned={p.pinned.includes(i)}
      onPick={() => p.onPick(i)}
      onPin={() => p.onPin(i)}
      onHide={() => p.onHide(i)}
    />
  );
  const chatRow = (c: ChatRec) => <ChatRow key={c.id} rec={c} active={p.active === c.id} onOpen={() => p.onOpenChat(c)} onPatch={(patch) => p.onPatchChat(c.id, patch)} />;
  const label = (text: string) => <p className="px-2 pt-1.5 pb-0.5 text-caption-1-regular text-text-tertiary select-none">{text}</p>;

  return (
    <Surface className="h-full w-[260px] shrink-0 py-2">
      <div className="flex h-10 shrink-0 items-center gap-1 ps-2.5 pe-2">
        <Mascot index={0} size={22} label={ui.mascots} />
        <span className="ms-1 text-headline-semibold text-text-primary">{ui.mascots}</span>
        <span className="ms-auto flex items-center">
          <IconButton
            label={ui.search}
            active={searching}
            onClick={() => {
              setSearching((s) => !s);
              setQ('');
            }}
          >
            <Search />
          </IconButton>
          {onFold && (
            <IconButton label={ui.foldSidebar} onClick={onFold}>
              <PanelLeft />
            </IconButton>
          )}
          {onClose && (
            <IconButton label={ui.closeSidebar} onClick={onClose}>
              <X />
            </IconButton>
          )}
        </span>
      </div>
      {searching && (
        <label className="mx-2 mt-1 flex h-9 items-center gap-2 rounded-2lg bg-background-secondary-hover px-2">
          <Search className="size-4 shrink-0 text-foreground-icon-secondary" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setSearching(false);
                setQ('');
              }
            }}
            placeholder={ui.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-body-2-regular text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </label>
      )}
      <ul className="flex flex-col gap-0.5 px-2 pt-1">
        <li>
          <button type="button" onClick={p.onNew} className={cn(SIDE_ROW, 'text-body-2-medium text-text-primary')}>
            <span className="grid size-[22px] place-items-center text-foreground-icon-secondary">
              <SquarePen className="size-[18px]" />
            </span>
            {ui.newChat}
          </button>
        </li>
        <li>
          <button type="button" aria-pressed={p.shuffle} onClick={p.onShuffle} className={cn(SIDE_ROW, 'text-body-2-medium text-text-primary', p.shuffle && ROW_ON)}>
            <span className="grid size-[22px] place-items-center text-foreground-icon-secondary">
              <Repeat className="size-[18px]" />
            </span>
            {ui.takeTurns}
            <span className={cn('ms-auto me-1.5 text-caption-1-regular', p.shuffle ? 'text-text-primary' : 'text-text-tertiary')}>{p.shuffle ? ui.nextName(MASCOTS[p.next].name) : ui.off}</span>
          </button>
        </li>
        {p.huddleAvailable && (
        <li>
          <button type="button" aria-pressed={p.huddle} onClick={p.onHuddle} className={cn(SIDE_ROW, 'text-body-2-medium text-text-primary', p.huddle && ROW_ON)}>
            <span className="grid size-[22px] place-items-center text-foreground-icon-secondary">
              <Users className="size-[18px]" />
            </span>
            {ui.huddle}
            <span className={cn('ms-auto me-1.5 text-caption-1-regular', p.huddle ? 'text-text-primary' : 'text-text-tertiary')}>{p.huddle ? ui.everyQuestion : ui.researchOnly}</span>
          </button>
        </li>
        )}
      </ul>
      <nav aria-label={ui.mascotsAndChats} className="scrollbar-thin mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {pinnedRows.length > 0 && (
          <section className="group/section">
            <SectionHeader label={ui.pinned} open={open.pinned} onToggle={() => flip('pinned')} />
            <Collapse open={open.pinned}>
              <ul className="flex flex-col gap-px">{pinnedRows.map(row)}</ul>
            </Collapse>
          </section>
        )}
        {groups.length > 0 && (
          <section className="group/section">
            <SectionHeader label={ui.cast} open={open.cast} onToggle={() => flip('cast')} />
            <Collapse open={open.cast}>
              <ul className="flex flex-col">
                {groups.map((g) => (
                  <li key={g.voice} className="group/section">
                    <SectionHeader small label={g.label} open={voiceOpen[g.voice]} onToggle={() => setVoiceOpen((v) => ({ ...v, [g.voice]: !v[g.voice] }))} />
                    <Collapse open={voiceOpen[g.voice]}>
                      <ul className="flex flex-col gap-px">{g.rows.map(row)}</ul>
                    </Collapse>
                  </li>
                ))}
              </ul>
            </Collapse>
          </section>
        )}
        {chats.length > 0 && (
          <section className="group/section">
            <SectionHeader label={ui.chats} open={open.chats} onToggle={() => flip('chats')} />
            <Collapse open={open.chats}>
              <ul className="flex flex-col gap-px">
                {chatPinned.length > 0 && <li>{label(ui.pinned)}</li>}
                {chatPinned.map(chatRow)}
                {chatPinned.length > 0 && chatRest.length > 0 && <li>{label(ui.recent)}</li>}
                {chatRest.map(chatRow)}
              </ul>
            </Collapse>
          </section>
        )}
        {query && !pinnedRows.length && !groups.length && !chats.length && <p className="px-2 pt-4 text-body-2-regular text-text-tertiary">{ui.nobody(q.trim())}</p>}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-separator-border px-3 pt-2.5">
        <Avatar label="Alex Rivera" className="size-7" />
        <span className="min-w-0 flex-1 truncate text-body-2-medium text-text-primary">Alex Rivera</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={ui.account} className={GHOST}>
              <Ellipsis />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end">
            <DropdownMenuItem disabled={!p.hidden.length} onSelect={() => p.onHide(null)}>
              <EyeIcon /> {ui.showHidden(p.hidden.length)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Surface>
  );
}

/** The folded sidebar: a narrow rail with New chat, Take turns and the pinned mascots (grok keeps a rail too). */
function MascotRail({ onUnfold, ...p }: SidebarProps & { onUnfold: () => void }) {
  const ui = copyOf(UI);
  return (
    <Surface className="h-full w-[60px] shrink-0 items-center gap-1 py-2">
      <IconButton label={ui.unfoldSidebar} onClick={onUnfold} className="size-9">
        <PanelLeft />
      </IconButton>
      <IconButton label="New chat" onClick={p.onNew} className="size-9">
        <SquarePen />
      </IconButton>
      <IconButton label={p.shuffle ? ui.takeTurnsOn : ui.takeTurns} active={p.shuffle} onClick={p.onShuffle} className="size-9">
        <Repeat />
      </IconButton>
      {p.huddleAvailable && (
        <IconButton label={p.huddle ? ui.huddleOn : ui.huddle} active={p.huddle} onClick={p.onHuddle} className="size-9">
          <Users />
        </IconButton>
      )}
      <span className="my-1 h-px w-6 bg-separator-border" />
      <div role="radiogroup" aria-label={ui.pinnedMascots} className="flex flex-col items-center gap-1">
        {p.pinned
          .filter((i) => !p.hidden.includes(i))
          .map((i) => {
            const on = i === p.next;
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${MASCOTS[i].name}, ${MASCOTS[i].trait}`}
                    onClick={() => p.onPick(i)}
                    className={cn('grid size-9 place-items-center rounded-2lg outline-none transition-colors hover:bg-background-secondary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring', on && ROW_ON)}
                  >
                    <Mascot index={i} size={22} mood={(p.typing && p.writing === i) || p.huddlers.includes(i) ? 'typing' : 'idle'} hop={on ? i + 1 : 0} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{MASCOTS[i].name}</TooltipContent>
              </Tooltip>
            );
          })}
      </div>
      <Avatar label="Alex Rivera" className="mt-auto size-7" />
    </Surface>
  );
}

/** Scripted runs to check the motion by eye: each starts a fresh chat and sends its question (and may stop it). */
type TestRun = { label: string; text: string; stopAfter?: number };

/** The interface's copy (the conversation's is in TALK and HUDDLE_COPY). */
const UI = defineCopy({
  en: {
    source: (n: string) => `Source ${n}`,
    searching: 'is searching the web',
    searched: 'searched the web',
    read: 'read',
    results: (n: number) => `${n} results`,
    thinking: 'The mascots are thinking',
    huddled: (s: number, n: number) => `Huddled for ${s}s · ${n} mascots`,
    huddleStopped: (s: number) => `Huddle stopped after ${s}s`,
    sources: (n: number) => `${n} sources`,
    huddleTab: 'Huddle',
    sourcesTab: (n: number) => `Sources · ${n}`,
    closePanel: 'Close panel',
    leads: 'leads',
    interruptedNotice: 'The request was interrupted by the user.',
    interrupted: 'Interrupted',
    whoNext: 'Who answers next',
    next: 'Next:',
    huddle: 'Huddle',
    huddleTitle: 'The next mascot looks it up with three others, then answers with sources',
    takeTurns: 'Take turns',
    takeTurnsTitle: 'A new mascot answers each reply, in turn',
    voices: { warm: 'Warm', brief: 'Brief', careful: 'Careful', dreamy: 'Dreamy' },
    lookingUp: 'looking it up…',
    typing: 'typing…',
    answersNext: 'answers next',
    optionsFor: (name: string) => `Options for ${name}`,
    answerNext: 'Answer next',
    pin: 'Pin',
    unpin: 'Unpin',
    hide: 'Hide from sidebar',
    renameChat: 'Rename chat',
    rename: 'Rename',
    remove: 'Delete',
    mascots: 'Mascots',
    search: 'Search',
    foldSidebar: 'Fold sidebar',
    closeSidebar: 'Close sidebar',
    searchPlaceholder: 'Mascots, voices, chats',
    newChat: 'New chat',
    off: 'Off',
    on: 'On',
    nextName: (name: string) => `Next: ${name}`,
    everyQuestion: 'Every question',
    researchOnly: 'Research only',
    mascotsAndChats: 'Mascots and chats',
    pinned: 'Pinned',
    cast: 'The cast',
    chats: 'Chats',
    recent: 'Recent',
    nobody: (q: string) => `Nobody here answers to “${q}”.`,
    account: 'Account',
    showHidden: (n: number) => `Show hidden mascots${n ? ` (${n})` : ''}`,
    unfoldSidebar: 'Unfold sidebar',
    takeTurnsOn: 'Take turns: on',
    huddleOn: 'Huddle: on',
    pinnedMascots: 'Pinned mascots',
    testRuns: 'Test runs',
    slowMotion: 'Slow motion ×4',
    runs: [
      { label: 'Huddle: cache question', text: 'Best way to cache API calls?' },
      { label: 'Huddle: bug research', text: 'Research this bug: TypeError, cart is undefined' },
      { label: 'Huddle, stopped after 4s', text: 'Compare caching strategies for API calls', stopAfter: 4000 },
      { label: 'Solo reply (no huddle)', text: 'Hi there!' },
    ] as TestRun[],
    past: [
      { id: 'c1', title: 'Flaky checkout test', q: 'My checkout test is flaky', mascot: 8, pinned: true },
      { id: 'c2', title: 'TypeError in the cart', q: 'TypeError: cart is undefined', mascot: 1 },
      { id: 'c3', title: 'Meeting Cloud', q: 'Who are you?', mascot: 10 },
      { id: 'c4', title: 'Only fails in CI', q: 'It only fails in CI', mascot: 7 },
      { id: 'c5', title: 'Shipping the onboarding', q: 'How should I ship the onboarding?', mascot: 6 },
    ] as ChatRec[],
    announceHuddle: (name: string, n: number) => `${name} and ${n} others are looking it up`,
    announceTyping: (name: string) => `${name} is typing`,
    announceStopped: (name: string) => `${name} stopped`,
    huddlingWith: (n: number) => `huddling with ${n}…`,
    replying: 'replying…',
    online: (trait: string) => `${trait} · online`,
    takingTurns: 'taking turns',
    huddleIsOn: 'huddle on',
    configure: 'Configure',
    openSidebar: 'Open sidebar',
    message: (name: string) => `Message ${name}`,
    whoShouldAnswer: 'Who should answer?',
    emptyHint: 'Four voices, twelve characters. Pick one, or let them take turns.',
    restarts: 'restarts',
    reset: 'Reset',
    castSection: 'Cast',
    firstToAnswer: 'First to answer',
    takeTurnsHint: 'Each reply goes to the next mascot',
    opening: 'Opening conversation',
    picker: 'Picker above the composer',
    when: 'When',
    huddleModes: { off: 'Off', research: 'Research', always: 'Always' },
    crew: 'Crew',
    crewHint: 'Mascots joining the lead',
    crewSize: 'Crew size',
    sourcesLabel: 'Sources',
    sourcesHint: 'Citations, pill and Sources tab',
    layout: 'Layout',
    sidebar: 'Sidebar',
    sidebarModes: { open: 'Open', folded: 'Rail', hidden: 'Off' },
    motion: 'Motion',
    wordBlur: 'Word blur',
    wordBlurHint: 'Streamed words clear in',
    dust: 'Dust',
    dustHint: 'Huddle rows leave as dust',
    speed: 'Huddle speed',
    testMenu: 'Test menu',
    testMenuHint: 'Flask in the header',
    usage: 'Usage',
    copy: 'Copy',
    copied: 'Copied',
  },
  fr: {
    source: (n: string) => `Source ${n}`,
    searching: 'cherche sur le web',
    searched: 'a cherché sur le web',
    read: 'a lu',
    results: (n: number) => `${n} résultats`,
    thinking: 'Les mascottes réfléchissent',
    huddled: (s: number, n: number) => `Concertation : ${s} s · ${n} mascottes`,
    huddleStopped: (s: number) => `Concertation arrêtée après ${s} s`,
    sources: (n: number) => `${n} sources`,
    huddleTab: 'Concertation',
    sourcesTab: (n: number) => `Sources · ${n}`,
    closePanel: 'Fermer le panneau',
    leads: 'mène',
    interruptedNotice: "La requête a été interrompue par l'utilisateur.",
    interrupted: 'Interrompu',
    whoNext: 'Qui répond ensuite',
    next: 'Ensuite :',
    huddle: 'Concertation',
    huddleTitle: 'La prochaine mascotte cherche avec trois autres, puis répond avec des sources',
    takeTurns: 'À tour de rôle',
    takeTurnsTitle: 'Une nouvelle mascotte répond à chaque fois, à tour de rôle',
    voices: { warm: 'Chaleureux', brief: 'Bref', careful: 'Minutieux', dreamy: 'Rêveur' },
    lookingUp: 'cherche…',
    typing: 'écrit…',
    answersNext: 'répond ensuite',
    optionsFor: (name: string) => `Options pour ${name}`,
    answerNext: 'Répondre ensuite',
    pin: 'Épingler',
    unpin: 'Détacher',
    hide: 'Masquer de la barre latérale',
    renameChat: 'Renommer la discussion',
    rename: 'Renommer',
    remove: 'Supprimer',
    mascots: 'Mascottes',
    search: 'Rechercher',
    foldSidebar: 'Replier la barre latérale',
    closeSidebar: 'Fermer la barre latérale',
    searchPlaceholder: 'Mascottes, voix, discussions',
    newChat: 'Nouvelle discussion',
    off: 'Désactivé',
    on: 'Activé',
    nextName: (name: string) => `Ensuite : ${name}`,
    everyQuestion: 'Toutes les questions',
    researchOnly: 'Recherche',
    mascotsAndChats: 'Mascottes et discussions',
    pinned: 'Épinglées',
    cast: 'La troupe',
    chats: 'Discussions',
    recent: 'Récentes',
    nobody: (q: string) => `Personne ici ne répond à « ${q} ».`,
    account: 'Compte',
    showHidden: (n: number) => `Afficher les mascottes masquées${n ? ` (${n})` : ''}`,
    unfoldSidebar: 'Déplier la barre latérale',
    takeTurnsOn: 'À tour de rôle : activé',
    huddleOn: 'Concertation : activée',
    pinnedMascots: 'Mascottes épinglées',
    testRuns: 'Scénarios de test',
    slowMotion: 'Ralenti ×4',
    runs: [
      { label: 'Concertation : question de cache', text: "Meilleur cache pour des appels d'API ?" },
      { label: 'Concertation : recherche de bug', text: 'Recherche ce bug : TypeError, cart est undefined' },
      { label: 'Concertation arrêtée après 4 s', text: "Compare les stratégies de cache pour des appels d'API", stopAfter: 4000 },
      { label: 'Réponse seule (sans concertation)', text: 'Salut !' },
    ] as TestRun[],
    past: [
      { id: 'c1', title: 'Test de paiement instable', q: 'Mon test de paiement est instable', mascot: 8, pinned: true },
      { id: 'c2', title: 'TypeError dans le panier', q: 'TypeError : cart est undefined', mascot: 1 },
      { id: 'c3', title: 'Rencontre avec Cloud', q: 'Qui es-tu ?', mascot: 10 },
      { id: 'c4', title: "N'échoue qu'en CI", q: "Ça n'échoue qu'en CI", mascot: 7 },
      { id: 'c5', title: "Livrer l'onboarding", q: "Comment livrer l'onboarding ?", mascot: 6 },
    ] as ChatRec[],
    announceHuddle: (name: string, n: number) => `${name} et ${n} autres cherchent`,
    announceTyping: (name: string) => `${name} écrit`,
    announceStopped: (name: string) => `${name} s'est arrêté`,
    huddlingWith: (n: number) => `en concertation avec ${n}…`,
    replying: 'répond…',
    online: (trait: string) => `${trait} · en ligne`,
    takingTurns: 'à tour de rôle',
    huddleIsOn: 'concertation activée',
    configure: 'Configurer',
    openSidebar: 'Ouvrir la barre latérale',
    message: (name: string) => `Message à ${name}`,
    whoShouldAnswer: 'Qui doit répondre ?',
    emptyHint: 'Quatre voix, douze personnages. Choisis-en un, ou laisse-les répondre à tour de rôle.',
    restarts: 'redémarre',
    reset: 'Réinitialiser',
    castSection: 'Troupe',
    firstToAnswer: 'Premier à répondre',
    takeTurnsHint: 'Chaque réponse passe à la mascotte suivante',
    opening: "Conversation d'ouverture",
    picker: 'Sélecteur au-dessus du composer',
    when: 'Quand',
    huddleModes: { off: 'Jamais', research: 'Recherche', always: 'Toujours' },
    crew: 'Équipe',
    crewHint: 'Mascottes qui rejoignent la meneuse',
    crewSize: "Taille de l'équipe",
    sourcesLabel: 'Sources',
    sourcesHint: 'Citations, pastille et onglet Sources',
    layout: 'Mise en page',
    sidebar: 'Barre latérale',
    sidebarModes: { open: 'Ouverte', folded: 'Rail', hidden: 'Masquée' },
    motion: 'Animation',
    wordBlur: 'Flou des mots',
    wordBlurHint: 'Les mots arrivent en se défloutant',
    dust: 'Poussière',
    dustHint: 'Les lignes de la concertation partent en poussière',
    speed: 'Vitesse de la concertation',
    testMenu: 'Menu de tests',
    testMenuHint: "Fiole dans l'en-tête",
    usage: 'Utilisation',
    copy: 'Copier',
    copied: 'Copié',
  },
});

function TestMenu({ slow, onSlow, onRun }: { slow: boolean; onSlow: (v: boolean) => void; onRun: (run: TestRun) => void }) {
  const ui = copyOf(UI);
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={ui.testRuns}
              className="relative grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary outline-none transition-colors hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default dark:hover:bg-background-primary-hover [&_svg]:size-4"
            >
              <FlaskConical />
              {slow && <span className="absolute -end-1 -top-1 rounded-full bg-accent-500 px-1 text-[9px] leading-[13px] font-semibold text-white">×4</span>}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{ui.testRuns}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-64">
        {ui.runs.map((r) => (
          <DropdownMenuItem key={r.label} onSelect={() => onRun(r)}>
            <FlaskConical /> {r.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onSlow(!slow);
          }}
        >
          <Repeat /> {ui.slowMotion}
          <span className={cn('ms-auto text-caption-1-regular', slow ? 'text-text-primary' : 'text-text-tertiary')}>{slow ? ui.on : ui.off}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** What a host passes to show the preview's Configure panel in the right rail (the template does; a plain
 *  <MascotChat /> does not). */
interface ConfigureSlot {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panel: ReactNode;
}

/**
 * The mascot messenger. Every prop is optional (DEFAULT_CONFIG fills the rest). Settings read once at mount:
 * defaultMascot, takeTurns, huddle, sidebar, intro; the others apply live.
 */
export function MascotChat({ configure, onConfig, ...props }: Partial<MascotChatConfig> & { configure?: ConfigureSlot; /** Told when the test menu changes a setting (slow motion). */ onConfig?: (patch: Partial<MascotChatConfig>) => void }) {
  const cfg = { ...DEFAULT_CONFIG, ...props };
  // Subscribes the whole tree to the language: everything below reads its copy while rendering.
  useLocale();
  const talk = copyOf(TALK);
  const ui = copyOf(UI);
  // The scripts read these while they run; set during render so the very first render already agrees.
  speaker.mode = cfg.huddle;
  speaker.crewSize = cfg.crewSize;
  const chat = useChatEngine({ intro: cfg.intro ? intro : undefined, reply });
  // Off by default: the first impression is one character you chose, not avatars changing unexplained.
  const [shuffle, setShuffle] = useState(cfg.takeTurns);
  const [picked, setPicked] = useState(cfg.defaultMascot);
  /** Shuffle's cursor: the mascot that takes the next reply. */
  const [next, setNext] = useState(cfg.defaultMascot);
  /** Each assistant message keeps the mascot that wrote it, so a new pick only changes the replies to come. */
  const [assigned, setAssigned] = useState<Record<string, number>>({});
  /** Turns cut short by Stop, keyed by the message they end on (an assistant reply, or the user message it never answered). */
  const [stopped, setStopped] = useState<Record<string, number>>({});
  /** Off by default: research-like questions still huddle; on, every question but small talk does. */
  const [huddleOn, setHuddleOn] = useState(false);
  /** Huddle tempo: from the config, and the test menu's slow motion (which reports back through onConfig). */
  const [speed, setSpeed] = useState(cfg.speed);
  useEffect(() => setSpeed(cfg.speed), [cfg.speed]);
  const setSlow = (on: boolean) => {
    const sp = on ? 4 : 1;
    setSpeed(sp);
    onConfig?.({ speed: sp });
  };
  /** The huddle side panel: which reply's huddle, on which tab. */
  const [panel, setPanel] = useState<{ id: string; tab: PanelTab } | null>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  const upcoming = shuffle ? next : picked;

  const msgs = chat.messages;
  const last = msgs[msgs.length - 1];

  useLayoutEffect(() => {
    speaker.index = upcoming;
    speaker.huddle = huddleOn;
    tempo.scale = speed;
  });
  // A reply that just started takes the upcoming mascot; taking turns, the next one moves along. An intro turn is
  // cast to a given mascot and leaves the rotation where it was.
  useLayoutEffect(() => {
    const fresh = msgs.filter((m) => m.role === 'assistant' && assigned[m.id] === undefined);
    if (!fresh.length) return;
    let cursor = next;
    const add: Record<string, number> = {};
    for (const m of fresh) {
      if (speaker.cast !== null) {
        add[m.id] = speaker.cast;
        continue;
      }
      add[m.id] = shuffle ? cursor : picked;
      if (shuffle) cursor = (cursor + 1) % MASCOTS.length;
    }
    setAssigned((a) => ({ ...a, ...add }));
    if (shuffle && cursor !== next) setNext(cursor);
  }, [msgs, assigned, next, shuffle, picked]);

  /** Who answers the turn about to start: the intro's cast, or the pick / rotation. */
  const answering = speaker.cast ?? upcoming;
  const mascotOf = (m: Message) => assigned[m.id] ?? answering;
  // Between the send and the assistant's first chunk there is no message yet: the mascot types already.
  const waiting = chat.busy && last?.role === 'user';
  // "Being written" is the message's own state, not "busy and last": right after a send, busy flips before the user
  // message lands, and the reply that already finished would otherwise read as writing again for a frame.
  const writingReply = last?.role === 'assistant' && !last.done ? last : undefined;
  const speaking = chat.busy ? (writingReply ? mascotOf(writingReply) : answering) : null;
  /** The header's mascot: who is writing while a reply plays, otherwise who answers next (the strip's checked one). */
  const current = speaking ?? upcoming;
  const liveHuddle = writingReply ? huddleOf(writingReply) : undefined;
  /** A huddle still looking it up: the header and the live region say so instead of "typing". */
  const huddling = !!liveHuddle && !liveHuddle.done;
  const typing = chat.busy && !huddling && (waiting || (!!writingReply && !textOf(writingReply)));
  const name = MASCOTS[current].name;

  const userBefore = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (msgs[j].role === 'user') return msgs[j];
    return undefined;
  };
  const lastUser = [...msgs].reverse().find((m) => m.role === 'user');

  const stop = () => {
    if (last) setStopped((s) => ({ ...s, [last.id]: last.role === 'assistant' ? mascotOf(last) : answering }));
    chat.stop();
  };
  /** Answers the same message again without sending it twice, and leaves any draft in the composer alone. */
  const retry = (stoppedId: string, text: string) => {
    setStopped((s) => {
      const rest = { ...s };
      delete rest[stoppedId];
      return rest;
    });
    // The cut-off reply goes first: a response opening on an assistant message continues it, so its partial text
    // would come back in front of the new answer. (A stop before any reply is keyed by the user message: nothing to drop.)
    if (msgs.some((m) => m.id === stoppedId && m.role === 'assistant')) chat.remove(stoppedId);
    void chat.run((api) => reply(api, text));
  };
  const surface = useRef<HTMLDivElement>(null);

  /* Sidebar state: folded to a rail or not (desktop), the drawer (phones), the cast's pins and hides, the chats. */
  const [unfolded, setUnfolded] = useState(cfg.sidebar !== 'folded');
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [pinned, setPinned] = useState<number[]>(PINNED);
  const [hidden, setHidden] = useState<number[]>([]);
  const [chats, setChats] = useState<ChatRec[]>(() => copyOf(UI).past);
  /** The chat on show: "live" (the one started here), or a past one reopened from the sidebar. */
  const [active, setActive] = useState('live');
  const firstUser = msgs.find((m) => m.role === 'user');
  const firstReply = msgs.find((m) => m.role === 'assistant');
  const liveRec: ChatRec | null =
    active === 'live' && firstUser ? { id: 'live', title: excerpt(textOf(firstUser)), q: textOf(firstUser), mascot: firstReply ? mascotOf(firstReply) : answering } : null;
  const replies: Record<number, number> = {};
  for (const m of msgs) if (m.role === 'assistant' && textOf(m)) replies[mascotOf(m)] = (replies[mascotOf(m)] ?? 0) + 1;

  /** Empties the thread for a new start; the live chat, if it had begun, joins the history first. */
  const leave = (to: string) => {
    if (liveRec) setChats((cs) => [{ ...liveRec, id: `c${Date.now().toString(36)}` }, ...cs]);
    chat.reset();
    setAssigned({});
    setStopped({});
    setActive(to);
    setDrawer(false);
  };
  const newChat = () => {
    leave('live');
    // The button that had focus is still there, but the thread under it is gone: start typing right away. A timer,
    // not requestAnimationFrame, which never fires while the preview sits in a background tab.
    setTimeout(() => surface.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 0);
  };
  /** No stored threads in a preview: reopening replays the chat's first exchange, answered by its own mascot. */
  const openChat = (rec: ChatRec) => {
    if (rec.id === active) return setDrawer(false);
    leave(rec.id);
    void chat.run(async (api) => {
      speaker.cast = rec.mascot;
      try {
        await api.user(rec.q);
        const a = api.assistant();
        await a.stream(replyFor(rec.q, MASCOTS[rec.mascot]), 60);
        a.done();
      } finally {
        speaker.cast = null;
      }
    });
  };
  const patchChat = (id: string, patch: Partial<ChatRec> | null) => {
    setChats((cs) => (patch ? cs.map((c) => (c.id === id ? { ...c, ...patch } : c)) : cs.filter((c) => c.id !== id)));
    if (!patch && id === active) newChat();
  };
  const pick = (i: number) => {
    setPicked(i);
    setShuffle(false);
  };
  // Taking turns starts from your pick, not from wherever the rotation last stopped.
  const toggleTurns = () => {
    if (!shuffle) setNext(picked);
    setShuffle((s) => !s);
  };

  // One polite live region for the whole thread: who is typing, then the reply itself.
  const lastStopped = last && stopped[last.id] !== undefined;
  const announce = huddling
    ? ui.announceHuddle(name, liveHuddle!.crew.length)
    : typing
    ? ui.announceTyping(name)
    : lastStopped
      ? ui.announceStopped(MASCOTS[stopped[last.id]].name)
      : !chat.busy && last?.role === 'assistant' && textOf(last)
        ? `${MASCOTS[mascotOf(last)].name}: ${textOf(last)}`
        : '';
  const followUps = lastUser ? talk.followUps[intentOf(textOf(lastUser))].filter((s) => s !== textOf(lastUser)) : [];
  const empty = msgs.length === 0 && !chat.busy;

  // A test run: a fresh chat, its question sent as if picked, and Stop pressed after `stopAfter` (scaled by slow motion).
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const testTimer = useRef<number | undefined>(undefined);
  const runTest = (run: TestRun) => {
    window.clearTimeout(testTimer.current);
    newChat();
    window.setTimeout(() => {
      chat.send(run.text);
      if (run.stopAfter) testTimer.current = window.setTimeout(() => stopRef.current(), run.stopAfter * tempo.scale);
    }, 60);
  };

  // The panel follows its reply: gone with the thread (New chat, a reopened chat, a deleted message).
  const panelData = panel ? huddleOf(msgs.find((m) => m.id === panel.id)) : undefined;
  // Kept while the rail or drawer plays its closing motion, so the panel leaves with its content.
  const shownPanel = useRef<{ data: HuddleData; tab: PanelTab } | null>(null);
  if (panelData && panel) shownPanel.current = { data: panelData, tab: panel.tab };
  const panelView = shownPanel.current && <HuddlePanel data={shownPanel.current.data} tab={shownPanel.current.tab} onTab={(tab) => setPanel((p) => p && { ...p, tab })} onClose={closePanel} />;

  const side: SidebarProps = {
    next: upcoming,
    writing: speaking,
    typing,
    huddlers: huddling ? liveHuddle!.joined : [],
    shuffle,
    huddle: huddleOn,
    huddleAvailable: cfg.huddle === 'research',
    replies,
    pinned,
    hidden,
    chats: liveRec ? [liveRec, ...chats] : chats,
    active,
    onPick: pick,
    onShuffle: toggleTurns,
    onHuddle: () => setHuddleOn((h) => !h),
    onPin: (i) => setPinned((ps) => (ps.includes(i) ? ps.filter((x) => x !== i) : [...ps, i])),
    onHide: (i) => setHidden((hs) => (i === null ? [] : [...hs, i])),
    onNew: newChat,
    onOpenChat: openChat,
    onPatchChat: patchChat,
  };

  // One right rail: the Configure panel or a huddle's panel, never both.
  const configOpen = !!configure?.open;
  const rightOpen = configOpen || !!panelData;
  const rightView = configOpen ? configure!.panel : panelView;
  const openPanel = (p: { id: string; tab: PanelTab }) => {
    configure?.onOpenChange(false);
    setPanel(p);
  };
  const withSidebar = cfg.sidebar !== 'hidden';

  return (
    <LookCtx.Provider value={{ wordBlur: cfg.wordBlur, dust: cfg.dust, sources: cfg.sources }}>
    <div ref={surface} className="contents">
      <Canvas>
        {withSidebar && (
          <>
            <SideRail open width={unfolded ? 260 : 60} className="hidden md:block">
              {unfolded ? <MascotSidebar {...side} onFold={() => setUnfolded(false)} /> : <MascotRail {...side} onUnfold={() => setUnfolded(true)} />}
            </SideRail>
            <Drawer open={drawer} onClose={closeDrawer} className="md:hidden">
              <MascotSidebar {...side} onPick={(i) => (pick(i), closeDrawer())} onClose={closeDrawer} />
            </Drawer>
          </>
        )}
        <ChatSurface
          dep={msgs}
          width="max-w-2xl"
          empty={empty}
          header={
            <>
              {withSidebar && (
                <IconButton label={ui.openSidebar} onClick={() => setDrawer(true)} className="md:hidden">
                  <Menu />
                </IconButton>
              )}
              <Mascot index={current} size={28} />
              <span className="flex min-w-0 flex-col px-1 leading-tight">
                <span className="truncate text-headline-medium text-text-primary">{name}</span>
                <span className="truncate text-caption-1-regular text-text-primary/70">
                  {huddling ? ui.huddlingWith(liveHuddle!.crew.length) : typing ? ui.typing : chat.busy ? ui.replying : ui.online(MASCOTS[current].trait)}
                  {!chat.busy && (shuffle || huddleOn) && <span className="max-sm:hidden"> · {[shuffle && ui.takingTurns, huddleOn && ui.huddleIsOn].filter(Boolean).join(' · ')}</span>}
                </span>
              </span>
              <span className="ms-auto flex items-center gap-1">
                {configure && (
                  <IconButton
                    label={ui.configure}
                    active={configOpen}
                    onClick={() => {
                      setPanel(null);
                      configure.onOpenChange(!configOpen);
                    }}
                  >
                    <SlidersHorizontal />
                  </IconButton>
                )}
                {cfg.testMenu && <TestMenu slow={speed === 4} onSlow={setSlow} onRun={runTest} />}
                <HeaderTools />
                <IconButton label={ui.newChat} onClick={newChat}>
                  <SquarePen />
                </IconButton>
              </span>
            </>
          }
          footer={
            <>
              {cfg.strip && <MascotStrip next={upcoming} writing={speaking} shuffle={shuffle} huddle={huddleOn} huddleAvailable={cfg.huddle === 'research'} onPick={pick} onShuffle={toggleTurns} onHuddle={() => setHuddleOn((h) => !h)} />}
              <Composer
                reply={chat.replyTo}
                onClearReply={chat.clearReply}
                value={chat.draft}
                onChange={chat.setDraft}
                onSend={chat.send}
                onStop={stop}
                busy={chat.busy}
                placeholder={ui.message(MASCOTS[upcoming].name)}
              />
            </>
          }
        >
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
          {empty ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex flex-col gap-1">
                <h2 className="text-title-2-medium text-text-primary">{ui.whoShouldAnswer}</h2>
                <p className="text-body-2-regular text-text-primary/70">{ui.emptyHint}</p>
              </div>
              {/* The cast, one per voice: the same pick as the row above the message box. */}
              <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
                {CAST.map((i) => {
                  const m = MASCOTS[i];
                  const on = !shuffle && i === picked;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pick(i)}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-2 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus-ring',
                        on ? 'bg-background-primary-default shadow-xs' : 'hover:bg-background-tertiary-default',
                      )}
                    >
                      <Mascot index={i} size={44} hop={on ? i + 1 : 0} />
                      <span className="flex flex-col leading-tight">
                        <span className="text-body-2-medium text-text-primary">{m.name}</span>
                        <span className="text-caption-1-regular text-text-primary/70">{ui.voices[m.voice]}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <Suggestions className="justify-center" items={talk.starters} onPick={chat.send} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {msgs.map((m, i) => {
                if (m.role === 'user')
                  return (
                    <div key={m.id} className="flex flex-col gap-3">
                      <Bubble mine>{textOf(m)}</Bubble>
                      {/* Stopped before the reply even started: the turn still says so. */}
                      {stopped[m.id] !== undefined && i === msgs.length - 1 && <AssistantTurn mascot={stopped[m.id]} typing={false} stopped onRetry={() => retry(m.id, textOf(m))} />}
                    </div>
                  );
                const before = userBefore(i);
                const cut = stopped[m.id] !== undefined;
                // A reply stopped before its first word, then retried: nothing left to show.
                if (!cut && !textOf(m) && m.done) return null;
                return (
                  <AssistantTurn
                    key={m.id}
                    message={m}
                    mascot={mascotOf(m)}
                    typing={!m.done}
                    stopped={cut}
                    happy={before ? intentOf(textOf(before)) === 'thanks' : false}
                    onRetry={before && m === last ? () => retry(m.id, textOf(before)) : undefined}
                    onPanel={(tab) => openPanel({ id: m.id, tab })}
                    huddleSoon={!m.done && !!before && wantsHuddle(textOf(before))}
                  />
                );
              })}
              {waiting && <AssistantTurn key="waiting" mascot={answering} typing huddleSoon={wantsHuddle(textOf(last))} />}
              {last?.role === 'assistant' && !chat.busy && !lastStopped && followUps.length > 0 && <Suggestions className="ps-9" items={followUps} onPick={chat.send} />}
            </div>
          )}
        </ChatSurface>
        <SideRail open={rightOpen} width={340} side="end" className="hidden lg:block">
          {rightView}
        </SideRail>
        <Drawer open={rightOpen} onClose={configOpen ? () => configure!.onOpenChange(false) : closePanel} side="end" className="lg:hidden">
          {rightView}
        </Drawer>
      </Canvas>
    </div>
    </LookCtx.Provider>
  );
}

/* ---------- The preview's Configure panel: every setting, live, and the <MascotChat /> call they add up to ---------- */

/** Settings read at mount: changing one restarts the demo (the panel says which). */
const REMOUNT: (keyof MascotChatConfig)[] = ['defaultMascot', 'takeTurns', 'huddle', 'sidebar', 'intro'];

function usageOf(cfg: MascotChatConfig) {
  const attrs = (Object.keys(DEFAULT_CONFIG) as (keyof MascotChatConfig)[])
    .filter((k) => cfg[k] !== DEFAULT_CONFIG[k])
    .map((k) => {
      const v = cfg[k];
      return typeof v === 'string' ? `${k}="${v}"` : typeof v === 'boolean' ? (v ? k : `${k}={false}`) : `${k}={${v}}`;
    });
  return `import { MascotChat } from '@/templates/mascot-chat';\n\n<MascotChat${attrs.length ? `\n  ${attrs.join('\n  ')}\n` : ' '}/>`;
}

function ConfigRow({ label, hint, restarts, children }: { label: string; hint?: string; restarts?: boolean; children: ReactNode }) {
  const ui = copyOf(UI);
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex min-w-0 flex-col">
        <span className="text-body-2-medium text-text-primary">
          {label}
          {restarts && <span className="ms-1.5 text-caption-1-regular text-text-tertiary">{ui.restarts}</span>}
        </span>
        {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-full bg-background-tertiary-default p-0.5">
      {options.map(([v, text]) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn('h-7 cursor-pointer rounded-full px-2.5 text-caption-1-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus-ring', value === v ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary')}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col border-t border-separator-border pt-3 first:border-t-0 first:pt-0">
      <h3 className="pb-1 text-caption-1-medium text-text-tertiary">{title}</h3>
      {children}
    </section>
  );
}

function ConfigPanel({ config, onChange, onReset, onClose }: { config: MascotChatConfig; onChange: (patch: Partial<MascotChatConfig>) => void; onReset: () => void; onClose: () => void }) {
  const ui = copyOf(UI);
  const [copied, setCopied] = useState(false);
  const code = usageOf(config);
  const sw = (k: 'takeTurns' | 'strip' | 'intro' | 'sources' | 'wordBlur' | 'dust' | 'testMenu', label: string) => <Switch aria-label={label} checked={config[k]} onCheckedChange={(v) => onChange({ [k]: v })} />;
  const changed = (Object.keys(DEFAULT_CONFIG) as (keyof MascotChatConfig)[]).some((k) => config[k] !== DEFAULT_CONFIG[k]);
  return (
    <Surface className="h-full w-[340px] shrink-0">
      <div className="flex h-12 shrink-0 items-center gap-1 ps-4 pe-2">
        <span className="text-headline-medium text-text-primary">{ui.configure}</span>
        <button type="button" disabled={!changed} onClick={onReset} className="ms-auto h-7 cursor-pointer rounded-md px-2 text-caption-1-medium text-text-secondary outline-none transition-colors hover:bg-background-tertiary-default hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring disabled:cursor-default disabled:opacity-40">
          {ui.reset}
        </button>
        <IconButton label={ui.closePanel} onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
        <ConfigSection title={ui.castSection}>
          <span className="pt-0.5 pb-2 text-body-2-medium text-text-primary">
            {ui.firstToAnswer} <span className="ms-1 text-caption-1-regular text-text-tertiary">{ui.restarts}</span>
          </span>
          <div role="radiogroup" aria-label={ui.firstToAnswer} className="grid grid-cols-6 gap-1">
            {MASCOTS.map((m, i) => (
              <Tooltip key={m.name}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={config.defaultMascot === i}
                    aria-label={`${m.name}, ${m.trait}`}
                    onClick={() => onChange({ defaultMascot: i })}
                    className={cn('grid aspect-square cursor-pointer place-items-center rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus-ring', config.defaultMascot === i ? 'bg-background-primary-default shadow-xs' : 'hover:bg-background-tertiary-default')}
                  >
                    <Mascot index={i} size={26} hop={config.defaultMascot === i ? i + 1 : 0} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{m.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <ConfigRow label={ui.takeTurns} hint={ui.takeTurnsHint} restarts>
            {sw('takeTurns', ui.takeTurns)}
          </ConfigRow>
          <ConfigRow label={ui.opening} restarts>
            {sw('intro', ui.opening)}
          </ConfigRow>
          <ConfigRow label={ui.picker}>{sw('strip', ui.picker)}</ConfigRow>
        </ConfigSection>

        <ConfigSection title={ui.huddle}>
          <ConfigRow label={ui.when} restarts>
            <Segmented label={ui.huddle} value={config.huddle} options={[['off', ui.huddleModes.off], ['research', ui.huddleModes.research], ['always', ui.huddleModes.always]]} onChange={(huddle) => onChange({ huddle })} />
          </ConfigRow>
          <ConfigRow label={ui.crew} hint={ui.crewHint}>
            <Segmented label={ui.crewSize} value={config.crewSize} options={[[1, '1'], [2, '2'], [3, '3']]} onChange={(crewSize) => onChange({ crewSize })} />
          </ConfigRow>
          <ConfigRow label={ui.sourcesLabel} hint={ui.sourcesHint}>
            {sw('sources', ui.sourcesLabel)}
          </ConfigRow>
        </ConfigSection>

        <ConfigSection title={ui.layout}>
          <ConfigRow label={ui.sidebar} restarts>
            <Segmented label={ui.sidebar} value={config.sidebar} options={[['open', ui.sidebarModes.open], ['folded', ui.sidebarModes.folded], ['hidden', ui.sidebarModes.hidden]]} onChange={(sidebar) => onChange({ sidebar })} />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection title={ui.motion}>
          <ConfigRow label={ui.wordBlur} hint={ui.wordBlurHint}>
            {sw('wordBlur', ui.wordBlur)}
          </ConfigRow>
          <ConfigRow label={ui.dust} hint={ui.dustHint}>
            {sw('dust', ui.dust)}
          </ConfigRow>
          <ConfigRow label={ui.speed}>
            <Segmented label={ui.speed} value={config.speed} options={[[1, '1×'], [2, '½'], [4, '¼']]} onChange={(speed) => onChange({ speed })} />
          </ConfigRow>
          <ConfigRow label={ui.testMenu} hint={ui.testMenuHint}>
            {sw('testMenu', ui.testMenu)}
          </ConfigRow>
        </ConfigSection>

        <ConfigSection title={ui.usage}>
          <div className="relative rounded-xl bg-background-tertiary-default">
            <pre className="overflow-x-auto p-3 pe-10 font-mono text-caption-1-regular text-text-primary">{code}</pre>
            <IconButton
              label={copied ? ui.copied : ui.copy}
              className="absolute end-1.5 top-1.5"
              onClick={() => {
                void navigator.clipboard?.writeText(code).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? <Check /> : <Copy />}
            </IconButton>
          </div>
        </ConfigSection>
      </div>
    </Surface>
  );
}

/** The preview: <MascotChat /> with the Configure panel. Settings read at mount restart the demo when they change. */
export default function MascotChatTemplate() {
  const [config, setConfig] = useState<MascotChatConfig>(DEFAULT_CONFIG);
  const [open, setOpen] = useState(false);
  const patch = useCallback((p: Partial<MascotChatConfig>) => setConfig((c) => ({ ...c, ...p })), []);
  return (
    <MascotChat
      key={REMOUNT.map((k) => String(config[k])).join('|')}
      {...config}
      onConfig={patch}
      configure={{ open, onOpenChange: setOpen, panel: <ConfigPanel config={config} onChange={patch} onReset={() => setConfig(DEFAULT_CONFIG)} onClose={() => setOpen(false)} /> }}
    />
  );
}
