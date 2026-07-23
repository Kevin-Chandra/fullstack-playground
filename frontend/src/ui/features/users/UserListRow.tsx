import { User } from "@/src/lib/types/User";
import { initialsFromName } from "@/src/lib/utils/initials";
import { getUserStatusLabel } from "@/src/lib/utils/userStatusLabel";
import InitialsAvatar from "@/src/ui/components/avatar/InitialsAvatar";
import DefaultBadge from "../../components/badge/DefaultBadge";
import { getUserStatusBadgeVariant } from "./userStatusBadge";

const row =
  "flex w-full items-center gap-lg px-xl py-lg text-left transition-colors duration-150";
const rowState = {
  default: "hover:bg-ink/4",
  selected: "bg-accent/8",
};
const identity = "min-w-0 flex-1";
const name = "block truncate text-h5 text-ink";
const username = "block truncate text-caption text-muted";

type UserListRowProps = {
  user: User;
  selected?: boolean;
  onSelect?: (user: User) => void;
};

export default function UserListRow({
  user,
  selected = false,
  onSelect,
}: UserListRowProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect?.(user)}
        className={`${row} ${selected ? rowState.selected : rowState.default}`}
      >
        <InitialsAvatar
          variant="secondary"
          initials={initialsFromName(user.name)}
          size="sm"
        />
        <span className={identity}>
          <span className={name}>{user.name}</span>
          <span className={username}>{user.username}</span>
        </span>
        <DefaultBadge
          label={getUserStatusLabel(user.userStatus)}
          variant={getUserStatusBadgeVariant(user.userStatus)}
        />
      </button>
    </li>
  );
}
