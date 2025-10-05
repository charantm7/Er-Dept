import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/Authprovider";
import { ToastProvider } from "./components/Context/ToastContext";
import { useAuth } from "./components/Auth/Authprovider";
import Login from "./components/Auth/Login";
import { ProtectRoute } from "./components/Auth/ProtectRoute";
import UnifiedDashboard from "./components/Dashboards/UnifiedDashboard";
import NotFoundPage from "./components/NotFoundPage";
import { ROUTES } from "./components/Config/routes.config";
import PatientsPage from "./components/Pages/PatientsPage";
import PatientDetailsPage from "./components/Pages/PatientDetailsPage";
import AppointmentsPage from "./components/Pages/AppointmentsPage";
import FormsPage from "./components/Forms/FormsPage";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* default Root route */}
            <Route path={ROUTES.HOME} element={<RootRedirect />} />

            {/* Login Route */}
            <Route path={ROUTES.LOGIN} element={<Login />} />

            {/* Single Dashboard route */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectRoute allowedRoles={["doctor", "admin", "nurse"]}>
                  <UnifiedDashboard />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.PATIENT}
              element={
                <ProtectRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <PatientsPage />
                </ProtectRoute>
              }
            />

            {/* redirect route */}
            <Route path={ROUTES.NURSE} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DOCTOR} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            <Route
              path={ROUTES.PATIENTDETAILS}
              element={
                <ProtectRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <PatientDetailsPage />
                </ProtectRoute>
              }
            />
            <Route
              path={ROUTES.FORM}
              element={
                <ProtectRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <FormsPage />
                </ProtectRoute>
              }
            />

            <Route
              path={ROUTES.APPOINTMENT}
              element={
                <ProtectRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <AppointmentsPage />
                </ProtectRoute>
              }
            />

            {/* 404 not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

// root helper
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const redirectMap = {
    admin: ROUTES.ADMIN,
    doctor: ROUTES.DOCTOR,
    nurse: ROUTES.NURSE,
  };

  return <Navigate to={redirectMap[user.role] || ROUTES.LOGIN} replace />;
};

export default App;
