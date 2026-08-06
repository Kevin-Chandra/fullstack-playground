import { Guest } from "@/src/lib/types/Guest";
import { getGuestStatus } from "@/src/lib/utils/guestStatus";
import { initialsFromName } from "@/src/lib/utils/initials";
import InitialsAvatar from "@/src/ui/components/avatar/InitialsAvatar";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { MdClose, MdGroup } from "react-icons/md";
import { getGuestStatusBadgeVariant, getGuestStatusLabel } from "../../utils/guestUi.util";

const header = "flex items-center gap-xl";
const identity = "flex min-w-0 flex-1 flex-col gap-md";
const name = "truncate text-h1 text-ink";
const badges = "flex flex-wrap items-center gap-sm";
const actions = "flex shrink-0 items-center gap-sm";

type GuestDetailsHeaderProps = {
  guest: Guest;
  onClose: () => void;
  onEdit?: () => void;
};

export default function GuestDetailsHeader({
  guest,
  onClose,
  onEdit,
}: GuestDetailsHeaderProps) {

  const guestStatus = getGuestStatus(guest);

  return (
    <div className={header}>
      <InitialsAvatar
        variant="secondary"
        initials={initialsFromName(guest.name)}
        size="lg"
      />
      <div className={identity}>
        <h2 className={name}>{guest.name}</h2>
        <div className={badges}>
          <DefaultBadge
            label={getGuestStatusLabel(guestStatus)}
            variant={getGuestStatusBadgeVariant(guestStatus)}
          />
          <DefaultBadge
            icon={MdGroup}
            label={`${guest.pax} guests`}
            variant="neutral"
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
          icon={<MdClose />}
          aria-label="Close details"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
