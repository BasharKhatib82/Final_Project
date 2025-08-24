import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_API_URL;

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [popupData, setPopupData] = useState({
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
      const res = await axios.get(`${api}/users/${id}`, {
        withCredentials: true,
      });
      const currentUser = res.data.data;
      setUser(currentUser);

      const rolesRes = await axios.get(`${api}/roles/active`, {
        withCredentials: true,
      });
      let activeRoles = rolesRes.data.Roles.map((role) => ({
        ...role,
        active: true,
      }));

      const roleExists = currentUser
        ? activeRoles.some((role) => role.role_id === currentUser.role_id)
        : false;

      if (!roleExists) {
        const roleRes = await axios.get(`${api}/roles/${currentUser.role_id}`, {
          withCredentials: true,
        });

        if (roleRes.data.Role) {
          const roleNotActive = { ...roleRes.data.Role, active: false };
          activeRoles.push(roleNotActive);
        }
      }

      setRoles(activeRoles);
    } catch (err) {
      console.error("שגיאה בטעינת משתמש או תפקידים:", err);
      setPopupData({
        show: true,
        title: "שגיאה",
        message: "אירעה שגיאה בטעינת הנתונים",
        mode: "error",
      });
    }
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

    setPopupData({
      show: true,
      title: "אישור עדכון",
      message: "⚠️ האם אתה בטוח שברצונך לעדכן את פרטי המשתמש?",
      mode: "confirm",
    });
  };

  const confirmUpdate = () => {
    axios
      .put(`${api}/users/${id}`, user, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setPopupData({
            show: true,
            title: "הצלחה",
            message: "המשתמש עודכן בהצלחה",
            mode: "success",
          });
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "אירעה שגיאה בעדכון המשתמש",
            mode: "error",
          });
        }
      })
      .catch((err) => {
        console.error("שגיאה בעדכון משתמש:", err);
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "אירעה שגיאה בעדכון הנתונים",
          mode: "error",
        });
      });
  };

  if (!user) {
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

        <div>
          <label className="font-rubik block mb-0.5 font-medium">שם פרטי</label>
          <input
            type="text"
            name="first_name"
            value={user.first_name}
            onChange={handleChange}
            required
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
            required
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
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">תפקיד</label>
          <select
            name="role_id"
            value={user.role_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name} {!role.active ? " 🚫 תפקיד לא פעיל" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            rows="2"
            value={user.notes || ""}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          ></textarea>
        </div>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="active"
            value={user.active}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value="1">פעיל</option>
            <option value="0">לא פעיל</option>
          </select>
        </div>

        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור שינויים" />
          <ExitButton label="ביטול" linkTo="/dashboard/users" />
        </div>
      </form>

      {/* Popup */}
      {popupData.show && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => {
            setPopupData({
              show: false,
              title: "",
              message: "",
              mode: "info",
            });
            if (popupData.mode === "success") {
              navigate("/dashboard/users");
            }
          }}
          onConfirm={popupData.mode === "confirm" ? confirmUpdate : undefined}
        />
      )}
    </div>
  );
};

export default EditUser;
