import { GuestStatus } from "@/src/lib/types/enum/GuestStatus.enum";
import { Guest } from "@/src/lib/types/Guest";
import { formatFullDateRsvp } from "@/src/lib/utils/dateTimeFormatter";
import { getGuestStatus } from "@/src/lib/utils/guestStatus";
import { IconType } from "react-icons";
import { MdCheck, MdClose, MdGroup, MdSchedule } from "react-icons/md";
import { getGuestRsvpCopy } from "../../utils/guestUi.util";

const card = "flex flex-col gap-lg rounded-lg border p-xl";
const header = "flex items-center gap-lg";
const iconWell =
  "flex shrink-0 p-md items-center justify-center rounded-md border";
const headline = "flex min-w-0 flex-grow flex-col gap-xs";
const headlineLabel = "truncate font-mono text-label uppercase text-muted";
const headlineValue = "truncate text-h2";
const headerMeta = "shrink min-w-0 self-center text-wrap text-caption text-muted";
const attendance = "flex items-center gap-sm rounded-md px-lg py-md";
const attendanceIcon = "shrink-0 text-muted";
const attendanceCount = "font-display text-h4 text-ink";
const attendanceText = "text-body text-muted";
const notes = "flex flex-col gap-sm rounded-md border-l-2 p-lg";
const notesLabel = "font-mono text-label uppercase text-muted";
const notesValue = "text-body text-ink-body";
const notesValueEmpty = "text-body italic text-muted";
const innerTint = "bg-canvas/60";

const statusIcons: Record<GuestStatus, IconType> = {
  [GuestStatus.PENDING]: MdSchedule,
  [GuestStatus.CONFIRMED]: MdCheck,
  [GuestStatus.DECLINED]: MdClose,
};

const statusText: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "text-badge-warning",
  [GuestStatus.CONFIRMED]: "text-badge-active",
  [GuestStatus.DECLINED]: "text-badge-danger",
};

const statusTint: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "bg-badge-warning/10",
  [GuestStatus.CONFIRMED]: "bg-badge-active/10",
  [GuestStatus.DECLINED]: "bg-badge-danger/10",
};

const statusEdge: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "border-badge-warning/25",
  [GuestStatus.CONFIRMED]: "border-badge-active/25",
  [GuestStatus.DECLINED]: "border-badge-danger/25",
};

const statusWell: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "border-badge-warning/40 text-badge-warning",
  [GuestStatus.CONFIRMED]: "border-badge-active/40 text-badge-active",
  [GuestStatus.DECLINED]: "border-badge-danger/40 text-badge-danger",
};

const statusNotesEdge: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "border-l-badge-warning/35",
  [GuestStatus.CONFIRMED]: "border-l-badge-active/35",
  [GuestStatus.DECLINED]: "border-l-badge-danger/35",
};

type GuestRsvpCardProps = {
  guest: Guest;
};

export default function GuestRsvpCard({ guest }: GuestRsvpCardProps) {
  const status = getGuestStatus(guest);
  const copy = getGuestRsvpCopy(status);
  const StatusIcon = statusIcons[status];

  const attendingPax = guest.rsvp?.pax ?? 0;
  const guestNotes = guest.rsvp?.notes?.trim();
  const repliedDate = guest.rsvp?.createdAt;
  const repliedDateString = repliedDate ? formatFullDateRsvp(repliedDate) : "";

  return (
    <div className={`${card} ${statusEdge[status]} ${statusTint[status]}`}>
      <div className={header}>
        <span className={`${iconWell} ${statusWell[status]} ${innerTint}`}>
          <StatusIcon size={22} />
        </span>
        <div className={headline}>
          <span className={headlineLabel}>RSVP</span>
          <span className={`${headlineValue} ${statusText[status]}`}>
            {copy.headline}
          </span>
        </div>
        <span className={headerMeta}>{`${copy.meta}${repliedDateString}`}</span>
      </div>

      <div className={`${attendance} ${innerTint}`}>
        <MdGroup size={20} className={attendanceIcon} />
        <span className={attendanceCount}>
          {attendingPax} of {guest.pax}
        </span>
        <span className={attendanceText}>
          {`guests attending ${copy.attendanceNote}`.trimEnd()}
        </span>
      </div>

      <div className={`${notes} ${statusNotesEdge[status]} ${innerTint}`}>
        <span className={notesLabel}>Message from guest</span>
        <span className={guestNotes ? notesValue : notesValueEmpty}>
          {guestNotes || copy.emptyNotes}
        </span>
      </div>
    </div>
  );
}
