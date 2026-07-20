import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, SyntheticEvent } from "react";

type UseDialogParams = {
  open: boolean;
  onClose: () => void;
  dismissable?: boolean;
};

export function useDialog({
  open,
  onClose,
  dismissable = true,
}: UseDialogParams) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // backdrop dismissal must start AND end on the backdrop, so a drag that
  // begins inside the panel (e.g. selecting text in an input) can't close it
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  // native dismissals onCancel doesn't cover, e.g. form method="dialog";
  // the guard skips the echo fired by the sync effect's own close()
  const onNativeClose = () => {
    if (open) onClose();
  };

  const onPointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    pressStartedOnBackdrop.current = event.target === dialogRef.current;
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (
      dismissable &&
      event.target === dialogRef.current &&
      pressStartedOnBackdrop.current
    ) {
      onClose();
    }
  };

  return { dialogRef, onCancel, onNativeClose, onPointerDown, onBackdropClick };
}
