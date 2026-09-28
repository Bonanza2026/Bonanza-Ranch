# Technical review, 28 September 2026

## Findings before changes

| Finding | Severity | Confidence | Evidence |
| --- | --- | --- | --- |
| Discovery files missing | Medium | High | Production returned 404 for robots.txt, llms.txt and sitemap.xml. |
| Language discovery depends on visitor country | Medium | High | Only `/` and `/en` existed; the root redirects visitors outside Germany. No canonical or alternate language links. |
| Unnecessary initial asset transfer | Medium | High | Supplied mobile Lighthouse report: FCP 3.2 s, LCP 7.5 s; poster 279,222 bytes, logo 186,864 bytes, Inter Tight 239,308 bytes, Oswald 72,104 bytes. |
| Missing browser security policy | Medium | High | Production had no Content-Security-Policy, X-Content-Type-Options, Referrer-Policy or Permissions-Policy. |
| JSON script escaping does not escape `<` | Medium | High | BonanzaDetail uses a JavaScript Unicode escape as the replacement string, which evaluates back to `<`. Current content is static, so this is not a demonstrated external exploit. |
| Menu preview interpolates markup unnecessarily | Low | High | bonanza-ui.ts inserts a static data attribute through innerHTML. DOM construction avoids interpreting it as markup. |
| Duplicate Inter Tight declaration | Low | High | reference.css and dream.css register the same normal font; the first declaration has an incorrect fixed weight and no font-display. |

Baseline: production dependency audit found no known vulnerabilities. Residue and placeholder scanners reported no findings. No claim is made about authorship or complete security.

## Boundaries

The ranch area (6,300 ha) and surrounding wildlife conservation area (36,000 ha) are separate figures provided by the operator. Discovery text must not combine them or revive the Paris comparison. Existing motion and editorial content remain outside this cleanup.

The current production hostname is bonanza-gamma.vercel.app. Set SITE_URL to the final HTTPS origin and rebuild when the domain changes. Canonicals, language alternates, robots, llms and sitemap all use that setting. The geographic entry at `/` stays available; `/de` and `/en` provide stable language URLs.

Vercel Hobby suitability for commercial use and processing agreements with Vercel and the mail provider remain operator matters, as recorded in LEGAL-AND-LANGUAGE.md. Security headers do not resolve those requirements.

## Repairs and checks

- robots.txt allows public crawling and points to the generated sitemap. llms.txt links to real German and English content, including the separate area figures and contact details.
- `/de` is the stable German entry. Canonical URLs and reciprocal language alternates share one route table. Redirect-only pages are excluded from the sitemap.
- Executable scripts are emitted as local assets, permitting `script-src 'self'` without unsafe-inline or unsafe-eval. Styles retain unsafe-inline because GSAP and the page components set element styles. The CSP also restricts images, fonts, media and connections, blocks framing and plugins, and prevents form submission. The site uses mail links rather than a form.
- Added nosniff, referrer and permissions headers. No additional analytics, external fonts or trackers were introduced.
- Corrected JSON script escaping and replaced preview HTML interpolation with DOM element construction. Removed the duplicate normal Inter Tight font registration.

| Asset | Before, bytes | After, bytes |
| --- | ---: | ---: |
| Hero poster, 1920 × 1080 | 279,222 | 132,976 |
| Logo, resized to 900 px wide | 186,864 | 53,952 |
| Inter Tight normal | 239,308 | 85,736 |
| Oswald | 72,104 | 34,920 |
| Total | 777,498 | 307,584 |

These four assets transfer about 60% less data. The italic Inter Tight font also falls from 252,352 to 91,120 bytes. The favicon is a separate 4,078-byte PNG. Original assets remain available for already cached pages.

Images were encoded with Sharp: poster WebP quality 74 / effort 6, logo lossless WebP at 900 px. Fonts were subset with fontTools 4.66.0, retaining all layout features, naming information, weight axes, and glyphs from U+0000–024F, U+2000–206F, U+2190–21FF, U+20AC, U+2122 and U+2212. Glyph presence and variable axes were checked against the originals.

Validation: production build and eight tests pass, covering routing, public discovery links and section anchors, canonical/sitemap agreement, language alternates, external executable scripts, absence of inline handlers and hero preload matching. Package registry checks, residue scans, placeholder scans and git diff checks passed. A browser check of the built site with production headers confirmed desktop video autoplay, scrolling, the WebGL gallery, mobile English layout, menu and legal navigation without console warnings or CSP errors.

The supplied Lighthouse numbers are the baseline, not a new measurement. No improved Lighthouse score or load time is claimed from asset sizes alone.

References: [Astro endpoints](https://docs.astro.build/en/guides/endpoints/), [robots.txt guidance](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt), [llms.txt format](https://llmstxt.org/), [Vercel security headers](https://vercel.com/docs/cdn-security/security-headers). The script externalization option was verified in the installed Astro/Vite build implementation.
