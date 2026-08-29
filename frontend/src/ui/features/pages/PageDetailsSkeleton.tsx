const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const header = "flex items-center gap-xl";
const iconWell = "size-15 shrink-0 animate-pulse rounded-lg bg-edge-strong";
const identity = "flex min-w-0 flex-1 flex-col gap-md";
const nameBar = "h-8 w-56 animate-pulse rounded-full bg-edge-strong";
const badgeBar = "h-5 w-24 animate-pulse rounded-full bg-edge-strong";
const actions = "flex shrink-0 items-center gap-sm";
const buttonClose = "size-10.5 animate-pulse rounded-btn-md bg-edge-strong";
const divider = "border-t border-edge";
const grid = "grid grid-cols-2 gap-lg";
const fieldBox = "h-20 animate-pulse rounded-lg bg-edge-strong";
const fieldBoxWide = `${fieldBox} col-span-2`;
const linkButton = "h-14 animate-pulse rounded-btn-lg bg-edge-strong";

export default function PageDetailsSkeleton() {
  return (
    <div aria-hidden className={content}>
      <div className={header}>
        <span className={iconWell} />
        <div className={identity}>
          <span className={nameBar} />
          <span className={badgeBar} />
        </div>
        <div className={actions}>
          <span className={buttonClose} />
        </div>
      </div>
      <div className={divider} />

      {/* Mirrors the published layout: two fields, then one spanning both. */}
      <div className={grid}>
        <span className={fieldBox} />
        <span className={fieldBox} />
        <span className={fieldBoxWide} />
      </div>
      <div className={divider} />

      <span className={linkButton} />
      <span className={linkButton} />
    </div>
  );
}
