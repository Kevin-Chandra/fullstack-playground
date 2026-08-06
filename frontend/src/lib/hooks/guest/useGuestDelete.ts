import { useCallback, useState } from "react";
import { deleteGuest } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useGuestDelete() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(
    async (guestId: string): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await deleteGuest(guestId);
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
