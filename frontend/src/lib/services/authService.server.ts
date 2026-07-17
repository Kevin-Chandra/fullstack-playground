import { cache } from "react";
import { Auth as Path } from "../constants/apiPaths";
import { CurrentUser } from "../types/CurrentUser";
import { serverApiFetch } from "../network/serverApiFetch";

/**
 * Server-side session check against /auth/me. Returns the user when the
 * session cookie is valid, and null when the backend rejects the session
 * (401) so the caller can apply its redirect policy; throws on any other
 * failure so a backend blip reaches the error boundary instead of being
 * mistaken for "logged out".
 *
 * Wrapped in React cache() so multiple calls within a single server render
 * (e.g. the (session) layout guard + the dashboard layout reading the user
 * for the Navbar) collapse to one /auth/me request.
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    const response = await serverApiFetch(Path.ME);

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load session (${response.status})`);
    }

    return (await response.json()) as CurrentUser;
  },
);
