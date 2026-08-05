import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: update `site` to the real domain once it is registered.
// It is used for canonical URLs, Open Graph tags and sitemap generation.
export default defineConfig({
  site: 'https://easthills.com.au',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
