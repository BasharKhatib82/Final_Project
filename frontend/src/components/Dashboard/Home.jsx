import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Tools/UserContext";
import AlertBar from "../Tools/AlertBar";
import StatCard from "../Tools/StatCard";
import LeadsStatusPieChart from "../charts/LeadsStatusPieChart";
import LeadsByDateBarChart from "../charts/LeadsByDateBarChart";
import LeadsBySourceChart from "../charts/LeadsBySourceChart";
import LeadsByUserChart from "../charts/LeadsByUserChart";
import {
  FcRules,
  FcAlarmClock,
  FcSurvey,
  FcAssistant,
  FcBriefcase,
} from "react-icons/fc";

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

  return (
    <div className="flex-col flex-grow p-6 font-rubik text-right space-y-6">
      {/* 🔔 פס התראות */}
      {(user?.admin_alert_dash === 1 || user?.user_alert_dash === 1) && (
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto text-center">
          {/* פניות חדשות */}
          {(() => {
            const leadsCount =
              (user?.admin_alert_dash === 1 &&
                stats?.leads_by_user_status
                  ?.filter((l) => l.status === "חדש")
                  ?.reduce((sum, l) => sum + l.count, 0)) ||
              (user?.user_alert_dash === 1 &&
                stats?.leads_by_user_status
                  ?.filter(
                    (l) => l.user_id === user.user_id && l.status === "חדש"
                  )
                  ?.reduce((sum, l) => sum + l.count, 0));
            return (
              leadsCount > 0 && (
                <AlertBar
                  icon={<FcRules />}
                  count={leadsCount}
                  text="פניות חדשות לטיפול"
                  color="yellow"
                  onClick={() => navigate("/dashboard/leads")}
                />
              )
            );
          })()}

          {/* משימות חדשות */}
          {(() => {
            const tasksCount =
              (user?.admin_alert_dash === 1 &&
                stats?.tasks_by_user_status
                  ?.filter((t) => t.status === "חדש")
                  ?.reduce((sum, t) => sum + t.count, 0)) ||
              (user?.user_alert_dash === 1 &&
                stats?.tasks_by_user_status
                  ?.filter(
                    (t) => t.user_id === user.user_id && t.status === "חדש"
                  )
                  ?.reduce((sum, t) => sum + t.count, 0));
            return (
              tasksCount > 0 && (
                <AlertBar
                  icon={<FcSurvey />}
                  count={tasksCount}
                  text="משימות חדשות לטיפול"
                  color="yellow"
                  onClick={() => navigate("/dashboard/tasks")}
                />
              )
            );
          })()}

          {/* משימות חורגות */}
          {(() => {
            const overdueCount =
              (user?.admin_alert_dash === 1 &&
                stats?.tasks_overdue?.reduce(
                  (sum, t) => sum + t.overdue_count,
                  0
                )) ||
              (user?.user_alert_dash === 1 &&
                (stats?.tasks_overdue?.find((t) => t.user_id === user.user_id)
                  ?.overdue_count ||
                  0));
            return (
              overdueCount > 0 && (
                <AlertBar
                  icon={<FcAlarmClock />}
                  count={overdueCount}
                  text="משימות חורגות מטיפול !!"
                  color="red"
                  onClick={() => navigate("/dashboard/tasks")}
                />
              )
            );
          })()}
        </div>
      )}

      {/* כרטיסי סטטיסטיקה */}

      <div className="flex flex-wrap justify-center gap-2">
        {/* 👥 עובדים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={<FcAssistant />}
            iconColor="bg-blue-100 text-blue-600"
            title="עובדים"
            items={[
              { label: "פעילים", value: stats?.users?.active ?? 0 },
              { label: "לא פעילים", value: stats?.users?.inactive ?? 0 },
              {
                label: "מחוברים",
                value: stats?.users?.online_list?.length ?? 0,
              },
            ]}
            onClick={() => navigate("/dashboard/users")}
          />
        )}

        {/* 🟢 מחוברים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon="🟢"
            iconColor="bg-green-100 text-green-600"
            title="מחוברים"
            items={
              stats?.users?.online_list?.length > 0
                ? stats.users.online_list.map((u) => ({
                    label: `${u.name} - ${u.role}`,
                    value: "●",
                  }))
                : []
            }
            onClick={() => navigate("/dashboard/users")}
          />
        )}

        {/* 🛡️ תפקידים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon="🛡️"
            iconColor="bg-purple-100 text-purple-600"
            title="תפקידים"
            items={[
              { label: 'סה"כ', value: stats?.roles?.total ?? 0 },
              { label: "פעילים", value: stats?.roles?.active ?? 0 },
              { label: "לא פעילים", value: stats?.roles?.inactive ?? 0 },
            ]}
            onClick={() => navigate("/dashboard/roles")}
          />
        )}

        {/* 💼 פרויקטים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={<FcBriefcase />}
            iconColor="bg-indigo-100 text-indigo-600"
            title="פרויקטים"
            items={[
              { label: 'סה"כ', value: stats?.projects?.total ?? 0 },
              { label: "פעילים", value: stats?.projects?.active ?? 0 },
              { label: "לא פעילים", value: stats?.projects?.inactive ?? 0 },
            ]}
            onClick={() => navigate("/dashboard/projects")}
          />
        )}

        {/* 📩 פניות */}
        {(user?.admin_status_dash === 1 || user?.user_status_dash === 1) && (
          <StatCard
            icon={<FcRules />}
            iconColor="bg-yellow-100 text-yellow-600"
            title="פניות"
            items={[
              {
                label: "חדשות",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.leads?.new ?? 0
                    : stats?.leads_by_user_status
                        ?.filter(
                          (l) =>
                            l.user_id === user.user_id && l.status === "חדש"
                        )
                        ?.reduce((sum, l) => sum + l.count, 0) ?? 0,
              },
              {
                label: "בטיפול",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.leads?.in_progress ?? 0
                    : stats?.leads_by_user_status
                        ?.filter(
                          (l) =>
                            l.user_id === user.user_id && l.status === "בטיפול"
                        )
                        ?.reduce((sum, l) => sum + l.count, 0) ?? 0,
              },
              {
                label: "טופלו",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.leads?.completed ?? 0
                    : stats?.leads_by_user_status
                        ?.filter(
                          (l) =>
                            l.user_id === user.user_id && l.status === "טופל"
                        )
                        ?.reduce((sum, l) => sum + l.count, 0) ?? 0,
              },
            ]}
            onClick={() => navigate("/dashboard/leads")}
          />
        )}

        {/* 🔄 משימות */}
        {(user?.admin_status_dash === 1 || user?.user_status_dash === 1) && (
          <StatCard
            icon={<FcSurvey />}
            iconColor="bg-slate-100 text-yellow-600"
            title="משימות"
            items={[
              {
                label: "חדשות",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.tasks?.new ?? 0
                    : stats?.tasks_by_user_status
                        ?.filter(
                          (t) =>
                            t.user_id === user.user_id && t.status === "חדש"
                        )
                        ?.reduce((sum, t) => sum + t.count, 0) ?? 0,
              },
              {
                label: "בטיפול",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.tasks?.in_progress ?? 0
                    : stats?.tasks_by_user_status
                        ?.filter(
                          (t) =>
                            t.user_id === user.user_id && t.status === "בתהליך"
                        )
                        ?.reduce((sum, t) => sum + t.count, 0) ?? 0,
              },
              {
                label: "טופלו",
                value:
                  user?.admin_status_dash === 1
                    ? stats?.tasks?.completed ?? 0
                    : stats?.tasks_by_user_status
                        ?.filter(
                          (t) =>
                            t.user_id === user.user_id && t.status === "הושלם"
                        )
                        ?.reduce((sum, t) => sum + t.count, 0) ?? 0,
              },
            ]}
            onClick={() => navigate("/dashboard/tasks")}
          />
        )}
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
          onClick={() => navigate("/dashboard/attendance")}
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
          onClick={() => navigate("/dashboard/logs")}
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
