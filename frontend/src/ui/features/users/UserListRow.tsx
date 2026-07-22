import InitialsBadge from "@/src/ui/components/avatar/InitialsBadge";
import { User, UserStatus } from "@/src/lib/types/User";
import { initialsFromName } from "@/src/lib/utils/initials";
import { getUserStatusLabel } from "@/src/lib/utils/userStatusLabel";
import DefaultBadge, {
  BadgeVariant,
} from "../../components/badge/DefaultBadge";

const row = "flex items-center gap-lg px-xl py-lg";
const identity = "min-w-0 flex-1";
const name = "truncate text-h5 text-ink";
const username = "truncate text-caption text-muted";

type UserListRowProps = {
  user: User;
};

export default function UserListRow({ user }: UserListRowProps) {
  function getUserBadgeVariant(userStatus: UserStatus): BadgeVariant {
    switch (userStatus) {
      case UserStatus.ACTIVE:
        return "active";
      case UserStatus.INACTIVE:
        return "danger";
      default:
        return "neutral";
    }
  }

  return (
    <li className={row}>
      <InitialsBadge
        variant="secondary"
        initials={initialsFromName(user.name)}
        size={40}
      />
      <div className={identity}>
        <p className={name}>{user.name}</p>
        <p className={username}>{user.username}</p>
      </div>
      <DefaultBadge
        label={getUserStatusLabel(user.userStatus)}
        variant={getUserBadgeVariant(user.userStatus)}
      />
    </li>
  );
}
