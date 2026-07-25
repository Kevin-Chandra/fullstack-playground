import { TOAST_AUTO_CLOSE_MS } from "@/src/lib/constants/toast";
import ToastCard from "@/src/ui/components/toast/ToastCard";
import { IconType } from "react-icons";
import { MdCheckCircle, MdErrorOutline, MdInfoOutline } from "react-icons/md";
import type { Id, TypeOptions } from "react-toastify";
import { toast as notify } from "react-toastify";

export type ToastVariant = "success" | "info" | "error" | "loading";

/** Options accepted when raising a toast. */
export type ToastOptions = {
  subline?: string;
  autoClose?: number | false;
  toastId?: string | number;
};

/** Fields applied when updating a live toast (e.g. loading → success). */
export type ToastUpdate = {
  variant: ToastVariant;
  message: string;
  subline?: string;
  autoClose?: number | false;
};

type ToastVariantStyle = {
  icon: IconType;
  well: string;
};

export const TOAST_VARIANTS: Record<ToastVariant, ToastVariantStyle> = {
  success: {
    icon: MdCheckCircle,
    well: "text-toast-success bg-toast-success-bg",
  },
  info: {
    icon: MdInfoOutline,
    well: "text-toast-info bg-toast-info-bg",
  },
  error: {
    icon: MdErrorOutline,
    well: "text-toast-error bg-toast-error-bg",
  },
  loading: {
    icon: MdInfoOutline, // unused — loading renders the spinner
    well: "text-toast-loading bg-toast-loading-bg",
  },
};

const toastType: Record<ToastVariant, TypeOptions> = {
  success: "success",
  info: "info",
  error: "error",
  loading: "default",
};

function resolveAutoClose(
  variant: ToastVariant,
  autoClose?: number | false,
): number | false {
  if (autoClose !== undefined) return autoClose;
  return variant === "loading" ? false : TOAST_AUTO_CLOSE_MS;
}

function renderCard(variant: ToastVariant, message: string, subline?: string) {
  return <ToastCard variant={variant} message={message} subline={subline} />;
}

function sharedConfig(variant: ToastVariant, autoClose?: number | false) {
  return {
    type: toastType[variant],
    icon: false as const,
    isLoading: variant === "loading",
    autoClose: resolveAutoClose(variant, autoClose),
    role: variant === "error" ? "alert" : "status",
  };
}

function show(
  variant: ToastVariant,
  message: string,
  options?: ToastOptions,
): Id {
  return notify(renderCard(variant, message, options?.subline), {
    ...sharedConfig(variant, options?.autoClose),
    toastId: options?.toastId,
  });
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    show("success", message, options),
  info: (message: string, options?: ToastOptions) =>
    show("info", message, options),
  error: (message: string, options?: ToastOptions) =>
    show("error", message, options),
  loading: (message: string, options?: ToastOptions) =>
    show("loading", message, options),
  update: (id: Id, patch: ToastUpdate) =>
    notify.update(id, {
      render: renderCard(patch.variant, patch.message, patch.subline),
      ...sharedConfig(patch.variant, patch.autoClose),
    }),
  dismiss: (id?: Id) => notify.dismiss(id),
};
