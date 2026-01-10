/**
 * קומפוננטה: Home (דף ראשי / דף ניהול)
 * --------------------------------------
 * מטרות:
 * - הצגת סטטיסטיקות כלליות (משתמשים, תפקידים, פניות, משימות, פרויקטים וכו').
 * - הצגת גרפים ודוחות על פעילות המערכת.
 * - הצגת התראות על פריטים חדשים (פניות, משימות, חורגים).
 * - אפשרות להחתמת כניסה/יציאה לעובדים עם הרשאה מתאימה.
 *
 * הרשאות:
 * - permission_check_in_out → מציג כפתור החתמת כניסה/יציאה.
 * - admin_alert_dash / user_alert_dash → פסי התראות.
 * - admin_status_dash / user_status_dash → הצגת כרטיסי סטטוס וגרפים.
 *
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, Popup } from "components/Tools";
import AlertBar from "../Tools/AlertBar";
import StatCard from "../Tools/StatCard";
import LeadsStatusPieChart from "../charts/LeadsStatusPieChart";
import LeadsByDateBarChart from "../charts/LeadsByDateBarChart";
import LeadsBySourceChart from "../charts/LeadsBySourceChart";
import LeadsByUserChart from "../charts/LeadsByUserChart";
import { Icon } from "@iconify/react";
import { api } from "utils";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [popup, setPopup] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user?.permission_check_in_out) {
      fetchAttendanceStatus();
    }
  }, [user?.permission_check_in_out]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data?.data || {});
    } catch (err) {
      console.error("דף שגיאה בטעינת דף ניהול :", err);
    }
  };

 const fetchAttendanceStatus = async () => {
   try {
     const res = await api.get("/attendance/status");

     // כאן התשובה היא: { success, status, last_check_in }
     if (res.data?.success) {
       setAttendanceStatus({
         status: res.data.status || "none",
         last_check_in: res.data.last_check_in || null,
       });
     } else {
       setAttendanceStatus(null);
     }
   } catch (err) {
     console.error("שגיאה בשליפת סטטוס החתמה:", err);
     setAttendanceStatus(null);
   }
 };

  const confirmCheckIn = () => {
    setPopup({
      title: "אישור החתמת כניסה",
      message: "האם אתה בטוח שברצונך לבצע החתמת כניסה ?",
      mode: "confirm",
      onConfirm: handleCheckIn,
    });
  };

  const handleCheckIn = async () => {
    setPopup(null);

    try {
      setCheckInLoading(true);

      await api.post("/attendance/check-in", { user_id: user.user_id });

      await fetchAttendanceStatus();

      setPopup({
        title: "הצלחה",
        message: "החתמת כניסה בוצעה בהצלחה",
        mode: "success",
        autoClose: 2500,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: err?.response?.data?.message || "שגיאה בהחתמת כניסה",
        mode: "error",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const confirmCheckOut = () => {
    setPopup({
      title: "אישור החתמת יציאה",
      message: "האם אתה בטוח שברצונך לבצע החתמת יציאה?",
      mode: "confirm",
      onConfirm: handleCheckOut,
    });
  };

  const handleCheckOut = async () => {
    setPopup(null);

    try {
      setCheckOutLoading(true);

      await api.post("/attendance/check-out", { user_id: user.user_id });
      await fetchAttendanceStatus();
      setPopup({
        title: "הצלחה",
        message: "החתמת יציאה בוצעה בהצלחה",
        mode: "success",
        autoClose: 2500,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: err?.response?.data?.message || "שגיאה בהחתמת יציאה",
        mode: "error",
      });
    } finally {
      setCheckOutLoading(false);
    }
  };

  const renderAttendanceButtons = () => {
    const status = attendanceStatus?.status || "none";
    const showCheckIn = status === "none" || status === "checked_out";
    const showCheckOut = status === "checked_in";

    return (
      <div className="flex justify-center gap-3">
        {showCheckIn && (
          <button
            onClick={confirmCheckIn}
            disabled={checkInLoading}
            className={`px-4 py-2 rounded shadow text-white ${
              checkInLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {checkInLoading ? "שולח..." : "החתמת כניסה"}
          </button>
        )}
        {showCheckOut && (
          <button
            onClick={confirmCheckOut}
            disabled={checkOutLoading}
            className={`px-4 py-2 rounded shadow text-white ${
              checkOutLoading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {checkOutLoading ? "שולח..." : "החתמת יציאה"}
          </button>
        )}
      </div>
    );
  };

  if (!stats)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-600">
        טוען נתונים...
      </div>
    );

  return (
    <div className="flex-col flex-grow p-6 font-rubik text-right space-y-6">
      {/*החתמה (כניסה/יציאה) */}
      {user?.permission_check_in_out === 1 && renderAttendanceButtons()}

      {/* פס התראות */}
      {(user?.admin_alert_dash === 1 || user?.user_alert_dash === 1) && (
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto text-center">
          {/* פניות חדשות */}
          {(() => {
            const leadsCount =
              (user?.admin_alert_dash === 1 &&
                stats?.leads_by_user_status
                  ?.filter((l) => l.status === "חדשה")
                  ?.reduce((sum, l) => sum + l.count, 0)) ||
              (user?.user_alert_dash === 1 &&
                stats?.leads_by_user_status
                  ?.filter(
                    (l) => l.user_id === user.user_id && l.status === "חדשה"
                  )
                  ?.reduce((sum, l) => sum + l.count, 0));
            return (
              leadsCount > 0 && (
                <AlertBar
                  icon={
                    <Icon
                      icon="fluent-color:text-bullet-list-square-sparkle-32"
                      width="1.5em"
                      height="1.5em"
                    />
                  }
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
                  ?.filter((t) => t.status === "חדשה")
                  ?.reduce((sum, t) => sum + t.count, "")) ||
              (user?.user_alert_dash === 1 &&
                stats?.tasks_by_user_status
                  ?.filter(
                    (t) => t.user_id === user.user_id && t.status === "חדשה"
                  )
                  ?.reduce((sum, t) => sum + t.count, ""));
            return (
              tasksCount > 0 && (
                <AlertBar
                  icon={
                    <Icon
                      icon="fluent-color:clipboard-task-24"
                      width="1.5em"
                      height="1.5em"
                    />
                  }
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
                  icon={
                    <Icon
                      icon="noto:alarm-clock"
                      width="1.5em"
                      height="1.5em"
                    />
                  }
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

      <div className="flex flex-wrap justify-center gap-3">
        {/*  עובדים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={
              <Icon
                icon="fluent-color:people-community-48"
                width="2em"
                height="2em"
              />
            }
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

        {/*  מחוברים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={<Icon icon="unjs:h3" width="2em" height="2em" />}
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

        {/*  תפקידים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={
              <Icon icon="fluent-color:shield-48" width="2em" height="2em" />
            }
            title="תפקידים"
            items={[
              { label: 'סה"כ', value: stats?.roles?.total ?? 0 },
              { label: "פעילים", value: stats?.roles?.active ?? 0 },
              { label: "לא פעילים", value: stats?.roles?.inactive ?? 0 },
            ]}
            onClick={() => navigate("/dashboard/roles")}
          />
        )}

        {/*  פרויקטים */}
        {user?.admin_status_dash === 1 && (
          <StatCard
            icon={
              <Icon icon="fluent-color:briefcase-48" width="2em" height="2em" />
            }
            title="פרויקטים"
            items={[
              { label: 'סה"כ', value: stats?.projects?.total ?? 0 },
              { label: "פעילים", value: stats?.projects?.active ?? 0 },
              { label: "לא פעילים", value: stats?.projects?.inactive ?? 0 },
            ]}
            onClick={() => navigate("/dashboard/projects")}
          />
        )}

        {/*  פניות */}
        {(user?.admin_status_dash === 1 || user?.user_status_dash === 1) && (
          <StatCard
            icon={
              <Icon
                icon="fluent-color:text-bullet-list-square-sparkle-32"
                width="2em"
                height="2em"
              />
            }
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
                            l.user_id === user.user_id && l.status === "חדשה"
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
                            l.user_id === user.user_id && l.status === "טופלה"
                        )
                        ?.reduce((sum, l) => sum + l.count, 0) ?? 0,
              },
            ]}
            onClick={() => navigate("/dashboard/leads")}
          />
        )}

        {/*  משימות */}
        {(user?.admin_status_dash === 1 || user?.user_status_dash === 1) && (
          <StatCard
            icon={
              <Icon
                icon="fluent-color:clipboard-task-24"
                width="2em"
                height="2em"
              />
            }
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
                            t.user_id === user.user_id && t.status === "חדשה"
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
                            t.user_id === user.user_id && t.status === "בטיפול"
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
                            t.user_id === user.user_id && t.status === "טופלה"
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
        {user?.logs_page_access === 1 && (
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
        )}
      </div>
      {/*  פופאפ */}
      {popup && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          autoClose={popup.autoClose}
          onClose={() => setPopup(null)}
          onConfirm={popup.onConfirm}
        />
      )}
    </div>
  );
};

export default Home;
