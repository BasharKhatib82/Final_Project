import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();
const api = process.env.REACT_APP_API_URL;

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token"); // או לקחת מ-cookie

    if (!token) {
      // אין טוקן בכלל → המשתמש לא מחובר
      setUser(null);
      setAuthChecked(true);
      return;
    }

    axios
      .get(`${api}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` }, // שולחים טוקן רק אם קיים
        withCredentials: true,
      })
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
        localStorage.removeItem("token");
        setUser(null);
      })
      .catch((err) => console.error("Logout Error:", err));
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, authChecked }}>
      {children}
    </UserContext.Provider>
  );
};
