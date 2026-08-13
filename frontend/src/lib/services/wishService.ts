import { Wish as WishPath } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { Paginated } from "../types/Paginated";
import { GetWishParams, Wish } from "../types/Wish";

export const getWishes = async (
  query: Partial<GetWishParams>,
): Promise<Paginated<Wish>> => {
  const response = await axiosInstance.get<Paginated<Wish>>(WishPath.BASE, {
    params: query,
  });
  return response.data;
};

export const getWishDetails = async (id: string): Promise<Wish> => {
  const response = await axiosInstance.get<Wish>(WishPath.byId(id));
  return response.data;
};

// export const createWish = async (payload: CreateGuestPayload): Promise<Guest> => {
//   const response = await axiosInstance.post<Guest>(GuestPath.BASE, payload);
//   return response.data;
// };

export const deleteWish = async (id: string): Promise<void> => {
  await axiosInstance.delete(WishPath.byId(id));
};
