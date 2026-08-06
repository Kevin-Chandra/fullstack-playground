const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const divider = "border-t border-edge";
const scrollArea = "flex min-h-0 flex-1 flex-col overflow-y-auto";
const infoFields = "flex flex-col gap-lg";
const fieldTwoColumn = "flex gap-lg";
const footerContainer = "flex py-2xl flex-col gap-lg";

const bar = "animate-pulse rounded-full bg-edge-strong";
const block = "animate-pulse rounded-md bg-edge-strong";

const header = "flex items-center gap-xl";
const avatar = "size-[72px] shrink-0 animate-pulse rounded-full bg-edge-strong";
const identity = "flex min-w-0 flex-1 flex-col gap-md";
const name = `h-6 w-56 ${bar}`;
const badges = "flex items-center gap-sm";
const badge = `h-5 w-24 ${bar}`;
const badgeShort = `h-5 w-20 ${bar}`;
const actions = "flex shrink-0 items-center gap-sm";
const buttonEdit = `h-10 w-16 ${block}`;
const buttonClose = `size-10 ${block}`;

const fieldBox =
  "flex min-w-0 flex-1 flex-col gap-sm rounded-lg border border-edge bg-canvas p-xl";
const fieldLabel = `h-3 w-24 ${bar}`;
const fieldValue = `h-4 w-40 ${bar}`;

const card = "flex flex-col gap-lg rounded-lg border border-edge p-xl";
const cardHeader = "flex items-center gap-lg";
const cardIconWell = `size-11 shrink-0 ${block}`;
const cardHeadline = "flex min-w-0 flex-grow flex-col gap-xs";
const cardHeadlineLabel = `h-3 w-16 ${bar}`;
const cardHeadlineValue = `h-5 w-48 ${bar}`;
const cardMeta = `h-3 w-28 shrink-0 ${bar}`;
const cardRow = `h-12 ${block}`;
const cardNotes = "flex flex-col gap-sm rounded-md border-l-2 border-edge p-lg";
const cardNotesLabel = `h-3 w-36 ${bar}`;
const cardNotesValue = `h-4 w-2/3 ${bar}`;

const footerButton = `h-10 w-32 self-end ${block}`;

export default function GuestDetailsSkeleton() {
  return (
    <div aria-hidden className={content}>
      <div className={header}>
        <span className={avatar} />
        <div className={identity}>
          <span className={name} />
          <div className={badges}>
            <span className={badge} />
            <span className={badgeShort} />
          </div>
        </div>
        <div className={actions}>
          <span className={buttonEdit} />
          <span className={buttonClose} />
        </div>
      </div>
      <div className={divider} />
      <div className={scrollArea}>
        <div className={infoFields}>
          <div className={fieldTwoColumn}>
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className={fieldTwoColumn}>
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton />
          <FieldSkeleton />
          <div className={card}>
            <div className={cardHeader}>
              <span className={cardIconWell} />
              <div className={cardHeadline}>
                <span className={cardHeadlineLabel} />
                <span className={cardHeadlineValue} />
              </div>
              <span className={cardMeta} />
            </div>
            <span className={cardRow} />
            <div className={cardNotes}>
              <span className={cardNotesLabel} />
              <span className={cardNotesValue} />
            </div>
          </div>
        </div>
        <div className={footerContainer}>
          <hr />
          <span className={footerButton} />
        </div>
      </div>
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className={fieldBox}>
      <span className={fieldLabel} />
      <span className={fieldValue} />
    </div>
  );
}
