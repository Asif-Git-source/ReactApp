/**
 * UTILITY — cn (Class Name Merger)
 *
 * Merges Tailwind class strings while filtering out falsy values.
 * Used by all atom components to compose base + variant + caller classes.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
