"use client";

import { useInfiniteScroll } from "@/src/lib/hooks/useInfiniteScroll";
import { ErrorEntity } from "@/src/lib/types/ErrorEntity";
import { Wish } from "@/src/lib/types/Wish";
import ErrorBanner from "../../components/error/ErrorBanner";
import MasonryLayout from "../../components/layout/MasonryGrid";
import Spinner from "../../components/spinner/Spinner";
import WishItemListCard from "./WishItemListCard";

const footer = "flex flex-col items-center gap-lg py-xl";
const footerSpinner = "flex items-center gap-md text-muted";
const footerText = "text-caption text-muted";
const footerBanner = "w-full max-w-lg";

type WishMasonryGridProps = {
  wishes: Wish[];
  hasNextPage: boolean;
  loadingNextPage: boolean;
  nextPageError?: ErrorEntity;
  onLoadNextPage: () => void;
  onRetryNextPage: () => void;
};

export default function WishMasonryGrid({
  wishes,
  hasNextPage,
  loadingNextPage,
  nextPageError,
  onLoadNextPage,
  onRetryNextPage,
}: WishMasonryGridProps) {
  const sentinelRef = useInfiniteScroll(onLoadNextPage, {
    enabled: hasNextPage && !loadingNextPage && !nextPageError,
  });

  function renderFooterContent() {
    if (nextPageError) {
      return (
        <ErrorBanner
          className={footerBanner}
          message={nextPageError.error}
          onRetry={onRetryNextPage}
          retryLabel="Retry"
        />
      );
    }

    if (loadingNextPage) {
      return (
        <div className={footerSpinner}>
          <Spinner size="sm" ariaLabel="Loading more wishes" />
          <span className={footerText}>Loading more wishes…</span>
        </div>
      );
    }

    if (!hasNextPage) {
      return <span className={footerText}>That's every wish so far.</span>;
    }
  }

  return (
    <>
      <MasonryLayout
        items={wishes}
        config={{
          columns: [1, 2, 3],
          gap: [16, 16, 16],
          media: [640, 1024, 1280],
          useBalancedLayout: true,
        }}
        render={(wish) => (
          <WishItemListCard wish={wish} />
        )} />

      <div className={footer}>
        <div ref={sentinelRef} aria-hidden />
        {renderFooterContent()}
      </div>
    </>
  );
}
