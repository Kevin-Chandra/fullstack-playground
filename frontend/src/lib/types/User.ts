import { BasePaginationParam } from "./BasePaginationParam";
import { UserStatus } from "./UserStatus";

export interface User {
  id: string;
  username: string;
  name: string;
  userStatus: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  name: string;
  userStatus: string;
}

export type GetUserParams = Partial<
  BasePaginationParam & {
    "filter.userStatus": string;
  }>;

export type UpdateUserPayload = Partial<CreateUserPayload>;
