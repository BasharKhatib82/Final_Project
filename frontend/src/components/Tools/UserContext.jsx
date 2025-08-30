import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

const api = process.env.REACT_APP_API_URL;

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${api}/auth/check`, {
          withCredentials: true,
        });

        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth Check Failed:", err);
        setUser(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    axios
      .post(
        `${api}/auth/logout`,
        { user_id: user?.user_id },
        { withCredentials: true }
      )
      .then(() => {
        setUser(null);
      })
      .catch((err) => console.error("Logout Error:", err));
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, authChecked, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
