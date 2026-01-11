// backend\routes\rolesRoutes.js

import express from "express";
import requirePermission from "../middlewares/permissions.js";
import verifyToken from "../utils/verifyToken.js";
import {
  addRole,
  getAllRoles,
  getActiveRoles,
  getInactiveRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/roles.controller.js";

const router = express.Router();

// החלת אימות טוקן על כל הראוטים
router.use(verifyToken);

// הוספת בדיקת הרשאות על כל הראוטים
router.use(requirePermission);

/** הוספת תפקיד חדש ==> POST /roles/add */
router.post("/add", addRole);

/** שליפת תפקידים פעילים ==> GET /roles/active */
router.get("/active", getActiveRoles);

/** שליפת תפקידים לא פעילים ==> GET /roles/inactive  */
router.get("/inactive", getInactiveRoles);

/** שליפת כל התפקידים ==> GET /roles */
router.get("/", getAllRoles);

/** שליפת תפקיד לפי מזהה ==> GET /roles/:id */
router.get("/:id", getRoleById);

/** עדכון תפקיד לפי מזהה ==> PUT /roles/:id */
router.put("/:id", updateRole);

/** מחיקה לוגית של תפקיד PUT /roles/delete/:id */
router.put("/delete/:id", deleteRole);

export default router;
