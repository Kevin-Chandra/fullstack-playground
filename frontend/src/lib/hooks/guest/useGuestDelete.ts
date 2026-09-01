"use client"

import { deleteGuest } from "../../services/guestService";
import { useMutation } from "../useMutation";

export function useGuestDelete() {
  const { loading, mutate } = useMutation(deleteGuest);

  return {
    loading,
    remove: mutate,
  };
}
