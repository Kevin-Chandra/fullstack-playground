import { ReactNode } from "react";
import { MdAdd, MdOutlinePersonAdd, MdSearchOff } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";

type Variant = "default" | "search";

type EmptyState = {
  icon: ReactNode;
  heading: string;
  message: string;
  action?: ReactNode;
};

const ICON_SIZE = 36;

const variants: Record<Variant, EmptyState> = {
  default: {
    icon: <MdOutlinePersonAdd size={ICON_SIZE} />,
    heading: "No team members yet",
    message:
      "Invite family, planners and your wedding party to collaborate on your workspace.",
    action: (
      <DefaultButton
        className="mt-2"
        label="Add your first member"
        variant="primary"
        size="md"
        icon={<MdAdd />}
      />
    ),
  },
  search: {
    icon: <MdSearchOff size={ICON_SIZE} />,
    heading: "No members match your search",
    message:
      "Try a different name or username, or clear the search to see everyone.",
  },
};

type UserListEmptyProps = {
  variant?: Variant;
};

export default function UserListEmpty({
  variant = "default",
}: UserListEmptyProps) {
  const { icon, heading, message, action } = variants[variant];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 self-center text-center">
      {icon}
      <h2>{heading}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
