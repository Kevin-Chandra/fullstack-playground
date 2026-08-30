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
}

export enum CustomErrorCode {
  PAGINATION_OUT_OF_BOUND = "pagination-out-of-bound",
  PAGE_NOT_FOUND = "page_not_found",
  PUBLICATION_NOT_FOUND = "publication_not_found"
}
