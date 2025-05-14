import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalTasks: 0,
    totalHours: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/dashboard");
      setStats(res.data.summary);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  return (
    <div className="container">
      <div className="main">
        <h2 className="title">לוח בקרה - מכללת לינקס</h2>

        {/* כרטיסי סיכום */}
        <div className="dashboard-cards df-fdr-jcsa">
          <div className="card">
            <span className="icon">👥</span> עובדים במערכת:{" "}
            <strong>{stats.totalUsers}</strong>
          </div>
          <div className="card">
            📩 פניות: <strong>{stats.totalLeads}</strong>
          </div>
          <div className="card">
            📝 משימות: <strong>{stats.totalTasks}</strong>
          </div>
          <div className="card">
            ⏱️ סה"כ שעות נוכחות: <strong>{stats.totalHours}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
