import { Routes } from "../constants/routes";

const PROTECTED_PREFIXES: string[] = [Routes.DASHBOARD];
const AUTH_ROUTES: string[] = [Routes.LOGIN];

const matchesPrefix = (pathname: string, prefixes: string[]): boolean =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

/** Whether the path requires an authenticated session. */
export const isProtectedPath = (pathname: string): boolean =>
  matchesPrefix(pathname, PROTECTED_PREFIXES);

export function resolveAccessRedirect(
  pathname: string,
  isAuthenticated: boolean,
): string | null {
  if (!isAuthenticated && isProtectedPath(pathname)) {
    return Routes.LOGIN;
  }
  if (isAuthenticated && matchesPrefix(pathname, AUTH_ROUTES)) {
    return Routes.DASHBOARD;
  }
  return null;
}
