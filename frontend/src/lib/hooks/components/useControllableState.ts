import { useCallback, useState } from "react";

type UseControllableStateParams<T> = {
  /** controlled value; when provided the hook never owns state */
  value?: T;
  /** initial value for the uncontrolled case */
  defaultValue?: T;
  onChange?: (value: T) => void;
};

/**
 * Single source of truth for a value that may be controlled (parent passes
 * `value`) or uncontrolled (component keeps its own state seeded by
 * `defaultValue`). `onChange` fires in both modes. Shared by the form-group
 * wrappers so the controlled/uncontrolled branching lives in one place.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue] as const;
}
