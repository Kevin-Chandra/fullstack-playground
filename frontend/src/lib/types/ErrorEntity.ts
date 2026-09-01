export interface ErrorEntity {
  error: string;
  description?: string;
  errorStatusCode: number;
  // Custom Error
  defaultAction?: ErrorAction;
  customErrorCode?: CustomErrorCode;
}

export enum ErrorAction {
  TRY_AGAIN,
  RETURN_TO_MAIN,
  RELOAD,
}

/**
 * Mirrors `libs/constants/error-code.constants.ts` on the backend, plus the
 * client-only codes at the bottom, which no response ever carries.
 */
export enum CustomErrorCode {
  PAGINATION_OUT_OF_BOUND = "pagination-out-of-bound",
  PAGE_NOT_FOUND = "page_not_found",
  PUBLICATION_NOT_FOUND = "publication_not_found",

  // Page sections.
  SECTION_PAYLOAD_INVALID = "section_payload_invalid",
  SECTION_TYPE_ALREADY_EXISTS = "section_type_already_exists",
  SECTION_UUID_TAKEN = "section_uuid_taken",
  DRAFT_OUT_OF_DATE = "draft_out_of_date",

  // File storage.
  MEDIA_UNAVAILABLE = "media_unavailable",
  FILE_UPLOAD_FAILED = "file_upload_failed",
  FILE_TYPE_UNSUPPORTED = "file_type_unsupported",

  // Client-only: raised without a response, never sent by the backend.
  UPLOAD_CANCELLED = "upload_cancelled",
}
