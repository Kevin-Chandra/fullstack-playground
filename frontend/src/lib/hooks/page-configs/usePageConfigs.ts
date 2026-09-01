"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { getPageConfigs } from "../../services/pageService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { PageDraft } from "../../types/PageConfig";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePageConfigs(slug: string | undefined) {
  const [result, setResult] = useState<Result<PageDraft, ErrorEntity>>();
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // The page the state on screen belongs to, so a refetch can be told apart
  // from a move to a different page.
  const loadedSlugRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!slug) {
      loadedSlugRef.current = undefined;
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;

    // Another page's draft is stale and has to go, but a refetch of the same
    // page keeps what is on screen until the new draft lands: clearing it
    // unmounts the editor mid-edit and takes uncommitted input with it.
    if (loadedSlugRef.current !== slug) {
      loadedSlugRef.current = slug;
      setResult(undefined);
    }

    setLoading(true);

    async function load(slug: string) {
      try {
        const draft = await getPageConfigs(slug);
        if (!ignore) setResult({ success: true, data: draft });
      } catch (e) {
        if (!ignore) setResult({ success: false, error: handleSystemError(e) });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load(slug);

    return () => {
      ignore = true;
    };
  }, [slug, retryKey]);

  /**
   * Saving and discarding both return an empty body, so the caller must refetch
   * to pick up the new section ids and the incremented `draftVersion`.
   *
   * The current draft stays on screen while the request is in flight — watch
   * `loading` to disable the editor rather than waiting for `result`.
   */
  const refetch = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  return {
    result,
    loading,
    refetch,
  };
}
