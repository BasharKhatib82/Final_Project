import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

const api = process.env.REACT_APP_BACKEND;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef();
  const limit = 14;
  const totalPages = Math.ceil(total / limit);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm, startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLogs = () => {
    axios
      .get(`${api}/logs`, {
        params: { page, search: searchTerm, from: startDate, to: endDate },
        withCredentials: true,
      })
      .then((res) => {
        setLogs(res.data.Result);
        setTotal(res.data.total);
      })
      .catch((err) => console.error("שגיאה בטעינת לוגים:", err));
  };

  const exportLogs = (type) => {
    axios
      .get(`${api}/logs/export/${type}`, {
        params: { search: searchTerm, from: startDate, to: endDate },
        responseType: "blob",
        withCredentials: true,
      })
      .then((res) => {
        const filename =
          type === "excel"
            ? "logs.xlsx"
            : type === "pdf"
            ? "logs.pdf"
            : "logs.txt";
        saveAs(new Blob([res.data]), filename);
      })
      .catch((err) => console.error("שגיאת ייצוא:", err));
  };

  const sendLogsByEmail = () => {
    axios
      .get(`${api}/logs/export/pdf`, {
        responseType: "blob",
        withCredentials: true,
      })
      .then((res) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("attachment", new Blob([res.data]), "logs.pdf");

        return axios.post(`${api}/logs/send-mail`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      })
      .then(() => alert("המייל נשלח בהצלחה"))
      .catch((err) => alert("שגיאה בשליחה: " + err.message));
  };

  const printFilteredLogs = () => {
    axios
      .get(`${api}/logs/all`, {
        params: { search: searchTerm, from: startDate, to: endDate },
        withCredentials: true,
      })
      .then((res) => {
        const logsData = res.data.Result;
        const tableHTML = `
          <table>
            <thead>
              <tr>
                <th>מזהה</th>
                <th>שם עובד</th>
                <th>פעולה</th>
                <th>תאריך ושעה</th>
              </tr>
            </thead>
            <tbody>
              ${logsData
                .map(
                  (log) => `
                    <tr>
                      <td>${log.log_id}</td>
                      <td>${log.user_name}</td>
                      <td>${log.action}</td>
                      <td>${new Date(log.timestamp).toLocaleString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>הדפסת לוגים</title>
              <style>
                body { font-family: Arial; direction: rtl; padding: 2rem; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 0.5rem; text-align: center; }
              </style>
            </head>
            <body>${tableHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      })
      .catch((err) => console.error("שגיאה בהדפסה:", err));
  };

  return (
    <div className="flex flex-col  min-h-full font-rubik">
      <h2 className="text-center text-2xl font-semibold text-blue-700 my-1.5">
        יומן פעולות - תיעוד מערכת
      </h2>

      {/* 🔍 חיפוש, סינון וייצוא */}
      <div className="flex flex-wrap gap-5 items-center justify-center mb-3">
        <input
          type="text"
          placeholder="חפש לפי מזהה, שם או פעולה"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          className="text-sm text-center border border-gray-300 rounded px-2 py-1.5 w-60 focus:border-blue-400 focus:ring-slate focus:ring-blue-200 outline-none"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
          max={today}
          className="text-xs border border-gray-300 rounded px-2 py-2 focus:border-blue-400 focus:ring-slate focus:ring-blue-200 outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(1);
            setEndDate(e.target.value);
          }}
          max={today}
          className="text-xs border border-gray-300 rounded px-2 py-2 focus:border-blue-400 focus:ring-slate focus:ring-blue-200 outline-none"
        />

        {/* 🔽 תפריט ייצוא */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded"
          >
            📤 ייצוא
          </button>
          {showExportMenu && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded shadow mt-2 w-40 right-0 text-right">
              <button
                onClick={() => exportLogs("excel")}
                className="block w-full px-4 py-1.5 hover:bg-gray-100"
              >
                📥 Excel
              </button>
              <button
                onClick={() => exportLogs("pdf")}
                className="block w-full px-4 py-1.5 hover:bg-gray-100"
              >
                📄 PDF
              </button>
              <button
                onClick={printFilteredLogs}
                className="block w-full px-4 py-1.5 hover:bg-gray-100"
              >
                🖨️ הדפסה
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📧 שליחת לוגים למייל */}
      <div className="flex items-center gap-3 justify-center mb-4 px-4">
        <input
          type="email"
          placeholder="שלח למייל..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 w-64 focus:border-blue-400 focus:ring-slate focus:ring-blue-200 outline-none"
        />
        <button
          onClick={sendLogsByEmail}
          className="bg-green-600 hover:bg-green-700 text-white font-normal py-1.5 px-4 rounded"
        >
          📤 שלח
        </button>
      </div>

      {/* 🧾 טבלת לוגים */}
      <div className="flex-grow overflow-auto px-4 text-center flex justify-center">
        <table className="w-3/4 text-sm  bg-white border border-gray-200 shadow-md rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">מזהה</th>
              <th className="p-2 border-b">שם עובד</th>
              <th className="p-2 border-b">פעולה</th>
              <th className="p-2 border-b">תאריך ושעה</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{log.log_id}</td>
                <td className="p-2 border-b">{log.user_name}</td>
                <td className="p-2 border-b">{log.action}</td>
                <td className="p-2 border-b">
                  {new Date(log.timestamp).toLocaleString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔁 פאגינציה */}
      <div className="flex justify-center items-center gap-4 my-3 text-sm">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-sky-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          → הקודם
        </button>
        <span>
          עמוד <strong>{page}</strong> מתוך <strong>{totalPages}</strong>
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="bg-sky-600 text-white px-3 py-1 rounded disabled:opacity-40"
        >
          הבא ←
        </button>
      </div>
    </div>
  );
};

export default Logs;
