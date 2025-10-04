import { Navigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/Authprovider";
import Login from "./components/Auth/Login";
import { ProtectRoute } from "./components/Auth/ProtectRoute";
import Doctor from "./components/Dashboards/Doctor";
import Admin from "./components/Dashboards/Admin";
import Staff from "./components/Dashboards/Staff";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/doctor"
            element={
              <ProtectRoute role="doctor">
                <Doctor />
              </ProtectRoute>
            }
          />
          <Route
            path="/nurse"
            element={
              <ProtectRoute role="nurse">
                <Staff />
              </ProtectRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectRoute role="admin">
                <Admin />
              </ProtectRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
