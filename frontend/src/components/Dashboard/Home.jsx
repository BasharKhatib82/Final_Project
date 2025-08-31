import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Tools/UserContext";
import LeadsStatusPieChart from "../charts/LeadsStatusPieChart";
import LeadsByDateBarChart from "../charts/LeadsByDateBarChart";
import LeadsBySourceChart from "../charts/LeadsBySourceChart";
import LeadsByUserChart from "../charts/LeadsByUserChart";

const api = process.env.REACT_APP_API_URL;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
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
      {/* 🔔 פס התראות */}
      {(user?.admin_alert_dash === 1 || user?.user_alert_dash === 1) && (
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto text-center">
          {/* פניות חדשות */}
          {((user?.admin_alert_dash === 1 &&
            stats?.leads_by_user_status
              ?.filter((l) => l.status === "חדש")
              ?.reduce((sum, l) => sum + l.count, 0)) ||
            (user?.user_alert_dash === 1 &&
              stats?.leads_by_user_status
                ?.filter(
                  (l) => l.user_id === user.user_id && l.status === "חדש"
                )
                ?.reduce((sum, l) => sum + l.count, 0))) > 0 && (
            <div
              onClick={() => navigate("/dashboard/leads")}
              className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-yellow-700 shadow-sm"
            >
              <span className="text-lg mr-2">📩</span>
              <span className="text-base font-medium">
                {user?.admin_alert_dash
                  ? stats?.leads_by_user_status
                      ?.filter((l) => l.status === "חדש")
                      ?.reduce((sum, l) => sum + l.count, 0)
                  : stats?.leads_by_user_status
                      ?.filter(
                        (l) => l.user_id === user.user_id && l.status === "חדש"
                      )
                      ?.reduce((sum, l) => sum + l.count, 0)}{" "}
                פניות חדשות לטיפול
              </span>
            </div>
          )}

          {/* משימות חדשות */}
          {((user?.admin_alert_dash === 1 &&
            stats?.tasks_by_user_status
              ?.filter((t) => t.status === "חדש")
              ?.reduce((sum, t) => sum + t.count, 0)) ||
            (user?.user_alert_dash === 1 &&
              stats?.tasks_by_user_status
                ?.filter(
                  (t) => t.user_id === user.user_id && t.status === "חדש"
                )
                ?.reduce((sum, t) => sum + t.count, 0))) > 0 && (
            <div
              onClick={() => navigate("/dashboard/tasks")}
              className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 shadow-sm"
            >
              <span className="text-lg mr-2">📝</span>
              <span className="text-base font-medium">
                {user?.admin_alert_dash
                  ? stats?.tasks_by_user_status
                      ?.filter((t) => t.status === "חדש")
                      ?.reduce((sum, t) => sum + t.count, 0)
                  : stats?.tasks_by_user_status
                      ?.filter(
                        (t) => t.user_id === user.user_id && t.status === "חדש"
                      )
                      ?.reduce((sum, t) => sum + t.count, 0)}{" "}
                משימות חדשות לטיפול
              </span>
            </div>
          )}

          {/* משימות חורגות */}
          {((user?.admin_alert_dash === 1 &&
            stats?.tasks_overdue?.reduce(
              (sum, t) => sum + t.overdue_count,
              0
            )) ||
            (user?.user_alert_dash === 1 &&
              (stats?.tasks_overdue?.find((t) => t.user_id === user.user_id)
                ?.overdue_count ||
                0))) > 0 && (
            <div
              onClick={() => navigate("/dashboard/tasks")}
              className="flex items-center bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 shadow-sm"
            >
              <span className="text-lg mr-2">⏰</span>
              <span className="text-base font-medium">
                {user?.admin_alert_dash
                  ? stats?.tasks_overdue?.reduce(
                      (sum, t) => sum + t.overdue_count,
                      0
                    )
                  : stats?.tasks_overdue?.find(
                      (t) => t.user_id === user.user_id
                    )?.overdue_count || 0}{" "}
                משימות חורגות מטיפול !!
              </span>
            </div>
          )}
        </div>
      )}

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* עובדים */}
        <div
          onClick={() => navigate("/dashboard/users")}
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
              פעילים: <strong>{stats?.users?.active ?? 0}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats?.users?.inactive ?? 0}</strong>
            </li>
            <li>
              מחוברים: <strong>{stats?.users?.online_list?.length ?? 0}</strong>
            </li>
          </ul>
        </div>

        {/* מחוברים */}
        <div
          onClick={() => navigate("/dashboard/users")}
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
            {stats?.users?.online_list?.map((u, i) => (
              <li key={i}>
                <span className="text-green-500">●</span> {u.name} - {u.role}
              </li>
            ))}
          </ul>
        </div>

        {/* תפקידים */}
        <div
          onClick={() => navigate("/dashboard/roles")}
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
              סה"כ: <strong>{stats?.roles?.total ?? 0}</strong>
            </li>
            <li>
              פעילים: <strong>{stats?.roles?.active ?? 0}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats?.roles?.inactive ?? 0}</strong>
            </li>
          </ul>
        </div>

        {/* פרויקטים */}
        <div
          onClick={() => navigate("/dashboard/projects")}
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
              סה"כ: <strong>{stats?.projects?.total ?? 0}</strong>
            </li>
            <li>
              פעילים: <strong>{stats?.projects?.active ?? 0}</strong>
            </li>
            <li>
              לא פעילים: <strong>{stats?.projects?.inactive ?? 0}</strong>
            </li>
          </ul>
        </div>

        {/* פניות */}
        <div
          onClick={() => navigate("/dashboard/leads")}
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
              חדשות: <strong>{stats?.leads?.new ?? 0}</strong>
            </li>
            <li>
              בטיפול: <strong>{stats?.leads?.in_progress ?? 0}</strong>
            </li>
            <li>
              טופלו: <strong>{stats?.leads?.completed ?? 0}</strong>
            </li>
          </ul>
        </div>

        {/* משימות */}
        <div
          onClick={() => navigate("/dashboard/tasks")}
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
              חדשות: <strong>{stats?.tasks?.new ?? 0}</strong>
            </li>
            <li>
              בטיפול: <strong>{stats?.tasks?.in_progress ?? 0}</strong>
            </li>
            <li>
              טופלו: <strong>{stats?.tasks?.completed ?? 0}</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* 🟦 גרפים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <LeadsStatusPieChart data={stats?.leads || {}} />
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <LeadsByDateBarChart dataByDay={stats?.leads_by_day || []} />
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <LeadsBySourceChart data={stats?.leads_by_source || []} />
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-80">
          <LeadsByUserChart data={stats?.leads_by_user || []} />
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
                {stats?.attendance?.map((row, i) => (
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
                {stats?.logs_by_day?.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border-b text-center">
                      {row?.date ? row.date.slice(0, 10) : "-"}
                    </td>
                    <td className="p-2 border-b text-center">
                      {row?.total_logs ?? 0} תיעודים
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
