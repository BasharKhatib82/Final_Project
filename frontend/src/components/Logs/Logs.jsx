// frontend/src/pages/Logs.jsx

/**
 * קומפוננטה: Logs (יומן פעולות)
 * -----------------------------
 * 1. מציגה את כל הלוגים שנרשמו במערכת (מי עשה מה ומתי).
 * 2. מאפשרת חיפוש לפי שם עובד / פעולה.
 * 3. daterange מאפשרת סינון לפי טווח תאריכים .
 * 4. ושליחה במייל Excel / PDF תמיכה בייצוא ל- .
 */

import React, { useEffect, useState } from "react";
import { api, extractApiError } from "utils";
import { formatDateAndTimeRaw } from "utils/date";
import { Popup } from "components/Tools";
import ReportView from "../Reports/ReportView";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/logs");
      const rows = res.data?.data || [];
      setLogs(
        rows.map((r) => ({
          ...r,
          full_name: [r.first_name, r.last_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
        }))
      );
    } catch (err) {
      console.error("שגיאה בטעינת יומן פעילות:", err);
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת יומן פעילות"),
        mode: "error",
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        api.get("/users/active"),
        api.get("/users/inactive"),
      ]);
      const active = (activeRes.data?.data || []).map((u) => ({
        ...u,
        active: true,
      }));
      const inactive = (inactiveRes.data?.data || []).map((u) => ({
        ...u,
        active: false,
      }));
      setUsers([...active, ...inactive]);
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  // שילוב שמות אם חסר
  useEffect(() => {
    if (users.length === 0 || logs.length === 0) return;
    setLogs((prev) =>
      prev.map((r) => {
        if (r.full_name) return r;
        const u = users.find((x) => x.user_id === r.user_id);
        return {
          ...r,
          full_name: u ? `${u.first_name} ${u.last_name}` : "לא ידוע",
        };
      })
    );
  }, [users]);

  const columns = [
    {
      key: "log_id",
      label: "מזהה",
      export: (r) => r.log_id,
    },
    {
      key: "user_id",
      label: "שם עובד",
      render: (r) => r.full_name,
      export: (r) => r.full_name,
    },
    {
      key: "action_name",
      label: "פעולה",
      export: (r) => r.action_name,
    },
    {
      key: "time_date",
      label: "תאריך ושעה",
      render: (r) => formatDateAndTimeRaw(r.time_date),
      export: (r) => formatDateAndTimeRaw(r.time_date),
    },
  ];

  const filtersDef = [
    {
      name: "user_id",
      label: "שם עובד",
      type: "select",
      options: [
        { value: "", label: "כל העובדים" },
        ...users.map((u) => ({
          value: String(u.user_id),
          label: `${u.first_name} ${u.last_name}${
            !u.active ? " ⚠ לא פעיל" : ""
          }`,
        })),
      ],
    },
    {
      name: "time_date",
      label: "טווח תאריכים",
      type: "daterange",
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading || users.length === 0 ? (
        <div className="text-center text-gray-600">טוען יומן פעולות...</div>
      ) : (
        <ReportView
          title="יומן פעולות - תיעוד מערכת"
          columns={columns}
          rows={logs}
          filtersDef={filtersDef}
          searchableKeys={["full_name", "action"]}
          pageSize={12}
          emailApiBase={api.defaults.baseURL}
          defaultFilters={{}}
          searchPlaceholder="חיפוש לפי שם עובד או פעולה..."
          filtersVariant="inline"
        />
      )}
      {popup?.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
