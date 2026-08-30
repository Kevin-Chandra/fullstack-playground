import { SlGlobe } from "react-icons/sl";
import EmptyListBase, {
  EmptyListBaseProps,
} from "../../components/base/EmptyListBase";

type Variant = "default";

type PublicationListEmptyProps = {
  variant?: Variant;
};

const variants: Record<Variant, EmptyListBaseProps> = {
  default: {
    icon: SlGlobe,
    heading: "No publications yet",
    message:
      "Publishing this page will create the first version here.",
  },
};

export default function PublicationListEmpty({
  variant = "default",
}: PublicationListEmptyProps) {
  return <EmptyListBase {...variants[variant]} />;
}
