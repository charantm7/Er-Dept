import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseclient } from "../Config/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // start true until we restore user
  const [user, setUser] = useState(null);

  // ✅ Restore logged-in user from localStorage once
  useEffect(() => {
    const savedUser = localStorage.getItem("er_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ✅ Helper: redirect paths based on roles
  const getRoleBasedRedirect = (role) => {
    const redirectMap = {
      admin: "/admin",
      doctor: "/doctor",
      nurse: "/nurse",
    };
    return redirectMap[role] || "/";
  };

  // ✅ Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseclient.from("users").select("*").eq("email", email).single();

      if (error || !data) {
        console.error("Login error:", error?.message);
        return { success: false, message: "User not found" };
      }

      // Validate password manually
      if (data.password !== password) {
        return { success: false, message: "Invalid password" };
      }

      const { password: _, ...userWithoutPassword } = data;
      const userWithRole = { ...userWithoutPassword, role: "doctor" };
      setUser(userWithRole);
      localStorage.setItem("er_user", JSON.stringify(userWithoutPassword));

      console.log("✅ Logged in successfully:", "doctor");

      return {
        success: true,
        user: userWithoutPassword,
        redirectTo: getRoleBasedRedirect("doctor"),
      };
    } catch (err) {
      console.error("Auth error:", err);
      return { success: false, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("er_user");
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
