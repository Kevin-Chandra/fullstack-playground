import { Routes } from "@/src/lib/constants/routes";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultLinkButton from "@/src/ui/components/buttons/DefaultLinkButton";
import { use } from "react";
import { MdChevronLeft } from "react-icons/md";

const header = "flex items-center gap-lg mb-8";

type PageConfigurationsPageProps = {
  params: Promise<{ slug: string }>;
};

export default function PageConfigurationsPage({
  params,
}: PageConfigurationsPageProps) {
  const { slug } = use(params);
  return (
    <>
      <div className={header}>
        <DefaultLinkButton
          href={Routes.dashboardPages(slug)}
          variant="secondary"
          size="md"
          icon={MdChevronLeft}
          aria-label="Back to pages"
        />
        <h1>Page Configurations</h1>
        <DefaultBadge label={`/${slug}`} variant="warning" size="lg" />
      </div>
      {/* {renderContent()} */}
      {/* <DefaultDialog
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
      </DefaultDialog> */}
    </>
  );
}