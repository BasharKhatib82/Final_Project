import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  addUser,
  updateUser,
  deleteUser,
  getActiveUsers,
  getInactiveUsers,
  getUserById,
  changeUserPassword,
} from "../controllers/users.controller.js";

const router = express.Router();

// החלת אימות טוקן על כל הראוטים
router.use(verifyToken);

// הוספת משתמש חדש ==> POST /users/add */
router.post("/add", addUser);
// עדכון פרטי משתמש ==> PUT /users/:id */
router.put("/:id", updateUser);

// מחיקת משתמש (מחיקה לוגית) ==> PUT /users/delete/:id */
router.put("/delete/:id", deleteUser);

// שליפת משתמשים פעילים ==> GET /users/active */
router.get("/active", getActiveUsers);

// שליפת משתמשים לא פעילים ==> GET /users/inactive */
router.get("/inactive", getInactiveUsers);

// שליפת משתמש לפי מזהה ==> GET /users/:id */
router.get("/:id", getUserById);

// שינוי סיסמה למשתמש ==> PUT /users/change-password/:id */
router.put("/change-password/:id", changeUserPassword);

export default router;
