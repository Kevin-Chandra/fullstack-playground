"use client"

import { getGuestDetails } from "../../services/guestService";
import { useFetchByKey } from "../useFetchByKey";

export function useGuestDetails(guestId: string | undefined) {
  return useFetchByKey(guestId, getGuestDetails);
}
