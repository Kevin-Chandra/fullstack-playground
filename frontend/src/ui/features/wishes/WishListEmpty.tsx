import { MdOutlineFavoriteBorder, MdSearchOff } from "react-icons/md";
import EmptyListBase, {
  EmptyListBaseProps,
} from "../../components/base/EmptyListBase";

type Variant = "default" | "search";

const emptyListVariants: Record<Variant, EmptyListBaseProps> = {
  default: {
    icon: MdOutlineFavoriteBorder,
    heading: "No wishes yet",
    message:
      "Notes, photos and voice notes your guests leave as they RSVP will show up here.",
  },
  search: {
    icon: MdSearchOff,
    heading: "No matches found",
    message:
      "No guest matches your current search. Try different keywords or clear the search.",
  },
};

type WishListEmptyProps = {
  variant?: Variant;
};

export default function WishListEmpty({
  variant = "default",
}: WishListEmptyProps) {
  return <EmptyListBase {...emptyListVariants[variant]} />;
}
