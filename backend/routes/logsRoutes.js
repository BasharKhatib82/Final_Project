// backend\routes\logsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import { listLogs } from "../controllers/logs.controller.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { authorizePage } from "../middleware/authorizePage.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /logs – שליפה לוג פעילות כולל שם מלא של מבצע הפעולה  */
router.get("/", authenticateToken, authorizePage("logs_page_access"), listLogs);

export default router;
