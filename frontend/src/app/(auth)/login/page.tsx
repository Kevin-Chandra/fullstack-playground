"use client";

import { useLogin } from "@/src/lib/hooks/useLogin";
import AuthScene from "@/src/ui/features/auth/AuthScene";
import LoginForm from "@/src/ui/features/auth/LoginForm";

export default function LoginPage() {
  const { submit, submitting, error } = useLogin();

  return (
    <AuthScene>
      <LoginForm onSubmit={submit} submitting={submitting} error={error} />
    </AuthScene>
  );
}
