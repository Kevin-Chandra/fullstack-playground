import { useCallback, useState } from "react";
import { rollbackPublication } from "../../services/pageService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePagePublicationRollback(slug: string) {
  const [loading, setLoading] = useState(false);

  const rollback = useCallback(
    async (publicationId: string): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await rollbackPublication(slug, publicationId);
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
    rollback,
  };
}
