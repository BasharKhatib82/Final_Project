import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
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

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios
      .get(`${api}/roles/active`, {
        withCredentials: true,
        params: { t: new Date().getTime() },
      })
      .then((res) => {
        if (res.data.Status && Array.isArray(res.data.Roles)) {
          setRoles(res.data.Roles);
        } else {
          alert("לא התקבלה רשימת תפקידים");
        }
      })
      .catch((err) => {
        console.error("שגיאה בטעינת תפקידים:", err);
        alert("שגיאה בעת טעינת רשימת התפקידים. ודא שאתה מחובר כמנהל כללי.");
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
        return alert(`שדה חובה חסר: ${field}`);
      }
    }

    axios
      .post(`${api}/users/add`, user, { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          navigate("/dashboard/add_user/success");
        } else {
          alert("שגיאה: " + res.data.Error);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("אירעה שגיאה בהוספת העובד.");
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
          <ExitButton label="ביטול" linkTo="/dashboard/roles" />
        </div>
      </form>
    </div>
  );
};

export default AddUser;
