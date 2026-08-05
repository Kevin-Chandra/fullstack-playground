import { GuestListItem } from "@/src/lib/types/Guest";
import { initialsFromName } from "@/src/lib/utils/initials";
import InitialsAvatar from "@/src/ui/components/avatar/InitialsAvatar";
import DefaultBadge from "../../components/badge/DefaultBadge";
import { getGuestStatusBadgeVariant, getGuestStatusLabel } from "../../utils/guestUi.util";

const row =
  "flex w-full items-center gap-lg px-xl py-lg text-left transition-colors duration-150";
const rowState = {
  default: "hover:bg-ink/4",
  selected: "bg-accent/8",
};
const identity = "min-w-0 flex-1";
const name = "block truncate text-h5 text-ink";
const username = "block truncate text-caption text-muted";

type GuestListRowProps = {
  guest: GuestListItem;
  selected?: boolean;
  onSelect: () => void;
};

export default function GuestListRow({
  guest,
  selected = false,
  onSelect,
}: GuestListRowProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`${row} ${selected ? rowState.selected : rowState.default}`}
      >
        <InitialsAvatar
          variant="secondary"
          initials={initialsFromName(guest.name)}
          size="sm"
        />
        <span className={identity}>
          <span className={name}>{guest.name}</span>
          <span className={username}>{`${guest.pax} guest`}</span>
        </span>
        <DefaultBadge
          label={getGuestStatusLabel(guest.guestStatus)}
          variant={getGuestStatusBadgeVariant(guest.guestStatus)}
        />
      </button>
    </li>
  );
}
