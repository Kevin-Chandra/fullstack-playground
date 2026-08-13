import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconType } from "react-icons";
import Spinner from "../spinner/Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "text";
type Size = "xs" | "sm" | "md" | "lg";
type IconPosition = "left" | "right";
type TextAlignment = "start" | "center" | "end";

export type DefaultButtonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  label?: string;
  textAlignment?: TextAlignment;
  icon?: IconType;
  iconPosition?: IconPosition;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const contentLayout = "inline-flex items-center gap-2";

const base = [
  `relative ${contentLayout} font-medium`,
  "transition-[color,background-color,border-color,box-shadow,filter] duration-150",
  "focus:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "disabled:pointer-events-none",
].join(" ");

/* one line per state: rest / hover / disabled */
const variants: Record<Variant, string> = {
  // accent CTA — gradient fill + glow; accent-ink stays legible in both schemes
  primary: [
    "bg-accent-strong bg-accent-gradient text-accent-ink shadow-glow",
    "hover:shadow-glow-strong hover:brightness-105 active:brightness-95",
    "disabled:bg-none disabled:bg-muted disabled:text-accent-ink/50 disabled:shadow-none",
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
  text: [
    "text-accent",
    "hover:text-accent-soft",
    "disabled:text-muted/60 disabled:no-underline",
  ].join(" "),
  danger: [
    "border border-error/35 bg-error/8 text-error",
    "hover:border-error/60 hover:bg-error/16",
    "disabled:border-error/20 disabled:bg-error/5 disabled:text-error/40",
  ].join(" "),
};

const sizes: Record<Size, string> = {
  xs: "rounded-btn-sm text-xs [&_svg]:size-3.5",
  sm: "rounded-btn-sm text-xs [&_svg]:size-4",
  md: "rounded-btn-md text-body-sm [&_svg]:size-4.5",
  lg: "rounded-btn-lg text-body [&_svg]:size-5",
};

const spinnerSizes: Record<Size, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

const paddingSize: Record<Size, string> = {
  xs: "px-2.5 py-1.5",
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

const iconPadding: Record<Size, string> = {
  xs: "p-1.5",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
};

const alignments: Record<TextAlignment, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

export default function DefaultButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  label,
  textAlignment = "center",
  icon: Icon,
  iconPosition = "left",
  disabled,
  type = "button",
  className = "",
  ...rest
}: DefaultButtonProps) {
  const iconOnly = Boolean(Icon) && !label;

  const composed = [
    base,
    variants[variant],
    sizes[size],
    iconOnly ? iconPadding[size] : paddingSize[size], //padding
    iconOnly ? "justify-center" : alignments[textAlignment],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function getIcon(): ReactNode {
    if (Icon) {
      return <Icon />
    } else {
      return null
    }
  }

  function getButtonContent(): ReactNode {
    const content = iconOnly ? (
      getIcon()
    ) : (
      <>
        {iconPosition === "left" ? getIcon() : null}
        <span>{label}</span>
        {iconPosition === "right" ? getIcon() : null}
      </>
    );
    return (
      <>
        <span className={`${contentLayout} ${loading ? "invisible" : ""}`}>
          {content}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" />
          </span>
        )}
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
