import express from "express";
import cors from "cors";
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

// ✅ הגדרות CORS - רק לפרודקשן
app.use(
  cors({
    origin: "https://www.respondify-crm.co.il", // רק הדומיין האמיתי
    credentials: true, // כדי לאפשר קבצי cookie
  })
);

app.use(cookieParser());

const port = process.env.PORT || 8801;

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

// ✅ הפעלת שרת
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
