// backend\routes\dashboardRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /dashboard – סיכומי לוח בקרה  */
router.get("/", getDashboardSummary);

export default router;
