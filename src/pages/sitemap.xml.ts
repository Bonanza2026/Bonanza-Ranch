import { languagePages, siteUrl } from '../../site.config.mjs';

export function GET() {
  // Language alternatives are declared in SiteLayout's HTML head.
  // Keep this document in the base sitemap format for XML viewers and crawlers.
  const entries = languagePages.flatMap((pages) =>
    Object.values(pages).map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n  </url>`),
  );
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
