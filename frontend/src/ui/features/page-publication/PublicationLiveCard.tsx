import { PagePublicationItem } from "@/src/lib/types/DynamicPage";
import { formatFullDateAndTime } from "@/src/lib/utils/dateTimeFormatter";
import { FiExternalLink } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import DefaultBadge from "../../components/badge/DefaultBadge";
import DefaultButton from "../../components/buttons/DefaultButton";
import IconWell from "../../components/icon/IconWell";

const card =
  "flex items-center gap-xl rounded-lg border border-badge-active/25 bg-badge-active/10 p-xl";
const identity = "flex min-w-0 flex-1 flex-col gap-xs";
const versionRow = "flex items-center gap-md";
const version = "font-mono text-h4 text-ink";
const description = "truncate text-body text-muted";
const meta = "flex shrink-0 flex-col items-end gap-xs text-right";
const publishedAt = "text-body-sm text-ink-body";
const publishedBy = "text-caption text-muted";
const actions = "flex shrink-0 items-center gap-sm";

type PublicationLiveCardProps = {
  publication: PagePublicationItem;
  onViewLive: () => void;
};

export default function PublicationLiveCard({
  publication,
  onViewLive,
}: PublicationLiveCardProps) {
  return (
    <div className={card}>
      <IconWell icon={MdCheck} tone="active" size="md" />
      <div className={identity}>
        <div className={versionRow}>
          <span className={version}>v{publication.version}</span>
          <DefaultBadge label="LIVE" variant="active" />
        </div>
        <span className={description}>{publication.description}</span>
      </div>
      <div className={meta}>
        <span className={publishedAt}>
          {formatFullDateAndTime(publication.publishedAt)}
        </span>
        <span className={publishedBy}>
          by {publication.publishedBy?.name ?? "-"}
        </span>
      </div>
      <div className={actions}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="View live"
          icon={FiExternalLink}
          onClick={onViewLive}
        />
      </div>
    </div>
  );
}
