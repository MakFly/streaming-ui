import { useEffect, useId, useRef, useState } from 'react';
import { NOTIF_BLUE } from '@/vendor/bloub/decor';
import { BotEngine, type BotFrame } from '@/vendor/bloub/engine';
import { clamp, easings } from '@/vendor/bloub/math';
import { lookTarget, TURN_TIME } from '@/vendor/bloub/gaze';
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID, type ExpressionId } from '@/vendor/bloub/expressions';
import { COLOR_BY_ID, DEFAULT_COLOR, DEFAULT_SHAPE, SHAPE_BY_ID, mixHex, type ColorId, type ShapeId } from '@/vendor/bloub/skins';
import { DEMI_VIEWBOX as VB, RAYON as R } from '@/vendor/bloub/repere';
import { SEQUENCE, STATE_BY_ID, type StateId } from '@/vendor/bloub/states';
import { useTheme } from '@/providers/theme-provider';
import { copyOf, defineCopy } from './i18n';

/* React port of bloub's <BloubBot> (github.com/jeremy-prt/bloub, MIT). The engine in src/vendor/bloub is
 * framework- and clock-free: `engine.sample(t)` is a pure function of time, so this component only owns the
 * clock, the pointer gaze and the SVG. The eyes are holes in a mask; the opaque `paper` path under the body
 * keeps rings and particles drawn behind it from showing through them. */

export { SHAPES } from '@/vendor/bloub/skins';
export { COLORS } from '@/vendor/bloub/skins';
export { EXPRESSIONS } from '@/vendor/bloub/expressions';
export { SEQUENCE, POSES } from '@/vendor/bloub/states';
export type { ColorId, ShapeId, ExpressionId, StateId };

/** Our bloub characters. Each one is a body silhouette from the skin catalogue, so it keeps every animation,
 * colour and expression: the character only decides the shape the bloub rests in. */
export const BLOUBS = [
  { id: 'default', shape: 'cercle' },
  { id: 'chat', shape: 'chat' },
  { id: 'chien', shape: 'chien' },
  { id: 'fleur', shape: 'fleur' },
] as const satisfies readonly { id: string; shape: ShapeId }[];
export type BloubVariant = (typeof BLOUBS)[number]['id'];
const VARIANT_SHAPE = new Map<string, ShapeId>(BLOUBS.map((b) => [b.id, b.shape]));

/** Silhouettes that ARE the character: an animation that swaps the body (egg, hexagon, orbit...) would drop the
 * ears or petals, so a character only plays the states that keep the chosen body (`baseBody`). */
const CHARACTER_SHAPES = new Set<string>(BLOUBS.filter((b) => b.id !== 'default').map((b) => b.shape));
/** Alert, exclamation and sleep draw their own glyph instead of the body; a character plays our body-keeping
 * versions, with the "!" or the "Z"s beside its head (src/vendor/bloub/states.ts). */
const CHARACTER_TWIN: Partial<Record<StateId, StateId>> = { alert: 'alertBody', exclaim: 'exclaimBody', sleep: 'sleepBody' };
const keepsBody = (s: StateId) => STATE_BY_ID.get(s)?.baseBody === true || s in CHARACTER_TWIN;
/** What a character plays instead of a body-swapping state: the closest state that keeps its silhouette. */
const CHARACTER_FALLBACK: Partial<Record<StateId, StateId>> = { thinking: 'swirl', orbit: 'swirl', burst: 'swirl', comet: 'swirl' };

/** The animations a shape or character can play: all 14, or only the body-keeping ones for a character. */
export function statesFor(shapeOrVariant: string): StateId[] {
  const shape = VARIANT_SHAPE.get(shapeOrVariant) ?? shapeOrVariant;
  return CHARACTER_SHAPES.has(shape) ? SEQUENCE.filter(keepsBody) : SEQUENCE;
}

/** The state actually played: `state` itself, or its stand-in when a character cannot play it. */
export function stateFor(state: StateId, shapeOrVariant: string): StateId {
  const shape = VARIANT_SHAPE.get(shapeOrVariant) ?? shapeOrVariant;
  if (!CHARACTER_SHAPES.has(shape) || keepsBody(state)) return state;
  return CHARACTER_FALLBACK[state] ?? 'idle';
}

const AVATAR = defineCopy({ en: { label: 'Agent avatar' }, fr: { label: "Avatar de l'agent" } });
const NAMES = defineCopy<Record<string, string>>({
  en: {
  idle: 'Idle', thinking: 'Thinking', wink: 'Wink', wide: 'Wide eyes', alert: 'Alert', notify: 'Notification', exclaim: 'Exclamation', sleep: 'Sleep', egg: 'Egg', hexagon: 'Hexagon', play: 'Play', orbit: 'Orbit', burst: 'Burst', comet: 'Comet', swirl: 'Swirl',
  cercle: 'Circle', galet: 'Pebble', squircle: 'Squircle', capsule: 'Capsule', triangle: 'Triangle', hexagone: 'Hexagon', nuage: 'Cloud', goutte: 'Droplet',
  default: 'Bloub', chat: 'Cat', chien: 'Dog', fleur: 'Flower',
  encre: 'Ink', creme: 'Cream', brun: 'Brown', rouge: 'Red', orange: 'Orange', ambre: 'Amber', vert: 'Green', turquoise: 'Turquoise', bleu: 'Blue', violet: 'Purple', rose: 'Pink', gris: 'Grey',
  neutre: 'Neutral', attentif: 'Attentive', surpris: 'Surprised', excite: 'Excited', heureux: 'Happy', hilare: 'Laughing', colere: 'Angry', triste: 'Sad', effraye: 'Scared', mefiant: 'Suspicious', confus: 'Confused', curieux: 'Curious', fier: 'Proud', timide: 'Shy', blase: 'Unimpressed', somnolent: 'Sleepy',
},
  fr: {
  idle: 'Repos', thinking: 'Réflexion', wink: 'Clin d\'œil', wide: 'Grands yeux', alert: 'Alerte', notify: 'Notification', exclaim: 'Exclamation', sleep: 'Sommeil', egg: 'Œuf', hexagon: 'Hexagone', play: 'Lecture', orbit: 'Orbite', burst: 'Éclat', comet: 'Comète', swirl: 'Tourbillon',
  cercle: 'Cercle', galet: 'Galet', squircle: 'Squircle', capsule: 'Capsule', triangle: 'Triangle', hexagone: 'Hexagone', nuage: 'Nuage', goutte: 'Goutte',
  default: 'Bloub', chat: 'Chat', chien: 'Chien', fleur: 'Fleur',
  encre: 'Encre', creme: 'Crème', brun: 'Brun', rouge: 'Rouge', orange: 'Orange', ambre: 'Ambre', vert: 'Vert', turquoise: 'Turquoise', bleu: 'Bleu', violet: 'Violet', rose: 'Rose', gris: 'Gris',
  neutre: 'Neutre', attentif: 'Attentif', surpris: 'Surpris', excite: 'Excité', heureux: 'Heureux', hilare: 'Hilare', colere: 'En colère', triste: 'Triste', effraye: 'Effrayé', mefiant: 'Méfiant', confus: 'Confus', curieux: 'Curieux', fier: 'Fier', timide: 'Timide', blase: 'Blasé', somnolent: 'Somnolent',
},
});

/** Names of the states, shapes, colours and expressions, in the current language at the moment each is read. */
export const BLOUB_NAMES: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_, id) => (typeof id === 'string' ? copyOf(NAMES)[id] : undefined),
});

/** What the eye holes show: the theme's background-secondary (chat surfaces) or background-primary (cards, panels). */
const PAPER = {
  surface: { light: '#f7f7f7', dark: '#171717' },
  panel: { light: '#ffffff', dark: '#262626' },
};

export interface BloubProps {
  state?: StateId;
  size?: number;
  /** One of our characters (default, chat, chien, fleur). Wins over `shape`. A character only plays the states
   * that keep its body; any other `state` is replaced by its closest stand-in (`stateFor`). */
  variant?: BloubVariant;
  shape?: ShapeId | string;
  color?: ColorId | string;
  expression?: ExpressionId | string;
  /** Background the bloub sits on: a theme surface (default) or panel, or an explicit hex. */
  paper?: 'surface' | 'panel' | (string & {});
  /** Render this exact frame (seconds into the state), no animation loop: thumbnails. */
  frozenAt?: number;
  /** Eyes follow the pointer (rest-face states only, as in bloub). */
  follow?: boolean;
  label?: string;
  className?: string;
}

export function Bloub({ variant, ...props }: BloubProps) {
  const shape = (variant && VARIANT_SHAPE.get(variant)) ?? props.shape ?? DEFAULT_SHAPE;
  const state = stateFor(props.state ?? 'idle', shape);
  return <BloubSvg {...props} shape={shape} state={(CHARACTER_SHAPES.has(shape) && CHARACTER_TWIN[state]) || state} />;
}

function BloubSvg({ state = 'idle', size = 40, shape = DEFAULT_SHAPE, color = DEFAULT_COLOR, expression = DEFAULT_EXPRESSION, paper = 'surface', frozenAt, follow = false, label = copyOf(AVATAR).label, className }: BloubProps) {
  const { theme } = useTheme();
  const bg = paper === 'surface' ? PAPER.surface[theme] : paper === 'panel' ? PAPER.panel[theme] : paper;
  const ink = COLOR_BY_ID.get(color)?.hex ?? '#0a0a0c';
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maskId = `bloub-mask-${uid}`;

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(R, state, SHAPE_BY_ID.get(shape)?.radii ?? null, EXPRESSION_BY_ID.get(expression) ?? null);
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenAt ?? 0));
  const clock = useRef(0);
  const svg = useRef<SVGSVGElement>(null);
  const followRef = useRef(follow);
  followRef.current = follow;
  const stateRef = useRef(state);
  stateRef.current = state;

  const redrawFrozen = () => {
    if (frozenAt !== undefined) setFrame(engine.current!.sample(frozenAt));
  };

  // Props move the engine at the current clock, so it morphs instead of snapping.
  useEffect(() => {
    if (engine.current!.state === state) return;
    engine.current!.setState(state, clock.current);
    redrawFrozen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  useEffect(() => {
    engine.current!.setShape(SHAPE_BY_ID.get(shape)?.radii ?? null, clock.current);
    redrawFrozen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);
  useEffect(() => {
    engine.current!.setExpression(EXPRESSION_BY_ID.get(expression) ?? null, clock.current);
    redrawFrozen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression]);
  useEffect(() => {
    redrawFrozen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozenAt]);

  // The loop: a bounded-delta scene clock (a hidden tab resumes without jumping), pointer gaze, sample.
  useEffect(() => {
    if (frozenAt !== undefined) return;
    const e = engine.current!;
    let raf = 0;
    let last = 0;
    let pointer: { x: number; y: number } | null = null;
    let aiming = false;
    let turnSince = 0;
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== 'touch') pointer = { x: ev.clientX, y: ev.clientY };
    };
    const onLeave = () => {
      pointer = null;
    };
    const release = () => {
      if (!aiming) return;
      e.setLook(null, clock.current, TURN_TIME);
      aiming = false;
    };
    const aim = () => {
      if (!STATE_BY_ID.get(stateRef.current)?.baseFace) return release();
      const box = svg.current?.getBoundingClientRect();
      // A zero box would normalise to NaN, which the engine keeps forever.
      if (!box || box.width === 0 || box.height === 0) return;
      if (!aiming) turnSince = clock.current;
      const hw = Math.max(1, window.innerWidth / 2);
      const hh = Math.max(1, window.innerHeight / 2);
      e.setLook(
        lookTarget({
          nx: pointer ? clamp((pointer.x - (box.left + box.width / 2)) / hw, -1, 1) : 0,
          ny: pointer ? clamp((pointer.y - (box.top + box.height / 2)) / hh, -1, 1) : 0,
          tour: easings.easeOutQuint(clamp((clock.current - turnSince) / TURN_TIME)),
          pointer: pointer !== null,
        }),
        clock.current,
      );
      aiming = true;
    };
    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      clock.current += dt;
      if (followRef.current) aim();
      else release();
      setFrame(e.sample(clock.current));
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [frozenAt]);

  const dot = (d: BotFrame['dots'][number], key: string) => {
    const fill = d.color ?? (d.depth === undefined ? ink : mixHex(bg, ink, d.depth));
    return d.d ? <path key={key} d={d.d} fill={fill} opacity={d.opacity} transform={`translate(${d.x} ${d.y}) rotate(${d.rot ?? 0}) scale(${R})`} /> : <circle key={key} cx={d.x} cy={d.y} r={d.r} fill={fill} opacity={d.opacity} />;
  };

  return (
    <svg ref={svg} width={size} height={size} viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`} role="img" aria-label={label} className={className}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-VB} y={-VB} width={VB * 2} height={VB * 2}>
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, i) => (
            <path key={i} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000" />
          ))}
          {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000" />}
        </mask>
        {frame.arcs.map((arc) => (
          <linearGradient key={arc.id} id={`${uid}-${arc.id}`} gradientUnits="userSpaceOnUse" x1={arc.grad.x1} y1={arc.grad.y1} x2={arc.grad.x2} y2={arc.grad.y2}>
            {arc.grad.stops.map((c, i) => (
              <stop key={i} offset={i / (arc.grad.stops.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
      </defs>

      {/* Back half of the rings: drawn before the body, so it hides them. */}
      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`b${arc.id}`} d={arc.back} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>
      {frame.dotsBehind && <g>{frame.dots.map((d, i) => dot(d, `pb${i}`))}</g>}

      <g opacity={frame.bodyAlpha}>
        <path d={frame.bodyPath} fill={bg} />
        <g mask={`url(#${maskId})`}>
          <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill={ink} style={{ transition: 'fill 300ms ease' }} />
        </g>
      </g>

      {!frame.dotsBehind && <g>{frame.dots.map((d, i) => dot(d, `pf${i}`))}</g>}
      {frame.notif && <circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE} />}

      <g fill="none" strokeLinecap="round">
        {frame.arcs.map((arc) => (
          <path key={`f${arc.id}`} d={arc.front} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
        ))}
      </g>
    </svg>
  );
}
