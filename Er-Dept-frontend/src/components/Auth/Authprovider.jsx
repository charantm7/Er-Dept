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
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabaseclient.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setRole(data.user.user_metadata?.role || null);
      } else {
        console.error("Unable to fetch loggedIn user!", error);
      }
      setLoading(false);
    };

    getUser();

    const { data: listeners } = supabaseclient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || null);
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => listeners.subscription.unsubscribe();
  }, []);

  const redirectTo = {
    admin: "/admin",
    doctor: "/doctor",
    nurse: "/nurse",
  };

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Please Enter Credentials." };
    }
    try {
      const { data, error } = await supabaseclient.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, message: error };
      }

      setUser(data.user);
      setRole(data.user.user_metadata?.role || null);
      return { data: data.user, success: true, redirectTo: redirectTo[data.user.user_metadata?.role] };
    } catch (err) {
      console.error("Auth error:", err);
      return { success: false, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabaseclient.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const value = { user, login, logout, role, loading, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
