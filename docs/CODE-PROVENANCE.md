# Codebestand und Bereinigung

Stand: 6. Oktober 2026.

Die veröffentlichten Seiten bestehen aus Astro-Komponenten, statischem HTML und lokalen Projektmodulen. Für die Animationen bleiben GSAP, ScrollTrigger, CustomEase und Lenis als reguläre npm-Abhängigkeiten eingebunden. Eine Astro-Website mit diesen Bibliotheken ist kein Projekt ohne Fremdsoftware.

## Gestaltung und Code sind getrennte Fragen

Die bisherige Gestaltung orientiert sich unter anderem an den vom Auftraggeber genannten Websites Tengile, White Desert und den bereitgestellten Sobha-Aufnahmen. Bildanordnung, Parallax und Scrollrhythmus behalten diese gestalterische Vorgeschichte. Die Entfernung alter Adapter oder die Änderung eines Dateinamens macht diese Inspiration nicht nachträglich zu einer völlig unabhängigen Gestaltung.

Historische Referenzaufnahmen und Arbeitsnotizen liegen lokal in ignorierten Rechercheordnern. Sie werden nicht durch Astro importiert und nicht als ausführbare Dateien in die veröffentlichte Website eingebunden. Frühere Versionsstände bleiben in der Git-Historie nachvollziehbar.

## Änderungen am ausführbaren Bestand

| Vorheriger Bestand | Umsetzung im aktuellen Projekt |
| --- | --- |
| `reference-motion.js` | Entfernt. Die Navigation verwendet `navigation-motion.ts`; die aktuelle fotografische Reise verwendet weiterhin ihre eigenen Dream-, Story- und Wildlife-Module. |
| `reference-interactions.js` | Entfernt. `pointer-cursor.ts` steuert den vorhandenen Cursor mit lokalen Pointer-Ereignissen und GSAP. |
| `reference-subpages.js` | Entfernt. Die importierten Slider-, Banner-, Reiseplan- und Flyout-Funktionen gehörten zu nicht mehr verwendeten Seitenstrukturen. |
| `reference-galleries.ts` und Three.js | Entfernt. Der aktuelle Bilderkreis positioniert native Bildelemente entlang einer Kreisbahn; ein WebGL-Renderer wird dafür nicht benötigt. |
| `reference.css` mit 7.500 Zeilen | Ersetzt durch `site-base.css` für die aktuelle Navigation, Menüstruktur, Layoutbasis, Footer und Cursor. Die bestehenden Kapitelstyles bleiben für die fotografische Gestaltung zuständig. |
| Unverwendetes `BonanzaDetail.astro` und Detaildaten | Entfernt. Die ehemaligen Detailadressen sind Weiterleitungen zu den tatsächlichen Kapiteln; keine veröffentlichte Seite importierte diese Komponente. |
| SVG-Filter mit übernommenen generierten IDs im Header | Entfernt. Die Schaltflächen verwenden nun die lokale CSS-Gestaltung mit nativem Backdrop-Blur. |
| Ungenutzte DrawSVG- und MotionPath-Imports | Entfernt. Die tatsächlichen Flugrouten verwenden `getTotalLength` und `getPointAtLength` der lokalen SVG-Pfade. |
| Zehn ungenutzte Schriftdateien | Entfernt, einschließlich Cardinal-Trial-Dateien, Altesse und Ramillas. Die tatsächlich verwendeten lokalen Inter- und PP-Fragment-Dateien bleiben erhalten. |

Die laufende Navigation liest ausschließlich die tatsächlichen Kapitel und die vorhandenen Menüschalter. Der Cursor aktualisiert seine Darstellung nur bei einem Wechsel des Zielzustands. Der Bilderkreis verwendet vorbereitete GSAP-Setter statt neuer Tween-Konfigurationen für jedes Bild und jeden Frame.

## Konkrete Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Querverweise der alten Referenzmodule | Keine Imports mehr im aktuellen Quellcode. |
| Three.js | Paket und einziges zugehöriges Modul entfernt. |
| Paketprüfung des Anti-Slop-Werkzeugs | `scan_packages.py --online` ohne Befund für die neuen Header-/Cursor-Module und geänderten Imports. |
| APIs der neuen Module | `quickTo`, `quickSetter`, `ScrollTrigger.create` und Lenis-Ereignisse gegen die installierten Paketdefinitionen geprüft. |
| Residue- und Platzhalterprüfung | Beide Scanner ohne Befund für die neuen Module, Runtime, UI und Basisstyles. |
| TypeScript-Syntax | Sechs betroffene Projektmodule mit dem installierten esbuild erfolgreich geparst. |
| Abhängigkeiten | `npm audit` und `npm audit --omit=dev`: jeweils null gemeldete Schwachstellen nach der Bereinigung. |
| CSS-Bereinigung | Gleiche PurgeCSS-Optionen und das aktuelle Basisstylesheet ergaben vor und nach der Paketumstellung exakt dieselbe Ausgabe. |

Der gemeinsame Abschlusslauf bestand den Produktionsbuild und 25 automatisierte Prüfungen. Die produktive Browser-Vorschau wurde bei 390 × 844 und 1280 × 720 geprüft: Navigation, Hero, Flugübergang, Kapitel, horizontaler Bilderlauf, Footer und Rechtsseiten. Dabei wurden keine Laufzeitfehler der Produktionsvorschau oder horizontaler Dokumentüberlauf festgestellt. Diese Stichproben bestätigen keine vollständige Darstellung auf allen Geräten.

## Sicherheitskorrektur der Build-Abhängigkeiten

PurgeCSS 8 zog die betroffene Abhängigkeit Braces über Fast-Glob und Micromatch ein. Die zu diesem Zeitpunkt aktuelle Braces-Version war ebenfalls betroffen. PurgeCSS ist deshalb ausdrücklich auf 7.0.2 gesetzt; diese Version verwendet eine andere Glob-Abhängigkeit. Der Selektorparser ist über ein npm-Override auf die korrigierte Version 7.1.6 gesetzt. Der Vergleich verwendete dieselben Optionen wie der Projektbuild einschließlich dynamischer Attribute und Animationszustände.

Dieser Befund betrifft den bekannten Stand der Paketprüfung, nicht eine pauschale Sicherheitsgarantie für alle zukünftigen Versionen oder Betriebsbedingungen.

## Grenzen einer Herkunfts- oder Lizenzbehauptung

Das Repository enthält eigene Seiteninhalte und lokale Projektmodule sowie Bibliotheken, Schriftdateien und Medien mit jeweils eigenen Nutzungsbedingungen. Es wird deshalb keine Aussage wie „100 Prozent ohne Fremdcode“ oder „alle Bestandteile automatisch rechtefrei“ getroffen. Eine Schriftdatei ist durch lokale Auslieferung allein nicht lizenziert. Für die aktive PP-Fragment-Schrift muss der Betreiber die passende Webfont-Lizenz besitzen; der Repositorybestand enthält keinen Kaufnachweis.

Die konkreten Änderungen lassen sich am Git-Diff prüfen. Eine vollumfängliche rechtliche Freigabe von Gestaltung, Medien und Schriftlizenzen wird durch diese technische Bereinigung nicht ersetzt.
