import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, getMeApi, loginApi, registerApi } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    organizationType?: string;
    location?: string;
    role?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'carboncycle_auth_token_v1';
const USER_KEY = 'carboncycle_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Restore session from token on initial mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        const res = await getMeApi(storedToken);
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
    organizationType?: string;
    location?: string;
    role?: string;
  }) => {
    const res = await registerApi(data);
    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
