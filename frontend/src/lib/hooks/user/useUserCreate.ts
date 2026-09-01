"use client"

import { createUser } from "../../services/userService";
import { useMutation } from "../useMutation";

export function useUserCreate() {
  const { loading, mutate } = useMutation(createUser);

  return {
    loading,
    create: mutate,
  };
}
