import { Routes } from "@/src/lib/constants/routes";
import type { IconType } from "react-icons";
import {
  MdOutlineAccountCircle,
  MdOutlineFavoriteBorder,
  MdOutlineGroups,
  MdOutlineHome,
} from "react-icons/md";
import { RiLayout3Line } from "react-icons/ri";

export type NavItemConfig = {
  key: string;
  label: string;
  href: string;
  Icon: IconType;
  /** Match the pathname exactly (section roots, so they don't stay active on nested pages). */
  exact?: boolean;
};

export const navItems: NavItemConfig[] = [
  {
    key: "overview",
    label: "Overview",
    href: Routes.DASHBOARD,
    Icon: MdOutlineHome,
    exact: true,
  },
  {
    key: "guests",
    label: "Guests",
    href: Routes.DASHBOARD_GUESTS,
    Icon: MdOutlineGroups,
  },
  {
    key: "wishes",
    label: "Wishes",
    href: Routes.DASHBOARD_WISHES,
    Icon: MdOutlineFavoriteBorder,
  },
  {
    key: "users",
    label: "Users",
    href: Routes.DASHBOARD_USERS,
    Icon: MdOutlineAccountCircle,
  },
  {
    key: "pages",
    label: "Pages",
    href: Routes.DASHBOARD_PAGES,
    Icon: RiLayout3Line,
  },
];
