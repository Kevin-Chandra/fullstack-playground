import { Guest as GuestPath } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { CreateGuestPayload, GetGuestParams, Guest, GuestListItem, PublicGuest, UpdateGuestPayload } from "../types/Guest";
import { Paginated } from "../types/Paginated";

export const getGuests = async (
  query: Partial<GetGuestParams>,
): Promise<Paginated<GuestListItem>> => {
  const response = await axiosInstance.get<Paginated<GuestListItem>>(GuestPath.BASE, {
    params: query,
  });
  return response.data;
};

export const getGuestDetails = async (id: string): Promise<Guest> => {
  const response = await axiosInstance.get<Guest>(GuestPath.byId(id));
  return response.data;
};

export const getGuestByUuid = async (uuid: string): Promise<PublicGuest> => {
  const response = await axiosInstance.get<PublicGuest>(GuestPath.byBaseId(uuid));
  return response.data;
};

export const createGuest = async (payload: CreateGuestPayload): Promise<Guest> => {
  const response = await axiosInstance.post<Guest>(GuestPath.BASE, payload);
  return response.data;
};

export const updateGuest = async (
  id: string,
  payload: UpdateGuestPayload,
): Promise<Guest> => {
  const response = await axiosInstance.patch<Guest>(GuestPath.byBaseId(id), payload);
  return response.data;
};

export const deleteGuest = async (id: string): Promise<void> => {
  await axiosInstance.delete(GuestPath.byBaseId(id));
};
