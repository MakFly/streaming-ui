import type { ReactNode } from 'react';
import { Link } from 'react-router';

/* BoardUI's /components grid, shared by the library index pages (/components, /collections): titled sections of
 * showcase cards, each a live (but inert) preview on top, name and one line below, the whole card a link. */

export type ShowcaseCardProps = { name: string; text: string; to: string; preview: ReactNode };

/** BoardUI's landing-showcase-card: hairline ring that thickens on hover, transparent in dark. */
export function ShowcaseCard({ name, text, to, preview }: ShowcaseCardProps) {
  return (
    <article className="group/card relative h-[332px] overflow-hidden rounded-[28px] bg-background-primary-default transition-shadow duration-[280ms] [container-type:inline-size] after:pointer-events-none after:absolute after:inset-0 after:z-[60] after:rounded-[inherit] after:border after:border-border-button-default after:transition-[border-color,box-shadow] after:duration-[280ms] after:content-[''] xl:h-[299px] dark:bg-transparent dark:after:border-white/8 sm:[@media(hover:hover)]:hover:after:border-border-button-hover sm:[@media(hover:hover)]:hover:after:shadow-[inset_0_0_0_2px_var(--color-border-button-hover)] sm:focus-within:after:border-border-button-hover sm:focus-within:after:shadow-[inset_0_0_0_2px_var(--color-border-button-hover)]">
      {/* inert: the previews are live components, but the card is one link. */}
      <div inert className="relative h-[230px] w-full overflow-hidden xl:h-[197px]">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">{preview}</div>
      </div>
      <div className="flex flex-col gap-1 px-5 pt-3 pb-5">
        <h3 className="text-headline-medium text-text-primary">{name}</h3>
        <p className="line-clamp-2 text-headline-regular text-pretty text-text-secondary">{text}</p>
      </div>
      <Link to={to} aria-label={`View ${name}`} className="absolute inset-0 z-50 rounded-[25px] outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-inset">
        <span className="sr-only">View {name}</span>
      </Link>
    </article>
  );
}

export function ShowcaseSection({ id, title, text, cards }: { id: string; title: string; text: string; cards: ShowcaseCardProps[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-10 flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <h2 id={`${id}-title`} className="text-title-2-medium text-text-primary">
          {title}
        </h2>
        <span className="text-body-medium text-text-tertiary">{cards.length}</span>
        <span className="hidden text-body-regular text-text-tertiary sm:inline">{text}</span>
      </div>
      <div className="grid w-full grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-[repeat(3,304px)]">
        {cards.map((c) => (
          <ShowcaseCard key={c.name} {...c} />
        ))}
      </div>
    </section>
  );
}
