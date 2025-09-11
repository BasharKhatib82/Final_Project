// backend\utils\dbSingleton.js

import mysql from "mysql2/promise";

/**
 * Singleton בתבנית MySQL מודול ניהול חיבור למסד הנתונים  .
 * ----------------------------------------------------------
 * Connection Pool יחיד של חיבורים Pool כאן אנחנו יוצרים ,
 * כך שכל חלקי המערכת ישתמשו באותו אובייקט חיבורים.
 * היתרון: ניהול יעיל של משאבים, ביצועים טובים יותר, ומניעת
 * בעיות של יצירת חיבורים מרובים ומיותרים.
 *
 * הגדרות נוספות:
 * - מלא עם תמיכה בעברית UTF8 קידוד  .
 * - כדי למנוע בעיות אזורי זמן UTC עבודה ב  .
 * -  async/await לעבודה נוחה עם mysql2 של Promise API שימוש ב .
 */

// קריאת משתני סביבה להגדרות החיבור
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
