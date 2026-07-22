import { PAGINATION_LIMIT } from "@/src/lib/constants/pagination";

const rows = "divide-y divide-edge";
const row = "flex items-center gap-lg px-xl py-lg";
const avatar = "size-11 shrink-0 animate-pulse rounded-full bg-edge-strong";
const identity = "flex-1";
const name = "h-3 w-40 animate-pulse rounded-full bg-edge-strong";
const username = "mt-sm h-2.5 w-24 animate-pulse rounded-full bg-edge-strong";
const pill = "h-6 w-16 shrink-0 animate-pulse rounded-full bg-edge-strong";

export default function UserListSkeleton() {
  return (
    <ul aria-hidden className={rows}>
      {Array.from({ length: PAGINATION_LIMIT }, (_, index) => (
        <li key={index} className={row}>
          <span className={avatar} />
          <span className={identity}>
            <span className={`block ${name}`} />
            <span className={`block ${username}`} />
          </span>
          <span className={pill} />
        </li>
      ))}
    </ul>
  );
}
