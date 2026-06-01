/**
 * Shared-element morph between a product card image and the product-detail hero,
 * via the browser View Transitions API (Next wraps navigation in
 * startViewTransition). Only ONE element ever carries the transition name at a
 * time, so grids with the same product in multiple rows can't create duplicates.
 */
const NAME = 'product-hero';

export const supportsViewTransitions =
  typeof document !== 'undefined' && 'startViewTransition' in document;

let active: HTMLElement | null = null;

/** Mark `el` as the source that should morph into the detail hero on next nav. */
export function armProductMorph(el: HTMLElement | null): void {
  if (!supportsViewTransitions || !el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (active && active !== el) active.style.removeProperty('view-transition-name');
  el.style.setProperty('view-transition-name', NAME);
  active = el;
}
