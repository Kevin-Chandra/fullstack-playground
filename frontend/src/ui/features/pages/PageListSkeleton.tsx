import { PAGINATION_LIMIT } from "@/src/lib/constants/pagination";

const rows = "divide-y divide-edge";
const row = "flex items-center gap-lg px-xl py-lg";
const iconWell =
  "size-10.5 shrink-0 animate-pulse rounded-btn-sm bg-edge-strong";
const identity = "min-w-0 flex-1";
const name = "block h-3.5 w-40 animate-pulse rounded-full bg-edge-strong";
const badge = "mt-sm block h-6 w-28 animate-pulse rounded-full bg-edge-strong";

export default function PageListSkeleton() {
  return (
    <ul aria-hidden className={rows}>
      {Array.from({ length: PAGINATION_LIMIT }, (_, index) => (
        <li key={index} className={row}>
          <span className={iconWell} />
          <span className={identity}>
            <span className={name} />
            <span className={badge} />
          </span>
        </li>
      ))}
    </ul>
  );
}
