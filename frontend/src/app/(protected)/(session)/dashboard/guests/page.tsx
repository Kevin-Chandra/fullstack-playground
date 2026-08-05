"use client"

import { FORM_DEFAULT_VALIDATION_MODE } from "@/src/lib/constants/form";
import { BASE_PAGINATION_PAGE, MAX_PAGE_BUTTONS } from "@/src/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/src/lib/constants/search";
import { GUEST_FORM_DEFAULT_VALUES } from "@/src/lib/data/emptyObject";
import { useGuestList } from "@/src/lib/hooks/guest/useGuestList";
import { useGuestPanel } from "@/src/lib/hooks/guest/useGuestPanel";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import { CreateGuestPayload } from "@/src/lib/types/Guest";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultDialog from "@/src/ui/components/dialog/DefaultDialog";
import ErrorState from "@/src/ui/components/error/ErrorState";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import SidePanel from "@/src/ui/components/layout/SidePanel";
import ListCard from "@/src/ui/components/list/ListCard";
import PaginationBar from "@/src/ui/components/pagination/PaginationBar";
import GuestListEmpty from "@/src/ui/features/guests/GuestListEmpty";
import GuestListRow from "@/src/ui/features/guests/GuestListRow";
import GuestListSkeleton from "@/src/ui/features/guests/GuestListSkeleton";
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

export default function GuestsPage() {

  const [page, setPage] = useState(BASE_PAGINATION_PAGE);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.trim() || undefined;

  const {
    loading: loadingGuestList,
    result: fetchGuestResult,
    fetch: fetchGuestList
  } = useGuestList(page, search);

  const formMethods = useForm<CreateGuestPayload>({
    defaultValues: GUEST_FORM_DEFAULT_VALUES,
    mode: FORM_DEFAULT_VALIDATION_MODE,
  });

  const { isDirty: formDirty } = formMethods.formState;

  //#region Panels

  const {
    panel,
    selectedGuestId,
    navigate,
    isConfirmingNavigation,
    confirmPendingNavigation,
    cancelPendingNavigation,
  } = useGuestPanel({
    isFormDirty: formDirty,
    isCreatingGuest: false, //createGuestLoading,
    isEditingGuest: false,// editGuestLoading,
    isDeletingGuest: false,//isDeletingGuest,
    onDiscardForm: () => formMethods.reset(GUEST_FORM_DEFAULT_VALUES),
  });
  const panelOpen = panel.mode !== "closed";

  //#endregion

  //#region Handlers

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

  function handleGuestSelected(guestId: string) {
    navigate({ mode: "view", guestId });
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchInput(event.target.value);
  }

  //#endregion

  //#region Render contents.

  function renderListContent() {
    if (loadingGuestList) {
      return (
        <GuestListSkeleton />
      );
    }

    if (!fetchGuestResult) {
      return;
    }

    if (!fetchGuestResult.success) {
      return (
        <ListCard
          content={
            <div className={centered}>
              <ErrorState
                error={fetchGuestResult.error}
                onErrorActionClick={(action) => handleErrorAction(action, fetchGuestList)} />
            </div>
          }
          footer={undefined}
        />
      );
    }

    const { data: guests } = fetchGuestResult.data
    if (guests.length === 0)
      return <GuestListEmpty variant={search ? "search" : "default"} />;
    return (
      <ul className="divide-y divide-edge">
        {guests.map((guest) => (
          <GuestListRow
            key={guest.id}
            guest={guest}
            // selected={user.id === selectedUserId}
            onSelect={() => handleGuestSelected(guest.id)}
          />
        ))}
      </ul>
    );
  }

  function renderListFooter() {
    if (!fetchGuestResult?.success) {
      return undefined;
    }

    const { meta } = fetchGuestResult.data

    return <PaginationBar
      currentPage={meta.currentPage}
      totalPages={meta.totalPages}
      totalItems={meta.totalItems}
      itemsPerPage={meta.itemsPerPage}
      maxPageNumber={MAX_PAGE_BUTTONS}
      onPageChange={setPage}
    />
  }

  function renderSidePanel() {
    switch (panel.mode) {
      case "view":
        return null
      case "closed":
        return null;
    }
  }

  //#endregion

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col flex-2 gap-2">
          <h1>Guests</h1>
          <p>Everyone you've invited, and how they're coming.</p>
        </div>
        <div className="flex flex-1 gap-6 justify-end">
          <DefaultInput
            className="flex-1"
            fullWidth
            placeholder="Search name..."
            leftIcon={<MdSearch />}
            onChange={handleSearchChange}
          />
          <DefaultButton
            icon={<MdAdd />}
            className="flex-none"
            label="Add user"

          />
        </div>
      </div>
      <div className={`${workspace} ${panelOpen ? workspaceState.open : workspaceState.closed}`}>
        <div className={`${listColumn} ${panelOpen ? listColumnState.open : listColumnState.closed}`}>
          <ListCard
            content={renderListContent()}
            footer={renderListFooter()}
          />
          {/* {renderLeftPanel()} */}
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