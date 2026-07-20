import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useControllableState } from "@/src/lib/hooks/components/useControllableState";

type UseInputSelectParams<T> = {
  options: T[];
  optionLabel: (option: T) => string;
  optionValue: (option: T) => string;
  optionDisabled: (option: T) => boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: T) => void;
  disabled?: boolean;
};

/**
 * Behaviour for a single-select listbox: open/close, controlled-or-uncontrolled
 * value, keyboard navigation (skipping disabled options) and outside-click.
 * The component that consumes this stays presentational.
 */
export function useInputSelect<T>({
  options,
  optionValue,
  optionDisabled,
  value,
  defaultValue,
  onChange,
  disabled = false,
}: UseInputSelectParams<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  // controlled-or-uncontrolled string value; the option-shaped onChange below
  // is fired separately since the external callback hands back the full option
  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue,
  });
  const selectedOption = useMemo(
    () => options.find((option) => optionValue(option) === selectedValue),
    [options, selectedValue],
  );

  const firstSelectable = (options: T[]) =>
    options.findIndex((option) => !optionDisabled(option));

  const lastSelectable = (options: T[]) => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!optionDisabled(options[i])) return i;
    }
    return -1;
  };

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const selectedIndex = options.findIndex(
      (option) => optionValue(option) === selectedValue,
    );
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : firstSelectable(options),
    );
    setOpen(true);
  }, [disabled, options, selectedValue]);

  const commit = useCallback(
    (next: T) => {
      setSelectedValue(optionValue(next));
      onChange?.(next);
      close();
    },
    [close, onChange, setSelectedValue],
  );

  const move = useCallback(
    (delta: 1 | -1) => {
      setActiveIndex((current) => {
        let next = current;
        for (let step = 0; step < options.length; step++) {
          next = (next + delta + options.length) % options.length;
          if (!optionDisabled(options[next])) return next;
        }
        return current;
      });
    },
    [options],
  );

  const onTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          open ? move(1) : openMenu();
          break;
        case "ArrowUp":
          event.preventDefault();
          open ? move(-1) : openMenu();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (!open) openMenu();
          else if (activeIndex >= 0) commit(options[activeIndex]);
          break;
        case "Home":
          if (open) {
            event.preventDefault();
            setActiveIndex(firstSelectable(options));
          }
          break;
        case "End":
          if (open) {
            event.preventDefault();
            setActiveIndex(lastSelectable(options));
          }
          break;
        case "Escape":
        case "Tab":
          close();
          break;
      }
    },
    [activeIndex, close, commit, disabled, move, open, openMenu, options],
  );

  useEffect(() => {
    setActiveIndex((current) =>
      current >= options.length ? firstSelectable(options) : current,
    );
  }, [options]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, close]);

  return {
    rootRef,
    open,
    activeIndex,
    selectedValue,
    selectedOption,
    setActiveIndex,
    toggle: () => (open ? close() : openMenu()),
    close,
    commit,
    onTriggerKeyDown,
  };
}
