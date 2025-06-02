import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  return (
    <div className="flex min-h-[calc(100vh-124px)]">
      {" "}
      {/* נניח שההדר גובהו 80px */}
      {/* Sidebar בצד */}
      <aside className=" bg-gray-800 text-white">
        <Sidebar />
      </aside>
      {/* אזור התוכן */}
      <main className="flex-grow bg-white/80 p-4 ">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
