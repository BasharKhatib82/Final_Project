// frontend\src\components\Tasks\TaskDetails.jsx

/**
 * קומפוננטה: TaskDetails
 * -----------------------
 * 1. task_id מציגה פרטי משימה לפי מזהה (``).
 * 2. מציגה תיעוד התקדמות המשימה.
 * 3. מאפשרת הוספת תיעוד חדש + עדכון סטטוס המשימה.
 * 4. כולל פופאפים להצלחה/שגיאה/אישור.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { Popup } from "components/Tools";
import { api, extractApiError } from "utils";

const TaskDetails = () => {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [progress, setProgress] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState("חדש");

  const [saving, setSaving] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchProgress();
  }, []);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.data);
        setNewStatus(res.data.data.status);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בטעינת פרטי המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת פרטי משימה"),
        mode: "error",
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/tasks/progress/${id}`);
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
    if (!newNote.trim()) {
      setPopupData({
        title: "שגיאה",
        message: "לא ניתן לשמור תיעוד ריק",
        mode: "error",
      });
      setConfirmPopup(false);
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/tasks/progress/add", {
        task_id: id,
        progress_note: newNote.trim(),
        status: newStatus,
      });

      if (res.data.success || res.data.Status) {
        setNewNote("");
        fetchProgress();
        fetchTask();
        setPopupData({
          title: "הצלחה",
          message: "התיעוד נשמר בהצלחה!",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || res.data.Error || "שגיאה בשמירת התיעוד",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בשמירת תיעוד:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בחיבור לשרת",
        mode: "error",
      });
    } finally {
      setSaving(false);
      setConfirmPopup(false);
    }
  };

  if (!task) {
    return <div className="p-6 text-center">טוען פרטי משימה...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-rubik">
      {/* כפתור ניווט */}
      <div className="flex justify-center mb-4">
        <AppButton
          label="חזרה לרשימת משימות"
          icon={
            <Icon icon="icon-park-outline:back" width="1.2em" height="1.2em" />
          }
          variant="navigate"
          to="/dashboard/tasks"
        />
      </div>

      {/* פרטי משימה */}
      <div className="bg-white rounded shadow p-6 text-gray-700 mb-6 text-right space-y-4">
        <div className="text-xl font-semibold text-blue-700 text-center">
          {" "}
          פרטי משימה מספר [ {task.task_id} ]
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>נושא :</strong> {task.task_title}
          </div>
          <div>
            <strong>תיאור :</strong> {task.description || "-"}
          </div>
          <div>
            <strong>סטטוס :</strong>{" "}
            <span
              className={`font-semibold ${
                task.status === "חדשה"
                  ? "text-green-600"
                  : task.status === "בטיפול"
                  ? "text-blue-600"
                  : task.status === "טופלה"
                  ? "text-gray-600"
                  : "text-red-600"
              }`}
            >
              {task.status}
            </span>
          </div>
          <div>
            <strong>תאריך יצירה :</strong>{" "}
            {new Date(task.created_at).toLocaleDateString("he-IL")}
          </div>
          <div>
            <strong>תאריך יעד:</strong>{" "}
            <span
              className={
                new Date(task.due_date) < new Date() && task.status !== "טופלה"
                  ? "text-red-600 font-semibold"
                  : ""
              }
            >
              {new Date(task.due_date).toLocaleDateString("he-IL")}
            </span>
          </div>

          <div>
            <strong>נציג מטפל:</strong>{" "}
            {task.assigned_first_name
              ? `${task.assigned_first_name} ${task.assigned_last_name}`
              : "ללא"}
          </div>
        </div>
      </div>

      {/* תיעוד התקדמות */}
      <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">
        תיעוד התקדמות
      </h3>

      {progress.length === 0 ? (
        <div className="text-center text-gray-500 mb-4">אין תיעוד עד כה</div>
      ) : (
        <div className="bg-white rounded shadow p-4 space-y-3 text-right text-gray-700 mb-6">
          {progress.map((p) => (
            <div key={p.task_progress_id} className="border-b py-2">
              <div>
                <strong>סטטוס:</strong> {p.status}
              </div>
              <div>
                <strong>תיעוד:</strong> {p.progress_note}
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <div>
                  <strong>עודכן ע"י:</strong> {p.user_name || "מערכת"}
                </div>
                <div>
                  <strong>תאריך:</strong>{" "}
                  {new Date(p.update_time).toLocaleDateString("he-IL")} -{" "}
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

      {/* טופס תיעוד חדש */}
      <div className="bg-white rounded shadow p-4 mb-6 space-y-4">
        <h4 className="text-lg font-semibold text-blue-700 text-center">
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
          <label className="block mb-1 font-semibold">עדכן סטטוס משימה:</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
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
            to="/dashboard/tasks"
          />
        </div>
      </div>

      {/* פופאפים */}
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

export default TaskDetails;
