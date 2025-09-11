// backend\routes\authRoutes.js

import express from "express";
import optionalAuth  from "../utils/verifyToken.js";
import {
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

/** התחברות משתמש ==> POST /auth/login */
router.post("/login", login);

/** התנתקות משתמש ==> POST /auth/logout */
router.post("/logout", logout);

/** JWT בדיקת משתמש מחובר לפי ==> GET /auth/me */
router.get("/me", optionalAuth, getCurrentUser);

/** שליחת טוקן איפוס סיסמה למייל ==> POST /auth/forgot-password */
router.post("/forgot-password", forgotPassword);

/**הגדרת סיסמה חדשה לפי טוקן ==> POST /auth/reset-password */
router.post("/reset-password", resetPassword);

export default router;
