import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_API_URL;

const AddAttendance = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    status: "נוכח",
    notes: "",
  });

  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(form.status);

  // ✅ טעינת עובדים פעילים בלבד
  useEffect(() => {
    axios
      .get(`${api}/users/active`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.data || []);
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "שגיאה בטעינת עובדים",
            mode: "error",
          });
        }
      })
      .catch(() =>
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאה בעת טעינת העובדים",
          mode: "error",
        })
      );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && specialStatuses.includes(value)
        ? { check_in: "", check_out: "" }
        : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ בדיקות חובה
    const requiredFields = ["user_id", "date", "status"];
    for (let field of requiredFields) {
      if (!form[field]) {
        setPopupData({
          show: true,
          title: "שגיאה",
          message: `שדה חובה חסר: ${field}`,
          mode: "error",
        });
        return;
      }
    }

    if (!isSpecialStatus && (!form.check_in || !form.check_out)) {
      return setPopupData({
        show: true,
        title: "שגיאה",
        message: "יש להזין שעת כניסה ויציאה",
        mode: "error",
      });
    }

    // ✅ פופאפ אישור
    setPopupData({
      show: true,
      title: "אישור הוספת נוכחות",
      message: "האם אתה בטוח שברצונך להוסיף רישום נוכחות?",
      mode: "confirm",
    });
  };

  const confirmAdd = () => {
    axios
      .post(`${api}/attendance/add`, form, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setPopupData({
            show: true,
            title: "הצלחה",
            message: res.data.Message || "הנוכחות נוספה בהצלחה",
            mode: "success",
          });
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "שגיאה בשמירה",
            mode: "error",
          });
        }
      })
      .catch(() =>
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "אירעה שגיאה בשמירה",
          mode: "error",
        })
      );
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-3"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center mb-2">
          הוספת רישום נוכחות
        </h2>

        {/* בחירת עובד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            בחר עובד
          </label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* תאריך */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">תאריך</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* סטטוס */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value="נוכח">נוכח</option>
            <option value="חופשה">חופשה</option>
            <option value="מחלה">מחלה</option>
            <option value="היעדרות">היעדרות</option>
          </select>
        </div>

        {/* שעות נוכחות – יוצגו רק אם לא חופשה/מחלה/היעדרות */}
        {!isSpecialStatus && (
          <>
            <div>
              <label className="font-rubik block mb-0.5 font-medium">
                שעת כניסה
              </label>
              <input
                type="time"
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
                className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="font-rubik block mb-0.5 font-medium">
                שעת יציאה
              </label>
              <input
                type="time"
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
                className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </>
        )}

        {/* הערות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="2"
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 resize-none"
            placeholder="הזן הערה (אופציונלי)..."
          />
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור רישום" />
          <ExitButton label="ביטול" linkTo="/dashboard/attendance" />
        </div>
      </form>

      {/* פופאפ */}
      {popupData.show && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => {
            setPopupData({
              show: false,
              title: "",
              message: "",
              mode: "info",
            });
            if (popupData.mode === "success") {
              navigate("/dashboard/attendance");
            }
          }}
          onConfirm={popupData.mode === "confirm" ? confirmAdd : undefined}
        />
      )}
    </div>
  );
};

export default AddAttendance;
