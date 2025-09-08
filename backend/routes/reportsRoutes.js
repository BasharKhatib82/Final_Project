// backend\routes\reportsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  downloadReport,
  previewReport,
  sendReportByEmail,
} from "../controllers/reports.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** POST /reports/download – xlsx/pdf הורדת דוח */
router.post("/download", downloadReport);

/** POST /reports/preview – בחלון PDF תצוגת   */
router.post("/preview", previewReport);

/** POST /reports/send-email – שליחת דוח במייל */
router.post("/send-email", sendReportByEmail);

export default router;
