import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_API_URL;

// כמו ב-AddRole
const permissionsSchema = {
  "לוח בקרה": [
    { key: "admin_alert_dash", label: "התראות מנהל" },
    { key: "user_alert_dash", label: "התראות משתמש" },
  ],
  "ניהול משתמשים": [{ key: "can_manage_users", label: "ניהול משתמשים" }],
  "צפייה בדוחות": [{ key: "can_view_reports", label: "צפייה בדוחות" }],
  "שייך פניות": [
    { key: "can_assign_leads", label: "שייך פניות" },
    { key: "lead_add_btn", label: "הוספת פנייה ידנית" },
  ],
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

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [active, setActive] = useState(1);

  useEffect(() => {
    axios
      .get(`${api}/roles/${id}`, { withCredentials: true })
      .then((res) => {
        const role = res.data.Role;
        setRoleName(role.role_name);
        setActive(role.active);

        // למלא את הרשאות ה-checkbox
        const perms = [];
        Object.keys(role).forEach((key) => {
          if (role[key] === 1) perms.push(key);
        });
        setSelectedPermissions(perms);
      })
      .catch((err) => {
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת פרטי התפקיד",
          mode: "error",
        });
        console.error(err);
      });
  }, [id]);

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setPopupData({
      show: true,
      title: "אישור עדכון",
      message: "⚠️ האם אתה בטוח שברצונך לעדכן את פרטי התפקיד?",
      mode: "confirm",
    });
  };

  const confirmUpdate = () => {
    // נכין את הנתונים כמו שהשרת מצפה (0/1)
    const roleData = {
      role_name: roleName,
      active,
    };

    // נאפס את כל המפתחות ל-0
    Object.values(permissionsSchema)
      .flat()
      .forEach((perm) => {
        roleData[perm.key] = selectedPermissions.includes(perm.key) ? 1 : 0;
      });

    axios
      .put(`${api}/roles/${id}`, roleData, { withCredentials: true })
      .then(() => {
        setPopupData({
          show: true,
          title: "הצלחה",
          message: "התפקיד עודכן בהצלחה!",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopupData({
          show: true,
          title: "שגיאת עדכון",
          message: "אירעה שגיאה במהלך עדכון התפקיד",
          mode: "error",
        });
        console.error(err);
      });
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-[80%] max-w-5xl bg-white/85 shadow-md rounded-lg p-8 space-y-6"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          עדכון פרטי תפקיד
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
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* קבוצות הרשאות */}
        <div className="flex flex-wrap gap-4">
          {Object.entries(permissionsSchema).map(([category, perms]) => (
            <div
              key={category}
              className="min-w-[220px] max-w-[260px] border rounded p-3 bg-white/70"
            >
              <h3 className="font-semibold mb-2 whitespace-nowrap">
                {category}
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <input
                      type="checkbox"
                      className="align-middle"
                      checked={selectedPermissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                    />
                    <span className="text-sm">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* סטטוס */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value={1}>פעיל</option>
            <option value={0}>לא פעיל</option>
          </select>
        </div>

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור שינויים" type="submit" />
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
          onConfirm={popupData.mode === "confirm" ? confirmUpdate : undefined}
        />
      )}
    </div>
  );
};

export default EditRole;
