import { PAGINATION_LIMIT } from "@/src/lib/constants/pagination";

const sections = "flex flex-col gap-2xl";
const section = "flex flex-col gap-lg";
const sectionLabel = "h-3 w-24 animate-pulse rounded-full bg-edge-strong";
const rows = "flex flex-col gap-lg";
const row = "h-20 animate-pulse rounded-lg bg-edge-strong";

// Mirrors the loaded layout: a live card, then a history stack.
export default function PublicationListSkeleton() {
  return (
    <div aria-hidden className={sections}>
      <div className={section}>
        <span className={sectionLabel} />
        <div className={rows}>
          {Array.from({ length: PAGINATION_LIMIT }, (_, index) => (
            <span key={index} className={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
