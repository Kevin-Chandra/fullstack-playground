"use client";

import { customErrorActionLabel } from "@/src/lib/constants/error";
import { ErrorAction, ErrorEntity } from "@/src/lib/types/ErrorEntity";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { ReactNode } from "react";
import { MdErrorOutline } from "react-icons/md";

type ErrorStateProps = {
  error: ErrorEntity;
  icon?: ReactNode;
  onErrorActionClick: (action?: ErrorAction) => void;
};

export default function ErrorState({
  error,
  icon = <MdErrorOutline className="color-danger" size={40} />,
  onErrorActionClick,
}: ErrorStateProps) {
  function getErrorActionLabel(action?: ErrorAction): string {
    switch (action) {
      default:
        return customErrorActionLabel[action];
      case undefined:
        return "Try again";
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {icon}
      <h2>{error.error}</h2>
      {error.description && (
        <p className="text-sm text-muted">{error.description}</p>
      )}
      <DefaultButton
        variant="secondary"
        label={getErrorActionLabel(error.defaultAction)}
        onClick={() => onErrorActionClick(error.defaultAction)}
      />
    </div>
  );
}
