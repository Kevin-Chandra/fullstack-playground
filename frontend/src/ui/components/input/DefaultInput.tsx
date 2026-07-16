import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Tone = "default";

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
  sm: "h-10",
  md: "h-11.5",
  lg: "h-12.5",
};

type ToneStyles = {
  wrapper: string;
  border: string;
  input: string;
  leadingIcon: string;
  trailingIcon: string;
};

const tones: Record<Tone, ToneStyles> = {
  default: {
    wrapper: "bg-field",
    border: "border-edge-strong focus-within:border-accent",
    input:
      "text-ink-body placeholder:text-muted/60 not-placeholder-shown:text-ink",
    leadingIcon: "text-muted/70",
    trailingIcon: "text-muted hover:text-accent",
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

    const labelColor = error
      ? "text-error"
      : "text-muted group-focus-within:text-accent";

    const wrapper = [
      "flex items-center gap-2.5 rounded-md border px-4",
      "transition-[color,border-color,box-shadow] duration-150",
      tones[tone].wrapper,
      error
        ? "border-error/50 focus-within:border-error focus-within:ring-3 focus-within:ring-error/12"
        : `${tones[tone].border} focus-within:ring-3 focus-within:ring-focus`,
      disabled ? "cursor-not-allowed opacity-60" : "",
      sizes[inputSize],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`group flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <div className={`flex items-baseline`}>
            <label
              className={`font-mono text-label transition-colors ${labelColor}`}
            >
              {label}
            </label>
            {required && <sup className="ml-0.5 text-accent">*</sup>}
          </div>
        )}

        <div className={wrapper}>
          {leftIcon && (
            <span
              className={`flex shrink-0 [&_svg]:size-4 ${tones[tone].leadingIcon}`}
            >
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
            className={`w-full flex-1 bg-transparent text-input outline-none disabled:cursor-not-allowed ${tones[tone].input} ${className}`}
            {...rest}
          />
          {rightIcon && (
            <span
              className={`flex shrink-0 transition-colors [&_svg]:size-4 ${tones[tone].trailingIcon}`}
            >
              {rightIcon}
            </span>
          )}
        </div>

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
  },
);

export default DefaultInput;
