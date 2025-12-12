"use client";

import { createContext, useContext } from "react";
import useAuth from "@/hooks/useAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, loading, setUser } = useAuth();

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
