import { useCallback, useEffect, useState } from "react";
import { getGuestByUuid } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { PublicGuest } from "../../types/Guest";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function usePublicGuest(uuid?: string) {
  const [result, setResult] = useState<Result<PublicGuest, ErrorEntity>>();
  const [loading, setLoading] = useState(uuid !== undefined);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!uuid) {
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;
    setResult(undefined);
    setLoading(true);

    async function load(id: string) {
      try {
        const guest = await getGuestByUuid(id);
        if (!ignore) setResult({ success: true, data: guest });
      } catch (e) {
        if (!ignore) setResult({ success: false, error: handleSystemError(e) });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load(uuid);

    return () => {
      ignore = true;
    };
  }, [uuid, retryKey]);

  const refetch = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  return {
    result,
    loading,
    refetch,
  };
}