// server.js
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import "./utils/cronTasks.js";

// ✅ ראוטים
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import leadProgressRoutes from "./routes/leadProgressRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import taskProgressRoutes from "./routes/taskProgressRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import flowDataRoutes from "./routes/flowDataRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://www.respondify-crm.co.il");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});



// ✅ ראוטים
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/leads", leadsRoutes);
app.use("/leads/progress", leadProgressRoutes);
app.use("/roles", rolesRoutes);
app.use("/tasks", tasksRoutes);
app.use("/tasks/progress", taskProgressRoutes);
app.use("/users", usersRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/projects", projectsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/logs", logsRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/flows", flowDataRoutes);

// 🚀 Passenger דואג ל־listen, אין צורך ב־app.listen כאן
export default app;
