// backend\utils\requireAdmin.js


/**
 * (role_id === 1) : מאפשר גישה רק למנהל כללי 
 * מה מקבל: req, res, next
 * מה מחזיר:
 *   - 401 אם המשתמש לא מחובר
 *   - 403 אם אין למשתמש הרשאה מתאימה
 *   - next() אחרת קורא ל ־
 */
export default function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "נא להתחבר" });
  }
  if (Number(req.user.role_id) !== 1) {
    return res
      .status(403)
      .json({ success: false, message: "גישה מוגבלת למנהל כללי בלבד" });
  }
  return next();
}
