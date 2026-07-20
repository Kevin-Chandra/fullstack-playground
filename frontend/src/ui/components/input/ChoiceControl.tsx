import type { ReactNode } from "react";

type ChoiceControlProps = {
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Shared shell for checkbox / radio / switch */
export default function ChoiceControl({
  label,
  disabled,
  className = "",
  children,
}: ChoiceControlProps) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      } ${className}`}
    >
      <span className="relative inline-flex shrink-0">{children}</span>
      {label && <span className="text-body-sm text-ink-body">{label}</span>}
    </label>
  );
}
