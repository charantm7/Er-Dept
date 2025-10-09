import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseclient } from "../Config/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  // ✅ Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseclient.from("users").select("*").eq("email", email).single();

      if (error || !data) {
        return { success: false, message: "User not found" };
      }

      if (data.password !== password) {
        return { success: false, message: "Invalid password" };
      }

      // ✅ Include role in saved data
      const { password: _, ...userWithoutPassword } = data;
      const userWithRole = { ...userWithoutPassword, role: data.role || "doctor" };

      setUser(userWithRole);
      localStorage.setItem("er_user", JSON.stringify(userWithRole)); // ✅ FIXED

      console.log("✅ Logged in as:", userWithRole.role);

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
