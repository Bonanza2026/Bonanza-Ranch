import { geolocation, next } from '@vercel/functions';

// Only the entry URL is localized. Explicit language URLs remain shareable.
export const config = { matcher: ['/'] };

export default function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname !== '/') return next();
  if (url.hostname === 'bonanza-ranch.com') {
    url.hostname = 'www.bonanza-ranch.com';
    return Response.redirect(url, 308);
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
