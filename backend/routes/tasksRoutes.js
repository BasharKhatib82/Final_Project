import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dbSingleton from "../utils/dbSingleton.js";
import logAction from "../utils/logAction.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

export default router;
