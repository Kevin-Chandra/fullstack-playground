"use client";

import { MdOutlineLogout } from "react-icons/md";
import { useLogout } from "@/src/lib/hooks/useLogout";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";

export default function LogoutIconButton() {
  const { logout, loading } = useLogout();

  return (
    <DefaultButton
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={logout}
      icon={<MdOutlineLogout aria-hidden />}
      aria-label="Log out"
    />
  );
}
