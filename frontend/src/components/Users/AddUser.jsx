// frontend/src/pages/Users/AddUser.jsx

/**
 * קומפוננטה: AddUser
 * ------------------
 * מטרות:
 * - מאפשרת הוספת עובד חדש.
 * - טוענת תפקידים פעילים ומציגה בטופס.
 * - שומרת את העובד במסד באמצעות API.
 * - מציגה Popup במצב הצלחה/שגיאה.
 *
 * הרשאות:
 * - רק המשתמשים עם permission_add_user יראו את כפתור ההוספה.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";

export default function AddUser() {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const [newUser, setNewUser] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    role_id: "",
    password: "",
    notes: "",
    is_active: 1,
  });

  const [roles, setRoles] = useState([]);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    api
      .get("/roles/active")
      .then((res) => {
        setRoles(res.data?.data || []);
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת רשימת התפקידים"),
          mode: "error",
        });
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "user_id",
      "first_name",
      "last_name",
      "phone_number",
      "email",
      "role_id",
      "password",
    ];

    for (let field of requiredFields) {
      if (!newUser[field]) {
        return setPopup({
          show: true,
          title: "שגיאה",
          message: `שדה חובה חסר: ${field}`,
          mode: "error",
        });
      }
    }

    api
      .post("/users/add", newUser)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "המשתמש נוסף בהצלחה",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בהוספת המשתמש"),
          mode: "error",
        });
      });
  };

  const handleUserIdChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setNewUser({ ...newUser, user_id: numericValue });
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          הוספת עובד חדש
        </h2>

        {/* ת.ז */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            תעודת זהות
          </label>
          <input
            type="text"
            required
            maxLength={9}
            inputMode="numeric"
            value={newUser.user_id}
            onChange={handleUserIdChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
            placeholder="הקלד תעודת זהות"
          />
        </div>

        {/* שם פרטי */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">שם פרטי</label>
          <input
            type="text"
            required
            value={newUser.first_name}
            onChange={(e) =>
              setNewUser({ ...newUser, first_name: e.target.value })
            }
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
            required
            value={newUser.last_name}
            onChange={(e) =>
              setNewUser({ ...newUser, last_name: e.target.value })
            }
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* טלפון */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            מספר טלפון
          </label>
          <input
            type="text"
            required
            value={newUser.phone_number}
            onChange={(e) =>
              setNewUser({ ...newUser, phone_number: e.target.value })
            }
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* אימייל */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">אימייל</label>
          <input
            type="email"
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* תפקיד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">תפקיד</label>
          <select
            required
            value={newUser.role_id}
            onChange={(e) =>
              setNewUser({ ...newUser, role_id: e.target.value })
            }
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value="">בחר תפקיד</option>
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>

        {/* סיסמה */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סיסמה</label>
          <input
            type="password"
            required
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* הערות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            value={newUser.notes}
            onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
            rows={2}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          {currentUser?.permission_add_user === 1 && (
            <AddSaveButton label="הוסף עובד" type="submit" />
          )}
          <ExitButton label="ביטול" linkTo="/dashboard/users" />
        </div>
      </form>

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
        />
      )}
    </div>
  );
}
