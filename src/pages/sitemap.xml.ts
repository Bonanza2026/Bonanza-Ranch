import { languagePages, siteUrl } from '../../site.config.mjs';

export function GET() {
  const entries = languagePages.flatMap((pages) =>
    Object.values(pages).map((path) => `<url><loc>${siteUrl}${path}</loc>${Object.entries(pages).map(([lang, alternate]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl}${alternate}"/>`).join('')}</url>`),
  );
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('\n')}</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
