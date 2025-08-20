// utils/checkPermission.js

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        Status: false,
        Error: "אין הרשאה — משתמש לא מחובר",
      });
    }

    const hasPermission = req.user[permissionName];

    if (!hasPermission) {
      return res.status(403).json({
        Status: false,
        Error: `אין הרשאה לבצע פעולה זו (${permissionName})`,
      });
    }

    // יש הרשאה → ממשיך
    next();
  };
};

export default checkPermission;
