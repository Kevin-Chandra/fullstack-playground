import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { IconType } from "react-icons";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "text";
type Size = "xs" | "sm" | "md" | "lg";
type IconPosition = "left" | "right";
type TextAlignment = "start" | "center" | "end";

export type DefaultLinkButtonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  label?: string;
  textAlignment?: TextAlignment;
  icon?: IconType;
  iconPosition?: IconPosition;
  disabled?: boolean;
} & Omit<ComponentProps<typeof Link>, "children">;

const contentLayout = "inline-flex items-center gap-2";

// An anchor has no `disabled` attribute, so the inert state hangs off
// `aria-disabled` here where DefaultButton uses the `disabled:` variant.
const base = [
  `relative ${contentLayout} font-medium`,
  "transition-[color,background-color,border-color,box-shadow,filter] duration-150",
  "focus:outline-none focus-visible:ring-3 focus-visible:ring-focus",
  "aria-disabled:pointer-events-none",
].join(" ");

/* one line per state: rest / hover / disabled — mirrors DefaultButton */
const variants: Record<Variant, string> = {
  // accent CTA — gradient fill + glow; accent-ink stays legible in both schemes
  primary: [
    "bg-accent-gradient text-accent-ink shadow-glow",
    "hover:shadow-glow-strong hover:brightness-105 active:brightness-95",
    "aria-disabled:bg-none aria-disabled:bg-muted aria-disabled:text-accent-ink/50 aria-disabled:shadow-none",
  ].join(" "),
  secondary: [
    "border border-edge-strong text-ink-body",
    "hover:border-accent/50 hover:bg-accent/8 hover:text-accent-soft",
    "aria-disabled:border-edge aria-disabled:text-muted/70",
  ].join(" "),
  ghost: [
    "text-muted",
    "hover:bg-ink/6 hover:text-ink-body",
    "aria-disabled:text-muted/60",
  ].join(" "),
  text: [
    "text-accent",
    "hover:text-accent-soft",
    "aria-disabled:text-muted/60 aria-disabled:no-underline",
  ].join(" "),
  danger: [
    "border border-error/35 bg-error/8 text-error",
    "hover:border-error/60 hover:bg-error/16",
    "aria-disabled:border-error/20 aria-disabled:bg-error/5 aria-disabled:text-error/40",
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

export default function DefaultLinkButton({
  variant = "text",
  size = "md",
  fullWidth = false,
  label,
  textAlignment = "center",
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  href,
  className = "",
  ...rest
}: DefaultLinkButtonProps) {
  const iconOnly = Boolean(Icon) && !label;
  const inert = disabled;

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

  function getLinkContent(): ReactNode {
    return iconOnly ? (
      getIcon()
    ) : (
      <>
        {iconPosition === "left" ? getIcon() : null}
        <span>{label}</span>
        {iconPosition === "right" ? getIcon() : null}
      </>
    );
  }

  if (inert) {
    return (
      <a
        role="link"
        aria-disabled
        tabIndex={-1}
        className={composed}
      >
        {getLinkContent()}
      </a>
    );
  }

  return (
    <Link href={href} className={composed} {...rest}>
      {getLinkContent()}
    </Link>
  );
}
