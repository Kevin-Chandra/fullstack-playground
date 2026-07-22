"use client";

import { NOT_FOUND_ERROR } from "@/src/lib/constants/error";
import { Routes } from "@/src/lib/constants/routes";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

/**
 * Client CTA row for the 404 page: "Back to dashboard" navigates to a known
 * route, "Go back" pops the history stack. Kept out of FullScreenError so the
 * shell stays a presentational (server-renderable) component.
 */
export default function NotFoundActions() {
  const router = useRouter();

  return (
    <>
      <DefaultButton
        label={NOT_FOUND_ERROR.primaryLabel}
        onClick={() => router.push(Routes.DASHBOARD)}
      />
    </>
  );
}
