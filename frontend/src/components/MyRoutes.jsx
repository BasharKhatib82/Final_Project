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

import SuccessMessage from "./SuccessMessage";

import Attendances from "./Attendances/Attendances";
import AddAttendance from "./Attendances/AddAttendance";
import EditAttendance from "./Attendances/EditAttendance";

import Leads from "./Leads/Leads";
import AddLead from "./Leads/AddLead";

import Courses from "./Courses/Courses";
import AddCourse from "./Courses/AddCourse";

import Tasks from "./Tasks/Tasks";
import AddTask from "./Tasks/AddTask";

import Logs from "./Logs/Logs";

import Profile from "./Profile";
import Unauthorized from "./Pages/Unauthorized";
import Footer from "./Pages/Footer";
import "../assets/styles/Pages.css";

function MyRoutes() {
  return (
    <>
      <Header />
      <div className="main">
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/about" element={<About />}></Route>
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/userlogin" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="" element={<Home />}></Route>
            <Route path="/dashboard/roles" element={<Roles />}></Route>
            <Route path="/dashboard/add_role" element={<AddRole />}></Route>
            <Route
              path="/dashboard/edit_role/:id"
              element={<EditRole />}
            ></Route>
            <Route path="/dashboard/users" element={<Users />}></Route>
            <Route path="/dashboard/add_user" element={<AddUser />}></Route>
            <Route
              path="/dashboard/add_user/success"
              element={<SuccessMessage />}
            ></Route>
            <Route
              path="/dashboard/attendances"
              element={<Attendances />}
            ></Route>
            <Route
              path="/dashboard/add_attendances"
              element={<AddAttendance />}
            ></Route>
            <Route
              path="/dashboard/edit_attendances"
              element={<EditAttendance />}
            ></Route>
            <Route path="/dashboard/leads" element={<Leads />}></Route>
            <Route path="/dashboard/add_lead" element={<AddLead />}></Route>
            <Route path="/dashboard/courses" element={<Courses />}></Route>
            <Route path="/dashboard/add_course" element={<AddCourse />}></Route>
            <Route path="/dashboard/tasks" element={<Tasks />}></Route>
            <Route path="/dashboard/add_task" element={<AddTask />}></Route>
            <Route path="/dashboard/logs" element={<Logs />}></Route>
            <Route path="/dashboard/profile" element={<Profile />}></Route>
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default MyRoutes;
