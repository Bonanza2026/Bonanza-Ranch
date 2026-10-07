# Bonanza Ranch · Eco Wildlife Estate

**Eine visuelle Reise in die Klein Karoo. Konzipiert, gestaltet und entwickelt als zweisprachige Website mit filmischem Einstieg, individueller Scroll-Choreografie und einer eigenen mobilen Inszenierung.**

![Bonanza Ranch – die Landschaft der Klein Karoo](public/media/hero-poster-v3.webp)

**Astro 7 · Lenis · GSAP ScrollTrigger · Deutsch / Englisch · WebP · WebM · Vercel**

Die Website führt vom ersten Landschaftseindruck über die Anreise aus Europa und Asien bis zu Tierwelt, privaten Erlebnissen und dem Sternenhimmel Südafrikas. Gestaltung, Bildsprache, Texte und Bewegung greifen dabei ineinander: großzügige Fotografie, warme Beigetöne, grüne Typografie und abgestimmte Übergänge.

Dieses Repository enthält den bearbeitbaren Astro-Quellcode, die lokalen Medien, die Animationen, die Sprachsteuerung sowie die Konfiguration für Build, Suchmaschinen und Hosting.

**Live:** [www.bonanza-ranch.com](https://www.bonanza-ranch.com/) · [Deutsch](https://www.bonanza-ranch.com/de) · [English](https://www.bonanza-ranch.com/en)

**Dokumentation:** [Hosting, Domains und Betrieb](docs/HOSTING-AND-DOMAINS.md) · [Technische Prüf- und Optimierungshistorie](docs/TECHNICAL-REVIEW.md) · [Lokale Einrichtung](#lokal-starten)

**Prüfstand vom 6. Oktober 2026:** [SEO-Audit](docs/SEO-AUDIT-2026-10-06.md) · [Agent-Readiness](docs/AGENT-READINESS-2026-10-06.md) · [Code-Herkunft](docs/CODE-PROVENANCE.md) · [Schema.org und Entitäten](docs/SCHEMA-REPORT.md)

**Ergänzung vom 7. Oktober 2026:** [Öffentliche Inhalts-API, Discovery und WebMCP-Prüfung](docs/AGENT-READINESS-2026-10-07.md) · [Indexierung und Sprach-URLs](docs/INDEXING-2026-10-07.md)

## Projektumfang auf einen Blick

| Bereich | Umsetzung |
| --- | --- |
| Gestaltung | Individuelle Bildkompositionen, redaktionelle Abschnitte, responsive Typografie und ein durchgängiges Farbkonzept |
| Medienproduktion | KI-generierte und KI-bearbeitete Bild- und Videoinhalte, Konzeptvisualisierungen sowie die Aufbereitung bereitgestellter Motive |
| Bewegung | Lenis Smooth Scrolling, GSAP-Zeitleisten, Flugzeug-Reveal, Bildzoom, Parallax, Sticky-Panels und horizontale Erlebniskapitel |
| Mobile | Eigene Flugrichtung, vertikale Kapitel, angepasste Sticky-Panels, lesbare Texte und separat abgestimmte Bildabstände |
| Sprachen | Eigene deutsche und englische Texte, manuelle Sprachwahl und automatische Ländererkennung am Einstieg |
| Suchmaschinen | Metadaten, Canonicals, Sprachverweise, Social-Media-Vorschauen, Schema.org-JSON-LD, robots.txt und XML-Sitemap |
| KI-Lesbarkeit | llms.txt, vollständige DE/EN-Inhalte in llms-full.txt, automatisch erzeugte Markdown-Seiten und HTTP-Link-Hinweise |
| Agent-Werkzeuge | Öffentliche Inhalts-API mit OpenAPI und RFC-9727-Katalog sowie vier native WebMCP-Werkzeuge im Browser |
| Medienauslieferung | WebP-Fotos, responsive Bildgrößen, WebM-Video und MP4-Kompatibilitätsfallback |
| Datenschutz | Lokale Medien und Schriften, Cookie-Hinweis, Sprachpräferenz, Impressum und Datenschutz in DE/EN |
| Technik | Statischer Astro-Build, Vercel-Middleware, Sicherheitsheader und automatisierte Integritätsprüfungen |
| Veröffentlichung | GitHub mit automatischem Vercel-Deployment, eigene Hauptdomain, drei permanente Domain-Weiterleitungen und HTTPS |
| Domainumstellung | Trennung der Domains vom bisherigen Homepage-Baukasten, externe DNS-Konfiguration und Erhalt der E-Mail-Einträge |

## Die Website als zusammenhängende Reise

### Filmischer Einstieg und Flug nach Südafrika

Der Hero verbindet ein Landschaftsvideo mit der Bonanza-Marke und einer Einladung zum Weiterentdecken. Beim Scrollen entwickelt sich daraus die Flugsequenz: Wolken, Flugzeug und Ankunftsbild werden über eine gemeinsame Animation aufeinander abgestimmt.

- Eigene Video- und Postergrößen für Mobilgeräte und Desktop.
- Der Desktop-Hero nutzt das Schriftgewicht der Südafrika-Überschrift, mit etwas kleinerem Schriftgrad und deutlichem Wortabstand. Die mobile Typografie bleibt separat abgestimmt.
- Im mobilen Video `hero-mobile-v7` folgt der Bildausschnitt dem Gepard während seiner Szene (3,625–7,750 Sekunden) sanft. Gegenüber v6 sitzt das Tier zur Feinabstimmung weitere 12 Pixel rechts im 480 Pixel breiten Video. Laufzeit und alle übrigen 254 Frames sind unverändert; WebM und MP4 verwenden neue Dateinamen für zuverlässige Cache-Aktualisierung.
- Das Poster wird zuerst decodiert; danach startet das Video.
- Auf dem Desktop bewegt sich das Flugzeug seitlich, mobil von unten nach oben.
- Die mobile Sequenz ist bewusst kürzer und reagiert mit sanftem Nachlauf auf die Scrollbewegung.
- Wenn das Video verdeckt oder außerhalb der Ansicht ist, wird es pausiert.
- Wird Autoplay vom Browser verhindert, bleibt das Poster sichtbar.

### Karte mit zwei Anreiserouten

Die Karte ordnet die Ranch geografisch ein. Animierte Routen führen aus **Europa und Asien** nach Kapstadt. Beide erreichen ihr Ziel gleichzeitig; anschließend führt die gemeinsame Strecke über George in Richtung Klein Karoo.

Die Routen werden als SVG-Pfade gezeichnet und anhand des Scrollfortschritts animiert. Mobil sind Karte und Erklärung getrennt angeordnet, damit Ortsnamen und Text lesbar bleiben. Die Reliefkarte verwendet eine ausgewiesene Esri-Kartenquelle und stellt eine schematische Anreise dar.

### Bildtriptychon und Ranch-Porträt

Auf „Afrikas Wildnis. Ihr privater Rückzugsort.“ folgen drei Tiermotive mit der Löwin im Zentrum. Eine gemeinsame GSAP-Zeitleiste steuert den Zoom und die seitlichen Bilder. Dadurch bleiben Bewegung und Zwischenräume synchron.

Mobil verteilt sich der Zoom über eine längere Scrollstrecke, bevor der folgende Abschnitt das Bild überlagert. Das Ranch-Porträt verbindet die Landschaft mit den getrennt dargestellten Flächenangaben:

- **6.300 Hektar Bonanza Ranch.**
- **Weitere 36.000 Hektar umgebendes Wildtierschutzgebiet.**

### Natur als Sticky-Bildgeschichte

Die Kapitel „Natur erleben“, „Zeit vergessen“ und „Freiraum bewahren“ kombinieren Tierbilder mit kurzen Texten. Die Panels bleiben beim Scrollen gestaffelt stehen; ihre Kapitelzeilen geben Orientierung.

Die mobile Variante berücksichtigt unterschiedlich hohe Inhalte. Auch längere Texte und die Bilder am Ende eines Panels bleiben erreichbar. Nach dem letzten Vogelbild schließt die Tierwelt mit einem schmalen, einheitlichen Bildabstand an.

### Erlebnisse: horizontal am Desktop, vertikal auf dem Handy

Die Erlebniskapitel umfassen Tierwelt, Reiten, Ranger-Ausfahrten, Wasser, Wandern und Biken, Sport, lange Abende, Service sowie Sicherheit und Versorgung.

**Desktop:** Die Scrollbewegung führt durch eine horizontale Bilderfolge. Die Bilder haben eine gemeinsame Höhe; je nach Motiv kommen quadratische oder breite Formate zum Einsatz. Die dezente Bild-Parallax bewegt sich passend dazu horizontal. Texte stehen in konsistent aufgebauten Spalten neben den Bildern.

**Mobil:** Die Kapitel stehen in einer vertikalen Lesereihenfolge. Überschriften sind zentriert, Bild- und Textabstände wiederholen sich. Parallax und Bildformate sind an den schmalen Bildschirm angepasst. Der Sicherheitslink führt direkt zum zugehörigen Text, auch wenn davor mehrere Bilder stehen.

### Sternenhimmel und abschließender Bilderkreis

Der Sternenhimmel bildet den ruhigen Abschluss der Erlebnisse. Auf dem Desktop liegt der Text im eingerahmten Bild. Mobil steht er darunter auf dem beigen Hintergrund, damit die Milchstraße vollständig wirken kann.

Anschließend bewegen sich Bilder in einer flachen Kreisbahn um den Abschlusstext. Die Bewegung ist pausierbar und läuft nur, wenn der Bereich im Blickfeld liegt. Dieser Bilderkreis wird mit DOM-Elementen und GSAP umgesetzt.

## Gestaltung und KI-gestützte Medienproduktion

Zur Umsetzung gehören Bildauswahl, KI-gestützte Motivproduktion und Bearbeitung, Videoaufbereitung, Formatvarianten und die Integration in die jeweilige Scroll-Szene. Ziel ist eine zusammenhängende, fotografisch wirkende Bildsprache mit natürlichen Lichtstimmungen, Landschaften und Materialien.

| Produktionsbaustein | Ausarbeitung |
| --- | --- |
| Bilder und Konzepte | KI-generierte und KI-bearbeitete Motive für Landschaft, Tierwelt und illustrative Konzeptdarstellungen; Integration bereitgestellter Bilder |
| Video | KI-gestützte Videoassets, Aufbereitung als Hero-Sequenz, separate Desktop- und Mobile-Exporte sowie passende Standbilder |
| Bildformate | Motivgerechte Auswahl von Breitbild, Quadrat und Hochformat; angepasste Bildpositionen und responsive Größen |
| Motion | Individuell programmierte Scroll-Zeitleisten, Masken, Flugbewegungen, Zoom, Parallax und Kreisbewegung |
| Auslieferung | Lokales Hosting, WebP-Konvertierung, WebM-Encoding, Lazy Loading und gezielte Priorisierung des Einstiegs |

Die Scroll-Motion ist im Quellcode bearbeitbar. Sie wird nicht als ein einziges langes Video abgespielt. Geschwindigkeit, Abstand, Flugrichtung und Verhalten auf Mobilgeräten lassen sich getrennt abstimmen.

Konzeptmotive werden an den entsprechenden Stellen als **Konzeptvisualisierung** bezeichnet. Die technische Aufbereitung von Medien ist unter anderem in [media-optimization.json](docs/media-optimization.json) dokumentiert; Generierungsbeispiele finden sich in [generated-editorial-images.json](docs/generated-editorial-images.json). Diese Dateien dokumentieren Produktionsschritte, nicht lückenlos die Herkunft jedes einzelnen Assets. Kartenmaterial, Schriften und Markenbestandteile sind eigenständige Ressourcen.

### Visuelles System

- Warmer, heller Hintergrund: `#f5eee9`.
- Grüne Akzent- und Überschriftenfarbe: `#5c6e21`.
- Dunkle Textfarbe: `#1e211c`.
- **PP Fragment** für die charakteristische Display-Typografie.
- **Inter** für Fließtext, Navigation und Bedienoberflächen.
- Abgestimmte Navigation, Kontaktwege, Footer und Cookie-Einstellungen.

## Schriften: direkt im Projekt gespeichert

Die Website verwendet **selbst gehostete Schriftdateien**. Sie liegen in `public/fonts` und werden über lokale `@font-face`-Definitionen von derselben Domain wie die Website geladen. Es werden keine Google-Fonts- oder Adobe-Fonts-Dienste eingebunden.

Aktuell prägen diese Dateien das Design:

| Schrift | Lokale Datei | Einsatz |
| --- | --- | --- |
| PP Fragment Glare Variable | `public/fonts/PPFragment-GlareVariable.woff` | Große Überschriften und Display-Typografie |
| Inter Regular | `public/fonts/Inter-Regular.woff2` | Fließtexte und Navigation |
| Inter Medium | `public/fonts/Inter-Medium.woff2` | Mittlere Schriftstärke |

Die wichtigsten Fonts werden vorgeladen. `font-display: swap` ermöglicht die Textdarstellung auch während des Ladens.

Die mitgelieferten Open-Font-Lizenztexte liegen ebenfalls im Projekt: [Inter](public/fonts/Inter-OFL.txt), [Inter Tight](public/fonts/InterTight-OFL.txt), [Oswald](public/fonts/Oswald-OFL.txt) und [Cormorant Garamond](public/fonts/CormorantGaramond-OFL.txt).

**Hosting und Lizenz sind getrennte Fragen:** Die lokale Auslieferung ist implementiert. Inter steht unter der [SIL Open Font License](https://rsms.me/inter/). Für PP Fragment ist die passende kommerzielle Webfont-Lizenz gemäß den [Lizenzbedingungen des Herstellers](https://pangrampangram.com/pages/faq) erforderlich. Ein Kauf- oder Domain-Lizenznachweis liegt diesem Repository nicht bei und muss beim Betreiber bzw. Auftraggeber vorhanden sein. Dass eine Datei im Projekt liegt, bestätigt keine Nutzungs- oder Weitergaberechte; das gilt auch für weitere Schriftdateien im Bestand und deren Veröffentlichung in einem öffentlichen Repository.

## Technischer Aufbau

| Technologie | Aufgabe im Projekt |
| --- | --- |
| **Astro 7.3.3** | Komponenten, Seiten, gemeinsame Layouts und statische HTML-Ausgabe |
| **TypeScript / JavaScript** | Interaktionen, Mediensteuerung, Navigation und Animation |
| **Lenis 1.3.26** | Geglättetes Wheel-Scrolling, abgestimmt auf den gemeinsamen GSAP-Takt |
| **GSAP 3.15.0** | Zeitachsen, Transformationen und Übergänge |
| **ScrollTrigger** | Bindung von Animationen und horizontalen Kapiteln an die Scrollposition |
| **CustomEase** | Easing für die Menüanimation; Flugrouten verwenden die native SVG-Geometrie |
| **Vercel Functions / Middleware** | Länderkennung und Sprachauswahl an der Hauptadresse |
| **PurgeCSS 7.0.2 + Cheerio** | Bereinigung generierter Styles unter Erhalt dynamischer Animationszustände |
| **Node.js Test Runner** | Automatisierte Prüfungen für Routing, Metadaten, Medien und Seitenintegrität |

Der abschließende Bilderkreis verwendet DOM/GSAP. Three.js, das ungenutzte WebGL-Galeriemodul und die alten Referenzadapter wurden entfernt. Navigation und Cursor haben eigene Projektmodule; die gemeinsame Basisgestaltung liegt in `src/styles/site-base.css`. Details stehen in [CODE-PROVENANCE.md](docs/CODE-PROVENANCE.md).

PurgeCSS 7.0.2 nutzt `postcss-selector-parser` 7.1.6 über ein gezieltes npm-Override. Damit entfällt die betroffene Braces-Abhängigkeit aus PurgeCSS 8, und der ältere Selektorparser wird durch die korrigierte Version ersetzt. Ein Vergleich mit denselben Optionen und dem aktuellen Basisstylesheet ergab identische bereinigte CSS-Ausgabe.

Astro erzeugt die Inhalte beim Build als statische Seiten. Animationen und Bedienelemente werden durch die jeweiligen Skripte ergänzt. Für den Betrieb der Website ist kein CMS und keine eigene Datenbank vorgesehen.

## Deutsch, Englisch und automatische Ländererkennung

Die Website enthält **eigene deutsche und englische Textfassungen**. Die Sprachsteuerung wählt die passende Fassung aus; sie übersetzt Texte nicht während des Besuchs maschinell.

Beim Aufruf der Hauptadresse `/` entscheidet die Vercel-Middleware vor der Auslieferung:

| Situation | Ergebnis |
| --- | --- |
| Besucherland Deutschland (`DE`) | HTTP 307 zur deutschen Startseite `/de` |
| Anderes Land, z. B. Südafrika, Polen, China, Japan, Singapur oder Indien | Weiterleitung zur englischen Startseite `/en` |
| Länderkennung nicht verfügbar | Englisch |
| Zuvor bewusst gewählte Sprache | Gespeicherte Sprachwahl hat Vorrang |
| Direkter Aufruf von `/de` oder `/en` | Die ausdrücklich verlinkte Sprachfassung bleibt erhalten |

**Für international geteilte Links die Hauptadresse ohne `/de` verwenden.** Die direkte deutsche URL bleibt absichtlich Deutsch, damit Sprachlinks eindeutig und teilbar sind.

Die Sprachwahl über DE/EN wird für 180 Tage gespeichert. `translate="no"` und die `notranslate`-Metadaten signalisieren Übersetzungsdiensten, die redaktionellen Texte nicht erneut zu übersetzen. So werden missverständliche automatische Übertragungen wie „Speisekarte“ für „Menu“ vermieden, soweit der jeweilige Übersetzungsdienst diese Vorgaben beachtet.

Die lokale Astro-Vorschau führt die Vercel-Middleware nicht aus. Die Länderlogik wird automatisiert getestet und muss im Hosting über Vercel bereitgestellt werden.

## SEO, Sitemap und Orientierung für KI-Systeme

### Suchmaschinen-Grundlagen

- Sprachabhängige Seitentitel und Meta-Beschreibungen.
- Canonical-URLs zur eindeutigen Zuordnung der Seiten.
- Gegenseitige `hreflang`-Verweise für Deutsch und Englisch sowie `x-default`.
- Open-Graph- und Twitter-Card-Metadaten mit Vorschaubild.
- Semantische Überschriften, Bildbeschreibungen und stabile Abschnitts-IDs.
- Inhalte stehen im erzeugten HTML und sind nicht erst nach dem Abspielen der Animation verfügbar.

### Schema.org und Entitäten

Alle sechs kanonischen Seiten enthalten einen beim Astro-Build erzeugten JSON-LD-Graphen. Er trennt **SKYWIND SOUTH AFRICA (PTY) LTD** als rechtlichen Betreiber (`Organization`) von der Bonanza-Marke (`Brand`) und der Ranch in der Klein Karoo (`Place`). Die Website (`WebSite`) und jede deutsche beziehungsweise englische Seite (`WebPage`) sind über stabile, absolute IDs miteinander verbunden. Auf den Startseiten kommt das tatsächliche Giraffen-Titelbild als `ImageObject` hinzu.

Titel, Beschreibungen, Sprache und URLs entsprechen den HTML-Metadaten. Die Korrespondenzanschrift des Betreibers wird nicht als Ranch-Standort ausgegeben. Angebote, Preise, Bewertungen und Unternehmensprofile werden nur ergänzt, wenn die entsprechenden Angaben bestätigt und veröffentlicht sind.

Quellmodule: [structured-data.mjs](src/content/structured-data.mjs), [operator.mjs](src/content/operator.mjs) und [site-metadata.mjs](src/content/site-metadata.mjs). Der [Schema-Bericht](docs/SCHEMA-REPORT.md) erklärt Datenquellen, Prüfungen und bewusst ausgelassene Eigenschaften. JSON-LD garantiert keine bestimmte Darstellung oder Platzierung in Suchmaschinen.

### robots.txt

Die Datei erlaubt das Crawlen der öffentlichen Website und verweist auf die Sitemap. Sie wird beim Build aus der zentralen Domain-Konfiguration erzeugt. Zusätzlich zur allgemeinen Freigabe sind Suchmaschinen und KI-Crawler wie OAI-SearchBot, ChatGPT-User, PerplexityBot und ClaudeBot ausdrücklich aufgeführt.

Der ergänzende `Content-Signal` benennt die Freigabe für Suche, KI-Eingaben und Training. Das ist eine optionale Erweiterung; die tatsächliche Beachtung hängt vom jeweiligen Dienst ab. robots.txt ersetzt weder Authentifizierung noch Firewall-Regeln.

Quellcode: [src/pages/robots.txt.ts](src/pages/robots.txt.ts)

### sitemap.xml

Die XML-Sitemap enthält die sechs kanonischen Sprachseiten: Startseite, Impressum und Datenschutz jeweils auf Deutsch und Englisch. Sie verwendet das grundlegende Sitemap-XML-Format ohne XHTML-Erweiterung. Die zugehörigen Sprachalternativen stehen als `hreflang`-Links im HTML-Kopf jeder Seite. Reine Weiterleitungsadressen werden nicht zusätzlich als eigenständiger Inhalt eingetragen.

Quellcode: [src/pages/sitemap.xml.ts](src/pages/sitemap.xml.ts)

### llms.txt

Die projektspezifische Datei fasst die Ranch, ihre Lage, die getrennten Flächenangaben, die Sprachvarianten sowie Kontakt- und Inhaltsverweise in lesbarem Markdown zusammen. Sie verlinkt auf die tatsächlichen Seiten und erklärt den Status gekennzeichneter Konzeptbilder.

Das unterstützt die Orientierung von KI- und Recherchewerkzeugen. Eine garantierte Aufnahme, Zitierung oder Platzierung durch Suchmaschinen oder KI-Dienste ist damit nicht verbunden.

Quellcode: [src/pages/llms.txt.ts](src/pages/llms.txt.ts)

### Markdown-Ausgabe und llms-full.txt

Nach dem Astro-Build und der CSS-Bereinigung erzeugt [scripts/generate-agent-content.mjs](scripts/generate-agent-content.mjs) aus den fertigen HTML-Seiten sechs Markdown-Dokumente: Startseite, Impressum und Datenschutz jeweils auf Deutsch und Englisch. Ihre Quelle sind die tatsächlich veröffentlichten Inhalte. Es gibt keine zusätzliche, unabhängig zu pflegende Textkopie.

- `/_agent-markdown/de.md` und `/_agent-markdown/en.md`: die beiden Startseiten.
- `/_agent-markdown/impressum.md` und `/_agent-markdown/en/legal.md`: Betreiberangaben.
- `/_agent-markdown/datenschutz.md` und `/_agent-markdown/en/privacy.md`: Datenschutz.
- `/llms-full.txt`: alle sechs Dokumente in einer zusammenhängenden Fassung.

Die Markdown-Dokumente enthalten Überschriften, Texte, Listen, öffentliche Links und beschriebene Bilder. Ausführbarer Code, dekorative Elemente, Player-Steuerung und doppelte Navigation entfallen. Konzeptkennzeichnungen und rechtliche Angaben bleiben im Inhalt erhalten.

Auf Vercel führt ein ausdrücklicher Request mit **`Accept: text/markdown`** von einer der sechs Seiten per **HTTP 307** zur passenden Markdown-Datei. Diese liefert **`Content-Type: text/markdown; charset=utf-8`**. Browser ohne diesen Header sowie Requests mit `text/markdown;q=0` erhalten die normale HTML-Seite. Die Root-Adresse `/` berücksichtigt auch für Markdown zuerst die Länderkennung oder die gespeicherte Sprachwahl.

HTTP-`Link`-Header und Links im HTML-Head machen `llms.txt`, `llms-full.txt` beziehungsweise die passende Markdown-Datei auffindbar. Die zusätzlichen Textfassungen tragen `X-Robots-Tag: noindex, follow`, damit die kanonischen HTML-Seiten für die Suchindexierung maßgeblich bleiben. Die Auslieferung hängt nicht von einem JavaScript-Rendering oder vom Abspielen der Scroll-Animationen ab.

Diese Ergänzungen orientieren sich an der Qilano-Auslieferung und sind an Bonanzas zwei Sprachen angepasst. Sie garantieren nicht, dass jedes KI-Lesetool eine Domain abrufen kann. Vercel-Login-Schutz und Firewall-Einstellungen sind eigene Hosting-Ebenen und werden durch diese Dateien nicht abgeschaltet.

### Öffentliche Inhalts-API und API-Katalog

Der Build erzeugt aus denselben veröffentlichten HTML- und Markdown-Inhalten eine **öffentliche, ausschließlich lesende JSON-API**. Sie benötigt keinen API-Schlüssel. Die sechs Dokumentkennungen sind `de`, `en`, `impressum`, `en-legal`, `datenschutz` und `en-privacy`.

| Adresse | Inhalt |
| --- | --- |
| `/api/content/index.json` | Verzeichnis der sechs Dokumente mit Sprache, Titel, Beschreibung und kanonischen URLs |
| `/api/content/{documentId}.json` | Metadaten und vollständiger Markdown-Inhalt des ausgewählten Dokuments |
| `/.well-known/api-catalog` und `/api-catalog.json` | Identischer Linkset-Katalog nach [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html) mit Verweisen auf API, Spezifikation und Dokumentation |
| `/openapi.json` | OpenAPI 3.1.1 mit den beiden tatsächlichen GET-Operationen und ihren Antwortschemas |
| `/api/docs.html` | Direkt lesbare API-Dokumentation mit Beispielen |
| `/.well-known/ard.json` und `/.well-known/ai-catalog.json` | Identische Discovery-Dateien mit Verweis auf die tatsächliche öffentliche Inhalts-API |

Der Katalog wird über HTML-Links und HTTP-`Link`-Header angekündigt. Die Verträge stehen in [agent-api.mjs](agent-api.mjs); [generate-agent-content.mjs](scripts/generate-agent-content.mjs) erzeugt die Dateien. Es gibt keine Buchungs-, Nachrichtenversand- oder Zahlungsoperation. Die API dokumentiert die vorhandenen Seiteninhalte und übernimmt deren Aktualisierungen bei jedem Build.

[agent-discovery.mjs](agent-discovery.mjs) beschreibt dieselbe OpenAPI-Spezifikation im [ARD-Vorschlagsformat](https://agenticresourcediscovery.org/spec/). Die aktuelle ARD-Adresse und die von Lighthouse verwendete Vorgängeradresse `ai-catalog.json` sind über HTML- und HTTP-Link-Verweise auffindbar. Der Eintrag nennt ausschließlich die tatsächlich bereitgestellten Leseoperationen. RFC-9727-API-Katalog und ARD haben verschiedene Aufgaben und werden getrennt ausgeliefert.

### Native WebMCP-Werkzeuge

[src/scripts/webmcp.mjs](src/scripts/webmcp.mjs) stellt vier Werkzeuge für unterstützende Browser und deren Agenten bereit:

| Werkzeug | Funktion |
| --- | --- |
| `read_bonanza_page` | Eines der sechs veröffentlichten Dokumente über die Inhalts-API lesen |
| `navigate_bonanza_section` | Anreise, Natur, Erlebnisse, Sicherheit oder Kontakt über die vorhandene Navigation öffnen |
| `get_bonanza_contact` | Die tatsächlich angezeigte öffentliche Kontaktadresse auslesen |
| `open_bonanza_contact` | Den bestehenden Kontaktdialog anzeigen |

Die Werkzeuge versenden keine Nachricht. Ihre Eingaben sind auf die vorhandenen Dokumente und Kapitel begrenzt. Abbruchsignale und das Aufräumen beim Verlassen beziehungsweise Verbergen der Seite sind umgesetzt. Die beiden Lesewerkzeuge sind mit `readOnlyHint` gekennzeichnet; Navigation und Dialogöffnung ändern die lokale Ansicht.

Die Registrierung erfolgt nach Erkennung der **nativen `document.modelContext.registerTool`-Schnittstelle**, mit einem Kompatibilitätszweig für `navigator.modelContext`. Ohne Browserunterstützung bleibt die gewöhnliche Website nutzbar. Ein separat erreichbarer MCP-Server wird durch diese Browserintegration nicht bereitgestellt.

Für **Chrome 149–162** ist die Teilnahme am WebMCP Origin Trial eingerichtet. Die Registrierung wurde am **7. Oktober 2026** über [Google Chrome Origin Trials](https://developer.chrome.com/origintrials/) für exakt `https://www.bonanza-ranch.com` abgeschlossen. Sie läuft bis **30. März 2027** und schließt Subdomains nicht ein. Diese Browserfreischaltung wird dort verwaltet; die Google Search Console dient der Suchindexierung.

Der öffentliche, an diese Origin gebundene Token steht in [webmcp-trial.mjs](webmcp-trial.mjs). Das Layout gibt ihn nur für die passende Domain und vor Ablauf als `origin-trial`-Meta-Tag aus. Vor Ablauf muss die Teilnahme erneuert und der Token aktualisiert werden. Ein Token kann auch über `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` beim Build vorgegeben werden. Bei einem Domainwechsel ist eine passende neue Registrierung nötig. Für lokale Tests unterstützt Chrome außerdem das in der [WebMCP-Dokumentation](https://developer.chrome.com/docs/ai/webmcp) beschriebene Test-Flag.

Alle vier Werkzeuge wurden im lokalen Browser und auf der Produktionsdomain über die native Schnittstelle erfolgreich ausgeführt. Ob ein bestimmter KI-Dienst sie verwendet, hängt von dessen Browserintegration ab. Der Prüfbericht dokumentiert die gemessene Lighthouse-Wertung und die davon getrennte Einstufung des öffentlichen Scanners.

Ein Kontaktformular ist auf dieser Website nicht vorhanden: Kontakt erfolgt per E-Mail-Link und Kontaktdialog. Deklaratives WebMCP für HTML-Formulare ist deshalb hier nicht anwendbar. Die tatsächlichen Funktionen und Prüfgrenzen stehen im [Prüfbericht vom 7. Oktober](docs/AGENT-READINESS-2026-10-07.md).

### Eine zentrale Domain-Konfiguration

`site.config.mjs` steuert Canonicals, Sprachalternativen, Sitemap, robots.txt und llms.txt. Mit `SITE_URL` wird die öffentliche HTTPS-Domain festgelegt. Nach einem Domainwechsel werden alle diese Verweise durch einen neuen Build gemeinsam aktualisiert.

## Medien und Performance

Die Auslieferung ist auf große Bildwelten bei möglichst wenig unnötigem Datentransfer abgestimmt:

- **WebP für die eingebundenen Fotos**, SVG für geeignete Vektorgrafiken.
- Responsive `srcset`-Varianten, beispielsweise 640, 960 und 1672 Pixel breit bei aktuellen Bildmotiven.
- WebM als bevorzugtes Hero-Videoformat; MP4 dient als Kompatibilitätsfallback.
- Getrennte mobile und Desktop-Videoquellen, statt beide Größen parallel zu laden.
- Responsive Hero-Poster mit zum Bildschirm passendem Preload.
- Hero-Autoplay beginnt erst nach dem dekodierten Poster und dem tatsächlich gemeldeten ersten sichtbaren Seitenaufbau (First Contentful Paint). Frühe Berührungen ziehen den Videodownload nicht vor. Browser ohne Paint Timing erhalten einen Zweiframe-Fallback.
- Lazy Loading und asynchrones Decoding bei nachfolgenden Bildern, soweit in der jeweiligen Komponente vorgesehen.
- Das später enthüllte Südafrika-Bild und die drei Tierporträts erhalten ihre Bildquellen erst mit ausreichendem Scroll-Vorlauf. So laden verdeckte Sticky-Bilder nicht bereits mit dem Hero; vollständige `noscript`-Bilder erhalten den Inhalt ohne JavaScript. Die Markdown-Ausgabe enthält weiterhin die Bildreferenzen.
- Lokal gespeicherte Inter-Schriften werden für lateinische und erweiterte lateinische Zeichen als kleinere WOFF2-Dateien ausgeliefert. Konturen, Laufweiten und Kerning bleiben identisch; andere Schriftsysteme nutzen die vollständigen Originalfonts als getrennten Unicode-Fallback. PP Fragment bleibt bytegleich und wird korrekt als WOFF2 eingebunden.
- Gezielter Ladevorlauf im Erlebnisbereich: Bilder bis zu zwei Bildschirmbreiten bzw. -höhen vor der sichtbaren Ansicht werden früher angefordert. Der zusätzliche Vorlauf startet höchstens zwei Bilder gleichzeitig und berücksichtigt die tatsächlichen Positionen im horizontal bewegten Kapitel. Bilddateien, Auflösung und responsive Quellen bleiben unverändert.
- Der separat aufrufbare Film erhält seine Medienquelle erst beim Öffnen.
- Pausieren des Hero-Videos bei verdecktem oder nicht sichtbarem Inhalt.
- Berücksichtigung von `prefers-reduced-motion`, einschließlich Verzicht auf den automatischen Hero-Videodownload.
- Gemeinsamer GSAP-Takt für Lenis und Animationen.
- Browserleisten-bedingte Höhenänderungen auf Mobilgeräten lösen nicht ständig neue Scroll-Messungen aus.
- Build-seitige CSS-Bereinigung unter Berücksichtigung dynamischer Klassen, Schriftdefinitionen und Animationen.

Ältere Medienvarianten und Ausgangsformate bleiben teilweise im Repository erhalten. Das bedeutet nicht, dass die aktuelle Seite sie alle lädt. Historische Performance-Messungen und Optimierungsschritte stehen in [TECHNICAL-REVIEW.md](docs/TECHNICAL-REVIEW.md); sie sind keine Messwerte für jeden späteren Stand der Website.

## Bedienbarkeit, Datenschutz und technische Schutzmaßnahmen

### Bedienbarkeit

Die Website besitzt einen Skip-Link, beschriftete Bedienelemente, alternative Bildtexte, sichtbare Fokuszustände und eine pausierbare Bilderkreis-Bewegung. Bei reduzierter Bewegung wird die aufwendige Scroll-Inszenierung zurückgenommen. E-Mail-Links führen direkt zum hinterlegten Kontakt.

Ankerlinks zu horizontalen Kapiteln werden in passende Scrollpositionen umgerechnet. So erreichen Besucher beispielsweise den Sicherheitstext direkt, statt nur das erste Bild des Abschnitts zu sehen. Eingehende Kapitel-Links werden nach der Initialisierung und den relevanten Layout-Messungen ausgerichtet.

### Datenschutzfunktionen

- Deutsch- und englischsprachiges Impressum und Datenschutzseiten.
- Lokale Bild-, Video- und Font-Auslieferung.
- Keine eingebundenen Analyse- oder Marketingdienste im aktuellen Projektstand.
- Kein Resend-Versand und kein Kontaktformular-Backend; Kontakt erfolgt per E-Mail-Link.
- Sprachcookie `bonanza_language` nach bewusster DE/EN-Auswahl.
- Lokaler Eintrag `bonanza_cookie_notice` zum Merken des geschlossenen Cookie-Hinweises, mit zeitlicher Begrenzung.
- Cookie-Einstellungen sind im Footer erneut erreichbar.
- Die Länderkennung kommt vom Hosting-Anbieter; es wird keine Standortfreigabe im Browser abgefragt.

### Sicherheitsheader

`vercel.json` konfiguriert unter anderem:

| Header | Funktion |
| --- | --- |
| `Content-Security-Policy` | Beschränkt zulässige Quellen für Skripte, Medien, Schriften und Verbindungen; blockiert fremde Einbettung und Formularversand |
| `X-Content-Type-Options: nosniff` | Verhindert unerwünschtes Erraten von Inhaltstypen |
| `X-Frame-Options: DENY` | Verhindert die Einbettung der Website in Frames |
| `Referrer-Policy: strict-origin-when-cross-origin` | Begrenzt übermittelte Referrer-Informationen |
| `Permissions-Policy` | Deaktiviert unter anderem Kamera, Mikrofon, präzise Browser-Geolokalisierung, Zahlung und USB-Zugriff |

Ausführbare Skripte werden lokal ausgeliefert. Inline-Stile bleiben für die dynamischen Positionen und Animationen zulässig. Betreiber-, Hosting-, Lizenz- und Datenschutzangaben müssen bei einem Anbieter- oder Betriebswechsel entsprechend aktualisiert werden. Die technischen Maßnahmen ersetzen keine Prüfung der konkreten Betreiberverhältnisse und Nutzungsrechte.

## Lokal starten

Voraussetzungen: **Node.js ab 22.12.0** und **npm ab 9.6.5** entsprechend der verwendeten Astro-Version.

```bash
git clone https://github.com/Bonanza2026/Bonanza-Ranch.git
cd Bonanza-Ranch
npm ci
npm run dev
```

Die lokale Website ist unter `http://127.0.0.1:4323/` erreichbar. Die Sprachfassungen lassen sich direkt über `/de` und `/en` öffnen.

| Befehl | Aufgabe |
| --- | --- |
| `npm run dev` | Lokaler Entwicklungsserver |
| `npm run build` | Statische Website erzeugen und CSS bereinigen |
| `npm run preview` | Den erzeugten Build lokal anzeigen |
| `npm test` | Automatisierte Tests gegen den vorhandenen Build ausführen |
| `npm run qa` | Erst bauen, anschließend alle automatisierten Tests ausführen |

## Deployment auf Vercel

### Eingerichteter Produktionsbetrieb

| Einstellung | Aktueller Stand |
| --- | --- |
| GitHub-Repository | [Bonanza2026/Bonanza-Ranch](https://github.com/Bonanza2026/Bonanza-Ranch) |
| Produktionsbranch | `main` |
| Vercel-Projekt | `bonanza-ranch` im Team `bonanza2026` |
| Veröffentlichung | Ein Push auf `main` stößt über die GitHub-Verbindung einen neuen Vercel-Build an |
| Framework / Build / Ausgabe | Astro · `npm run build` · `dist` |
| Öffentliche Hauptadresse | `https://www.bonanza-ranch.com` |
| Weitere Domains | `bonanza-ranch.com`, `bonanzaranch.co.za`, `www.bonanzaranch.co.za` |
| Domain-Weiterleitung | Alle drei Varianten führen per HTTP **308** zur Hauptadresse; Pfad und URL-Parameter bleiben erhalten |
| DNS und E-Mail | Weiterhin bei united-domains; Web-DNS zeigt auf Vercel |
| HTTPS | Zertifikatsbereitstellung über Vercel; alle vier Domain-Zuordnungen wurden geprüft |

Die Weiterleitung von `bonanza-ranch.com` nach `www.bonanza-ranch.com` steht als Host-Regel in `vercel.json`. Für den Einstieg `/` führt auch die Sprach-Middleware zuerst diese Host-Weiterleitung aus. Die beiden `.co.za`-Adressen führen über ihre bestehenden Vercel-Domain-Einstellungen zuerst zur Adresse ohne `www` und dann zur Hauptadresse: zwei dauerhafte Weiterleitungsschritte. `www.bonanza-ranch.com` ist direkt mit Production verbunden.

Die Domains wurden vom bisherigen Homepage-Baukasten getrennt und für Vercel eingerichtet. Das war eine Umstellung der Web-Zuordnung, kein Domaintransfer und keine Kündigung der bestehenden Baukastenverträge. Mailserver-, SPF- und DKIM-Einträge wurden erhalten.

**Der vollständige Betriebsleitfaden steht in [HOSTING-AND-DOMAINS.md](docs/HOSTING-AND-DOMAINS.md):** genaue A- und CNAME-Werte, Weiterleitungen, HTTPS-Prüfung, Sprachsteuerung, Veröffentlichung, Fehlerdiagnose und Rücknahme einer fehlerhaften Codeänderung. Die Provider-Einstellungen stehen nicht vollständig im Git-Repository und müssen bei einem Projektumzug separat übernommen werden.

### Domain-Konfiguration im Quellcode

Der Code verwendet seit dem 4. Oktober 2026 `https://www.bonanza-ranch.com` als Standard. **Keine zusätzliche `SITE_URL`-Umgebungsvariable in Vercel ist gesetzt oder nötig.** Für einen späteren Domainwechsel kann der Wert ausdrücklich überschrieben werden:

```env
SITE_URL=https://www.bonanza-ranch.com
```

Nach einer Änderung ist ein neuer Build erforderlich. Die Vorlage befindet sich in [.env.example](.env.example). Lokale `.env`-Dateien werden nicht eingecheckt. Bei einem Domainwechsel außerdem die Host-Weiterleitung in `vercel.json` und die Domain-Zuordnungen im Vercel-Dashboard anpassen. DNS-Ziele werden beim Registrar verwaltet.

Die statischen Dateien liegen nach dem Build in `dist`. Vercel übernimmt zusätzlich die Root-Middleware, die Header-Konfiguration sowie die Host- und Markdown-Weiterleitungen aus `vercel.json`. Ein reiner statischer Dateiserver bildet diese Hosting-Funktionen nicht automatisch nach. Die erzeugten Markdown-Dateien selbst lassen sich auch in der lokalen Vorschau direkt öffnen.

## Qualitätssicherung

Der Stand vom **7. Oktober 2026** besteht den Build und **58 automatisierte Tests**. Dazu gehören die API-Verträge und erzeugten Inhalte, ARD- und API-Kataloge, die WebMCP-Eingabegrenzen, Abbruchsignale und Registrierungszyklen sowie Sprach-, Slash- und Kapitelweiterleitungen. Zusätzlich geprüft werden die Startreihenfolge von Poster und Video, Bildquellen bei Scroll- und Cache-Wiederherstellung, JavaScript-freie Bildfallbacks und die WOFF2-/Unicode-Auslieferung. Die vier WebMCP-Werkzeuge wurden zusätzlich lokal und auf der Produktionsdomain über die native Schnittstelle aufgerufen. Die Einzelprüfungen dokumentieren [AGENT-READINESS-2026-10-07.md](docs/AGENT-READINESS-2026-10-07.md), [INDEXING-2026-10-07.md](docs/INDEXING-2026-10-07.md) und [PERFORMANCE-2026-10-07.md](docs/PERFORMANCE-2026-10-07.md).

Nach Veröffentlichung bestanden **87/87 öffentliche HTTP-Prüfungen**. Der aktuelle Live-Lauf mit **Lighthouse 13.5.0 / Chrome 152** zeigt **5/5 Agentic Browsing**: native Werkzeuge und gültige Eingabeschemas, gültiger AI-Katalog, llms.txt und stabile Seitenstruktur. Formularabdeckung bleibt mangels Kontaktformular nicht anwendbar. Der öffentliche Agent-Readiness-Scanner meldet unabhängig davon **Level 4: Agent Integrated**; seine abweichende WebMCP-Erkennung und der niedrige OpenAPI-Medienarten-Hinweis in Lighthouse sind im Prüfbericht festgehalten.

Der dokumentierte Stand vom **6. Oktober 2026** besteht den Produktionsbuild und **25 automatisierte Tests**. `npm audit` meldet für sämtliche geprüften Produktions- und Entwicklungsabhängigkeiten **keine bekannten Sicherheitslücken**. Geprüft werden unter anderem:

- Deutschland → Deutsch; andere und unbekannte Länder → Englisch.
- Vorrang einer gespeicherten Sprachwahl und Umgang mit ungültigen Cookie-Werten.
- Unveränderte explizite Sprachseiten, Assets und Rechtslinks.
- Erhalt von URL-Parametern bei der Weiterleitung.
- Weiterleitung des Einstiegs ohne `www` vor der Auswahl nach Land, Sprachcookie oder Markdown-Anfrage.
- Auflösbare Links in robots.txt, llms.txt und Sitemap.
- Markdown-Abruf mit positiven `Accept`-Gewichtungen, Ausschluss von `q=0` und unveränderte Sprachpräferenzen.
- Vollständige Markdown-Ziele für alle kanonischen Seiten, Inhalte in beiden Sprachen, Link-Header und korrekte Antworttypen.
- Übereinstimmung von Canonicals, Sitemap und Sprachalternativen.
- JSON-LD mit eindeutigen Entitäten, auflösbaren IDs und Angaben, die mit den HTML-Metadaten übereinstimmen.
- Sichere JSON-LD-Serialisierung und getrennte Anschriften für rechtlichen Betreiber und Ranch.
- Eigene deutsche und englische Beschreibungen der rechtlichen Seiten sowie die öffentliche Bonanza-Kontaktadresse.
- Lokale ausführbare Skripte und keine Inline-Eventhandler im erzeugten HTML.
- Passende Hero-Poster und Preloads.
- Keine unnötigen parallelen Videoquellen und kein Vorladen des ungeöffneten Films.
- Korrekte DE/EN-Menütexte und eindeutige Footer-Sprungziele.
- Auswahl der zur Bildschirmgröße passenden Videoquelle mit Fallback.
- Bildladevorlauf ohne Änderung der Bildquellen, begrenzte parallele Vorbereitung, Verhalten bei Sprungnavigation und Ladefehlern sowie Aufräumen beim Verlassen der Seite.

Zusätzlich wurden die aktuellen Änderungen in Desktop- und mobilen Browseransichten kontrolliert: Bildabstände, Zoom, Kapitel-Navigation, Sprachauswahl, Pferdemotiv und Sternenhimmel. Die mobilen Prüfungen verwenden simulierte Viewports; reale Endgeräte können bei Autoplay und Drittanbieter-Erweiterungen abweichen.

Bei der Domainumstellung wurden außerdem alle drei HTTPS-Weiterleitungen mit Pfaden und URL-Parametern, die deutschen und englischen Hauptseiten, Canonicals, robots.txt sowie die unveränderten öffentlichen MX-Einträge geprüft. Die SMTP-Zustellung wurde dabei nicht durch eine Test-E-Mail geprüft.

## Wo welche Teile gepflegt werden

```text
src/
├── components/
│   ├── DreamJourney.astro          Hero, Wolken und Flugzeug
│   ├── JourneyMap.astro            Anreise und Karte
│   ├── ReserveIntroduction.astro   Drei Tierbilder und Ranch-Porträt
│   ├── WildlifeStack.astro         Gestaffelte Naturkapitel
│   ├── ReferenceStory.astro        Erlebnisse und Sternenhimmel
│   ├── StoryChapter.astro          Gemeinsames Kapitel-Layout
│   ├── StoryImage.astro            Bildkomponente
│   ├── WildlifeOrbit.astro         Abschließender Bilderkreis
│   ├── SiteHeader.astro            Menü und Sprachwahl
│   ├── SiteFooter.astro            Kontakt, Rechtslinks und Credit
│   └── CookieNotice.astro          Cookie-Hinweis und Sprachpräferenz
├── layouts/SiteLayout.astro        Metadaten, Sprachlinks und Basislayout
├── content/                       Rechts- und weitere Inhaltstexte
├── pages/                         Seiten und generierte Discovery-Dateien
├── scripts/                       Scroll-Motion, Navigation und Video
└── styles/                        Gestaltung und responsive Regeln

public/
├── bonanza/current/               Aktuelle Bildmotive und Größenvarianten
├── bonanza/experiences/            Tier- und Erlebnisbilder
├── bonanza/concepts/              Konzeptvisualisierungen
├── bonanza/map/                   Kartendaten und Reliefbilder
├── media/                        Hero-Videos, Poster und Film
└── fonts/                        Lokal ausgelieferte Schriften

scripts/                           Build-Nachbearbeitung und Tests
docs/                              Technische und redaktionelle Dokumentation
middleware.js                      Automatische Eingangssprache
site.config.mjs                    Domain und kanonische Sprachseiten
agent-api.mjs                      Inhalts-API-Verträge, OpenAPI und API-Katalog
agent-discovery.mjs                ARD- und AI-Katalog der vorhandenen Inhalts-API
webmcp-trial.mjs                   Öffentlicher Origin-Trial-Token und Gültigkeit
astro.config.mjs                   Astro-Build-Konfiguration
vercel.json                        Hosting- und Sicherheitsheader
```

Bei Textänderungen immer beide Sprachfassungen pflegen. Bei einem Bildwechsel auch `srcset`, Bildmaße und Alternativtext aktualisieren. Bei Änderungen an Scroll-Szenen Desktop, Mobilansicht, Rückwärtsscrollen und reduzierte Bewegung prüfen. Vor einer Veröffentlichung `npm run qa` ausführen.

---

**Webdesign by [qilano](https://www.qilano.de/)**

Bonanza Ranch Eco Wildlife Estate · Klein Karoo · Südafrika
