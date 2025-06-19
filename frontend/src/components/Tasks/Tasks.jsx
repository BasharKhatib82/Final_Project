import React, { useEffect, useState } from "react";
import axios from "axios";
import NavigationButton from "../Buttons/NavigationButton";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios
      .get("http://localhost:3000/auth/tasks")
      .then((res) => {
        setTasks(res.data.Result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="main-dash mt2rem">
      <div className="main">
        <h2 className="text-center font-blue fontXL mp2rem">רשימת משימות</h2>
        <div className="filters-container">
          <NavigationButton
            linkTo="/dashboard/add_task"
            label="הוספת משימה חדשה"
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>מזהה</th>
              <th>נושא</th>
              <th>תיאור</th>
              <th>תאריך יעד</th>
              <th>סטטוס</th>
              <th>אחראי</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.task_id}</td>
                <td>{task.task_title}</td>
                <td>{task.description}</td>
                <td>
                  {new Date(task.due_date).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td>{task.status}</td>
                <td>{task.assigned_to_name}</td>
                <td className="action-buttons">
                  <button className="btn-edit">עריכה</button>
                  <button className="btn-delete">מחיקה</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
