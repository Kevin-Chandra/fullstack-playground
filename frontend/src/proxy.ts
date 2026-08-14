import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/src/lib/constants/cookies";
import { Routes } from "@/src/lib/constants/routes";
import {
  isProtectedPath,
  resolveAccessRedirect,
} from "@/src/lib/guards/accessPolicy";
import { refreshSession } from "@/src/lib/network/refreshSession";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Route gate (Next 16 "proxy", formerly middleware). Redirects based only on
 * session-cookie presence — real session validation happens in the protected
 * layout via /auth/me. The one backend call made here is a refresh: when the
 * access token has expired off the browser but a refresh token remains, mint
 * new cookies and retry the navigation, so hard loads survive access-token
 * expiry the same way client-side axios calls do.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (!hasAccessToken && hasRefreshToken && isProtectedPath(pathname)) {
    return refreshAndRetry(request);
  }

  const destination = resolveAccessRedirect(pathname, hasAccessToken);

  if (destination) {
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

async function refreshAndRetry(request: NextRequest) {
  let setCookies: string[] | null;
  try {
    setCookies = await refreshSession(request.headers.get("cookie") ?? "");
  } catch {
    // Backend unreachable — let the request through so the page's own fetch
    // surfaces the error boundary instead of a login form that can't work.
    return NextResponse.next();
  }

  if (!setCookies) {
    // Refresh token rejected: the session is over. Delete the dead cookies
    // so this branch doesn't re-run on every navigation, then show login.
    const response = NextResponse.redirect(new URL(Routes.LOGIN, request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  // Retry the same URL: the browser now carries a fresh access token, so the
  // retried request passes the cookie gate. refreshSession only reports
  // success when an access token was issued, so this cannot loop.
  const response = NextResponse.redirect(request.nextUrl);
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg).*)"],
};
