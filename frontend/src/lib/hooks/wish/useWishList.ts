import { useCallback } from "react";
import { getWishes } from "../../services/wishService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Paginated } from "../../types/Paginated";
import { GetWishParams, Wish } from "../../types/Wish";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useWishList() {
  const fetch = useCallback(
    async (params: GetWishParams): Promise<Result<Paginated<Wish>, ErrorEntity>> => {
      try {
        const result = await getWishes(params)
        return { success: true, data: result }
      } catch (e: unknown) {
        const errorEntity = handleSystemError(e);
        return { success: false, error: errorEntity }
      }
    }, []
  );

  return {
    fetch
  }
}
