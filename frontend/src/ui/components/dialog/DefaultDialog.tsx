"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { MdClose } from "react-icons/md";
import { useDialog } from "@/src/lib/hooks/components/useDialog";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";

export type DefaultDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** When false, clicking outside the dialog is ignored */
  dismissable?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  children?: ReactNode;
  showCloseButton?: boolean;
};

const panel = [
  "m-auto w-full max-w-dialog rounded-xl bg-raised text-ink-body shadow-modal",
  "backdrop:bg-black/45 open:animate-dialog-in",
].join(" ");

const border = {
  base: "border border-edge-strong",
  destructive: "border border-error/20",
};

const iconWell =
  "flex size-10.5 shrink-0 items-center justify-center rounded-btn-lg border [&_svg]:size-5";

const iconWellTone = {
  base: "border-accent/25 bg-accent/10 text-accent",
  destructive: "border-error/25 bg-error/10 text-error",
};

export default function DefaultDialog({
  open,
  onClose,
  title,
  destructive = false,
  dismissable = true,
  icon,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryClick,
  onSecondaryClick,
  children,
  showCloseButton = true,
}: DefaultDialogProps) {
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
      className={`${panel} ${border[tone]}`}
    >
      <div className="relative p-2xl">
        {showCloseButton && (
          <DefaultButton
            variant="ghost"
            size="sm"
            icon={<MdClose />}
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute top-5 right-5"
          />
        )}

        <div className="flex flex-col gap-lg">
          {icon && (
            <span className={`${iconWell} ${iconWellTone[tone]}`}>{icon}</span>
          )}
          <h2 id={titleId} className="pr-8 font-display text-h2 text-ink">
            {title}
          </h2>
          {children && (
            <div className="flex flex-col gap-5.5 text-body-sm text-muted">
              {children}
            </div>
          )}
        </div>

        <div className="@container mt-xl">
          <div className="flex flex-col gap-3 @xs:flex-row @xs:items-center @xs:justify-end">
            {secondaryButtonLabel && (
              <DefaultButton
                variant="ghost"
                size="md"
                label={secondaryButtonLabel}
                onClick={onSecondaryClick ?? onClose}
                className="w-full @xs:w-auto"
              />
            )}
            <DefaultButton
              variant={destructive ? "danger" : "primary"}
              size="md"
              label={primaryButtonLabel}
              onClick={onPrimaryClick}
              className="w-full @xs:w-auto"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}
