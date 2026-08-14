import { Routes } from "@/src/lib/constants/routes";
import PublicGuestInvitation from "@/src/ui/features/guestRsvp/PublicGuestInvitation";
import PublicGuestInvitationSkeleton from "@/src/ui/features/guestRsvp/PublicGuestInvitationSkeleton";
import { Suspense } from "react";
import DefaultLinkButton from "../ui/components/buttons/DefaultLinkButton";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1>
          Wedding Management Portal
        </h1>
        <Suspense fallback={<PublicGuestInvitationSkeleton />}>
          <PublicGuestInvitation searchParams={searchParams} />
        </Suspense>
      </main>
      <footer className="flex justify-center pb-8">
        <DefaultLinkButton
          href={Routes.LOGIN}
          label="Admin Sign in"
          variant="text"
        />
      </footer>
    </div>
  );
}
