// frontend/src/pages/Roles/EditRole.jsx

/**
 * קומפוננטה: EditRole
 * -------------------
 * מאפשרת עריכת תפקיד קיים, כולל שם, סטטוס והרשאות.
 * מאפשרת עריכה ושמירה , ID טוענת את התפקיד מהשרת לפי  .
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup } from "components/Tools";
import { permissionsSchema, roleDataTemplate } from "constants";
import { api, extractApiError } from "utils";

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
  });

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [active, setActive] = useState(1);

  useEffect(() => {
    api
      .get(`/roles/${id}`)
      .then((res) => {
        const role = res.data.data || {};
        setRoleName(role.role_name);
        setActive(role.active);

        const perms = Object.keys(role).filter((k) => role[k] === 1);
        setSelectedPermissions(perms);
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת פרטי התפקיד"),
          mode: "error",
        });
      });
  }, [id]);

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPopup({
      show: true,
      title: "אישור עדכון",
      message: "האם לעדכן את פרטי התפקיד ?",
      mode: "confirm",
    });
  };

  const confirmUpdate = () => {
    const roleData = { ...roleDataTemplate, role_name: roleName, active };

    Object.values(permissionsSchema)
      .flat()
      .forEach((perm) => {
        roleData[perm.key] = selectedPermissions.includes(perm.key) ? 1 : 0;
      });

    api
      .put(`/roles/${id}`, roleData)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "התפקיד עודכן בהצלחה!",
          mode: "success",
        });
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה במהלך עדכון התפקיד"),
          mode: "error",
        });
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

        {/* שם תפקיד */}
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
          onConfirm={popup.mode === "confirm" ? confirmUpdate : undefined}
        />
      )}
    </div>
  );
}
