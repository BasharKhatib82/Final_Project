import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const handleClickUsers = () => {
    navigate("/dashboard/users"); // הנתיב לעמוד ניהול עובדים
  };
  const handleClickRoles = () => {
    navigate("/dashboard/roles"); // הנתיב לעמוד ניהול תפקידים
  };
  const handleClickProjects = () => {
    navigate("/dashboard/projects"); // הנתיב לעמוד ניהול פרויקטים
  };
  const handleClickLeads = () => {
    navigate("/dashboard/leads"); // הנתיב לעמוד ניהול לידים
  };
  const handleClickTasks = () => {
    navigate("/dashboard/tasks"); // הנתיב לעמוד ניהול משימות
  };
  const handleClickAttendance = () => {
    navigate("/dashboard/attendance"); // הנתיב לעמוד ניהול נוכחות
  };
  const handleClickActivityLog = () => {
    navigate("/dashboard/logs"); // הנתיב לעמוד ניהול יומן פעולות
  };

  return (
    <div className="flex-col flex-grow p-6 font-rubik text-right">
      {/* כרטיסי סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-5">
        {/* עובדים */}

        <div
          onClick={handleClickUsers}
          className="bg-white/85 rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">👥</div>
          <h4 className="text-center text-xl font-semibold mb-2">עובדים</h4>
          <rt></rt>
          <ul className="space-y-1 text-gray-700">
            <li>
              פעילים: <strong>{stats.employees.active}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats.employees.inactive}</strong>
            </li>
            <li>
              מחוברים כעת: <strong>{stats.employees.online_list.length}</strong>
            </li>
          </ul>
        </div>
        {/* עובדים מחוברים */}
        <div
          onClick={handleClickUsers}
          className="bg-white/85 rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">🟢</div>
          <h4 className="text-center text-xl font-semibold mb-2">
            מחוברים כעת
          </h4>

          <ul className="mb-10 space-y-1 text-gray-800">
            {stats.employees.online_list.map((user, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500 text-sm">●</span>
                {user.name} - {user.role}{" "}
              </li>
            ))}
          </ul>
        </div>
        {/* תפקידים */}
        <div
          onClick={handleClickRoles}
          className="bg-white/85 rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">🛡️</div>
          <h4 className="text-center text-xl font-semibold mb-2">תפקידים</h4>
          <ul className="space-y-1 text-gray-700">
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
          className="bg-white/85 rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">💼</div>
          <h4 className="text-center text-xl font-semibold mb-2">פרויקטים</h4>
          <ul className="space-y-1 text-gray-700">
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
          className="bg-white/85 rounded-lg opacity-85 shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">📩</div>
          <h4 className="text-center text-xl font-semibold mb-2">פניות</h4>
          <ul className="space-y-1 text-gray-700">
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
          className="bg-white/85 rounded-lg shadow-md p-6 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
        >
          <div className="text-center text-3xl mb-2">📝</div>
          <h4 className="text-center text-xl font-semibold mb-2">משימות</h4>
          <ul className="space-y-1 text-gray-700">
            <li>
              חדשות: <strong>{stats.tasks.new}</strong>
            </li>
            <li>
              בטיפול: <strong>{stats.tasks.in_progress}</strong>
            </li>
            <li>
              הושלמו: <strong>{stats.tasks.completed}</strong>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cursor-pointer">
        {/* חתימות לפי עובד */}
        <div
          onClick={handleClickAttendance}
          className="bg-white/85 rounded-lg shadow-md p-6"
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
                    <td className="p-2 border-b">{row.total_hours}</td>
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
                  <th className=" text-center p-2 border-b">תאריך</th>
                  <th className=" text-center p-2 border-b">כמות תיעודים</th>
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
