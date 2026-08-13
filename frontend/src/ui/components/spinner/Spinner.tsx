type SpinnerSize = "sm" | "md" | "lg";

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
};

const spinner = "animate-spin rounded-full border-current border-t-transparent";

type SpinnerProps = {
  size?: SpinnerSize;
  ariaLabel?: string;
  className?: string;
};

export default function Spinner({
  size = "md",
  ariaLabel: arialabel = "Loading",
  className = "",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={arialabel}
      className={`${spinner} ${spinnerSizes[size]} ${className}`}
    />
  );
}
