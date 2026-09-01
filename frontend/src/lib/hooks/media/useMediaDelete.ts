import { useCallback, useState } from "react";
import { deleteMedia } from "../../services/mediaService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useMediaDelete() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(
    async (key: string): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await deleteMedia(key);
        return { success: true, data: null };
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
    remove,
  };
}
