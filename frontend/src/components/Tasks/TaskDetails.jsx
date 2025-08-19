import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AddButton from "../Buttons/AddSaveButton";
import NavigationButton from "../Buttons/NavigationButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_BACKEND;
const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      const res = await axios.get(`${api}/tasks/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setTask(res.data.Result);
        setNewStatus(res.data.Result.status);
      } else {
        console.error("שגיאה בטעינת משימה:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בטעינת משימה:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${api}/tasks/progress/${id}`, {
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
        `${api}/tasks/progress/add`,
        {
          task_id: id,
          progress_note: newNote.trim(),
          status: newStatus,
        },
        { withCredentials: true }
      );

      if (res.data.Status) {
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

  if (!task) {
    return <div className="p-6 text-center">טוען משימה...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-rubik">
      <div className="flex justify-center mb-2">
        <NavigationButton
          label="חזרה לרשימת משימות"
          linkTo="/dashboard/tasks"
        />
      </div>
      <div className="bg-white rounded shadow p-6 text-gray-700 mb-6 space-y-4 text-right">
        <div className="text-xl font-semibold text-blue-700 mb-4 text-center">
          פרטי משימה #{task.task_id}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>נושא:</strong> {task.task_title}
          </div>
          <div>
            <strong>תיאור:</strong> {task.description || "-"}
          </div>
          <div>
            <strong>סטטוס:</strong>{" "}
            <span
              className={`font-semibold ${
                task.status === "חדש"
                  ? "text-green-600"
                  : task.status === "בתהליך"
                  ? "text-blue-600"
                  : task.status === "הושלם"
                  ? "text-gray-600"
                  : "text-red-600"
              }`}
            >
              {task.status}
            </span>
          </div>
          <div>
            <strong>תאריך יעד:</strong>{" "}
            {new Date(task.due_date).toLocaleDateString("he-IL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </div>
          <div>
            <strong>נציג מטפל:</strong>{" "}
            {task.assigned_to_name ? task.assigned_to_name : "ללא"}
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
            <div key={p.task_progress_id} className="border-b py-2 space-y-1">
              <div>
                <strong>סטטוס:</strong>{" "}
                <span className="font-semibold">{p.status}</span>
              </div>
              <div>
                <strong>תיעוד:</strong>{" "}
                <span className="font-semibold">{p.progress_note}</span>
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <div>
                  <strong>עודכן ע"י:</strong>{" "}
                  {p.user_name ? p.user_name : "מערכת"}
                </div>
                <div>
                  <strong>תאריך:</strong>{" "}
                  {new Date(p.update_time).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}{" "}
                  -{" "}
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
          <label className="block mb-1 font-semibold">סטטוס משימה:</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="חדש">חדש</option>
            <option value="בתהליך">בתהליך</option>
            <option value="הושלם">הושלם</option>
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

export default TaskDetails;
