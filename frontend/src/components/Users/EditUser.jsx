// frontend/src/pages/Users/EditUser.jsx

/**
 * קומפוננטה: EditUser
 * -------------------
 * מטרות:
 * - מאפשרת עריכת פרטי משתמש קיים.
 * - טוענת את פרטי המשתמש ותפקידים פעילים.
 * - API מאפשרת עדכון ושליחה ל.
 * - לאישורים והודעות Popup מציגה .
 *
 * הרשאות:
 * - רק משתמשים עם permission_edit_user יכולים לבצע שמירה.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [userData, setUserData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  useEffect(() => {
    fetchUserAndRoles();
  }, []);

  const fetchUserAndRoles = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      const user = res.data.data;
      setUserData(user);

      const rolesRes = await api.get(`/roles/active`);
      let activeRoles = rolesRes.data.data.map((r) => ({ ...r, active: true }));

      // אם התפקיד של המשתמש אינו בין הפעילים – טען אותו ידנית
      const exists = activeRoles.some((r) => r.role_id === user.role_id);
      if (!exists) {
        const roleRes = await api.get(`/roles/${user.role_id}`);
        if (roleRes.data.data) {
          activeRoles.push({ ...roleRes.data.data, active: false });
        }
      }

      setRoles(activeRoles);
    } catch (err) {
      setPopup({
        show: true,
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת נתונים"),
        mode: "error",
      });
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setUserData({ ...userData, phone_number: digitsOnly });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPopup({
      show: true,
      title: "אישור עדכון",
      message: "⚠️ האם לעדכן את פרטי המשתמש?",
      mode: "confirm",
    });
  };

  const confirmUpdate = () => {
    api
      .put(`/users/${id}`, userData)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "המשתמש עודכן בהצלחה",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בעדכון המשתמש"),
          mode: "error",
        });
      });
  };

  if (!userData) {
    return (
      <div className="text-center text-blue-600 font-rubik text-lg p-6">
        ...טוען נתוני משתמש
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2 text-right"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          עדכון פרטי משתמש
        </h2>

        {/* שם פרטי */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">שם פרטי</label>
          <input
            type="text"
            name="first_name"
            value={userData.first_name}
            onChange={handleChange}
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* שם משפחה */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            שם משפחה
          </label>
          <input
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleChange}
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* טלפון */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">טלפון</label>
          <input
            type="text"
            name="phone_number"
            value={userData.phone_number || ""}
            onChange={handlePhoneChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* אימייל */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">אימייל</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* תפקיד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">תפקיד</label>
          <select
            name="role_id"
            value={userData.role_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name} {!role.active ? " 🚫 תפקיד לא פעיל" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* הערות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            value={userData.notes || ""}
            onChange={handleChange}
            rows="2"
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          ></textarea>
        </div>

        {/* סטטוס */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="active"
            value={userData.active}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value="1">פעיל</option>
            <option value="0">לא פעיל</option>
          </select>
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          {currentUser?.permission_edit_user === 1 && (
            <AddSaveButton label="שמור שינויים" />
          )}
          <ExitButton label="ביטול" linkTo="/dashboard/users" />
        </div>
      </form>

      {/* Popup */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => {
            setPopup({ show: false, title: "", message: "", mode: "info" });
            if (popup.mode === "success") {
              navigate("/dashboard/users");
            }
          }}
          onConfirm={popup.mode === "confirm" ? confirmUpdate : undefined}
        />
      )}
    </div>
  );
}
