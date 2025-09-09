import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup } from "components/Tools";

const api = process.env.REACT_APP_API_URL;

const EditAttendance = () => {
  const { id } = useParams();
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

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
  });

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(form.status);

  useEffect(() => {
    fetchUsers();
    fetchAttendance();
  }, [id]);

  // ✅ שליפת משתמשים פעילים + לא פעילים
  const fetchUsers = () => {
    Promise.all([
      axios.get(`${api}/users/active`, { withCredentials: true }),
      axios.get(`${api}/users/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes.data.data || []).map((user) => ({
          ...user,
          active: true,
        }));
        const inactive = (inactiveRes.data.data || []).map((user) => ({
          ...user,
          active: false,
        }));
        setUsers([...active, ...inactive]);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת משתמשים:", err);
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת המשתמשים",
          type: "error",
        });
      });
  };

  //  שליפת נתוני נוכחות קיימת
  const fetchAttendance = () => {
    axios
      .get(`${api}/attendance/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const attendance = res.data.data;
          const formattedDate = attendance.date?.split("T")[0] || "";
          setForm({
            user_id: attendance.user_id,
            date: formattedDate,
            check_in: attendance.check_in || "",
            check_out: attendance.check_out || "",
            status: attendance.status,
            notes: attendance.notes || "",
          });
        } else {
          setPopup({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "לא נמצאה רשומה",
            type: "error",
          });
        }
      })
      .catch((err) => {
        console.error("שגיאה בטעינת נוכחות:", err);
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת פרטי הנוכחות",
          type: "error",
        });
      });
  };

  // ✅ שינוי ערכים
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === "status" && specialStatuses.includes(value)) {
      updated.check_in = "";
      updated.check_out = "";
    }

    setForm(updated);
  };

  // ✅ שליחה עם בדיקות
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id || !form.date || !form.status) {
      return setPopup({
        show: true,
        title: "שגיאה",
        message: "נא למלא את כל שדות החובה",
        type: "error",
      });
    }

    if (!isSpecialStatus && (!form.check_in || !form.check_out)) {
      return setPopup({
        show: true,
        title: "שגיאה",
        message: "יש להזין שעת כניסה ויציאה",
        type: "error",
      });
    }

    setShowConfirmPopup(true);
  };

  // ✅ שמירה סופית
  const handleConfirmSave = () => {
    setShowConfirmPopup(false);

    const payload = {
      ...form,
      check_in: isSpecialStatus ? null : form.check_in,
      check_out: isSpecialStatus ? null : form.check_out,
    };

    axios
      .put(`${api}/attendance/edit/${id}`, payload, {
        withCredentials: true,
      })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "הנוכחות עודכנה בהצלחה",
          type: "success",
        });
      })
      .catch((err) => {
        console.error("שגיאה בעדכון נוכחות:", err);
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בעדכון הנתונים",
          type: "error",
        });
      });
  };

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
          <label className="font-rubik block mb-0.5 font-medium">
            בחר עובד
          </label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            disabled
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-500"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
                {!user.active ? " ⚠ לא פעיל" : ""}
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

        {/* שעות כניסה/יציאה */}
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

      {/* פופאפ הצלחה/שגיאה */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.type}
          onClose={() => {
            setPopup({ show: false, title: "", message: "", type: "" });
            if (popup.type === "success") {
              navigate("/dashboard/attendance");
            }
          }}
        />
      )}

      {/* פופאפ אישור שמירה */}
      {showConfirmPopup && (
        <Popup
          title="אישור עדכון"
          message="האם אתה בטוח שברצונך לעדכן את הנוכחות?"
          mode="confirm"
          onClose={() => setShowConfirmPopup(false)}
          onConfirm={handleConfirmSave}
        />
      )}
    </div>
  );
};

export default EditAttendance;
