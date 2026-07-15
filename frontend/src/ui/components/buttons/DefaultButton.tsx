import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type IconPosition = "left" | "right";

export type DefaultButtonProps = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  /** Beside children when present; alone (no children) the button collapses
   *  to a square icon button — pass an aria-label in that case. */
  icon?: ReactNode;
  iconPosition?: IconPosition;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base = [
  "inline-flex items-center justify-center gap-2 font-medium",
  "transition-[color,background-color,border-color,box-shadow,filter] duration-150",
  "focus:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "disabled:pointer-events-none",
].join(" ");

/* one line per state: rest / hover / disabled */
const variants: Record<Variant, string> = {
  // accent CTA — gradient fill + glow; accent-ink stays legible in both schemes
  primary: [
    "bg-linear-145 from-accent-soft to-accent-strong text-accent-ink shadow-glow",
    "hover:shadow-glow-strong hover:brightness-105 active:brightness-95",
    "disabled:from-muted disabled:to-muted disabled:text-accent-ink/50 disabled:shadow-none",
  ].join(" "),
  secondary: [
    "border border-edge-strong text-ink-body",
    "hover:border-accent/50 hover:bg-accent/8 hover:text-accent-soft",
    "disabled:border-edge disabled:text-muted/70",
  ].join(" "),
  ghost: [
    "text-muted",
    "hover:bg-ink/6 hover:text-ink-body",
    "disabled:text-muted/60",
  ].join(" "),
  danger: [
    "border border-error/35 bg-error/8 text-error",
    "hover:border-error/60 hover:bg-error/16",
    "disabled:border-error/20 disabled:bg-error/5 disabled:text-error/40",
  ].join(" "),
};

/* height / radius / padding / type step per size */
const sizes: Record<Size, string> = {
  sm: "h-8.5 rounded-btn-sm px-3.5 text-caption",
  md: "h-10.5 rounded-btn-md px-5 text-body-sm",
  lg: "h-12.5 rounded-btn-lg px-7 text-body",
};

/* icon-only buttons collapse to a square and size the glyph per step */
const iconOnlySizes: Record<Size, string> = {
  sm: "size-8.5 rounded-btn-sm [&_svg]:size-4",
  md: "size-10.5 rounded-btn-md [&_svg]:size-4.5",
  lg: "size-12.5 rounded-btn-lg [&_svg]:size-5",
};

export default function DefaultButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  disabled,
  type = "button",
  className = "",
  ...rest
}: DefaultButtonProps) {
  const iconOnly = Boolean(icon) && !children;

  const composed = [
    base,
    variants[variant],
    iconOnly ? iconOnlySizes[size] : sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function getButtonContent(): ReactNode {
    if (loading) return <Spinner />;
    if (iconOnly) return icon;
    return (
      <>
        {iconPosition === "left" ? icon : null}
        {children}
        {iconPosition === "right" ? icon : null}
      </>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={composed}
      {...rest}
    >
      {getButtonContent()}
    </button>
  );
}

const Spinner = () => (
  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
);
