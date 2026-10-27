import { useEffect } from 'react';
import { ShowcaseSection } from '@/components/docs/showcase';
import { DemoPreview } from '@/components/landing/demo-preview';
import { demos, libraries } from '@/engine/registry';
import { paths } from '@/lib/paths';
import { COLLECTIONS, applyHead } from '@/seo/routes';

/* `/collections`: every response collection as a BoardUI showcase card, its first response playing as the preview.
 * A card opens the gallery filtered to that collection. */

const firstOf = new Map(libraries.map((l) => [l.slug, demos.find((d) => d.library.slug === l.slug)!]));

export function CollectionsPage() {
  useEffect(() => {
    applyHead(COLLECTIONS);
  }, []);

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-title-1-medium text-text-primary">Collections</h1>
        <p className="max-w-2xl text-headline-medium text-text-secondary">
          {demos.length} responses across {libraries.length} collections. Each collection renders in its own theme, so the differences stay visible.
        </p>
      </header>
      <ShowcaseSection
        id="collections"
        title="Collections"
        text="Open one to browse its responses."
        cards={libraries.map((l) => ({
          name: l.name,
          text: `${l.count} responses`,
          to: paths.gallery(l.slug),
          preview: <DemoPreview demo={firstOf.get(l.slug)!} scale={0.5} className="size-full" />,
        }))}
      />
    </div>
  );
}
