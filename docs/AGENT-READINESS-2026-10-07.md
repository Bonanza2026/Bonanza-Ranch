# WebMCP, Inhalts-API und Agent Readiness

Prüfstand: 7. Oktober 2026. Dieser Bericht ergänzt den historischen [Stand vom 6. Oktober](AGENT-READINESS-2026-10-06.md).

## Was jetzt tatsächlich umgesetzt ist

Die Website registriert vier native WebMCP-Werkzeuge direkt beim Laden der Seite. Der Build veröffentlicht zusätzlich eine öffentliche, ausschließlich lesende Inhalts-API, einen RFC-9727-API-Katalog und eine OpenAPI-3.1.1-Beschreibung.

| Werkzeug | Funktion | Eingaben |
| --- | --- | --- |
| `read_bonanza_page` | Liest die veröffentlichte DE/EN-Seite als JSON mit Markdown-Inhalt | Genau eine der sechs dokumentierten `documentId`-Werte |
| `navigate_bonanza_section` | Ruft einen vorhandenen Abschnitt in der aktuellen Sprache auf | `reise`, `wildnis`, `freizeit`, `sicherheit` oder `kontakt` |
| `get_bonanza_contact` | Liest die angezeigte öffentliche E-Mail-Adresse | Leeres Objekt |
| `open_bonanza_contact` | Öffnet den vorhandenen Kontaktdialog | Leeres Objekt |

Keines der Werkzeuge verschickt Nachrichten, öffnet ein externes E-Mail-Programm, kopiert Daten, bucht Leistungen oder verändert serverseitige Daten. Die JSON-Schemas erlauben keine zusätzlichen Eigenschaften. Die Implementierung prüft die Eingaben auch bei der Ausführung. Inhaltsabrufe sind auf die festgelegten gleichnamigen JSON-Dateien derselben Origin beschränkt und abbrechbar.

Quellen: [webmcp.mjs](../src/scripts/webmcp.mjs), [SiteLayout.astro](../src/layouts/SiteLayout.astro), [agent-api.mjs](../agent-api.mjs) und [Build-Generator](../scripts/generate-agent-content.mjs).

## Chrome-Freischaltung

Am 7. Oktober 2026 wurde nach Zustimmung des Betreibers das **Chrome WebMCP Origin Trial** für `https://www.bonanza-ranch.com` registriert. Das Token gilt ausschließlich für diese Origin, nicht für fremde Domains oder Subdomains. Es endet spätestens am **30. März 2027**; die Registrierung nennt Chrome 149 bis 162.

Das öffentliche, origin-gebundene Token liegt in [webmcp-trial.mjs](../webmcp-trial.mjs) und wird im HTML-Kopf per `origin-trial`-Metaelement ausgeliefert. Es ist kein Passwort und kein API-Schlüssel. Nach Ablauf oder einem Domainwechsel ist eine passende Registrierung mit neuem Token erforderlich. `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` erlaubt einen ausdrücklichen Build-Override; danach muss neu gebaut werden.

Die Implementierung verwendet die aktuelle `document.modelContext`-API, mit Feature-Erkennung und Unterstützung des älteren `navigator.modelContext`-Zugangs. Ohne native Browserunterstützung bleibt die normale Website bedienbar. Es gibt keine künstliche API, die einem Audit lediglich registrierte Werkzeuge vortäuscht. Registrierung und laufende Abrufe werden bei Verlassen oder Verbergen des Dokuments aufgeräumt; beim Wiederanzeigen werden Werkzeuge erneut registriert.

Die Freischaltung erfolgt bei **Chrome Origin Trials**, nicht in Google Search Console. Laut [Google](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring) benötigen die WebMCP-Prüfungen in Lighthouse diese Teilnahme. Die [aktuelle API-Dokumentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api) beschreibt die Registrierung und Eingabeschemas.

## Öffentliche API und Discovery

- [API-Katalog](https://www.bonanza-ranch.com/.well-known/api-catalog): RFC-9727-Linkset mit tatsächlichen API-, Schema- und Dokumentationszielen.
- [ARD](https://www.bonanza-ranch.com/.well-known/ard.json) und [AI-Katalog](https://www.bonanza-ranch.com/.well-known/ai-catalog.json): identische Discovery-Dokumente der vorhandenen Inhalts-API; aktuelle und von Lighthouse unterstützte Vorgängeradresse.
- [OpenAPI](https://www.bonanza-ranch.com/openapi.json): GET-Operationen für Inhaltsindex und Dokumente; keine Authentifizierung oder Schreiboperationen.
- [API-Dokumentation](https://www.bonanza-ranch.com/api/docs.html): Nutzung, Dokument-IDs und Grenzen.
- [Inhaltsindex](https://www.bonanza-ranch.com/api/content/index.json): Metadaten der sechs kanonischen Sprachseiten.
- [Deutsche Seite als JSON](https://www.bonanza-ranch.com/api/content/de.json) und [englische Seite als JSON](https://www.bonanza-ranch.com/api/content/en.json).

Weitere IDs: `impressum`, `en-legal`, `datenschutz` und `en-privacy`. Unbekannte IDs sind keine API-Dokumente und liefern 404. Jede JSON-Fassung enthält die Canonical-URL, Sprache, Metadaten, Markdown-Adresse und denselben Markdown-Inhalt wie die entsprechende alternative Seite. HTML, JSON und Markdown stammen aus demselben Build. Im HTML und im HTTP-`Link`-Header wird auf den Katalog verwiesen. Vercel liefert den Katalog als `application/linkset+json` und das Schema als `application/vnd.oai.openapi+json` aus.

Die ARD-Dateien stammen aus [agent-discovery.mjs](../agent-discovery.mjs). Ihr einziger Eintrag leitet seine URL, Medienart, Beschreibung und Fähigkeiten aus der tatsächlichen OpenAPI-Beschreibung ab. Er beschreibt keinen erfundenen MCP-Server. Der [ARD-Vorschlag](https://agenticresourcediscovery.org/spec/) erlaubt die Entdeckung unterschiedlicher Schnittstellen. Die aktuelle Medienarten-Liste von Lighthouse 13.5 kennt OpenAPI noch nicht und gibt deshalb einen niedrigen Hinweis aus; die zutreffende Medienart bleibt erhalten.

## Prüfungen und ehrliche Einordnung

Der Produktionsbuild und **46 Tests** bestehen. Geprüft werden unter anderem alle erzeugten API-Dokumente gegen HTML und Markdown, die Katalogziele, begrenzte Eingaben, tatsächliche Kontaktfunktionen, Abbruchverhalten, fehlende Browserunterstützung, der Back/Forward-Cache und kanonische Sprach- beziehungsweise Kapitelweiterleitungen.

Im echten lokalen Browser und auf der Produktionsdomain wurden alle vier Werkzeuge nativ entdeckt und ausgeführt: Inhalte lesen, E-Mail-Adresse lesen, Kontaktdialog öffnen und zur Wildnis navigieren. Diese Prüfung ist zusätzlich zu den automatisierten Tests erfolgt. Eine öffentliche HTTP-Prüfung kontrollierte die sechs HTML-Seiten, beide API-Katalogadressen, OpenAPI, Dokumentation und sieben JSON-Antworten. Die JSON-Dokumente bestanden zusätzlich die Prüfung gegen ihre veröffentlichten JSON-Schemas.

Die Website besitzt **kein Webformular zum Absenden einer Anfrage**. Kontakt bleibt eine E-Mail-Adresse mit Auswahlfenster. Eine WebMCP-Formularabdeckung ist deshalb weiterhin nicht anwendbar. Dafür wird kein funktionsloses Formular hinzugefügt. Ein N/A ist kein Fehler und darf nicht als bestandener Formularversand ausgegeben werden.

Die Lighthouse-Anzeige ist das Verhältnis der im konkreten Lauf anwendbaren, bestandenen Prüfungen. Sie ist nicht dasselbe wie der Level des öffentlichen Agent-Readiness-Scanners. Der öffentliche Produktionslauf am 7. Oktober um 08:50 UTC mit **Lighthouse 13.5.0 und Chrome 152** ergab vor der zusätzlichen ARD-Datei **4 von 4**. Vier registrierte native WebMCP-Werkzeuge wurden erkannt; ihre Schemas bestanden. Formularabdeckung und die damals noch fehlende ARD-Datei waren nicht anwendbar. Die ARD-Ergänzung wird in einem weiteren Produktionslauf geprüft.

Der öffentliche Agent-Readiness-Scanner wechselte nach der API-/WebMCP-Veröffentlichung von **Level 3 zu Level 4: Agent Integrated**. Er erkannte den API-Katalog. Sein WebMCP-Check meldete weiterhin `NoToolsDetected`, obwohl Lighthouse und die native Live-Ausführung vier Werkzeuge nachwiesen. Diese unterschiedlichen Prüfergebnisse werden getrennt festgehalten; es wird keine künstliche Registrierung zur Anpassung an den Scanner hinzugefügt. Lokale Belege liegen unter `qa/agent-readiness-after-2026-10-07.json`, `qa/agent-live-http-2026-10-07.json` und `qa/lighthouse-agentic-2026-10-07.json` und gehören nicht zum öffentlichen Build.

Die separate [Prüfung der Indexierung und Sprach-URLs](INDEXING-2026-10-07.md) dokumentiert die tatsächlichen Search-Console-Befunde. Die Suchindexierung ist unabhängig von WebMCP und ARD.
