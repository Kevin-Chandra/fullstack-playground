import { redirect } from "next/navigation";
import { getCurrentUser } from "../services/authService.server";
import { CurrentUser } from "../types/CurrentUser";
import { Routes } from "../constants/routes";

/**
 * Server-side route guard. Returns the authenticated user; when the session
 * is invalid it redirects through the clear-session route, which deletes the
 * dead cookies before landing on /login (a straight redirect to /login would
 * be bounced back here by the proxy's cookie-presence gate). Keeps the
 * access-control policy out of the protected layout/pages.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(Routes.CLEAR_SESSION);
  }
  return user;
}
