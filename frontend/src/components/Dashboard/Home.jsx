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
      <div className="flex justify-center items-center text-xl font-bold text-gray-600">
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
    <div className="flex-col flex-grow p-6 font-rubik text-right">
      {/* 🟡 פס התראה עליון */}
      {stats.leads.new > 0 && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md px-4 py-3 mb-6 text-center text-sm font-semibold shadow-sm">
          ⚠️ {stats.leads.new} פניות חדשות ממתינות לטיפול
        </div>
      )}

      {/* 🧱 כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-5">
        {/* כל כרטיס כאן כמו שהיה לך */}
        {/* עובדים, תפקידים, פרויקטים, פניות, משימות וכו' */}
        {/* נשאר ללא שינוי בקוד הזה כדי לשמור על הפוקוס על פס ההתראה */}
      </div>

      {/* 📊 גרפים */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mt-6">
        <LeadsStatusPieChart data={stats.leads} />
        <LeadsByDateBarChart dataByDay={stats.leads_by_day} />
        <LeadsBySourceChart data={stats.leads_by_source} />
        <LeadsByUserChart data={stats.leads_by_user} />
      </div>

      {/* 📋 טבלאות נוכחות ותיעודים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* חתימות עובדים */}
        <div
          onClick={handleClickAttendance}
          className="bg-white/85 rounded-lg shadow-md p-6 cursor-pointer"
        >
          <h3 className="text-center text-xl font-bold mb-3">
            ⏱️ סה"כ החתמות נוכחות לעובד (החודש)
          </h3>
          <div className="overflow-x-auto mb-10">
            <table className="w-full border border-gray-300 text-right text-sm bg-white rounded-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border-b">שם עובד</th>
                  <th className="p-2 border-b">סה"כ החתמות</th>
                </tr>
              </thead>
              <tbody>
                {stats.attendance.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{row.name}</td>
                    <td className="p-2 border-b">{row.total_attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* לוגים לפי יום */}
        <div
          onClick={handleClickActivityLog}
          className="bg-white/85 rounded-lg shadow-md p-6 cursor-pointer"
        >
          <h3 className="text-center text-xl font-bold mb-3">
            📋 תיעודים ליום (7 ימים אחרונים)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-right text-sm bg-white rounded-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-center p-2 border-b">תאריך</th>
                  <th className="text-center p-2 border-b">כמות תיעודים</th>
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
