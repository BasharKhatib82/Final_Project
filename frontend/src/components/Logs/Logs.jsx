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
import { api } from "utils";
import ReportView from "../Reports/ReportView";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const [filters, setFilters] = useState({
    date: [], // [from, to]
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filters, searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/logs", {
        params: {
          from: filters.date?.[0],
          to: filters.date?.[1],
          search: searchTerm,
        },
      });

      if (res.data.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת לוגים:", err);
      setPopup({
        title: "שגיאה",
        message: "שגיאה בטעינת לוגים",
        mode: "error",
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const filtersDef = [
    {
      name: "date",
      label: "טווח תאריכים",
      type: "daterange",
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading ? (
        <div className="text-center text-gray-600">טוען יומן פעולות...</div>
      ) : (
        <ReportView
          title="יומן פעולות - תיעוד מערכת"
          columns={columns}
          rows={logs}
          filtersDef={filtersDef}
          searchableKeys={["user_name", "action"]}
          pageSize={12}
          emailApiBase={api.defaults.baseURL}
          searchPlaceholder="חיפוש לפי שם עובד או פעולה..."
          filtersVariant="inline"
          defaultFilters={filters}
          onFiltersChange={setFilters}
          onSearchChange={setSearchTerm}
        />
      )}
    </div>
  );
}
