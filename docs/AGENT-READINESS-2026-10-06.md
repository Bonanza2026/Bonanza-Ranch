# KI-Lesbarkeit und Agent Readiness

Geprüft am 6. Oktober 2026 für https://www.bonanza-ranch.com mit dem öffentlichen Scanner von [isitagentready.com](https://isitagentready.com/).

## Tatsächliches Scanergebnis

Der externe Rohscan liefert **Level 3: Agent-Readable**. Alle sechs vorhandenen Kernsignale bestehen:

| Prüfung | Ergebnis | Implementierung |
| --- | --- | --- |
| robots.txt | Bestanden | HTTP 200, `text/plain`, öffentliche Crawl-Regeln |
| Sitemap | Bestanden | HTTP 200, `application/xml`, sechs kanonische URLs |
| HTTP-Link-Hinweise | Bestanden | Reale Verweise auf llms.txt und llms-full.txt |
| Markdown-Abruf | Bestanden | `Accept: text/markdown` führt zur passenden Inhaltsdatei |
| KI-Crawler-Regeln | Bestanden | Benannte Crawler erhalten die bestehende öffentliche Allow-Policy |
| Content Signals | Bestanden | Die bestehende Policy ist in robots.txt veröffentlicht |

Diese sechs bestandenen Prüfungen sind **kein Gesamtlevel 6**. Das Levelsystem bewertet zusätzlich APIs, Agenten, Autorisierung und Zahlungsprotokolle. Für eine öffentliche Ranch-Präsentation wurden keine fiktiven Buchungs-, Zahlungs- oder Agentendienste angelegt.

## Öffentlich lesbarer Inhalt

Der Build erzeugt für jede der sechs kanonischen deutschen und englischen Seiten eine Markdown-Fassung unter `/_agent-markdown/`. `llms-full.txt` enthält dieselben Seiteninhalte. Die Ausgabe wird aus dem fertigen HTML erzeugt, damit Änderungen an Überschriften, Kontaktangaben und rechtlichen Texten automatisch mitgeführt werden.

- [Deutsche Startseite als Markdown](https://www.bonanza-ranch.com/_agent-markdown/de.md)
- [English homepage as Markdown](https://www.bonanza-ranch.com/_agent-markdown/en.md)
- [Inhaltsübersicht](https://www.bonanza-ranch.com/llms.txt)
- [Vollständiger Inhalt](https://www.bonanza-ranch.com/llms-full.txt)
- [Sitemap](https://www.bonanza-ranch.com/sitemap.xml)

Die HTML-Sprachseiten bleiben indexierbar. Markdown- und llms-Dokumente tragen `noindex, follow`, damit die alternativen Inhaltsformate keine zusätzlichen Suchergebnis-Duplikate erzeugen. Das verhindert ihren öffentlichen Abruf nicht.

## MCP und Search Console

Die Website stellt derzeit keinen eigenen MCP-Server bereit. MCP-Clients mit einem HTTP-Lesewerkzeug können die öffentlichen HTML- oder Markdown-Dokumente abrufen. Eine MCP Server Card ohne funktionierenden Server wäre eine falsche Funktionsbeschreibung und wurde nicht veröffentlicht.

Google Search Console verwaltet unter anderem Indexierung und Sitemap-Verarbeitung. Dort gibt es keine allgemeine Freischaltung für MCP oder einen Agent-Readiness-Level. Eine erfolgreich ausgelieferte Sitemap ist außerdem nicht gleichbedeutend mit einer bereits abgeschlossenen Indexierung durch Google.

## Relevanz und Grenzen

Das belegte Website-Profil steht in [site-profile.json](site-profile.json). Der daraus erzeugte Relevanzplan ordnet sechs Checks als bestanden, 15 als nicht anwendbar und den neuen, im lokalen Quellenkatalog noch nicht beschriebenen `ard`-Check als nicht prüfbar ein. Der externe Rohlevel wird dabei nicht umgerechnet.

Die lokale Quellenprüfung bestätigte die unveränderten Skill-Spiegel. Bei 20 Einträgen stimmen die historischen Upstream-Index-Digests nicht mit den gespiegelten Quelldateien überein; diese bekannte Katalogabweichung ist keine Aussage über Bonanzas Website.

Ein öffentlicher Scanner konnte HTML, Sitemap und Markdown am Prüfungstag tatsächlich lesen. Das Web-Lesewerkzeug dieses Chats meldete für `/de` dagegen einen internen Abruffehler; der echte Browser konnte dieselbe Seite öffnen. Diese Beobachtungen belegen unterschiedliche Abrufpfade. Sie belegen keine pauschale Vercel-Sperre und keine universelle Zugriffs- oder Rankinggarantie für andere KI-Dienste.
