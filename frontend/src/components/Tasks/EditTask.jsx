import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AddButton from "../Buttons/AddSaveButton";
import ExitButton from "../Buttons/ExitButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_BACKEND;

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchUsers();
    fetchTask();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users/active`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setUsers(res.data.Result || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  const fetchTask = async () => {
    try {
      const res = await axios.get(`${api}/tasks/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status && res.data.Result) {
        setForm(res.data.Result);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.Error || "לא ניתן לטעון את נתוני המשימה",
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
      setPopupData({
        title: "שגיאה",
        message: "יש להזין נושא משימה",
        mode: "error",
      });
      return;
    }

    if (!form.due_date) {
      setPopupData({
        title: "שגיאה",
        message: "יש לבחור תאריך יעד",
        mode: "error",
      });
      return;
    }

    setConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`${api}/tasks/edit/${id}`, form, {
        withCredentials: true,
      });

      if (res.data.Status) {
        setConfirmPopup(false);
        setPopupData({
          title: "הצלחה",
          message: "המשימה עודכנה בהצלחה!",
          mode: "success",
        });
      } else {
        setConfirmPopup(false);
        setPopupData({
          title: "שגיאה",
          message: res.data.Error || "שגיאה בעדכון המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בעדכון משימה:", err);
      setConfirmPopup(false);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בחיבור לשרת",
        mode: "error",
      });
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
            value={form.due_date ? form.due_date.substring(0, 10) : ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <AddButton label="עדכן משימה" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/tasks" />
        </div>
      </form>

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

      {confirmPopup && (
        <Popup
          title="אישור עדכון משימה"
          message="האם אתה בטוח שברצונך לעדכן את המשימה?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default EditTask;
