import { Page } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { DynamicPage, DynamicPageDetails } from "../types/DynamicPage";

export const getPages = async (): Promise<DynamicPage[]> => {
  const response = await axiosInstance.get<DynamicPage[]>(Page.BASE);
  return response.data;
};

export const getPageDetailsBySlug = async (slug: string): Promise<DynamicPageDetails> => {
  const response = await axiosInstance.get<DynamicPageDetails>(Page.detailsBySlug(slug));
  return response.data;
};