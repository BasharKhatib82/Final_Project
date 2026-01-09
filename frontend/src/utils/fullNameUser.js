import { api } from "./api";

/**
 * מביא שם מלא לפי user_id
 * @param {string} userId
 * @returns {Promise<string>} - השם המלא או מחרוזת ריקה אם יש שגיאה
 */
export const fetchFullNameByUserId = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}`);
    const { first_name, last_name } = res.data.data || {};
    return `${first_name || ""} ${last_name || ""}`.trim();
  } catch (err) {
    console.error("שגיאה בשליפת שם:", err);
    return "";
  }
};
