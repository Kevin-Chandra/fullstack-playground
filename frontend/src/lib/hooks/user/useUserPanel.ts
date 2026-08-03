"use client";

import { User } from "../../types/User";
import { usePanelNavigation } from "../usePanelNavigation";

export type UserPanelState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "view"; userId: string }
  | { mode: "edit"; user: User }
  | { mode: "delete"; userId: string };

type UserPanelOptions = {
  isFormDirty: boolean;
  isCreatingUser: boolean;
  isEditingUser: boolean;
  isDeletingUser: boolean;
  onDiscardForm: () => void;
};

export function useUserPanel({
  isFormDirty,
  isCreatingUser,
  isEditingUser,
  isDeletingUser,
  onDiscardForm,
}: UserPanelOptions) {
  const navigation = usePanelNavigation<UserPanelState>({
    initialPanel: { mode: "closed" },
    guards: {
      add: () => {
        if (isCreatingUser) return "block";
        return isFormDirty ? "confirm" : "allow";
      },
      edit: () => {
        if (isEditingUser) return "block";
        return isFormDirty ? "confirm" : "allow"
      },
      delete: () => (isDeletingUser ? "block" : "allow"),
    },
    onLeave: {
      add: onDiscardForm,
      edit: onDiscardForm,
    },
  });

  const { panel } = navigation;
  const selectedUserId = getSelectedUserId(panel);

  return { ...navigation, selectedUserId };
}

function getSelectedUserId(panel: UserPanelState): string | undefined {
  switch (panel.mode) {
    case "view":
    case "delete":
      return panel.userId;
    case "edit":
      return panel.user.id;
    default:
      return undefined;
  }
}
