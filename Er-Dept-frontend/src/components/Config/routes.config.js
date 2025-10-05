export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  NURSE: "/nurse",
  UNAUTHORIZED: "/unauthorized",
};

export const ROLE_ROUTES = {
  admin: [ROUTES.ADMIN, ROUTES.DOCTOR, ROUTES.NURSE],
  doctor: [ROUTES.DOCTOR],
  nurse: [ROUTES.NURSE],
};
