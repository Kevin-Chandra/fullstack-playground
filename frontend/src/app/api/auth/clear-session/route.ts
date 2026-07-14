import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/src/lib/constants/cookies";
import { Routes } from "@/src/lib/constants/routes";

/**
 * Ends a dead session. Server components can't set cookies, so guards that
 * detect an invalid session redirect here instead of straight to /login:
 * deleting the cookies is what stops the proxy (which trusts cookie
 * presence) from bouncing the user back into the portal — the redirect loop
 * this route exists to break.
 */
export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  redirect(Routes.LOGIN);
}
