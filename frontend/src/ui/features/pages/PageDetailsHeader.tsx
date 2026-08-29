import { DynamicPageDetails } from "@/src/lib/types/DynamicPage";
import DefaultBadge from "@/src/ui/components/badge/DefaultBadge";
import DefaultButton from "@/src/ui/components/buttons/DefaultButton";
import { BsLayoutTextWindow } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import IconWell from "../../components/icon/IconWell";

const header = "flex items-center gap-xl";
const identity = "flex min-w-0 flex-1 flex-col gap-md";
const name = "truncate text-h1 text-ink";
const badges = "flex flex-wrap items-center gap-sm";
const actions = "flex shrink-0 items-center gap-sm";

type PageDetailsHeaderProps = {
  pageDetails: DynamicPageDetails;
  onClose: () => void;
};

export default function PageDetailsHeader({
  pageDetails,
  onClose,
}: PageDetailsHeaderProps) {
  return (
    <div className={header}>
      <IconWell
        icon={BsLayoutTextWindow}
        tone="warning"
        size="lg"
      />
      <div className={identity}>
        <h2 className={name}>{pageDetails.name}</h2>
        <div className={badges}>
          <DefaultBadge
            label={`/${pageDetails.slug}`}
            variant="warning"
          />
        </div>
      </div>
      <div className={actions}>
        <DefaultButton
          variant="ghost"
          size="md"
          icon={MdClose}
          aria-label="Close details"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
