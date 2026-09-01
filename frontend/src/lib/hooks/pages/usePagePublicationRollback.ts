"use client"

import { rollbackPublication } from "../../services/pageService";
import { useMutation } from "../useMutation";

export function usePagePublicationRollback(slug: string) {
  const { loading, mutate } = useMutation((publicationId: string) =>
    rollbackPublication(slug, publicationId),
  );

  return {
    loading,
    rollback: mutate,
  };
}
