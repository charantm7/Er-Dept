export const DASHBOARD_SECTIONS = {
  // Stats Cards
  PATIENT_STATS: "patient_stats",
  APPOINTMENT_STATS: "appointment_stats",
  BILLING_STATS: "billing_stats",
  EMERGENCY_STATS: "emergency_stats",

  // Features
  PATIENT_MANAGEMENT: "patient_management",
  APPOINTMENT_MANAGEMENT: "appointment_management",
  BILLING: "billing",
  REPORTS: "reports",
  USER_MANAGEMENT: "user_management",
  EMERGENCY_ALERTS: "emergency_alerts",
  MY_APPOINTMENTS: "my_appointments",
  MY_SCHEDULE: "my_schedule",
};

export const ROLE_PERMISSIONS = {
  admin: {
    sections: [
      DASHBOARD_SECTIONS.PATIENT_STATS,
      DASHBOARD_SECTIONS.APPOINTMENT_STATS,
      DASHBOARD_SECTIONS.BILLING_STATS,
      DASHBOARD_SECTIONS.EMERGENCY_STATS,
      DASHBOARD_SECTIONS.PATIENT_MANAGEMENT,
      DASHBOARD_SECTIONS.APPOINTMENT_MANAGEMENT,
      DASHBOARD_SECTIONS.BILLING,
      DASHBOARD_SECTIONS.REPORTS,
      DASHBOARD_SECTIONS.USER_MANAGEMENT,
      DASHBOARD_SECTIONS.EMERGENCY_ALERTS,
    ],
    stats: {
      totalPatients: true,
      todayAppointments: true,
      pendingBills: true,
      emergencyAlerts: true,
      revenue: true,
      activeStaff: true,
    },
  },
  doctor: {
    sections: [
      DASHBOARD_SECTIONS.MY_SCHEDULE,
      DASHBOARD_SECTIONS.PATIENT_MANAGEMENT,
      DASHBOARD_SECTIONS.APPOINTMENT_MANAGEMENT,
      DASHBOARD_SECTIONS.REPORTS,
    ],
    stats: {
      todayAppointments: true,
      myPatients: true,
      pendingReports: true,
      completedToday: true,
    },
  },
  nurse: {
    sections: [
      DASHBOARD_SECTIONS.PATIENT_MANAGEMENT,
      DASHBOARD_SECTIONS.MY_SCHEDULE,
      DASHBOARD_SECTIONS.EMERGENCY_ALERTS,
    ],
    stats: {
      todayAppointments: true,
      admittedPatients: true,
      emergencyAlerts: true,
      assignedPatients: true,
    },
  },
};
