import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verifyToken from "../utils/verifyToken.js";
import dbSingleton from "../utils/dbSingleton.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

export default router;
