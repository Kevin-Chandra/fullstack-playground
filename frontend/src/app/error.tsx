"use client";

import { useEffect } from "react";
import ErrorState from "@/src/ui/components/feedback/ErrorState";

/**
 * Root error boundary for the public branch (landing page, login).
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <ErrorState onRetry={reset} />
    </div>
  );
}
