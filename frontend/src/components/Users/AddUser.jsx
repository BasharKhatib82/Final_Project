import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup"; // ✅ הוספנו

const api = process.env.REACT_APP_API_URL;

const AddUser = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
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

  // ✅ סטייט לפופאפ
  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios
      .get(`${api}/roles/active`, { withCredentials: true })
      .then((res) => {
        // ✅ עדכון לפי ה־API שלך
        if (res.data.success && Array.isArray(res.data.Roles)) {
          setRoles(res.data.Roles);
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: "לא התקבלה רשימת תפקידים",
            mode: "error",
          });
        }
      })
      .catch((err) => {
        console.error("שגיאה בטעינת תפקידים:", err);
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת רשימת התפקידים",
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
      if (!user[field]) {
        return setPopupData({
          show: true,
          title: "שגיאה",
          message: `שדה חובה חסר: ${field}`,
          mode: "error",
        });
      }
    }

    axios
      .post(`${api}/users/add`, user, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setPopupData({
            show: true,
            title: "הצלחה",
            message: res.data.Message || "המשתמש נוסף בהצלחה",
            mode: "success",
          });
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "שגיאה בהוספת המשתמש",
            mode: "error",
          });
        }
      })
      .catch((err) => {
        console.error("שגיאה בהוספת משתמש:", err);
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאת שרת - נסה שוב מאוחר יותר.",
          mode: "error",
        });
      });
  };

  const handleUserIdChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setUser({ ...user, user_id: numericValue });
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

        {/* תעודת זהות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            תעודת זהות
          </label>
          <input
            type="text"
            required
            inputMode="numeric"
            name="user_id"
            maxLength={9}
            placeholder="הקלד תעודת זהות"
            onChange={handleUserIdChange}
            value={user.user_id}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* שם פרטי */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">שם פרטי</label>
          <input
            type="text"
            required
            name="first_name"
            placeholder="הקלד שם פרטי"
            onChange={(e) => setUser({ ...user, first_name: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
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
            required
            placeholder="הקלד שם משפחה"
            onChange={(e) => setUser({ ...user, last_name: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* מספר טלפון */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            מספר טלפון
          </label>
          <input
            type="text"
            name="phone_number"
            required
            placeholder="הקלד מספר טלפון"
            onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* אימייל */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">אימייל</label>
          <input
            type="email"
            name="email"
            required
            placeholder="הקלד דואר אלקטרוני"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* תפקיד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">תפקיד</label>
          <select
            name="role_id"
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={user.role_id}
            onChange={(e) => setUser({ ...user, role_id: e.target.value })}
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
            name="password"
            required
            placeholder="הקלד סיסמה"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* הערות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            placeholder="הוספת הערות..."
            onChange={(e) => setUser({ ...user, notes: e.target.value })}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            rows="2"
          ></textarea>
        </div>

        <div className="flex justify-around pt-4">
          <AddSaveButton label="הוסף עובד" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/users" />
        </div>
      </form>

      {/* ✅ חלון פופאפ */}
      {popupData.show && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => {
            setPopupData({ show: false, title: "", message: "", mode: "info" });
            if (popupData.mode === "success") {
              navigate("/dashboard/users");
            }
          }}
        />
      )}
    </div>
  );
};

export default AddUser;
