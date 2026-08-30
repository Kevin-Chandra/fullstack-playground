"use client";

import {
  BASE_PAGINATION_PAGE,
  MAX_PAGE_BUTTONS,
} from "@/src/lib/constants/pagination";
import { Routes } from "@/src/lib/constants/routes";
import { usePagePublicationRollback } from "@/src/lib/hooks/pages/usePagePublicationRollback";
import { usePagePublications } from "@/src/lib/hooks/pages/usePagePublications";
import { PagePublicationItem } from "@/src/lib/types/DynamicPage";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import DefaultLinkButton from "@/src/ui/components/buttons/DefaultLinkButton";
import DefaultDialog from "@/src/ui/components/dialog/DefaultDialog";
import ErrorState from "@/src/ui/components/error/ErrorState";
import PaginationBar from "@/src/ui/components/pagination/PaginationBar";
import { toast } from "@/src/ui/components/toast/toast";
import PublicationListEmpty from "@/src/ui/features/page-publication/PublicationListEmpty";
import PublicationListRow from "@/src/ui/features/page-publication/PublicationListRow";
import PublicationListSkeleton from "@/src/ui/features/page-publication/PublicationListSkeleton";
import PublicationLiveCard from "@/src/ui/features/page-publication/PublicationLiveCard";
import { use, useState } from "react";
import { MdChevronLeft, MdRefresh, MdRestore } from "react-icons/md";

const header = "flex items-center gap-lg mb-8";
const headerAction = "ml-auto";
const sections = "flex flex-col gap-2xl";
const section = "flex flex-col gap-lg";
const sectionLabel = "font-mono text-label uppercase text-muted";
const sectionLabelCount = "ml-sm tabular-nums text-accent";
const rows = "flex flex-col gap-lg";
const centered = "flex flex-1 items-center justify-center";
const paginationBar = "mt-xl";

type PagePublicationsPageProps = {
  params: Promise<{ slug: string }>;
};

export default function PagePublicationsPage({
  params,
}: PagePublicationsPageProps) {
  const { slug } = use(params);
  const [page, setPage] = useState(BASE_PAGINATION_PAGE);

  const [restoreTarget, setRestoreTarget] = useState<PagePublicationItem>();

  const { loading, result, fetch } = usePagePublications(slug, page);
  const { loading: restoring, rollback } = usePagePublicationRollback(slug);

  // Single handler for every ErrorState action.
  function handleErrorAction(action?: ErrorAction) {
    switch (action) {
      case ErrorAction.RETURN_TO_MAIN:
        setPage(BASE_PAGINATION_PAGE);
        break;

      // ErrorState labels an undefined action as "Try again"
      case ErrorAction.TRY_AGAIN:
      default:
        fetch();
        break;
    }
  }

  // TODO: wire to GET /page/:slug (live view) once the public page exists.
  function handleViewLive() {}

  // TODO: wire to GET /page/:slug/publication-preview/:id.
  function handlePreview() {}

  function handleCloseRestoreDialog() {
    if (restoring) return;

    setRestoreTarget(undefined);
  }

  async function handleRestore() {
    if (!restoreTarget) return;

    const rollbackResult = await rollback(restoreTarget.id);

    if (!rollbackResult.success) {
      toast.error("Error restoring publication", {
        subline: rollbackResult.error.error,
      });
      return;
    }

    const version = restoreTarget.version;
    setRestoreTarget(undefined);
    toast.success(`v${version} restored as a new publication`);

    // Rollback appends a new publication, so the list starts over at page one.
    returnToFirstPage();
  }

  function returnToFirstPage() {
    if (page === BASE_PAGINATION_PAGE) {
      fetch();
    } else {
      setPage(BASE_PAGINATION_PAGE);
    }
  }

  function renderLiveSection(live: PagePublicationItem) {
    return (
      <div className={section}>
        <span className={sectionLabel}>Live now</span>
        <PublicationLiveCard publication={live} onViewLive={handleViewLive} />
      </div>
    );
  }

  function renderHistorySection(
    history: PagePublicationItem[],
    historyCount: number,
  ) {
    if (history.length === 0) return null;

    return (
      <div className={section}>
        <span className={sectionLabel}>
          History
          <span className={sectionLabelCount}>{historyCount}</span>
        </span>
        <ul className={rows}>
          {history.map((publication) => (
            <PublicationListRow
              key={publication.id}
              publication={publication}
              onPreview={handlePreview}
              onRestore={() => setRestoreTarget(publication)}
            />
          ))}
        </ul>
      </div>
    );
  }

  function renderContent() {
    if (loading || !result)
      return <PublicationListSkeleton />;

    if (!result.success)
      return (
        <div className={centered}>
          <ErrorState
            error={result.error}
            onErrorActionClick={handleErrorAction}
          />
        </div>
      );

    const { data: publications, meta } = result.data;

    if (meta.totalItems === 0)
      return <PublicationListEmpty />;

    const live = publications.find((publication) => publication.isLive);
    const history = publications.filter((publication) => !publication.isLive);

    return (
      <>
        <div className={sections}>
          {live && renderLiveSection(live)}
          {renderHistorySection(history, meta.totalItems - 1)}
        </div>
        {meta.totalPages > 1 && (
          <div className={paginationBar}>
            <PaginationBar
              currentPage={meta.currentPage}
              totalPages={meta.totalPages}
              totalItems={meta.totalItems}
              itemsPerPage={meta.itemsPerPage}
              maxPageNumber={MAX_PAGE_BUTTONS}
              onPageChange={setPage}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={header}>
        <DefaultLinkButton
          href={Routes.DASHBOARD_PAGES}
          variant="secondary"
          size="md"
          icon={MdChevronLeft}
          aria-label="Back to pages"
        />
        <h1>Publications</h1>
        <DefaultBadge label={`/${slug}`} variant="warning" size="lg" />
        <DefaultButton
          className={headerAction}
          label="Refresh"
          icon={MdRefresh}
          variant="secondary"
          size="md"
          loading={loading}
          onClick={fetch}
        />
      </div>
      {renderContent()}
      <DefaultDialog
        open={restoreTarget !== undefined}
        onClose={handleCloseRestoreDialog}
        icon={MdRestore}
        title={`Restore v${restoreTarget?.version}?`}
        primaryButtonLabel="Restore"
        secondaryButtonLabel="Cancel"
        onPrimaryClick={handleRestore}
        onSecondaryClick={handleCloseRestoreDialog}
        loading={restoring}
      >
        This republishes the version as a new publication and makes it live
        right away. Nothing is removed from the history, and your draft is left
        untouched.
      </DefaultDialog>
    </>
  );
}
