import jwt from "jsonwebtoken";

// middleware לאימות טוקן JWT מהבקשה
export function authenticateToken(req, res, next) {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "אין טוקן" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: "טוקן לא תקין" });
  }
}
