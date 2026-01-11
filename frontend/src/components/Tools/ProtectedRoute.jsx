import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./index";

/**
 * קומפוננטה להגנה על דפים לפי הרשאות
 * @param {JSX.Element} children - הקומפוננטה המוגנת
 * @param {string} permission - שם ההרשאה (מהטוקן)
 */
export default function ProtectedRoute({ children, permission }) {
  const { user } = useUser();

  if (user === undefined) return null; // עדיין טוען
  if (!user) return <Navigate to="/" replace />; // לא מחובר
  if (permission && user[permission] !== 1) {
    return <Navigate to="/unauthorized" replace />; // אין הרשאה
  }

  return children;
}
