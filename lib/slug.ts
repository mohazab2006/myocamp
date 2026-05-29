/** URL-safe camp slug — shared by admin form + server actions. */
export function slugifyCampTitle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Pick the slug to save.
 * - Blank slug → from title
 * - Edit + title changed + slug still the old one → from new title
 * - Otherwise → normalized slug field (manual override)
 */
export function resolveCampSlug(opts: {
  title: string;
  slugInput: string;
  originalSlug?: string;
  originalTitle?: string;
}): string {
  const fromTitle = slugifyCampTitle(opts.title) || "camp";
  const normalizedInput = slugifyCampTitle(opts.slugInput);

  if (!opts.slugInput.trim()) return fromTitle;

  if (
    opts.originalSlug &&
    opts.slugInput.trim() === opts.originalSlug &&
    opts.originalTitle &&
    opts.title.trim() !== opts.originalTitle.trim()
  ) {
    return fromTitle;
  }

  return normalizedInput || fromTitle;
}
