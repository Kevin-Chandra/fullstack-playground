import { QueryParams } from "./queryParams";

export const Routes = {
  HOME: "/",
  LOGIN: "/login",

  // Protected
  DASHBOARD: "/dashboard",
  DASHBOARD_USERS: "/dashboard/users",
  DASHBOARD_GUESTS: "/dashboard/guests",
  DASHBOARD_WISHES: "/dashboard/wishes",
  DASHBOARD_PAGES: "/dashboard/pages",
  dashboardPages: (pageSlug?: string): string =>
    pageSlug
      ? `${Routes.DASHBOARD_PAGES}?${QueryParams.PAGE_SLUG}=${encodeURIComponent(pageSlug)}`
      : Routes.DASHBOARD_PAGES,
  dashboardPagePublications: (slug: string): string =>
    `${Routes.DASHBOARD_PAGES}/${slug}/publications`,
  STYLE_GUIDE: "/style-guide",

  // Route Handler
  CLEAR_SESSION: "/api/auth/clear-session",
} as const;
