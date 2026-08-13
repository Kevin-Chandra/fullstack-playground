import { Rsvp } from "@/src/lib/types/Rsvp";
import { formatFullDateRsvp } from "@/src/lib/utils/dateTimeFormatter";
import { MdCheckCircleOutline, MdOutlineCancel } from "react-icons/md";

const card =
  "flex w-full max-w-dialog-sm flex-col gap-lg rounded-lg border p-xl text-left";
const header = "flex items-center gap-lg";
const iconWell =
  "flex shrink-0 items-center justify-center rounded-md border p-md [&_svg]:size-5.5";
const headline = "flex min-w-0 flex-1 flex-col gap-xs";
const headlineLabel = "font-mono text-label uppercase text-muted";
const headlineValue = "truncate text-h3";
const detail = "rounded-md bg-canvas/60 px-lg py-md text-body-sm text-ink-body";
const notes = "flex flex-col gap-sm rounded-md border-l-2 bg-canvas/60 p-lg";
const notesLabel = "font-mono text-label uppercase text-muted";
const notesValue = "text-body-sm text-ink-body";
const footnote = "text-caption text-muted";

const tone = {
  attending: {
    icon: MdCheckCircleOutline,
    edge: "border-badge-active/25 bg-badge-active/10",
    well: "border-badge-active/40 bg-canvas/60 text-badge-active",
    text: "text-badge-active",
    notesEdge: "border-l-badge-active/35",
    headline: "You're coming",
  },
  declined: {
    icon: MdOutlineCancel,
    edge: "border-badge-neutral/25 bg-badge-neutral/10",
    well: "border-badge-neutral/40 bg-canvas/60 text-badge-neutral",
    text: "text-badge-neutral",
    notesEdge: "border-l-badge-neutral/35",
    headline: "You can't make it",
  },
} as const;

type GuestRsvpSummaryProps = {
  rsvp: Rsvp;
};

export default function GuestRsvpSummary({ rsvp }: GuestRsvpSummaryProps) {
  const copy = tone[rsvp.attending ? "attending" : "declined"];
  const Icon = copy.icon;
  const message = rsvp.notes?.trim();
  const repliedDate = rsvp.createdAt ? formatFullDateRsvp(rsvp.createdAt) : "";

  return (
    <div className={`${card} ${copy.edge}`}>
      <div className={header}>
        <span className={`${iconWell} ${copy.well}`}>
          <Icon />
        </span>
        <div className={headline}>
          <span className={headlineLabel}>Your RSVP</span>
          <span className={`${headlineValue} ${copy.text}`}>
            {copy.headline}
          </span>
        </div>
      </div>

      <p className={detail}>
        {rsvp.attending
          ? `${rsvp.pax} ${rsvp.pax === 1 ? "guest" : "guests"} attending`
          : "No seats held — we'll miss you."}
      </p>

      {message && (
        <div className={`${notes} ${copy.notesEdge}`}>
          <span className={notesLabel}>Your message</span>
          <span className={notesValue}>{message}</span>
        </div>
      )}

      <p className={footnote}>
        {repliedDate ? `Replied ${repliedDate}. ` : ""}
        Need to change something? Just reach out to us.
      </p>
    </div>
  );
}
