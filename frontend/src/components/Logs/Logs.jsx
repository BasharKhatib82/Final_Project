import React, { useEffect, useState } from "react";
import axios from "axios";

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    axios
      .get("http://localhost:3000/auth/logs")
      .then((res) => {
        setLogs(res.data.Result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="container">
      <div className="main">
        <h3 className="title">יומן פעולות - תיעוד מערכת</h3>
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
    </div>
  );
};

export default Logs;
