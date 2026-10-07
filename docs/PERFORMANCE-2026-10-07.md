# Mobile Performance · 7. Oktober 2026

## Anlass und Messverfahren

Der bereitgestellte mobile Lighthouse-Bericht vom 7. Oktober 2026, 11:17 Uhr, meldete 73 Punkte für Performance: FCP 1,5 s, LCP 5,0 s, Total Blocking Time 30 ms, Speed Index 8,3 s und keine Layoutverschiebung. Er wurde mit Lighthouse 13.5.0 und Chromium 153 auf einem simulierten Moto G Power mit langsamem 4G erstellt.

Eine eigene Messung vor den Änderungen auf `https://www.bonanza-ranch.com/en` ergab mit Lighthouse 13.5.0 / Chrome 152 79 Punkte, LCP 5,0 s, FCP 1,5 s, TBT 172 ms, Speed Index 2,2 s und CLS 0. Der Score und CPU-Werte schwanken zwischen Testumgebungen; diese beiden Läufe sind keine identischen Wiederholungen. Die nachfolgende eigene Live-Messung verwendet dieselbe CLI-Konfiguration wie die eigene Ausgangsmessung.

## Änderungen

- Das bei der Flugzeugsequenz enthüllte Südafrika-Bild wurde zuvor trotz `loading="lazy"` schon beim Öffnen geladen. Sticky- und Clip-Geometrie lagen innerhalb des browserseitigen Ladebereichs. Die Bildquelle wird jetzt nach dem ersten sichtbaren Aufbau bei Scroll-Vorlauf aktiviert. Der Auslöser liegt 24 Pixel unterhalb des anfänglichen Hero-Viewports; die Ankunftssequenz bleibt unverändert.
- Die drei Tierporträts erhalten ihre ursprünglichen Quellen eine Bildschirmhöhe vor ihrem Abschnitt. Sie konkurrieren beim Öffnen nicht mehr mit Hero-Poster, Schriften und Video.
- Verdeckte Wolken- und Flugzeuggrafiken bleiben früh verfügbar, erhalten aber `fetchpriority="low"`. Das sichtbare Hero-Poster behält hohe Priorität. Der Browser lädt zuerst die für die Anfangsansicht nötigen Ressourcen.
- Vollständige Bilder in `noscript` erhalten den Inhalt ohne JavaScript. Bei Kapitel-Sprüngen und wiederhergestellter Scrollposition prüft der IntersectionObserver die aktuelle Position. Die Ladehilfe bleibt beim Zurückkehren aus dem Back/Forward-Cache erhalten.
- Die Berechnung der Observer-Margins startet nach First Contentful Paint. Eine lokale Zwischenmessung hatte sonst 104,7 ms erzwungene Layoutberechnung vor der ersten Darstellung gezeigt.
- Das Hero-Video startet nach dekodiertem Poster **und tatsächlichem First Contentful Paint**. Zwei Animation Frames allein garantierten den sichtbaren Aufbau nicht: In einer lokalen Zwischenmessung war das WebM vor dem ersten Hero-Paint vollständig heruntergeladen. Der neue Ablauf lässt das statische Hero zuerst erscheinen und erhält anschließend Autoplay.
- Die Markdown-Erzeugung berücksichtigt `data-src`; Bildreferenzen bleiben in den veröffentlichten Inhaltsdokumenten erhalten, ohne die `noscript`-Bilder doppelt zu übernehmen.

## Bild- und Videoqualität

Es wurden keine Bild- oder Videodateien neu komprimiert, verkleinert oder ausgetauscht. Bildquellen, responsive Kandidaten, DPR-Auswahl, Abmessungen und Ausschnitte bleiben erhalten. Das Südafrika-Bild bleibt einschließlich seiner lossless WebP-Varianten unverändert. Mobile Hero-Version v7 mit dem angepassten Geparden-Ausschnitt, Desktop-Version v3, WebM-Präferenz und MP4-Kompatibilitätsfallback bleiben erhalten.

## Lokale Schriften

| Aktive Schrift | Vorher | Jetzt |
| --- | ---: | ---: |
| Inter Regular | 99.808 Byte | 54.768 Byte |
| Inter Medium | 107.816 Byte | 58.888 Byte |
| PP Fragment Glare Variable | 129.288 Byte | 129.288 Byte |
| Summe | 336.912 Byte | 242.944 Byte |

Die aktiven Schriftdateien sparen 93.968 Byte beziehungsweise 27,9 %. Inter enthält im optimierten WOFF2 die lateinischen und erweiterten lateinischen Zeichen, Akzente, Interpunktion und benötigten Symbole. Vollständige Originalfonts bleiben über ergänzende, überschneidungsfreie `unicode-range`-Bereiche für andere Schriftsysteme erreichbar und werden für die vorhandenen deutschen und englischen Texte nicht vorab geladen.

Je Inter-Gewicht wurden 1.458 enthaltene Glyphen auf identische Konturen und Laufweiten geprüft. Weitere 10.528 Shaping-Vergleiche je Gewicht bestätigten Kerning, Ligaturen und Positionierung, einschließlich sämtlicher vorhandener DE-/EN-Texte. Zeilenmetriken, Namens-, Lizenz- und Stilmetadaten bleiben erhalten. PP Fragment ist bytegleich; seine bereits im WOFF2-Format gespeicherte Datei erhält den passenden Dateinamen und MIME-/Format-Hinweis. Die variablen Schriftachsen bleiben unverändert.

## Verifikation

Die Veröffentlichung `96cbef5` wurde am 7. Oktober 2026 um 11:45 Uhr MESZ auf der Produktionsdomain gemessen. Alle folgenden eigenen Läufe verwenden Lighthouse 13.5.0 / Chrome 152, Navigation auf `/en`, das Moto-G-Power-Profil und die standardmäßige simulierte mobile Netz-/CPU-Drosselung. Die JSON-Berichte enthalten keine Laufwarnungen.

| Eigener Live-Lauf | Ausgangsstand · 11:19 | Erste Optimierung · 11:43 | Abschließend · 11:45 |
| --- | ---: | ---: | ---: |
| Performance | 79 | 90 | **93** |
| First Contentful Paint | 1,5 s | 1,6 s | 1,7 s |
| Largest Contentful Paint | 5,0 s | 3,4 s | **1,8 s** |
| Speed Index | 2,2 s | 2,6 s | 2,8 s |
| Total Blocking Time | 172 ms | 120 ms | 280 ms |
| Cumulative Layout Shift | 0 | 0,006 | 0,006 |
| Übertragene Daten beim initialen Lauf | 6.410.367 Byte | 3.754.623 Byte | **3.754.699 Byte** |

Das LCP-Element bleibt die sichtbare Hero-Überschrift „FEEL THE FREEDOM“. Die Startübertragung sinkt um 2.655.668 Byte beziehungsweise 41,4 %. Die Ankunfts- und Porträtbilder sind im initialen Netzwerkprotokoll nicht mehr enthalten; die Flugzeuggrafiken werden mit niedriger Priorität und die drei aktiven WOFF2-Schriften mit hoher Priorität geladen. Die FCP-, Speed-Index- und TBT-Werte sind ausdrücklich mit dokumentiert: Nicht jede Einzelmetrik verbessert sich in jedem Labordurchlauf. Diese Werte sind Messungen eines bestimmten Gerätesimulations- und Veröffentlichungsstands, keine Garantie für jeden Besucher.

Barrierefreiheit bleibt bei 96, Best Practices bei 100 und SEO bei 100. Agentic Browsing besteht weiterhin alle fünf anwendbaren Prüfungen; die aggregierte Wertung bleibt 0,98 mit dem bereits dokumentierten OpenAPI-Hinweis. Der Origin-Trial-Token und die vorhandenen WebMCP-Werkzeuge wurden nicht verändert.

`npm run qa` besteht den Produktionsbuild und **58/58 Tests**. Zusätzlich wurden Hero-Autoplay, die Quellenaktivierung nach dem ersten Scrollen, die geladenen Tierporträts vor ihrem Abschnitt und die unveränderte Typografie in der mobilen und Desktop-Ansicht geprüft. Die Bildfallbacks ohne JavaScript und die einmaligen Markdown-Bildreferenzen werden im Build-Test geprüft. Zwischenläufe auf localhost dienten der Fehleranalyse und werden nicht als Verbesserung der Live-Wertung ausgegeben.

Der verwendete Messbefehl:

```sh
npx --yes lighthouse@13.5.0 https://www.bonanza-ranch.com/en --output=json --output-path=qa/lighthouse-performance-final-2026-10-07.json --only-categories=performance,accessibility,best-practices,seo,agentic-browsing --chrome-flags=--headless --quiet
```

Die Rohberichte und der daraus erzeugte originale Lighthouse-HTML-Bericht liegen lokal unter `qa/`; dieses Verzeichnis wird nicht als Website-Inhalt veröffentlicht. Die Optimierung enthält keine Lighthouse-Erkennung, abweichende Crawler-Oberfläche oder zeitgesteuertes Verstecken sichtbarer Inhalte.

Hintergrund zum Messverfahren: [LCP optimieren](https://web.dev/articles/optimize-lcp) und [Largest Contentful Paint](https://web.dev/articles/lcp).
