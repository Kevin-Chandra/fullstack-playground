"use client";

import { FORM_DEFAULT_VALIDATION_MODE } from "@/src/lib/constants/form";
import {
  BASE_PAGINATION_PAGE,
  MAX_PAGE_BUTTONS,
} from "@/src/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/src/lib/constants/search";
import { USER_FORM_DEFAULT_VALUES } from "@/src/lib/data/emptyObject";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useUserCreate } from "@/src/lib/hooks/user/useUserCreate";
import { useUserDelete } from "@/src/lib/hooks/user/useUserDelete";
import { useUserDetails } from "@/src/lib/hooks/user/useUserDetails";
import { useUserList } from "@/src/lib/hooks/user/useUserList";
import { useUserPanel } from "@/src/lib/hooks/user/useUserPanel";
import { useUserUpdate } from "@/src/lib/hooks/user/useUserUpdate";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import { CreateUserPayload, UpdateUserPayload, User } from "@/src/lib/types/User";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultDialog from "@/src/ui/components/dialog/DefaultDialog";
import ErrorState from "@/src/ui/components/error/ErrorState";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import SidePanel from "@/src/ui/components/layout/SidePanel";
import ListCard from "@/src/ui/components/list/ListCard";
import PaginationBar from "@/src/ui/components/pagination/PaginationBar";
import { toast } from "@/src/ui/components/toast/toast";
import UserDeletionConfirmationContent from "@/src/ui/features/users/UserDeletionConfirmationContent";
import UserDetailsContent from "@/src/ui/features/users/UserDetailsContent";
import UserFormContent from "@/src/ui/features/users/UserFormContent";
import UserListEmpty from "@/src/ui/features/users/UserListEmpty";
import UserListRow from "@/src/ui/features/users/UserListRow";
import UserListSkeleton from "@/src/ui/features/users/UserListSkeleton";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd, MdOutlineWarningAmber, MdSearch } from "react-icons/md";

const workspace =
  "flex min-h-0 flex-1 flex-col gap-y-xl lg:grid lg:grid-rows-1 lg:user-workspace";
const workspaceState = {
  open: "lg:user-workspace-open",
  closed: "lg:user-workspace-closed",
};
const listColumn = "min-h-0 min-w-0 flex-1 flex-col";
const listColumnState = {
  open: "hidden lg:flex",
  closed: "flex",
};
const detailColumn = "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";
const centered = "flex flex-1 items-center justify-center";

export default function UsersPage() {
  const [page, setPage] = useState(BASE_PAGINATION_PAGE);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.trim() || undefined;

  const {
    users,
    meta,
    loading,
    error: errorFetchUserList,
    refetch,
  } = useUserList(page, search);
  const { create, loading: createUserLoading } = useUserCreate();
  const { update, loading: updateUserLoading } = useUserUpdate();
  const { remove, loading: deleting } = useUserDelete();

  const formMethods = useForm<CreateUserPayload>({
    defaultValues: USER_FORM_DEFAULT_VALUES,
    mode: FORM_DEFAULT_VALIDATION_MODE,
  });

  const { isDirty: formDirty } = formMethods.formState;

  // Single source of truth for which panel is open and for which user.
  // Guards keep an unsaved add-user draft (or an in-flight mutation) from
  // being dropped by any transition.
  const {
    panel,
    selectedUserId,
    navigate,
    isConfirmingNavigation,
    confirmPendingNavigation,
    cancelPendingNavigation,
  } = useUserPanel({
    isFormDirty: formDirty,
    isCreatingUser: createUserLoading,
    isEditingUser: updateUserLoading,
    isDeletingUser: deleting,
    onDiscardForm: () => formMethods.reset(USER_FORM_DEFAULT_VALUES),
  });
  const panelOpen = panel.mode !== "closed";

  const {
    user: selectedUser,
    loading: loadingUserDetails,
    error: errorFetchUserDetails,
    refetch: refetchUserDetails,
  } = useUserDetails(selectedUserId);

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(BASE_PAGINATION_PAGE);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchInput(event.target.value);
  }

  function handleOpenCreate() {
    navigate({ mode: "add" });
  }

  function handleOpenEdit(user: User) {
    formMethods.reset({
      name: user.name,
      username: user.username,
      userStatus: user.userStatus,
    });
    navigate({ mode: "edit", user });
  }

  function handleUserSelected(userId: string) {
    navigate({ mode: "view", userId });
  }

  function handleClosePanel() {
    navigate({ mode: "closed" });
  }

  async function handleCreateUser(payload: CreateUserPayload) {
    const result = await create(payload);

    if (!result.success) {
      toast.error("Error creating user", {
        subline: result.error.error,
      });
      return;
    }

    const newUser = result.data;
    toast.success(`${newUser.name} was added to the workspace`);
    refetch();

    navigate({ mode: "view", userId: newUser.id }, { force: true });
  }

  async function handleUpdateUser(userId: string, payload: UpdateUserPayload) {
    const result = await update(userId, payload);

    if (!result.success) {
      toast.error("Error updating user", {
        subline: result.error.error,
      });
      return;
    }

    const updatedUser = result.data;
    toast.success(`${updatedUser.name} was updated`);
    refetch();
    refetchUserDetails();

    navigate({ mode: "view", userId: updatedUser.id }, { force: true });
  }

  async function handleDeleteUser(user: User) {
    const result = await remove(user.id);

    if (!result.success) {
      toast.error("Error removing user", {
        subline: result.error.error,
      });
      return;
    }

    toast.success(`${user.name} was removed from the workspace`);
    refetch();
    navigate({ mode: "closed" }, { force: true });
  }

  // Single handler for every ErrorState action.
  function handleErrorAction(
    action: ErrorAction | undefined,
    retry: () => void,
  ) {
    switch (action) {
      case ErrorAction.RETURN_TO_MAIN:
        setPage(BASE_PAGINATION_PAGE);
        navigate({ mode: "closed" });
        break;

      // ErrorState labels an undefined action as "Try again"
      case ErrorAction.TRY_AGAIN:
      default:
        retry();
        break;
    }
  }

  function renderSidePanel() {
    switch (panel.mode) {
      case "add":
        return (
          <UserFormContent
            mode="create"
            isLoading={createUserLoading}
            formMethods={formMethods}
            onSubmit={handleCreateUser}
            onClose={handleClosePanel}
          />
        );
      case "view":
        if (errorFetchUserDetails) {
          return (
            <div className={centered}>
              <ErrorState
                error={errorFetchUserDetails}
                onErrorActionClick={(action) =>
                  handleErrorAction(action, refetchUserDetails)
                }
              />
            </div>
          );
        }

        return (
          <UserDetailsContent
            isLoading={loadingUserDetails}
            user={selectedUser}
            onClose={handleClosePanel}
            onDelete={() => navigate({ mode: "delete", userId: panel.userId })}
            onEdit={() => {
              if (selectedUser) handleOpenEdit(selectedUser);
            }}
          />
        );
      case "edit":
        return (
          <UserFormContent
            mode="edit"
            isLoading={updateUserLoading}
            formMethods={formMethods}
            onSubmit={(payload) => handleUpdateUser(panel.user.id, payload)}
            onClose={() => navigate({ mode: "view", userId: panel.user.id })}
          />
        );
      case "delete":
        if (!selectedUser) {
          return null;
        }

        return (
          <UserDeletionConfirmationContent
            user={selectedUser}
            loading={deleting}
            onDelete={() => handleDeleteUser(selectedUser)}
            onCancel={() => navigate({ mode: "view", userId: panel.userId })}
          />
        );
      case "closed":
        return null;
    }
  }

  function renderContent() {
    if (loading) return <UserListSkeleton />;
    if (errorFetchUserList)
      return (
        <div className={centered}>
          <ErrorState
            error={errorFetchUserList}
            onErrorActionClick={(action) => handleErrorAction(action, refetch)}
          />
        </div>
      );
    if (users.length === 0)
      return <UserListEmpty variant={search ? "search" : "default"} />;
    return (
      <ul className="divide-y divide-edge">
        {users.map((user) => (
          <UserListRow
            key={user.id}
            user={user}
            selected={user.id === selectedUserId}
            onSelect={() => handleUserSelected(user.id)}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col flex-2 gap-2">
          <h1>Team</h1>
          <p>People who can access your wedding workspace.</p>
        </div>
        <div className="flex flex-1 gap-6 justify-end">
          <DefaultInput
            className="flex-1"
            fullWidth
            placeholder="Search name or username..."
            leftIcon={<MdSearch />}
            value={searchInput}
            onChange={handleSearchChange}
          />
          <DefaultButton
            icon={MdAdd}
            className="flex-none"
            label="Add user"
            onClick={handleOpenCreate}
          />
        </div>
      </div>
      <div className={`${workspace} ${panelOpen ? workspaceState.open : workspaceState.closed}`}>
        <div className={`${listColumn} ${panelOpen ? listColumnState.open : listColumnState.closed}`}>
          <ListCard
            content={renderContent()}
            footer={
              !loading &&
              !errorFetchUserList &&
              meta && (
                <PaginationBar
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
                  totalItems={meta.totalItems}
                  itemsPerPage={meta.itemsPerPage}
                  maxPageNumber={MAX_PAGE_BUTTONS}
                  onPageChange={setPage}
                />
              )
            }
          />
        </div>
        {panelOpen && (
          <div className={detailColumn}>
            <SidePanel content={renderSidePanel()} />
          </div>
        )}
      </div>
      <DefaultDialog
        open={isConfirmingNavigation}
        onClose={cancelPendingNavigation}
        icon={<MdOutlineWarningAmber />}
        title="Discard changes?"
        primaryButtonLabel="Discard"
        secondaryButtonLabel="Keep editing"
        onPrimaryClick={confirmPendingNavigation}
        onSecondaryClick={cancelPendingNavigation}
      >
        The details you filled in have not been saved yet. Closing now will
        discard them.
      </DefaultDialog>
    </>
  );
}
