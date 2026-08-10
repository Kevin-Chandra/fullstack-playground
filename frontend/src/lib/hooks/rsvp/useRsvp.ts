import { useCallback, useState } from "react";
import { createRsvp } from "../../services/rsvpService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { CreateRsvpPayload, Rsvp } from "../../types/Rsvp";
import { handleSystemError } from "../../utils/errorHandler";

export function useRsvp() {
  const [loading, setLoading] = useState(false)

  const create = useCallback(
    async (payload: CreateRsvpPayload): Promise<Result<Rsvp, ErrorEntity>> => {
      setLoading(true)

      try {
        const result = await createRsvp(payload);
        return { success: true, data: result };
      } catch (e) {
        return { success: false, error: handleSystemError(e) };
      } finally {
        setLoading(false);
      }
    },
    [],
  )

  return {
    loading,
    create
  }
}