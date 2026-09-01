"use client"

import { getPageConfigs } from "../../services/pageService";
import { useFetchByKey } from "../useFetchByKey";

/**
 * The page's draft, as the editor works on it.
 *
 * Saving and discarding both return an empty body, so the caller must
 * `refetch` to pick up the new section ids and the incremented `draftVersion`.
 * That refetch leaves the current draft on screen while it runs — see
 * {@link useFetchByKey}.
 */
export function usePageConfigs(slug: string | undefined) {
  return useFetchByKey(slug, getPageConfigs);
}
