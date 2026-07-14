"use client";

import { useEffect } from "react";
import ErrorState from "@/src/ui/components/feedback/ErrorState";

/**
 * Protected-branch error boundary: catches errors thrown above the portal
 * chrome — i.e. the (session) layout's requireUser() check failing on a hard
 * load when the backend is unreachable. There is no header/nav to preserve at
 * this point, so the fallback is full-screen.
 */
export default function ProtectedError({
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
      <ErrorState
        title="Portal unavailable"
        description="We couldn't verify your session. Please try again in a moment."
        onRetry={reset}
      />
    </div>
  );
}
