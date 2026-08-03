import { useCallback, useState } from "react";
import { updateUser } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { UpdateUserPayload, User } from "../../types/User";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserUpdate() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (id: string, payload: UpdateUserPayload): Promise<Result<User, ErrorEntity>> => {
      setLoading(true);

      try {
        const user = await updateUser(id, payload);
        return { success: true, data: user };
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
    update,
  };
}
