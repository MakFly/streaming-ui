import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Brain, Check, ChevronDown, ChevronRight, Copy, Flag, LoaderCircle, Moon, MoreHorizontal, Pencil, RefreshCw, Reply, Sun, TextCursorInput, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { PalettePicker } from '@/components/palette-picker';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AgentLog } from './primitives';
import { ThinkingIndicator, ThinkingPicker } from './thinking-style';
import { COMPOSER_VARIANTS, useComposerChoice, type ComposerChoice } from './composer-variant';
import { EXTENSIONS, isExtension } from './variants';
import { Markdown, type Decorate } from './markdown';
import type { Message, Part, ReplyRef } from './engine';
import { Quote } from './reply';

/* Building blocks shared by every chat template:
 * - shell and surfaces of an agent chat (rounded-3xl cards on the full background, glass header),
 * - thread anatomy (44–48rem column, bubble-less assistant turns, action bar),
 * - agent steps, frames and badges (Trace, Frame, light badges). */

/* ------------------------------------------------------------------ small primitives */

export function IconButton({ label, onClick, children, className, active }: { label: string; onClick?: () => void; children: ReactNode; className?: string; active?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-[color,background-color,scale] outline-none hover:bg-background-tertiary-default hover:text-foreground-icon-primary dark:hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring active:scale-90 [&_svg]:size-4',
            active && 'bg-background-tertiary-default text-foreground-icon-primary',
            className,
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Light / dark switch for template headers; the choice is shared with the site and every preview frame. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <IconButton label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'} onClick={toggleTheme} className={className}>
      {theme === 'dark' ? <Sun className="animate-in spin-in-45 fade-in-0 duration-300" /> : <Moon className="animate-in spin-in-45 fade-in-0 duration-300" />}
    </IconButton>
  );
}

const BADGE_TONES = {
  neutral: 'border-border-button-default bg-background-tertiary-default text-text-secondary',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  danger: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  purple: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400',
  outline: 'border-border-button-default bg-background-primary-default text-text-secondary',
};

/** Badge: h-5, rounded-sm, light status tones. */
export function Badge({ tone = 'neutral', round, dot, children, className }: { tone?: keyof typeof BADGE_TONES; round?: boolean; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-5 shrink-0 items-center gap-1 border px-1.5 text-caption-1-medium whitespace-nowrap [&_svg]:size-3', round ? 'rounded-full' : 'rounded-[5px]', BADGE_TONES[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Frame: a muted tray (header / footer chrome) around white inset panels with concentric radii. */
export function Frame({ children, className, messageId }: { children: ReactNode; className?: string; /** Makes the frame a reply target: a quote of it scrolls back here. */ messageId?: string }) {
  return <div data-message-id={messageId} className={cn('tpl-reveal flex flex-col gap-[3px] rounded-2xl border border-border-button-default bg-background-tertiary-default/70 p-[3px]', className)}>{children}</div>;
}
export function FrameHeader({ icon, title, children, className }: { icon?: ReactNode; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-8 items-center gap-2 px-2.5 py-1 text-body-2-semibold text-text-primary [&>svg]:size-4 [&>svg]:text-foreground-icon-secondary', className)}>
      {icon}
      <span className="min-w-0 truncate">{title}</span>
      {children && <span className="ms-auto flex shrink-0 items-center gap-1.5">{children}</span>}
    </div>
  );
}
export function FramePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-[13px] border border-border-button-default bg-background-primary-default shadow-xs', className)}>{children}</div>;
}
export function FrameFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-9 items-center gap-2 px-2 py-1', className)}>{children}</div>;
}

/** Circle with initials, coloured from the label. */
export function Avatar({ label, className, color }: { label: string; className?: string; color?: string }) {
  const palette = ['#2563eb', '#16a34a', '#db2777', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04'];
  const c = color ?? palette[[...label].reduce((a, ch) => a + ch.charCodeAt(0), 0) % palette.length];
  const initials = label.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className={cn('grid size-8 shrink-0 place-items-center rounded-full text-caption-1-semibold text-white ring-2 ring-background-primary-default', className)} style={{ backgroundColor: c }} aria-hidden="true">
      {initials}
    </span>
  );
}

/** Ghost button for headers (`size-7 rounded-md`, icons 18px) with an optional label. */
export function HeaderButton({ children, label, onClick, outline, className }: { children: ReactNode; label?: string; onClick?: () => void; outline?: boolean; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-body-2-medium text-text-secondary transition-colors outline-none hover:bg-background-primary-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring [&_svg]:size-4 [&_svg]:shrink-0',
        outline && 'border border-border-button-default bg-background-primary-default text-text-primary shadow-xs',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ surfaces and thread scroll */

/** The page canvas: every panel sits as a rounded card on the full background. */
export function Canvas({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('relative flex h-full gap-2 overflow-hidden bg-background-full p-1.5 text-text-primary sm:p-2 lg:gap-3 lg:p-3', className)}>{children}</div>;
}

export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  // The inset hairline keeps the corners (16px on phones, 24px above) readable on the white canvas (neutral-100 on white is faint).
  return <section className={cn('relative isolate flex min-h-0 min-w-0 flex-col overflow-hidden bg-background-secondary-default tpl-surface rounded-2xl sm:rounded-3xl', className)}>{children}</section>;
}

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

/**
 * A desktop side rail that opens and closes in place: the slot animates its width (so the chat beside it
 * reflows smoothly), the rail slides a few pixels toward its edge, fades and blurs. The canvas gap goes with
 * it through a negative margin. Children keep their own width; the slot only clips them.
 */
export function SideRail({ open, width, side = 'start', className, children }: { open: boolean; width: number; side?: 'start' | 'end'; className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn('shrink-0 overflow-hidden transition-[width,margin,opacity] duration-300', EASE, open ? 'opacity-100' : cn('opacity-0', side === 'start' ? '-me-2 lg:-me-3' : '-ms-2 lg:-ms-3'), className)}
      style={{ width: open ? width : 0 }}
    >
      <div
        className={cn('h-full transition-[translate,filter] duration-300', EASE, open ? 'translate-x-0 blur-0' : cn('blur-[2px]', side === 'start' ? '-translate-x-4' : 'translate-x-4'))}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A mobile drawer over the template: the backdrop fades, the panel slides in from its edge, and closing plays
 * the same motion backwards before unmounting. Backdrop click and Escape close it.
 */
export function Drawer({ open, onClose, side = 'start', className, children }: { open: boolean; onClose: () => void; side?: 'start' | 'end'; className?: string; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Render once at the closed position first, so the transition has somewhere to start from. A timer,
      // not animation frames, so the drawer still opens in a tab that is not painting.
      const id = window.setTimeout(() => setShown(true), 20);
      return () => window.clearTimeout(id);
    }
    setShown(false);
    const id = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(id);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    // Capture phase: Escape closes the drawer before the Live preview's own Escape (exit) handler sees it;
    // preventDefault tells that handler the key was used.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);
  if (!mounted) return null;
  return (
    <div className={cn('absolute inset-0 z-30 flex rounded-[inherit] p-2', side === 'end' && 'justify-end', className)}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className={cn('absolute inset-0 cursor-default rounded-[inherit] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300', EASE, shown ? 'opacity-100' : 'opacity-0')} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative h-full overflow-hidden rounded-2xl shadow-dropdown transition-[translate,opacity] duration-300', EASE, shown ? 'translate-x-0 opacity-100' : cn('opacity-0', side === 'start' ? '-translate-x-[calc(100%+0.5rem)]' : 'translate-x-[calc(100%+0.5rem)]'))}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Entry slides for the panes small screens swap between (one pane at a time below md / lg). The pane coming
 * from further right slides in from the end, the one you go back to from the start; display:none → flex
 * restarts the animation on every switch. Literal strings so Tailwind sees every class.
 */
export const paneIn = {
  mdStart: 'max-md:animate-in max-md:fade-in-0 max-md:slide-in-from-left-6 max-md:duration-300',
  mdEnd: 'max-md:animate-in max-md:fade-in-0 max-md:slide-in-from-right-6 max-md:duration-300',
  lgStart: 'max-lg:animate-in max-lg:fade-in-0 max-lg:slide-in-from-left-6 max-lg:duration-300',
  lgEnd: 'max-lg:animate-in max-lg:fade-in-0 max-lg:slide-in-from-right-6 max-lg:duration-300',
};

/** Keeps a scroll container pinned to the bottom while content streams in, unless the reader scrolled up. */
export function useThreadScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  const pinned = useRef(true);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      pinned.current = bottom;
      setAtBottom(bottom);
      setScrolled(el.scrollTop > 4);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [dep]);
  const toBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    pinned.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);
  return { ref, scrolled, atBottom, toBottom };
}

/**
 * A chat surface: glass header that frosts once content scrolls under it, a centred column,
 * and a footer floating over the thread's bottom on its own glass.
 */
export function ChatSurface({
  header,
  footer,
  children,
  dep,
  width = 'max-w-3xl',
  empty,
  className,
  columnClassName,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  dep: unknown;
  width?: string;
  empty?: boolean;
  className?: string;
  columnClassName?: string;
}) {
  const { ref, scrolled } = useThreadScroll<HTMLDivElement>(dep);
  // The footer floats over the thread (ChatGPT-style): the column keeps its height free at the bottom, so the
  // last line still ends above the composer and only scrolled-up content passes under the glass.
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerH, setFooterH] = useState(0);
  useLayoutEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFooterH(el.offsetHeight));
    ro.observe(el);
    setFooterH(el.offsetHeight);
    return () => ro.disconnect();
    // Truthiness, not `!= null`: templates pass `footer={!empty && composer}`, and `false` must count as no footer.
  }, [!!footer]);
  return (
    // --chat-glass: the surface colour the glass tints with (a caller that repaints the surface sets it too).
    <Surface className={cn('flex-1 [--chat-glass:var(--color-background-secondary-default)]', className)}>
      {header && (
        <header
          className={cn(
            // Rounded itself: a backdrop-filter layer escapes the parent's overflow clip in Chromium and would square the corners.
            'absolute inset-x-0 top-0 z-10 flex h-12 items-center gap-1.5 rounded-t-2xl px-2.5 sm:rounded-t-3xl sm:px-3',
          )}
        >
          {/* The glass, the bottom one mirrored: once the thread scrolls under, blur and tint fade out over 2rem below
              the bar instead of stopping on a hard edge. Solid where transparency is turned down. */}
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 -bottom-8 -z-10 rounded-[inherit] bg-[linear-gradient(to_top,transparent,color-mix(in_srgb,var(--chat-glass)_78%,transparent)_2rem)] backdrop-blur-md backdrop-saturate-150 transition-opacity duration-300 [mask-image:linear-gradient(to_top,transparent,black_2rem)] [@media(prefers-reduced-transparency:reduce)]:bg-[linear-gradient(to_top,transparent,var(--chat-glass)_2rem)]',
              scrolled ? 'opacity-100' : 'opacity-0',
            )}
          />
          {header}
        </header>
      )}
      <div ref={ref} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn('mx-auto flex w-full flex-col gap-6 px-4 pb-8', width, header ? 'pt-[68px]' : 'pt-5', empty && 'min-h-full justify-center pb-24', columnClassName)}
          style={footer ? { paddingBottom: footerH + (empty ? 48 : 32) } : undefined}
        >
          {children}
        </div>
      </div>
      {footer && (
        <div ref={footerRef} className="absolute inset-x-0 bottom-0 z-10 rounded-[inherit] px-2.5 pb-2.5 sm:px-3 sm:pb-3">
          {/* The glass: blur and tint fade in over 2rem above the composer, so lines slide under it instead of being cut. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 rounded-[inherit] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--chat-glass)_78%,transparent)_2rem)] backdrop-blur-md backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,transparent,black_2rem)] [@media(prefers-reduced-transparency:reduce)]:bg-[linear-gradient(to_bottom,transparent,var(--chat-glass)_2rem)]"
          />
          <div className={cn('relative mx-auto w-full', width)}>{footer}</div>
        </div>
      )}
    </Surface>
  );
}

/* ------------------------------------------------------------------ messages */

/** User turn: right-aligned in a 72px-gutter grid, edit button beside the bubble on hover.
 *  The bubble is a white card on the grey chat surface. */
/** One line of a message for a reply: its text without Markdown marks, cut at a word. */
export function excerptOf(m: Message | string, max = 120) {
  const t = (typeof m === 'string' ? m : textOf(m)).replace(/[*_`#>]/g, '').replace(/^\s*[-•]\s+/gm, '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 60 ? cut.lastIndexOf(' ') : max).trimEnd()}…`;
}

/** Scrolls to a quoted message and flashes it, so the reader sees what the reply answers. */
export function revealMessage(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.animate([{ backgroundColor: 'color-mix(in srgb, var(--color-accent-500) 14%, transparent)' }, { backgroundColor: 'transparent' }], { duration: 1400, easing: 'ease-out' });
}

export { Quote, ReplyChip } from './reply';

/** A message as the quote of a reply: its id, one line of it, and who said it. */
export const replyRefOf = (m: Message, label?: string): ReplyRef => ({ id: m.id, text: excerptOf(m), label });

export function UserMessage({ children, onEdit, replyTo, className }: { children: ReactNode; onEdit?: () => void; /** The message this one answers: shown as a quote that scrolls back to it. */ replyTo?: ReplyRef; className?: string }) {
  return (
    <div className={cn('group/user animate-in fade-in-0 slide-in-from-bottom-1 grid grid-cols-[minmax(72px,1fr)_minmax(0,auto)] duration-200', className)}>
      <div className="relative col-start-2 max-w-full">
        {onEdit && (
          <span className="absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-1.5 opacity-0 transition-opacity group-hover/user:opacity-100 rtl:translate-x-full">
            <IconButton label="Edit" onClick={onEdit}>
              <Pencil />
            </IconButton>
          </span>
        )}
        <div className="rounded-2xl bg-background-primary-default px-3.5 py-[11px] text-body-regular leading-6 break-words whitespace-pre-wrap text-text-primary shadow-card">
          {replyTo && (
            <button type="button" onClick={() => revealMessage(replyTo.id)} title="Show the quoted message" className="mb-1.5 flex w-[18rem] max-w-full cursor-pointer rounded-sm text-start outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring sm:w-[22rem]">
              <Quote text={replyTo.text} />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export const textOf = (m: Message) => m.parts.map((p) => (p.kind === 'text' ? p.text : '')).join('\n\n');

/** The action bar's last button: "…" opens the less frequent actions (Markdown copy, read aloud, report). */
function MoreActions({ message, onReport }: { message: Message; onReport: () => void }) {
  const item = 'flex items-center gap-2 rounded-md py-1.5 text-body-2-regular [&_svg]:size-4 [&_svg]:text-foreground-icon-tertiary';
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-[color,background-color,scale] outline-none hover:bg-background-tertiary-default hover:text-foreground-icon-primary dark:hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring active:scale-90 data-[state=open]:bg-background-tertiary-default data-[state=open]:text-foreground-icon-primary [&_svg]:size-4"
            >
              <MoreHorizontal />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>More</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-48 p-1">
        <DropdownMenuItem className={item} onSelect={() => void navigator.clipboard?.writeText(textOf(message)).catch(() => {})}>
          <Copy /> Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem
          className={item}
          onSelect={() => {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(textOf(message).replace(/[*_`#>-]/g, '')));
          }}
        >
          <Volume2 /> Read aloud
        </DropdownMenuItem>
        <DropdownMenuItem className={item} onSelect={onReport}>
          <Flag /> Report a problem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Action bar: copy (check swap), feedback, regenerate, then "…" for the rest. Hidden on older turns until hover. */
export function ActionBar({ message, isLast, onRegenerate, onReply, extra }: { message: Message; isLast?: boolean; onRegenerate?: () => void; /** Shows Reply: quote this message in the composer. */ onReply?: () => void; extra?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <div className={cn('-ms-1 flex items-center gap-0.5 pt-1 transition-opacity duration-200', !isLast && 'opacity-0 group-hover/message:opacity-100 focus-within:opacity-100')}>
      <IconButton
        label={copied ? 'Copied' : 'Copy'}
        onClick={() => {
          void navigator.clipboard?.writeText(textOf(message)).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? <Check className="animate-in zoom-in-50 fade-in-0 duration-200" /> : <Copy />}
      </IconButton>
      <IconButton label="Good response" active={vote === 'up'} onClick={() => setVote((v) => (v === 'up' ? null : 'up'))}>
        <ThumbsUp />
      </IconButton>
      <IconButton label="Bad response" active={vote === 'down'} onClick={() => setVote((v) => (v === 'down' ? null : 'down'))}>
        <ThumbsDown />
      </IconButton>
      {onReply && (
        <IconButton label="Reply" onClick={onReply}>
          <Reply />
        </IconButton>
      )}
      {onRegenerate && (
        <IconButton label="Regenerate" onClick={onRegenerate}>
          <RefreshCw />
        </IconButton>
      )}
      {extra}
      <MoreActions message={message} onReport={() => setVote('down')} />
    </div>
  );
}

/** Reasoning: Agent Thinking while it runs, with each step on the agent-log trail;
 *  then a ghost disclosure "Thought for Ns", folded. */
export function Reasoning({ part }: { part: Extract<Part, { kind: 'thinking' }> }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (part.done) setOpen(false);
  }, [part.done]);
  return (
    <div className="flex flex-col">
      {part.done ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-fit origin-left items-center gap-2 py-1 text-body-2-medium text-text-secondary transition-[color,scale] hover:text-text-primary active:scale-[0.98]"
        >
          <Brain className="size-4" />
          Thought for {part.seconds}s
          <ChevronDown className={cn('size-4 transition-transform duration-200', !open && '-rotate-90')} />
        </button>
      ) : (
        <ThinkingIndicator label={part.label} small className="py-1" />
      )}
      {open && part.steps.length > 0 && (
        <AgentLog className="ms-[7px] mt-1">
          {part.steps.map((s) => (
            <span key={s} className="text-body-2-regular text-text-tertiary">
              {s}
            </span>
          ))}
        </AgentLog>
      )}
    </div>
  );
}

/** Trace line: icon, title (shimmering while it runs), a muted description, and an optional fold
 *  whose body hangs off a left rule. */
export function TraceRow({ part, icon, title, children }: { part: Extract<Part, { kind: 'tool' }>; icon?: ReactNode; title?: ReactNode; children?: ReactNode }) {
  const body = children ?? (part.output?.length ? <TraceOutput lines={part.output} /> : null);
  const [open, setOpen] = useState(false);
  const running = part.status === 'running';
  const line = (
    <>
      <span className="grid size-4 shrink-0 place-items-center [&_svg]:size-4">{running ? <LoaderCircle className="animate-spin" /> : icon}</span>
      <span className={cn('min-w-0 truncate', running && 'agent-progress-loading-text')}>
        {title ?? (
          <>
            <span className="text-text-primary">{part.name}</span>
            {part.arg && <span className="ms-1.5 font-mono text-[12.5px]">{part.arg}</span>}
          </>
        )}
      </span>
      {part.meta && <span className={cn('shrink-0 tabular-nums', part.status === 'error' ? 'text-text-error-primary' : 'text-text-tertiary')}>{part.meta}</span>}
      {body && <ChevronRight className={cn('size-3.5 shrink-0 transition-transform duration-200', open && 'rotate-90')} />}
    </>
  );
  const cls = cn('flex w-fit max-w-full items-center gap-2 text-body-2-regular text-text-secondary', part.status === 'error' && 'text-text-error-primary');
  return (
    <div className="tpl-reveal">
      {body ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn(cls, 'transition-colors hover:text-text-primary')}>
          {line}
        </button>
      ) : (
        <div className={cls}>{line}</div>
      )}
      {body && open && <div className="animate-in fade-in-0 mt-2 mb-1 ms-[7px] border-s border-separator-border ps-4 duration-200">{body}</div>}
    </div>
  );
}

export function TraceOutput({ lines }: { lines: string[] }) {
  return (
    <pre className="scrollbar-thin max-h-56 overflow-auto rounded-lg border border-border-button-default bg-background-primary-default px-3 py-2 font-mono text-[12px] leading-5 text-text-secondary">
      {lines.map((l, i) => (
        <div key={i} className={cn(/✓|pass/i.test(l) && 'text-emerald-600 dark:text-emerald-400', /✗|fail|error/i.test(l) && 'text-text-error-primary')}>
          {l || ' '}
        </div>
      ))}
    </pre>
  );
}

/** An assistant turn: no bubble, parts in order, Agent Thinking until the first part lands,
 *  then the action bar once it is done. */
export function AssistantMessage({
  message,
  isLast,
  renderCustom,
  toolIcon,
  actions = true,
  onRegenerate,
  onReply,
  className,
  textClassName,
  decorate,
}: {
  message: Message;
  isLast?: boolean;
  renderCustom?: (part: Extract<Part, { kind: 'custom' }>) => ReactNode;
  toolIcon?: (name: string) => ReactNode;
  actions?: boolean;
  onRegenerate?: () => void;
  /** Adds Reply to the action bar (quote this answer in the composer). */
  onReply?: (ref: ReplyRef) => void;
  className?: string;
  textClassName?: string;
  /** Enriches plain text runs, e.g. mention chips. */
  decorate?: Decorate;
}) {
  return (
    <div data-message-id={message.id} className={cn('group/message flex min-w-0 flex-col gap-3 rounded-lg', className)}>
      {message.parts.map((p) => {
        if (p.kind === 'thinking') return <Reasoning key={p.id} part={p} />;
        if (p.kind === 'tool') return <TraceRow key={p.id} part={p} icon={toolIcon?.(p.name)} />;
        if (p.kind === 'text') return <Markdown key={p.id} text={p.text.slice(0, p.shown)} streaming={!p.done} decorate={decorate} className={textClassName} />;
        return <div key={p.id}>{renderCustom?.(p)}</div>;
      })}
      {message.parts.length === 0 && !message.done && <ThinkingIndicator className="py-1" small />}
      {actions && message.done && message.parts.some((p) => p.kind === 'text') && <ActionBar message={message} isLast={isLast} onRegenerate={onRegenerate} onReply={onReply && (() => onReply({ id: message.id, text: excerptOf(message) }))} />}
      {/* No action bar (Support Copilot's drafts carry their own buttons): Reply alone, revealed the same way. */}
      {!actions && onReply && message.done && message.parts.some((p) => p.kind === 'text') && (
        <div className={cn('-ms-1 -mt-2 flex transition-opacity duration-200', !isLast && 'opacity-0 group-hover/message:opacity-100 focus-within:opacity-100')}>
          <IconButton label="Reply" onClick={() => onReply({ id: message.id, text: excerptOf(message) })}>
            <Reply />
          </IconButton>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ composer */

export { ModelPicker } from './model-picker';

/* ------------------------------------------------------------------ composer picker */

export { Composer } from './composers';

/** Tiny schematic of each composer, drawn with the same tokens, for the picker. */
export function ComposerGlyph({ id }: { id: ComposerChoice }) {
  // The later composers draw their own schematic (kit/variants/*).
  if (id !== 'auto' && isExtension(id)) {
    const G = EXTENSIONS[id].Glyph;
    return <G />;
  }
  const box = 'relative h-8 w-14 shrink-0 overflow-hidden';
  const dot = 'absolute rounded-full';
  switch (id) {
    case 'pill':
      return (
        <span className={box}>
          <span className="absolute inset-x-0 top-2 h-4 rounded-full border border-border-button-default bg-background-primary-default" />
          <span className={cn(dot, 'top-[11px] left-1 size-2.5 bg-background-tertiary-default')} />
          <span className={cn(dot, 'top-[11px] right-1 size-2.5 bg-text-primary')} />
        </span>
      );
    case 'box':
      return (
        <span className={box}>
          <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default" />
          <span className="absolute top-2 left-2 h-0.5 w-6 rounded bg-text-tertiary/50" />
          <span className={cn(dot, 'bottom-1.5 left-1.5 size-2 bg-background-tertiary-default')} />
          <span className={cn(dot, 'right-1.5 bottom-1.5 size-2 bg-text-primary')} />
        </span>
      );
    case 'panel':
      return (
        <span className={box}>
          <span className="absolute inset-0 rounded-md bg-composer-panel-rail-background" />
          <span className="absolute inset-x-0.5 top-0.5 h-5 rounded-[5px] border border-border-button-default bg-background-primary-default" />
          <span className="absolute bottom-0.5 left-1 h-1.5 w-3 rounded-full bg-background-primary-default" />
          <span className="absolute bottom-0.5 left-[18px] h-1.5 w-3 rounded-full bg-text-tertiary/30" />
          <span className={cn(dot, 'top-[13px] right-1.5 size-1.5 bg-text-primary')} />
        </span>
      );
    case 'dock':
      return (
        <span className={box}>
          <span className="absolute inset-x-0 top-1.5 h-5 rounded-md border border-border-button-default bg-background-primary-default shadow-xs" />
          <span className="absolute top-[9px] left-1 h-3 w-4 rounded-[3px] bg-background-tertiary-default" />
          <span className="absolute top-[9px] right-1 size-3 rounded-[3px] bg-accent-500" />
          <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded bg-text-tertiary/40" />
        </span>
      );
    case 'command':
      return (
        <span className={box}>
          <span className="absolute inset-0.5 rounded-md border border-border-button-default bg-background-primary-default" />
          <span className="absolute top-1.5 left-2 font-mono text-[9px] leading-none text-accent-500">❯</span>
          <span className="absolute top-[7px] left-4 h-0.5 w-5 rounded bg-text-tertiary/50" />
          <span className="absolute inset-x-1 bottom-2 border-t border-dashed border-separator-border" />
        </span>
      );
    default:
      return (
        <span className={cn(box, 'grid place-items-center rounded-md border border-dashed border-border-button-default text-caption-2-medium text-text-tertiary')}>auto</span>
      );
  }
}

/** Swaps the composer of every template (saved, shared with the other preview frames). */
export function ComposerPicker({ className }: { className?: string }) {
  const { choice, setChoice } = useComposerChoice();
  const items: { id: ComposerChoice; name: string; hint: string }[] = [{ id: 'auto', name: 'Template default', hint: 'Each template keeps its own composer' }, ...COMPOSER_VARIANTS.map((v) => ({ id: v.id, name: v.name, hint: `${v.from} · ${v.hint}` }))];
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Composer style" className={cn('grid size-7 shrink-0 place-items-center rounded-md text-foreground-icon-tertiary transition-colors outline-none hover:bg-background-tertiary-default hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring data-[state=open]:bg-background-tertiary-default', className)}>
              <TextCursorInput className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Composer style</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="scrollbar-thin max-h-[min(70vh,600px)] w-80 overflow-y-auto p-1.5">
        <p className="px-2 pt-1 pb-2 text-caption-1-medium text-text-tertiary">Composer · applies to every template</p>
        {items.map((it) => (
          <DropdownMenuItem key={it.id} onSelect={() => setChoice(it.id)} className="flex items-center gap-3 rounded-lg py-2">
            <ComposerGlyph id={it.id} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body-2-medium text-text-primary">{it.name}</span>
              <span className="truncate text-caption-1-regular text-text-tertiary">{it.hint}</span>
            </span>
            {choice === it.id && <Check className="size-4 shrink-0 text-text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The controls every template header ends with: composer style, thinking style and theme. */
export function HeaderTools() {
  return (
    <>
      <ComposerPicker />
      <ThinkingPicker />
      <PalettePicker className="size-8 rounded-lg" />
      <ThemeToggle />
    </>
  );
}

/* ------------------------------------------------------------------ welcome and suggestions */

export function Welcome({ icon, title, subtitle, children }: { icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 flex flex-col items-center gap-4 text-center duration-300">
      {icon}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-title-2-medium tracking-[-0.01em] text-text-primary">{title}</h2>
        {subtitle && <p className="text-body-regular text-text-secondary">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Suggestion pills (`pills`), or a numbered list (`list`). */
export function Suggestions({ items, onPick, variant = 'pills', decorate, className }: { items: (string | { title: string; hint?: string })[]; onPick: (s: string) => void; variant?: 'pills' | 'list'; decorate?: Decorate; className?: string }) {
  const norm = items.map((s) => (typeof s === 'string' ? { title: s, hint: undefined } : s));
  if (variant === 'list')
    return (
      <div className={cn('flex w-full flex-col', className)}>
        {norm.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onPick(s.title)}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both flex w-full items-baseline gap-2.5 rounded-lg px-2 py-2 text-start text-body-2-regular transition-colors outline-none hover:bg-background-tertiary-default focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <span className="font-mono text-caption-1-regular text-text-tertiary group-hover:text-text-primary">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1 truncate">
              <span className="text-text-primary">{decorate ? decorate(s.title) : s.title}</span>
              {s.hint && <span className="ms-1.5 text-text-tertiary">{s.hint}</span>}
            </span>
          </button>
        ))}
      </div>
    );
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {norm.map((s, i) => (
        <button
          key={s.title}
          type="button"
          onClick={() => onPick(s.title)}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both rounded-full bg-background-primary-default px-3.5 py-2 text-body-2-medium text-text-secondary shadow-xs transition-colors duration-300 hover:bg-background-primary-hover hover:text-text-primary"
        >
          {decorate ? decorate(s.title) : s.title}
        </button>
      ))}
    </div>
  );
}
