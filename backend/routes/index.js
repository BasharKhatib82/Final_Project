// backend\routes\index.js

import authRoutes from "./authRoutes.js";
import projectsRoutes from "./projectsRoutes.js";
import leadsRoutes from "./leadsRoutes.js";
import leadProgressRoutes from "./leadProgressRoutes.js";
import rolesRoutes from "./rolesRoutes.js";
import tasksRoutes from "./tasksRoutes.js";
import taskProgressRoutes from "./taskProgressRoutes.js";
import usersRoutes from "./usersRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import logsRoutes from "./logsRoutes.js";
import reportsRouter from "./reportsRoutes.js";
import contactRoutes from "./contactRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

/**
 * רישום כל הראוטים באפליקציה בצורה מרוכזת
 */
export default function routes(app) {
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
  app.use("/reports", reportsRouter);
  app.use("/contact", contactRoutes);
   app.use("/public", publicRoutes);
}
