"use client"

import { createRsvp } from "../../services/rsvpService";
import { useMutation } from "../useMutation";

export function useRsvp() {
  const { loading, mutate } = useMutation(createRsvp);

  return {
    loading,
    create: mutate,
  };
}
