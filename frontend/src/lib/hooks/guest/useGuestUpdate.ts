"use client"

import { updateGuest } from "../../services/guestService";
import { useMutation } from "../useMutation";

export function useGuestUpdate() {
  const { loading, mutate } = useMutation(updateGuest);

  return {
    loading,
    update: mutate,
  };
}
