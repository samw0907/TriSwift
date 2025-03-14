import React, { createContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loginUser: (token: string) => void;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const loginUser = (token: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
