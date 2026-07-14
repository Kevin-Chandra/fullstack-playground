import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { Auth as Path } from "../constants/apiPaths";
import { Routes } from "../constants/routes";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function redirectToSessionExpired(): void {
  if (typeof window !== "undefined") {
    // Through the clear-session route, not straight to /login: the dead
    // cookies must be deleted first or the proxy's cookie-presence gate
    // bounces the navigation back into the portal.
    window.location.href = Routes.CLEAR_SESSION;
  }
}

/**
 * Builds the response-error handler for the axios instance. On a 401 from a
 * normal request it silently refreshes the session once and replays the
 * request; if the refresh fails (or the failing call is itself an auth call)
 * the session is over and the browser is sent to clear-session → /login.
 * The instance is injected so this policy stays decoupled from instance
 * creation and avoids a circular import.
 */
export function createSessionRetryHandler(instance: AxiosInstance) {
  // Single-flight refresh: concurrent 401s share one /auth/refresh call.
  let refreshPromise: Promise<unknown> | null = null;

  const refreshSession = (): Promise<unknown> => {
    if (!refreshPromise) {
      refreshPromise = instance.get(Path.REFRESH).finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };

  return async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? "";

    if (error.response?.status !== 401 || !original) {
      return Promise.reject(error);
    }

    // Bad credentials on login — let the form surface the error, no redirect.
    if (url.includes(Path.LOGIN)) {
      return Promise.reject(error);
    }

    // The refresh call itself failed, or we already retried once → session gone.
    if (url.includes(Path.REFRESH) || original._retry) {
      redirectToSessionExpired();
      return Promise.reject(error);
    }

    // First 401 on a normal request: refresh once, then replay it transparently.
    original._retry = true;
    try {
      await refreshSession();
      return instance(original);
    } catch (refreshError) {
      redirectToSessionExpired();
      return Promise.reject(refreshError);
    }
  };
}
