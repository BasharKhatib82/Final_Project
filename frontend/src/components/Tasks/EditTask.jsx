// frontend\src\components\Tasks\EditTask.jsx

/**
 * קומפוננטה: EditTask
 * -----------------------
 * 1. task_id מאפשרת עריכת משימה לפי מזהה .
 * 2. טוענת נתוני משימה ונתוני נציגים פעילים.
 * 3. כוללת טופס עם שדות: נושא, תיאור, סטטוס, תאריך יעד, נציג.
 * 4. כוללת אישור לפני שמירה, ופופאפ הצלחה/שגיאה.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { Popup } from "components/Tools";
import { api } from "utils";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    task_title: "",
    description: "",
    status: "",
    due_date: "",
    user_id: "",
  });

  const [users, setUsers] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTask();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/active");
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת משתמשים :", err);
    }
  };

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success && res.data.data) {
        setForm(res.data.data);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "לא ניתן לטעון את נתוני המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בטעינת משימה:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בחיבור לשרת",
        mode: "error",
      });
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
      const payload = {
        task_title: form.task_title,
        description: form.description,
        status: form.status,
        due_date: form.due_date,
        user_id: form.user_id || null,
      };

      const res = await api.put(`/tasks/edit/${id}`, payload);

      if (res.data.success || res.data.Status) {
        setPopupData({
          title: "הצלחה",
          message: "המשימה עודכנה בהצלחה!",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || res.data.Error || "שגיאה בעדכון המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בעדכון משימה:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בהתחברות לשרת",
        mode: "error",
      });
    } finally {
      setConfirmPopup(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/90 p-6 mt-8 rounded-lg shadow-md text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        עריכת משימה
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
            value={form.user_id || ""}
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
            <option value="חדשה">חדשה</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופלה">טופלה</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">תאריך יעד *</label>
          <input
            type="date"
            name="due_date"
            value={form.due_date ? form.due_date.substring(0, 10) : ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
          />
        </div>
        <div className="flex justify-around pt-4">
          <AppButton
            label="שמור שינויים"
            type="submit"
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
            label="ביטול עריכה"
            icon={
              <Icon icon="hugeicons:cancel-02" width="1.2em" height="1.2em" />
            }
            variant="cancel"
            to="/dashboard/tasks"
          />
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

      {/* פופאפ אישור */}
      {confirmPopup && (
        <Popup
          title="אישור עדכון משימה"
          message={`"האם אתה מאשר לעדכן את משימה מספר [ ${id} ] ? "`}
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default EditTask;
