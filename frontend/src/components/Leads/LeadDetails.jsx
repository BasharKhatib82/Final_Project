// frontend/src/pages/Leads/LeadDetails.jsx

/**
 * קומפוננטה: LeadDetails
 * -----------------------
 * 1. lead_id מציגה פרטי פנייה לפי מזהה .
 * 2. מציגה תיעוד התקדמות פנייה.
 * 3. מאפשרת הוספת תיעוד חדש + עדכון סטטוס הפנייה.
 * 4. כולל פופאפים להצלחה/שגיאה/אישור.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";

const LeadDetails = () => {
  const { id } = useParams();
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
      const res = await api.get(`/leads/${id}`);
      if (res.data.success) {
        setLead(res.data.data);
        setNewStatus(res.data.data.status);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בטעינת פרטי הפנייה",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת פרטי הפנייה"),
        mode: "error",
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/leads/progress/${id}`);
      if (res.data.success) {
        setProgress(res.data.data);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בטעינת תיעודים",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת תיעודים"),
        mode: "error",
      });
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
      const res = await api.post("/leads/progress/add", {
        lead_id: id,
        lead_note: newNote.trim(),
        status: newStatus,
        user_id: user.user_id,
      });

      if (res.data.success) {
        setNewNote("");
        await fetchProgress();
        await fetchLead();
        setPopupData({
          title: "הצלחה",
          message: "התיעוד נשמר בהצלחה!",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בשמירת תיעוד",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בשמירת תיעוד"),
        mode: "error",
      });
    } finally {
      setSaving(false);
      setConfirmPopup(false);
    }
  };

  if (!lead) return <div className="p-6 text-center">טוען פנייה...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto font-rubik">
      <div className="flex justify-center mb-4">
        <AppButton
          label="חזרה לרשימת פניות"
          icon={
            <Icon icon="icon-park-outline:back" width="1.2em" height="1.2em" />
          }
          variant="navigate"
          to="/dashboard/leads"
        />
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
                lead.status === "חדשה"
                  ? "text-green-600 font-semibold"
                  : lead.status === "בטיפול"
                  ? "text-blue-600 font-semibold"
                  : lead.status === "טופלה"
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
                <strong>סטטוס:</strong> {p.status}
              </div>
              <div>
                <strong>תיעוד:</strong> {p.lead_note}
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <div>
                  <strong>עודכן ע"י:</strong> {p.user_name || "מערכת"}
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
            <option value="חדשה">חדשה</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופלה">טופלה</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        </div>

        <div className="flex justify-around pt-4">
          <AppButton
            label={saving ? "שומר..." : "הוספת תיעוד"}
            onClick={() => setConfirmPopup(true)}
            icon={
              <Icon
                icon="fluent:save-edit-20-regular"
                width="1.2em"
                height="1.2em"
              />
            }
            variant="normal"
          />
          <AppButton
            label="ביטול הוספה"
            icon={
              <Icon icon="hugeicons:cancel-02" width="1.2em" height="1.2em" />
            }
            variant="cancel"
            to="/dashboard/leads"
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
