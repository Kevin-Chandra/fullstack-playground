import { QueryParams } from "@/src/lib/constants/queryParams";
import { getPublicGuestByUuid } from "@/src/lib/services/guestService.server";
import PublicGuestInvitationContent from "./PublicGuestInvitationContent";

type PublicGuestInvitationProps = {
  searchParams: PageProps<"/">["searchParams"];
};

export default async function PublicGuestInvitation({
  searchParams,
}: PublicGuestInvitationProps) {
  const raw = (await searchParams)[QueryParams.GUEST_UUID];
  const first = Array.isArray(raw) ? raw[0] : raw;
  const uuid = first?.trim() || undefined;
  const guest = uuid ? await getPublicGuestByUuid(uuid) : undefined;

  return <PublicGuestInvitationContent guest={guest} />;
}
