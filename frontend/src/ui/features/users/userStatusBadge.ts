import { UserStatus } from "@/src/lib/types/UserStatus";
import { BadgeVariant } from "@/src/ui/components/badge/DefaultBadge";

const statusVariants: Record<UserStatus, BadgeVariant> = {
  [UserStatus.ACTIVE]: "active",
  [UserStatus.INACTIVE]: "danger",
};

export function getUserStatusBadgeVariant(status: UserStatus): BadgeVariant {
  return statusVariants[status];
}
