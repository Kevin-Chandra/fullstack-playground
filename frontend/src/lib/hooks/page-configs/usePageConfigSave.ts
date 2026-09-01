import { useCallback, useState } from "react";
import { savePageConfigs } from "../../services/pageService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { SavePageConfigPayload } from "../../types/PageConfig";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePageConfigSave(slug: string) {
  const [loading, setLoading] = useState(false);

  /**
   * Replaces the whole draft: sections missing from the payload are deleted and
   * the array order becomes the section order. A `draftVersion` that no longer
   * matches the server's is rejected as stale.
   */
  const save = useCallback(
    async (payload: SavePageConfigPayload): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await savePageConfigs(slug, payload);
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
    save,
  };
}
