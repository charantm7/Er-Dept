export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  NURSE: "/nurse",
  PATIENT: "/patients",
  FORM: "/patient/:mrno/forms",
  PATIENTDETAILS: "/patient/:mrno",
  APPOINTMENT: "/appointments",
  LABREPORT: "/lab-results",
  INDIVISUALBILLING: "/patient/:mrno/billing",
  BILLING: "/billing",
  LABREPORT: "/labreport",
  SETTINGS: "/settings",
  UNAUTHORIZED: "/unauthorized",
};

export const ROLE_ROUTES = {
  admin: [ROUTES.ADMIN, ROUTES.DOCTOR, ROUTES.NURSE],
  doctor: [ROUTES.DOCTOR],
  nurse: [ROUTES.NURSE],
};
