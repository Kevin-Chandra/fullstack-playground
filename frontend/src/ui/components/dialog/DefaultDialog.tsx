"use client";

import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import type { ReactNode } from "react";
import { useId } from "react";
import { IconType } from "react-icons";
import { MdClose } from "react-icons/md";
import BaseDialog, { BaseDialogProps } from "./BaseDialog";

export type DefaultDialogProps = {
  title: ReactNode;
  icon?: IconType;
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  loading?: boolean;
  showCloseButton?: boolean;
} & BaseDialogProps;

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
  icon: Icon,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryClick,
  onSecondaryClick,
  loading = false,
  children,
  showCloseButton = true,
  size = "sm",
}: DefaultDialogProps) {
  const titleId = useId();
  const tone = destructive ? "destructive" : "base";

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      dismissable={dismissable}
      destructive={destructive}
      size={size}
    >
      <div className="relative p-2xl">
        {showCloseButton && (
          <span className="absolute top-5 right-5">
            <DefaultButton
              variant="ghost"
              size="sm"
              icon={MdClose}
              aria-label="Close dialog"
              onClick={onClose}
              disabled={loading}
            />
          </span>
        )}

        <div className="flex flex-col gap-lg">
          {Icon && (
            <span className={`${iconWell} ${iconWellTone[tone]}`}><Icon /></span>
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
                disabled={loading}
                className="w-full @xs:w-auto"
              />
            )}
            <DefaultButton
              variant={destructive ? "danger" : "primary"}
              size="md"
              label={primaryButtonLabel}
              onClick={onPrimaryClick}
              loading={loading}
              className="w-full @xs:w-auto"
            />
          </div>
        </div>
      </div>
    </BaseDialog >
  );
}
