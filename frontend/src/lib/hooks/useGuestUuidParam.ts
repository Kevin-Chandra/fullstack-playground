"use client";

import { useSearchParams } from "next/navigation";
import { QueryParams } from "../constants/queryParams";

export function useGuestUuidParam(): string | undefined {
  const searchParams = useSearchParams();
  return searchParams.get(QueryParams.GUEST_UUID)?.trim() || undefined;
}
