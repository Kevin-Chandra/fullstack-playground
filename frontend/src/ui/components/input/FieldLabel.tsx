import type { ReactNode } from "react";

type FieldLabelProps = {
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/**
 * Uppercase mono field label with an optional trailing slot (e.g. a
 * "Forgot?" link) kept on the same row. Pairs with DefaultInput when the
 * label needs styling or extras beyond DefaultInput's built-in label.
 */
export default function FieldLabel({
  children,
  trailing,
  className = "",
}: FieldLabelProps) {
  return (
    <div className={`flex items-baseline justify-between ${className}`}>
      <label className="font-mono text-label uppercase text-muted">
        {children}
      </label>
      {trailing}
    </div>
  );
}
