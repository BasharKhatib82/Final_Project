// backend\utils\verifyToken.js
import jwt from "jsonwebtoken";

/**
 * אימות JWT (Cookie + Authorization Header)
 * ------------------------------------------------
 * מחפש טוקן לפי הסדר:
 * 1. Cookie בשם "token"
 * 2. Authorization: Bearer <token>
 *
 * אם תקין:
 *  - req.user מתמלא
 *  - next()
 *
 * אם לא:
 *  - מחזיר 401
 */
export default function verifyToken(req, res, next) {
  let token = null;

  // 1️⃣ בדיקה ב-Cookie
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2️⃣ בדיקה ב-Authorization Header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ❌ אין טוקן
  if (!token) {
    return res.status(401).json({ success: false, message: "נא להתחבר" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "התחברות לא תקפה" });
  }
}

/**
 * אימות אופציונלי (לא חוסם)
 * ------------------------------------------------
 * אם יש טוקן → req.user מתמלא
 * אם אין / לא תקין → req.user = null
 * תמיד ממשיך next()
 */
export function optionalAuth(req, _res, next) {
  let token = null;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  return next();
}
