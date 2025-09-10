// frontend/src/pages/Attendance/AddAttendance.jsx

/**
 * קומפוננטה: AddAttendance
 * ------------------------
 * מטרות:
 * - הוספת רישום נוכחות ידני
 * - טוענת עובדים פעילים
 * - טיפול בשעות כניסה/יציאה לפי סטטוס
 * - API שמירה לשרת דרך
 *
 * הרשאות:
 * - נדרשת הרשאה permission_add_attendance
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";

export default function AddAttendance() {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    status: "נוכח",
    notes: "",
  });

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(form.status);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api
      .get("/users/active")
      .then((res) => {
        setUsers(res.data?.data || []);
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת עובדים"),
          mode: "error",
        });
      });
  };

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

    const required = ["user_id", "date", "status"];
    for (let field of required) {
      if (!form[field]) {
        return setPopup({
          show: true,
          title: "שגיאה",
          message: `שדה חובה חסר: ${field}`,
          mode: "error",
        });
      }
    }

    if (!isSpecialStatus && (!form.check_in || !form.check_out)) {
      return setPopup({
        show: true,
        title: "שגיאה",
        message: "יש להזין שעת כניסה ויציאה",
        mode: "error",
      });
    }

    setPopup({
      show: true,
      title: "אישור הוספה",
      message: "להוסיף את רישום הנוכחות?",
      mode: "confirm",
    });
  };

  const confirmAdd = () => {
    api
      .post("/attendance/add", form)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "✅ רישום הנוכחות נשמר",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בשמירה"),
          mode: "error",
        });
      });
  };

  //  חסימת קומפוננטה אם אין הרשאה
  if (currentUser?.permission_add_attendance !== 1) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        אין לך הרשאה להוספת רישומי נוכחות
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-3"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center mb-2">
          הוספת רישום נוכחות
        </h2>

        {/* עובד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">עובד</label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
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

        {/* שעות – רק אם סטטוס רגיל */}
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
            placeholder="הזן הערה (לא חובה)..."
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 resize-none"
          />
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור רישום" />
          <ExitButton label="ביטול" linkTo="/dashboard/attendance" />
        </div>
      </form>

      {/* פופאפ */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => {
            setPopup({ show: false, title: "", message: "", mode: "info" });
            if (popup.mode === "success") {
              navigate("/dashboard/attendance");
            }
          }}
          onConfirm={popup.mode === "confirm" ? confirmAdd : undefined}
        />
      )}
    </div>
  );
}
