import { Guest } from "../../libs/entity/guest.entity";
import { Rsvp } from "../../libs/entity/rsvp.entity";

export type GuestPublic = Pick<Guest, "name" | "pax" | "uuid"> & {
  rsvp?: Rsvp;
};
