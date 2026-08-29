import { MdOutlineWebAsset } from "react-icons/md";
import EmptyListBase, {
  EmptyListBaseProps,
} from "../../components/base/EmptyListBase";

type Variant = "default";

type PageListEmptyProps = {
  variant?: Variant;
};

const variants: Record<Variant, EmptyListBaseProps> = {
  default: {
    icon: MdOutlineWebAsset,
    heading: "No dynamic pages yet",
    message:
      "Dynamic pages will appear here once they have been created.",
  },
};

export default function UserListEmpty({
  variant = "default",
}: PageListEmptyProps) {
  return <EmptyListBase {...variants[variant]} />;
}
