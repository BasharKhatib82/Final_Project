import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      .get("http://localhost:8801/roles/active", {
        withCredentials: true,
        params: { t: new Date().getTime() }, // למניעת cache
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
      .post("http://localhost:8801/users/add", user, { withCredentials: true })
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

  return (
    <div className="update-role-form">
      <div className="main">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <h2 className="title text-center fontL">הוספת עובד חדש</h2>

            <label>
              <strong>תעודת זהות:</strong>
            </label>
            <input
              type="number"
              name="user_id"
              placeholder="הקלד תעודת זהות"
              onChange={(e) => setUser({ ...user, user_id: e.target.value })}
              className="form-add"
            />

            <label>
              <strong>שם פרטי:</strong>
            </label>
            <input
              type="text"
              name="first_name"
              placeholder="הקלד שם פרטי"
              onChange={(e) => setUser({ ...user, first_name: e.target.value })}
              className="form-add"
            />

            <label>
              <strong>שם משפחה:</strong>
            </label>
            <input
              type="text"
              name="last_name"
              placeholder="הקלד שם משפחה"
              onChange={(e) => setUser({ ...user, last_name: e.target.value })}
              className="form-add"
            />

            <label>
              <strong>מספר טלפון:</strong>
            </label>
            <input
              type="text"
              name="phone_number"
              placeholder="הקלד מספר טלפון"
              onChange={(e) =>
                setUser({ ...user, phone_number: e.target.value })
              }
              className="form-add"
            />

            <label>
              <strong>אימייל:</strong>
            </label>
            <input
              type="email"
              name="email"
              placeholder="הקלד דואר אלקטרוני"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="form-add"
            />

            <label>
              <strong>תפקיד:</strong>
            </label>
            <select
              name="role_id"
              className="form-add"
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

            <label>
              <strong>סיסמה:</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="הקלד סיסמה"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="form-add"
            />

            <label>
              <strong>הערות:</strong>
            </label>
            <textarea
              name="notes"
              placeholder="הוספת הערות..."
              onChange={(e) => setUser({ ...user, notes: e.target.value })}
              className="form-add w100 rad7px"
              rows="2"
            ></textarea>

            <button type="submit" className="btn-update">
              הוסף עובד
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
