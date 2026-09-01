"use client"

import { createGuest } from "../../services/guestService";
import { useMutation } from "../useMutation";

export function useGuestCreate() {
  const { loading, mutate } = useMutation(createGuest);

  return {
    loading,
    create: mutate,
  };
}
