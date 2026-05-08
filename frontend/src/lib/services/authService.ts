import { axiosInstance } from "../axiosInstance";
import { baseUrl } from "../constants/env";
import { Auth as Path } from "../constants/apiPaths";
import { LoginPayload } from "../types/Auth";

export const login = async (requestBody: LoginPayload) => {
  const response = await axiosInstance.post(
    `${baseUrl}${Path.LOGIN}`,
    requestBody,
  );
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.get(`${baseUrl}${Path.LOGOUT}`);
  return response.data;
};
