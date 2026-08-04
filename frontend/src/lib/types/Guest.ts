import { BasePaginationParam } from "./BasePaginationParam";
import { GuestInvitationType } from "./enum/GuestInvitationType.enum";
import { GuestStatus } from "./enum/GuestStatus.enum";
import { Rsvp } from "./Rsvp";

export interface GuestListItem {
  id: string;
  name: string;
  pax: number;
  guestStatus: GuestStatus
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  notes: string;
  guestUuid: number;
  pax: number;
  invitationType: GuestInvitationType;
  rsvp?: Rsvp
}

export type GetGuestParams = Partial<
    BasePaginationParam & {
      "filter.rsvp.attending": string
    }>;

export interface CreateGuestPayload {
  name: string;
  email: string;
  phoneNumber: string;
  notes: string;
  pax: number;
  invitationType: GuestInvitationType;
}

export type UpdateGuestPayload = Partial<CreateGuestPayload>;