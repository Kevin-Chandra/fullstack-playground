import BrandMark from "@/src/ui/components/brand/BrandMark";

type BrandLockupProps = {
  title: string;
  markSize?: number;
  className?: string;
};

export default function BrandLockup({
  title,
  markSize = 40,
  className = "",
}: BrandLockupProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandMark size={markSize} />
      <span className="font-display text-h4 text-ink">
        {title}
      </span>
    </div>
  );
}
