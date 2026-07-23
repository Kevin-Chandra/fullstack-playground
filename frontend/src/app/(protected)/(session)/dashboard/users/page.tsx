"use client";

import {
  BASE_PAGINATION_PAGE,
  MAX_PAGE_BUTTONS,
} from "@/src/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/src/lib/constants/search";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useUserList } from "@/src/lib/hooks/user/useUserList";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import ErrorState from "@/src/ui/components/error/ErrorState";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import SidePanel from "@/src/ui/components/layout/SidePanel";
import ListCard from "@/src/ui/components/list/ListCard";
import PaginationBar from "@/src/ui/components/pagination/PaginationBar";
import UserDetailsContent from "@/src/ui/features/users/UserDetailsContent";
import UserListEmpty from "@/src/ui/features/users/UserListEmpty";
import UserListRow from "@/src/ui/features/users/UserListRow";
import UserListSkeleton from "@/src/ui/features/users/UserListSkeleton";
import { ChangeEvent, useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";

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

export default function UsersPage() {
  const [page, setPage] = useState(BASE_PAGINATION_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.trim() || undefined;

  const { users, meta, loading, error, refetch } = useUserList(page, search);

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(BASE_PAGINATION_PAGE);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchInput(event.target.value);
  }

  function renderContent() {
    if (loading) return <UserListSkeleton />;
    if (error)
      return (
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            error={error}
            onErrorActionClick={(action?: ErrorAction) => {
              switch (action) {
                case ErrorAction.RETURN_TO_MAIN:
                  setPage(BASE_PAGINATION_PAGE);
                  break;
                default:
                  refetch();
                  break;
              }
            }}
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
            onSelect={(selected) => setSelectedUserId(selected.id)}
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
            icon={<MdAdd />}
            className="flex-none"
            label="Add user"
          />
        </div>
      </div>
      <div
        className={`${workspace} ${
          selectedUserId ? workspaceState.open : workspaceState.closed
        }`}
      >
        <div
          className={`${listColumn} ${
            selectedUserId ? listColumnState.open : listColumnState.closed
          }`}
        >
          <ListCard
            content={renderContent()}
            footer={
              !loading &&
              !error &&
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
        {selectedUserId && (
          <div className={detailColumn}>
            <SidePanel
              content={
                <UserDetailsContent
                  key={selectedUserId}
                  userId={selectedUserId}
                  onClose={() => setSelectedUserId(undefined)}
                />
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
