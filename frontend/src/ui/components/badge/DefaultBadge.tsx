import { IconType } from "react-icons";

export type BadgeVariant = "active" | "warning" | "neutral" | "danger";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeIconPosition = "start" | "end"

type DefaultBadgeProps = {
  icon?: IconType
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconPosition?: BadgeIconPosition;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full font-sans";

const variants: Record<BadgeVariant, string> = {
  active: "text-badge-active bg-badge-active-bg",
  warning: "text-badge-warning bg-badge-warning-bg",
  neutral: "text-badge-neutral bg-badge-neutral-bg",
  danger: "text-badge-danger bg-badge-danger-bg",
};

const sizes: Record<BadgeSize, string> = {
  sm: "gap-2 px-2.5 py-1 text-badge [&_svg]:size-4",
  md: "gap-2 px-3 py-1.5 text-caption [&_svg]:size-4.5",
  lg: "gap-2.5 px-3.5 py-2 text-body-sm [&_svg]:size-5",
};

export default function DefaultBadge({
  icon: Icon,
  label,
  variant = "neutral",
  size = "sm",
  iconPosition = "start",
  className = "",
}: DefaultBadgeProps) {

  const icon = Icon ? <Icon /> : null;

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {iconPosition === "start" && icon}
      {label}
      {iconPosition === "end" && icon}
    </span>
  );
}
