import { MdAdd, MdOutlinePersonAdd, MdSearchOff } from "react-icons/md";
import EmptyListBase, {
  EmptyListBaseProps,
} from "../../components/base/EmptyListBase";

type Variant = "default" | "search";

type UserListEmptyProps = {
  variant?: Variant;
  onAction?: () => void;
};

const variants: Record<Variant, EmptyListBaseProps> = {
  default: {
    icon: MdOutlinePersonAdd,
    heading: "No team members yet",
    message:
      "Invite family, planners and your wedding party to collaborate on your workspace.",
    action: {
      label: "Add your first member",
      icon: MdAdd,
    },
  },
  search: {
    icon: MdSearchOff,
    heading: "No members match your search",
    message:
      "Try a different name or username, or clear the search to see everyone.",
  },
};

export default function UserListEmpty({
  variant = "default",
  onAction,
}: UserListEmptyProps) {
  return <EmptyListBase {...variants[variant]} onAction={onAction} />;
}
