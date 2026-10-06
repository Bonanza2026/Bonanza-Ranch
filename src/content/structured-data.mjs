import { siteUrl } from '../../site.config.mjs';
import { operator } from './operator.mjs';

export function createStructuredData({ path, lang, title, description }) {
  const id = (name) => `${siteUrl}/#${name}`;
  const canonical = siteUrl + path;
  const home = path === '/de' || path === '/en';
  const en = lang === 'en';
  const graph = [
    {
      '@type': 'Organization',
      '@id': id('operator'),
      name: operator.company,
      url: siteUrl + '/',
      email: operator.email,
      address: { '@type': 'PostalAddress', ...operator.postalAddress },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'enquiries',
        email: operator.email,
        availableLanguage: ['de', 'en'],
      },
      brand: { '@id': id('brand') },
    },
    {
      '@type': 'Brand',
      '@id': id('brand'),
      name: 'Bonanza Ranch Eco Wildlife Estate',
      alternateName: 'Bonanza Ranch',
      url: siteUrl + '/',
      logo: siteUrl + '/bonanza/logo-display.webp',
    },
    {
      '@type': 'Place',
      '@id': id('ranch'),
      name: 'Bonanza Ranch',
      alternateName: 'Bonanza Ranch Eco Wildlife Estate',
      url: siteUrl + '/en#traum',
      description: en
        ? 'A 6,300-hectare private ranch in the Klein Karoo, Western Cape, South Africa, near Oudtshoorn. The website presents the vision for an Eco Wildlife Estate.'
        : 'Eine private Ranch mit 6.300 Hektar in der Klein Karoo, Western Cape, Südafrika, nahe Oudtshoorn. Die Website stellt die Vision eines Eco Wildlife Estate vor.',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Western Cape',
        addressCountry: 'ZA',
      },
      containedInPlace: { '@type': 'Place', name: 'Klein Karoo' },
    },
    {
      '@type': 'WebSite',
      '@id': id('website'),
      url: siteUrl + '/',
      name: 'Bonanza Ranch',
      alternateName: 'Bonanza Ranch Eco Wildlife Estate',
      inLanguage: ['de', 'en'],
      publisher: { '@id': id('operator') },
      about: { '@id': id('ranch') },
    },
    {
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: title,
      description,
      inLanguage: lang,
      isPartOf: { '@id': id('website') },
      publisher: { '@id': id('operator') },
      about: { '@id': id(home ? 'ranch' : 'operator') },
      ...(home && {
        mainEntity: { '@id': id('ranch') },
        primaryImageOfPage: { '@id': id('hero-image') },
      }),
    },
  ];

  if (home) {
    graph.push({
      '@type': 'ImageObject',
      '@id': id('hero-image'),
      contentUrl: siteUrl + '/media/hero-poster-v3.webp',
      width: 1600,
      height: 900,
      caption: en
        ? 'Two giraffes in a South African mountain landscape'
        : 'Zwei Giraffen in einer südafrikanischen Berglandschaft',
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeStructuredData(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
