/** Joins class names, dropping falsy values. Keeps CSS Module usage readable. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
