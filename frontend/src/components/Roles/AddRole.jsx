import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from "../Tools/Popup"; // נתיב הפופאפ שלך

const api = process.env.REACT_APP_API_URL;

const permissionsSchema = {
  "ניהול משתמשים": [{ key: "can_manage_users", label: "ניהול משתמשים" }],
  "צפייה בדוחות": [{ key: "can_view_reports", label: "צפייה בדוחות" }],
  "שייך פניות": [{ key: "can_assign_leads", label: "שייך פניות" }],
  "עריכת קורסים": [{ key: "can_edit_courses", label: "עריכת קורסים" }],
  "ניהול משימות": [{ key: "can_manage_tasks", label: "ניהול משימות" }],
  "גישה לכל הנתונים": [
    { key: "can_access_all_data", label: "גישה לכל הנתונים" },
  ],
  "נוכחות ושעות עבודה": [
    { key: "attendance_clock_self", label: "כניסה / יציאה" },
    { key: "attendance_add_btn", label: "הוספת נוכחות ידנית" },
    { key: "attendance_edit_btn", label: "עריכת נוכחות" },
    { key: "attendance_view_team", label: "צפייה בנוכחות של כל העובדים" },
  ],
};

const AddRole = () => {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });
  const navigate = useNavigate();

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName) {
      setPopupData({
        show: true,
        title: "שגיאה",
        message: "שם התפקיד הוא שדה חובה",
        mode: "warning",
      });
      return;
    }

    const newRole = {
      role_name: roleName,
      permissions: selectedPermissions,
    };

    try {
      await axios.post(`${api}/roles/add`, newRole);
      setPopupData({
        show: true,
        title: "הצלחה",
        message: "התפקיד נוסף בהצלחה",
        mode: "success",
      });
      setRoleName("");
      setSelectedPermissions([]);
    } catch (err) {
      setPopupData({
        show: true,
        title: "שגיאת שרת",
        message: "אירעה בעיה בעת שמירת התפקיד",
        mode: "error",
      });
      console.error("AddRole error:", err);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg max-w-2xl w-full p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-center">
              הוספת תפקיד חדש
            </h2>

            {/* שם התפקיד */}
            <div>
              <label className="block text-sm font-medium mb-1">שם תפקיד</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="למשל: נציג שיווק"
              />
            </div>

            {/* קבוצות הרשאות */}
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(permissionsSchema).map(([category, perms]) => (
                <div
                  key={category}
                  className="border rounded p-3 space-y-2 bg-white/70"
                >
                  <h3 className="font-semibold mb-2">{category}</h3>
                  {perms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            {/* כפתורי פעולה */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => navigate("/dashboard/roles")}
              >
                ביטול
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                הוסף תפקיד
              </button>
            </div>
          </form>
        </div>
      </div>

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
              navigate("/dashboard/roles");
            }
          }}
        />
      )}
    </>
  );
};

export default AddRole;
