"use client";

import { CreateUserPayload } from "@/src/lib/types/User";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { UseFormReturn } from "react-hook-form";
import { MdClose, MdPerson, MdPersonAddAlt1 } from "react-icons/md";
import { FormMode } from "../../components/form/Form";
import UserForm from "./UserForm";

const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const header = "flex items-center gap-lg";
const headerIcon =
  "flex p-xl shrink-0 items-center justify-center rounded-full border border-dashed border-edge-strong text-accent [&_svg]:size-10";
const identity = "flex min-w-0 flex-1 flex-col";
const actions = "flex shrink-0 items-center gap-sm";

const copyByMode = {
  create: {
    icon: <MdPersonAddAlt1 />,
    title: "New team member",
    description: "They will be able to manage your wedding workspace.",
  },
  edit: {
    icon: <MdPerson />,
    title: "Edit team member",
    description: "Update their details and workspace access.",
  },
} as const;

type UserFormContentProps = {
  mode?: FormMode;
  isLoading: boolean;
  formMethods: UseFormReturn<CreateUserPayload>;
  onSubmit: (payload: CreateUserPayload) => void;
  onClose: () => void;
};

export default function UserFormContent({
  mode = "create",
  isLoading,
  formMethods,
  onSubmit,
  onClose,
}: UserFormContentProps) {
  const copy = copyByMode[mode];

  return (
    <div className={content}>
      <div className={header}>
        <span className={headerIcon}>{copy.icon}</span>
        <div className={identity}>
          <h2>{copy.title}</h2>
          <p className="text-muted">{copy.description}</p>
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
        mode={mode}
        formMethods={formMethods}
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </div>
  );
}
