const configuredUrl = new URL(process.env.SITE_URL || 'https://www.bonanza-ranch.com');
if (configuredUrl.protocol !== 'https:' || configuredUrl.username || configuredUrl.password || configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query or fragment.');
}

export const siteUrl = configuredUrl.origin;
export const languagePages = [
  { de: '/de', en: '/en' },
  { de: '/impressum', en: '/en/legal' },
  { de: '/datenschutz', en: '/en/privacy' },
];
