import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AddSaveButton, ExitButton } from "@/components/Buttons";
import {
  permissionsSchema,
  roleDataTemplate,
} from "../../constants/permissions";
import { Popup } from "@/components/Tools";

const api = process.env.REACT_APP_API_URL;

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

    // יוצרים עותק מהתבנית ומוסיפים את שם התפקיד
    const roleData = { ...roleDataTemplate, role_name: roleName };

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
    <div className="flex justify-center items-center pt-6">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-7xl bg-white/85 shadow-md rounded-lg p-8 space-y-4"
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
