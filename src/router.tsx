import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/routes/root-layout';
import { NotFound, RouteError } from '@/routes/not-found';

/* Every page is its own chunk. The template iframes (/preview/:slug) then load only the template, not the
 * response engine and its 235 demos that the gallery and landing need; the main window prefetches the pages
 * while idle (prefetchRoutes) so switching from the navbar never waits on a download. */
const page = {
  landing: () => import('@/routes/landing-page'),
  gallery: () => import('@/routes/gallery-page'),
  demo: () => import('@/routes/demo-page'),
  prompt: () => import('@/routes/prompt-route'),
  templates: () => import('@/routes/templates-page'),
  template: () => import('@/routes/template-page'),
  preview: () => import('@/routes/template-preview'),
  composers: () => import('@/routes/composers-page'),
  orbs: () => import('@/routes/orbs-page'),
};
const promptIn = (from: 'gallery' | 'demo' | 'template') => async () => {
  const { PromptRoute } = await page.prompt();
  return { element: <PromptRoute from={from} /> };
};

/** Warm every site page once the browser is idle — the main window only, never inside a preview iframe. */
export function prefetchRoutes() {
  if (window.self !== window.top || window.location.pathname.includes('/preview/')) return;
  const run = () => {
    for (const load of [page.landing, page.gallery, page.templates, page.composers, page.orbs, page.demo, page.template, page.prompt]) void load();
  };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1500);
}

/**
 * /                                         landing page
 * /responses                                gallery, every library        (?q=search &view=list)
 * /responses/library/:library               gallery, one library
 * /responses/prompt/:slug                   gallery + Prompt dialog
 * /responses/library/:library/prompt/:slug  library gallery + Prompt dialog
 * /demo/:slug                     one response on its own page
 * /demo/:slug/prompt              demo page + Prompt dialog
 * /templates                      chat templates, live thumbnails
 * /templates/:slug                one template full size (device switcher)
 * /templates/:slug/prompt         template page + Prompt dialog
 * /composers                     the eleven composers, each in a live thread (#pill … #command, #compare)
 * /orbs                          thinking-orb loaders: nine-state showcase and a playground
 * /preview/:slug                  bare template, no site chrome (what the iframes load)
 * *                               404
 *
 * The gallery is one layout route with every variant as a child, so switching library or opening a prompt keeps it mounted:
 * previews keep playing instead of restarting.
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        { index: true, lazy: async () => ({ Component: (await page.landing()).LandingPage }) },
        {
          path: 'responses',
          lazy: async () => ({ Component: (await page.gallery()).GalleryPage }),
          children: [
            { index: true, element: null },
            { path: 'prompt/:slug', lazy: promptIn('gallery') },
            { path: 'library/:library', element: null },
            { path: 'library/:library/prompt/:slug', lazy: promptIn('gallery') },
          ],
        },
        {
          path: 'demo/:slug',
          lazy: async () => ({ Component: (await page.demo()).DemoPage }),
          children: [{ path: 'prompt', lazy: promptIn('demo') }],
        },
        { path: 'templates', lazy: async () => ({ Component: (await page.templates()).TemplatesPage }) },
        {
          path: 'templates/:slug',
          lazy: async () => ({ Component: (await page.template()).TemplatePage }),
          children: [{ path: 'prompt', lazy: promptIn('template') }],
        },
        { path: 'composers', lazy: async () => ({ Component: (await page.composers()).ComposersPage }) },
        { path: 'orbs', lazy: async () => ({ Component: (await page.orbs()).OrbsPage }) },
        { path: '*', element: <NotFound /> },
      ],
    },
    // Outside the root layout: no navbar inside the preview iframes.
    { path: '/preview/:slug', lazy: async () => ({ Component: (await page.preview()).TemplatePreview }), errorElement: <RouteError /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
