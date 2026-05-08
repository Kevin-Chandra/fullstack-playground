"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultInput from "@/src/ui/components/input/DefaultInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await axios.post(
        `${API_URL}/auth/login`,
        { username, password },
        { withCredentials: true },
      );
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/[.08] dark:bg-zinc-950"
      >
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Admin sign in
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Use your admin credentials to continue.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <DefaultInput
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            disabled={submitting}
          />
          <DefaultInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            disabled={submitting}
          />

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <DefaultButton
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            // disabled={!username || !password}
          >
            Sign in
          </DefaultButton>
        </div>
      </form>
    </div>
  );
}
