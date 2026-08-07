"use client";

import { CreateGuestPayload } from "@/src/lib/types/Guest";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { UseFormReturn } from "react-hook-form";
import { MdClose, MdEditDocument, MdPersonAddAlt1 } from "react-icons/md";
import { FormMode } from "../../components/form/Form";
import GuestForm from "./GuestForm";


const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const header = "flex items-center gap-lg";
const headerIcon =
  "flex p-xl shrink-0 items-center justify-center rounded-full border border-dashed border-edge-strong text-accent [&_svg]:size-10";
const identity = "flex min-w-0 flex-1 flex-col";
const actions = "flex shrink-0 items-center gap-sm";

const copyByMode = {
  create: {
    icon: MdPersonAddAlt1,
    title: "New Guest",
    description: "Add them to your list and track their RSVP.",
  },
  edit: {
    icon: MdEditDocument,
    title: "Edit guest",
    description: "Update their details",
  },
} as const;

type GuestFormContentProps = {
  mode?: FormMode;
  isLoading: boolean;
  formMethods: UseFormReturn<CreateGuestPayload>;
  onSubmit: (payload: CreateGuestPayload) => void;
  onClose: () => void;
};

export default function GuestFormContent({
  mode = "create",
  isLoading,
  formMethods,
  onSubmit,
  onClose,
}: GuestFormContentProps) {
  const copy = copyByMode[mode];

  return (
    <div className={content}>
      <div className={header}>
        <span className={headerIcon}><copy.icon /></span>
        <div className={identity}>
          <h2>{copy.title}</h2>
          <p className="text-muted">{copy.description}</p>
        </div>
        <div className={actions}>
          <DefaultButton
            variant="ghost"
            size="md"
            icon={MdClose}
            aria-label="Close"
            disabled={isLoading}
            onClick={onClose}
          />
        </div>
      </div>

      <hr />

      <GuestForm
        mode={mode}
        formMethods={formMethods}
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </div>
  );
}
