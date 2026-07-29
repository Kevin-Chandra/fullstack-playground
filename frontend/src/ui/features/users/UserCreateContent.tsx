"use client";

import { CreateUserPayload } from "@/src/lib/types/User";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { UseFormReturn } from "react-hook-form";
import { MdClose, MdPersonAddAlt1 } from "react-icons/md";
import UserForm from "./UserForm";

const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const header = "flex items-center gap-lg";
const headerIcon =
  "flex p-xl shrink-0 items-center justify-center rounded-full border border-dashed border-edge-strong text-accent [&_svg]:size-10";
const identity = "flex min-w-0 flex-1 flex-col";
const actions = "flex shrink-0 items-center gap-sm";

type UserCreateContentProps = {
  isLoading: boolean;
  formMethods: UseFormReturn<CreateUserPayload>;
  onSubmit: (payload: CreateUserPayload) => void;
  onClose: () => void;
};

export default function UserCreateContent({
  isLoading,
  formMethods,
  onSubmit,
  onClose,
}: UserCreateContentProps) {
  return (
    <div className={content}>
      <div className={header}>
        <span className={headerIcon}>
          <MdPersonAddAlt1 />
        </span>
        <div className={identity}>
          <h2>New team member</h2>
          <p className="text-muted">
            They will be able to manage your wedding workspace.
          </p>
        </div>
        <div className={actions}>
          <DefaultButton
            variant="ghost"
            size="md"
            icon={<MdClose />}
            aria-label="Close"
            disabled={isLoading}
            onClick={onClose}
          />
        </div>
      </div>

      <hr />

      <UserForm
        formMethods={formMethods}
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </div>
  );
}
