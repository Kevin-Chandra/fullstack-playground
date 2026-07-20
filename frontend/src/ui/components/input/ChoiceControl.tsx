import type { ReactNode } from "react";

export type LabelPosition = "left" | "right";

type ChoiceControlProps = {
  label?: ReactNode;
  /** which side of the control the label text sits on */
  labelPosition?: LabelPosition;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Shared shell for checkbox / radio / switch */
export default function ChoiceControl({
  label,
  labelPosition = "left",
  disabled,
  className = "",
  children,
}: ChoiceControlProps) {
  const labelNode = label ? (
    <span className="text-body-sm text-ink-body">{label}</span>
  ) : null;

  return (
    <label
      className={`inline-flex items-center gap-2.5 ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      } ${className}`}
    >
      {labelPosition === "left" && labelNode}
      <span className="relative inline-flex shrink-0">{children}</span>
      {labelPosition === "right" && labelNode}
    </label>
  );
}
