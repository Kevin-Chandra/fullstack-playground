import { Auth as Path } from "../constants/apiPaths";
import { ACCESS_TOKEN_COOKIE } from "../constants/cookies";

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_REQUEST_TIMEOUT);

/**
 * Exchanges the refresh_token in the given cookie header for fresh session
 * cookies. For callers outside the request-scoped server context (the proxy)
 * — serverApiFetch can't be used there because it reads next/headers.
 *
 * Returns the backend's Set-Cookie headers when a new access token was
 * issued, or null when the refresh was rejected (session over). Network
 * failures throw so the caller decides: the proxy lets the request through
 * to the page's error boundary rather than showing a login form that
 * couldn't work anyway.
 */
export async function refreshSession(
  cookieHeader: string,
): Promise<string[] | null> {
  const response = await fetch(`${BACKEND_API_URL}${Path.REFRESH}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  const setCookies = response.headers.getSetCookie();
  const issuedAccessToken = setCookies.some((cookie) =>
    cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`),
  );

  // Only report success when an access token actually arrived — callers
  // retry the original navigation on success, so this guard is what makes a
  // refresh-redirect loop impossible.
  return issuedAccessToken ? setCookies : null;
}
