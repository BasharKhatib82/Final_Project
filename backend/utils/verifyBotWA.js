// middlewares/verifyBot.js
export function verifyBotWA(req, res, next) {
  const secret = req.headers["x-bot-secret"];
  if (!secret || secret !== process.env.BOT_SECRET_WA) {
    return res.status(403).json({ Status: false, Error: "גישה לא מורשית" });
  }
  next();
}
