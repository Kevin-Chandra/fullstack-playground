import { ErrorAction, ErrorEntity } from "@/src/lib/types/ErrorEntity";
import { Guest } from "@/src/lib/types/Guest";
import { Result } from "@/src/lib/types/result";
import ErrorState from "../../components/error/ErrorState";
import GuestDetailsContent from "./GuestDetailsContent";

const centered = "flex flex-1 items-center justify-center";

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
    //return loading skeleton
    return;
  }

  if (!guestFetchResult) {
    return;
  }

  if (!guestFetchResult.success) {
    return <div className={centered}>
      <ErrorState
        error={guestFetchResult.error}
        onErrorActionClick={onErrorAction}
      />
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