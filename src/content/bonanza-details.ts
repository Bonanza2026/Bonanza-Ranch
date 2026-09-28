export type DetailSlug = 'freizeit' | 'sicherheit';
export type DetailImage = { image: string; alt: string; title: string; body: string; concept?: boolean; position?: string };
export type DetailChapter = DetailImage & { id: string; facts: string[] };
export type DetailPage = {
  label: string; title: string; intro: string; hero: DetailImage;
  heading: string; subheading: string; noteTitle: string; note: string;
  chapters: DetailChapter[]; gallery: DetailImage[];
  closing: string; closingBody: string; closingImages: DetailImage[];
};

const lake: DetailImage = { image: '/bonanza/experiences/lake.webp', alt: 'Stiller See mit Bergspiegelung aus der Bonanza-Bildsammlung', title: 'Zeit am Wasser', body: 'Naturaufnahme aus der bereitgestellten Bildsammlung. Angeln und Kajakfahren gehören zum geplanten Freizeitangebot.' };
const mountain: DetailImage = { image: '/bonanza/experiences/mountain-lake.webp', alt: 'Weite Berglandschaft mit blühender Vegetation', title: 'Raum zum Durchatmen', body: 'Landschaftsaufnahme aus der bereitgestellten Bildsammlung.' };
const flowers: DetailImage = { image: '/bonanza/experiences/wildflowers.webp', alt: 'Blühende Vegetation vor südafrikanischen Bergen', title: 'Die Landschaft gibt den Rhythmus vor', body: 'Natur und weite Ausblicke prägen die Vision von Bonanza.' };

export const bonanzaDetails: Record<DetailSlug, DetailPage> = {
  freizeit: {
    label: 'Freizeit & Leben', title: 'Ein Tag. So viele Möglichkeiten.',
    intro: 'Am Morgen hinaus in die Natur. Am Nachmittag ein Match. Am Abend gemeinsam am Feuer. Die Vision von Bonanza verbindet Bewegung, Begegnung und die Freiheit, den Tag selbst zu gestalten.',
    hero: { ...mountain, title: 'Freizeit', body: 'Natur. Bewegung. Zeit für sich.' },
    heading: 'Ihr eigener Rhythmus.', subheading: 'Fünf Perspektiven.',
    noteTitle: 'Das geplante Angebot',
    note: 'Die folgenden Einrichtungen und Services sind Teil des Entwicklungskonzepts. Die gekennzeichneten Visualisierungen zeigen eine mögliche Atmosphäre und keine bereits gebauten Anlagen.',
    chapters: [
      { id: 'natur', title: 'Draußen. Ganz bei sich.', body: 'Mit persönlicher Ranger-Begleitung unterwegs, im Sattel durch die Landschaft oder auf neuen Wegen: Die geplanten Erlebnisse richten sich an Eigentümer und ihre Gäste. Ruhige Stunden am Wasser ergänzen die aktiven Erlebnisse.', image: '/bonanza/experiences/horse.webp', alt: 'Braunes Pferd auf einer sonnigen Wiese', position: '50% 45%', facts: ['Private Ausfahrten im 4×4-Jeep mit Rangern für Eigentümer und ihre Gäste geplant', 'Country Horse Riding und eigene Reitanlage vorgesehen', 'Kleine Höhlen mit Felsmalereien der San auf der Bonanza Ranch', 'Wanderungen, ausgedehnte Bike-Touren und abwechslungsreiche Offroad-Strecken geplant', 'Angeln auf Forellenbarsch (Largemouth Bass), Kajakfahren und Jetski vorgesehen', 'Bogenschießen, Tontaubenschießen und sportliches Schießen auf der Shooting Range geplant'] },
      { id: 'rackets', title: 'Ein Match mit weitem Blick.', body: 'Ein Racketsport-Zentrum soll Bewegung und Begegnung zusammenbringen. Für die spontane Partie, das gemeinsame Training und die Zeit danach in der Lounge.', image: '/bonanza/concepts/racket-concept.webp', alt: 'Unverbindliche Konzeptvisualisierung eines Padel-Courts in einer Berglandschaft', concept: true, facts: ['Beleuchtete Padel-Courts geplant', 'Allwetter-Tennisplätze vorgesehen', 'Indoor-Tischtennis und Equipment-Lounge im Konzept'] },
      { id: 'golf', title: 'Die nächste Runde wartet.', body: 'Ein Vormittag auf dem Fairway, anschließend zurück in die Ruhe der Ranch. Golf ist als individuell organisierter Ausflug zu einem externen Platz vorgesehen.', image: '/bonanza/concepts/golf-concept.webp', alt: 'Symbolische Golfplatz-Visualisierung, kein bestimmter Partnerplatz', concept: true, facts: ['Golf außerhalb des Estates', 'Individuell organisierte Ausflüge als Servicekonzept', 'Die Abbildung zeigt keinen bestätigten Partnerplatz'] },
      { id: 'wellness', title: 'Tief durchatmen. Einfach bleiben.', body: 'Nach einem aktiven Tag soll Raum zum Regenerieren entstehen. Ein Pool-, Spa- und Saunakonzept verbindet Erholung mit dem Blick in die Landschaft.', image: '/bonanza/concepts/wellbeing-concept.webp', alt: 'Unverbindliche Konzeptvisualisierung eines Pool- und Wellnessbereichs', concept: true, facts: ['Resort-Poolbereich geplant', 'Spa und Sauna vorgesehen', 'Rückzugsorte zwischen Aktivität und Begegnung'] },
      { id: 'service', title: 'Die Zeit gehört Ihnen.', body: 'Ein persönlicher Butler-Service rund um die Uhr soll den Alltag erleichtern. Das geplante Clubhaus wird als Ort für lange Abende gedacht: mit Lounge, Boma-Feuer und einem Gourmet-Braai unter freiem Himmel.', image: '/bonanza/concepts/clubhouse-concept.webp', alt: 'Unverbindliche Konzeptvisualisierung einer Clubhaus-Lounge mit Boma-Feuer', concept: true, facts: ['Butler-Service 24/7 und Privatkoch vorgesehen', 'Clubhaus, Lounge und Boma-Feuerstelle geplant', 'Sternenbeobachtung, Weinverkostungen und private Veranstaltungen im Konzept', 'Helikopter-Anreise und Landeplatz im Planungskonzept'] },
    ],
    gallery: [lake, flowers, { image: '/bonanza/experiences/giraffes.webp', alt: 'Giraffen zwischen grünen Sträuchern', title: 'Begegnungen in der Natur', body: 'Wildlife-Motiv aus der bereitgestellten Bildsammlung. Geführte Erlebnisse mit Rangern sind Teil des Konzepts.', position: '50% 28%' }],
    closing: 'Mehr Raum für das Leben.', closingBody: 'Bonanza Ranch Eco Wildlife Estate · Die Vision eines privaten Rückzugsorts in Südafrika.',
    closingImages: [{ ...flowers, image: '/bonanza/experiences/mist-trail.webp', alt: 'Ein schmaler Weg führt durch eine neblige Landschaft' }, lake, { ...flowers, image: '/bonanza/experiences/protea.webp', alt: 'Rosa Protea vor einer Berglandschaft' }],
  },
  sicherheit: {
    label: 'Sicherheit & Privatsphäre', title: 'Freiheit braucht Vertrauen.',
    intro: 'Privatsphäre entsteht durch klare Abläufe und Menschen, die Verantwortung übernehmen. Das geplante Sicherheitskonzept für Bonanza verbindet geregelte Zugänge, persönliche Betreuung und diskrete Technik.',
    hero: { image: '/bonanza/concepts/security-gate-concept.webp', alt: 'Unverbindliche Konzeptvisualisierung einer kontrollierten Estate-Zufahrt aus Stein und Holz', title: 'Sicherheit', body: 'Privatsphäre. Aufmerksamkeit. Vertrauen.', concept: true },
    heading: 'Ein ruhiger Rückzugsort.', subheading: 'Ein durchdachtes Konzept.',
    noteTitle: 'Sicherheit in der Planung',
    note: 'Organisation, Zugangssysteme und technische Ausstattung sind vorgesehen und noch nicht als betriebsbereite Einrichtungen bestätigt. Visualisierungen dienen der Veranschaulichung.',
    chapters: [
      { id: 'zugang', title: 'Ein geregelter Zugang.', body: 'Kontrollierte Zufahrten und ein geordnetes Besuchermanagement sollen Eigentümern und Gästen einen privaten Rückzugsort ermöglichen. Die Planung berücksichtigt auch den Zugang externer Dienstleister.', image: '/bonanza/concepts/security-gate-concept.webp', alt: 'Konzeptvisualisierung einer Estate-Zufahrt mit Tor und Zugangskontrolle', concept: true, facts: ['Kontrollierte Ein- und Ausfahrt vorgesehen', 'Biometrische Zugangskontrollen im Konzept', 'Abgestimmter Zugang für Gäste und Servicepersonal'] },
      { id: 'organisation', title: 'Persönlich. Rund um die Uhr.', body: 'Die vorgesehene Sicherheitsorganisation führt Beobachtung, Koordination und Reaktion zusammen. Eine rund um die Uhr besetzte Kontrollzentrale soll den Menschen vor Ort als gemeinsame Anlaufstelle dienen.', image: '/bonanza/experiences/mountain-lake.webp', alt: 'Weite Berglandschaft als Naturmotiv für Privatsphäre und Rückzug', facts: ['Professionelle Sicherheitskräfte vor Ort geplant', '24/7 besetzte Kontrollzentrale vorgesehen', 'Reaktionsteams mit klaren Zuständigkeiten im Konzept'] },
      { id: 'technik', title: 'Aufmerksam im Hintergrund.', body: 'Zonenbasierte Sensorik und Wärmebildtechnik sollen die Menschen vor Ort unterstützen. Für die Außengrenzen sind technisch unterstützte Beobachtung und ergänzende Drohnenpatrouillen vorgesehen.', image: '/bonanza/concepts/security-camera-concept.webp', alt: 'Konzeptvisualisierung einer diskret an einem Gebäude angebrachten Sicherheitskamera', concept: true, facts: ['Sensorik für definierte Bereiche geplant', 'KI-unterstützte Wärmebildkameras an Außengrenzen vorgesehen', 'Ergänzende Drohnenpatrouillen im Konzept', 'Solar, Speicher, Wasserversorgung und Internet als geplante Infrastruktur'] },
    ],
    gallery: [mountain, lake, flowers],
    closing: 'Ankommen. Zur Ruhe kommen.', closingBody: 'Privatsphäre und persönliche Betreuung gehören zum geplanten Leben auf Bonanza.',
    closingImages: [{ ...flowers, image: '/bonanza/experiences/bush-trail.webp', alt: 'Ein Weg durch die südafrikanische Landschaft' }, mountain, { ...flowers, image: '/bonanza/experiences/protea.webp', alt: 'Protea in blühender Vegetation' }],
  },
};
