"use client"

import { deleteUser } from "../../services/userService";
import { useMutation } from "../useMutation";

export function useUserDelete() {
  const { loading, mutate } = useMutation(deleteUser);

  return {
    loading,
    remove: mutate,
  };
}
