import axios from "axios";
import { createSessionRetryHandler } from "./sessionInterceptor";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_REQUEST_TIMEOUT),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  createSessionRetryHandler(axiosInstance),
);
