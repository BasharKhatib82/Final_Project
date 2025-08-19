import mysql from "mysql2";

// ✅ שימוש ב-Connection Pooling - הדרך המקצועית והנכונה
// במקום חיבור יחיד, אנו יוצרים מאגר של חיבורים.
// האפליקציה תבקש חיבור מהמאגר, תשתמש בו, ותחזיר אותו.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // ✅ אפשרויות חשובות ל-Pool:
  waitForConnections: true, // אם כל החיבורים בשימוש, המאגר ימתין לחיבור פנוי
  connectionLimit: 10, // הגבלת מספר החיבורים במאגר
  queueLimit: 0, // אין הגבלה על כמות הבקשות הממתינות בתור
});

// ✅ פונקציה לבדיקת החיבור למסד הנתונים
const testDbConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("❌ Error connecting to database pool:", err);
        // שגיאות אפשריות: ER_DBACCESS_DENIED_ERROR, PROTOCOL_CONNECTION_LOST, etc.
        return reject(err);
      }
      console.log("✅ Successfully connected to MySQL pool!");
      connection.release(); // שיחרור החיבור בחזרה למאגר
      resolve();
    });
  });
};

// ✅ יצירת Singleton wrapper לפונקציות הגישה
// זה מאפשר להשתמש בקוד שלך בפשטות כמו קודם
const db = {
  // הפונקציה המקצועית לביצוע שאילתות
  query: (sql, values) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, values, (err, results) => {
        if (err) {
          // מדווח על השגיאה ודוחה את ה-Promise
          console.error("⚠️ Database query error:", err);
          return reject(err);
        }
        resolve(results);
      });
    });
  },

  // פונקציה לביצוע שאילתות אסינכרוניות עם Promises
  // במקרה הזה, כבר עשינו את זה עם mysql2, אבל זו צורה נפוצה
  // getAsyncConnection: () => {
  //   return pool.promise();
  // }
};

export { db, testDbConnection };
