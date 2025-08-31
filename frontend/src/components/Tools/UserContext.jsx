import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );
        setUser(res.data.user);
      } catch (err) {
        if (err.response?.status !== 403) {
          console.error("Auth check failed:", err); // רק אם זו שגיאה לא צפויה
        }
        setUser(null); //null אם אין התחברות, נוודא שהמשתמש הוא
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
