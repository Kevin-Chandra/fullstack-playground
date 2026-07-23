"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserDetails } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { User } from "../../types/User";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserDetails(id: string) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEntity>();

  const refetch = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const user = await getUserDetails(id);

      setUser(user);
    } catch (e: unknown) {
      const error = handleSystemError(e);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    user,
    loading,
    error,
    refetch,
  };
}
