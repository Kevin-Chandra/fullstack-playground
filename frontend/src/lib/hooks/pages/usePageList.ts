"use client"

import { useCallback, useEffect, useState } from "react";
import { getPages } from "../../services/pageService";
import { DynamicPage } from "../../types/DynamicPage";
import { ErrorEntity } from "../../types/ErrorEntity";
import { handleSystemError } from "../../utils/errorHandler";

export function usePageList() {
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEntity>();

  const refetch = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {

      const pages = await getPages();

      setPages(pages);
    } catch (e: unknown) {
      const error = handleSystemError(e);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    pages,
    loading,
    error,
    refetch,
  };
}