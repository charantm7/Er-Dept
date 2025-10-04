import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Authprovider";

export const ProtectRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};
