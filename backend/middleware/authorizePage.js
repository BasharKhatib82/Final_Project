//  middleware לאימות הרשאות גישה לעמודים שונים בהתאם לשדה הרשאה במודל המשתמש
export function authorizePage(permissionField) {
  return function (req, res, next) {
    const user = req.user;
    if (!user || user[permissionField] !== 1) {
      return res
        .status(403)
        .json({ success: false, message: "אין לך גישה לעמוד זה" });
    }
    next();
  };
}
