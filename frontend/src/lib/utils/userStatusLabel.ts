import { UserStatus } from "../types/User";

const labels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
};

export function getUserStatusLabel(status: UserStatus): string {
  return labels[status];
}
