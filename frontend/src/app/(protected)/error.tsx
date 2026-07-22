"use client";

import { useEffect } from "react";
import ErrorState from "@/src/ui/components/error/ErrorState";
import FullScreenError from "@/src/ui/components/error/FullScreenError";

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
    <FullScreenError
      title="Portal unavailable"
      description="We couldn't verify your session. Please try again in a moment."
    />
  );
}
