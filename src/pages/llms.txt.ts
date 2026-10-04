import { siteUrl } from '../../site.config.mjs';

export function GET() {
  const content = `# Bonanza Ranch Eco Wildlife Estate

> Bonanza Ranch in der Klein Karoo, Südafrika. Eine private Ranch mit 6.300 Hektar Natur, umgeben von weiteren 36.000 Hektar Wildtierschutzgebiet. Die Website stellt die Ranch, ihre Lage und das Wohn-, Natur- und Freizeitangebot vor.

Die Ranch und das umliegende Wildtierschutzgebiet bestehen bereits. Die Flächenangaben beschreiben zwei unterschiedliche Gebiete. Sie dürfen nicht gleichgesetzt werden. Auf der Website gekennzeichnete Konzeptvisualisierungen sind keine Fotografien fertiggestellter Anlagen.

Die Inhalte sind auf Deutsch und Englisch verfügbar. Die folgenden Sprach-URLs sind unabhängig vom Besucherland erreichbar. Die Startadresse / wählt die Sprache anhand der Länderkennung des Hosting-Anbieters oder einer zuvor gespeicherten Sprachwahl.

## Ranch und Lage

- [Bonanza Ranch auf Deutsch](${siteUrl}/de): Die Ranch, Natur, Freizeit und private Rückzugsmöglichkeiten.
- [Bonanza Ranch in English](${siteUrl}/en): English version of the ranch, wildlife, leisure and private retreat presentation.
- [Die Ranch und ihre Umgebung](${siteUrl}/de#traum): 6.300 Hektar Bonanza Ranch und das umgebende Wildtierschutzgebiet in der Klein Karoo.
- [Anreise und Lage](${siteUrl}/de#reise): Orientierung über Kapstadt und George zur Region nahe Oudtshoorn. Die Karte dient der geografischen Einordnung.

## Erlebnisse und Kontakt

- [Freizeit und Natur](${siteUrl}/de#freizeit): Reiten, private Ausfahrten, Tierwelt, Wassersport, Wandern, Biken und weitere Erlebnisse.
- [Sicherheit und Unabhängigkeit](${siteUrl}/de#sicherheit): Zugang, Sicherheitskonzept und Versorgung.
- [Kontakt](${siteUrl}/de#kontakt): Persönliche Anfragen an info@bonanza-ranch.com.

## Betreiber und Datenschutz

- [Impressum](${siteUrl}/impressum): Verbindliche Betreiber- und Kontaktangaben sowie rechtliche Hinweise.
- [Datenschutz](${siteUrl}/datenschutz): Vercel-Hosting, E-Mail-Kontakt, Spracheinstellungen und Cookie-Hinweis. Es werden keine Analyse- oder Marketingdienste eingesetzt.
- [Legal notice](${siteUrl}/en/legal): Operator and contact details in English.
- [Privacy policy](${siteUrl}/en/privacy): Privacy information in English.

## Technische Orientierung

- [Vollständige Inhalte / Full content](${siteUrl}/llms-full.txt): Deutsche und englische Seiteninhalte einschließlich Betreiber- und Datenschutzangaben, automatisch aus dem aktuellen HTML-Build erzeugt.
- [Deutsche Startseite als Markdown](${siteUrl}/_agent-markdown/de.md): Inhaltliche Fassung ohne Animationen und Bedienoberfläche.
- [English homepage as Markdown](${siteUrl}/_agent-markdown/en.md): Content representation without animation or interface controls.
- [Sitemap](${siteUrl}/sitemap.xml): Kanonische Seiten und ihre Sprachvarianten.
- [Crawler-Regeln](${siteUrl}/robots.txt): Öffentliche Abrufregeln für Suchmaschinen und andere Crawler.

Die sechs kanonischen Seiten unterstützen auf Vercel auch den Abruf mit Accept: text/markdown. Eine temporäre Weiterleitung führt zur passenden Markdown-Datei. Normale Browser erhalten weiterhin HTML. An der Startadresse / bleibt die gespeicherte Sprachwahl beziehungsweise die Länderkennung maßgeblich.
`;
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
