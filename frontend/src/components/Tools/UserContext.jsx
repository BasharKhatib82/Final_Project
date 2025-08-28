import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();
const api = process.env.REACT_APP_API_URL;

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // פשוט בודק תמיד, כי הטוקן ב־cookie HttpOnly נשלח אוטומטית
    axios
      .get(`${api}/auth/check`, { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("Auth Check Failed:", err);
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const logout = () => {
    axios
      .post(`${api}/auth/logout`, null, { withCredentials: true })
      .then(() => {
        setUser(null); // לא צריך למחוק טוקן, כי הוא בקוקי HttpOnly
      })
      .catch((err) => console.error("Logout Error:", err));
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, authChecked }}>
      {children}
    </UserContext.Provider>
  );
};
