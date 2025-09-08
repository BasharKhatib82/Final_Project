// backend\routes\attendanceRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  addAttendance,
  listAttendances,
  getAttendanceById,
  updateAttendance,
  generateAbsenceReport,
  checkIn,
  checkOut,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** POST /attendance/add – הוספת נוכחות */
router.post("/add", addAttendance);

/** GET /attendance – שליפת כל הנוכחויות (עם פרטי עובדים) */
router.get("/", listAttendances);

/** GET /attendance/:id – שליפת נוכחות לפי מזהה */
router.get("/:id", getAttendanceById);

/** PUT /attendance/edit/:id – עדכון רשומת נוכחות */
router.put("/edit/:id", updateAttendance);

/** GET /attendance/generate-absence-report – דוח היעדרויות להיום */
router.get("/generate-absence-report", generateAbsenceReport);

/** POST /attendance/check-in – החתמת כניסה להיום */
router.post("/check-in", checkIn);

/** POST /attendance/check-out – החתמת יציאה להיום */
router.post("/check-out", checkOut);

export default router;
