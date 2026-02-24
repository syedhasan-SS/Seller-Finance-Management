import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  supplierId: string | null;
  supplierHandle: string | null;
  supplierEmail: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, handle: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [supplierHandle, setSupplierHandle] = useState<string | null>(null);
  const [supplierEmail, setSupplierEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedHandle = localStorage.getItem('supplier_handle');
    const storedEmail = localStorage.getItem('supplier_email');

    if (storedToken) {
      setToken(storedToken);
      setSupplierHandle(storedHandle);
      setSupplierEmail(storedEmail);
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, handle: string, email: string) => {
    setToken(newToken);
    setSupplierHandle(handle);
    setSupplierEmail(email);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('supplier_handle', handle);
    localStorage.setItem('supplier_email', email);
  };

  const logout = () => {
    setToken(null);
    setSupplierHandle(null);
    setSupplierEmail(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supplier_handle');
    localStorage.removeItem('supplier_email');
    navigate('/login');
  };

  const value: AuthContextType = {
    token,
    supplierId: supplierHandle, // Using handle as ID for now
    supplierHandle,
    supplierEmail,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
