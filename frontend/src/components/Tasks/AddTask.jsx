/**
 * קומפוננטה: AddTask
 * -----------------------
 * 1. מאפשרת הוספת משימה חדשה.
 * 2. כוללת שדות: נושא, תיאור, סטטוס, תאריך יעד, נציג.
 * 3. כוללת אישור לפני שמירה, ופופאפ הצלחה/שגיאה.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup } from "components/Tools";
import { api } from "utils";

const AddTask = () => {
  const [form, setForm] = useState({
    task_title: "",
    description: "",
    status: "חדש",
    due_date: "",
    user_id: "",
  });

  const [users, setUsers] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/active");
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת נציגים:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    if (!form.task_title.trim()) {
      return setPopupData({
        title: "שגיאה",
        message: "יש להזין נושא משימה",
        mode: "error",
      });
    }

    if (!form.due_date) {
      return setPopupData({
        title: "שגיאה",
        message: "יש לבחור תאריך יעד",
        mode: "error",
      });
    }

    setConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post("/tasks/add", form);

      if (res.data.success || res.data.Status) {
        setConfirmPopup(false);
        setPopupData({
          title: "הצלחה",
          message: "המשימה נוספה בהצלחה!",
          mode: "success",
        });
      } else {
        setConfirmPopup(false);
        setPopupData({
          title: "שגיאה",
          message: res.data.message || res.data.Error || "שגיאה בהוספת המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בהוספת משימה:", err);
      setConfirmPopup(false);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בהתחברות לשרת",
        mode: "error",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/90 p-6 mt-8 rounded-lg shadow-md text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הוספת משימה חדשה
      </h2>

      <form onSubmit={handleConfirm} className="space-y-4 font-rubik">
        <div>
          <label className="block mb-1 font-medium">נושא משימה *</label>
          <input
            type="text"
            name="task_title"
            value={form.task_title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">תיאור משימה</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">נציג מטפל</label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">ללא</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">סטטוס</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="חדש">חדש</option>
            <option value="בתהליך">בתהליך</option>
            <option value="הושלם">הושלם</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">תאריך יעד *</label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <AddSaveButton label="שמור משימה" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/tasks" />
        </div>
      </form>

      {/* פופאפ הצלחה / שגיאה */}
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => {
            if (popupData.mode === "success") {
              navigate("/dashboard/tasks");
            } else {
              setPopupData(null);
            }
          }}
        />
      )}

      {/*  פופאפ אישור שמירת משימה*/}
      {confirmPopup && (
        <Popup
          title="אישור שמירת משימה"
          message="האם אתה בטוח שברצונך לשמור את המשימה?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default AddTask;
