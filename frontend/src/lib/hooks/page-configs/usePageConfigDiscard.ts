"use client"

import { discardPageConfigs } from "../../services/pageService";
import { useMutation } from "../useMutation";

export function usePageConfigDiscard(slug: string) {
  /** Resets the draft to the live publication, dropping every pending edit. */
  const { loading, mutate } = useMutation(() => discardPageConfigs(slug));

  return {
    loading,
    discard: mutate,
  };
}
