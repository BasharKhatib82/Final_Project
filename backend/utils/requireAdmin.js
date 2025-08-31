const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role_id !== 1) {
    return res.status(403).json({ error: "גישה מוגבלת למנהל כללי בלבד" });
  }
  next();
};

export default requireAdmin;
