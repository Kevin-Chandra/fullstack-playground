"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useInputSelect } from "@/src/lib/hooks/components/useInputSelect";
import InputSelectOption from "@/src/ui/components/input/InputSelectOption";

export type InputSelectProps<T> = {
  label?: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: T[];
  optionLabel: (option: T) => string;
  optionValue: (option: T) => string;
  optionDisabled: (option: T) => boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: T) => void;
  placeholder?: string;
  name?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
};

export default function InputSelect<T>({
  label,
  icon,
  hint,
  error,
  options,
  optionLabel,
  optionValue,
  optionDisabled,
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  name,
  fullWidth = false,
  disabled = false,
  required = false,
  id,
}: InputSelectProps<T>) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const listId = `${selectId}-list`;
  const labelId = label ? `${selectId}-label` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const optionId = (index: number) => `${selectId}-opt-${index}`;

  const {
    rootRef,
    open,
    activeIndex,
    selectedValue,
    selectedOption,
    setActiveIndex,
    toggle,
    commit,
    onTriggerKeyDown,
  } = useInputSelect<T>({
    options,
    optionLabel,
    optionValue,
    optionDisabled,
    value,
    defaultValue,
    onChange,
    disabled,
  });

  const stateBorder = error
    ? "border-error focus-visible:ring-3 focus-visible:ring-error/12"
    : "border-edge-strong focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-focus";

  const openBorder = error
    ? "border-error ring-3 ring-error/12"
    : "border-accent ring-3 ring-focus";

  const trigger = [
    "flex h-11.5 w-full items-center justify-between gap-2.5 rounded-md border px-4 text-left outline-none",
    "transition-[color,border-color,box-shadow] duration-150 bg-field",
    open ? openBorder : stateBorder,
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
  ].join(" ");

  return (
    <div
      ref={rootRef}
      className={`group flex min-w-0 flex-col gap-2 ${fullWidth ? "w-full" : ""}`}
    >
      {label && (
        <div className="flex items-baseline">
          <label
            id={labelId}
            className={`font-mono text-label transition-colors ${
              error ? "text-error" : "text-muted group-focus-within:text-accent"
            }`}
          >
            {label}
          </label>
          {required && <sup className="ml-0.5 text-accent">*</sup>}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={toggle}
          onKeyDown={onTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [errorId, hintId].filter(Boolean).join(" ") || undefined
          }
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          className={trigger}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span className="flex shrink-0 [&_svg]:size-4 text-muted/70">
                {icon}
              </span>
            )}
            <span
              className={`min-w-0 truncate text-input ${
                selectedOption !== undefined ? "text-ink-body" : "text-muted/60"
              }`}
            >
              {selectedOption !== undefined
                ? optionLabel(selectedOption)
                : placeholder}
            </span>
          </div>
          <MdKeyboardArrowDown
            aria-hidden
            className={`size-4 shrink-0 transition-[transform,color] duration-150 ${
              open ? "rotate-180 text-accent" : "text-muted/70"
            }`}
          />
        </button>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-full left-0 z-20 mt-0.5 w-full rounded-md border border-edge-strong bg-raised p-1.5 shadow-card"
          >
            {options.map((option, index) => {
              const isOptionDisabled = optionDisabled(option);
              return (
                <InputSelectOption
                  key={optionValue(option)}
                  id={optionId(index)}
                  label={optionLabel(option)}
                  selected={optionValue(option) === selectedValue}
                  active={index === activeIndex}
                  disabled={isOptionDisabled}
                  onSelect={() => commit(option)}
                  onHover={() => !isOptionDisabled && setActiveIndex(index)}
                />
              );
            })}
          </ul>
        )}
      </div>

      {name && <input type="hidden" name={name} value={selectedValue ?? ""} />}

      {error ? (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
