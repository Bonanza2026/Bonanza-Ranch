import { defineConfig } from 'astro/config';
import { siteUrl } from './site.config.mjs';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
