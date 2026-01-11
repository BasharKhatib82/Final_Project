// backend\utils\verifyToken.js
import jwt from "jsonwebtoken";

/**
 * "token" בשם Cookie מתוך JWT אימות
 * מה מקבל: req, res, next
 *req.user עם next מחזיר: 401 אם חסר/לא תקין, אחרת
 */
export default function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "הגישה לעמוד זה מיועדת למשתמשים מחוברים. אנא התחבר למערכת.",
    });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "התחברות לא תקפה" });
  }
}

/**
 * Cookie אופציונלי מתוך JWT אימות
 *  מקבל: req, res, next
 *  req.user=null אחרת req.user אם הטוקן תקין וימלא next מחזיר: תמיד
 */
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.token;
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
