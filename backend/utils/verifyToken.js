// utils/verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    //  נבדוק קודם אם יש טוקן בעוגיה או בכותרת Authorization
    const token =
      req.cookies?.token ||
      (req.headers["authorization"]?.startsWith("Bearer ")
        ? req.headers["authorization"].split(" ")[1]
        : null);

    if (!token) {
      return res
        .status(403)
        .json({ Status: false, Error: "אין טוקן — גישה אסורה" });
    }

    // ✅ אימות מול הסוד
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ Status: false, Error: "טוקן לא תקין או פג תוקף" });
      }

      // 📌 שמירה ל־req.user כך שכל ראוטר יוכל להשתמש בו
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("שגיאה ב־verifyToken:", err);
    return res.status(500).json({ Status: false, Error: "שגיאת אימות בשרת" });
  }
};

export default verifyToken;
