# Schema.org und Entitäten

Stand: 6. Oktober 2026. Umfang: die sechs kanonischen deutschen und englischen Seiten der Bonanza Ranch.

## Ausgangsbefund

Im gerenderten DOM von `/de` wurden vor der Änderung keine JSON-LD-Blöcke und keine Microdata gefunden. Die zusätzliche Quellcodeprüfung fand auch keine RDFa-Auszeichnung. Die Browserprüfung ist erforderlich, weil ein Textabruf allein dynamisch erzeugte Auszeichnungen übersehen kann.

Die rechtlichen Seiten erbten außerdem die deutsche Startseitenbeschreibung. Dadurch hatten Impressum und Datenschutz in beiden Sprachen denselben sachlich unpassenden Beschreibungstext. Die Open-Graph-Angaben zum Titelbild nannten 1920 × 1080 Pixel; die verwendete Datei hat tatsächlich 1600 × 900 Pixel und zeigt zwei Giraffen vor Bergen.

## Umgesetzter Graph

Jede Seite erhält einen beim Astro-Build erzeugten JSON-LD-Graphen. Der Graph steht im ursprünglichen HTML und benötigt keine Animation, Browserausführung oder externe Abfrage. Die Seite verwendet dieselben Titel, Beschreibungen und kanonischen URLs für HTML und JSON-LD.

| Entität | Typ | Bedeutung und Datenquelle |
|---|---|---|
| `/#operator` | `Organization` | SKYWIND SOUTH AFRICA (PTY) LTD als rechtlicher Betreiber. Name, Korrespondenzanschrift und Kontakt aus den veröffentlichten Anbieterangaben. |
| `/#brand` | `Brand` | Bonanza Ranch Eco Wildlife Estate als Projektmarke. Verknüpfung mit dem Betreiber und dem lokalen Ranch-Logo. |
| `/#ranch` | `Place` | Die Ranch in der Klein Karoo, Western Cape, Südafrika. Die Fläche von 6.300 Hektar und die Nähe zu Oudtshoorn entsprechen dem sichtbaren Inhalt. |
| `/#website` | `WebSite` | Die zweisprachige Website mit der Ranch als Thema und dem Betreiber als Herausgeber. |
| jeweilige URL mit `#webpage` | `WebPage` | Die einzelne Sprachversion mit selbstreferenzieller URL, passendem Titel und passender Beschreibung. |
| `/#hero-image` | `ImageObject` | Nur auf den Startseiten: das tatsächlich verwendete Giraffen-Titelbild mit korrekten Abmessungen und übersetzter Bildbeschreibung. |

Die Korrespondenzanschrift in Sedgefield bezeichnet den Betreiber. Sie wird ausdrücklich nicht als Standort der Ranch ausgegeben. Das bestehende Wildtierschutzgebiet mit 36.000 Hektar wird nicht zur Fläche der Ranch addiert.

## Prüfkriterien

Die automatisierten Prüfungen kontrollieren JSON-Syntax, eindeutige absolute IDs, auflösbare Beziehungen im Graphen, übereinstimmende HTML-Metadaten, konsistente Entitäten über beide Sprachen, vorhandene lokale Bilddateien und die Trennung von Ranch und Betreiber. Die Serialisierung verhindert, dass ein Textwert das umgebende Script-Element schließen kann.

Impressum und Datenschutz enthalten nur noch die öffentliche Bonanza-Kontaktadresse. Die zusätzliche Skywind-Mailadresse wurde aus dem gemeinsamen Kontaktbaustein entfernt. Rechtlicher Firmenname, Vertreter und Anschrift bleiben erhalten. Alle vier rechtlichen Seiten haben jetzt eigene deutsche beziehungsweise englische Beschreibungen und führen direkt zur passenden Sprachstartseite zurück.

`generated-schema.json` enthält einen aus dem gleichen Quellmodul erzeugten deutschen Beispielgraphen. Maßgeblich für jede veröffentlichte Seite bleibt der vom Build erzeugte, seitenspezifische JSON-LD-Block.

## Abschließender Prüfstand

Am 6. Oktober 2026 wurde der Produktionsbuild erfolgreich erzeugt. Alle **25 automatisierten Tests** bestanden. Die Schema-Prüfungen bestätigten auf allen sechs erzeugten Seiten einen JSON-LD-Graphen mit gültiger JSON-Syntax, passenden Sprach- und Metadaten sowie auflösbaren Entitätsbeziehungen.

Die zusätzliche Prüfung im gerenderten Browser-DOM bestätigte `Organization`, `Brand`, `Place`, `WebSite`, `WebPage` und `ImageObject` auf der Startseite. Das Schema ist damit sowohl im erzeugten HTML als auch nach der Browserinitialisierung vorhanden. Ein **externer Google Rich Results Test wurde nicht durchgeführt**; das lokale Testergebnis wird nicht als Google-Freigabe ausgegeben.

`npm audit` meldete zum Prüfzeitpunkt keine bekannten Sicherheitslücken in den Produktions- oder Entwicklungsabhängigkeiten. Dieses Ergebnis ist eine Paketprüfung und keine Aussage über Rich-Result-Berechtigung oder rechtliche Vollständigkeit.

## Bewusst nicht ausgezeichnet

- Kein `Hotel`, `Resort`, `VacationRental` oder buchbares `LocalBusiness`: Die Website stellt auch eine Entwicklung und eine Vision vor. Ein fertig eröffnetes, buchbares Angebot ist damit nicht nachgewiesen.
- Keine Preise, freien Termine, Bewertungen, Sterne oder Verkaufsangebote ohne veröffentlichte Grundlage.
- Keine genauen Ranch-Koordinaten und keine erfundene Telefonnummer.
- Kein `sameAs` für ein noch nicht bestätigtes Unternehmensprofil. Die Verbindung mit dem Business-Profil ist ein separater Folgeschritt.
- Kein `VideoObject` mit erfundenem Upload-Datum, Urheber oder Nutzungsrechten. Der lokal eingebundene Hero-Film allein belegt diese Angaben nicht.
- Keine Urheber- oder Lizenzbehauptung an Bildmaterial allein aufgrund des Copyright-Zeichens oder einer KI-Erstellung.

Diese Auszeichnung beschreibt veröffentlichte Informationen. Sie garantiert weder Rich Results noch einen Knowledge Panel, Rankings, KI-Zitate oder rechtliche Vollständigkeit. Die Prüfung ersetzt keine anwaltliche Beurteilung der Anbieter- und Datenschutzangaben.

## Primärquellen

- [Google: Organization-Auszeichnung](https://developers.google.com/search/docs/appearance/structured-data/organization). Google empfiehlt zutreffende Angaben zum Betreiber und erkennt unter anderem Name, Kontakt und Anschrift; es gibt keine allgemeine Pflicht, unbekannte Eigenschaften zu erfinden.
- [Google: allgemeine Regeln für strukturierte Daten](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). Markup muss den tatsächlichen Seiteninhalt wiedergeben.
- [Schema.org: Place](https://schema.org/Place), [WebSite](https://schema.org/WebSite) und [Brand](https://schema.org/Brand) definieren die verwendeten Entitätstypen.

Die weiteren technischen Ergebnisse und die Prüfgrenzen stehen im [SEO-Audit vom 6. Oktober 2026](SEO-AUDIT-2026-10-06.md). Die Einreichung in der Search Console und die tatsächliche Verarbeitung durch Google sind getrennt vom erfolgreichen Build und der lokalen Schema-Prüfung zu beurteilen.
