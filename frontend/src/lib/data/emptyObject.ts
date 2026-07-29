import { CreateUserPayload } from "../types/User";
import { UserStatus } from "../types/UserStatus";

export const USER_FORM_DEFAULT_VALUES: CreateUserPayload = {
  username: "",
  password: "",
  name: "",
  userStatus: UserStatus.ACTIVE,
};
