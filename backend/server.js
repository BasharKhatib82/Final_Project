// backend\server.js

import dotenv from "dotenv";
import { verifySmtp } from "./utils/reports.mailer.js";
dotenv.config();
verifySmtp?.();

import app from "./app.js";
import { testDbConnection } from "./utils/dbSingleton.js";

// הגדרת אזור זמן ברמת האפליקציה
process.env.TZ = "Asia/Jerusalem";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testDbConnection(); // בדיקת חיבור למסד הנתונים
});
