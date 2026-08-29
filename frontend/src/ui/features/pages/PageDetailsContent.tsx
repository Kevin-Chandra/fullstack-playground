"use client";

import { DynamicPageDetails } from "@/src/lib/types/DynamicPage";
import {
  formatFullDateAndTime
} from "@/src/lib/utils/dateTimeFormatter";
import InfoField from "@/src/ui/components/card/InfoField";
import { IoSettingsOutline } from "react-icons/io5";
import { PiPaperPlaneRight } from "react-icons/pi";
import { SlGlobe } from "react-icons/sl";
import DefaultLinkButton from "../../components/buttons/DefaultLinkButton";
import PageDetailsHeader from "./PageDetailsHeader";

const content = "flex min-h-0 flex-1 flex-col gap-2xl";
const grid = "grid grid-cols-2 gap-lg";

const notice = "flex items-center gap-lg rounded-lg bg-accent/3 border border-dashed border-accent-strong p-xl";
const noticeIcon = "mt-0.5 shrink-0 text-accent";
const noticeCopy = "flex min-w-0 flex-col gap-xs";
const noticeTitle = "text-h5 text-ink";
const noticeMessage = "text-body text-muted";

type PageDetailsContentProps = {
  pageDetails: DynamicPageDetails;
  onClose: () => void;
};

export default function PageDetailsContent({
  pageDetails,
  onClose,
}: PageDetailsContentProps) {
  return (
    <div className={content}>
      <PageDetailsHeader pageDetails={pageDetails} onClose={onClose} />
      <hr />

      {pageDetails.livePublication ? (
        <div className={grid}>
          <InfoField label="Live version" value={`v${pageDetails.livePublication.version}`} />
          <InfoField
            label="Last Published"
            value={formatFullDateAndTime(pageDetails.livePublication.publishedAt)}
          />
          <InfoField
            label="Published By"
            value={pageDetails.livePublication.publishedBy?.name ?? "-"}
            className="col-span-2"
          />
        </div>
      ) : (
        <div className={notice}>
          <PiPaperPlaneRight size={22} className={noticeIcon} />
          <div className={noticeCopy}>
            <span className={noticeTitle}>Not published yet</span>
            <span className={noticeMessage}>
              Guests can't reach this page. Everything you edit stays in the
              draft until the first publish.
            </span>
          </div>
        </div>
      )}

      <hr />

      <DefaultLinkButton
        href={"#"}
        variant="primary"
        size="lg"
        label="Page configurations"
        icon={IoSettingsOutline}
      />
      <DefaultLinkButton
        href={"#"}
        variant="secondary"
        size="lg"
        label="Publications"
        icon={SlGlobe}
      />

    </div>
  );
}
