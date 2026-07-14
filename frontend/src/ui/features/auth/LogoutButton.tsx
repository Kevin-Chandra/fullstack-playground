"use client";

import { useLogout } from "@/src/lib/hooks/useLogout";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";

export default function LogoutButton() {
  const { logout, loading } = useLogout();

  return (
    <DefaultButton
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={logout}
    >
      Log out
    </DefaultButton>
  );
}
