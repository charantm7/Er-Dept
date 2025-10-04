import React, { createContext, useContext, useState, useEffect } from "react";

const dummyUsers = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "doc1", password: "docpass", role: "doctor" },
  { username: "nurse1", password: "nursepass", role: "nurse" },
];

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("er_user");

    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (username, password) => {
    const founduser = dummyUsers.find((u) => u.username === username && u.password === password);

    if (founduser) {
      setUser(founduser);
      localStorage.setItem("er_user", JSON.stringify(founduser));
      return { success: true };
    } else {
      return { success: false, message: "Invalid Credentials" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("er_user");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
