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
  /** Component library index (BoardUI-style sidebar layout), and its single-component pages. */
  components: (section?: string) => (section ? `/components#${section}` : '/components'),
  /** Every response collection as a card, each opening its filtered gallery. */
  collections: () => '/collections',
  /** How the rebuild prompts work and where each one lives. */
  prompts: () => '/prompts',
  /** The context-window and plan-limits card, named as in BoardUI. */
  agentLimits: () => '/components/agent-limits-card',
  /** The five interchangeable composers, each in a live thread; `#<variant>` jumps to one. */
  composers: (variant?: string) => (variant ? `/composers#${variant}` : '/composers'),
  /** Thinking-orb loaders: the nine states and a playground. */
  orbs: () => '/orbs',
  /** The composers' model picker on its own: demo, install and prompt. */
  modelPicker: () => '/model-picker',
  /** Every piece together: composer, model picker, thinking style, palette, responses, templates. */
  playground: () => '/playground',
  /** Bare template, no site chrome: what the preview iframes load. */
  templatePreview: (slug: string) => `/preview/${slug}`,
  /** Bare playground chat thread: what the playground's tablet and mobile frames load. */
  composerPreview: (variant: string) => `/preview/composer/${variant}`,
};

export type GalleryView = 'grid' | 'list';
