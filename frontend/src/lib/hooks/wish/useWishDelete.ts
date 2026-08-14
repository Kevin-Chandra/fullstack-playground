import { useCallback, useState } from "react";
import { deleteWish } from "../../services/wishService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useWishDelete() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(
    async (wishId: string): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await deleteWish(wishId);
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
