import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../Tools/Popup";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";

const api = process.env.REACT_APP_API_URL;
const asBool = (v) => v === true || v === 1 || v === "1";
const isActive = (el) => el === true || el === 1 || el === "1";

const mapRole = (r) => ({
  ...r,
  role_management: asBool(r.role_management),
  can_manage_users: asBool(r.can_manage_users),
  can_view_reports: asBool(r.can_view_reports),
  can_assign_leads: asBool(r.can_assign_leads),
  can_edit_courses: asBool(r.can_edit_courses),
  can_manage_tasks: asBool(r.can_manage_tasks),
  can_access_all_data: asBool(r.can_access_all_data),
  active: isActive(r.active),

  // 👇 ניצור שדה ידידותי בעברית — ישמש גם לייצוא
  status_human: isActive(r.active) ? "פעיל" : "לא פעיל",
});

const renderCheck = (v) => (
  <span className={v ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
    {v ? "✓" : "✗"}
  </span>
);

const renderCheckActive = (v) => (
  <span className={v ? "text-green-600" : "text-red-500"}>
    {v ? "פעיל" : "לא פעיל"}
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
    {
      key: "role_id",
      label: "מזהה",
      export: (r) => String(r.role_id),
    },
    { key: "role_name", label: "שם תפקיד", export: (r) => String(r.role_name) },
    {
      key: "can_manage_users",
      label: "ניהול משתמשים",
      render: (r) => renderCheck(r.can_manage_users),
      export: (r) => (r.can_manage_users ? "✓" : "✗"),
    },
    {
      key: "can_view_reports",
      label: "צפייה בדוחות",
      render: (r) => renderCheck(r.can_view_reports),
      export: (r) => (r.can_view_reports ? "✓" : "✗"),
    },
    {
      key: "can_assign_leads",
      label: "שייך פניות",
      render: (r) => renderCheck(r.can_assign_leads),
      export: (r) => (r.can_assign_leads ? "✓" : "✗"),
    },
    {
      key: "can_edit_courses",
      label: "עריכת קורסים",
      render: (r) => renderCheck(r.can_edit_courses),
      export: (r) => (r.can_edit_courses ? "✓" : "✗"),
    },
    {
      key: "can_manage_tasks",
      label: "ניהול משימות",
      render: (r) => renderCheck(r.can_manage_tasks),
      export: (r) => (r.can_manage_tasks ? "✓" : "✗"),
    },
    {
      key: "can_access_all_data",
      label: "גישה לנתונים",
      render: (r) => renderCheck(r.can_access_all_data),
      export: (r) => (r.can_access_all_data ? "✓" : "✗"),
    },
    {
      key: "active",
      label: "סטטוס",
      render: (r) => renderCheckActive(r.active),
      export: (r) => r.status_human,
    },
    {
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="text-center">
          <button
            onClick={() => handleEdit(r.role_id)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
          >
            עריכה
          </button>
          {r.active && (
            <button
              onClick={() =>
                setPopup({
                  show: true,
                  title: "אישור מחיקה",
                  message: "⚠️ למחוק את התפקיד?",
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
    },
  ];

  const filtersDef = [
    {
      name: "active",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "true", label: "פעיל" },
        { value: "false", label: "לא פעיל" },
        { value: "", label: "כל הסטטוסים" },
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
            <NavigationButton
              linkTo="/dashboard/add_role"
              label="הוספת תפקיד חדש"
            />
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
