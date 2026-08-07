import { useCallback, useState } from "react";
import { updateGuest } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Guest, UpdateGuestPayload } from "../../types/Guest";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useGuestUpdate() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (guestId: string, payload: UpdateGuestPayload): Promise<Result<Guest, ErrorEntity>> => {
      setLoading(true);

      try {
        const result = await updateGuest(guestId, payload);
        return { success: true, data: result };
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
    update,
  };
}
