// backend\routes\leadProgressRoutes.js

import { Router } from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listLeadProgress,
  addLeadProgress,
} from "../controllers/leadProgress.controller.js";

const router = Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /leads/progress/:lead_id – שליפת כל תיעודי ההתקדמות לפנייה */
router.get("/:lead_id", listLeadProgress);

/** POST /leads/progress/add – הוספת תיעוד + עדכון סטטוס */
router.post("/add", addLeadProgress);

export default router;
