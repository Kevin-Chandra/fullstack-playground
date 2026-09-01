"use client"

import { savePageConfigs } from "../../services/pageService";
import { SavePageConfigPayload } from "../../types/PageConfig";
import { useMutation } from "../useMutation";

export function usePageConfigSave(slug: string) {
  /**
   * Replaces the whole draft: sections missing from the payload are deleted and
   * the array order becomes the section order. A `draftVersion` that no longer
   * matches the server's is rejected as stale.
   */
  const { loading, mutate } = useMutation((payload: SavePageConfigPayload) =>
    savePageConfigs(slug, payload),
  );

  return {
    loading,
    save: mutate,
  };
}
