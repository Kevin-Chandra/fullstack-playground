export type BadgeVariant = "active" | "warning" | "neutral" | "danger";

type DefaultBadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 font-sans text-badge";

const variants: Record<BadgeVariant, string> = {
  active: "text-badge-active bg-badge-active-bg",
  warning: "text-badge-warning bg-badge-warning-bg",
  neutral: "text-badge-neutral bg-badge-neutral-bg",
  danger: "text-badge-danger bg-badge-danger-bg",
};

export default function DefaultBadge({
  label,
  variant = "neutral",
  className = "",
}: DefaultBadgeProps) {
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>{label}</span>
  );
}
