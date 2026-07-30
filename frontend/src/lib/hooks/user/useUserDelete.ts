import { useCallback, useState } from "react";
import { deleteUser } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserDelete() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(
    async (userId: string): Promise<Result<null, ErrorEntity>> => {
      setLoading(true);

      try {
        await deleteUser(userId);
        return { success: true, data: null };
      } catch (e) {
        return { success: false, error: handleSystemError(e) };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    remove,
  };
}
