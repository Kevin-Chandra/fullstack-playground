import { ReactNode } from "react";

const container = "flex min-w-0 flex-1 gap-sm rounded-lg border border-edge bg-canvas p-xl"
const field = "flex min-w-0 flex-col flex-1 gap-sm justify-center";
const fieldLabel = "font-mono text-label uppercase text-muted text-wrap";
const fieldValue = "text-wrap text-body text-ink overflow-hidden";

type InfoFieldProps = {
  label: string;
  value: string;
  placeholderText?: string;
  children?: ReactNode;
};

export default function InfoField({ label,
  value,
  placeholderText = "-",
  children = null
}: InfoFieldProps) {

  const valueText = value ? value : placeholderText;
  const valueTextColor = value ? "text-ink" : "text-muted"

  return (
    <div className={container}>
      <div className={field}>
        <span className={fieldLabel}>{label}</span>
        <span className={`${fieldValue} ${valueTextColor}`}>{valueText}</span>
      </div>
      {children}
    </div>
  );
}
