import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavigationButton from "../Buttons/NavigationButton";
import AddButton from "../Buttons/AddSaveButton";
import { useUser } from "../Tools/UserContext";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_API_URL;

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [lead, setLead] = useState(null);
  const [progress, setProgress] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("חדש");
  const [saving, setSaving] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchProgress();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`${api}/leads/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setLead(res.data.Result);
        setNewStatus(res.data.Result.status); // ✅ נעדכן גם את סטטוס הפנייה
      } else {
        console.error("שגיאה בטעינת הפנייה:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בטעינת הפנייה:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${api}/leads/progress/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setProgress(res.data.Result);
      } else {
        console.error("שגיאה בטעינת התקדמות:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בטעינת התקדמות:", err);
    }
  };

  const handleSaveNote = async () => {
    if (newNote.trim() === "") {
      setPopupData({
        title: "שגיאה",
        message: "לא ניתן לשמור תיעוד ריק",
        mode: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `${api}/leads/progress/add`,
        {
          lead_id: id,
          lead_note: newNote.trim(),
          status: newStatus,
          user_id: user.user_id,
        },
        { withCredentials: true }
      );

      if (res.data.Status) {
        setNewNote("");
        await fetchProgress(); // ✅ נטען מחדש את התיעודים
        await fetchLead(); // ✅ נטען מחדש את הפנייה (סטטוס למעלה)
        setPopupData({
          title: "הצלחה",
          message: "התיעוד נשמר בהצלחה!",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.Error || "שגיאה בשמירת התיעוד",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בשמירת תיעוד:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשמירת תיעוד",
        mode: "error",
      });
    } finally {
      setSaving(false);
      setConfirmPopup(false);
    }
  };

  if (!lead) {
    return <div className="p-6 text-center">טוען פנייה...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-rubik">
      <div className="flex justify-center mb-2 ">
        <NavigationButton label="חזרה לרשימת פניות" linkTo="/dashboard/leads" />
      </div>

      <div className="bg-white rounded shadow p-6 text-gray-700 mb-6 space-y-4 text-right">
        <div className="text-xl font-semibold text-blue-700 mb-4 text-center">
          פרטי פנייה #{lead.lead_id}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  : lead.status === "טופל"
                  ? "text-gray-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {lead.status}
            </span>
          </div>
          <div>
            <strong>תאריך יצירה:</strong>{" "}
            {new Date(lead.created_at).toLocaleDateString("he-IL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            - שעה:{" "}
            {new Date(lead.created_at).toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-blue-700 mt-8 mb-4 text-center">
        תיעוד התקדמות
      </h3>

      {progress.length === 0 ? (
        <div className="text-center text-gray-500 mb-4">אין תיעוד עד כה</div>
      ) : (
        <div className="bg-white rounded shadow p-4 space-y-2 text-right text-gray-700 mb-4">
          {progress.map((p) => (
            <div key={p.lead_progress_id} className="border-b py-2 space-y-1">
              <div>
                <strong>סטטוס:</strong>{" "}
                <span className="font-semibold">{p.status}</span>
              </div>
              <div>
                <strong>תיעוד:</strong>{" "}
                <span className="font-semibold">{p.lead_note}</span>
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <div>
                  <strong>עודכן ע"י:</strong>{" "}
                  {p.user_name ? p.user_name : "מערכת"}
                </div>
                <div>
                  <strong>תאריך:</strong>{" "}
                  {new Date(p.update_time).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  - שעה:{" "}
                  {new Date(p.update_time).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded shadow p-4 mb-6 space-y-4">
        <h4 className="text-lg font-semibold text-blue-700 mb-2 text-center">
          הוסף תיעוד חדש
        </h4>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows="4"
          placeholder="הקלד כאן את התיעוד החדש..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />

        <div>
          <label className="block mb-1 font-semibold">סטטוס:</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        </div>

        <div className="flex justify-center">
          <AddButton
            label={saving ? "שומר..." : "שמור תיעוד"}
            type="button"
            onClick={() => setConfirmPopup(true)}
          />
        </div>
      </div>

      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => setPopupData(null)}
        />
      )}

      {confirmPopup && (
        <Popup
          title="אישור שמירת תיעוד"
          message="האם אתה בטוח שברצונך לשמור את התיעוד?"
          mode="confirm"
          onConfirm={handleSaveNote}
          onClose={() => setConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default LeadDetails;
