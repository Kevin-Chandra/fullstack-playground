import { axiosInstance } from "../network/axiosInstance";
import { Users as UsersPath } from "../constants/apiPaths";
import {
  CreateUserPayload,
  GetUserParams,
  UpdateUserPayload,
  User,
} from "../types/User";
import { Paginated } from "../types/Paginated";

export const getUsers = async (
  query: Partial<GetUserParams>,
): Promise<Paginated<User>> => {
  const response = await axiosInstance.get<Paginated<User>>(UsersPath.BASE, {
    params: query,
  });
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await axiosInstance.post<User>(UsersPath.BASE, payload);
  return response.data;
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<void> => {
  await axiosInstance.patch(UsersPath.byId(id), payload);
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(UsersPath.byId(id));
};
