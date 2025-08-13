// checkPermission.js

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    // אם אין req.user => אין טוקן תקין
    if (!req.user) {
      return res
        .status(401)
        .json({ Status: false, Error: "אין הרשאה — לא מחובר" });
    }

    // אם ההרשאה לא קיימת ב-token
    if (typeof req.user[permissionName] === "undefined") {
      return res
        .status(403)
        .json({ Status: false, Error: "אין הרשאה — שדה הרשאה לא קיים" });
    }

    // אם ההרשאה = 0 או false
    if (!req.user[permissionName]) {
      return res
        .status(403)
        .json({ Status: false, Error: "אין הרשאה לפעולה זו" });
    }

    // יש הרשאה — ממשיך
    next();
  };
};

export default checkPermission;
