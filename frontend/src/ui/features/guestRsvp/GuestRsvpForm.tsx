"use client";

import { RSVP_FORM_LIMITS, RSVP_FORM_MESSAGES } from "@/src/lib/constants/form";
import { RsvpFormValues } from "@/src/lib/types/Rsvp";
import { Controller, UseFormReturn } from "react-hook-form";
import { MdOutlineSend } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";
import DefaultInput from "../../components/input/DefaultInput";
import DefaultRadioButton from "../../components/input/DefaultRadioButton";
import DefaultTextarea from "../../components/input/DefaultTextarea";
import RadioGroup from "../../components/input/RadioGroup";

const form =
  "flex w-full max-w-dialog-sm flex-col gap-xl rounded-lg border border-edge bg-raised p-xl text-left";
const heading = "flex flex-col gap-xs";
const title = "text-h3 text-ink";
const description = "text-caption text-muted";

/** RadioGroup speaks strings; the payload wants a boolean. */
const ATTENDING = "attending";
const DECLINED = "declined";

type GuestRsvpFormProps = {
  /** Seats the couple reserved — the ceiling for the party size. */
  seats: number;
  formMethods: UseFormReturn<RsvpFormValues>;
  isLoading?: boolean;
  onSubmit: (values: RsvpFormValues) => void;
};

export default function GuestRsvpForm({
  seats,
  formMethods,
  isLoading = false,
  onSubmit,
}: GuestRsvpFormProps) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const attending = watch("attending");

  return (
    <form className={form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={heading}>
        <h2 className={title}>Will you be there?</h2>
        <p className={description}>
          Let us know by replying below — you can only send this once.
        </p>
      </div>

      <Controller
        control={control}
        name="attending"
        render={({ field }) => (
          <RadioGroup
            label="Your response"
            labelPosition="right"
            disabled={isLoading}
            value={field.value ? ATTENDING : DECLINED}
            onValueChange={(value) => field.onChange(value === ATTENDING)}
          >
            <DefaultRadioButton value={ATTENDING} label="Joyfully accepts" />
            <DefaultRadioButton
              value={DECLINED}
              label="Regretfully declines"
            />
          </RadioGroup>
        )}
      />

      {/* A decline keeps no seats, so the party size only matters when going. */}
      {attending && (
        <DefaultInput
          fullWidth
          required
          label="Guests attending"
          type="number"
          min={RSVP_FORM_LIMITS.pax.min}
          max={seats}
          disabled={isLoading}
          hint={`Up to ${seats} ${seats === 1 ? "seat" : "seats"} reserved`}
          error={errors.pax?.message}
          {...register("pax", {
            valueAsNumber: true,
            required: RSVP_FORM_MESSAGES.pax.required,
            min: {
              value: RSVP_FORM_LIMITS.pax.min,
              message: RSVP_FORM_MESSAGES.pax.min,
            },
            max: {
              value: seats,
              message: RSVP_FORM_MESSAGES.pax.max(seats),
            },
          })}
        />
      )}

      <DefaultTextarea
        fullWidth
        label="Message to the couple"
        rows={3}
        resize="none"
        placeholder="Dietary needs, a note, anything you'd like us to know…"
        disabled={isLoading}
        error={errors.notes?.message}
        {...register("notes", {
          maxLength: {
            value: RSVP_FORM_LIMITS.notes.max,
            message: RSVP_FORM_MESSAGES.notes.max,
          },
        })}
      />

      <DefaultButton
        type="submit"
        variant="primary"
        fullWidth
        icon={MdOutlineSend}
        label="Send RSVP"
        loading={isLoading}
      />
    </form>
  );
}
