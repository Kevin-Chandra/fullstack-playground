type Variant = "primary" | "secondary";

type InitialsBadgeProps = {
  initials: string;
  size?: number;
  variant?: Variant;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full font-sans text-h4 uppercase";

const variants: Record<Variant, string> = {
  primary: "border border-accent bg-brand text-accent",
  secondary: "bg-accent-gradient text-accent-ink",
};

export default function InitialsBadge({
  initials,
  size = 40,
  variant = "primary",
  className = "",
}: InitialsBadgeProps) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {initials}
    </span>
  );
}
