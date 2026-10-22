import { Outlet, ScrollRestoration } from 'react-router';
import { SiteNav } from '@/components/site-nav';

/** Root route: the site navbar on every page, then the page; scroll position is restored on back/forward. */
export function RootLayout() {
  return (
    <>
      <SiteNav />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
