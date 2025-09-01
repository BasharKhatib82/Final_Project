import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { useUser } from "../Tools/UserContext";
import Popup from "../Tools/Popup";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";
import { permissionsSchema } from "../../constants/permissions";

const api = process.env.REACT_APP_API_URL;

const isActive = (el) => el === true || el === 1 || el === "1";

const mapRole = (r) => ({
  ...r,
  active: isActive(r.active),
  status_human: isActive(r.active) ? "תפקיד פעיל" : "תפקיד לא פעיל",
});

const renderCheckActive = (v) => (
  <span className={v ? "text-green-600" : "text-red-500"}>
    {v ? "תפקיד פעיל" : "תפקיד לא פעיל"}
  </span>
);

export default function Roles() {
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
    role_id: null,
  });
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${api}/roles/active`, { withCredentials: true }),
      axios.get(`${api}/roles/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.Roles || []).map(mapRole);
        const inactive = (inactiveRes?.data?.Roles || []).map(mapRole);
        setAllRoles([...active, ...inactive]);
      })
      .catch(() => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת התפקידים",
          mode: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (role_id) => navigate(`/dashboard/edit_role/${role_id}`);
  const confirmDelete = (role_id) => {
    axios
      .put(`${api}/roles/delete/${role_id}`, null, { withCredentials: true })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "✅ התפקיד נמחק בהצלחה",
          mode: "success",
        });
        fetchRoles();
      })
      .catch(() =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: "אירעה שגיאה במחיקה",
          mode: "error",
        })
      );
  };

  const columns = [
    { key: "role_id", label: "מזהה", export: (r) => String(r.role_id) },
    { key: "role_name", label: "שם תפקיד", export: (r) => String(r.role_name) },
    {
      key: "permissions",
      label: "הרשאות",
      render: (r) => (
        <button
          onClick={() =>
            setPopup({
              show: true,
              title: `הרשאות עבור ${r.role_name}`,
              message: (
                <div className="text-right space-y-3 max-h-[60vh] overflow-y-auto">
                  {Object.entries(permissionsSchema).map(
                    ([category, perms]) => (
                      <div key={category} className="border-b pb-2">
                        <h4 className="font-semibold text-blue-700">
                          {category}
                        </h4>
                        <ul className="text-sm pl-2">
                          {perms.map((perm) => (
                            <li key={perm.key}>
                              {r[perm.key] ? "🟢" : "🔴"} {perm.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              ),
              mode: "info",
            })
          }
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
        >
          צפייה
          {<FaEye />}
        </button>
      ),
      export: () => "פירוט לא זמין בהדפסה",
    },
    {
      key: "active",
      label: "סטטוס",
      render: (r) => renderCheckActive(r.active),
      export: (r) => r.status_human,
    },
  ];

  //  הוספת עמודת פעולות רק אם למשתמש יש אחת מההרשאות
  if (user.permission_edit_role === 1 || user?.permission_delete_role === 1) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="text-center">
          {user?.permission_edit_role === 1 && (
            <button
              onClick={() => handleEdit(r.role_id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
            >
              עריכה
            </button>
          )}
          {user?.permission_delete_role === 1 && r.active && (
            <button
              onClick={() =>
                setPopup({
                  show: true,
                  title: "אישור מחיקה",
                  message: "⚠️ למחוק את התפקיד זה ?",
                  mode: "confirm",
                  role_id: r.role_id,
                })
              }
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              מחיקה
            </button>
          )}
        </div>
      ),
      export: () => null,
    });
  }

  const filtersDef = [
    {
      name: "active",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "true", label: "תפקידים פעילים" },
        { value: "false", label: "תפקידים לא פעילים" },
        { value: "", label: "כל התפקידים" },
      ],
    },
  ];

  const defaultFilters = { active: "true" };

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת תפקידים"
          columns={columns}
          rows={allRoles}
          filtersDef={filtersDef}
          searchableKeys={["role_name", "active"]}
          pageSize={25}
          emailApiBase={api}
          addButton={
            user?.permission_add_role === 1 && (
              <NavigationButton
                linkTo="/dashboard/add_role"
                label="הוספת תפקיד חדש"
              />
            )
          }
          defaultFilters={defaultFilters}
          searchPlaceholder="שם תפקיד..."
        />
      )}

      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() =>
            setPopup({
              show: false,
              title: "",
              message: "",
              mode: "",
              role_id: null,
            })
          }
          onConfirm={
            popup.mode === "confirm"
              ? () => confirmDelete(popup.role_id)
              : undefined
          }
        />
      )}
    </div>
  );
}
