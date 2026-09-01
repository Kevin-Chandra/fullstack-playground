"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorEntity } from "../types/ErrorEntity";
import { Result } from "../types/result";
import { handleSystemError } from "../utils/errorHandler";

export interface Mutation<TArgs extends unknown[], TData> {
  /** True from the call until the request settles, however it settles. */
  loading: boolean;
  mutate: (...args: TArgs) => Promise<Result<TData, ErrorEntity>>;
}

/**
 * The write half of the `service` → `hook` → `component` flow: runs a service
 * call, tracks its pending state, and turns a thrown `AxiosError` into a typed
 * `Result` so the hook never throws at a component.
 *
 * Domain hooks wrap this and name the verb — `remove`, `create`, `update` —
 * rather than exposing `mutate` directly, so call sites keep reading in the
 * language of the thing they act on.
 *
 * `mutate` keeps one identity for the life of the component even when `run`
 * closes over changing values: the latest `run` is held in a ref, so a call
 * always uses the current closure without every consumer's `useCallback` being
 * rebuilt underneath it.
 */
export function useMutation<TArgs extends unknown[], TData>(
  run: (...args: TArgs) => Promise<TData>,
): Mutation<TArgs, TData> {
  const [loading, setLoading] = useState(false);

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  const mutate = useCallback(
    async (...args: TArgs): Promise<Result<TData, ErrorEntity>> => {
      setLoading(true);

      try {
        return { success: true, data: await runRef.current(...args) };
      } catch (e) {
        return { success: false, error: handleSystemError(e) };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    mutate,
  };
}
