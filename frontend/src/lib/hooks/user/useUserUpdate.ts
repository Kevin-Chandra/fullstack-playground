"use client"

import { updateUser } from "../../services/userService";
import { useMutation } from "../useMutation";

export function useUserUpdate() {
  const { loading, mutate } = useMutation(updateUser);

  return {
    loading,
    update: mutate,
  };
}
