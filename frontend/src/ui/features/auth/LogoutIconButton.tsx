"use client";

import { useLogout } from "@/src/lib/hooks/useLogout";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { MdOutlineLogout } from "react-icons/md";

export default function LogoutIconButton() {
  const { logout, loading } = useLogout();

  return (
    <DefaultButton
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={logout}
      icon={MdOutlineLogout}
      aria-label="Log out"
    />
  );
}
