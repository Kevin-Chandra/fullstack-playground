const content = "flex flex-1 flex-col gap-2xl";
const header = "flex items-center gap-xl";
const buttons = "flex items-center gap-xl";
const avatar = "size-20 shrink-0 animate-pulse rounded-full bg-edge-strong";
const identity = "flex flex-1 flex-col gap-md";
const nameBar = "h-5 w-56 animate-pulse rounded-full bg-edge-strong";
const badgeBar = "h-5 w-32 animate-pulse rounded-full bg-edge-strong";
const button = "h-10 w-20 animate-pulse rounded-md bg-edge-strong";
const buttonClose = "h-10 w-10 animate-pulse rounded-md bg-edge-strong";
const grid = "grid grid-cols-2 gap-lg";
const fieldBox = "h-20 animate-pulse rounded-md bg-edge-strong";

const FIELD_COUNT = 4;

export default function UserDetailsSkeleton() {
  return (
    <div aria-hidden className={content}>
      <div className={header}>
        <span className={avatar} />
        <div className={identity}>
          <span className={nameBar} />
          <span className={badgeBar} />
        </div>
        <div className={buttons}>
          <span className={button} />
          <span className={buttonClose} />
        </div>
      </div>
      <hr />
      <div className={grid}>
        {Array.from({ length: FIELD_COUNT }, (_, index) => (
          <span key={index} className={fieldBox} />
        ))}
      </div>
    </div>
  );
}
