"use client";

import { FORM_DEFAULT_VALIDATION_MODE } from "@/src/lib/constants/form";
import { useRsvp } from "@/src/lib/hooks/rsvp/useRsvp";
import { PublicGuest } from "@/src/lib/types/Guest";
import { Rsvp, RsvpFormValues } from "@/src/lib/types/Rsvp";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "../../components/toast/toast";
import GuestRsvpForm from "./GuestRsvpForm";
import GuestRsvpSummary from "./GuestRsvpSummary";

type GuestRsvpSectionProps = {
  guest: PublicGuest;
};

export default function GuestRsvpSection({
  guest,
}: GuestRsvpSectionProps) {
  // The reply sent in this session; `guest.rsvp` holds any earlier one.
  const [sentRsvp, setSentRsvp] = useState<Rsvp>();
  const { loading, create } = useRsvp();

  const formMethods = useForm<RsvpFormValues>({
    defaultValues: { attending: true, pax: guest.pax, notes: "" },
    mode: FORM_DEFAULT_VALIDATION_MODE,
  });

  const rsvp = guest.rsvp ?? sentRsvp;

  async function handleSubmit(values: RsvpFormValues) {
    const result = await create({
      guestUuid: guest.uuid,
      attending: values.attending,
      pax: values.attending ? values.pax : 0,
      notes: values.notes?.trim() || undefined,
    });

    if (!result.success) {
      toast.error("We couldn't send your RSVP", {
        subline: result.error.error,
      });
      return;
    }

    setSentRsvp(result.data);
    toast.success("Thank you — your RSVP has been sent");
  }

  if (rsvp) {
    return <GuestRsvpSummary rsvp={rsvp} />;
  }

  return (
    <GuestRsvpForm
      seats={guest.pax}
      formMethods={formMethods}
      isLoading={loading}
      onSubmit={handleSubmit}
    />
  );
}
