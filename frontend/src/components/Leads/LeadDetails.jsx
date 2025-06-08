import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LeadDetails = () => {
  const { id } = useParams(); // lead_id
  const [lead, setLead] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLead();
    fetchProgress();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/leads/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setLead(res.data.Result);
      }
    } catch (err) {
      console.error("שגיאה בשליפת פנייה:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/lead-progress/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setProgressList(res.data.Result);
      }
    } catch (err) {
      console.error("שגיאה בשליפת התקדמות:", err);
    }
  };

  const handleAddProgress = async () => {
    if (!newNote || !newStatus) {
      setError("נא למלא הערה וסטטוס");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8801/lead-progress/add",
        {
          lead_id: id,
          lead_note: newNote,
          status: newStatus,
        },
        { withCredentials: true }
      );

      if (res.data.Status) {
        setNewNote("");
        setNewStatus("");
        setError("");
        fetchProgress(); // רענון
      } else {
        setError(res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בהוספת תיעוד:", err);
    }
  };

  if (!lead)
    return <div className="text-center p-6 text-xl">טוען פרטי פנייה...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-rubik">
      <h2 className="text-2xl font-bold mb-4">📋 פרטי פנייה</h2>

      <div className="bg-white rounded shadow p-4 mb-6">
        <p>
          <strong>טלפון:</strong> {lead.phone_number}
        </p>
        <p>
          <strong>שם לקוח:</strong> {lead.first_name} {lead.last_name}
        </p>
        <p>
          <strong>מייל:</strong> {lead.email}
        </p>
        <p>
          <strong>עיר:</strong> {lead.city}
        </p>
        <p>
          <strong>פרויקט:</strong> {lead.project_name}
        </p>
        <p>
          <strong>סטטוס:</strong> {lead.status}
        </p>
      </div>

      <h3 className="text-xl font-bold mb-2">📈 תיעוד הטיפול בפנייה</h3>
      <div className="bg-white rounded shadow p-4 mb-6 space-y-4">
        {progressList.length === 0 ? (
          <p className="text-gray-500">אין תיעוד עד כה.</p>
        ) : (
          progressList.map((item, i) => (
            <div key={i} className="border-b pb-2">
              <p>
                <strong>תאריך:</strong>{" "}
                {item.update_time.slice(0, 16).replace("T", " ")}
              </p>
              <p>
                <strong>מטפל:</strong> {item.user_name}
              </p>
              <p>
                <strong>סטטוס:</strong> {item.status}
              </p>
              <p>
                <strong>הערה:</strong> {item.lead_note}
              </p>
            </div>
          ))
        )}
      </div>

      <h3 className="text-xl font-bold mb-2">➕ הוספת תיעוד</h3>
      <div className="bg-white rounded shadow p-4 space-y-3">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="סטטוס חדש"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="הערה"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        ></textarea>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleAddProgress}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          שמור התקדמות
        </button>
      </div>
    </div>
  );
};

export default LeadDetails;
