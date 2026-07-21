"use client";

import { useEffect } from "react";
import FullScreenError from "@/src/ui/components/error/FullScreenError";

/**
 * In-chrome error boundary: catches errors from pages inside the protected
 * shell (e.g. the users list fetch failing on a soft navigation) so the
 * header/nav stay visible and only the content area shows the retryable
 * fallback. Errors from the (session) layout itself land in the boundary
 * one level up instead.
 */
export default function SessionError({
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
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <FullScreenError title="SessionError" />
    </div>
  );
}
