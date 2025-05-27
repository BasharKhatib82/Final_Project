import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Dashboard.css";

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://localhost:8801/dashboard", {
        withCredentials: true,
      });
      setStats(res.data.summary);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  if (!stats) return <div className="loading">טוען נתונים...</div>;

  return (
    <div className="container">
      <div className="main">
        <h2 className="title">לוח בקרה - מכללת לינקס</h2>

        <div className="dashboard-cards df-fdr-jcsa">
          {/* עובדים */}
          <div className="card grouped-card">
            <span className="icon">👥</span>
            <h4>עובדים</h4>
            <ul className="grouped-list">
              <li>
                פעילים: <strong>{stats.employees.active}</strong>
              </li>
              <li>
                לא פעילים: <strong>{stats.employees.inactive}</strong>
              </li>
              <li>
                מחוברים כעת:{" "}
                <strong>{stats.employees.online_list.length}</strong>
              </li>
            </ul>
          </div>

          {/* תפקידים */}
          <div className="card grouped-card">
            <span className="icon">🛡️</span>
            <h4>תפקידים</h4>
            <ul className="grouped-list">
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

          {/* פניות */}
          <div className="card grouped-card">
            <span className="icon">📩</span>
            <h4>פניות</h4>
            <ul className="grouped-list">
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
          <div className="card grouped-card">
            <span className="icon">📝</span>
            <h4>משימות</h4>
            <ul className="grouped-list">
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

        {/* עובדים מחוברים */}
        <h3 className="section-title">🟢 עובדים מחוברים כעת</h3>
        <ul className="grouped-list">
          {stats.employees.online_list.map((user, i) => (
            <li key={i}>
              {user.name} - {user.role} <span className="online-dot">🟢</span>
            </li>
          ))}
        </ul>

        {/* החתמות לפי עובד */}
        <h3 className="section-title">⏱️ סה"כ חתימות נוכחות לפי עובד</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>שם עובד</th>
              <th>סה"כ שעות</th>
            </tr>
          </thead>
          <tbody>
            {stats.attendance.map((row, i) => (
              <tr key={i}>
                <td>{row.name}</td>
                <td>{row.total_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* תיעודים לפי יום */}
        <h3 className="section-title">📋 תיעודים לפי יום (7 ימים אחרונים)</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>כמות תיעודים</th>
            </tr>
          </thead>
          <tbody>
            {stats.logs_by_day.map((row, i) => (
              <tr key={i}>
                <td>{row.date.slice(0, 10)}</td>
                <td>{row.total_logs}  תיעודים</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
