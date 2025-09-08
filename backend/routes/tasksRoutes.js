// backend\routes\tasksRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listTasks,
  addTask,
  updateTask,
  cancelTask,
  bulkAssignTasks,
} from "../controllers/tasks.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /tasks – שליפת כל המשימות */
router.get("/", listTasks);

/** POST /tasks/add – הוספת משימה */
router.post("/add", addTask);

/** PUT /tasks/edit/:id – עדכון משימה */
router.put("/edit/:id", updateTask);

/** DELETE /tasks/delete/:id – מחיקה לוגית  */
router.delete("/delete/:id", cancelTask);

/** PUT /tasks/bulk-assign – שיוך מרובה של משימות לנציג */
router.put("/bulk-assign", bulkAssignTasks);

export default router;
