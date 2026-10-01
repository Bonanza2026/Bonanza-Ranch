# Bonanza Ranch: Hosting, Domains und Betrieb

**Dokumentierter Einrichtungsstand: 1. Oktober 2026.** Dieser Leitfaden beschreibt die tatsächlich eingerichtete Produktion und die Schritte für Wartung und Übergabe. Spätere Änderungen an Domains, Hosting oder Mail müssen hier nachgetragen werden.

[Zur Projektübersicht](../README.md) · [Website öffnen](https://bonanza-ranch.com/) · [GitHub-Repository](https://github.com/Bonanza2026/Bonanza-Ranch)

## 1. Zusammenspiel der Dienste

| Dienst | Zuständigkeit |
| --- | --- |
| GitHub | Quellcode, lokale Assets, Versionshistorie und Produktionsbranch `main` |
| Vercel | Automatischer Build, Website-Auslieferung, HTTPS, Domain-Weiterleitungen und Middleware für die Eingangssprache |
| united-domains | Domainverwaltung, bestehende Nameserver, DNS-Zonen und E-Mail-Hosting |

Das aktive Vercel-Projekt heißt **`bonanza-ranch`** und gehört zum Team **`bonanza2026`**. Es ist mit **`Bonanza2026/Bonanza-Ranch`** verbunden.

- [Vercel-Projekt](https://vercel.com/bonanza2026/bonanza-ranch)
- [Vercel-Domainverwaltung](https://vercel.com/bonanza2026/bonanza-ranch/settings/domains)

Dashboard-Zugriff setzt entsprechende Kontorechte voraus. Zugangsdaten, Tokens, private Zonenexporte und Lizenzbelege gehören nicht in dieses öffentliche Repository.

## 2. Eine Hauptdomain, drei Weiterleitungen

| Aufgerufene Domain | Funktion / Ziel |
| --- | --- |
| `bonanza-ranch.com` | Hauptdomain, mit der Vercel-Produktionsumgebung verbunden |
| `www.bonanza-ranch.com` | Dauerhafte Weiterleitung auf `https://bonanza-ranch.com` |
| `bonanzaranch.co.za` | Dauerhafte Weiterleitung auf `https://bonanza-ranch.com` |
| `www.bonanzaranch.co.za` | Dauerhafte Weiterleitung auf `https://bonanza-ranch.com` |

Die drei Weiterleitungen verwenden **HTTP 308**. Es werden keine separaten Kopien der Website auf diesen Domains gepflegt. Pfad und Abfrageparameter werden übernommen, zum Beispiel:

```text
https://www.bonanzaranch.co.za/en?source=partner
→ https://bonanza-ranch.com/en?source=partner
```

Die Domain-Weiterleitungen liegen in den Vercel-Projekteinstellungen. Sie werden nicht durch die Sprach-Middleware oder durch eine Weiterleitung beim Registrar ersetzt. Auch eine reine Weiterleitungsdomain benötigt für einen HTTPS-Aufruf eine funktionierende Zertifikatszuordnung.

## 3. DNS-Konfiguration bei united-domains

Die Nameserver bleiben bei united-domains. Für **beide** DNS-Zonen, `bonanza-ranch.com` und `bonanzaranch.co.za`, wurde die Web-Zuordnung eingerichtet:

| Hostname innerhalb der Zone | Typ | Wert | TTL |
| --- | --- | --- | --- |
| `@` / leeres Host-Feld | A | `216.198.79.1` | 600 Sekunden |
| `www` | CNAME | `5d64de0dc6a42a8d.vercel-dns-017.com` | 600 Sekunden |

Das CNAME-Ziel ist der für dieses Projekt angezeigte Vercel-Wert. Bei einer späteren Neueinrichtung zuerst die dann angezeigten Werte in Vercel prüfen, nicht eine allgemeine IP-Adresse aus einer anderen Projektanleitung übernehmen.

Die bisherigen AAAA-Webeinträge des Homepage-Baukastens wurden bei der Trennung entfernt. Ein verbliebener alter IPv6-Eintrag könnte einzelne Besucher weiterhin zum vorherigen Anbieter führen. Der Registrar hat auch den bereits vorhandenen Wildcard-A-Eintrag `*` auf das neue A-Ziel übernommen. Daraus folgt keine eingerichtete Wildcard-Domain in Vercel: Bestätigt sind die vier ausdrücklich aufgeführten Hostnamen.

### Was am Homepage-Baukasten geändert wurde

Die Baukasten-Verknüpfung blockierte zuvor das Speichern eigener Web-DNS-Einträge. Deshalb wurden die beiden Domains vom Baukasten gelöst und anschließend auf Vercel ausgerichtet.

**Die Baukastenverträge wurden dabei nicht gekündigt.** Ebenso wenig wurden Domains transferiert, Nameserver ausgetauscht oder E-Mail-Postfächer umgezogen. Die weitere Vertragsverwaltung bleibt beim Kontoinhaber.

Für die Umstellung wurden lokale DNS-Zonenexporte gesichert. Bei `bonanza-ranch.com` erfolgte der Export vor der Baukasten-Trennung; bei `bonanzaranch.co.za` nach der Trennung und vor der anschließenden Änderung der A- und CNAME-Werte. Diese unterschiedlichen Sicherungszeitpunkte bei einer Wiederherstellung berücksichtigen.

## 4. E-Mail bleibt getrennt vom Website-Hosting

Die Postfächer bleiben bei united-domains. Vercel übernimmt nur die Website; ein Web-Domainwechsel verlangt keinen Wechsel der Mailserver.

Die folgenden Einträge wurden in beiden Zonen erhalten:

| Zweck | Eintrag |
| --- | --- |
| Primärer Mailserver | MX, Priorität `10`, `mx00.udag.de` |
| Zweiter Mailserver | MX, Priorität `20`, `mx01.udag.de` |
| SPF | TXT: `v=spf1 include:_smtp.udag.de ~all` |
| DKIM | Vorhandener TXT-Schlüssel unter `uddkim-202310._domainkey` unverändert |
| Einrichtung von Mailprogrammen | Vorhandene `autodiscover`- und `autoconfig`-Einträge unverändert |

Die MX-Einträge wurden nach der Umstellung öffentlich aufgelöst und kontrolliert. Eine Ende-zu-Ende-Prüfung des Mailversands oder -empfangs durch Testnachrichten war nicht Bestandteil dieser Prüfung.

Kontaktlinks der Website öffnen das E-Mail-Programm des Besuchers. Es gibt kein Formular-Backend und keinen Resend-Versand im Projekt. Mailpasswörter oder SMTP-Zugangsdaten werden daher für den Website-Build nicht benötigt.

## 5. Build und Veröffentlichung

| Einstellung | Wert |
| --- | --- |
| Framework | Astro |
| Build-Befehl | `npm run build` |
| Ausgabe | `dist` |
| Produktionsbranch | `main` |
| Öffentliche Basisadresse | `https://bonanza-ranch.com` |
| Zusätzliche Domain-Umgebungsvariable | Zum Einrichtungsstand nicht gesetzt; der Quellcode enthält die Hauptdomain als Standard |

Ein Push auf `main` startet über die GitHub-Verbindung einen Vercel-Build. Ein erfolgreicher Git-Push allein bestätigt noch kein fertiges Deployment. Im Vercel-Dashboard den zugehörigen Commit, den Build-Status und die Produktionszuordnung kontrollieren, anschließend die öffentliche Seite prüfen.

### Ablauf für Änderungen

1. Repository aktualisieren und einen Arbeitsbranch anlegen.
2. Texte, Komponenten oder Medien ändern; deutsche und englische Fassung gemeinsam pflegen.
3. Bei Code-, Layout- oder Medienänderungen `npm run qa` ausführen.
4. Betroffene Ansichten lokal prüfen, insbesondere Desktop, Mobilansicht und Sprunglinks bei Änderungen an Scroll-Kapiteln.
5. Änderungen prüfen und nach `main` übernehmen.
6. Den neuen Vercel-Build bis zum erfolgreichen Abschluss kontrollieren.
7. Die betroffenen Inhalte auf `https://bonanza-ranch.com` prüfen.

Reine Dokumentationsänderungen benötigen keine erneute Medienaufbereitung. Da Dokumentation und Website im selben Repository liegen, kann auch ein Dokumentations-Push ein Deployment auslösen.

### Zentrale Domain-Konfiguration

[site.config.mjs](../site.config.mjs) steuert Canonicals, Sprachalternativen, Sitemap, robots.txt und llms.txt. Standard:

```env
SITE_URL=https://bonanza-ranch.com
```

Das ist der wirksame Standardwert, kein Hinweis auf eine bereits gesetzte Vercel-Umgebungsvariable. Ein späterer Override muss eine reine HTTPS-Adresse ohne Pfad, Zugangsdaten, Query oder Fragment enthalten. Nach einer Änderung neu bauen, da die Verweise beim Build entstehen.

DNS-Zuordnung und Domain-Weiterleitung werden dadurch nicht geändert. Bei einem Domainwechsel müssen beide Ebenen angepasst werden: Provider-Konfiguration und erzeugte Website-Verweise.

## 6. Eingangssprache und Weiterleitungen unterscheiden

Die Domain-Weiterleitung vereinheitlicht den **Hostnamen**. Erst danach entscheidet die Middleware beim Aufruf von `/` über die **Sprache**:

- Gespeicherte manuelle Sprachwahl hat Vorrang.
- Deutschland (`DE`) erhält die deutsche Startseite.
- Andere oder unbekannte Länder werden mit HTTP **307** zu `/en` weitergeleitet.
- `/de`, `/en` und die ausdrücklich verlinkten Rechtsseiten behalten ihre Sprache.

Die Root-Antwort verwendet `Cache-Control: private, no-store` sowie `Vary: Cookie, X-Vercel-IP-Country`, damit die Entscheidung nicht als gemeinsame Sprachantwort für alle Besucher zwischengespeichert wird.

Für internationale Empfehlungen die Hauptadresse ohne `/de` teilen. Ein ausdrücklich deutscher Link soll absichtlich nicht anhand des Landes überschrieben werden. Die Ländererkennung basiert auf der Hosting-Information, nicht auf einer GPS-Freigabe. Die Astro-Vorschau allein simuliert die Vercel-Middleware nicht.

## 7. HTTPS und Prüfungen nach der Umstellung

Alle vier Domain-Einträge zeigten in Vercel **Valid Configuration**. Geprüft wurden:

| Prüfung | Bestätigtes Ergebnis bei der Einrichtung |
| --- | --- |
| `https://bonanza-ranch.com/de` und `/en` | Erfolgreiche Auslieferung, HTTP 200 |
| Drei alternative Domains über HTTPS | HTTP 308 zur Hauptdomain |
| Sprachpfad und Query in Weiterleitungen | Bleiben erhalten |
| Canonicals der beiden Startseiten | Verweisen auf die neue Hauptdomain |
| robots.txt | Erreichbar und mit Sitemap-Verweis auf die Hauptdomain |
| XML-Sitemap im Produktionsbuild | Sechs kanonische Sprachseiten mit passender Basisadresse |
| E-Mail-Routing | Öffentliche MX-Einträge beider Domains unverändert |

Der Domainwechsel wurde mit Commit **`55fbb14`** im Repository festgehalten und erfolgreich veröffentlicht. Die zugehörige Prüfung umfasste den Produktionsbuild und die damals vorhandenen elf automatisierten Tests. Der aktuelle Testumfang steht in der [README](../README.md#qualitätssicherung).

### Aufgetretener SSL-Fehler bei `www.bonanzaranch.co.za`

Nach der Umstellung zeigte ein Browser zunächst `SSL_ERROR_UNRECOGNIZED_NAME_ALERT`. Die Diagnose ergab: Der lokale DNS-Cache zeigte noch auf `89.31.143.90`, während die frische DNS-Auflösung bereits Vercel lieferte. Der HTTPS-Aufruf gegen das neue Ziel funktionierte mit regulärer Zertifikatsprüfung. Nach dem Leeren des lokalen DNS-Caches funktionierte auch der normale Browseraufruf mit Weiterleitung zur Hauptdomain.

Ein Web-TTL von 600 Sekunden erleichtert die Aktualisierung, garantiert aber nicht, dass jeder Resolver und Browser gleichzeitig umstellt. Bei einem erneuten Fehler zuerst die konkreten DNS- und Zertifikatsdaten prüfen. Nicht jede SSL-Störung ist automatisch ein Cacheproblem.

## 8. Kurze Diagnose bei Betriebsproblemen

| Symptom | Zuerst prüfen |
| --- | --- |
| Neue Änderung fehlt | Richtiger Commit auf `main`? Vercel-Build erfolgreich? Richtige Produktionsdomain geöffnet? |
| Nur eine Domain zeigt SSL-Fehler | Exakten Hostnamen in Vercel prüfen, CNAME/A/AAAA vergleichen, Zertifikatsstatus und lokale DNS-Auflösung kontrollieren |
| Alte Baukastenseite erscheint | DNS-Cache, verbliebene alte Webeinträge und Baukasten-Verknüpfung kontrollieren |
| Falsche Sprache am Einstieg | Direkten `/de`-Link und gespeicherten Sprachcookie von automatischer Root-Erkennung unterscheiden |
| Ein Bild fehlt | Pfad und Groß-/Kleinschreibung, mitgepushte Dateien, `srcset` und Status der Bildantwort prüfen |
| Bilder erscheinen beim Seitwärtsscrollen spät | Netzwerktempo, Dateigröße und Ladevorlauf prüfen; nicht vorschnell die Bildqualität reduzieren |
| E-Mail funktioniert nicht | MX/SPF/DKIM und Mailkonto beim Mailhoster prüfen, nicht die Website-A-Einträge als Mailserver übernehmen |

Öffentliche Prüfungen sind ohne Zugangsdaten möglich, beispielsweise in PowerShell:

```powershell
Resolve-DnsName bonanza-ranch.com -Type A
Resolve-DnsName www.bonanzaranch.co.za -Type CNAME
Resolve-DnsName bonanza-ranch.com -Type MX
curl.exe -I "https://www.bonanzaranch.co.za/en?domain-check=1"
curl.exe -I "https://bonanza-ranch.com/en"
```

Zertifikatsprüfungen dabei nicht deaktivieren. Wenn ein lokaler DNS-Cache nachweislich veraltet ist, kann unter Windows `Clear-DnsClientCache` helfen; das ändert keine DNS-Einträge beim Provider.

### Bildladevorlauf ohne neue Kompression

Die Erlebnisbilder bleiben als echte `img`-Elemente mit ihren bestehenden `src`-/`srcset`-Quellen erhalten. [story-images.mjs](../src/scripts/story-images.mjs) bereitet nahe Bilder vor, bevor sie ins Sichtfeld kommen. Es berücksichtigt sowohl die horizontale Bewegung als auch die vertikale mobile Darstellung und begrenzt die zusätzlich gestarteten Vorbereitungen auf zwei gleichzeitig.

Die Vorbereitungen beginnen erst in der Nähe des Erlebnisbereichs. Weiter entfernte Bilder bleiben beim normalen Lazy Loading. Beim Verlassen der Seite wird die Warteschlange aufgeräumt. Ein fehlgeschlagenes Bild blockiert die folgenden nicht. Das verkürzt den sichtbaren Nachladeeffekt, ohne Fotos neu zu komprimieren oder kleinere Bildquellen zu erzwingen. Die tatsächlich benötigte Downloadzeit hängt weiterhin von Verbindung, Bildgröße und Scrolltempo ab.

## 9. Rücknahme und spätere Übergabe

Bei einer fehlerhaften Codeänderung den verursachenden Commit nachvollziehbar zurücknehmen und den korrigierten Stand wieder nach `main` veröffentlichen. Dafür muss die Domain nicht umgezogen werden. Ein Code-Rollback stellt jedoch keine DNS-Einträge oder Dashboard-Einstellungen wieder her.

Bei einem Hostingwechsel zusätzlich zur Git-Kopie sichern bzw. übertragen:

- Die vier Domain-Zuordnungen und ihre Weiterleitungsziele.
- Aktuelle DNS-Zonen und sämtliche Mail-Einträge.
- Build-Einstellungen und gegebenenfalls später ergänzte Umgebungsvariablen.
- Middleware, Sicherheitsheader und die endgültige Basisadresse für Suchmaschinen.
- Zuständige Konten und Zugriffsrechte über die Anbieterfunktionen; keine geteilten Zugangsdaten in Dokumenten.

Ein kompletter alter Zonenexport sollte nicht ungeprüft eingespielt werden: Er kann zwischenzeitliche Mail- oder Verifizierungseinträge überschreiben. Änderungen immer gezielt auf die betroffenen Records begrenzen.

Der Quellcode enthält die Website und ihre Build-Konfiguration. Er enthält weder die Providerkonten noch sämtliche externen Betriebszustände. Fontlizenzen, Medienrechte und Betreiberangaben bleiben eigenständige Unterlagen; Hinweise dazu stehen in der README.

## Offizielle Anbieter-Dokumentation

- [Vercel: eigene Domain hinzufügen](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel: Domains bereitstellen und weiterleiten](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
