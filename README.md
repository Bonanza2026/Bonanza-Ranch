# Bonanza Ranch · Eco Wildlife Estate

**Eine visuelle Reise in die Klein Karoo. Konzipiert, gestaltet und entwickelt als zweisprachige Website mit filmischem Einstieg, individueller Scroll-Choreografie und einer eigenen mobilen Inszenierung.**

![Bonanza Ranch – die Landschaft der Klein Karoo](public/media/hero-poster-v3.webp)

**Astro 7 · Lenis · GSAP ScrollTrigger · Deutsch / Englisch · WebP · WebM · Vercel**

Die Website führt vom ersten Landschaftseindruck über die Anreise aus Europa und Asien bis zu Tierwelt, privaten Erlebnissen und dem Sternenhimmel Südafrikas. Gestaltung, Bildsprache, Texte und Bewegung greifen dabei ineinander: großzügige Fotografie, warme Beigetöne, grüne Typografie und abgestimmte Übergänge.

Dieses Repository enthält den bearbeitbaren Astro-Quellcode, die lokalen Medien, die Animationen, die Sprachsteuerung sowie die Konfiguration für Build, Suchmaschinen und Hosting.

## Projektumfang auf einen Blick

| Bereich | Umsetzung |
| --- | --- |
| Gestaltung | Individuelle Bildkompositionen, redaktionelle Abschnitte, responsive Typografie und ein durchgängiges Farbkonzept |
| Medienproduktion | KI-generierte und KI-bearbeitete Bild- und Videoinhalte, Konzeptvisualisierungen sowie die Aufbereitung bereitgestellter Motive |
| Bewegung | Lenis Smooth Scrolling, GSAP-Zeitleisten, Flugzeug-Reveal, Bildzoom, Parallax, Sticky-Panels und horizontale Erlebniskapitel |
| Mobile | Eigene Flugrichtung, vertikale Kapitel, angepasste Sticky-Panels, lesbare Texte und separat abgestimmte Bildabstände |
| Sprachen | Eigene deutsche und englische Texte, manuelle Sprachwahl und automatische Ländererkennung am Einstieg |
| Suchmaschinen | Metadaten, Canonicals, Sprachverweise, Social-Media-Vorschauen, robots.txt und XML-Sitemap |
| KI-Lesbarkeit | Projektspezifische llms.txt mit Fakten, Sprachvarianten, Kontakt und Inhaltsverweisen |
| Medienauslieferung | WebP-Fotos, responsive Bildgrößen, WebM-Video und MP4-Kompatibilitätsfallback |
| Datenschutz | Lokale Medien und Schriften, Cookie-Hinweis, Sprachpräferenz, Impressum und Datenschutz in DE/EN |
| Technik | Statischer Astro-Build, Vercel-Middleware, Sicherheitsheader und automatisierte Integritätsprüfungen |

## Die Website als zusammenhängende Reise

### Filmischer Einstieg und Flug nach Südafrika

Der Hero verbindet ein Landschaftsvideo mit der Bonanza-Marke und einer Einladung zum Weiterentdecken. Beim Scrollen entwickelt sich daraus die Flugsequenz: Wolken, Flugzeug und Ankunftsbild werden über eine gemeinsame Animation aufeinander abgestimmt.

- Eigene Video- und Postergrößen für Mobilgeräte und Desktop.
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
| **CustomEase, DrawSVGPlugin, MotionPathPlugin** | Eingebundene GSAP-Erweiterungen für Easing, SVG und Pfadbewegung |
| **Vercel Functions / Middleware** | Länderkennung und Sprachauswahl an der Hauptadresse |
| **PurgeCSS + Cheerio** | Bereinigung generierter Styles unter Erhalt dynamischer Animationszustände |
| **Node.js Test Runner** | Automatisierte Prüfungen für Routing, Metadaten, Medien und Seitenintegrität |

Three.js und Galerie-Module sind ebenfalls im Projektbestand enthalten. Der aktuelle abschließende Bilderkreis verwendet DOM/GSAP; er benötigt kein WebGL-Canvas.

Astro erzeugt die Inhalte beim Build als statische Seiten. Animationen und Bedienelemente werden durch die jeweiligen Skripte ergänzt. Für den Betrieb der Website ist kein CMS und keine eigene Datenbank vorgesehen.

## Deutsch, Englisch und automatische Ländererkennung

Die Website enthält **eigene deutsche und englische Textfassungen**. Die Sprachsteuerung wählt die passende Fassung aus; sie übersetzt Texte nicht während des Besuchs maschinell.

Beim Aufruf der Hauptadresse `/` entscheidet die Vercel-Middleware vor der Auslieferung:

| Situation | Ergebnis |
| --- | --- |
| Besucherland Deutschland (`DE`) | Deutsche Startseite |
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

### robots.txt

Die Datei erlaubt das Crawlen der öffentlichen Website und verweist auf die Sitemap. Sie wird beim Build aus der zentralen Domain-Konfiguration erzeugt.

Quellcode: [src/pages/robots.txt.ts](src/pages/robots.txt.ts)

### sitemap.xml

Die XML-Sitemap enthält die sechs kanonischen Sprachseiten: Startseite, Impressum und Datenschutz jeweils auf Deutsch und Englisch. Sie enthält außerdem die zugehörigen Sprachalternativen. Reine Weiterleitungsadressen werden nicht zusätzlich als eigenständiger Inhalt eingetragen.

Quellcode: [src/pages/sitemap.xml.ts](src/pages/sitemap.xml.ts)

### llms.txt

Die projektspezifische Datei fasst die Ranch, ihre Lage, die getrennten Flächenangaben, die Sprachvarianten sowie Kontakt- und Inhaltsverweise in lesbarem Markdown zusammen. Sie verlinkt auf die tatsächlichen Seiten und erklärt den Status gekennzeichneter Konzeptbilder.

Das unterstützt die Orientierung von KI- und Recherchewerkzeugen. Eine garantierte Aufnahme, Zitierung oder Platzierung durch Suchmaschinen oder KI-Dienste ist damit nicht verbunden.

Quellcode: [src/pages/llms.txt.ts](src/pages/llms.txt.ts)

### Eine zentrale Domain-Konfiguration

`site.config.mjs` steuert Canonicals, Sprachalternativen, Sitemap, robots.txt und llms.txt. Mit `SITE_URL` wird die öffentliche HTTPS-Domain festgelegt. Nach einem Domainwechsel werden alle diese Verweise durch einen neuen Build gemeinsam aktualisiert.

## Medien und Performance

Die Auslieferung ist auf große Bildwelten bei möglichst wenig unnötigem Datentransfer abgestimmt:

- **WebP für die eingebundenen Fotos**, SVG für geeignete Vektorgrafiken.
- Responsive `srcset`-Varianten, beispielsweise 640, 960 und 1672 Pixel breit bei aktuellen Bildmotiven.
- WebM als bevorzugtes Hero-Videoformat; MP4 dient als Kompatibilitätsfallback.
- Getrennte mobile und Desktop-Videoquellen, statt beide Größen parallel zu laden.
- Responsive Hero-Poster mit zum Bildschirm passendem Preload.
- Lazy Loading und asynchrones Decoding bei nachfolgenden Bildern, soweit in der jeweiligen Komponente vorgesehen.
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

1. Dieses Repository als Projekt in Vercel importieren.
2. Framework-Preset **Astro** verwenden.
3. Build-Befehl: `npm run build`.
4. Ausgabeverzeichnis: `dist`.
5. `SITE_URL` auf die tatsächliche öffentliche HTTPS-Adresse setzen.
6. Nach einer Änderung von `SITE_URL` neu deployen.
7. Anschließend beide Sprachen, Hauptadresse, Medien, Kontakt- und Rechtslinks kontrollieren.

Beispiel für eine eigene Domain:

```env
SITE_URL=https://www.bonanza-ranch.com
```

Ohne eigene Einstellung verwendet der aktuelle Code `https://bonanza-gamma.vercel.app`. Die Vorlage befindet sich in [.env.example](.env.example). Lokale `.env`-Dateien werden nicht eingecheckt.

Die statischen Dateien liegen nach dem Build in `dist`. Vercel übernimmt zusätzlich die Root-Middleware und die Header-Konfiguration. Ein reiner statischer Dateiserver bildet diese Hosting-Funktionen nicht automatisch nach.

## Qualitätssicherung

Der dokumentierte Stand vom **1. Oktober 2026** besteht den Produktionsbuild und **11 automatisierte Tests**. Geprüft werden unter anderem:

- Deutschland → Deutsch; andere und unbekannte Länder → Englisch.
- Vorrang einer gespeicherten Sprachwahl und Umgang mit ungültigen Cookie-Werten.
- Unveränderte explizite Sprachseiten, Assets und Rechtslinks.
- Erhalt von URL-Parametern bei der Weiterleitung.
- Auflösbare Links in robots.txt, llms.txt und Sitemap.
- Übereinstimmung von Canonicals, Sitemap und Sprachalternativen.
- Lokale ausführbare Skripte und keine Inline-Eventhandler im erzeugten HTML.
- Passende Hero-Poster und Preloads.
- Keine unnötigen parallelen Videoquellen und kein Vorladen des ungeöffneten Films.
- Korrekte DE/EN-Menütexte und eindeutige Footer-Sprungziele.
- Auswahl der zur Bildschirmgröße passenden Videoquelle mit Fallback.

Zusätzlich wurden die aktuellen Änderungen in Desktop- und mobilen Browseransichten kontrolliert: Bildabstände, Zoom, Kapitel-Navigation, Sprachauswahl, Pferdemotiv und Sternenhimmel. Die mobilen Prüfungen verwenden simulierte Viewports; reale Endgeräte können bei Autoplay und Drittanbieter-Erweiterungen abweichen.

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
astro.config.mjs                   Astro-Build-Konfiguration
vercel.json                        Hosting- und Sicherheitsheader
```

Bei Textänderungen immer beide Sprachfassungen pflegen. Bei einem Bildwechsel auch `srcset`, Bildmaße und Alternativtext aktualisieren. Bei Änderungen an Scroll-Szenen Desktop, Mobilansicht, Rückwärtsscrollen und reduzierte Bewegung prüfen. Vor einer Veröffentlichung `npm run qa` ausführen.

---

**Webdesign by [qilano](https://www.qilano.de/)**

Bonanza Ranch Eco Wildlife Estate · Klein Karoo · Südafrika
