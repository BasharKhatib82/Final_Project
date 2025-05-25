import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import adminRouter from "./routes/adminRoutes.js";
import authRouter from "./routes/authRoutes.js";
import leadsRouter from "./routes/leadsRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import tasksRouter from "./routes/tasksRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

const port = process.env.PORT || 8801;

// ✅ ראוטים עם נתיבים ברורים
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/leads", leadsRouter);
app.use("/roles", rolesRoutes);
app.use("/tasks", tasksRouter);
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/logs", logsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
