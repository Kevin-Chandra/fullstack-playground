export interface Rsvp {
  id: string;
  notes: string;
  pax: number;
  attending: boolean;
  createdAt: string;
}

export interface CreateRsvpPayload {
  guestUuid: string;
  pax: number;
  attending: boolean;
  notes?: string;
}

export type RsvpFormValues = Omit<CreateRsvpPayload, "guestUuid">;