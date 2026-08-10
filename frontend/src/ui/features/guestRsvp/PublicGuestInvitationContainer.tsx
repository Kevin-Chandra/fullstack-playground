"use client";

import { Routes } from "@/src/lib/constants/routes";
import { usePublicGuest } from "@/src/lib/hooks/guest/usePublicGuest";
import { useGuestUuidParam } from "@/src/lib/hooks/useGuestUuidParam";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import { useRouter } from "next/navigation";
import ErrorState from "../../components/error/ErrorState";
import PublicGuestInvitationContent from "./PublicGuestInvitationContent";
import PublicGuestInvitationSkeleton from "./PublicGuestInvitationSkeleton";

export default function PublicGuestInvitationContainer() {
  const router = useRouter();
  const guestUuid = useGuestUuidParam();
  const { result, loading, refetch } = usePublicGuest(guestUuid);

  function handleErrorAction(action?: ErrorAction) {
    switch (action) {
      case ErrorAction.RETURN_TO_MAIN:
        // Drop the unusable invitation link from the URL.
        router.replace(Routes.HOME);
        break;

      // ErrorState labels an undefined action as "Try again"
      case ErrorAction.TRY_AGAIN:
      default:
        refetch();
        break;
    }
  }

  if (loading) {
    return <PublicGuestInvitationSkeleton />;
  }

  if (result && !result.success) {
    return (
      <ErrorState error={result.error} onErrorActionClick={handleErrorAction} />
    );
  }

  return (
    <PublicGuestInvitationContent guest={result?.data} />
  );
}
