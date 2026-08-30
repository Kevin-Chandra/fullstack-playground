import { ErrorAction, ErrorEntity } from "@/src/lib/types/ErrorEntity";
import { Guest } from "@/src/lib/types/Guest";
import { Result } from "@/src/lib/types/result";
import { MdClose } from "react-icons/md";
import DefaultButton from "../../components/buttons/DefaultButton";
import ErrorState from "../../components/error/ErrorState";
import GuestDetailsContent from "./GuestDetailsContent";
import GuestDetailsSkeleton from "./GuestDetailsSkeleton";

const centered = "flex flex-1 items-center justify-center";
const panelError = "flex min-h-0 flex-1 flex-col gap-2xl";
const panelErrorHeader = "flex shrink-0 items-center justify-end";

type GuestDetailsContainerProps = {
  isLoading: boolean
  guestFetchResult?: Result<Guest, ErrorEntity>
  onDelete: () => void;
  onClose: () => void;
  onEdit: () => void;
  onErrorAction: (action?: ErrorAction) => void
};

export default function GuestDetailsContainer({
  isLoading,
  guestFetchResult,
  onDelete,
  onClose,
  onEdit,
  onErrorAction
}: GuestDetailsContainerProps) {

  if (isLoading) {
    return <GuestDetailsSkeleton />;
  }

  if (!guestFetchResult) {
    return;
  }

  if (!guestFetchResult.success) {
    return <div className={panelError}>
      <div className={panelErrorHeader}>
        <DefaultButton
          variant="ghost"
          size="md"
          icon={MdClose}
          aria-label="Close details"
          onClick={onClose}
        />
      </div>
      <div className={centered}>
        <ErrorState
          error={guestFetchResult.error}
          onErrorActionClick={onErrorAction}
        />
      </div>
    </div>
  }

  return (
    <GuestDetailsContent
      guest={guestFetchResult.data}
      onClose={onClose}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  )
}