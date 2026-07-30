"use client";

import { usePanelNavigation } from "../usePanelNavigation";

export type UserPanelState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "view"; userId: string }
  | { mode: "edit"; userId: string }
  | { mode: "delete"; userId: string };

type UserPanelOptions = {
  isAddFormDirty: boolean;
  isCreatingUser: boolean;
  isDeletingUser: boolean;
  onDiscardAddForm: () => void;
};

export function useUserPanel({
  isAddFormDirty,
  isCreatingUser,
  isDeletingUser,
  onDiscardAddForm,
}: UserPanelOptions) {
  const navigation = usePanelNavigation<UserPanelState>({
    initialPanel: { mode: "closed" },
    guards: {
      add: () => {
        if (isCreatingUser) return "block";
        return isAddFormDirty ? "confirm" : "allow";
      },
      delete: () => (isDeletingUser ? "block" : "allow"),
    },
    onLeave: {
      add: onDiscardAddForm,
    },
  });

  const { panel } = navigation;
  const selectedUserId = "userId" in panel ? panel.userId : undefined;

  return { ...navigation, selectedUserId };
}
