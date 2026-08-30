import { Page } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { DynamicPage, DynamicPageDetails, GetPagePublicationParams, PagePublicationItem } from "../types/DynamicPage";
import { Paginated } from "../types/Paginated";

export const getPages = async (): Promise<DynamicPage[]> => {
  const response = await axiosInstance.get<DynamicPage[]>(Page.BASE);
  return response.data;
};

export const getPageDetailsBySlug = async (slug: string): Promise<DynamicPageDetails> => {
  const response = await axiosInstance.get<DynamicPageDetails>(Page.detailsBySlug(slug));
  return response.data;
};

export const getPagePublications = async (
  slug: string,
  query: Partial<GetPagePublicationParams>,
): Promise<Paginated<PagePublicationItem>> => {
  const response = await axiosInstance.get<Paginated<PagePublicationItem>>(Page.publications(slug), {
    params: query,
  });
  return response.data;
};

export const rollbackPublication = async (
  slug: string,
  publicationId: string,
): Promise<void> => {
  const response = await axiosInstance.post(Page.rollbackPublication(slug, publicationId));
  return response.data;
};
