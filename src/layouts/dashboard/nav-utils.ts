// ----------------------------------------------------------------------

/**
 * Returns the single most-specific nav path that matches the current pathname.
 *
 * Matching rules:
 * - The root path '/' matches ONLY when the pathname is exactly '/' (it is never
 *   treated as a prefix).
 * - Any other path matches when `pathname === path` or `pathname` starts with
 *   `path + '/'` (sub-route match).
 *
 * When several candidates match (e.g. '/financeiro' and '/financeiro/painel'),
 * the longest matching path wins so exactly one item is active.
 * Returns `null` when no candidate matches.
 */
export function getActiveNavPath(pathname: string, paths: string[]): string | null {
  let bestMatch: string | null = null;

  for (const path of paths) {
    const isMatch =
      path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);

    if (isMatch && (bestMatch === null || path.length > bestMatch.length)) {
      bestMatch = path;
    }
  }

  return bestMatch;
}
