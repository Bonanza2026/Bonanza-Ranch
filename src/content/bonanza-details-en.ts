import { bonanzaDetails, type DetailPage } from './bonanza-details';
const leisure = bonanzaDetails.freizeit;
const security = bonanzaDetails.sicherheit;
const gallery = [
  { ...leisure.gallery[0], title: 'Time by the water', body: 'Quiet water and open skies. Fishing and kayaking form part of the leisure offering.', alt: 'A quiet lake surrounded by mountains' },
  { ...leisure.gallery[1], title: 'Room to breathe', body: 'Landscapes from the Bonanza image collection.', alt: 'Flowering vegetation beneath South African mountains' },
  { ...leisure.gallery[2], title: 'Wild encounters', body: 'An impression of South African wildlife. Guided experiences with rangers are part of the concept.', alt: 'Giraffes among green bushes' },
];
export const bonanzaDetailsEn: Record<'freizeit' | 'sicherheit', DetailPage> = {
  freizeit: {
    ...leisure, label: 'Leisure & life', title: 'A day with room for more.',
    intro: 'Out into the bush in the morning. A game in the afternoon. A long evening by the fire. The vision for Bonanza brings adventure, good company and the freedom to choose your own pace.',
    hero: { ...leisure.hero, title: 'Leisure', body: 'Nature. Adventure. Time for yourself.', alt: 'Mountains and flowering vegetation in South Africa' },
    heading: 'Your own rhythm.', subheading: 'A world of possibilities.',
    noteTitle: 'The experience', note: 'These facilities and services form part of the development concept. Labelled visualisations show a possible atmosphere for future facilities.',
    chapters: [
      { ...leisure.chapters[0], title: 'Out into the open.', body: 'A horse, an open trail, the first light over the hills. Private rides and ranger-led drives for owners and their guests are central to the vision, alongside cycling, off-road adventures and quiet days by the water.', alt: 'A horse in a sunlit field', facts: ['Private 4×4 jeep drives with experienced rangers for owners and their guests', 'Country horse riding and private stables', 'Small caves with San rock paintings on Bonanza Ranch', 'Hiking, extensive bike tours and varied off-road routes', 'Largemouth bass fishing, kayaking and jet skiing', 'Archery, clay pigeon shooting and target shooting at the range'] },
      { ...leisure.chapters[1], title: 'A match with a view.', body: 'A spontaneous game, a training session and time together afterwards: the sporting hub is part of the Bonanza vision.', alt: 'Concept for padel courts in a mountain landscape', facts: ['Floodlit padel courts', 'All-weather tennis courts', 'Indoor table tennis and an equipment lounge'] },
      { ...leisure.chapters[2], title: 'Another round awaits.', body: 'A morning on the fairway, then back to the quiet of the ranch. Golf outings to courses in the surrounding area are part of the Bonanza vision.', alt: 'Illustrative golf course concept', facts: ['Golf outside the estate', 'Individually arranged outings as a proposed service', 'Illustration of the experience, not a confirmed partner course'] },
      { ...leisure.chapters[3], title: 'Take your time.', body: 'A swim after a day outdoors. A quiet hour in the spa. The pool, spa and sauna concept is designed to bring a different pace to active days.', alt: 'Concept for a pool and wellness area', facts: ['Resort pool area', 'Spa and sauna', 'Places to pause between activities'] },
      { ...leisure.chapters[4], title: 'Stay for the evening.', body: 'The clubhouse brings people together around a boma fire, a good wine and food cooked outdoors. Personal service should leave more time to enjoy it all.', alt: 'Concept for an evening around the clubhouse fire', facts: ['24/7 butler service and private chefs', 'Clubhouse, lounge and boma firepit', 'Stargazing, wine tastings and private gatherings', 'Helicopter access and a landing area in the concept'] },
    ], gallery,
    closing: 'Make room for this.', closingBody: 'A ride. A swim. A long evening. A glimpse of the life imagined for Bonanza.',
    closingImages: [
      { ...leisure.closingImages[0], alt: 'A path through a misty landscape' },
      { ...leisure.closingImages[1], alt: 'A lake surrounded by mountains' },
      { ...leisure.closingImages[2], alt: 'A flowering protea' },
    ],
  },
  sicherheit: {
    ...security, label: 'Security & privacy', title: 'The freedom to settle in.',
    intro: 'The vision for Bonanza pairs the openness of the landscape with careful attention to privacy, access and everyday support. Discover the approach behind the vision.',
    hero: { ...security.hero, title: 'Security', body: 'Privacy. Peace of mind. Thoughtful planning.', alt: 'Concept for a discreetly controlled estate entrance' },
    heading: 'Space to relax.', subheading: 'Care behind the scenes.',
    noteTitle: 'The security concept', note: 'The systems and services described are in development. The visualisations illustrate the intended setting, rather than completed infrastructure.',
    chapters: [
      { ...security.chapters[0], title: 'A considered welcome.', body: 'The access concept for residents, guests and service providers combines clear procedures with discreet arrangements that respect privacy.', alt: 'Concept for a controlled entrance', facts: ['Managed access for residents, visitors and service teams', 'Biometric access systems', 'Discreet arrival and visitor management'] },
      { ...security.chapters[1], title: 'People who know the place.', body: 'A professional on-site team, a staffed control centre and coordinated responses form the human foundation of the security concept.', alt: 'Wide landscape in South Africa', facts: ['Professional security personnel', '24/7 control centre', 'Local response teams and clear operating procedures'] },
      { ...security.chapters[2], title: 'A wider view.', body: 'Zoned sensors, thermal cameras and drone patrols complement the on-site team in the security concept. Water, energy and communications are also part of the infrastructure concept.', alt: 'Concept for a discreet surveillance camera', facts: ['Zoned sensors and thermal cameras', 'Drone patrols as part of the security concept', 'Solar, battery storage, water provision and connectivity'] },
    ], gallery,
    closing: 'Time to look ahead.', closingBody: 'A private place in a wide landscape. With the practical details considered from the beginning.',
    closingImages: [
      { ...security.closingImages[0], alt: 'Natural landscape in South Africa' },
      { ...security.closingImages[1], alt: 'Open country and mountains' },
      { ...security.closingImages[2], alt: 'Vegetation in a natural setting' },
    ],
  },
};
