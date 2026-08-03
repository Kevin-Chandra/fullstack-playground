import { Users as UsersPath } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { Paginated } from "../types/Paginated";
import {
  CreateUserPayload,
  GetUserParams,
  UpdateUserPayload,
  User,
} from "../types/User";

export const getUsers = async (
  query: Partial<GetUserParams>,
): Promise<Paginated<User>> => {
  const response = await axiosInstance.get<Paginated<User>>(UsersPath.BASE, {
    params: query,
  });
  return response.data;
};

export const getUserDetails = async (id: string): Promise<User> => {
  const response = await axiosInstance.get<User>(UsersPath.byId(id));
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await axiosInstance.post<User>(UsersPath.BASE, payload);
  return response.data;
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  const response = await axiosInstance.patch<User>(UsersPath.byId(id), payload);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(UsersPath.byId(id));
};
