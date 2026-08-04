import { GuestStatus } from "../../libs/entity/enums/guest-status.enum";
import { Guest } from "../../libs/entity/guest.entity";

export type GuestWithStatus = Guest & { guestStatus: GuestStatus };
