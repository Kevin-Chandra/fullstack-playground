import { IconType } from "react-icons";

export type IconWellTone = "active" | "warning" | "neutral" | "danger";
export type IconWellSize = "xs" | "sm" | "md" | "lg" | "xl";

const iconWell = "flex shrink-0 items-center justify-center";
const iconWellBordered = "border";

const tones: Record<IconWellTone, string> = {
  active: "border-badge-active/25 bg-badge-active/10 text-badge-active",
  warning: "border-badge-warning/25 bg-badge-warning/10 text-badge-warning",
  neutral: "border-badge-neutral/25 bg-badge-neutral/10 text-badge-neutral",
  danger: "border-badge-danger/25 bg-badge-danger/10 text-badge-danger",
};

const sizes: Record<IconWellSize, string> = {
  xs: "size-6 rounded-sm [&_svg]:size-3.5",
  sm: "size-8 rounded-btn-sm [&_svg]:size-4",
  md: "size-10.5 rounded-btn-sm [&_svg]:size-5",
  lg: "size-15 rounded-btn-lg [&_svg]:size-7",
  xl: "size-20 rounded-lg [&_svg]:size-9",
};

export type IconWellProps = {
  icon: IconType;
  tone?: IconWellTone;
  size?: IconWellSize;
  bordered?: boolean;
  className?: string;
};

export default function IconWell({
  icon: Icon,
  tone = "neutral",
  size = "md",
  bordered = true,
  className = "",
}: IconWellProps) {
  return (
    <span
      aria-hidden
      className={`${iconWell} ${bordered ? iconWellBordered : ""} ${sizes[size]} ${tones[tone]} ${className}`}
    >
      <Icon />
    </span>
  );
}
