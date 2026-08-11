import { Wish } from "../../libs/entity/wish.entity";

export type WishResponse = Omit<Wish, "imageKey" | "audioKey"> & {
  imageUrl?: string;
  audioUrl?: string;
};
