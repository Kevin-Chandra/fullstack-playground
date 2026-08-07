import { ErrorEntity } from "@/src/lib/types/ErrorEntity";
import { Result } from "@/src/lib/types/result";
import { handleSystemError } from "@/src/lib/utils/errorHandler";

export default async function clipboardCopy(text: string): Promise<Result<null, ErrorEntity>> {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, data: null }
  } catch (e) {
    const errorEntity = handleSystemError(e)
    return { success: false, error: errorEntity }
  }
}