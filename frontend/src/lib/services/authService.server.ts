import { Auth as Path } from "../constants/apiPaths";
import { CurrentUser } from "../types/CurrentUser";
import { serverApiFetch } from "../network/serverApiFetch";

/**
 * Server-side session check against /auth/me. Returns the user when the
 * session cookie is valid, and null when the backend rejects the session
 * (401) so the caller can apply its redirect policy; throws on any other
 * failure so a backend blip reaches the error boundary instead of being
 * mistaken for "logged out".
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await serverApiFetch(Path.ME);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load session (${response.status})`);
  }

  return (await response.json()) as CurrentUser;
}
