import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { prefetchRoutes, router } from '@/router';
import { ThemeProvider } from '@/providers/theme-provider';
import { PlaybackProvider } from '@/providers/playback-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/styles/index.css';

// Providers sit above the router so the error route renders with the same header and theme.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PlaybackProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </PlaybackProvider>
    </ThemeProvider>
  </StrictMode>,
);

prefetchRoutes();
