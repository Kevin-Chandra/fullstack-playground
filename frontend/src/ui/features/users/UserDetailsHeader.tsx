import { User } from "@/src/lib/types/User";
import { initialsFromName } from "@/src/lib/utils/initials";
import { getUserStatusLabel } from "@/src/lib/utils/userStatusLabel";
import InitialsAvatar from "@/src/ui/components/avatar/InitialsAvatar";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { MdClose } from "react-icons/md";
import { getUserStatusBadgeVariant } from "./userStatusBadge";

const header = "flex items-center gap-xl";
const identity = "flex min-w-0 flex-1 flex-col gap-md";
const name = "truncate text-h1 text-ink";
const badges = "flex flex-wrap items-center gap-sm";
const actions = "flex shrink-0 items-center gap-sm";

type UserDetailsHeaderProps = {
  user: User;
  onClose: () => void;
  onEdit?: () => void;
};

export default function UserDetailsHeader({
  user,
  onClose,
  onEdit,
}: UserDetailsHeaderProps) {
  return (
    <div className={header}>
      <InitialsAvatar
        variant="secondary"
        initials={initialsFromName(user.name)}
        size="lg"
      />
      <div className={identity}>
        <h2 className={name}>{user.name}</h2>
        <div className={badges}>
          <DefaultBadge
            label={getUserStatusLabel(user.userStatus)}
            variant={getUserStatusBadgeVariant(user.userStatus)}
          />
        </div>
      </div>
      <div className={actions}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Edit"
          onClick={onEdit}
        />
        <DefaultButton
          variant="ghost"
          size="md"
          icon={MdClose}
          aria-label="Close details"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
