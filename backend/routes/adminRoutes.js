import express from "express";
import { db } from "../utils/dbSingleton.js";
import jwt from "jsonwebtoken";

import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

export default router;
