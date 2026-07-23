type Variant = "primary" | "secondary";
type AvatarSize = "sm" | "md" | "lg";

type InitialsAvatarProps = {
  initials: string;
  size?: AvatarSize;
  variant?: Variant;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full font-sans text-h4 uppercase";

const variants: Record<Variant, string> = {
  primary: "border border-accent bg-brand text-accent",
  secondary: "bg-accent-gradient text-accent-ink",
};

const sizes: Record<AvatarSize, string> = {
  sm: "w-[40px] h-[40px] text-xs",
  md: "w-[56px] h-[56px] text-base",
  lg: "w-[72px] h-[72px] text-2xl",
};

export default function InitialsAvatar({
  initials,
  size = "md",
  variant = "primary",
  className = "",
}: InitialsAvatarProps) {
  return (
    <span
      aria-hidden
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {initials}
    </span>
  );
}
