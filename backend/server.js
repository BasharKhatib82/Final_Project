import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import "./utils/cronTasks.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import leadProgressRoutes from "./routes/leadProgressRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

const port = process.env.PORT || 8801;

// ✅ ראוטים עם נתיבים ברורים
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/leads", leadsRoutes);
app.use("/leadProgress", leadProgressRoutes);
app.use("/roles", rolesRoutes);
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/projects", projectsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/logs", logsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
