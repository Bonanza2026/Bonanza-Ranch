# Web-Lesedienst: Diagnose vom 7. Oktober 2026

Die Bonanza-Website liefert bei den geprüften öffentlichen DNS-, TLS- und HTTP-Aufrufen gültige Antworten. Das Web-Lesetool gibt bei mehreren URLs dennoch nur `URL … is not accessible via this tool.` zurück. Diese Meldung enthält weder einen HTTP-Status noch eine DNS- oder TLS-Fehlerursache. Daraus lässt sich kein konkreter Fehler bei United Domains oder Vercel ableiten.

## Reproduzierbare Unterschiede im Web-Lesetool

| Aufruf | Ergebnis des Lesetools |
| --- | --- |
| `https://bonanza-ranch.com/` | Generische Meldung: nicht zugänglich |
| `https://www.bonanza-ranch.com/` | Generische Meldung: nicht zugänglich |
| Bonanza `/de`, `/en`, `/robots.txt`, `/llms.txt` | Dieselbe generische Meldung |
| `https://www.qilano.de/` | Seiteninhalt geliefert; Werkzeughinweis „Crawled: today“ |
| `https://www.qilano.de/robots.txt` | Generische Meldung: nicht zugänglich |
| `https://bonanza-ranch-4ftwbuje5-bonanza2026.vercel.app/en` | Generische Meldung: nicht zugänglich |
| Beide Hauptdomains mit `/?diagnostic=reader-20261007-1038` | Generische Meldung: nicht zugänglich |

Auch eine Vercel-Vorschau und eine Unterseite der sonst lesbaren Qilano-Domain scheitern. Ein genereller Unterschied „eigene Domain gegenüber Vercel-Vorschau“ erklärt die Ergebnisse somit nicht. Der Hinweis „Crawled: today“ legt nicht offen, ob Qilanos Antwort beim Werkzeugaufruf frisch vom Server abgerufen oder aus einem zuvor erzeugten Abruf bereitgestellt wurde.

## Öffentliche DNS-Prüfung

Geprüft wurden Google Public DNS und Cloudflare mit aktivierter DNSSEC-Validierung, einschließlich A, AAAA, CNAME, HTTPS und DS. Die Antworten hatten Status `0` / `NOERROR`; es gab keinen DNSSEC-Validierungsfehler oder `SERVFAIL`.

| Name | Öffentliche Antwort |
| --- | --- |
| `bonanza-ranch.com` | A `216.198.79.1`, TTL 600 Sekunden |
| `www.bonanza-ranch.com` | CNAME `5d64de0dc6a42a8d.vercel-dns-017.com.`, TTL 600 Sekunden |
| Bonanza-CNAME-Ziel | Je nach Resolver `64.29.17.1` / `216.198.79.1` oder `64.29.17.65` / `216.198.79.65` |
| `qilano.de` | A `216.198.79.1` und `64.29.17.65` in der Google-Antwort |
| `www.qilano.de` | CNAME `cname.vercel-dns-017.com.`, TTL 60 Sekunden |
| Qilano-CNAME-Ziel | Dieselben Vercel-Adresspaare `.1` beziehungsweise `.65`, abhängig vom Resolver |

Beide Domains lieferten keine AAAA- oder HTTPS-Service-Binding-Einträge und keinen DS-Eintrag am Domain-Apex. `AD: false` entspricht hier einer nicht signierten Domain; es ist kein Nachweis eines kaputten DNSSEC-Setups.

Die United-Domains-Oberfläche bestätigte für Bonanza A `216.198.79.1`, einen Wildcard-A-Eintrag auf dieselbe Adresse und den oben genannten `www`-CNAME mit TTL 600. Es waren keine AAAA- oder CAA-Einträge gesetzt. Die deaktivierte TLSA-Funktion verwies auf die Voraussetzung eines aktivierten DNSSEC-/Domain-Tresor-Angebots. Diese Konfiguration passt zu den öffentlichen Antworten. Mail-DNS wurde nicht verändert.

## TLS und HTTP

Die Netzwerkprüfungen liefen am 7. Oktober 2026 ungefähr von **10:28:38 bis 10:29:30 UTC**, also **12:28:38 bis 12:29:30 MESZ**.

- Bonanza-Apex und `www` hatten gültige, auf den jeweiligen Host ausgestellte Let's-Encrypt-Zertifikate. Gültigkeit: 1. Oktober bis 30. Dezember 2026. Die geprüften Verbindungen nutzten TLS 1.3 und unterstützten HTTP/2 per ALPN.
- Qilano hatte ein gültiges Let's-Encrypt-Zertifikat für `qilano.de` und `*.qilano.de`. Gültigkeit: 29. September bis 28. Dezember 2026.
- Für `www.bonanza-ranch.com/en` und `www.qilano.de/` wurden alle vier Adressen `216.198.79.1`, `64.29.17.1`, `216.198.79.65` und `64.29.17.65` direkt mit korrektem SNI/Host geprüft. Alle acht Aufrufe bestanden die Zertifikatsprüfung und lieferten HTTP `200 OK` mit `text/html; charset=utf-8` vom Vercel-Server.
- Bonanza leitete den Apex mit `308` auf `www` weiter. Der Einstieg `/` leitete vom deutschen Prüfstandort mit `307` auf `/de` weiter. Ein direkter Aufruf von `/en` lieferte `200` ohne Weiterleitung.
- Browser-, `ChatGPT-User`- und `OAI-SearchBot`-User-Agents bekamen jeweils denselben vollständigen HTML-Inhalt für dieselbe Zielseite. Es wurde keine User-Agent-spezifische Sperre beobachtet.

Diese User-Agent-Prüfungen stammen vom lokalen Prüfstandort. Sie ersetzen keinen Abruf aus dem tatsächlichen Netzwerk des OpenAI-Lesedienstes und beweisen deshalb nicht, dass jede OpenAI-Quell-IP dieselbe Antwort bekommt.

Qilano lieferte explizite `index, follow`-Angaben im Robots-Meta-Tag und im `X-Robots-Tag`; Bonanza enthielt in den geprüften HTML-Antworten keine solchen Tags. Bei Bonanza wurde aber auch keine `noindex`, `nofollow` oder KI-Opt-out-Anweisung in diesen Tags beobachtet. Die Headerdifferenz belegt keine Ursache für den fehlgeschlagenen Abruf.

## Vercel-Regeln und kontrollierter Log-Abgleich

In der geprüften Vercel-Oberfläche waren Bot Protection ausgeschaltet, AI Bots auf Allow und Attack Mode ausgeschaltet. Es waren keine IP-Sperren oder benutzerdefinierten Regeln sichtbar. Im Live-Fenster 12:22–12:32 MESZ gab es null abgewiesene oder herausgeforderte Anfragen. Zwei Abweisungen in der Stundenansicht betrafen einen unabhängigen `/wp-admin`-Scan. Die 423 DDoS-Ereignisse vom Vortag wurden nicht mit einem fehlgeschlagenen Lesetool-Aufruf verknüpft.

Ein weiterer Vergleich lief **10:36:30–10:36:32 UTC / 12:36:30–12:36:32 MESZ**:

1. Das Web-Lesetool scheiterte für Bonanza und Qilano am frischen Query `diagnostic=reader-20261007-1038` mit derselben generischen Meldung.
2. Ein unabhängiger `curl`-Kontrollaufruf an Bonanza mit `User-Agent: Bonanza-Diagnostic-Control/20261007-1038` lieferte `307`.
3. In den sichtbaren Vercel-Middleware-Logs erschien nach Aktualisierung die Kontrolle um **12:36:32.393 MESZ**. Im selben Zeitfenster war dort kein weiterer Root-Aufruf sichtbar.

Der Kontrollaufruf bestätigt, dass ein eingehender Request in dieser Ansicht sichtbar werden konnte. Ein fehlender Log-Eintrag ist wegen möglicher Verzögerung, Filterung oder Stichprobenerfassung kein abschließender Beweis, dass kein anderer Request Vercel erreichte. Die Ansicht liefert auch keinen internen Fehler des OpenAI-Lesedienstes.

## Konsequenz

Aus diesen Prüfungen ergibt sich keine begründete DNS-Änderung oder Hosting-Migration. Die verbleibende Diagnose braucht den fehlgeschlagenen Backend-Abruf des Lesedienstes: Zeitpunkt, DNS-Antwort, TLS-Fehler oder HTTP-Status und gegebenenfalls die Request-ID. Dafür liegt eine separate Support-Vorlage in [WEBREADER-SUPPORT-2026-10-07.md](WEBREADER-SUPPORT-2026-10-07.md).

Direkte Markdown-Antworten werden getrennt als Verbesserung der maschinenlesbaren Inhalte umgesetzt. Ihre Live-Auslieferung war zum Zeitpunkt dieser Diagnose noch nicht abschließend verifiziert. Weder Markdown, Indexierung, `llms.txt` noch WebMCP garantieren, dass ein externer Lesedienst eine URL abruft.
