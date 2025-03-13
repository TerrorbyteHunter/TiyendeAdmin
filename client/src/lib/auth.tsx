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
  login: (data: LoginData) => Promise<void>;
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
  
  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      const userData = localStorage.getItem("userData");
      
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }
    }
    
    setIsLoading(false);
  }, []);
  
  // Set auth token on all requests
  useEffect(() => {
    const requestInterceptor = (config: RequestInit) => {
      const token = localStorage.getItem("authToken");
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      
      return config;
    };
    
    // Add interceptor here if using a more complex fetch setup
    
    return () => {
      // Remove interceptor here if needed
    };
  }, []);
  
  const login = async (data: LoginData) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      // Store token and user data
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userData", JSON.stringify(result.user));
      
      setUser(result.user);
      
      // Reset any cached queries
      queryClient.clear();
      
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await apiRequest("POST", "/api/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Even if server request fails, clear local state
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
      
      // Reset any cached queries
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
