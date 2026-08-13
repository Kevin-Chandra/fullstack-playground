"use client";

import { BASE_PAGINATION_PAGE, PAGINATION_LIMIT } from "@/src/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/src/lib/constants/search";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useInfiniteList } from "@/src/lib/hooks/useInfiniteList";
import { useWishList } from "@/src/lib/hooks/wish/useWishList";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import { GetWishParams, Wish } from "@/src/lib/types/Wish";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import ScrollToTopButton from "@/src/ui/components/buttons/ScrollToTopButton";
import ErrorState from "@/src/ui/components/error/ErrorState";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import Spinner from "@/src/ui/components/spinner/Spinner";
import WishListEmpty from "@/src/ui/features/wishes/WishListEmpty";
import WishMasonryGrid from "@/src/ui/features/wishes/WishMasonryGrid";
import { ChangeEvent, useMemo, useState } from "react";
import { MdRefresh, MdSearch } from "react-icons/md";

const contentContainer = "flex min-h-0 flex-1 flex-col pt-xl";
const centered = "flex flex-1 items-center justify-center";

export default function WishesPage() {
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.trim() || undefined;

  const params = useMemo<GetWishParams>(
    () => ({ page: BASE_PAGINATION_PAGE, limit: PAGINATION_LIMIT, search }),
    [search],
  );

  const {
    items: wishes,
    loadingFirstPage,
    loadingNextPage,
    firstPageError,
    nextPageError,
    hasNextPage,
    loadNextPage,
    loadFirstPage,
  } = useInfiniteList<Wish, GetWishParams>(useWishList, params)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchInput(event.target.value);
  }

  function handleNextPageRetry() {
    if (nextPageError?.defaultAction === ErrorAction.RETURN_TO_MAIN) {
      loadFirstPage();
    } else {
      loadNextPage();
    }
  }

  function renderContent() {
    if (loadingFirstPage) {
      return (
        <div className={centered}>
          <Spinner size="lg" ariaLabel="Loading wishes" className="text-muted" />
        </div>
      );
    }

    if (firstPageError) {
      return (
        <div className={centered}>
          <ErrorState
            error={firstPageError}
            onErrorActionClick={loadFirstPage}
          />
        </div>
      );
    }

    if (wishes.length === 0) {
      return <WishListEmpty variant={search ? "search" : "default"} />;
    }

    return (
      <WishMasonryGrid
        wishes={wishes}
        hasNextPage={hasNextPage}
        loadingNextPage={loadingNextPage}
        nextPageError={nextPageError}
        onLoadNextPage={loadNextPage}
        onRetryNextPage={handleNextPageRetry}
      />
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col flex-2 gap-2">
          <h1>Wishes</h1>
          <p>Notes, photos and voice notes your guests left as they RSVP'd.</p>
        </div>
      </div>
      <div className="flex gap-6 justify-end">
        <DefaultInput
          className="flex-1"
          fullWidth
          placeholder="Search by guest name..."
          leftIcon={MdSearch}
          value={searchInput}
          onChange={handleSearchChange}
        />
        <DefaultButton
          label="Refresh"
          icon={MdRefresh}
          onClick={loadFirstPage}
          variant="secondary"
          size="md"
        />
      </div>
      <div className={contentContainer}>{renderContent()}</div>
      <ScrollToTopButton />
    </>
  );
}
