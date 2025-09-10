// frontend\src\components\Tools\UserContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    const isPublicPage =
      location.pathname === "/userlogin" ||
      location.pathname === "/forgot-password" ||
      location.pathname.startsWith("/reset-password");

    if (isPublicPage) {
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        setUser(res.data.data);
      } catch (err) {
        if (err.response?.status !== 403) {
          console.error("Auth check failed:", err);
        }
        setUser(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  const logout = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/auth/logout`,
        { user_id: user?.user_id },
        { withCredentials: true }
      )
      .then(() => setUser(null))
      .catch((err) => console.error("Logout error:", err))
      .finally(() => setUser(null));
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, authChecked, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
