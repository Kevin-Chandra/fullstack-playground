import { AxiosError } from "axios";

const GENERIC = "Something went wrong. Please try again.";

type ApiErrorBody = { message?: string | string[] };

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.status === 401) {
    const data = error.response.data as ApiErrorBody | string | undefined;

    if (typeof data === "string") return data || GENERIC;

    const message = data?.message;
    if (Array.isArray(message)) return message[0] ?? GENERIC;
    if (message) return message;
  }
  return GENERIC;
}
