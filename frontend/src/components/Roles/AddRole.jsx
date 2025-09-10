// frontend/src/pages/Roles/AddRole.jsx

/**
 * קומפוננטה: AddRole
 * ------------------
 * מטרות:
 * 1. מאפשרת יצירה של תפקיד חדש במערכת.
 * 2. schema מציגה טופס שם תפקיד + הרשאות מתוך .
 * 3. ומציגה הודעת הצלחה או שגיאה API שולחת את הנתונים ל .
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { permissionsSchema, roleDataTemplate } from "constants";
import { Popup } from "components/Tools";
import { api, extractApiError } from "utils";

export default function AddRole() {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  const navigate = useNavigate();

  // שינוי בחירת הרשאה
  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // שליחת טופס
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName) {
      setPopup({
        show: true,
        title: "שגיאה",
        message: "שם התפקיד הוא שדה חובה",
        mode: "warning",
      });
      return;
    }

    const roleData = { ...roleDataTemplate, role_name: roleName };
    selectedPermissions.forEach((perm) => {
      roleData[perm] = 1;
    });

    try {
      await api.post("/roles/add", roleData);
      setPopup({
        show: true,
        title: "הצלחה",
        message: "התפקיד נוסף בהצלחה",
        mode: "success",
      });
    } catch (err) {
      setPopup({
        show: true,
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בהוספת התפקיד"),
        mode: "error",
      });
    }
  };

  return (
    <div className="flex justify-center items-center pt-6">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-7xl bg-white/85 shadow-md rounded-lg p-8 space-y-4"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          הוספת תפקיד חדש
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
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="הקלד שם תפקיד"
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

        {/* כפתורים */}
        <div className="flex justify-around pt-4">
          <AddSaveButton label="הוסף תפקיד" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/roles" />
        </div>
      </form>

      {/* חלונית Popup */}
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => {
            setPopup({
              show: false,
              title: "",
              message: "",
              mode: "info",
            });
            if (popup.mode === "success") {
              navigate("/dashboard/roles");
            }
          }}
        />
      )}
    </div>
  );
}
