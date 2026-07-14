import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import FieldLabel from "./FieldLabel";

type Size = "sm" | "md" | "lg";
type Tone = "default" | "brand";

export type DefaultInputProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  inputSize?: Size;
  tone?: Tone;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

const sizes: Record<Size, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-[15px]",
  lg: "h-12 text-[15px]",
};

const tones: Record<
  Tone,
  { wrapper: string; state: string; input: string; icon: string }
> = {
  default: {
    wrapper: "bg-white dark:bg-white/[0.03]",
    state:
      "border-slate-200 focus-within:border-accent focus-within:ring-3 focus-within:ring-focus dark:border-white/10 dark:focus-within:border-accent",
    input:
      "text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500",
    icon: "text-slate-400",
  },
  brand: {
    wrapper: "bg-field",
    state:
      "border-edge-strong focus-within:border-accent/60 focus-within:ring-3 focus-within:ring-focus",
    input: "text-ink placeholder:text-muted/60",
    icon: "text-muted",
  },
};

const DefaultInput = forwardRef<HTMLInputElement, DefaultInputProps>(
  function DefaultInput(
    {
      label,
      hint,
      error,
      inputSize = "md",
      tone = "default",
      fullWidth = false,
      leftIcon,
      rightIcon,
      id,
      className = "",
      disabled,
      required,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const wrapperBase = `flex items-center gap-2.5 rounded-md border px-3.5 transition-[color,border-color,box-shadow] duration-150 ${tones[tone].wrapper}`;
    const wrapperState = error
      ? "border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/12 dark:border-red-500/60"
      : tones[tone].state;
    const wrapperDisabled = disabled ? "opacity-60 cursor-not-allowed" : "";

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <FieldLabel>
            {label}
            {required && <sup className="ml-0.5 text-accent">*</sup>}
          </FieldLabel>
        )}

        <div
          className={[
            wrapperBase,
            wrapperState,
            wrapperDisabled,
            sizes[inputSize],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {leftIcon && (
            <span className={`flex shrink-0 ${tones[tone].icon}`}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full flex-1 bg-transparent outline-none disabled:cursor-not-allowed ${tones[tone].input} ${className}`}
            {...rest}
          />
          {rightIcon && (
            <span className={`flex shrink-0 ${tones[tone].icon}`}>
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p
            id={errorId}
            className="text-[12px] text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={hintId}
            className="text-[12px] text-slate-500 dark:text-slate-400"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export default DefaultInput;
