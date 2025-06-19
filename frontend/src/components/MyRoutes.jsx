import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Header from "./Pages/Header";
import Login from "./Pages/Login";
import Dashboard from "./Dashboard/Dashboard";
import Home from "./Dashboard/Home";

import Roles from "./Roles/Roles";
import AddRole from "./Roles/AddRole";
import EditRole from "./Roles/EditRole";

import Users from "./Users/Users";
import AddUser from "./Users/AddUser";
import EditUser from "./Users/EditUser";

import SuccessMessage from "./SuccessMessage";

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
import Unauthorized from "./Pages/Unauthorized";
import Footer from "./Pages/Footer";

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
