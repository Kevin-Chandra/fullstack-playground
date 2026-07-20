"use client";

import { useId } from "react";
import type { ReactNode } from "react";

export type ChoiceGroupOrientation = "vertical" | "horizontal";

const orientations: Record<ChoiceGroupOrientation, string> = {
  vertical: "flex flex-col gap-3",
  horizontal: "flex flex-wrap gap-6",
};

type ChoiceGroupFieldProps = {
  /** "group" for checkboxes, "radiogroup" for radios */
  role: "group" | "radiogroup";
  /** accessible name for the group; rendered above the options when provided */
  label?: ReactNode;
  orientation?: ChoiceGroupOrientation;
  className?: string;
  children: ReactNode;
};

/**
 * Shared presentational shell for CheckboxGroup / RadioGroup: the group label
 * and the role'd, orientation-laid-out options wrapper. Each group wraps this
 * in its own context provider.
 */
export default function ChoiceGroupField({
  role,
  label,
  orientation = "vertical",
  className = "",
  children,
}: ChoiceGroupFieldProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <span id={labelId} className="font-mono text-label text-muted">
          {label}
        </span>
      )}
      <div
        role={role}
        aria-labelledby={label ? labelId : undefined}
        className={`${orientations[orientation]} ${className}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
