import { AxiosError } from "axios";

const INVALID_CREDENTIALS = "Invalid username or password.";
const GENERIC = "Something went wrong. Please try again.";

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.status === 401) {
    return INVALID_CREDENTIALS;
  }
  return GENERIC;
}
