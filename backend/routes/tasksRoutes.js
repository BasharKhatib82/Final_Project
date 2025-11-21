// backend\routes\tasksRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listTasks,
  getTaskById,
  addTask,
  updateTask,
  cancelTask,
  updateTaskRep,
  updateTaskStatus,
  bulkAssignTasks,
} from "../controllers/tasks.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /tasks – שליפת כל המשימות */
router.get("/", listTasks);
/** GET /tasks/:id – שליפת משימה לפי מזהה */
router.get(":id", getTaskById);

/** POST /tasks/add – הוספת משימה */
router.post("/add", addTask);

/** PUT /tasks/edit/:id – עדכון משימה */
router.put("/edit/:id", updateTask);

/** DELETE /tasks/delete/:id – מחיקה לוגית  */
router.delete("/delete/:id", cancelTask);

/** PUT /tasks/update-status/:id – עדכון סטטוס משימה */
router.put("/update-status/:id", updateTaskStatus);

/** PUT /tasks/update-rep/:id – עדכון נציג מטפל למשימה  */
router.put("/update-rep/:id", updateTaskRep);

/** PUT /tasks/bulk-assign – שיוך מרובה של משימות לנציג */
router.put("/bulk-assign", bulkAssignTasks);

export default router;
