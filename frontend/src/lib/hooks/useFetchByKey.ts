"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorEntity } from "../types/ErrorEntity";
import { Result } from "../types/result";
import { handleSystemError } from "../utils/errorHandler";

export interface FetchByKeyResult<T> {
  /**
   * Undefined before the first response for the current key — the "nothing to
   * show yet" state a skeleton renders against.
   */
  result?: Result<T, ErrorEntity>;
  loading: boolean;
  /** Reloads the current key, keeping what is on screen until it lands. */
  refetch: () => void;
}

/**
 * The read half of the `service` → `hook` → `component` flow: loads one keyed
 * resource, reloads it on demand, and turns a thrown `AxiosError` into a typed
 * `Result` so the hook never throws at a component.
 *
 * An undefined `key` means there is nothing to load — a closed detail panel,
 * a route param not resolved yet — and clears the state rather than fetching.
 *
 * A refetch keeps the current result on screen while the request is in flight,
 * because clearing it unmounts whatever the consumer renders from it and takes
 * uncommitted input with it. A *different* key does clear, since that data
 * belongs to something else. Consumers branch on `loading` to disable, and on
 * `result` only to decide between a skeleton and content.
 *
 * Responses are matched to their effect run rather than to a serial: the
 * cleanup marks a superseded request ignored, which covers unmount too, so a
 * response that lands after the key moved on can never overwrite the newer one.
 */
export function useFetchByKey<T>(
  key: string | undefined,
  load: (key: string) => Promise<T>,
): FetchByKeyResult<T> {
  const [result, setResult] = useState<Result<T, ErrorEntity>>();
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Held in a ref so a loader defined inline at the call site does not restart
  // the request on every render of the consumer.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  // The key the state on screen belongs to, so a refetch can be told apart
  // from a move to a different one.
  const loadedKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!key) {
      loadedKeyRef.current = undefined;
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;

    if (loadedKeyRef.current !== key) {
      loadedKeyRef.current = key;
      setResult(undefined);
    }

    setLoading(true);

    async function fetch(key: string) {
      try {
        const data = await loadRef.current(key);
        if (!ignore) setResult({ success: true, data });
      } catch (e) {
        if (!ignore) setResult({ success: false, error: handleSystemError(e) });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetch(key);

    return () => {
      ignore = true;
    };
  }, [key, retryKey]);

  const refetch = useCallback(() => {
    setRetryKey((current) => current + 1);
  }, []);

  return {
    result,
    loading,
    refetch,
  };
}
