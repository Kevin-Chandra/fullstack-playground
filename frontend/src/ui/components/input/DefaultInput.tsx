import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Size = 'sm' | 'md' | 'lg';

export type DefaultInputProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  inputSize?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

const sizes: Record<Size, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-base',
};

const DefaultInput = forwardRef<HTMLInputElement, DefaultInputProps>(function DefaultInput(
  {
    label,
    hint,
    error,
    inputSize = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    id,
    className = '',
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
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const wrapperBase =
    'flex items-center gap-2 rounded-md border bg-white px-3 transition-colors dark:bg-zinc-900';
  const wrapperState = error
    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30'
    : 'border-black/10 focus-within:border-black/30 focus-within:ring-2 focus-within:ring-zinc-500/30 dark:border-white/15 dark:focus-within:border-white/40';
  const wrapperDisabled = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-black dark:text-zinc-100"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div
        className={[wrapperBase, wrapperState, wrapperDisabled, sizes[inputSize]]
          .filter(Boolean)
          .join(' ')}
      >
        {leftIcon && <span className="flex shrink-0 text-zinc-500">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`flex-1 bg-transparent outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed text-black dark:text-zinc-100 ${className}`}
          {...rest}
        />
        {rightIcon && <span className="flex shrink-0 text-zinc-500">{rightIcon}</span>}
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default DefaultInput;
