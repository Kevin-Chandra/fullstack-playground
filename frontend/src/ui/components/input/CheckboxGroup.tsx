"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import type { LabelPosition } from "@/src/ui/components/input/ChoiceControl";
import ChoiceGroupField, {
  type ChoiceGroupOrientation,
} from "@/src/ui/components/input/ChoiceGroupField";
import type { DefaultCheckboxProps } from "@/src/ui/components/input/DefaultCheckbox";
import { useControllableState } from "@/src/lib/hooks/components/useControllableState";

type CheckboxGroupContextValue = {
  name?: string;
  values: string[];
  toggle: (value: string, checked: boolean) => void;
  disabled: boolean;
  labelPosition?: LabelPosition;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

/** Read by child <DefaultCheckbox>es to derive their checked state from the set. */
export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}

type CheckboxChild = ReactElement<DefaultCheckboxProps>;

export type CheckboxGroupProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** optional shared name; repeated per checked box in native form submits */
  name?: string;
  /** accessible name for the group; rendered above the options when a string */
  label?: ReactNode;
  disabled?: boolean;
  labelPosition?: LabelPosition;
  orientation?: ChoiceGroupOrientation;
  className?: string;
  children: CheckboxChild | CheckboxChild[];
};

const EMPTY: string[] = [];

export default function CheckboxGroup({
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
}: CheckboxGroupProps) {
  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? EMPTY,
    onChange: onValueChange,
  });

  const values = selected ?? EMPTY;

  const toggle = useCallback(
    (optionValue: string, checked: boolean) => {
      setSelected(
        checked
          ? [...values, optionValue]
          : values.filter((entry) => entry !== optionValue),
      );
    },
    [values, setSelected],
  );

  const contextValue = useMemo(
    () => ({ name, values, toggle, disabled, labelPosition }),
    [name, values, toggle, disabled, labelPosition],
  );

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <ChoiceGroupField
        role="group"
        label={label}
        orientation={orientation}
        className={className}
      >
        {children}
      </ChoiceGroupField>
    </CheckboxGroupContext.Provider>
  );
}
