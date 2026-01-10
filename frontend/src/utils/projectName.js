import { api } from "./api";

/**
 * מביא שם מלא לפי user_id
 * @param {string} userId
 * @returns {Promise<string>} - השם המלא או מחרוזת ריקה אם יש שגיאה
 */
export const fetchProjectNameById = async (projectId) => {
  try {
    const res = await api.get(`/projects/${projectId}`);
    const { name } = res.data || {};
    return name || "";
  } catch (err) {
    console.error("שגיאה בשליפת שם:", err);
    return "";
  }
};
