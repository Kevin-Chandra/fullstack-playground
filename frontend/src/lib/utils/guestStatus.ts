import { GuestStatus } from "../types/enum/GuestStatus.enum";
import { Guest } from "../types/Guest";

export function getGuestStatus(guest: Guest): GuestStatus {
  if (!guest.rsvp) {
    return GuestStatus.PENDING
  }

  return guest.rsvp.attending ? GuestStatus.CONFIRMED : GuestStatus.DECLINED;
}