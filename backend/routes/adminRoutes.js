import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verifyToken from "../utils/verifyToken.js";
import dbSingleton from "../utils/dbSingleton.js";

const connection = dbSingleton.getConnection();
const router = express.Router();

export default router;
