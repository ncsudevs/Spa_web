import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getMe,
  login as loginApi,
  register as registerApi,
} from "../features/auth/api/authApi";
import {
  clearAuth,
  getCurrentUser,
  getToken,
  isAuthenticated,
  saveAuth,
} from "../shared/utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(() => isAuthenticated());

  useEffect(() => {
    const sync = () => {
      setUser(getCurrentUser());
      setToken(getToken());
    };

    window.addEventListener("authChanged", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("authChanged", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        saveAuth({ token, user: me });
        setUser(me);
      } catch {
        clearAuth();
        setUser(null);
        setToken("");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function login(payload) {
    const data = await loginApi(payload);
    saveAuth(data);
    setUser(data.user);
    setToken(data.token);
    return data;
  }

  async function register(payload) {
    const data = await registerApi(payload);
    saveAuth(data);
    setUser(data.user);
    setToken(data.token);
    return data;
  }

  function logout() {
    clearAuth();
    setUser(null);
    setToken("");
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
