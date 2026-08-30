import {
  CustomErrorCode,
  ErrorAction,
  ErrorEntity,
} from "../types/ErrorEntity";

export const GENERIC_ERROR_TITLE: string = "Error";
export const GENERIC_ERROR_DESCRIPTION: string =
  "Something went wrong. Please try again.";
export const UNKNOWN_STATUS_CODE: number = 0;

export const SUPPORT_EMAIL: string = "support@everafter.app";

export const NOT_FOUND_ERROR = {
  code: "Error 404",
  title: "This page ran off to the reception",
  description:
    "We can't find the page you're looking for. It may have been moved, renamed, or never existed.",
  primaryLabel: "Back to dashboard",
  secondaryLabel: "Go back",
  supportPrompt: "Still stuck?",
  supportLabel: "Contact support",
} as const;

export const DEFAULT_ERROR: ErrorEntity = {
  error: GENERIC_ERROR_TITLE,
  description: GENERIC_ERROR_DESCRIPTION,
  errorStatusCode: 500,
};

export const customErrorTitle: Record<CustomErrorCode, string> = {
  [CustomErrorCode.PAGINATION_OUT_OF_BOUND]: "Page not found",
  [CustomErrorCode.PAGE_NOT_FOUND]: "Page not found",
  [CustomErrorCode.PUBLICATION_NOT_FOUND]: "Publication not found",
};

export const customErrorDescription: Record<CustomErrorCode, string> = {
  [CustomErrorCode.PAGINATION_OUT_OF_BOUND]:
    "Page number out of bound. Please check again",
  [CustomErrorCode.PAGE_NOT_FOUND]: "Please try again later",
  [CustomErrorCode.PUBLICATION_NOT_FOUND]: "Please refresh the page and try again",
};

export const customErrorActionLabel: Record<ErrorAction, string> = {
  [ErrorAction.RETURN_TO_MAIN]: "Return to main page",
  [ErrorAction.TRY_AGAIN]: "Try again",
};
