import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ComposerThreadDemo } from '@/components/composers/composer-thread-demo';
import { ErrorScreen } from '@/routes/not-found';
import { COMPOSER_VARIANTS } from '@/templates/kit/composer-variant';
import { ThinkingStyleScope, type ThinkingStyle } from '@/templates/kit/thinking-style';
import { applyHead } from '@/seo/routes';

/** `/preview/composer/:variant` — the /playground chat thread on its own (?model=1 &thinking= &tools=0 &mentions=1). The playground's
 *  tablet and mobile frames load it in an iframe, so the kit's breakpoints answer to the frame's width, not the window's. */
export function ComposerPreview() {
  const { variant } = useParams();
  const [q] = useSearchParams();
  const meta = COMPOSER_VARIANTS.find((v) => v.id === variant);

  useEffect(() => {
    applyHead({ title: `${meta?.name ?? 'Composer'} · Preview`, description: 'Composer preview', path: `/preview/composer/${variant}`, robots: 'noindex, nofollow' });
  }, [meta, variant]);

  // Like the template previews: no scrollbar, it reads as the app.
  useEffect(() => {
    document.documentElement.classList.add('no-scrollbars');
    return () => document.documentElement.classList.remove('no-scrollbars');
  }, []);

  if (!meta) return <ErrorScreen status={404} bare />;
  return (
    <div className="h-dvh bg-background-full">
      <ThinkingStyleScope value={(q.get('thinking') ?? 'dots') as ThinkingStyle}>
        <ComposerThreadDemo variant={meta.id} modelPicker={q.get('model') === '1'} tools={q.get('tools') !== '0'} mentions={q.get('mentions') === '1'} autoplay={false} width="max-w-[44rem]" className="h-full rounded-none! bg-background-full! [--chat-glass:var(--color-background-full)] shadow-none! sm:rounded-none! [&>header]:rounded-none!" />
      </ThinkingStyleScope>
    </div>
  );
}
