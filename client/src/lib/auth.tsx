import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { LoginData } from "@shared/schema";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "staff";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const getTokenFromStorage = (): string | null => localStorage.getItem("authToken");
  const getUserFromStorage = (): User | null => {
    const userData = localStorage.getItem("userData");
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return null;
    }
  };

  const refreshToken = async () => {
    const token = getTokenFromStorage();
    if (!token) return;

    try {
      const response = await fetch('/api/refresh-token', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Refresh token failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
    } catch (error) {
      console.error('Token refresh failed, logging out:', error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
      queryClient.clear();
    }
  };

  useEffect(() => {
    const storedUser = getUserFromStorage();
    setUser(storedUser);
    setIsLoading(false);

    const tokenRefreshInterval = setInterval(refreshToken, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(tokenRefreshInterval);
  }, []);

  useEffect(() => {
    const requestInterceptor = (config: RequestInit) => {
      const token = getTokenFromStorage();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    };

    //This is a placeholder.  A real implementation would depend on your fetch setup.
    return () => {};
  }, []);


  const login = async (data: LoginData) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to log in");
      }

      const result = await response.json();
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userData", JSON.stringify(result.user));
      setUser(result.user);
      queryClient.clear();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
      queryClient.clear();
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}