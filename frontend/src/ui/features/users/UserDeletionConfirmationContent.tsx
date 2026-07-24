import { User } from "@/src/lib/types/User";
import { MdOutlineDeleteForever } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";

const content =
  "flex flex-col flex-1 min-h-0 items-center justify-center gap-3 p-2xl";
const buttonRow = "flex items-center justify-center gap-4 pt-4";
const icon =
  "flex size-15 shrink-0 items-center justify-center rounded-btn-lg border [&_svg]:size-10 border-error/25 bg-error/10 text-error";

type UserDeletionConfirmationContentProps = {
  user: User;
  loading: boolean;
  onDelete: () => void;
  onCancel: () => void;
};

export default function UserDeletionConfirmationContent({
  user,
  loading,
  onDelete,
  onCancel,
}: UserDeletionConfirmationContentProps) {
  return (
    <div className={content}>
      <span className={icon}>
        <MdOutlineDeleteForever />
      </span>
      <h1>Remove {user.name}?</h1>
      <p className="text-center">
        They'll lose access to this wedding workspace immediately. This action
        is irreversible
      </p>
      <div className={buttonRow}>
        <DefaultButton
          label="Cancel"
          disabled={loading}
          variant="secondary"
          onClick={onCancel}
        />
        <DefaultButton
          loading={loading}
          disabled={loading}
          label="Remove from workspace"
          variant="danger"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
