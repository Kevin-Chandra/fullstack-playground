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
  [CustomErrorCode.SECTION_PAYLOAD_INVALID]: "Some sections need attention",
  [CustomErrorCode.SECTION_TYPE_ALREADY_EXISTS]: "Section already added",
  [CustomErrorCode.SECTION_UUID_TAKEN]: "Section belongs to another page",
  [CustomErrorCode.DRAFT_OUT_OF_DATE]: "This draft has changed",
  [CustomErrorCode.MEDIA_UNAVAILABLE]: "Files no longer available",
  [CustomErrorCode.FILE_UPLOAD_FAILED]: "Upload failed",
  [CustomErrorCode.FILE_TYPE_UNSUPPORTED]: "File type not supported",
  [CustomErrorCode.UPLOAD_CANCELLED]: "Upload cancelled",
};

export const customErrorDescription: Record<CustomErrorCode, string> = {
  [CustomErrorCode.PAGINATION_OUT_OF_BOUND]:
    "Page number out of bound. Please check again",
  [CustomErrorCode.PAGE_NOT_FOUND]: "Please try again later",
  [CustomErrorCode.PUBLICATION_NOT_FOUND]: "Please refresh the page and try again",
  [CustomErrorCode.SECTION_PAYLOAD_INVALID]:
    "One or more sections are missing required details or have invalid values. Please review them and save again",
  [CustomErrorCode.SECTION_TYPE_ALREADY_EXISTS]:
    "This section can only appear once on a page. Please remove the duplicate and save again",
  [CustomErrorCode.SECTION_UUID_TAKEN]:
    "One of these sections is already used on another page. Please reload and try again",
  [CustomErrorCode.DRAFT_OUT_OF_DATE]:
    "Someone else saved changes since you opened this draft. Please reload before saving",
  [CustomErrorCode.MEDIA_UNAVAILABLE]:
    "Some of the files used here have been removed. Please reload and upload them again",
  [CustomErrorCode.FILE_UPLOAD_FAILED]:
    "We couldn't upload that file. Please try again",
  [CustomErrorCode.FILE_TYPE_UNSUPPORTED]:
    "That file type isn't supported. Please choose a different file",
  [CustomErrorCode.UPLOAD_CANCELLED]:
    "The upload was stopped before it finished",
};

export const customErrorActionLabel: Record<ErrorAction, string> = {
  [ErrorAction.RETURN_TO_MAIN]: "Return to main page",
  [ErrorAction.TRY_AGAIN]: "Try again",
  [ErrorAction.RELOAD]: "Reload",
};

/**
 * A cancel never reaches the server, so there is no response to build this
 * from. It carries a `customErrorCode` so a caller can tell the stop the user
 * asked for from an upload that actually failed, and stay quiet about it.
 */
export const UPLOAD_CANCELLED_ERROR: ErrorEntity = {
  error: customErrorTitle[CustomErrorCode.UPLOAD_CANCELLED],
  description: customErrorDescription[CustomErrorCode.UPLOAD_CANCELLED],
  customErrorCode: CustomErrorCode.UPLOAD_CANCELLED,
  errorStatusCode: UNKNOWN_STATUS_CODE,
};
