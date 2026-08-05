import { MdAdd, MdOutlinePersonAdd, MdSearchOff } from "react-icons/md";
import EmptyListBase, {
  EmptyListBaseProps,
} from "../../components/base/EmptyListBase";

type Variant = "default" | "search";

type GuestListEmptyProps = {
  variant?: Variant;
  onAction?: () => void;
};

const emptyListVariants: Record<Variant, EmptyListBaseProps> = {
  default: {
    icon: MdOutlinePersonAdd,
    heading: "No guests yet",
    message:
      "Start building your guest list — add family, friends and their plus-ones.",
    action: {
      label: "Add your first guest",
      icon: MdAdd,
    },
  },
  search: {
    icon: MdSearchOff,
    heading: "No matches found",
    message:
      "No one matches your current search or filter. Try different keywords or clear the filters.",
  },
};

export default function GuestListEmpty({
  variant = "default",
  onAction,
}: GuestListEmptyProps) {
  return <EmptyListBase {...emptyListVariants[variant]} onAction={onAction} />;
}
