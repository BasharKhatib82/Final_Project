import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import "../../assets/styles/Logs.css";

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
  const limit = 12;
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
      .get("http://localhost:8801/logs", {
        params: {
          page,
          search: searchTerm,
          from: startDate,
          to: endDate,
        },
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
      .get(`http://localhost:8801/logs/export/${type}`, {
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
      .get("http://localhost:8801/logs/export/pdf", {
        responseType: "blob",
        withCredentials: true,
      })
      .then((res) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("attachment", new Blob([res.data]), "logs.pdf");

        return axios.post("http://localhost:8801/logs/send-mail", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      })
      .then(() => alert("המייל נשלח בהצלחה"))
      .catch((err) => alert("שגיאה בשליחה: " + err.message));
  };

  const printFilteredLogs = () => {
    axios
      .get("http://localhost:8801/logs/all", {
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
    <div className="container">
      <div className="main">
        <h3 className="title">יומן פעולות - תיעוד מערכת</h3>

        {/* 🔍 חיפוש וסינון + Dropdown */}
        <div className="filters df-fdr-gap">
          <input
            type="text"
            placeholder="חפש לפי מזהה, שם או פעולה"
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
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
            max={today}
          />

          {/* 🔽 Dropdown ייצוא */}
          <div className="export-dropdown" ref={exportRef}>
            <button onClick={() => setShowExportMenu(!showExportMenu)}>
              📤 ייצוא
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => exportLogs("excel")}>📥 Excel</button>
                <button onClick={() => exportLogs("pdf")}>📄 PDF</button>
                <button onClick={printFilteredLogs}>🖨️ הדפסה</button>
              </div>
            )}
          </div>
        </div>

        {/* 📧 שליחת מייל */}
        <div
          className="df-fdr-gap send-mail-section"
          style={{ margin: "1rem 0" }}
        >
          <input
            type="email"
            placeholder="שלח למייל..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendLogsByEmail}>📤 שלח</button>
        </div>

        {/* 🧾 טבלה */}
        <div className="log-table-container">
          <table className="log-table">
            <thead>
              <tr>
                <th>מזהה</th>
                <th>שם עובד</th>
                <th>פעולה</th>
                <th>תאריך ושעה</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{log.log_id}</td>
                  <td>{log.user_name}</td>
                  <td>{log.action}</td>
                  <td>
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
        <div className="pagination fontS">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            ← הקודם
          </button>
          <span style={{ margin: "0 1rem" }}>
            עמוד <strong>{page}</strong> מתוך <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            הבא →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logs;
