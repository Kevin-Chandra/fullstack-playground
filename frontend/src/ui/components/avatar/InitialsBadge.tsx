type InitialsBadgeProps = {
  initials: string;
  size?: number;
  className?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-accent bg-brand font-sans text-h4 uppercase text-accent";

export default function InitialsBadge({
  initials,
  size = 40,
  className = "",
}: InitialsBadgeProps) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`${base} ${className}`}
    >
      {initials}
    </span>
  );
}
