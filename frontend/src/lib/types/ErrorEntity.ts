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
}
