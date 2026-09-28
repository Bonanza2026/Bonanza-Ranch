# Bonanza Ranch — Astro

Bilingual project website with locally hosted imagery, GSAP/Lenis scroll motion and Three.js galleries.

```sh
npm ci
npm run dev
```

Local preview: http://127.0.0.1:4323/

```sh
npm run build
npm test
```

The build produces ten static routes in `dist`: the German and English landing pages, leisure/security detail pages, and legal/privacy pages. `npm run qa` runs the build and country-routing tests. Responsive browser checks are performed separately.

## Structure

- `src/components/DreamJourney.astro`: hero, clouds and aircraft reveal.
- `src/components/JourneyMap.astro`: normal-flow relief map and scroll-drawn Europe–Cape Town–George route.
- `src/components/ReserveIntroduction.astro`: reserve vision and animal triptych.
- `src/components/ReferenceStory.astro`: wildlife gallery, experiences, night-sky finale and ring.
- `src/scripts`: editable motion and interaction modules; Astro bundles them at build time.
- `src/content`: bilingual project and legal content.
- `public`: local WebP imagery, WebM video, MP4 fallback and fonts.
- `middleware.js`: Vercel entry-language routing.

No React/Next runtime, external reference-site bundles, hosted fonts, analytics or marketing scripts are required. Reference captures and local backups are excluded from this repository.

## Deployment on Vercel

Import this repository as an Astro project: build `npm run build`, output `dist`.
Vercel routing middleware selects German for requests from Germany and English elsewhere. A manual language choice wins. Explicit language URLs remain available. Astro's local dev server does not run Vercel routing middleware; verify country handling once deployed.

Contact links open `info@bonanza-ranch.com`. Cookie settings explain the two necessary preferences actually stored: the chosen language and dismissal of the privacy notice. No fabricated consent categories or contact submissions.

Bonanza is presented as a development vision. Planned facilities and concept imagery are identified as such. The map indicates a destination region near Oudtshoorn, not a surveyed estate boundary. See [legal and deployment notes](docs/LEGAL-AND-LANGUAGE.md) for the operator details that still require confirmation before public launch.
