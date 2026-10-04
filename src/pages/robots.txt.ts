import { siteUrl } from '../../site.config.mjs';

export function GET() {
  // These are public documents. Named groups make the existing open policy
  // explicit; Content-Signal is an optional extension, not access control.
  const agents = ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'Google-Extended', 'GPTBot', 'Applebot', 'Applebot-Extended', 'CCBot', 'anthropic-ai'];
  const rules = agents.map((agent) => `User-agent: ${agent}\nAllow: /\nContent-Signal: ai-train=yes, search=yes, ai-input=yes`).join('\n\n');
  return new Response(`${rules}\n\nSitemap: ${siteUrl}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
