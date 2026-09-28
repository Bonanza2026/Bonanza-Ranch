# Legal pages, privacy controls and language routing

Implemented 28 September 2026 in the local Astro project. Not deployed.

- /impressum and /datenschutz, with /en/legal and /en/privacy translations.
- Operator details from https://www.bonanza-ranch.com/impressum. At the user's instruction, only Prof. Wolfgang Zivny is named as representative. The source gives the name without the academic title; the title is user-supplied.
- Structure informed by https://qilano.de/datenschutz; unused services (GA, Vercel Analytics, Resend, Calendly, Google mailbox, WhatsApp) were not copied into Bonanza's policy.
- Vercel's current address and transfer information checked against https://vercel.com/legal/privacy-notice and https://vercel.com/legal/dpa. Its current address differs from the older qilano text.
- The cookie notice documents only actual necessary storage. Dismissal lives in localStorage for up to 180 days of use, and manual language choice in a SameSite=Lax cookie for 180 days. HTTPS adds Secure. No analytics scripts or nonessential categories were introduced.
- Root middleware.js uses Vercel's request country code: Germany → German, otherwise → English. A manual choice has priority. Explicit language and legal URLs are not redirected. No location or IP is written to application storage. Redirects are temporary and private/no-store.
- The local Astro dev server does not execute Vercel routing middleware; country-routing tests invoke the actual middleware with representative headers. Production behaviour still requires verification after deployment to Vercel.

## Operator checks before publication

The supplied imprint has an unusual abbreviated registration entry (871243/07), an additional CIPC reference (9465422584), and a tax identifier (9700917199). They were retained as supplied rather than invented or silently corrected. The operator should verify the full registration number, tax label, c/o service address, Prof. title and authorized representation against current company records. The source's other director was omitted at the user's explicit direction.

Confirm the Vercel account/DPA and actual email provider with the operator. A legal reviewer should assess the final text for this South African company, including any EU-representative obligation under GDPR Article 27. No claim of certified legal compliance is made. Do not enable host analytics or new third-party services without updating the implementation and policy.

Sources for deployment behaviour: https://vercel.com/docs/frameworks/frontend/astro and https://vercel.com/docs/routing-middleware/getting-started.
