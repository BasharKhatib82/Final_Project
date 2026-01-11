// backend\routes\logsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import { listLogs } from "../controllers/logs.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /logs – שליפה לוג פעילות כולל שם מלא של מבצע הפעולה  */
router.get("/", listLogs);

export default router;
