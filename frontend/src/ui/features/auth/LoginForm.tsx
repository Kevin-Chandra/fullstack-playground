"use client";

import { LoginPayload } from "@/src/lib/types/Auth";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import ErrorBanner from "@/src/ui/components/error/ErrorBanner";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import type { ChangeEvent, SubmitEvent } from "react";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => void;
  submitting: boolean;
  error: string | null;
};

export default function LoginForm({
  onSubmit,
  submitting,
  error,
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = () => onSubmit({ username, password });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <header>
          <h1 className="font-display text-h1 text-ink">Welcome back</h1>
          <p className="mt-2 text-body text-muted">
            Sign in to continue to your workspace.
          </p>
        </header>

        <div className="mt-9 flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <DefaultInput
              id="login-username"
              name="username"
              label="Username"
              autoComplete="username"
              placeholder="yourusername"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
              fullWidth
              inputSize="lg"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <DefaultInput
              id="login-password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="password"
              rightIcon={showPassword ? MdVisibilityOff : MdVisibility}
              rightIconLabel={showPassword ? "Hide password" : "Show password"}
              onRightIconClick={() => setShowPassword((prev) => !prev)}
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              fullWidth
              inputSize="lg"
              disabled={submitting}
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <DefaultButton
            type="submit"
            variant="primary"
            fullWidth
            loading={submitting}
            label="Login"
          />
        </div>
      </form>
    </>
  );
}
