import type { APIRoute } from 'astro';
import { withBase } from '../lib/url';

/**
 * Generated rather than static so the Sitemap URL is always right, whichever
 * host and base path the site is built for.
 *
 * Note: crawlers only read robots.txt from a domain root. On a GitHub Pages
 * *project* page the site lives under /<repo>/, so this file is informational
 * there — the sitemap is still discoverable via Google Search Console. On a
 * custom domain or user page it works normally.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://easthills.com.au');
  const sitemap = new URL(withBase('sitemap-index.xml'), origin).href;

  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
