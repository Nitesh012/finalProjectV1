import React, { createContext, useContext, useEffect, useState } from "react";
import { setToken } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseToken(t: string | null) {
  if (!t) return { userId: null, role: null };
  try {
    const payload = t.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return { userId: decoded.id ?? null, role: decoded.role ?? null };
  } catch (e) {
    return { userId: null, role: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTok] = useState<string | null>(() => localStorage.getItem("token"));
  const parsed = parseToken(token);
  const [userId] = useState<string | null>(parsed.userId);
  const [role] = useState<string | null>(parsed.role);

  useEffect(() => {
    // ensure lib helper sync
    setToken(token);
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setTok(t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setTok(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, userId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
