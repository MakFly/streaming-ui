// After vite build, write one index.html per public route so a crawler that does not run
// JavaScript still sees that route's title, description and canonical URL. The body stays
// the SPA shell. Demo pages are not pre-rendered: there are 247 of them and their copy
// lives in the engine, which this script cannot import (import.meta.glob).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { templates } from '../src/templates/registry.ts';
import { SITE, STATIC_PAGES, clip } from '../src/seo/routes.ts';

const dist = process.argv[2] || 'dist';
const shell = readFileSync(join(dist, 'index.html'), 'utf8');

const pages = [
  ...STATIC_PAGES,
  ...templates.map((t) => ({
    path: `/templates/${t.slug}`,
    title: `${t.name} · Streaming UI`,
    description: t.description,
  })),
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const setTag = (html, attr, key, content) => {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`index.html is missing <meta ${attr}="${key}">`);
  return html.replace(re, `$1${esc(content)}$2`);
};

const render = (page) => {
  const url = `${SITE}${page.path === '/' ? '/' : page.path}`;
  const description = clip(page.description);
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setTag(html, 'name', 'description', description);
  html = setTag(html, 'property', 'og:title', page.title);
  html = setTag(html, 'property', 'og:description', description);
  html = setTag(html, 'property', 'og:url', url);
  html = setTag(html, 'name', 'twitter:title', page.title);
  html = setTag(html, 'name', 'twitter:description', description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  return html;
};

for (const page of pages) {
  const html = render(page);
  if (page.path === '/') {
    writeFileSync(join(dist, 'index.html'), html);
    continue;
  }
  const dir = join(dist, page.path.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const body = pages
  .map((p) => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc></url>`)
  .join('\n');
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log(`Pre-rendered ${pages.length} routes and sitemap.xml into ${dist}`);
