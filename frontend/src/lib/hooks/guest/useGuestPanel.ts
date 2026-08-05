"use client";

import { Guest } from "../../types/Guest";
import { usePanelNavigation } from "../usePanelNavigation";

export type GuestPanelState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "view"; guestId: string }
  | { mode: "edit"; guest: Guest }
  | { mode: "delete"; guestId: string };

type GuestPanelOptions = {
  isFormDirty: boolean;
  isCreatingGuest: boolean;
  isEditingGuest: boolean;
  isDeletingGuest: boolean;
  onDiscardForm: () => void;
};

export function useGuestPanel({
  isFormDirty,
  isCreatingGuest,
  isEditingGuest,
  isDeletingGuest,
  onDiscardForm,
}: GuestPanelOptions) {
  const navigation = usePanelNavigation<GuestPanelState>({
    initialPanel: { mode: "closed" },
    guards: {
      add: () => {
        if (isCreatingGuest) return "block";
        return isFormDirty ? "confirm" : "allow";
      },
      edit: () => {
        if (isEditingGuest) return "block";
        return isFormDirty ? "confirm" : "allow"
      },
      delete: () => (isDeletingGuest ? "block" : "allow"),
    },
    onLeave: {
      add: onDiscardForm,
      edit: onDiscardForm,
    },
  });

  const { panel } = navigation;
  const selectedGuestId = getSelectedGuestId(panel);

  return { ...navigation, selectedGuestId };
}

function getSelectedGuestId(panel: GuestPanelState): string | undefined {
  switch (panel.mode) {
    case "view":
    case "delete":
      return panel.guestId;
    case "edit":
      return panel.guest.id;
    default:
      return undefined;
  }
}
