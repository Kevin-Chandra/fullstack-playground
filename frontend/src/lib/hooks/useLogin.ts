"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/authService";
import { getLoginErrorMessage } from "../utils/authError";
import { LoginPayload } from "../types/Auth";
import { Routes } from "../constants/routes";

/**
 * Login orchestration: owns the submit lifecycle (pending/error state, the
 * service call, and post-login navigation) so components stay presentational.
 */
export function useLogin() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: LoginPayload) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(payload);
      router.replace(Routes.DASHBOARD);
      router.refresh();
    } catch (err) {
      setError(getLoginErrorMessage(err));
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
