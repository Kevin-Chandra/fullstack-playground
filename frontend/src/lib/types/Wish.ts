import { BasePaginationParam } from "./BasePaginationParam";
import { Guest } from "./Guest";

export interface Wish {
  id: string;
  message: string;
  createdAt: string;
  guest: Guest;
  imageUrl?: string;
  audioUrl?: string;
}

export type GetWishParams = BasePaginationParam;