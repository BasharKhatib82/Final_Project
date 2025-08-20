// utils/dbSingleton.js
import mysql from "mysql2/promise";

// ✅ יצירת Connection Pool עם Promise API
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4_general_ci", // ✅ תמיכה בעברית ואמוג'י
});

// ✅ מאזין לשגיאות מה-Pool
db.on("error", (err) => {
  console.error("❌ Unexpected DB error:", err);
});

// ✅ פונקציה לבדיקת חיבור – להריץ פעם אחת בעת עליית השרת
export const testDbConnection = async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Connected to MySQL (Promise Pool)!");
    conn.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
};

export { db };
