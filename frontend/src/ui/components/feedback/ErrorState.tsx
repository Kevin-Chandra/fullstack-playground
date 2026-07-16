"use client";

import DefaultButton from "@/src/ui/components/buttons/DefaultButton";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't reach the server. Please try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/6 bg-white p-8 text-center shadow-sm dark:border-white/8 dark:bg-zinc-950">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        {title}
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      <DefaultButton onClick={onRetry}>Try again</DefaultButton>
    </div>
  );
}
