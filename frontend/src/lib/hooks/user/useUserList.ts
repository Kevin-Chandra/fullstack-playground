"use client";

import { useCallback, useEffect, useState } from "react";
import { GetUserParams, User } from "../../types/User";
import { PAGINATION_LIMIT } from "../../constants/pagination";
import { getUsers } from "../../services/userService";
import { PaginatedMeta } from "../../types/Paginated";
import { ErrorEntity } from "../../types/ErrorEntity";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserList(page: number, search?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEntity>();

  const refetch = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const query: GetUserParams = {
        limit: PAGINATION_LIMIT,
        search: search,
        page: page,
      };

      const { data, meta } = await getUsers(query);

      setUsers(data);
      setMeta(meta);
    } catch (e: unknown) {
      const error = handleSystemError(e);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    users,
    meta,
    loading,
    error,
    refetch,
  };
}
