// backend\routes\authRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * התחברות משתמש
 * POST /auth/login
 */
router.post("/login", login);

/**
 * התנתקות משתמש
 * POST /auth/logout
 */
router.post("/logout", logout);

/**
 * בדיקת משתמש מחובר לפי JWT
 * GET /auth/me
 */
router.get("/me", verifyToken, getCurrentUser);

/**
 * שליחת טוקן איפוס סיסמה למייל
 * POST /auth/forgot-password
 */
router.post("/forgot-password", forgotPassword);

/**
 * הגדרת סיסמה חדשה לפי טוקן
 * POST /auth/reset-password
 */
router.post("/reset-password", resetPassword);

export default router;
