"use client";

type ErrorAlertProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

/**
 * Inline error banner (role="alert") for form/action failures. Pass onRetry
 * to surface a retry action beside the message; omit it for errors the user
 * resolves by editing input (e.g. bad credentials). For a full-panel error
 * with a prominent CTA, use ErrorState instead.
 */
export default function ErrorAlert({
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-md bg-error/10 px-3 py-2 text-caption text-error ${className}`}
    >
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
