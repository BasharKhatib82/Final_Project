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
import taskProgressRoutes from "./routes/taskProgressRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import flowDataRoutes from "./routes/flowDataRoutes.js";

dotenv.config();
const app = express();

// Set the origins that are allowed to make requests
const allowedOrigins = [
  "https://www.respondify-crm.co.il",
  "http://www.respondify-crm.co.il",
  "http://localhost:3000",
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin is in our allowed list or if it's a same-origin request 
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// Use standard middlewares
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 8801;

// Define routes
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

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
