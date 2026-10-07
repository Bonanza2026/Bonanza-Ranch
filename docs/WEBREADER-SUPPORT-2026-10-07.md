# Support-Vorlage: fehlgeschlagene URL-Abrufe im Web-Lesetool

Die folgende Nachricht ist eine vorbereitete Anfrage. Sie wurde nicht versendet. Sie enthält öffentliche Website-Daten und keine privaten Konto- oder Anschlussdaten.

## Nachricht zum Kopieren

**Subject: Please investigate opaque web-reader fetch failures for bonanza-ranch.com**

We can reproduce failures in the web-reading tool for these public URLs:

- `https://bonanza-ranch.com/`
- `https://www.bonanza-ranch.com/`
- `https://www.bonanza-ranch.com/de`
- `https://www.bonanza-ranch.com/en`
- `https://www.bonanza-ranch.com/robots.txt`
- `https://www.bonanza-ranch.com/llms.txt`
- `https://bonanza-ranch-4ftwbuje5-bonanza2026.vercel.app/en`

The tool reports only `URL … is not accessible via this tool.` It does not provide an HTTP status, DNS failure, TLS failure or backend request identifier.

In the same session, `https://www.qilano.de/` returned page text with the tool annotation “Crawled: today”. However, `https://www.qilano.de/robots.txt` also failed with the same generic error. This comparison does not establish whether the successful response was a fresh origin fetch or previously fetched content.

Independent network checks on **2026-10-07, approximately 10:28:38–10:29:30 UTC** found:

- Google Public DNS and Cloudflare returned `NOERROR` for A, AAAA, CNAME, HTTPS and DS queries. Neither domain showed a DNSSEC validation failure. Both apexes are unsigned and have no DS record; neither domain publishes an AAAA address or HTTPS service-binding record.
- `bonanza-ranch.com` resolves to `216.198.79.1`. Its `www` CNAME is `5d64de0dc6a42a8d.vercel-dns-017.com.` with a 600-second TTL. `www.qilano.de` uses `cname.vercel-dns-017.com.`. Both CNAME targets resolve to Vercel's `.1` or `.65` address pairs depending on the public resolver.
- TLS certificate verification succeeded for the Bonanza apex and `www` host. Their Let's Encrypt certificates are valid from 2026-10-01 through 2026-12-30. TLS 1.3 and HTTP/2 ALPN were available.
- Direct SNI/Host checks against `216.198.79.1`, `64.29.17.1`, `216.198.79.65` and `64.29.17.65` returned valid TLS and HTTP `200 OK` for both `www.bonanza-ranch.com/en` and `www.qilano.de/`.
- Normal browser, `ChatGPT-User` and `OAI-SearchBot` user-agent requests returned the same complete Bonanza HTML. These tests originated from our local network, so they do not prove that real OpenAI source IPs receive the same response.
- Bonanza's apex returns a `308` redirect to `www`; its root returns a locale-selecting `307`. The explicit English URL returns `200` without a redirect. No HTML robots meta tag or response header containing `noindex`, `nofollow` or an AI opt-out was observed.

Vercel's visible settings had Bot Protection off, AI Bots allowed, Attack Mode off, and no custom/IP-blocking rules. The inspected live firewall interval had no denied or challenged requests. Unrelated `/wp-admin` scanning and previous-day DDoS events were not attributed to the reader failures.

We also ran a fresh-query control at **2026-10-07 10:36:30–10:36:32 UTC**:

- The web tool failed on both `https://www.bonanza-ranch.com/?diagnostic=reader-20261007-1038` and the same query on `https://www.qilano.de/`.
- A separate Bonanza `curl` request with `User-Agent: Bonanza-Diagnostic-Control/20261007-1038` returned `307` and appeared in the visible Vercel middleware logs at **10:36:32.393 UTC**.
- No additional root request was visible in that interval after refreshing the log view. We do not treat that absence as conclusive because log sampling, filtering or delay may apply.

We then deployed and verified direct Markdown content negotiation in commit `42478af`; Vercel reported the deployment `READY`. All six canonical documents return HTTP `200` at the same URL for `Accept: text/markdown`, with `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`, a canonical link and `index, follow`. The response bodies match the built documents. HTML requests and requests rejecting Markdown with `q=0` still receive HTML. Separate Markdown helper files retain `noindex`; the existing root locale selection and apex-to-www redirects remain intact.

After that deployment, a further web-tool comparison at approximately **2026-10-07 10:44:51–10:44:53 UTC** still failed for `https://www.bonanza-ranch.com/en` with the same generic error, while `https://www.qilano.de/` returned page text again.

The corresponding Vercel middleware view for the explicit `/en` route showed independent live checks at **10:44:22.733 and 10:44:23.596 UTC**, and a marked `curl` control at **10:45:20.545 UTC**. No `/en` request was visible in the approximately **10:44:51–10:44:53 UTC** reader-failure interval. The controls demonstrate that this route could appear in the inspected log view. This supports investigating a failure before a visible origin request, but does not establish it conclusively because log sampling, filtering and delay are unknown.

Please investigate the backend fetch attempt and provide the actual failure stage and diagnostic information:

1. Did the reader make an origin request, or fail before sending it?
2. Which DNS answers and destination IP did it use?
3. Was there a TLS/certificate error, an HTTP error, a timeout, or a reader-side URL policy/cache decision?
4. If an HTTP response was received, what were its status, redirect chain and relevant response headers?
5. Can you provide a backend request identifier and exact UTC timestamp for correlation with Vercel logs, and retry after resolving the failure?

Please do not infer that the site is offline or still local from this generic tool error. The public DNS/TLS/HTTP checks above succeed. We need the reader's underlying fetch error to identify a justified corrective action.

## Ergänzungen bei späteren Tests

Neue Abrufzeiten, unveränderte Fehlermeldungen und bestätigte Backend-Request-IDs können ergänzt werden. Die direkte Markdown-Auslieferung wurde veröffentlicht und live bestätigt; der anschließende Lesetool-Aufruf scheiterte weiterhin. Änderungen an Indexierung oder weiteren Schnittstellen sollten ebenfalls nur mit ihrem tatsächlich geprüften Ergebnis beschrieben werden.
