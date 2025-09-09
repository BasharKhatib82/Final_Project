// frontend\src\utils\api.js

import axios from "axios";
import extractApiError from "./extractApiError";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // https://api.respondify-crm.co.il
  withCredentials: true, // תמיד שולח/מקבל קוקיז
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// נוסיף הודעת שגיאה נוחה
api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.userMessage = extractApiError(err, "שגיאה כללית");
    return Promise.reject(err);
  }
);
