"use client";

import { createContext, useContext, useId, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import type { LabelPosition } from "@/src/ui/components/input/ChoiceControl";
import ChoiceGroupField, {
  type ChoiceGroupOrientation,
} from "@/src/ui/components/input/ChoiceGroupField";
import type { DefaultRadioButtonProps } from "@/src/ui/components/input/DefaultRadioButton";
import { useControllableState } from "@/src/lib/hooks/components/useControllableState";

type RadioGroupContextValue = {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  disabled: boolean;
  labelPosition?: LabelPosition;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** Read by child <DefaultRadioButton>s to derive their checked state + name. */
export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}

type RadioChild = ReactElement<DefaultRadioButtonProps>;

export type RadioGroupProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** shared across every radio; auto-generated when omitted */
  name?: string;
  /** accessible name for the group; rendered above the options when a string */
  label?: ReactNode;
  disabled?: boolean;
  labelPosition?: LabelPosition;
  orientation?: ChoiceGroupOrientation;
  className?: string;
  children: RadioChild | RadioChild[];
};

export default function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  label,
  disabled = false,
  labelPosition,
  orientation,
  className,
  children,
}: RadioGroupProps) {
  const reactId = useId();
  const [selected, select] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const resolvedName = name ?? reactId;
  const contextValue = useMemo(
    () => ({ name: resolvedName, value: selected, select, disabled, labelPosition }),
    [resolvedName, selected, select, disabled, labelPosition],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <ChoiceGroupField
        role="radiogroup"
        label={label}
        orientation={orientation}
        className={className}
      >
        {children}
      </ChoiceGroupField>
    </RadioGroupContext.Provider>
  );
}
