/**
 * Staggered scroll reveals using IntersectionObserver — no animation library.
 *
 * Any element with `data-reveal` fades and rises into place once. Add
 * `data-reveal-group` to a parent to stagger its revealing children.
 */

const STAGGER_MS = 90;
const MAX_STAGGER_MS = 450;

export function initReveal(): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // Stagger siblings within a group so rows of cards cascade rather than
  // appearing all at once.
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]')).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i * STAGGER_MS, MAX_STAGGER_MS)}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => observer.observe(el));
}
