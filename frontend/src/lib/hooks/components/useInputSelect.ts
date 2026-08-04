import { useControllableState } from "@/src/lib/hooks/components/useControllableState";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type UseInputSelectParams<T> = {
  options: T[];
  optionLabel: (option: T) => string;
  optionValue: (option: T) => string;
  optionDisabled?: (option: T) => boolean;
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
  optionDisabled = () => false,
  value,
  defaultValue,
  onChange,
  disabled = false,
}: UseInputSelectParams<T>) {
  const [open, setOpen] = useState(false);
  const [rawActiveIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  // controlled-or-uncontrolled string value; the option-shaped onChange below
  // is fired separately since the external callback hands back the full option
  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue,
  });
  const firstSelectable = (options: T[]) =>
    options.findIndex((option) => !optionDisabled(option));

  const lastSelectable = (options: T[]) => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!optionDisabled(options[i])) return i;
    }
    return -1;
  };

  // The option accessors are inline arrows at most call sites, so anything
  // keyed on their identity would recompute every render regardless. These are
  // cheap scans over a dropdown-sized list, so derive them during render.
  const selectedOption = options.find(
    (option) => optionValue(option) === selectedValue,
  );

  // Clamped during render rather than synced through an effect: when options
  // shrink out from under the active index, this render already reads a valid
  // index instead of painting a stale one and correcting on the next pass.
  const activeIndex =
    rawActiveIndex >= options.length ? firstSelectable(options) : rawActiveIndex;

  // Stable because it only touches setState, and the outside-click effect
  // below depends on it — the other handlers are passed straight to DOM props,
  // where a stable identity buys nothing.
  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const openMenu = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex(
      (option) => optionValue(option) === selectedValue,
    );
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : firstSelectable(options),
    );
    setOpen(true);
  };

  const commit = (next: T) => {
    setSelectedValue(optionValue(next));
    onChange?.(next);
    close();
  };

  const move = (delta: 1 | -1) => {
    let next = activeIndex;
    for (let step = 0; step < options.length; step++) {
      next = (next + delta + options.length) % options.length;
      if (!optionDisabled(options[next])) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) move(1);
        else openMenu();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) move(-1);
        else openMenu();
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
  };

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
