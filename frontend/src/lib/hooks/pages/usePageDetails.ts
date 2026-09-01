"use client"

import { getPageDetailsBySlug } from "../../services/pageService";
import { useFetchByKey } from "../useFetchByKey";

export function usePageDetails(slug: string | undefined) {
  return useFetchByKey(slug, getPageDetailsBySlug);
}
