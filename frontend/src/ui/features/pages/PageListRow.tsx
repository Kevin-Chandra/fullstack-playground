import { DynamicPage } from "@/src/lib/types/DynamicPage";
import { FiFileText } from "react-icons/fi";
import DefaultBadge from "../../components/badge/DefaultBadge";
import IconWell from "../../components/icon/IconWell";

const row =
  "flex w-full items-center gap-lg px-xl py-lg text-left transition-colors duration-150";
const rowState = {
  default: "hover:bg-ink/4",
  selected: "bg-accent/8",
};
const identity = "min-w-0 flex-1";
const name = "block truncate text-h5 text-ink";
type PageListRowProps = {
  page: DynamicPage;
  selected?: boolean;
  onSelect: () => void;
};

export default function PageListRow({
  page,
  selected = false,
  onSelect,
}: PageListRowProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`${row} ${selected ? rowState.selected : rowState.default}`}
      >
        <IconWell size="md" icon={FiFileText} tone="warning" bordered={false} />
        <span className={identity}>
          <span className={name}>{page.name}</span>
          <DefaultBadge
            label={`/${page.slug}`}
            variant="warning"
          />
        </span>
      </button>
    </li>
  );
}
