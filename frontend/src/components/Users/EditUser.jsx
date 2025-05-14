import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "../Tools/Tooltip";

const EditUser = () => {
  const { id } = useParams(); // user_id from URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/user/${id}`, {
        withCredentials: true,
      });
      setUser(res.data.User);
    } catch (err) {
      console.error("שגיאה בטעינת משתמש:", err);
      alert("אירעה שגיאה בטעינת פרטי המשתמש");
    }
  };

  const fetchRoles = () => {
    Promise.all([
      axios.get("http://localhost:8801/active-roles", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8801/inactive-roles", {
        withCredentials: true,
      }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = activeRes.data.Roles.map((role) => ({
          ...role,
          active: true,
        }));
        const inactive = inactiveRes.data.Roles.map((role) => ({
          ...role,
          active: false,
        }));
        setRoles([...active, ...inactive]);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת תפקידים:", err);
      });
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8801/user/${id}`, user, { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          alert("המשתמש עודכן בהצלחה");
          navigate("/dashboard/users");
        } else {
          alert("שגיאה: " + res.data.Error);
        }
      })
      .catch((err) => {
        console.error("שגיאה בשמירת משתמש:", err);
        alert("אירעה שגיאה בעדכון הנתונים");
      });
  };

  if (!user) return <div>...טוען נתוני משתמש</div>;

  return (
    <div className="update-role-form">
      <div className="main">
        <form onSubmit={handleSubmit}>
          <h2 className="title text-center fontL">עריכת עובד</h2>

          <label>
            <strong>שם פרטי:</strong>
          </label>
          <input
            type="text"
            name="first_name"
            value={user.first_name}
            onChange={handleChange}
            className="form-add"
          />

          <label>
            <strong>שם משפחה:</strong>
          </label>
          <input
            type="text"
            name="last_name"
            value={user.last_name}
            onChange={handleChange}
            className="form-add"
          />

          <label>
            <strong>טלפון:</strong>
          </label>
          <input
            type="text"
            name="phone_number"
            value={user.phone_number || ""}
            onChange={handleChange}
            className="form-add"
          />

          <label>
            <strong>אימייל:</strong>
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="form-add"
          />

          <label>
            <strong>תפקיד:</strong>
          </label>
          <select
            name="role_id"
            value={user.role_id}
            onChange={handleChange}
            className="form-add"
          >
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </option>
            ))}
          </select>

          {(() => {
            const currentRole = roles.find((r) => r.role_id === user.role_id);
            return (
              currentRole &&
              !currentRole.active && (
                <Tooltip message="תפקיד זה לא פעיל – נא לעדכן תפקיד">
                  <div className="color-yellow mt5px">⚠ תפקיד לא פעיל</div>
                </Tooltip>
              )
            );
          })()}

          <label>
            <strong>הערות:</strong>
          </label>
          <textarea
            name="notes"
            rows="2"
            className="form-add"
            value={user.notes || ""}
            onChange={handleChange}
          ></textarea>

          <label>
            <strong>סטטוס:</strong>
          </label>
          <select
            name="is_active"
            value={user.is_active}
            onChange={handleChange}
            className="form-add"
          >
            <option value={1}>פעיל</option>
            <option value={0}>לא פעיל</option>
          </select>

          <button type="submit" className="btn-update">
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
