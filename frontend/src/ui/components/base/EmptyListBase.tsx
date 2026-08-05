import { IconType } from "react-icons";
import DefaultButton from "../buttons/DefaultButton";

const ICON_SIZE = 36;

export type EmptyListAction = {
  label: string;
  icon?: IconType;
};

export type EmptyListBaseProps = {
  icon: IconType;
  heading: string;
  message: string;
  action?: EmptyListAction;
  onAction?: () => void;
};

export default function EmptyListBase({
  icon: Icon,
  heading,
  message,
  action,
  onAction,
}: EmptyListBaseProps) {
  function renderAction() {
    if (!action || !onAction) return null;

    const { label, icon: ActionIcon } = action;

    return (
      <DefaultButton
        className="mt-2"
        label={label}
        variant="primary"
        size="md"
        icon={ActionIcon ? <ActionIcon /> : undefined}
        onClick={onAction}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 self-center text-center">
      <Icon size={ICON_SIZE} />
      <h2>{heading}</h2>
      <p>{message}</p>
      {renderAction()}
    </div>
  );
}
