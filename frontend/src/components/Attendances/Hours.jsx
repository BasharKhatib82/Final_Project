import React, { useEffect, useState } from "react";
import axios from "axios";

import Button from "../Buttons/Button";

const Hours = () => {
  const [hours, setHours] = useState([]);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = () => {
    axios
      .get("http://localhost:3000/auth/hours") // ודא שהנתיב קיים בצד השרת
      .then((res) => {
        setHours(res.data.Result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="main-dash mt2rem">
      <h2 className="text-center font-blue fontXL mp2rem">ניהול שעות עובדים</h2>
      <div className="filters-container">
        <Button linkTo="/dashboard/add_hours" label="הוספת רישום חדש" />
      </div>
      <table>
        <thead>
          <tr>
            <th>מזהה רישום</th>
            <th>עובד</th>
            <th>תאריך</th>
            <th>שעת כניסה</th>
            <th>שעת יציאה</th>
            <th>סטטוס</th>
            <th>פעולה</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((log) => (
            <tr key={log.log_id}>
              <td>{log.log_id}</td>
              <td>{log.employee_name}</td> {/* ודא ששם העובד נשלח מהשרת */}
              <td>
                {new Date(log.date).toLocaleDateString("he-IL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
              <td>{log.check_in}</td>
              <td>{log.check_out}</td>
              <td>{log.status}</td>
              <td className="action-buttons">
                <button className="btn-edit">עריכה</button>
                <button className="btn-delete">מחיקה</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Hours;
