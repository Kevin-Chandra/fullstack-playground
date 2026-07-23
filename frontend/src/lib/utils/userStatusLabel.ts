import { UserStatus } from "../types/UserStatus";

const labels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
};

export function getUserStatusLabel(status: UserStatus): string {
  return labels[status];
}
