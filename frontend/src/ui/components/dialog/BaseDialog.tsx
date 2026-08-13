"use client";

import { useDialog } from "@/src/lib/hooks/components/useDialog";
import type { ReactNode } from "react";
import { useId } from "react";

export type DialogSize = "sm" | "md" | "lg";

export type BaseDialogProps = {
  open: boolean;
  onClose: () => void;
  dismissable?: boolean;
  destructive?: boolean;
  size?: DialogSize;
  children?: ReactNode;
};

const panel = [
  "m-auto w-full rounded-xl bg-raised text-ink-body shadow-modal",
  "backdrop:bg-black/45 open:animate-dialog-in",
].join(" ");

const sizes: Record<DialogSize, string> = {
  sm: "max-w-dialog-sm",
  md: "max-w-dialog-md",
  lg: "max-w-dialog-lg",
};

const border = {
  base: "border border-edge-strong",
  destructive: "border border-error/20",
};

export default function BaseDialog({
  open,
  onClose,
  destructive = false,
  dismissable = true,
  size = "sm",
  children
}: BaseDialogProps) {
  const titleId = useId();
  const { dialogRef, onCancel, onNativeClose, onPointerDown, onBackdropClick } =
    useDialog({ open, onClose, dismissable });
  const tone = destructive ? "destructive" : "base";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClose={onNativeClose}
      onPointerDown={onPointerDown}
      onClick={onBackdropClick}
      className={`${panel} ${sizes[size]} ${border[tone]}`}
    >
      {children}
    </dialog>
  );
}
