import { ReactNode } from "react";

const field =
  "flex flex-col gap-md rounded-lg border border-edge bg-canvas px-xl py-lg";
const fieldLabel = "text-label uppercase text-muted";
const fieldValue = "truncate text-body text-ink";

type InfoFieldProps = {
  label: string;
  value: ReactNode;
};

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className={field}>
      <span className={fieldLabel}>{label}</span>
      <span className={fieldValue}>{value}</span>
    </div>
  );
}
