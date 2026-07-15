/*
 * Whether `href` is the active nav destination for the current `pathname`.
 * `exact` matches the pathname only (used for section roots like /dashboard,
 * which would otherwise stay active on every nested page); otherwise a nested
 * path such as /dashboard/guests/42 also counts as active for /dashboard/guests.
 */
export function isActivePath(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
