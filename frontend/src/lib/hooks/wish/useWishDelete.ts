"use client"

import { deleteWish } from "../../services/wishService";
import { useMutation } from "../useMutation";

export function useWishDelete() {
  const { loading, mutate } = useMutation(deleteWish);

  return {
    loading,
    remove: mutate,
  };
}
