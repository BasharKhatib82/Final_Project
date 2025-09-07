// backend\app.js

import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./utils/cronTasks.js";
import routes from "./routes/index.js"; // ריכוז הראוטים בקובץ אחד

const app = express();

// JSON
app.use(express.json({ limit: "10mb" }));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Static files
app.use("/fonts", express.static(path.join(process.cwd(), "public/fonts")));

// Cookie
app.use(cookieParser());

// ראוטים
routes(app);

export default app;
