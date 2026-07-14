import { axiosInstance } from "../network/axiosInstance";
import { Auth as Path } from "../constants/apiPaths";
import { LoginPayload } from "../types/Auth";
import { CurrentUser } from "../types/CurrentUser";

export const login = async (requestBody: LoginPayload) => {
  const response = await axiosInstance.post(Path.LOGIN, requestBody);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.get(Path.LOGOUT);
  return response.data;
};

export const refresh = async () => {
  const response = await axiosInstance.get(Path.REFRESH);
  return response.data;
};

export const me = async (): Promise<CurrentUser> => {
  const response = await axiosInstance.get<CurrentUser>(Path.ME);
  return response.data;
};
