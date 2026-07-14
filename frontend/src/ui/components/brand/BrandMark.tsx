type BrandMarkProps = {
  size?: number;
  className?: string;
};

export default function BrandMark({
  size = 40,
  className = "",
}: BrandMarkProps) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, borderRadius: "30%" }}
      className={`inline-block shrink-0 bg-linear-to-br from-accent-soft to-accent shadow-mark ${className}`}
    />
  );
}
