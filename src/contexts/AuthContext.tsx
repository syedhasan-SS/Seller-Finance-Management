import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'owner' | 'admin' | 'viewer' | 'vendor';

interface AuthContextType {
  token: string | null;
  supplierId: string | null;
  supplierHandle: string | null;
  supplierEmail: string | null;
  userName: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;   // owner or admin
  isOwner: boolean;   // owner only
  isViewer: boolean;  // viewer only
  loading: boolean;
  login: (token: string, handle: string, email: string, role?: UserRole, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [supplierHandle, setSupplierHandle] = useState<string | null>(null);
  const [supplierEmail, setSupplierEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedHandle = localStorage.getItem('supplier_handle');
    const storedEmail = localStorage.getItem('supplier_email');
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role') as UserRole | null;

    if (storedToken) {
      setToken(storedToken);
      setSupplierHandle(storedHandle);
      setSupplierEmail(storedEmail);
      setUserName(storedName);
      setRole(storedRole);
    }

    setLoading(false);
  }, []);

  const login = (
    newToken: string,
    handle: string,
    email: string,
    newRole: UserRole = 'vendor',
    name?: string
  ) => {
    setToken(newToken);
    setSupplierHandle(handle);
    setSupplierEmail(email);
    setRole(newRole);
    setUserName(name || handle);

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('supplier_handle', handle);
    localStorage.setItem('supplier_email', email);
    localStorage.setItem('user_role', newRole);
    if (name) localStorage.setItem('user_name', name);
  };

  const logout = () => {
    setToken(null);
    setSupplierHandle(null);
    setSupplierEmail(null);
    setRole(null);
    setUserName(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supplier_handle');
    localStorage.removeItem('supplier_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const value: AuthContextType = {
    token,
    supplierId: supplierHandle,
    supplierHandle,
    supplierEmail,
    userName,
    role,
    isAuthenticated: !!token,
    isAdmin: role === 'owner' || role === 'admin',
    isOwner: role === 'owner',
    isViewer: role === 'viewer',
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
