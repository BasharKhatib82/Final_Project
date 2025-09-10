// frontend/src/pages/Attendance/EditAttendance.jsx

/**
 * קומפוננטה: EditAttendance
 * -------------------------
 * מטרות:
 * - עריכת רישום נוכחות
 * - טוענת נתוני עובדים ונוכחות
 * - שמירה לאחר אישור
 *
 * הרשאות:
 * - permission_edit_attendance
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";

export default function EditAttendance() {
  const { id } = useParams();
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
    fetchAttendance();
  }, [id]);

  const fetchUsers = () => {
    Promise.all([api.get("/users/active"), api.get("/users/inactive")])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes.data.data || []).map((u) => ({
          ...u,
          active: true,
        }));
        const inactive = (inactiveRes.data.data || []).map((u) => ({
          ...u,
          active: false,
        }));
        setUsers([...active, ...inactive]);
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

  const fetchAttendance = () => {
    api
      .get(`/attendance/${id}`)
      .then((res) => {
        const data = res.data?.data;
        if (!data) throw new Error("לא נמצאה רשומה");

        const formattedDate = data.date?.split("T")[0] || "";

        setForm({
          user_id: data.user_id,
          date: formattedDate,
          check_in: data.check_in || "",
          check_out: data.check_out || "",
          status: data.status,
          notes: data.notes || "",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת רישום הנוכחות"),
          mode: "error",
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === "status" && specialStatuses.includes(value)) {
      updated.check_in = "";
      updated.check_out = "";
    }

    setForm(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id || !form.date || !form.status) {
      return setPopup({
        show: true,
        title: "שגיאה",
        message: "נא למלא את כל שדות החובה",
        mode: "error",
      });
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
      title: "אישור עדכון",
      message: "האם אתה בטוח שברצונך לעדכן את הנוכחות?",
      mode: "confirm",
    });
  };

  const confirmUpdate = () => {
    const payload = {
      ...form,
      check_in: isSpecialStatus ? null : form.check_in,
      check_out: isSpecialStatus ? null : form.check_out,
    };

    api
      .put(`/attendance/edit/${id}`, payload)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "הנוכחות עודכנה בהצלחה",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בעדכון הנתונים"),
          mode: "error",
        });
      });
  };

  // הרשאה
  if (currentUser?.permission_edit_attendance !== 1) {
    return (
      <div className="text-center text-red-600 font-semibold mt-10">
        אין לך הרשאה לעריכת נוכחות
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-3 text-right"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center mb-2">
          עריכת רישום נוכחות
        </h2>

        {/* עובד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">עובד</label>
          <select
            name="user_id"
            value={form.user_id}
            disabled
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-500"
          >
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
                {!u.active ? " ⚠ לא פעיל" : ""}
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
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="נוכח">נוכח</option>
            <option value="חופשה">חופשה</option>
            <option value="מחלה">מחלה</option>
            <option value="היעדרות">היעדרות</option>
          </select>
        </div>

        {/* שעות נוכחות */}
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
          />
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור שינויים" />
          <ExitButton label="ביטול" linkTo="/dashboard/attendance" />
        </div>
      </form>

      {/* פופאפ כללי */}
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
          onConfirm={popup.mode === "confirm" ? confirmUpdate : undefined}
        />
      )}
    </div>
  );
}
