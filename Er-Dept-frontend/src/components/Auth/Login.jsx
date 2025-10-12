import React, { useState, useEffect } from "react";
import { useAuth } from "./Authprovider";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, Shield, User, Mail } from "lucide-react";
import { useToast } from "../Context/ToastContext";

function Login() {
  const { login, user, loading } = useAuth();
  const { success, errorToast: setError, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    } else {
      success(`Welcome back, ${result.data.email}! 🎉`);
      setTimeout(() => {
        navigate(from || result.redirectTo, { replace: true });
      }, 500);
      setIsSubmitting(false);
    }

    navigate(from || result.redirectTo, { replace: true });
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
    <div className="relative min-h-screen  flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-200 via-blue-100 to-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-blue-200  rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-[-60px] right-[-40px] w-96 h-96 bg-blue-100 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-100 rounded-full blur-2xl"></div>
      </div>
      <div className="w-full max-w-lg z-10 bg-white shadow-xl rounded-2xl p-6 sm:p-8  border border-blue-300 transition-all ">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md border border-blue-200">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">CuraHealth Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the Emergency Dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="curaerexample@gmail.com"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder:text-sm"
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
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder:text-sm"
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
            className="w-full py-3 cursor-pointer text-white font-medium rounded-lg shadow-md transition-all duration-200 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className=" flex gap-2 text-sm mt-4 text-gray-600">
          <p>Need Help?</p>
          <a href="#" className="text-blue-500 underline">
            Contact Support
          </a>
        </div>
        <div className="mt-3 relative top-2 flex justify-center text-gray-400 items-center gap-2 text-sm">
          <Shield size={18} />
          Secure Authentication
        </div>
      </div>
    </div>
  );
}

export default Login;
