import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Tooltip from "../Tools/Tooltip";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/users/${id}`, {
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
      axios.get("http://localhost:8801/roles/active", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8801/roles/inactive", {
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

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setUser({ ...user, phone_number: digitsOnly });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8801/users/${id}`, user, { withCredentials: true })
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

  if (!user) return <div className="text-center p-4">...טוען נתוני משתמש</div>;

  return (
    <div className=" justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          עריכת עובד
        </h2>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">שם פרטי</label>
          <input
            type="text"
            name="first_name"
            value={user.first_name}
            onChange={handleChange}
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
            value={user.last_name}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">טלפון</label>
          <input
            type="text"
            name="phone_number"
            value={user.phone_number || ""}
            onChange={handlePhoneChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">אימייל</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">תפקיד</label>
          <select
            name="role_id"
            value={user.role_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>

        {(() => {
          const currentRole = roles.find((r) => r.role_id === user.role_id);
          return (
            currentRole &&
            !currentRole.active && (
              <Tooltip message="תפקיד זה לא פעיל – נא לעדכן תפקיד">
                <div className="text-yellow-600 mt-2">⚠ תפקיד לא פעיל</div>
              </Tooltip>
            )
          );
        })()}

        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            rows="2"
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={user.notes || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="is_active"
            value={user.is_active}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value={1}>פעיל</option>
            <option value={0}>לא פעיל</option>
          </select>
        </div>

        <button
          type="submit"
          className="font-rubik w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 font-medium"
        >
          שמור שינויים
        </button>
      </form>
    </div>
  );
};

export default EditUser;
