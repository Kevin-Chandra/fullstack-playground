"use client";

import { User } from "@/src/lib/types/User";
import {
  formatFullDate,
  formatMonthYear,
} from "@/src/lib/utils/dateTimeFormatter";
import { getUserStatusLabel } from "@/src/lib/utils/userStatusLabel";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import InfoField from "@/src/ui/components/card/InfoField";
import UserDetailsHeader from "./UserDetailsHeader";
import UserDetailsSkeleton from "./UserDetailsSkeleton";

const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const divider = "border-t border-edge";
const scrollArea = "flex min-h-0 flex-1 flex-col overflow-y-auto";
const grid = "grid grid-cols-2 gap-lg";
const footer = "flex justify-end border-t border-edge pt-xl";

type UserDetailsContentProps = {
  isLoading: boolean;
  user?: User;
  onDelete: () => void;
  onClose: () => void;
};

export default function UserDetailsContent({
  isLoading,
  user,
  onDelete,
  onClose,
}: UserDetailsContentProps) {

  if (isLoading || !user) return <UserDetailsSkeleton />;

  return (
    <div className={content}>
      <UserDetailsHeader user={user} onClose={onClose} />
      <div className={divider} />
      <div className={scrollArea}>
        <div className={grid}>
          <InfoField label="Username" value={user.username} />
          <InfoField
            label="Status"
            value={getUserStatusLabel(user.userStatus)}
          />
          <InfoField
            label="Member since"
            value={formatMonthYear(user.createdAt)}
          />
          <InfoField
            label="Last updated"
            value={formatFullDate(user.updatedAt)}
          />
        </div>
      </div>
      <div className={footer}>
        <DefaultButton
          variant="ghost"
          size="md"
          label="Remove from workspace"
          onClick={onDelete}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
