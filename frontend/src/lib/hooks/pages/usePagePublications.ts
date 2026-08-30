"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { PAGINATION_LIMIT } from "../../constants/pagination";
import { getPagePublications } from "../../services/pageService";
import { GetPagePublicationParams, PagePublicationItem } from "../../types/DynamicPage";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Paginated } from "../../types/Paginated";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePagePublications(slug: string, page: number) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result<Paginated<PagePublicationItem>, ErrorEntity>>();

  // Serial of the request that owns the state, so a page change or a refresh
  // that overtakes an earlier request wins no matter which lands first.
  const requestIdRef = useRef(0);

  const fetch = useCallback(
    async () => {
      const requestId = ++requestIdRef.current;

      setLoading(true);
      try {
        const query: GetPagePublicationParams = {
          limit: PAGINATION_LIMIT,
          page: page,
        };

        const result = await getPagePublications(slug, query)
        if (requestId !== requestIdRef.current) {
          return;
        }

        setResult({ success: true, data: result })
      } catch (e: unknown) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const errorEntity = handleSystemError(e);
        setResult({ success: false, error: errorEntity })
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, [slug, page]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    loading,
    result,
    fetch
  }
}
