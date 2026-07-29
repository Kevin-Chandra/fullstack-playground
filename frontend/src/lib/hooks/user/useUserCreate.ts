import { useCallback, useState } from "react";
import { createUser } from "../../services/userService";
import { ErrorEntity } from "../../types/ErrorEntity";
import { Result } from "../../types/result";
import { CreateUserPayload, User } from "../../types/User";
import { handleSystemError } from "../../utils/errorHandler";

export function useUserCreate() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (payload: CreateUserPayload): Promise<Result<User, ErrorEntity>> => {
      setLoading(true);

      try {
        const user = await createUser(payload);
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
    create,
  };
}
