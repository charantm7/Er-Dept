import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseclient } from "../Config/supabase";

const dummyUsers = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "doc1", password: "docpass", role: "doctor" },
  { username: "nurse1", password: "nursepass", role: "nurse" },
];

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within the authprovider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = supabaseclient.auth.getSession().then(({ data }) => {
          setUser(data.session?.user ?? null);
        });

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          setUser(parsedUser);
        } else {
          console.log("No user found Login please");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (username, password) => {
    const founduser = dummyUsers.find((u) => u.username === username && u.password === password);

    if (founduser) {
      const userWithoutPassword = { ...founduser };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem("er_user", JSON.stringify(userWithoutPassword));

      console.log("logedIn successfully:", userWithoutPassword.role);

      return {
        success: true,
        user: userWithoutPassword,
        redirectTo: getRoleBasedRedirect(founduser.role),
      };
    } else {
      return {
        success: false,
        message: "Invalid Credentials",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("er_user");
  };

  const getRoleBasedRedirect = (role) => {
    const redirectMap = {
      admin: "/admin",
      doctor: "/doctor",
      nurse: "/nurse",
    };
    return redirectMap[role] || "/";
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
