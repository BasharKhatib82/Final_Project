// frontend\src\components\MyRoutes.jsx

/**
 * קובץ: MyRoutes.jsx
 * ------------------
 * אחראי על ניהול הניווט (Routing) בין כל דפי המערכת:
 *
 *  דפי מערכת כלליים:
 * - דף הבית, אודות, צור קשר, התחברות, שחזור סיסמה
 *
 *  דפי לוח ניהול (Dashboard):
 * - תפקידים, משתמשים, נוכחות, לידים, פרויקטים, משימות, לוגים, פרופיל
 *
 *  דף הרשאה חסרה + טיפול בהתנתקות אוטומטית
 *
 *  תלות:
 * - react-router-dom
 * - useInactivityLogout – מנתק משתמש לא פעיל
 * - Header, Footer, כל דפי המשנה (Pages, Dashboard, etc.)
 */

import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import HomePage from "./Pages/HomePage";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Header from "./Pages/Header";
import Login from "./Pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

import Dashboard from "./Dashboard/Dashboard";
import Home from "./Dashboard/Home";

import Roles from "./Roles/Roles";
import AddRole from "./Roles/AddRole";
import EditRole from "./Roles/EditRole";

import Users from "./Users/Users";
import AddUser from "./Users/AddUser";
import EditUser from "./Users/EditUser";

import Attendance from "./Attendance/Attendance";
import AddAttendance from "./Attendance/AddAttendance";
import EditAttendance from "./Attendance/EditAttendance";

import Leads from "./Leads/Leads";
import AddLead from "./Leads/AddLead";
import EditLead from "./Leads/EditLead";
import LeadDetails from "./Leads/LeadDetails";

import Projects from "./Projects/Projects";
import AddProject from "./Projects/AddProject";

import Tasks from "./Tasks/Tasks";
import AddTask from "./Tasks/AddTask";
import EditProject from "./Projects/EditProject";

import Logs from "./Logs/Logs";

import Profile from "./Profile";
import Footer from "./Pages/Footer";
import EditTask from "./Tasks/EditTask";
import TaskDetails from "./Tasks/TaskDetails";

import NotFound from "./Pages/NotFound";

import useInactivityLogout from "../utils/useInactivityLogout.js";

function MyRoutes() {
  useInactivityLogout();
  const location = useLocation();

  // ✅ אם דף נחיתה – תחזיר אותו בלבד בלי שום עטיפה
  if (location.pathname === "/landingPage/links") {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col ">
      {/* Header */}
      <header className="shrink-0">
        <Header />
      </header>

      {/* תוכן ראשי - מתרחב ותופס את רוב המסך */}
      <main className="grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/userlogin" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Home />} />
            <Route path="roles" element={<Roles />} />
            <Route path="add_role" element={<AddRole />} />
            <Route path="edit_role/:id" element={<EditRole />} />
            <Route path="users" element={<Users />} />
            <Route path="add_user" element={<AddUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="add_attendance" element={<AddAttendance />} />
            <Route path="edit_attendance/:id" element={<EditAttendance />} />
            <Route path="leads" element={<Leads />} />
            <Route path="add_lead" element={<AddLead />} />
            <Route path="edit_lead/:id" element={<EditLead />} />
            <Route path="details_lead/:id" element={<LeadDetails />} />

            <Route path="projects" element={<Projects />} />
            <Route path="add_project" element={<AddProject />} />
            <Route path="edit_project/:id" element={<EditProject />} />

            <Route path="tasks" element={<Tasks />} />
            <Route path="add_task" element={<AddTask />} />
            <Route path="edit_task/:id" element={<EditTask />} />
            <Route path="details_task/:id" element={<TaskDetails />} />

            <Route path="logs" element={<Logs />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer  */}
      <footer className="shrink-0">
        <Footer />
      </footer>
    </div>
  );
}

export default MyRoutes;
