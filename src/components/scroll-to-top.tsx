import { useEffect, useState } from 'react';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

/** Past this many pixels down, the button shows: about two screens of cards. */
const SHOW_AFTER = 1200;

/** Floating "back to top" for long pages: hidden near the top, a smooth scroll up (instant with reduced motion). */
export function ScrollToTop({ className }: { className?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const up = () => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
  };
  return (
    <button
      type="button"
      onClick={up}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={cn(
        'fixed end-6 bottom-6 z-40 grid size-10 place-items-center rounded-full border border-border-button-default bg-background-primary-default text-foreground-icon-secondary shadow-dropdown transition-[opacity,translate,color] duration-200 outline-none hover:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring',
        shown ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
    >
      <Icon name="arrow-up-line" className="size-5" />
    </button>
  );
}
