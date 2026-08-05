"use client"

import { useCallback, useEffect, useState } from "react";
import { PAGINATION_LIMIT } from "../../constants/pagination";
import { getGuests } from "../../services/guestService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { GetGuestParams, GuestListItem } from "../../types/Guest";
import { Paginated } from "../../types/Paginated";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useGuestList(page: number, search?: string) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result<Paginated<GuestListItem>, ErrorEntity>>();

  const fetch = useCallback(
    async () => {
      setLoading(true);
      try {
        const query: GetGuestParams = {
          limit: PAGINATION_LIMIT,
          search: search,
          page: page,
        };

        const result = await getGuests(query)
        setResult({ success: true, data: result })
      } catch (e: unknown) {
        const errorEntity = handleSystemError(e);
        setResult({ success: false, error: errorEntity })
      } finally {
        setLoading(false);
      }
    }, [page, search]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    loading,
    result,
    fetch
  }
}