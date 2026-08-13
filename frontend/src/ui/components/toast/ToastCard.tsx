import Spinner from "../spinner/Spinner";
import { TOAST_VARIANTS, ToastVariant } from "./toast";

type ToastCardProps = {
  variant: ToastVariant;
  message: string;
  subline?: string;
};

const iconWell =
  "grid size-7.5 shrink-0 place-items-center rounded-lg [&_svg]:size-4";

export default function ToastCard({
  variant,
  message,
  subline,
}: ToastCardProps) {
  const { icon: Icon, well } = TOAST_VARIANTS[variant];

  return (
    <div className="flex items-center gap-3">
      <span className={`${iconWell} ${well}`}>
        {variant === "loading" ? <Spinner size="sm" /> : <Icon />}
      </span>
      <div className="flex min-w-0 flex-1 justify-start flex-col gap-0.5">
        <p className="text-body-sm text-toast-message">{message}</p>
        {subline && <p className="text-xs text-toast-muted">{subline}</p>}
      </div>
    </div>
  );
}
