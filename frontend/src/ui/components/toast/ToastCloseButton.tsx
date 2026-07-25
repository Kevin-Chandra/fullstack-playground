"use client";

import { MdClose } from "react-icons/md";
import type { CloseButtonProps } from "react-toastify";
import DefaultButton from "../buttons/DefaultButton";

export default function ToastCloseButton({ closeToast }: CloseButtonProps) {
  return (
    <DefaultButton
      aria-label="Dismiss notification"
      onClick={closeToast}
      size="xs"
      variant="ghost"
      icon={<MdClose />}
      className="ms-auto"
    />
  );
}
