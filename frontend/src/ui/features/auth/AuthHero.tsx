import BrandLockup from "@/src/ui/components/brand/BrandLockup";
import CarouselDots from "@/src/ui/components/feedback/CarouselDots";

type AuthHeroProps = {
  className?: string;
};

export default function AuthHero({ className = "" }: AuthHeroProps) {
  return (
    <div
      className={`relative flex-col justify-between overflow-hidden bg-linear-to-br from-brand to-raised p-10 hero:p-12 ${className}`}
    >
      {/* soft accent wash in the panel's top-left corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-accent-wash opacity-40"
      />

      <BrandLockup title="Everafter" className="relative" />

      <div className="relative my-auto py-10">
        <h2 className="font-display text-display text-ink">
          Every detail of your big day, in one place.
        </h2>
        <p className="mt-5 text-body-lg text-muted">
          Guests, vendors, budgets and timelines — planned together,
          stress-free.
        </p>
      </div>

      <CarouselDots count={3} className="relative" />
    </div>
  );
}
