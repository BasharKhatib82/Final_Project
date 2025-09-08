// backend\utils\dbSingleton.js
import mysql from "mysql2/promise";

/**
 *  UTC עם תמיכה בעברית MySQL (Promise API) יחיד ל Pool
 */
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_PORT = 3306,
  DB_CONN_LIMIT = 10,
} = process.env;

export const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: Number(DB_CONN_LIMIT),
  queueLimit: 0,
  charset: "utf8mb4_general_ci",
  multipleStatements: false,
  timezone: "Z", //  UTC (מונע הפרשי אזורי זמן)
});

/**
 * בדיקת חיבור מהירה — להריץ עם עליית השרת.
 */
export async function testDbConnection() {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    if (rows?.[0]?.ok === 1) {
      console.log("Connected to MySQL (Promise Pool, UTC timezone)");
    } else {
      console.warn("Unexpected test result:", rows);
    }
  } catch (err) {
    console.error("DB connection failed:", err?.message || err);
  }
}
