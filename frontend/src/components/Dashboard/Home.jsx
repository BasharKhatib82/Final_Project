import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LeadsStatusPieChart from "../charts/LeadsStatusPieChart";
import LeadsByDateBarChart from "../charts/LeadsByDateBarChart";
import LeadsBySourceChart from "../charts/LeadsBySourceChart";
import LeadsByUserChart from "../charts/LeadsByUserChart";

const api = process.env.REACT_APP_API_URL;

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${api}/dashboard`, {
        withCredentials: true,
      });
      setStats(res.data.summary);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  if (!stats)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-600">
        טוען נתונים...
      </div>
    );

  const handleClickUsers = () => navigate("/dashboard/users");
  const handleClickRoles = () => navigate("/dashboard/roles");
  const handleClickProjects = () => navigate("/dashboard/projects");
  const handleClickLeads = () => navigate("/dashboard/leads");
  const handleClickTasks = () => navigate("/dashboard/tasks");
  const handleClickAttendance = () => navigate("/dashboard/attendance");
  const handleClickActivityLog = () => navigate("/dashboard/logs");

  return (
    <div className="flex-col flex-grow p-6 font-rubik text-right space-y-6">
      {/* 🔔 פס התראה עליון */}
      {stats.leads.new > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md px-4 py-3 text-center text-sm font-semibold shadow-sm">
          ⚠️ {stats.leads.new} פניות חדשות ממתינות לטיפול
        </div>
      )}

      {/* 📦 כרטיסי סטטיסטיקה - 6 בשורה אחת */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* עובדים */}
        <div
          onClick={handleClickUsers}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-blue-100 text-blue-600 rounded-full p-3 text-2xl">
              👥
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">
            עובדים
          </h4>
          <ul className="text-sm text-gray-600 text-center">
            <li>
              פעילים: <strong>{stats.employees.active}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats.employees.inactive}</strong>
            </li>
            <li>
              מחוברים: <strong>{stats.employees.online_list.length}</strong>
            </li>
          </ul>
        </div>

        {/* מחוברים */}
        <div
          onClick={handleClickUsers}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-green-100 text-green-600 rounded-full p-3 text-2xl">
              🟢
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">
            מחוברים
          </h4>
          <ul className="text-sm text-gray-600 text-center">
            {stats.employees.online_list.map((user, i) => (
              <li key={i}>
                <span className="text-green-500">●</span> {user.name} -{" "}
                {user.role}
              </li>
            ))}
          </ul>
        </div>

        {/* תפקידים */}
        <div
          onClick={handleClickRoles}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-purple-100 text-purple-600 rounded-full p-3 text-2xl">
              🛡️
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">
            תפקידים
          </h4>
          <ul className="text-sm text-gray-600 text-center">
            <li>
              סה"כ: <strong>{stats.roles.total}</strong>
            </li>
            <li>
              פעילים: <strong>{stats.roles.active}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats.roles.inactive}</strong>
            </li>
          </ul>
        </div>

        {/* פרויקטים */}
        <div
          onClick={handleClickProjects}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 text-2xl">
              💼
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">
            פרויקטים
          </h4>
          <ul className="text-sm text-gray-600 text-center">
            <li>
              סה"כ: <strong>{stats.projects.total}</strong>
            </li>
            <li>
              פעילים: <strong>{stats.projects.active}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats.projects.inactive}</strong>
            </li>
          </ul>
        </div>

        {/* פניות */}
        <div
          onClick={handleClickLeads}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-yellow-100 text-yellow-600 rounded-full p-3 text-2xl">
              📩
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">פניות</h4>
          <ul className="text-sm text-gray-600 text-center">
            <li>
              חדשות: <strong>{stats.leads.new}</strong>
            </li>
            <li>
              בטיפול: <strong>{stats.leads.in_progress}</strong>
            </li>
            <li>
              טופלו: <strong>{stats.leads.completed}</strong>
            </li>
          </ul>
        </div>

        {/* משימות */}
        <div
          onClick={handleClickTasks}
          className="bg-white rounded-xl shadow hover:shadow-lg p-4 h-48 flex flex-col justify-between cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex justify-center items-center">
            <div className="bg-slate-100 text-yellow-600 rounded-full p-3 text-2xl">
              🔄
            </div>
          </div>
          <h4 className="text-center text-lg font-bold text-gray-700">
            משימות
          </h4>
          <ul className="text-sm text-gray-600 text-center">
            <li>
              חדשות: <strong>{stats.tasks.new}</strong>
            </li>
            <li>
              בטיפול: <strong>{stats.tasks.in_progress}</strong>
            </li>
            <li>
              טופלו: <strong>{stats.tasks.completed}</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* 🟦 גרפים - 4 באותו גובה */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <div className="w-full h-full">
            <LeadsStatusPieChart data={stats.leads} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <div className="w-full h-full">
            <LeadsByDateBarChart dataByDay={stats.leads_by_day} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <div className="w-full h-full">
            <LeadsBySourceChart data={stats.leads_by_source} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <div className="w-full h-full">
            <LeadsByUserChart data={stats.leads_by_user} />
          </div>
        </div>
      </div>

      {/* 📋 טבלאות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* נוכחות */}
        <div
          onClick={handleClickAttendance}
          className="bg-white rounded-xl shadow p-6 cursor-pointer"
        >
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">
            ⏱️ סה"כ החתמות נוכחות לעובד (החודש)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border-b text-right">שם עובד</th>
                  <th className="p-2 border-b text-center">סה"כ החתמות</th>
                </tr>
              </thead>
              <tbody>
                {stats.attendance.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{row.name}</td>
                    <td className="p-2 border-b text-center">
                      {row.total_attendance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* לוגים */}
        <div
          onClick={handleClickActivityLog}
          className="bg-white rounded-xl shadow p-6 cursor-pointer"
        >
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">
            📋 תיעודים ליום (7 ימים אחרונים)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border-b text-center">תאריך</th>
                  <th className="p-2 border-b text-center">כמות תיעודים</th>
                </tr>
              </thead>
              <tbody>
                {stats.logs_by_day.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border-b text-center">
                      {row.date.slice(0, 10)}
                    </td>
                    <td className="p-2 border-b text-center">
                      {row.total_logs} תיעודים
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
