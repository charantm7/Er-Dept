import React, { useState, useEffect } from "react";
import { useAuth } from "./Authprovider";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, Shield, User } from "lucide-react";
import { useToast } from "../Context/ToastContext";

const demoUsers = [
  { username: "admin", password: "1234", role: "admin", name: "Admin User", email: "admin@hospital.com" },
  {
    username: "doc1",
    password: "docpass",
    role: "doctor",
    name: "Dr. John Smith",
    email: "doctor@hospital.com",
  },
  {
    username: "nurse1",
    password: "nursepass",
    role: "nurse",
    name: "Nurse Jane Doe",
    email: "nurse@hospital.com",
  },
];

function Login() {
  const { login, user, loading } = useAuth();
  const { success, errorToast: setError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const from = location.state?.from?.pathname || null;

  // ✅ Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    } else {
      success(`Welcome back, ${result.user.name}! 🎉`);
      setTimeout(() => {
        navigate(from || result.redirectTo, { replace: true });
      }, 500);
      setIsSubmitting(false);
    }

    navigate(from || result.redirectTo, { replace: true });
  };

  const fillDemoUser = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-200 via-blue-100 to-white">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-blue-100 transition-all">
        {/* --- Login UI --- */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md border border-blue-200">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">Hospital Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the CuraHealth Dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <div className="relative">
              <input
                type="text"
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, doc1, nurse1 or email"
                className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <User className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo users */}
        <div className="mt-6 mb-4 border-t border-gray-200"></div>
        <p className="text-center text-sm font-semibold text-gray-600 mb-3">DEMO CREDENTIALS</p>
        <div className="flex flex-col gap-3">
          {demoUsers.map((demo, idx) => (
            <div
              key={idx}
              onClick={() => fillDemoUser(demo)}
              className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 cursor-pointer transition ${
                username === demo.username
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium text-[15px] capitalize">{demo.role}</p>
                  <p className="text-xs text-gray-500">
                    {demo.name} | {demo.username} | {demo.password}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">Click any staff to auto-fill credentials.</p>
      </div>
    </div>
  );
}

export default Login;
