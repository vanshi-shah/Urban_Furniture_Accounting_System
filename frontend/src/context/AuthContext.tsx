import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterCredentials) => Promise<User>;
  forgotPassword: (identifier: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: verify stored token with the backend /auth/me endpoint
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Optimistically set from localStorage for snappy UX
    setToken(storedToken);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      /* ignore parse errors */
    }

    // Verify token is still valid on the server
    apiFetch("/auth/me")
      .then((data: any) => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Token is invalid/expired — clear everything
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const data: any = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    const { token: receivedToken, user: receivedUser } = data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(receivedUser));

    return receivedUser;
  };

  const register = async (payload: RegisterCredentials): Promise<User> => {
    const data: any = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const { token: receivedToken, user: receivedUser } = data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(receivedUser));

    return receivedUser;
  };

  const forgotPassword = async (identifier: string): Promise<User> => {
    const data: any = await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier })
    });
    const { token: receivedToken, user: receivedUser } = data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(receivedUser));

    return receivedUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
