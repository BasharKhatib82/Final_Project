import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

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

    // הכנה לשדות שהשרת מצפה להם
    const roleData = {
      role_name: roleName,
      role_management: 0,
      can_manage_users: 0,
      can_view_reports: 0,
      can_assign_leads: 0,
      can_edit_courses: 0,
      can_manage_tasks: 0,
      can_access_all_data: 0,
      attendance_clock_self: 0,
      attendance_add_btn: 0,
      attendance_edit_btn: 0,
      attendance_view_team: 0,
      active: 1,
    };

    // לעדכן 1 לפי הצ'קבוקסים שנבחרו
    selectedPermissions.forEach((perm) => {
      roleData[perm] = 1;
    });

    try {
      await axios.post(`${api}/roles/add`, roleData, { withCredentials: true });
      setPopupData({
        show: true,
        title: "הצלחה",
        message: "התפקיד נוסף בהצלחה",
        mode: "success",
      });
    } catch (err) {
      console.error("AddRole error:", err);
      setPopupData({
        show: true,
        title: "שגיאה",
        message: "שגיאת שרת - נסה שוב מאוחר יותר",
        mode: "error",
      });
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          הוספת תפקיד חדש
        </h2>

        {/* שם התפקיד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            שם תפקיד
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="הקלד שם תפקיד"
          />
        </div>

        {/* קבוצות הרשאות */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(permissionsSchema).map(([category, perms]) => (
            <div
              key={category}
              className="flex-1 min-w-12 border rounded p-2 bg-white/80"
            >
              <h3 className="font-rubik block mb-0.5 font-medium">
                {category}
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center space-x-2 cursor-pointer whitespace-nowrap"
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
            </div>
          ))}
        </div>

        {/* כפתורי פעולה */}

        <div className="flex justify-around pt-4">
          <AddSaveButton label="הוסף תפקיד" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/roles" />
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
              navigate("/dashboard/roles");
            }
          }}
        />
      )}
    </div>
  );
};
export default AddRole;
