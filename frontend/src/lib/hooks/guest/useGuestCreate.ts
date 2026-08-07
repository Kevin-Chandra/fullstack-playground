import { useCallback, useState } from "react";
import { createGuest } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { CreateGuestPayload, Guest } from "../../types/Guest";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useGuestCreate() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (payload: CreateGuestPayload): Promise<Result<Guest, ErrorEntity>> => {
      setLoading(true);

      try {
        const result = await createGuest(payload);
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
    create,
  };
}
