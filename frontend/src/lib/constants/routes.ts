export const Routes = {
  HOME: "/",
  LOGIN: "/login",

  // Protected
  DASHBOARD: "/dashboard",
  DASHBOARD_USERS: "/dashboard/users",
  DASHBOARD_GUESTS: "/dashboard/guests",
  DASHBOARD_WISHES: "/dashboard/wishes",

  // Route Handler
  CLEAR_SESSION: "/api/auth/clear-session",
} as const;
