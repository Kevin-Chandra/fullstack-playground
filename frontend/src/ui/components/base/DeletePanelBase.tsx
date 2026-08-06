import { IconType } from "react-icons";
import DefaultButton from "../buttons/DefaultButton";

const content =
  "flex flex-col flex-1 min-h-0 items-center justify-center gap-3 p-2xl";
const buttonRow = "flex items-center justify-center gap-4 pt-4";
const icon =
  "flex p-md shrink-0 items-center justify-center rounded-btn-lg border [&_svg]:size-10 border-error/25 bg-error/10 text-error";


type DeletePanelBaseProps = {
  icon: IconType,
  title: string;
  description: string;
  loading: boolean;
  deleteButtonLabel: string;
  onDelete: () => void;
  onCancel: () => void;
};

export default function DeletePanelBase({
  icon: Icon,
  title,
  description,
  loading,
  deleteButtonLabel = "Delete",
  onDelete,
  onCancel,
}: DeletePanelBaseProps) {
  return (
    <div className={content}>
      <span className={icon}>
        <Icon />
      </span>
      <h1>{title}</h1>
      <p className="text-center">{description}</p>
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
          label={deleteButtonLabel}
          variant="danger"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}