// backend\routes\rolesRoutes.js

import express from "express";
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

/** הוספת תפקיד חדש ==> POST /roles/add */
router.post("/add", verifyToken, addRole);

/** שליפת תפקידים פעילים ==> GET /roles/active */
router.get("/active", verifyToken, getActiveRoles);

/** שליפת תפקידים לא פעילים ==> GET /roles/inactive  */
router.get("/inactive", verifyToken, getInactiveRoles);

/** שליפת כל התפקידים ==> GET /roles */
router.get("/", verifyToken, getAllRoles);

/** שליפת תפקיד לפי מזהה ==> GET /roles/:id */
router.get("/:id", verifyToken, getRoleById);

/** עדכון תפקיד לפי מזהה ==> PUT /roles/:id */
router.put("/:id", verifyToken, updateRole);

/** מחיקה לוגית של תפקיד PUT /roles/delete/:id */
router.put("/delete/:id", verifyToken, deleteRole);

export default router;
