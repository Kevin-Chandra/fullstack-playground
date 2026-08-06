import { GuestInvitationType } from "@/src/lib/types/enum/GuestInvitationType.enum";
import { GuestStatus } from "@/src/lib/types/enum/GuestStatus.enum";
import { BadgeVariant } from "../components/badge/DefaultBadge";

const labels: Record<GuestStatus, string> = {
  [GuestStatus.PENDING]: "Pending",
  [GuestStatus.CONFIRMED]: "Confirmed",
  [GuestStatus.DECLINED]: "Declined",
};

const statusVariants: Record<GuestStatus, BadgeVariant> = {
  [GuestStatus.PENDING]: "warning",
  [GuestStatus.CONFIRMED]: "active",
  [GuestStatus.DECLINED]: "danger",
};

const invitationLabel: Record<GuestInvitationType, string> = {
  [GuestInvitationType.OFFLINE]: "Physical card",
  [GuestInvitationType.ONLINE]: "Online invitation",

};

export type GuestRsvpCopy = {
  headline: string;
  meta: string;
  attendanceNote: string;
  emptyNotes: string;
};

const rsvpCopy: Record<GuestStatus, GuestRsvpCopy> = {
  [GuestStatus.PENDING]: {
    headline: "Awaiting response",
    meta: "Invitation sent · no reply yet",
    attendanceNote: "— no reply yet",
    emptyNotes: "They haven't responded to the invitation yet.",
  },
  [GuestStatus.CONFIRMED]: {
    headline: "Going",
    meta: "Replied ",
    attendanceNote: "",
    emptyNotes: "They didn't leave a message with their reply.",
  },
  [GuestStatus.DECLINED]: {
    headline: "Not going",
    meta: "Replied ",
    attendanceNote: "— sends regrets",
    emptyNotes: "They didn't leave a message with their reply.",
  },
};

export function getGuestStatusBadgeVariant(status: GuestStatus): BadgeVariant {
  return statusVariants[status];
}

export function getGuestStatusLabel(status: GuestStatus): string {
  return labels[status];
}

export function getGuestInvitationTypeLabel(type: GuestInvitationType): string {
  return invitationLabel[type];
}

export function getGuestRsvpCopy(status: GuestStatus): GuestRsvpCopy {
  return rsvpCopy[status];
}