import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * `site` and `base` can be supplied by the environment so no code change is
 * needed to switch hosts. The GitHub Pages workflow passes values resolved by
 * actions/configure-pages, which are correct for project pages
 * (https://user.github.io/east-hills), user pages and custom domains alike.
 *
 * The fallbacks apply to local builds and non-Pages hosts (Netlify, Cloudflare
 * Pages). Update the fallback `site` once the real domain is registered.
 */
const site = process.env.SITE_URL || 'https://easthills.com.au';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
