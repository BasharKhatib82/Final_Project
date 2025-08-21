import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../Tools/Popup";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../reports/ReportView";

const api = process.env.REACT_APP_API_URL;

// 0/1/"0"/"1"/boolean → true/false
const asBool = (v) => v === true || v === 1 || v === "1";

// מיפוי רשומה מה-API לאובייקט מוכן לרינדור
const mapRole = (r, isActive) => ({
  ...r,
  is_active: isActive,
  status: isActive ? "active" : "inactive", // לשדה פילטר/חיפוש
  role_management: asBool(r.role_management), // נשאר באובייקט, לא מוצג
  can_manage_users: asBool(r.can_manage_users),
  can_view_reports: asBool(r.can_view_reports),
  can_assign_leads: asBool(r.can_assign_leads),
  can_edit_courses: asBool(r.can_edit_courses),
  can_manage_tasks: asBool(r.can_manage_tasks),
  can_access_all_data: asBool(r.can_access_all_data),
});

const renderCheck = (v) => (
  <span className={v ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
    {v ? "✓" : "✗"}
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
    axios
      .get(`${api}/auth/check`, { withCredentials: true })
      .then((res) => {
        if (res?.data?.loggedIn && res?.data?.user?.role_id === 1) fetchRoles();
        else navigate("/unauthorized");
      })
      .catch((err) => {
        console.error("שגיאה בבדיקת התחברות:", err);
        navigate("/unauthorized");
      });
  }, [navigate]);

  const fetchRoles = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${api}/roles/active`, { withCredentials: true }),
      axios.get(`${api}/roles/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.Roles || []).map((r) =>
          mapRole(r, true)
        );
        const inactive = (inactiveRes?.data?.Roles || []).map((r) =>
          mapRole(r, false)
        );
        setAllRoles([...active, ...inactive]);
      })
      .catch((err) => {
        console.error(
          "שגיאה בטעינת התפקידים:",
          err?.response?.data || err?.message
        );
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

  const handleDelete = (role_id) =>
    setPopup({
      show: true,
      title: "אישור מחיקה",
      message: "⚠️ האם אתה בטוח שברצונך למחוק את התפקיד?",
      mode: "confirm",
      role_id,
    });

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
      .catch((err) => {
        console.error("מחיקה נכשלה:", err?.response?.data || err?.message);
        setPopup({
          show: true,
          title: "שגיאה",
          message: "אירעה שגיאה במחיקה",
          mode: "error",
        });
      });
  };

  // עמודות להצגה (ללא "ניהול תפקידים")
  const columns = [
    { key: "role_id", label: "מזהה", width: 12 },
    { key: "role_name", label: "שם תפקיד", width: 24 },
    {
      key: "can_manage_users",
      label: "ניהול משתמשים",
      render: (r) => renderCheck(r.can_manage_users),
    },
    {
      key: "can_view_reports",
      label: "צפייה בדוחות",
      render: (r) => renderCheck(r.can_view_reports),
    },
    {
      key: "can_assign_leads",
      label: "שייך פניות",
      render: (r) => renderCheck(r.can_assign_leads),
    },
    {
      key: "can_edit_courses",
      label: "עריכת קורסים",
      render: (r) => renderCheck(r.can_edit_courses),
    },
    {
      key: "can_manage_tasks",
      label: "ניהול משימות",
      render: (r) => renderCheck(r.can_manage_tasks),
    },
    {
      key: "can_access_all_data",
      label: "גישה לנתונים",
      render: (r) => renderCheck(r.can_access_all_data),
    },
    {
      key: "status",
      label: "סטטוס",
      render: (r) => (r.is_active ? "פעיל" : "לא פעיל"),
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
          {r.is_active && (
            <button
              onClick={() => handleDelete(r.role_id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              מחיקה
            </button>
          )}
        </div>
      ),
    },
  ];

  // פילטר לפי : סטטוס
  const filtersDef = [
    {
      name: "status",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "", label: "כל הסטטוסים" },
        { value: "active", label: "פעיל" },
        { value: "inactive", label: "לא פעיל" },
      ],
    },
  ];

  // ברירת מחדל : מציג רק תפקידים פעילים
  const defaultFilters = { status: "active" };

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
          searchableKeys={["role_name", "status"]}
          pageSize={25}
          emailApiBase={api}
          addButton={
            <NavigationButton
              linkTo="/dashboard/add_role"
              label="הוספת תפקיד חדש"
            />
          }
          defaultFilters={defaultFilters}
        />
      )}

      {/* Popup */}
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
