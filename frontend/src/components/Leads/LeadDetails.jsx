import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LeadDetails = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    fetchLead();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/leads/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setLead(res.data.Result);
      } else {
        console.error("שגיאה בטעינת הפנייה:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בטעינת הפנייה:", err);
    }
  };

  if (!lead) {
    return <div className="p-6 text-center">טוען פנייה...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl text-blue-700 mb-4 text-center">
        פרטי פנייה #{lead.lead_id}
      </h2>

      <div className="space-y-3 text-right text-gray-700">
        <div>
          <strong>שם לקוח:</strong> {lead.first_name} {lead.last_name}
        </div>
        <div>
          <strong>טלפון:</strong> {lead.phone_number}
        </div>
        <div>
          <strong>מייל:</strong> {lead.email}
        </div>
        <div>
          <strong>עיר:</strong> {lead.city}
        </div>
        <div>
          <strong>פרויקט:</strong> {lead.project_name}
        </div>
        <div>
          <strong>נציג מטפל:</strong>{" "}
          {lead.rep_first_name
            ? `${lead.rep_first_name} ${lead.rep_last_name}`
            : "ללא"}
        </div>
        <div>
          <strong>סטטוס:</strong>{" "}
          <span
            className={
              lead.status === "חדש"
                ? "text-green-600 font-semibold"
                : lead.status === "בטיפול"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 font-semibold"
            }
          >
            {lead.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
