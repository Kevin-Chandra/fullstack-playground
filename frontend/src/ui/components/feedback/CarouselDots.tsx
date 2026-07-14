type CarouselDotsProps = {
  count: number;
  activeIndex?: number;
  className?: string;
};

export default function CarouselDots({
  count,
  activeIndex = 0,
  className = "",
}: CarouselDotsProps) {
  return (
    <div aria-hidden className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={
            index === activeIndex
              ? "h-1 w-6 rounded-full bg-accent"
              : "h-1 w-2 rounded-full bg-edge"
          }
        />
      ))}
    </div>
  );
}
