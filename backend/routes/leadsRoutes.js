// backend\routes\leadsRoutes.js

import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  listLeads,
  getLeadById,
  addLead,
  editLead,
  updateLeadRep,
  cancelLead,
  updateLeadStatus,
  bulkAssign,
} from "../controllers/leads.controller.js";

const router = express.Router();

// אימות טוקן לכל הראוטים
router.use(verifyToken);

/** GET /leads – שליפת כל הפניות */
router.get("/", listLeads);

/** GET /leads/:id – שליפת פנייה לפי מזהה */
router.get("/:id", getLeadById);

/** POST /leads/add – יצירת פנייה חדשה */
router.post("/add", addLead);

/** PUT /leads/edit/:id – עדכון פנייה */
router.put("/edit/:id", editLead);

/** PUT /leads/update-rep/:id – עדכון נציג לפנייה  */
router.put("/update-rep/:id", updateLeadRep);

/** DELETE /leads/delete/:id – מחיקה לוגית (סימון 'בוטלה') */
router.delete("/delete/:id", cancelLead);

/** PUT /leads/update-status/:id – עדכון סטטוס לפנייה */
router.put("/update-status/:id", updateLeadStatus);

/** PUT /leads/bulk-assign – שיוך מרוכז של פניות לנציג */
router.put("/bulk-assign", bulkAssign);

export default router;
