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

export function getGuestStatusBadgeVariant(status: GuestStatus): BadgeVariant {
  return statusVariants[status];
}

export function getGuestStatusLabel(status: GuestStatus): string {
  return labels[status];
}