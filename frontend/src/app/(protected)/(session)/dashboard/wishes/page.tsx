"use client";

import { BASE_PAGINATION_PAGE, PAGINATION_LIMIT } from "@/src/lib/constants/pagination";
import { SEARCH_DEBOUNCE_MS } from "@/src/lib/constants/search";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useInfiniteList } from "@/src/lib/hooks/useInfiniteList";
import { useWishDelete } from "@/src/lib/hooks/wish/useWishDelete";
import { useWishList } from "@/src/lib/hooks/wish/useWishList";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import { GetWishParams, Wish } from "@/src/lib/types/Wish";
import { formatFullDateRsvp } from "@/src/lib/utils/dateTimeFormatter";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import ScrollToTopButton from "@/src/ui/components/buttons/ScrollToTopButton";
import BaseDialog from "@/src/ui/components/dialog/BaseDialog";
import ErrorState from "@/src/ui/components/error/ErrorState";
import DefaultInput from "@/src/ui/components/input/DefaultInput";
import Spinner from "@/src/ui/components/spinner/Spinner";
import { toast } from "@/src/ui/components/toast/toast";
import WishListEmpty from "@/src/ui/features/wishes/WishListEmpty";
import WishMasonryGrid from "@/src/ui/features/wishes/WishMasonryGrid";
import { ChangeEvent, useMemo, useState } from "react";
import { MdClose, MdEdit, MdFormatQuote, MdOutlineDelete, MdRefresh, MdSearch } from "react-icons/md";

const contentContainer = "flex min-h-0 flex-1 flex-col pt-xl";
const centered = "flex flex-1 items-center justify-center";

const wishDetailsContainer = "flex flex-col gap-xl"
const wishHeaderLabel = "font-mono text-muted uppercase"
const message = "text-body-lg text-ink";
const quote = "flex flex-col items-start gap-md";
const quoteMarkOpen = "rotate-180 self-start text-accent/40";
const quoteMarkClose = "self-end text-accent/40";
const footer = "flex gap-xs items-center justify-between";
const footerLeft = "flex flex-col gap-sm items-start";
const guestName = "text-h4 text-ink";
const guestMeta = "flex gap-xs text-label text-muted";

const QUOTE_SIZE = 20;

export default function WishesPage() {
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const search = debouncedSearch.trim() || undefined;

  const [wishDetails, setWishDetails] = useState<Wish>()
  const [deleteWishId, setDeleteWishId] = useState<string>()

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

  const {
    loading: isWishDeleting,
    remove: deleteWish
  } = useWishDelete()

  async function handleDeleteWish() {
    if (!deleteWishId) {
      return
    }

    const result = await deleteWish(deleteWishId);

    if (!result.success) {
      toast.error("Error deleting wish", {
        subline: result.error.error,
      });
      return;
    }

    setWishDetails(undefined)
    setDeleteWishId(undefined)
    toast.success("Wish successfully deleted");
    loadFirstPage()
  }

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

  function handleWishClicked(wish: Wish) {
    setWishDetails(wish)
  }

  function handleWishDetailDialogClose() {
    setDeleteWishId(undefined)
    setWishDetails(undefined)
  }

  function renderWishDetailsFooterContent(wishDetails: Wish) {
    if (deleteWishId === wishDetails.id) {
      return (
        <>
          <div className="flex gap-lg justify-between">
            <div className="flex flex-col gap-sm">
              <h3>Delete this wish?</h3>
              <span className="text-ink text-h5">Are you sure you want to delete this wish? This action is IRREVERSIBLE</span>
            </div>
            <div className="flex gap-md items-center justify-center">
              <DefaultButton
                variant="text"
                label="Cancel"
                disabled={isWishDeleting}
                onClick={() => setDeleteWishId(undefined)}
              />
              <DefaultButton
                variant="danger"
                label="Delete"
                loading={isWishDeleting}
                onClick={handleDeleteWish}
              />
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className={footer}>
          <div className={footerLeft}>
            <span className={guestName}>{wishDetails.guest.name}</span>
            <div className={guestMeta}>
              <MdEdit />
              {formatFullDateRsvp(wishDetails.createdAt)}
            </div>
          </div>
          <DefaultButton
            label="Delete"
            variant="danger"
            icon={MdOutlineDelete}
            onClick={() => setDeleteWishId(wishDetails.id)}
          />
        </div>
      )
    }
  }

  function renderWishDetailsContent() {
    if (wishDetails) {
      return (
        <div className="relative p-2xl">
          <span className="absolute top-5 right-5">
            <DefaultButton
              variant="ghost"
              size="md"
              icon={MdClose}
              aria-label="Close dialog"
              disabled={isWishDeleting}
              onClick={handleWishDetailDialogClose}
            />
          </span>
          <div className={wishDetailsContainer}>
            <span className={wishHeaderLabel}>A wish for you</span>
            <div className={quote}>
              <MdFormatQuote size={QUOTE_SIZE} className={quoteMarkOpen} />
              <p className={message}>{wishDetails.message}</p>
              <MdFormatQuote size={QUOTE_SIZE} className={quoteMarkClose} />
            </div>
            <hr />

            {renderWishDetailsFooterContent(wishDetails)}
          </div>
        </div>
      )
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
        onWishClick={handleWishClicked}
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

      {/* Wish details dialog */}
      <BaseDialog
        open={wishDetails !== undefined}
        onClose={handleWishDetailDialogClose}
        dismissable={!isWishDeleting}
        size="lg">
        {renderWishDetailsContent()}
      </BaseDialog>
    </>
  );
}
