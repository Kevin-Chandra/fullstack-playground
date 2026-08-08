import { QueryParams } from "@/src/lib/constants/queryParams";
import { Routes } from "@/src/lib/constants/routes";
import { Guest } from "@/src/lib/types/Guest";
import { MdCopyAll, MdOpenInNew } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";
import DefaultLinkButton from "../../components/buttons/DefaultLinkButton";
import InfoField from "../../components/card/InfoField";
import { toast } from "../../components/toast/toast";
import clipboardCopy from "../../utils/clipboard.util";
import { getGuestInvitationTypeLabel } from "../../utils/guestUi.util";
import GuestDetailsHeader from "./GuestDetailsHeader";
import GuestRsvpCard from "./GuestRsvpCard";

const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const divider = "border-t border-edge";
const scrollArea = "flex min-h-0 flex-1 flex-col overflow-y-auto";
const infoFields = "flex flex-col gap-lg";
const fieldTwoColumn = "flex gap-lg";
const footerContainer = "flex py-2xl flex-col gap-lg";

type GuestDetailsContentProps = {
  guest: Guest;
  onDelete: () => void;
  onClose: () => void;
  onEdit: () => void;
};

export default function GuestDetailsContent({
  guest,
  onDelete,
  onClose,
  onEdit,
}: GuestDetailsContentProps) {

  async function handleOnCopyUuid() {
    const result = await clipboardCopy(guest.guestUuid)
    if (result.success) {
      toast.success("Guest UUID copied to clipboard")
    } else {
      toast.error("Unable to copy Guest UUID")
    }
  }

  return (
    <div className={content}>
      <GuestDetailsHeader guest={guest} onClose={onClose} onEdit={onEdit} />
      <div className={divider} />
      <div className={scrollArea}>
        <div className={infoFields}>
          <div className={fieldTwoColumn}>
            <InfoField label="Email" value={guest.email} placeholderText="Not provided" />
            <InfoField label="Phone Number" value={guest.phoneNumber} placeholderText="Not provided" />
          </div>
          <div className={fieldTwoColumn}>
            <InfoField label="Party Size" value={guest.pax.toString()} />
            <InfoField label="Invitation Type" value={getGuestInvitationTypeLabel(guest.invitationType)} />
          </div>
          <InfoField label="Notes" value={guest.notes} placeholderText="No notes yet" />
          <InfoField label="Guest UUID" value={guest.guestUuid}>
            <DefaultLinkButton
              label="Guest preview"
              href={Routes.HOME + `/?${QueryParams.GUEST_UUID}=${guest.guestUuid}`}
              icon={MdOpenInNew}
              iconPosition="right"
              target="_blank"
              rel="noopener noreferrer"
            />
            <DefaultButton
              icon={MdCopyAll}
              label="Copy"
              variant="secondary"
              onClick={() => void handleOnCopyUuid()}
            />
          </InfoField>
          <GuestRsvpCard guest={guest} />
        </div>
        <div className={footerContainer}>
          <hr />
          <DefaultButton
            className="self-end"
            variant="ghost"
            label="Remove Guest"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
}