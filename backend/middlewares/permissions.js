// backend/middlewares/permissions.js
import { roleFields } from "../utils/permissions.js";

export function requirePermission(fieldName) {
  return (req, res, next) => {
    if (!roleFields.includes(fieldName)) {
      return res.status(500).json({
        success: false,
        message: "אין לך הרשאה לגשת לדף זה אנא צור קשר עם המנהל !!",
      });
    }

    const hasPermission = req.user?.[fieldName] === 1;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "אין לך הרשאה לגשת לדף זה אנא צור קשר עם המנהל !!",
      });
    }

    next();
  };
}
