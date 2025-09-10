// frontend/src/pages/Logs.jsx

/**
 * קומפוננטה: Logs (יומן פעולות)
 * -----------------------------
 * 1. מציגה את כל הלוגים שנרשמו במערכת (מי עשה מה ומתי).
 * 2. מאפשרת חיפוש לפי שם עובד / פעולה.
 * 3. מאפשרת סינון לפי תאריכים: מתאריך / עד תאריך.
 * 4. תומכת בייצוא ל־Excel / PDF ושליחה במייל.
 * 5. משתמשת בקומפוננטת ReportView להצגה מרכזית.
 */

import React, { useEffect, useState } from "react";
import { api } from "utils";
import ReportView from "../Reports/ReportView";

const Logs = () => {
  const [logs, setLogs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });

  // שליפת הלוגים מהשרת
  useEffect(() => {
    fetchLogs();
  }, [searchTerm, filters.from, filters.to]);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/logs", {
        params: {
          search: searchTerm,
          from: filters.from,
          to: filters.to,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error("❌ שגיאה בטעינת לוגים:", err);
    }
  };

  // הגדרת עמודות
  const columns = [
    {
      key: "log_id",
      label: "מזהה",
      export: (r) => r.log_id,
    },
    {
      key: "user_name",
      label: "שם עובד",
      export: (r) => r.user_name,
    },
    {
      key: "action",
      label: "פעולה",
      export: (r) => r.action,
    },
    {
      key: "timestamp",
      label: "תאריך ושעה",
      render: (r) =>
        new Date(r.timestamp).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      export: (r) =>
        new Date(r.timestamp).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  // הגדרת פילטרים (תאריכים)
  const filtersDef = [
    {
      name: "from",
      label: "מתאריך",
      type: "date",
    },
    {
      name: "to",
      label: "עד תאריך",
      type: "date",
    },
  ];

  return (
    <div className="p-6 text-right">
      <ReportView
        title="יומן פעולות - תיעוד מערכת"
        columns={columns}
        rows={logs}
        filtersDef={filtersDef}
        searchableKeys={["user_name", "action"]}
        pageSize={12}
        searchPlaceholder="חיפוש לפי שם עובד או פעולה..."
        emailApiBase={api.defaults.baseURL}
        filtersVariant="inline"
        defaultFilters={filters}
      />
    </div>
  );
};

export default Logs;
