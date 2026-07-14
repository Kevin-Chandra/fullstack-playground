import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
type Size = 'sm' | 'md' | 'lg';

export type DefaultButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[color,background-color,border-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-3 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  secondary:
    'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.07]',
  ghost:
    'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  // Brand CTA (auth screens): accent gradient with the token glow; text uses
  // the canvas color so it stays inverse to the accent in both schemes.
  brand:
    'bg-linear-to-b from-accent-soft to-accent font-semibold text-canvas shadow-glow hover:brightness-105 active:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-[15px]',
};

export default function DefaultButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: DefaultButtonProps) {
  const composed = [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={composed}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
