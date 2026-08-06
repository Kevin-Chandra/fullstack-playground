import { ReactNode } from "react";

const container = "flex min-w-0 flex-1 gap-sm rounded-lg border border-edge bg-canvas p-xl"
const field = "flex min-w-0 flex-col flex-1 gap-sm justify-center";
const fieldLabel = "font-mono text-label uppercase text-muted text-wrap";
const fieldValue = "truncate text-body text-ink";
const fieldValueMuted = "truncate text-body text-muted italic";

type ValueVariant = "default" | "muted"

const fieldValueVariants: Record<ValueVariant, string> = {
  default: fieldValue,
  muted: fieldValueMuted,
};

type InfoFieldProps = {
  label: string;
  variant?: ValueVariant;
  value: string;
  children?: ReactNode;
};

export default function InfoField({ label,
  value,
  variant = "default",
  children = null
}: InfoFieldProps) {
  return (
    <div className={container}>
      <div className={field}>
        <span className={fieldLabel}>{label}</span>
        <span className={fieldValueVariants[variant]}>{value}</span>
      </div>
      {children}
    </div>
  );
}
