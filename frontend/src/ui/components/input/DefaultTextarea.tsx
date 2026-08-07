import type { ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

type Tone = "default";
type Resize = "none" | "vertical";

export type DefaultTextareaProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  tone?: Tone;
  fullWidth?: boolean;
  resize?: Resize;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

type ToneStyles = {
  wrapper: string;
  border: string;
  textarea: string;
};

const tones: Record<Tone, ToneStyles> = {
  default: {
    wrapper: "bg-field",
    border: "border-edge-strong focus-within:border-accent",
    textarea:
      "text-ink-body placeholder:text-muted/60 not-placeholder-shown:text-ink",
  },
};

const resizes: Record<Resize, string> = {
  none: "resize-none",
  vertical: "resize-y",
};

const DefaultTextarea = forwardRef<HTMLTextAreaElement, DefaultTextareaProps>(
  function DefaultTextarea(
    {
      label,
      hint,
      error,
      tone = "default",
      fullWidth = false,
      resize = "none",
      rows = 4,
      id,
      className = "",
      disabled,
      required,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const textareaId = id ?? reactId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const labelColor = error
      ? "text-error"
      : "text-muted group-focus-within:text-accent";

    const wrapper = [
      "flex rounded-md border px-4 py-3",
      "transition-[color,border-color,box-shadow] duration-150",
      tones[tone].wrapper,
      error
        ? "border-error/50 focus-within:border-error focus-within:ring-3 focus-within:ring-error/12"
        : `${tones[tone].border} focus-within:ring-3 focus-within:ring-focus`,
      disabled ? "cursor-not-allowed opacity-60" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`group flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <div className={`flex items-baseline`}>
            <label
              htmlFor={textareaId}
              className={`font-mono text-label transition-colors ${labelColor}`}
            >
              {label}
            </label>
            {required && <sup className="ml-0.5 text-accent">*</sup>}
          </div>
        )}

        <div className={wrapper}>
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full flex-1 bg-transparent text-input outline-none disabled:cursor-not-allowed ${resizes[resize]} ${tones[tone].textarea} ${className}`}
            {...rest}
          />
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

export default DefaultTextarea;
