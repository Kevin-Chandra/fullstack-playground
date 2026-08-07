"use client";

import {
  EMAIL_PATTERN,
  GUEST_FORM_LIMITS,
  GUEST_FORM_MESSAGES,
  PHONE_PATTERN,
} from "@/src/lib/constants/form";
import { invitationTypeOptions } from "@/src/lib/data/invitationTypeOptions";
import { CreateGuestPayload } from "@/src/lib/types/Guest";
import { Controller, UseFormReturn } from "react-hook-form";
import DefaultButton from "../../components/buttons/DefaultButton";
import { FormMode } from "../../components/form/Form";
import DefaultInput from "../../components/input/DefaultInput";
import DefaultTextarea from "../../components/input/DefaultTextarea";
import InputSelect from "../../components/input/InputSelect";

const form = "flex min-h-0 flex-1 flex-col gap-2xl";
const scrollArea = "flex min-h-0 flex-1 flex-col gap-xl overflow-y-auto";
const footer = "flex justify-end gap-sm border-t border-edge pt-xl";
const twoColumn = "flex gap-xl";

type GuestFormProps = {
  mode?: FormMode;
  formMethods: UseFormReturn<CreateGuestPayload>;
  onSubmit: (guestDetails: CreateGuestPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function GuestForm({
  mode = "create",
  formMethods,
  onSubmit,
  onCancel,
  isLoading = false,
}: GuestFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <form className={form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={scrollArea}>
        <DefaultInput
          fullWidth
          required
          label="Full Name"
          placeholder="e.g. John Doe"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name", {
            required: GUEST_FORM_MESSAGES.name.required,
            minLength: {
              value: GUEST_FORM_LIMITS.name.min,
              message: GUEST_FORM_MESSAGES.name.min,
            },
            maxLength: {
              value: GUEST_FORM_LIMITS.name.max,
              message: GUEST_FORM_MESSAGES.name.max,
            },
          })}
        />

        <div className={twoColumn}>
          <DefaultInput
            fullWidth
            label="Email"
            type="email"
            placeholder="name@email.com"
            error={errors.email?.message}
            {...register("email", {
              maxLength: {
                value: GUEST_FORM_LIMITS.email.max,
                message: GUEST_FORM_MESSAGES.email.max,
              },
              pattern: {
                value: EMAIL_PATTERN,
                message: GUEST_FORM_MESSAGES.email.pattern,
              },
            })}
          />
          <DefaultInput
            fullWidth
            label="Phone Number"
            type="tel"
            placeholder="+60123456789"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber", {
              minLength: {
                value: GUEST_FORM_LIMITS.phoneNumber.min,
                message: GUEST_FORM_MESSAGES.phoneNumber.min,
              },
              maxLength: {
                value: GUEST_FORM_LIMITS.phoneNumber.max,
                message: GUEST_FORM_MESSAGES.phoneNumber.max,
              },
              pattern: {
                value: PHONE_PATTERN,
                message: GUEST_FORM_MESSAGES.phoneNumber.pattern,
              },
            })}
          />
        </div>

        <div className={twoColumn}>
          <DefaultInput
            fullWidth
            required
            label="Party Size"
            type="number"
            placeholder="2"
            min={GUEST_FORM_LIMITS.pax.min}
            error={errors.pax?.message}
            {...register("pax", {
              valueAsNumber: true,
              required: GUEST_FORM_MESSAGES.pax.required,
              min: {
                value: GUEST_FORM_LIMITS.pax.min,
                message: GUEST_FORM_MESSAGES.pax.min,
              },
            })}
          />
          <Controller
            control={control}
            name="invitationType"
            render={({ field }) => (
              <InputSelect
                required
                fullWidth
                label="User Status"
                options={invitationTypeOptions}
                optionLabel={(opt) => opt.name}
                optionValue={(opt) => opt.value}
                value={field.value}
                onChange={(opt) => field.onChange(opt.value)}
              />
            )}
          />
        </div>

        <DefaultTextarea
          fullWidth
          label="Notes"
          rows={4}
          resize="none"
          placeholder="Dietary needs, seating requests, anything to remember…"
          error={errors.notes?.message}
          {...register("notes")}
        />
      </div>

      <div className={footer}>
        <DefaultButton
          type="button"
          variant="secondary"
          label="Cancel"
          disabled={isLoading}
          onClick={onCancel}
        />
        <DefaultButton
          type="submit"
          variant="primary"
          label={mode === "edit" ? "Save changes" : "Add Guest"}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </form>
  );
}