import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedSchool = localStorage.getItem("school");
    const token = localStorage.getItem("token");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedSchool) {
        setSchool(JSON.parse(storedSchool));
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials, isSuperAdmin = false) => {
    try {
      setError(null);
      const response = isSuperAdmin
        ? await authApi.superAdminLogin(credentials)
        : await authApi.login(credentials);

      if (response.success) {
        const { token, user: userData, school: schoolData } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        if (schoolData) {
          localStorage.setItem("school", JSON.stringify(schoolData));
          setSchool(schoolData);
        }
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setSchool(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const value = {
    user,
    school,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isSuperAdmin: user?.isSuperAdmin || false,
    userType: user?.user_type || user?.role || null,
    schoolId: school?.id || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
