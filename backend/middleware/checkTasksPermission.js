export default function checkTasksPermission(req, res, next) {
  const user = req.user;

  if (user?.tasks_page_access === 1) {
    return next(); // יש לו הרשאה לפחות לאחת מהפעולות
  }

  return res.status(403).json({
    success: false,
    message: "אין לך הרשאה לגשת לדף המשימות.",
  });
}
