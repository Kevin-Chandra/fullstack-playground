"use client";

import { getUserDetails } from "../../services/userService";
import { useFetchByKey } from "../useFetchByKey";

/** Unwraps the `Result` — this one's consumers read the user and error directly. */
export function useUserDetails(userId: string | undefined) {
  const { result, loading, refetch } = useFetchByKey(userId, getUserDetails);

  return {
    user: result?.success ? result.data : undefined,
    error: result && !result.success ? result.error : undefined,
    loading,
    refetch,
  };
}
