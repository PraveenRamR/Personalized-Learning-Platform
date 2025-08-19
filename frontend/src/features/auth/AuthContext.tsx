import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthProvider initialized, checking stored credentials');
    console.log('Stored token exists:', !!storedToken);
    console.log('Stored user exists:', !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Successfully parsed user data:', parsedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        // Handle JSON parse error
        console.error('Error parsing stored user data', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await apiLogin(username, password);
      
      if (data.access) {
        localStorage.setItem('token', data.access);
        
        // Fetch user profile or use user data if available
        const userData = data.user || {
          username,
          id: 0,  // placeholder
          email: '',
          is_staff: false
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(data.access);
        setUser(userData);
        return data;
      }
      
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const data = await apiRegister(userData);
      
      if (data.access) {
        localStorage.setItem('token', data.access);
        
        // Use user data if available or set placeholder
        const user = data.user || {
          username: userData.username,
          id: 0,
          email: userData.email || '',
          is_staff: false
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        setToken(data.access);
        setUser(user);
        return data;
      }
      
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
