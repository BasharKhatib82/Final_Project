// backend\routes\contactRoutes.js
import express from "express";
import { sendContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

/** POST /contact – שליחת טופס צור קשר (JWT ציבורי, ללא ) */
router.post("/", sendContactForm);

export default router;
