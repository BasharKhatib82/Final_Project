import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReportProvider } from "../Reports/ReportContext";
import ReportExport from "../Reports/ReportExport";
import ReportEmail from "../Reports/ReportEmail";

const api = process.env.REACT_APP_API_URL;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const limit = 14;
  const totalPages = Math.ceil(total / limit);
  const today = new Date().toISOString().split("T")[0];

  // עמודות + שליטה בהצגה
  const [columns, setColumns] = useState([
    { key: "log_id", label: "מזהה", visible: true },
    { key: "user_name", label: "שם עובד", visible: true },
    { key: "action", label: "פעולה", visible: true },
    { key: "timestamp", label: "תאריך ושעה", visible: true },
  ]);

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm, startDate, endDate]);

  const fetchLogs = () => {
    axios
      .get(`${api}/logs`, {
        params: { page, search: searchTerm, from: startDate, to: endDate },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setLogs(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch((err) => console.error("❌ שגיאה בטעינת לוגים:", err));
  };

  const toggleColumn = (key) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // 🟢 עמודות לייצוא
  const exportColumns = columns.map((c) => ({
    key: c.key,
    label: c.label,
    export: (row) => {
      if (c.key === "timestamp") {
        return new Date(row.timestamp).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return row[c.key];
    },
  }));

  return (
    <div className="p-6 text-right">
      <header className="flex items-center justify-center py-0 my-0">
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
          יומן פעולות - תיעוד מערכת
        </h2>
      </header>

      {/* 🔹 סינון + חיפוש */}
      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-3">
        <input
          type="text"
          placeholder="🔍 חיפוש לפי שם עובד או פעולה..."
          className="border border-gray-300 rounded px-3 py-1 text-sm"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
          max={today}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(1);
            setEndDate(e.target.value);
          }}
          max={today}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        />
      </div>

      {/* 🔹 סרגל ייצוא */}
      <ReportProvider title="יומן פעולות" columns={exportColumns} rows={logs}>
        <div className="flex items-center flex-wrap gap-4 bg-white/85 rounded-lg p-3 mb-4 shadow-sm">
          <ReportExport apiBase={api} />
          <ReportEmail apiBase={api} />
        </div>
      </ReportProvider>

      {/* 🔹 בחירת עמודות */}
      <div className="flex gap-4 justify-center mb-3">
        {columns.map((col) => (
          <label key={col.key} className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => toggleColumn(col.key)}
            />
            {col.label}
          </label>
        ))}
      </div>

      {/* 🔹 טבלת לוגים */}
      <div className="overflow-auto rounded-lg shadow-lg bg-white/85 mt-4">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              {columns
                .filter((c) => c.visible)
                .map((col) => (
                  <th key={col.key} className="p-2 border">
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-red-500 p-4"
                >
                  אין לוגים להצגה
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-blue-50 transition">
                  {columns.find((c) => c.key === "log_id")?.visible && (
                    <td className="border p-2">{log.log_id}</td>
                  )}
                  {columns.find((c) => c.key === "user_name")?.visible && (
                    <td className="border p-2">{log.user_name}</td>
                  )}
                  {columns.find((c) => c.key === "action")?.visible && (
                    <td className="border p-2">{log.action}</td>
                  )}
                  {columns.find((c) => c.key === "timestamp")?.visible && (
                    <td className="border p-2">
                      {new Date(log.timestamp).toLocaleString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 פאגינציה */}
      <div className="flex justify-center items-center gap-4 my-3 text-sm">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-sky-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          ← הקודם
        </button>
        <span>
          עמוד <strong>{page}</strong> מתוך <strong>{totalPages}</strong>
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="bg-sky-600 text-white px-3 py-1 rounded disabled:opacity-40"
        >
          הבא →
        </button>
      </div>
    </div>
  );
};

export default Logs;
