// backend\routes\taskProgressRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listTaskProgress,
  addTaskProgress,
} from "../controllers/taskProgress.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /tasks/progress/:task_id – שליפת כל התיעוד למשימה */
router.get("/:task_id", listTaskProgress);

/** POST /tasks/progress/add – הוספת תיעוד + עדכון סטטוס */
router.post("/add", addTaskProgress);

export default router;
