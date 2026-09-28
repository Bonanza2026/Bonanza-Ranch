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

## Mobile follow-up, 29 September 2026

The subsequent user report measured 79 performance, FCP 1.7 s and LCP 5.3 s. An independent PageSpeed Insights mobile run at 00:24 CEST reproduced the issue: 81 performance, FCP 1.5 s, LCP 5.1 s, 10 ms TBT and 0.001 CLS. Both reports recorded about 35 MB of transfers including multiple video formats. Baseline report: https://pagespeed.web.dev/analysis/https-bonanza-gamma-vercel-app-en/gfwbaxy4kw?form_factor=mobile

The original MP4 was HEVC, not a broadly compatible H.264 fallback. The hero now chooses one size and supported format. It only tries the fallback after a decode or format error, not after a slow request or rejected autoplay. The separate film has no active source until the visitor opens it, and retains its audio. Reduced-motion users receive the still image without a video download.

The first image is a responsive picture, preloaded at the matching viewport size. Video starts after that image is decoded and has a paint opportunity. This loading order applies to all visitors; there is no Lighthouse or user-agent detection. The mobile poster is 36,412 bytes instead of 132,976. The CSS logo mask retains alpha but removes unused colour information, reducing it to 23,444 bytes.

New silent hero encodes retain the full 16.9-second sequence at 24 fps: 960 × 540 for mobile and 1600 × 900 for desktop. VP9 uses CRF 36/34 and H.264 uses CRF 26/25 with faststart. Mobile WebM is 1,598,875 bytes instead of 3,039,821. Original sources remain available for cached pages. CSS is inlined by Astro to remove the two stylesheet round trips; the tradeoff is a larger HTML document and no separate CSS cache on repeat navigations.

Ten build/routing/media tests pass. A production-header preview confirmed mobile VP9 autoplay, one selected video request, the matching mobile poster, no unloaded-dialog media request and no console errors. The PageSpeed score after this change must be measured on the deployed version.

Further measurements identified the hero H1 as the LCP element. Its exact Oswald 400 glyphs are now included in a 1,300-byte font subset in the HTML; no typography or heading dimensions were changed. Font data URLs are permitted by the CSP, while executable scripts remain self-only. That change alone did not improve the score (78 in the next run).

Scroll-scene initialization now starts after the browser's first contentful paint, with a two-frame fallback for browsers without paint observation. A local diagnostic confirmed that the H1 was painted before scroll initialization, and scrolling still advanced through the flight sequence. The deployed mobile measurement at 00:45 CEST improved to 85 performance, FCP 1.4 s, LCP 4.2 s, TBT 10 ms, CLS 0 and Speed Index 3.6 s. Report: https://pagespeed.web.dev/analysis/https-bonanza-gamma-vercel-app-en/et8u2wzc2h?form_factor=mobile

Inter Tight and Oswald have additionally been subset for the site's German and English characters, retaining all characters currently used in the source, Latin-1, punctuation, arrows, font axes and layout features. Regular Inter Tight drops from 85,736 to 55,252 bytes, italic from 91,120 to 59,468 bytes, and Oswald from 34,920 to 26,432 bytes. Original files remain available for cached documents. Glyph coverage was checked against the input fonts.

## Mobile layout and CSS cleanup, 29 September 2026

Phone layouts below 768 px now use sequential photographs instead of both WebGL galleries. Images enter with a short horizontal/vertical slide, without scroll pinning. The experience chapters share centred 38 px headings, 18 px body copy, 32 px image-to-copy spacing and 80 px chapter spacing. The night sky stays full-screen with its caption over the image. The final ring is replaced with the closing heading and paragraph before the footer. Desktop gallery and horizontal motion are retained.

The phone hero runs over 360 svh rather than 429.3 svh. Its video no longer translates upward and exposes the arrival background. Short screens receive smaller opening text. WebM remains primary, with H.264 only as a format/decode fallback.

Build-time PurgeCSS removes unused selectors from the generated inline styles while retaining animation state selectors, keyframes, font faces and variables. Three unique style blocks fall from 375,263 to 190,195 bytes. Before the mobile redesign, a browser comparison of 503 elements and 20 computed style properties found no differences between the original and pruned CSS.

Validation: production build and all ten tests pass. Browser checks at 320 x 568, 390 x 844 and 1440 x 900 covered the hero, arrival, wildlife sequence, experience headings and closing section. Mobile has no WebGL canvases or horizontal overflow; desktop still renders the curved gallery. Desktop-to-phone resize clears caption accessibility states. The browser reported no console errors. These checks use viewport emulation, not physical devices.

The measurement after font subsetting was 82 performance (FCP 1.4 s, LCP 4.2 s, TBT 0 ms, CLS 0, Speed Index 4.9 s). This shows run-to-run variation from the preceding 85 result; the final deployed mobile layout and CSS cleanup require a fresh measurement.

Final deployed PageSpeed Insights run at 01:17 CEST, commit ae6c4df: **100 mobile performance**, FCP 1.0 s, LCP 1.0 s, TBT 20 ms, CLS 0.014 and Speed Index 1.5 s. Accessibility 96, Best Practices 100, SEO 100. Unused CSS estimate is now 12 KiB instead of 31 KiB. This is a single laboratory run, not a field-data guarantee. Report: https://pagespeed.web.dev/analysis/https-bonanza-gamma-vercel-app-en/999z7ux1cm?form_factor=mobile

Vercel reported deployment complete. The public German page was checked in the browser: mobile captions use the sequential grid, experience headings are centred and no WebGL canvas is mounted.
