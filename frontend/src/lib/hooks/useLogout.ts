"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../services/authService";
import { Routes } from "../constants/routes";

/**
 * Logout orchestration: clears the session via the service, then returns the
 * user to /login. Navigation runs even if the request fails.
 */
export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      router.replace(Routes.LOGIN);
      router.refresh();
    }
  };

  return { logout: submit, loading };
}
