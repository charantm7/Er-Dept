import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ Dummy users for authentication
  const dummyUsers = [
    { username: "admin", password: "1234", role: "admin", name: "Admin User", email: "admin@hospital.com" },
    { username: "doc1", password: "docpass", role: "doctor", name: "Dr. John Smith", email: "doctor@hospital.com" },
    { username: "nurse1", password: "nursepass", role: "nurse", name: "Nurse Jane Doe", email: "nurse@hospital.com" },
  ];

  // ✅ Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("er_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ✅ Role-based redirect helper
  const getRoleBasedRedirect = (role) => {
    const redirectMap = {
      admin: "/admin",
      doctor: "/doctor",
      nurse: "/nurse",
    };
    return redirectMap[role] || "/";
  };

  // ✅ Login with dummy credentials
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Find user by email or username
      const foundUser = dummyUsers.find(
        (user) => user.email === email || user.username === email
      );

      if (!foundUser) {
        return { success: false, message: "User not found" };
      }

      if (foundUser.password !== password) {
        return { success: false, message: "Invalid password" };
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;
      const userWithRole = { ...userWithoutPassword };

      setUser(userWithRole);
      localStorage.setItem("er_user", JSON.stringify(userWithRole));

      console.log("✅ Logged in as:", userWithRole.role, "-", userWithRole.name);

      return {
        success: true,
        user: userWithRole,
        redirectTo: getRoleBasedRedirect(userWithRole.role),
      };
    } catch (err) {
      console.error("Auth error:", err);
      return { success: false, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("er_user");
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
