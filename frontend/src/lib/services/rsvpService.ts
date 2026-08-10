import { Rsvp as RsvpPath } from "../constants/apiPaths";
import { axiosInstance } from "../network/axiosInstance";
import { CreateRsvpPayload, Rsvp } from "../types/Rsvp";

export const createRsvp = async (payload: CreateRsvpPayload): Promise<Rsvp> => {
  const response = await axiosInstance.post<Rsvp>(RsvpPath.BASE, payload);
  return response.data;
};

