// backend\routes\projectsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listProjects,
  addProject,
  updateProject,
  archiveProject,
  listByStatus,
  getProjectById,
} from "../controllers/projects.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /projects – שליפת כל הפרויקטים */
router.get("/", listProjects);

/** POST /projects/add – הוספת פרויקט חדש */
router.post("/add", addProject);

/** PUT /projects/edit/:id – עדכון פרויקט קיים */
router.put("/edit/:id", updateProject);

/** DELETE /projects/delete/:id – מחיקה לוגית (ארכיון) */
router.delete("/delete/:id", archiveProject);

/** GET /projects/status/:active – שליפה לפי סטטוס (0/1) */
router.get("/status/:active", listByStatus);

/** GET /projects/:id – שליפת פרויקט לפי מזהה */
router.get("/:id", getProjectById);

export default router;
