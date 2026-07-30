"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserDetails } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { User } from "../../types/User";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserDetails(userId: string | undefined) {
  const [result, setResult] = useState<Result<User, ErrorEntity>>();
  const [loading, setLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setResult(undefined);
      setLoading(false);
      return;
    }

    let ignore = false;
    setResult(undefined);
    setLoading(true);

    async function load(id: string) {
      try {
        const user = await getUserDetails(id);
        if (!ignore) setResult({ success: true, data: user });
      } catch (e) {
        if (!ignore) setResult({ success: false, error: handleSystemError(e) });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load(userId);

    return () => {
      ignore = true;
    };
  }, [userId, retryKey]);

  const refetch = useCallback(() => {
    setRetryKey((key) => key + 1);
  }, []);

  return {
    user: result?.success ? result.data : undefined,
    error: result && !result.success ? result.error : undefined,
    loading,
    refetch,
  };
}
