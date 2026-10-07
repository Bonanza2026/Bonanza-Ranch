import { geolocation, next, rewrite } from '@vercel/functions';
import { acceptsMarkdown, markdownPath } from './agent-content.mjs';
import { languagePages, siteUrl } from './site.config.mjs';
import vercelConfig from './vercel.json' with { type: 'json' };

// Only the entry URL is localized. Explicit pages negotiate their representation.
export const config = { matcher: ['/', '/de', '/en', '/impressum', '/en/legal', '/datenschutz', '/en/privacy'] };
const canonicalPages = new Set(languagePages.flatMap(Object.values));
const discoveryLinks = vercelConfig.headers.flatMap(rule => rule.headers).find(header => header.key === 'Link').value;

export default function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname !== '/' && !canonicalPages.has(url.pathname)) return next();
  if (url.hostname === 'bonanza-ranch.com') {
    url.hostname = 'www.bonanza-ranch.com';
    return Response.redirect(url, 308);
  }
  if (url.pathname !== '/') {
    if (!['GET', 'HEAD'].includes(request.method) || !acceptsMarkdown(request.headers.get('accept'))) return next();
    const canonical = siteUrl + url.pathname;
    url.pathname = markdownPath(url.pathname);
    // Keep the public URL and serve the existing build output without an HTTP redirect.
    return rewrite(url, { headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'X-Robots-Tag': 'index, follow',
      'Link': `<${canonical}>; rel="canonical", ${discoveryLinks}`,
    } });
  }
  const preference = request.headers.get('cookie')?.match(/(?:^|;\s*)bonanza_language=(de|en)(?:;|$)/)?.[1];
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const language = preference || (geolocation(request).country === 'DE' || local ? 'de' : 'en');
  const headers = new Headers({ 'Cache-Control': 'private, no-store', 'Vary': 'Accept, Cookie, X-Vercel-IP-Country' });
  // Keep the entry URL from serving a second copy of the German homepage.
  // Explicit language URLs are the stable destinations for users and crawlers.
  url.pathname = `/${language}`;
  headers.set('Location', url.toString());
  return new Response(null, { status: 307, headers });
}
