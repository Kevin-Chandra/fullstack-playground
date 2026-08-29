import { useCallback, useEffect, useState } from "react";
import { getPageDetailsBySlug } from "../../services/pageService";
import { DynamicPageDetails } from "../../types/DynamicPage";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePageDetails(slug: string | undefined) {
  const [result, setResult] = useState<Result<DynamicPageDetails, ErrorEntity>>();
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!slug) {
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;
    setResult(undefined);
    setLoading(true);

    async function load(slug: string) {
      try {
        const guest = await getPageDetailsBySlug(slug);
        if (!ignore) setResult({ success: true, data: guest });
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

  const refetch = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  return {
    result,
    loading,
    refetch,
  };
}