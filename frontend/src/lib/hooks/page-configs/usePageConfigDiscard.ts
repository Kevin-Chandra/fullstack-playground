import { useCallback, useState } from "react";
import { discardPageConfigs } from "../../services/pageService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePageConfigDiscard(slug: string) {
  const [loading, setLoading] = useState(false);

  /** Resets the draft to the live publication, dropping every pending edit. */
  const discard = useCallback(
    async (): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await discardPageConfigs(slug);
        return { success: true, data: null };
      } catch (e) {
        return { success: false, error: handleSystemError(e) };
      } finally {
        setLoading(false);
      }
    },
    [slug],
  );

  return {
    loading,
    discard,
  };
}
