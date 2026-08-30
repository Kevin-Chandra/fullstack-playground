import { PagePublicationItem } from "@/src/lib/types/DynamicPage";
import { formatFullDateAndTime } from "@/src/lib/utils/dateTimeFormatter";
import { FiExternalLink } from "react-icons/fi";
import { MdRestore } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";

const card =
  "flex items-center gap-xl rounded-lg border border-edge bg-raised p-lg";
const version = "w-15 shrink-0 font-mono text-h5 text-accent text-center";
const identity = "flex min-w-0 flex-1 flex-col gap-xs";
const description = "truncate text-h5 text-ink";
const publishedBy = "text-caption text-muted";
const publishedAt = "shrink-0 text-body-sm text-muted";
const actions = "flex shrink-0 items-center gap-sm";

type PublicationListRowProps = {
  publication: PagePublicationItem;
  onPreview: () => void;
  onRestore: () => void;
};

export default function PublicationListRow({
  publication,
  onPreview,
  onRestore,
}: PublicationListRowProps) {
  return (
    <li className={card}>
      <span className={version}>v{publication.version}</span>
      <div className={identity}>
        <span className={description}>{publication.description}</span>
        <span className={publishedBy}>
          by {publication.publishedBy?.name ?? "-"}
        </span>
      </div>
      <span className={publishedAt}>
        {formatFullDateAndTime(publication.publishedAt)}
      </span>
      <div className={actions}>
        <DefaultButton
          variant="secondary"
          size="md"
          label="Preview"
          icon={FiExternalLink}
          onClick={onPreview}
        />
        <DefaultButton
          variant="secondary"
          size="md"
          label="Restore"
          icon={MdRestore}
          onClick={onRestore}
        />
      </div>
    </li>
  );
}
