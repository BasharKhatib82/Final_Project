// \backend\routes\publicRoutes.js

import express from "express";
import { addLandingLead } from "../controllers/public.controller.js";

const router = express.Router();

router.post("/landing-leads", addLandingLead);

export default router;
