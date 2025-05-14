import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8801/check-auth", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setUser(res.data.user);
        }
      })
      .catch((err) => console.error("Auth Check Failed:", err));
  }, []);

  const logout = () => {
    axios
      .post("http://localhost:8801/logout", null, { withCredentials: true })
      .then(() => setUser(null))
      .catch((err) => console.error("Logout Error:", err));
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
