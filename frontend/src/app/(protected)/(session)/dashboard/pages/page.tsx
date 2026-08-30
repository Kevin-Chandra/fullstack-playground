"use client"

import { usePageDetails } from "@/src/lib/hooks/pages/usePageDetails";
import { usePageList } from "@/src/lib/hooks/pages/usePageList";
import { usePagePanel } from "@/src/lib/hooks/pages/usePagePanel";
import { ErrorAction } from "@/src/lib/types/ErrorEntity";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import ErrorState from "@/src/ui/components/error/ErrorState";
import SidePanel from "@/src/ui/components/layout/SidePanel";
import ListCard from "@/src/ui/components/list/ListCard";
import PageDetailsContent from "@/src/ui/features/pages/PageDetailsContent";
import PageDetailsSkeleton from "@/src/ui/features/pages/PageDetailsSkeleton";
import PageListEmpty from "@/src/ui/features/pages/PageListEmpty";
import PageListRow from "@/src/ui/features/pages/PageListRow";
import PageListSkeleton from "@/src/ui/features/pages/PageListSkeleton";
import { MdClose } from "react-icons/md";

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
const panelError = "flex min-h-0 flex-1 flex-col gap-2xl";
const panelErrorHeader = "flex shrink-0 items-center justify-end";
const listHeader = "font-mono text-label uppercase text-muted";
const listHeaderCount = "ml-sm tabular-nums text-accent";

export default function PagesPage() {


  function handlePageSelected(pageSlug: string) {
    navigate({ mode: "view", pageSlug: pageSlug });
  }

  const {
    pages,
    loading,
    error: errorFetchPage,
    refetch,
  } = usePageList();

  const {
    panel,
    selectedPageSlug,
    navigate,
  } = usePagePanel();
  const panelOpen = panel.mode !== "closed";

  const {
    result: pageDetailResult,
    loading: loadingPageDetails,
    refetch: refetchPageDetails,
  } = usePageDetails(selectedPageSlug);

  // Single handler for every ErrorState action.
  function handleErrorAction(
    retry: () => void,
    action?: ErrorAction,
  ) {
    switch (action) {
      case ErrorAction.RETURN_TO_MAIN:
        navigate({ mode: "closed" });
        break;

      // ErrorState labels an undefined action as "Try again"
      case ErrorAction.TRY_AGAIN:
      default:
        retry();
        break;
    }
  }

  function handleClosePanel() {
    navigate({ mode: "closed" });
  }

  function renderContent() {
    if (loading) return <PageListSkeleton />;
    if (errorFetchPage)
      return (
        <div className={centered}>
          <ErrorState
            error={errorFetchPage}
            onErrorActionClick={(action) => handleErrorAction(refetch, action)}
          />
        </div>
      );
    if (pages.length === 0)
      return <PageListEmpty variant="default" />;
    return (
      <ul className="divide-y divide-edge">
        {pages.map((page) => (
          <PageListRow
            key={page.id}
            page={page}
            selected={page.slug === selectedPageSlug}
            onSelect={() => handlePageSelected(page.slug)}
          />
        ))}
      </ul>
    );
  }

  function renderListHeader() {
    if (loading || errorFetchPage || pages.length === 0) return null;
    return (
      <span className={listHeader}>
        All pages
        <span className={listHeaderCount}>{pages.length}</span>
      </span>
    );
  }

  function renderSidePanel() {
    switch (panel.mode) {
      case "view":
        if (loadingPageDetails || !pageDetailResult) {
          return <PageDetailsSkeleton />
        }

        if (!pageDetailResult.success) {
          return (
            <div className={panelError}>
              <div className={panelErrorHeader}>
                <DefaultButton
                  variant="ghost"
                  size="md"
                  icon={MdClose}
                  aria-label="Close details"
                  onClick={handleClosePanel}
                />
              </div>
              <div className={centered}>
                <ErrorState
                  error={pageDetailResult.error}
                  onErrorActionClick={(action) =>
                    handleErrorAction(refetchPageDetails, action)
                  }
                />
              </div>
            </div>
          );
        }

        return (
          <PageDetailsContent
            pageDetails={pageDetailResult.data}
            onClose={handleClosePanel}
          />
        );
      case "closed":
        return null;
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col flex-2 gap-2">
          <h1>Pages</h1>
          <p>Content · choose a page to configure</p>
        </div>
      </div>
      <div className={`${workspace} ${panelOpen ? workspaceState.open : workspaceState.closed}`}>
        <div className={`${listColumn} ${panelOpen ? listColumnState.open : listColumnState.closed}`}>
          <ListCard
            header={renderListHeader()}
            content={renderContent()}
          />
        </div>
        {panelOpen && (
          <div className={detailColumn}>
            <SidePanel content={renderSidePanel()} />
          </div>
        )}
      </div>
      {/* <DefaultDialog
        open={isConfirmingNavigation}
        onClose={cancelPendingNavigation}
        icon={MdOutlineWarningAmber}
        title="Discard changes?"
        primaryButtonLabel="Discard"
        secondaryButtonLabel="Keep editing"
        onPrimaryClick={confirmPendingNavigation}
        onSecondaryClick={cancelPendingNavigation}
      >
        The details you filled in have not been saved yet. Closing now will
        discard them.
      </DefaultDialog> */}
    </>
  );
}