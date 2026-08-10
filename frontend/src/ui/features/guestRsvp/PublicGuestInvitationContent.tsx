import { PublicGuest } from "@/src/lib/types/Guest";
import GuestRsvpSection from "./GuestRsvpSection";

const content = "flex w-full flex-col items-center gap-md";
const headline = "text-lg leading-8 text-ink-body";
const subline = "text-sm text-muted";
const rsvpSection = "mt-lg flex w-full justify-center";

type PublicGuestInvitationContentProps = {
  guest?: PublicGuest;
};

export default function PublicGuestInvitationContent({
  guest,
}: PublicGuestInvitationContentProps) {
  if (!guest) {
    return (
      <p className={headline}>
        Welcome! The public site is under construction — check back soon.
      </p>
    );
  }

  return (
    <div className={content}>
      <p className={headline}>Welcome, {guest.name}</p>
      <p className={subline}>
        We saved {guest.pax} {guest.pax === 1 ? "seat" : "seats"} for you.
      </p>

      <div className={rsvpSection}>
        <GuestRsvpSection guest={guest} />
      </div>
    </div>
  );
}
