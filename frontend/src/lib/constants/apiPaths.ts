export enum Auth {
  LOGIN = "/auth/login",
  LOGOUT = "/auth/logout",
  REFRESH = "/auth/refresh",
  ME = "/auth/me",
}

export const Users = {
  BASE: "/user",
  byId: (id: string): string => `${Users.BASE}/${id}`,
} as const;

export const Guest = {
  BASE: "/guest",
  byId: (id: string): string => `${Guest.BASE}/id/${id}`,
  byBaseId: (id: string): string => `${Guest.BASE}/${id}`,
} as const 
