import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "../Buttons/Button";

const Leads = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = () => {
    axios
      .get("http://localhost:3000/auth/leads") // ודא שהנתיב קיים ב־Node.js
      .then((res) => {
        setLeads(res.data.Result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="main mt2rem">
      <div className="main">
        <h2 className="text-center font-blue fontXL mp2rem">רשימת פניות</h2>
        <div className="filters-container">
          <Button linkTo="/dashboard/add_lead" label="הוספת פנייה חדשה" />
        </div>
        <table>
          <thead>
            <tr>
              <th>מזהה פנייה</th>
              <th>שם סטודנט</th>
              <th>מספר טלפון</th>
              <th>קורס</th>
              <th>סטטוס</th>
              <th>אחראי טיפול</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.lead_id}>
                <td>{lead.lead_id}</td>
                <td>{lead.student_name}</td>
                <td>{lead.phone_number}</td>
                <td>{lead.course_name}</td>
                <td>{lead.status}</td>
                <td>{lead.assigned_to_name}</td>
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

export default Leads;
