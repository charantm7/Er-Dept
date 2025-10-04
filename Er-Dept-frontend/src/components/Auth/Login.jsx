import React, { useState } from "react";
import { useAuth } from "./Authprovider";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, Shield, User, Database, Wifi, AlertCircle } from "lucide-react";

const demoUsers = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "doc1", password: "docpass", role: "doctor" },
  { username: "nurse1", password: "nursepass", role: "nurse" },
];

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "doctor") navigate("/doctor");
      else if (user.role === "nurse") navigate("/nurse");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.success) {
      setError(result.message);
    } else {
      const loggedInUser = result.user;
      if (loggedInUser.role === "admin") navigate("/admin");
      else if (loggedInUser.role === "doctor") navigate("/doctor");
      else if (loggedInUser.role === "nurse") navigate("/nurse");
    }
  };

  const fillDemoUser = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  };

  return (
    <div
      className=" flex items-center flex-col gap-5 justify-center overflow-auto ,m-h-screen w-screen"
      style={{
        background:
          "linear-gradient(135deg, #bfdbfe 0%, #dbeafe 25%, #eff6ff 50%, #f8fafc 75%, #ffffff 100%)",
      }}
    >
      <div className="max-w-md w-full mt-10 space-y-8 relative">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Hospital Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the CuraHealth Emergency Departement Dashboard.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 absolute top-5 right-5 shadow-lg border-l-4 py-2 px-3 rounded-md bg-white">
          {error}
        </p>
      )}

      <div className="mb-10 p-5 lg:w-[30%] md:w-[50%] flex flex-col items-center gap-6 border-1 border-[#021f5a51] rounded-xl bg-white text-black">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-2 w-full ">
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="9533296898"
                  maxLength="10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your password"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)" }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="bg-[#00000036] h-[1px] w-[80%]"></div>
        <div className="w-full flex flex-col items-center gap-3">
          <p className="font-medium text-[14px] text-gray-600">DEMO CREDENTIALS</p>

          <div className="w-full p-2 flex flex-col gap-3 ">
            {demoUsers.map((user, idx) => (
              <div
                key={idx}
                onClick={() => fillDemoUser(user)}
                className={`flex items-center rounded-md bg-gray-100 px-3 py-2 border-2 cursor-pointer ${
                  username === user.username ? "border-blue-500" : "border-gray-100 hover:border-blue-500"
                }`}
              >
                <User className="h-7 w-7 text-blue-500 mr-2" />
                <div className="flex flex-col gap-1 items-start">
                  <p className="font-medium text-[15px]">{user.role}</p>
                  <p className="text-[12px]">
                    {user.username} | {user.password}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-left text-[12px] pl-2">
            Click on any staff to auto-fill credentials. Use the exact password shown.
          </p>

          <p className="text-[15px] mt-2">
            Having trouble signing in?{" "}
            <a className="text-blue-800" href="#">
              Contact IT Support
            </a>
          </p>

          <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure Admin Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
