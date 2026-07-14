// id is a string because the backend's bigint primary key serializes as one.
export interface User {
  id: string;
  username: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
