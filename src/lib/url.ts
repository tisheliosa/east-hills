/**
 * Prefixes an internal path with Astro's configured `base`.
 *
 * GitHub Pages project sites are served from a subpath (e.g. /east-hills/), so
 * a hardcoded `/contact` would 404 there. Routing every internal link and asset
 * URL through this helper means the same build deploys to a subpath, a domain
 * root, or a custom domain without touching any markup.
 *
 *   withBase()              -> "/"            or "/east-hills/"
 *   withBase('contact')     -> "/contact"     or "/east-hills/contact"
 *   withBase('#services')   -> "/#services"   or "/east-hills/#services"
 */
export function withBase(path = ''): string {
  const raw = import.meta.env.BASE_URL || '/';
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  return `${base}${path.replace(/^\/+/, '')}`;
}

/** Strips trailing slashes so route comparisons are stable. */
export function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}
