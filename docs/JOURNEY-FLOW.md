# Reference transition pass · 28 September 2026

This pass supersedes the quiet-card experiment.

## Evidence inspected

- White Desert live homepage, map entry at a 1440×900 viewport; original travel-globe DOM/CSS and module 57368 scroll logic in the saved source.
- Supplied White Desert recording `2026-09-28 (3).mp4` and Sobha recording `2026-09-28 (2).mp4`, extracted to contact sheets in this directory.
- Sobha source `landing.css` three-worlds layout, `shared.js` landingThreeWorldsTitle / Background / WebGlClip patterns, and the preceding dark editorial section in `index.html`.

## Changes

The South Africa title is again inside the aircraft's revealed background, immediately beneath the plane. The extra post-flight title scale/hold is still removed; the completed scene continues into the next section.

Map layout follows White Desert's composition: compact three-column introduction, then a full-width map plane. The map is a normal-flow component. The inner layer enters from yPercent -5 and moves by 55svh while the component scrolls past; desktop information has a separate 40svh drift. Route and marker share one progress value. There is no geographic zoom, camera tracking or rotating text. Bonanza geography, Cape Town/George labels and factual Oudtshoorn copy replace the reference's Antarctic content. The latest revision replaces colourful satellite photography with Esri shaded relief, tonally mapped to pale stone and silver. Credit and export metadata are in map-relief-source.json. A black introduction casts a narrow shadow onto the pale map. The destination is reached before the next section overlaps it.

The current palette gives the journey three clear phases: the black arrival, the pale relief map, a continuous black photographic story, and a light final footer. Black begins immediately below the map. Narrow box shadows above and below recess the map; there is no broad black background fade. The animal triptych, editorial lead-in, three-dimensional gallery, Experiences chapters, night sky and ring all use pure black (#000), with light text. There is no scroll-driven background colour switching.

The gallery heading now has its own normal-flow lead-in above the WebGL stage. Its height is included in the gallery's progress calculation, preserving the source-derived camera, half-height image sequence and wipes while preventing the heading from overlapping the photographs. The expanding Experiences card continues the same black backing.

Horizontal chapters now carry the planning information beside the appropriate images: ranger rides and safaris, water activities, cycling, racket sports, golf outings, clubhouse and wellness, butler/private-chef service, helicopter access, security and infrastructure. German and English copy distinguish plans from existing facilities. The separate planning accordion and final contact photograph are removed. The ring leads directly into a light Bonanza Ranch footer with a contact link.

New butler/dinner and tennis images were generated as concept photography using the existing clubhouse and racket-sport pictures as visual references. Both are labelled on the page. Exact prompts, reference assets and output paths are recorded in generated-editorial-images.json. Facility figures follow the supplied V12 business plan and user-provided project brief; no tax, investment-return or guaranteed-security claims were added.

The first triptych uses three visually reviewed supplied WhatsApp photographs: leopard (11.39.59 (2)), lioness portrait (11.39.59 (1)) in the centre, springbok (11.40.00 (1)). They are WebP-encoded at original dimensions, without generation or upscaling. Contact sheet: whatsapp-wildlife-review.jpg. Alt text is translated into German and English.

## Visual checks

Desktop 1440×900: prior checks cover the plane crossing over South Africa, map route and destination visibility. This pass checks the separate gallery heading, half-height wildlife image and caption, sports/service/security chapter spacing and the direct ring-to-footer sequence. The photograph sections are black; the footer is light.

Mobile checks use a 390×844 browser viewport, not a physical device. The Life chapter layout remains vertical on mobile, with a continuous black background and light text. The gallery heading, sport captions and service composition were visually checked; the sport row was narrowed to prevent the first caption being cropped. Document width equals the 390px viewport. Desktop checks also confirm that the map destination remains above the shadow transition. No captured browser errors or warnings. Final production build passes (19:59), all six routes generated.


## Final handoff revision

South Africa and its following introduction share a black background, with a restrained flag accent. The map is shorter; Cape Town and George remain visible before the black reserve introduction arrives. Mobile map and descriptive copy use separate rows. The overlay obscuring destination labels was removed.

Headings use the condensed South Africa typeface, italic accents use Cormorant Garamond, and body copy uses Inter Tight. Body copy in horizontal chapters is enlarged. The night-sky frame retains visible Milky Way detail with text placed low in the frame. The experiences entry is titled ERLEBNISSE / EXPERIENCES.

The light footer ends with a single-line BONANZA RANCH wordmark. Contact, legal links and the text-style cookie control are above it. Header logos are centred on both viewport sizes. All enquiry links use info@bonanza-ranch.com. See LEGAL-AND-LANGUAGE.md for legal/source and deployment notes.

Desktop 1440×900 and mobile 390×844 browser checks covered map-label separation, navigation, the cookie notice and footer. Desktop also covered the aircraft arrival, experiences entry, security copy and night-sky finale. Production build generates ten routes. All four language-routing tests pass. Country routing on Vercel has not yet been deployed or verified live.

## Mobile revision, 29 September 2026

Brief: self-authored within the user's explicit mobile design direction. The existing Bonanza audience, photography, palette, fonts, contact action and desktop choreography remain. The user requests centred headings, consistent spacing, stronger image entrances, no early green edge in the hero, sequential pictures instead of the phone's 3D gallery, and a text close instead of the final 3D ring. WebM remains the preferred video format; H.264 is a compatibility fallback only.

Journey and feeling: wildlife footage invites the visit; clouds and the plane carry the departure; South Africa and the map establish place; photographs and the two land-area figures establish the setting; vertical photo-and-copy chapters show the possibilities; the full-screen night sky is the emotional peak; “Hier bleiben” resolves into the contact footer. The remembered moment remains the aircraft uncovering South Africa. No new assets, claims, fonts or desktop redesign are needed.

Mobile uses normal vertical reading flow, a shorter flight, viewport-filling video, alternating short photo slides, consistent 80px chapter spacing and 32px image-to-copy spacing. The two WebGL galleries do not mount below 768px. Their content is preserved as readable photographs or closing text. Reduced motion retains the static composition. This is a revision of an existing Astro/GSAP site, not a new Scroll-Craft engine build.

Follow-up: at the user's request, the reserve introduction again uses the original mobile three-image composition and scroll-driven centre-image expansion. The following “Raum für die Natur. Freiheit für Ihr Leben.” panel overlaps the imagery from below. The other mobile photo sequences, centred headings, hero fixes and text-only closing section are retained. Verified in the production build at 390 x 844: centre scale reaches 1.6364, the editorial panel covers it, and there is no horizontal overflow. Build and ten tests pass.

## Cream palette and dual arrival study, 30 September 2026

The preceding dark appearance is preserved at commit `3ec2d6c`. The current homepage tests coffee cream (`#eee3d3`) with espresso text (`#332b24`), including the aircraft's South Africa reveal and the introduction immediately before the dark map. The photographic night-sky scene and the following closing story stay dark, with light text and navigation; the footer returns to cream. `?theme=dark` selects the preceding black story palette without storing a preference. The map is a separate dark, desaturated relief plane. Flights from Europe and Asia share one normalized scroll progress and meet in Cape Town simultaneously; one marker continues to George. These are schematic regional routes, not advertised flight services. Mobile fits both origins and destinations in one static map, without zoom or camera tracking.

Mobile flight geometry is measured once from the stable large viewport and held until width/orientation changes. Browser-bar height changes no longer rebuild the scrubbed timeline. The opening composition uses the stable small viewport, keeping its lower content visible when browser bars are present. Plane-mask geometry is cached instead of reading layout on every frame. Font-driven remeasurement waits until scrolling ends.

Validation: production build and all ten tests pass. Browser checks cover 1440×900 desktop and 390px mobile widths. In the mobile height-change check, 844→720px preserved scrollY=820, the 844px stage, the 3038px scene, the title size and the plane mask. This is browser emulation, not a physical-phone test. Europe and Asia both reach progress 1 together; their markers share the same position on the George leg, with the duplicate marker hidden. No observed console warnings/errors. The scroll fix is pushed separately on main as `47238e1`; the cream/map study stays local on `codex/cream-map-study`.

## Supplied photographs and final reference study, 30 September 2026

The latest instruction supersedes the earlier request to generate variations. All eighteen supplied photographs in `bonanza/bilder/neu` are used. Full-size lossless WebP exports match their source pixels exactly. Responsive exports are resized without colour grading, retouching or upscaling. Source names, dimensions and output sizes are recorded in `media-optimization.json`.

Tengile's live markup, component implementation, CSS and `useMediaParallax(0.12)` hook were inspected as inert reference source. Its exact background is `#f5eee9`. Its Lenis settings are duration 1.2, exponential easing `min(1, 1.001 - 2 ** (-10 * t))`, smooth wheel input and touch multiplier 2. Bonanza retains its shared GSAP frame clock, native touch scrolling and reduced-motion fallback. Parallax uses scale 1.12 and −6 to +6 percent movement: horizontal in the sideways chapters, vertical in ordinary page flow. Fonts remain Bonanza's. No reference bundles are shipped or executed.

The user subsequently rejected the staggered portrait layout and requested the original three-image 3D sequence again. Its camera and shader wipes are restored, with cormorant, zebra and oryx replacing the old motifs. The backdrop darkens from reference cream to warm taupe (`#d8cab9`) as the section enters. A full-frame Experiences photograph then rises over the final scene and contracts into the shared photo-left / copy-right chapter layout, returning to reference cream. Mobile retains sequential photographs without WebGL.

`landschaftsbild.png` is square-framed beside the area figures at “Raum für die Natur”; its original file remains intact. `landschaft.png` stays in the water chapter. The supplied pasture photograph replaces the narrow riding picture. All horizontal chapter photographs have the same height, with square or 16:9 widths. Wildlife adds buffalo, antelope and meerkat pictures; tennis uses one court image. The Butler photograph is removed. The new helicopter and wine photograph form the service chapter, and both supplied security photographs replace their concept images. The closing ring uses the supplied rhino and other new wildlife/landscape photographs. Its texture crop matches the actual plane aspect ratio.

For the preceding registration-plate request, only the two plate areas in the Ranger photo were replaced with the image tool's edit. Every pixel outside those masks matches the original photograph. The mobile menu and masked logo inherit the navigation colour, preserving contrast over cream.

The new hero montage is encoded as responsive VP9 WebM, with H.264 compatibility files and new WebP posters. South Africa and the map introduction return to original Bonanza green (`#19362d`); the map returns to the original light relief treatment while keeping synchronized Europe and Asia routes. The night-sky scene and following closing section stay dark, and the footer returns to cream. This photographic revision remains on the local cream-study branch.

Validation: production build and all ten existing tests pass. All eighteen full-size photographic exports match their source pixels, and DE/EN image URLs resolve. Browser checks at the default 1058×668 desktop viewport and 390×844 mobile viewport confirm running VP9 hero video, the light dual-route map, the square reserve photograph, warm taupe gallery background and cream Experiences background. Desktop chapter photos all measure 476px high, and chapter headings share 40px size and a 96px top position at this viewport. Image parallax moves horizontally. Mobile has no gallery canvas or horizontal overflow; water headings remain centred. These are browser checks, not physical-device performance measurements.
