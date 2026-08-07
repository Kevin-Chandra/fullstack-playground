import { GuestInvitationType } from "../types/enum/GuestInvitationType.enum";

export const invitationTypeOptions = [
  { id: 1, name: "Online Invitation", value: GuestInvitationType.ONLINE },
  { id: 2, name: "Physical Card", value: GuestInvitationType.OFFLINE },
];
