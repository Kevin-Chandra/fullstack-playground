import { IconType } from "react-icons";

export type BadgeVariant = "active" | "warning" | "neutral" | "danger";
export type BadgeIconPosition = "start" | "end"

type DefaultBadgeProps = {
  icon?: IconType
  label: string;
  variant?: BadgeVariant;
  iconPosition?: BadgeIconPosition;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-2.5 py-1 font-sans text-badge";

const variants: Record<BadgeVariant, string> = {
  active: "text-badge-active bg-badge-active-bg",
  warning: "text-badge-warning bg-badge-warning-bg",
  neutral: "text-badge-neutral bg-badge-neutral-bg",
  danger: "text-badge-danger bg-badge-danger-bg",
};

export default function DefaultBadge({
  icon: Icon,
  label,
  variant = "neutral",
  iconPosition = "start",
  className = "",
}: DefaultBadgeProps) {

  const icon = Icon ? <Icon size={16} /> : null;

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {iconPosition === "start" && icon}
      {label}
      {iconPosition === "end" && icon}
    </span>
  );
}
