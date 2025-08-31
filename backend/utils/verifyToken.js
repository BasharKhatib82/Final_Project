// utils/verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers["authorization"]?.startsWith("Bearer ")
        ? req.headers["authorization"].split(" ")[1]
        : null);

    // אם אין טוקן בכלל – נמשיך בלי שגיאה
    if (!token) {
      req.user = null;
      return next();
    }

    // אימות טוקן
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        req.user = null; // טוקן לא תקין – גם ממשיכים
        return next();
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("שגיאה ב אימות :", err);
    return res.status(500).json({ Status: false, Error: "שגיאת אימות בשרת" });
  }
};

export default verifyToken;
