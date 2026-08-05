import { GuestInvitationType } from "../types/enum/GuestInvitationType.enum";
import { CreateGuestPayload } from "../types/Guest";
import { CreateUserPayload } from "../types/User";
import { UserStatus } from "../types/UserStatus";

export const USER_FORM_DEFAULT_VALUES: CreateUserPayload = {
  username: "",
  password: "",
  name: "",
  userStatus: UserStatus.ACTIVE,
};

export const GUEST_FORM_DEFAULT_VALUES: CreateGuestPayload = {
  name: "",
  email: "",
  phoneNumber: "",
  notes: "",
  pax: 0,
  invitationType: GuestInvitationType.ONLINE,
};
