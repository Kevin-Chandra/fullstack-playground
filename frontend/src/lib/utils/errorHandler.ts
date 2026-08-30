import { AxiosError } from "axios";
import {
  customErrorDescription,
  customErrorTitle,
  DEFAULT_ERROR,
  GENERIC_ERROR_DESCRIPTION,
  GENERIC_ERROR_TITLE,
} from "../constants/error";
import { ApiErrorBody } from "../types/ApiErrorBody";
import {
  CustomErrorCode,
  ErrorAction,
  ErrorEntity,
} from "../types/ErrorEntity";

function normalizeMessage(message?: string | string[]): string {
  return Array.isArray(message)
    ? message[0]
    : (message ?? GENERIC_ERROR_DESCRIPTION);
}

function toCustomErrorCode(value?: string): CustomErrorCode | undefined {
  const codes = Object.values(CustomErrorCode) as string[];
  return value && codes.includes(value)
    ? (value as CustomErrorCode)
    : undefined;
}

function getErrorTitle(customErrorCode: CustomErrorCode): string {
  return customErrorTitle[customErrorCode] ?? GENERIC_ERROR_TITLE;
}

function getErrorDescription(customErrorCode: CustomErrorCode): string {
  return customErrorDescription[customErrorCode] ?? GENERIC_ERROR_DESCRIPTION;
}

function getDefaultAction(
  customErrorCode: CustomErrorCode,
): ErrorAction | undefined {
  switch (customErrorCode) {
    case CustomErrorCode.PAGINATION_OUT_OF_BOUND, CustomErrorCode.PAGE_NOT_FOUND:
      return ErrorAction.RETURN_TO_MAIN;
    default:
      return undefined;
  }
}

export const handleSystemError = (
  error: unknown,
  defaultError: ErrorEntity = DEFAULT_ERROR,
): ErrorEntity => {
  if (error instanceof AxiosError && error.response) {
    const errorStatusCode = error.response.status;
    const body = error.response.data as ApiErrorBody | undefined;

    // 1. Custom error
    const customErrorCode = toCustomErrorCode(body?.error);
    if (customErrorCode) {
      return {
        error: getErrorTitle(customErrorCode),
        description: getErrorDescription(customErrorCode),
        defaultAction: getDefaultAction(customErrorCode),
        customErrorCode,
        errorStatusCode,
      };
    }

    // 2. Server error field
    if (body) {
      return {
        error: body.error ?? GENERIC_ERROR_TITLE,
        description: normalizeMessage(body.message),
        errorStatusCode,
      };
    }
  }

  return defaultError;
};
