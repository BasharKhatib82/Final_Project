// frontend/src/utils/api/auth.js


import { api } from "../api";

/**
 * JWT בקשת המשתמש הנוכחי לפי
 */
export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data.data;
};

/**
 * התנתקות משתמש
 */
export const logoutUser = async (userId) => {
  await api.post("/auth/logout", { user_id: userId });
};
