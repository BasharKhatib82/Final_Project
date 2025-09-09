import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "@/components/Buttons";
import { Popup } from "@/components/Tools";
import {
  permissionsSchema,
  roleDataTemplate,
} from "../../constants/permissions";

const api = process.env.REACT_APP_API_URL;

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
        const role = res.data.data;
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
    const roleData = { ...roleDataTemplate, role_name: roleName, active };

    // לעדכן לפי ה־checkboxים
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
          {/* סטטוס */}
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
