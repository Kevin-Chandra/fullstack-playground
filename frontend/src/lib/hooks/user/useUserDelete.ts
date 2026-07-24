import { useCallback, useState } from "react";
import { deleteUser } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorEntity>();

  const remove = useCallback(async (userId: string) => {
    setError(undefined);
    setLoading(true);

    try {
      await deleteUser(userId);
      return true;
    } catch (e) {
      setError(handleSystemError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    remove,
    loading,
    error,
  };
}
