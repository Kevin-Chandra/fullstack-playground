import { Page } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { DynamicPage, DynamicPageDetails, GetPagePublicationParams, PagePublicationItem } from "../types/DynamicPage";
import { PageDraft, SavePageConfigPayload } from "../types/PageConfig";
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

export const getPageConfigs = async (slug: string): Promise<PageDraft> => {
  const response = await axiosInstance.get<PageDraft>(Page.configs(slug));
  return response.data;
};

export const savePageConfigs = async (
  slug: string,
  payload: SavePageConfigPayload,
): Promise<void> => {
  await axiosInstance.post(Page.configs(slug), payload);
};

export const discardPageConfigs = async (slug: string): Promise<void> => {
  await axiosInstance.post(Page.discardConfig(slug));
};
