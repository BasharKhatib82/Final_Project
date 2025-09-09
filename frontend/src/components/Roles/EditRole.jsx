// frontend/src/pages/Roles/EditRole.jsx

/**
 * קומפוננטה: EditRole
 * -------------------
 * מטרות:
 * 1. מאפשרת עדכון תפקיד קיים במערכת (שם, סטטוס והרשאות).
 * 2. טוענת את פרטי התפקיד מהשרת לפי מזהה (`id` מה־URL).
 * 3. מאפשרת למשתמש לסמן/לבטל הרשאות באמצעות checkbox.
 * 4. מבצעת שמירה לשרת (PUT) לאחר אישור המשתמש.
 *
 * שימושים:
 * - משתמשת ב־permissionsSchema להצגת הרשאות בקבוצות.
 * - משתמשת ב־roleDataTemplate כדי לוודא שכל המפתחות קיימים באובייקט.
 * - Popup משמש להצגת שגיאות, הצלחות ואישור לפני עדכון.
 *
 * תרחישים:
 * - טעינת הדף → שליפת פרטי התפקיד והצגת הנתונים בטופס.
 * - שינוי שם/סטטוס/הרשאות → לחיצה על "שמור שינויים".
 * - Popup אישור → שליחה לשרת → הצלחה/שגיאה מוצגת למשתמש.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup } from "components/Tools";
import { permissionsSchema, roleDataTemplate } from "constants/permissions";

const api = process.env.REACT_APP_API_URL;

const EditRole = () => {
  const { id } = useParams(); // מזהה תפקיד מתוך ה־URL
  const navigate = useNavigate();

  // סטייט לניהול חלונית Popup
  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  // סטייטים של טופס
  const [roleName, setRoleName] = useState(""); // שם התפקיד
  const [selectedPermissions, setSelectedPermissions] = useState([]); // הרשאות נבחרות
  const [active, setActive] = useState(1); // סטטוס פעיל/לא פעיל

  // טעינת פרטי התפקיד מהשרת
  useEffect(() => {
    axios
      .get(`${api}/roles/${id}`, { withCredentials: true })
      .then((res) => {
        const role = res.data.data;
        setRoleName(role.role_name);
        setActive(role.active);

        // הפקת הרשאות נבחרות (כל מפתח שערכו 1)
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

  // הוספה/הסרה של הרשאה
  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // שליחת טופס (פותח Popup לאישור)
  const handleSubmit = (e) => {
    e.preventDefault();
    setPopupData({
      show: true,
      title: "אישור עדכון",
      message: "⚠️ האם אתה בטוח שברצונך לעדכן את פרטי התפקיד?",
      mode: "confirm",
    });
  };

  // עדכון התפקיד בשרת (לאחר אישור המשתמש)
  const confirmUpdate = () => {
    const roleData = { ...roleDataTemplate, role_name: roleName, active };

    // עדכון הרשאות ל־0/1
    Object.values(permissionsSchema)
      .flat()
      .forEach((perm) => {
        if (perm.key) {
          roleData[perm.key] = selectedPermissions.includes(perm.key) ? 1 : 0;
        }
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
    <div className="flex justify-center items-center pt-6">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-7xl bg-white/85 shadow-md rounded-lg p-8 space-y-4"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          עדכון פרטי תפקיד
        </h2>

        {/* שדה שם התפקיד */}
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

          {/* בחירת סטטוס */}
          <div>
            <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
            <select
              value={active}
              onChange={(e) => setActive(Number(e.target.value))}
              className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            >
              <option value={1}>תפקיד פעיל</option>
              <option value={0}>תפקיד לא פעיל</option>
            </select>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור שינויים" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/roles" />
        </div>
      </form>

      {/* חלונית Popup */}
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
