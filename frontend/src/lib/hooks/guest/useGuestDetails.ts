import { useCallback, useEffect, useState } from "react";
import { getGuestDetails } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Guest } from "../../types/Guest";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useGuestDetails(guestId: string | undefined) {
  const [result, setResult] = useState<Result<Guest, ErrorEntity>>();
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!guestId) {
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;
    setResult(undefined);
    setLoading(true);

    async function load(id: string) {
      try {
        const guest = await getGuestDetails(id);
        if (!ignore) setResult({ success: true, data: guest });
      } catch (e) {
        if (!ignore) setResult({ success: false, error: handleSystemError(e) });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load(guestId);

    return () => {
      ignore = true;
    };
  }, [guestId, retryKey]);

  const refetch = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  return {
    result,
    loading,
    refetch,
  };
}