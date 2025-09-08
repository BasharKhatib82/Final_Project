// routes/logsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listLogs,
  listAllLogs,
  exportLogsExcel,
  exportLogsPDF,
  sendLogsByEmail,
} from "../controllers/logs.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /logs – שליפה עם עמודים (page, search, from, to) */
router.get("/", listLogs);

/** GET /logs/all – שליפה ללא עמודים (search, from, to) */
router.get("/all", listAllLogs);

/** GET /logs/export/excel – יצוא לאקסל (search, from, to) */
router.get("/export/excel", exportLogsExcel);

/** GET /logs/export/pdf – PDF-יצוא ל (search, from, to) */
router.get("/export/pdf", exportLogsPDF);

/** POST /logs/send-mail – שליחה במייל (email, search, from, to) */
router.post("/send-mail", sendLogsByEmail);

export default router;
