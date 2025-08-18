import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import Header from "./Pages/Header.jsx";
import Login from "./Pages/Login.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Home from "./Dashboard/Home.jsx";

import Roles from "./Roles/Roles.jsx";
import AddRole from "./Roles/AddRole.jsx";
import EditRole from "./Roles/EditRole.jsx";

import Users from "./Users/Users.jsx";
import AddUser from "./Users/AddUser.jsx";
import EditUser from "./Users/EditUser.jsx";

import SuccessMessage from "./SuccessMessage.jsx";

import Attendance from "./Attendance/Attendance.jsx";
import AddAttendance from "./Attendance/AddAttendance.jsx";
import EditAttendance from "./Attendance/EditAttendance.jsx";

import Leads from "./Leads/Leads.jsx";
import AddLead from "./Leads/AddLead.jsx";
import EditLead from "./Leads/EditLead.jsx";
import LeadDetails from "./Leads/LeadDetails.jsx";

import Projects from "./Projects/Projects.jsx";
import AddProject from "./Projects/AddProject.jsx";

import Tasks from "./Tasks/Tasks.jsx";
import AddTask from "./Tasks/AddTask.jsx";
import EditProject from "./Projects/EditProject.jsx";

import Logs from "./Logs/Logs.jsx";

import Profile from "./Profile.jsx";
import Unauthorized from "./Pages/Unauthorized.jsx";
import Footer from "./Pages/Footer.jsx";
import EditTask from "./Tasks/EditTask.jsx";
import TaskDetails from "./Tasks/TaskDetails.jsx";

function MyRoutes() {
  return (
    <div className="min-h-screen flex flex-col ">
      {/* Header - גובה קבוע, לא תופס מקום נוסף */}
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
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Home />} />
            <Route path="roles" element={<Roles />} />
            <Route path="add_role" element={<AddRole />} />
            <Route path="edit_role/:id" element={<EditRole />} />
            <Route path="users" element={<Users />} />
            <Route path="add_user" element={<AddUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="add_user/success" element={<SuccessMessage />} />
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
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="shrink-0">
        <Footer />
      </footer>
    </div>
  );
}

export default MyRoutes;
