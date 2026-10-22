/** Every URL the app builds, in one place (see src/router.tsx for the route tree). */
export const paths = {
  home: () => '/',
  gallery: (library?: string) => (library ? `/responses/library/${library}` : '/responses'),
  galleryPrompt: (slug: string, library?: string) => `${library ? `/responses/library/${library}` : '/responses'}/prompt/${slug}`,
  demo: (slug: string) => `/demo/${slug}`,
  demoPrompt: (slug: string) => `/demo/${slug}/prompt`,
  templates: () => '/templates',
  template: (slug: string) => `/templates/${slug}`,
  templatePrompt: (slug: string) => `/templates/${slug}/prompt`,
  /** The five interchangeable composers, each in a live thread; `#<variant>` jumps to one. */
  composers: (variant?: string) => (variant ? `/composers#${variant}` : '/composers'),
  /** Bare template, no site chrome: what the preview iframes load. */
  templatePreview: (slug: string) => `/preview/${slug}`,
};

export type GalleryView = 'grid' | 'list';
