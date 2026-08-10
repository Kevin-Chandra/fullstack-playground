import { Routes } from "@/src/lib/constants/routes";
import PublicGuestInvitation from "@/src/ui/features/guestRsvp/PublicGuestInvitation";
import PublicGuestInvitationSkeleton from "@/src/ui/features/guestRsvp/PublicGuestInvitationSkeleton";
import Link from "next/link";
import { Suspense } from "react";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Wedding Management Portal
        </h1>
        <Suspense fallback={<PublicGuestInvitationSkeleton />}>
          <PublicGuestInvitation searchParams={searchParams} />
        </Suspense>
      </main>
      <footer className="flex justify-center pb-8">
        <Link
          href={Routes.LOGIN}
          className="text-sm text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Admin sign in
        </Link>
      </footer>
    </div>
  );
}
