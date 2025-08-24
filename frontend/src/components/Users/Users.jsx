import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../Tools/Popup";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";

const api = process.env.REACT_APP_API_URL;
const isActive = (v) => v === true || v === 1 || v === "1";

// --- מיפוי משתמש ---
const mapUser = (u, roles = []) => {
  const role = roles.find((r) => String(r.role_id) === String(u.role_id));
  return {
    ...u,
    active: isActive(u.active ?? u.is_active),
    first_name: u.first_name || "לא ידוע",
    last_name: u.last_name || "לא ידוע",
    role_id: String(u.role_id),
    role_name: role ? role.role_name : "לא ידוע",
    status_human: isActive(u.active ?? u.is_active) ? "פעיל" : "לא פעיל",
  };
};

const renderCheckActive = (v) => (
  <span className={v ? "text-green-600" : "text-red-500"}>
    {v ? "פעיל" : "לא פעיל"}
  </span>
);

export default function Users() {
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
    user_id: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${api}/auth/check`, { withCredentials: true })
      .then((res) => {
        if (res?.data?.loggedIn && res?.data?.user?.role_id === 1) {
          fetchRoles().then(fetchUsers);
        } else navigate("/unauthorized");
      })
      .catch(() => navigate("/unauthorized"));
  }, [navigate]);

  const fetchRoles = () => {
    return Promise.all([
      axios.get(`${api}/roles/active`, { withCredentials: true }),
      axios.get(`${api}/roles/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.Roles || []).map((r) => ({
          ...r,
          active: true,
        }));
        const inactive = (inactiveRes?.data?.Roles || []).map((r) => ({
          ...r,
          active: false,
        }));
        setRoles([...active, ...inactive]);
      })
      .catch(() =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת תפקידים",
          mode: "error",
        })
      );
  };

  const fetchUsers = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${api}/users/active`, { withCredentials: true }),
      axios.get(`${api}/users/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.Result || []).map((u) =>
          mapUser(u, roles)
        );
        const inactive = (inactiveRes?.data?.Result || []).map((u) =>
          mapUser(u, roles)
        );
        setAllUsers([...active, ...inactive]);
      })
      .catch(() =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת עובדים",
          mode: "error",
        })
      )
      .finally(() => setLoading(false));
  };

  const handleEdit = (user_id) => navigate(`/dashboard/users/edit/${user_id}`);
  const confirmDelete = (user_id) => {
    axios
      .put(
        `${api}/users/delete/${user_id}`,
        { active: 0 },
        { withCredentials: true }
      )
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "✅ המשתמש סומן כלא פעיל",
          mode: "success",
        });
        fetchUsers();
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
    { key: "user_id", label: "ת.ז", export: (u) => String(u.user_id) },
    { key: "first_name", label: "שם פרטי", export: (u) => u.first_name },
    { key: "last_name", label: "שם משפחה", export: (u) => u.last_name },
    { key: "role_name", label: "תפקיד", export: (u) => u.role_name },
    { key: "email", label: "אימייל", export: (u) => u.email },
    {
      key: "active",
      label: "סטטוס",
      render: (u) => renderCheckActive(u.active),
      exportLabel: "status_human",
    },
    {
      key: "actions",
      label: "פעולות",
      render: (u) => (
        <div className="text-center">
          <button
            onClick={() => handleEdit(u.user_id)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
          >
            עריכה
          </button>
          {u.active && (
            <button
              onClick={() =>
                setPopup({
                  show: true,
                  title: "אישור מחיקה",
                  message: "⚠️ להפוך את המשתמש ללא פעיל?",
                  mode: "confirm",
                  user_id: u.user_id,
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

  // 🟢 רשימת תפקידים רק מהמשתמשים שמופיעים כרגע (filteredUsers)
  // נשתמש ב־useMemo כדי לא לבנות כל פעם מחדש
  const roleOptionsFromFiltered = useMemo(() => {
    return [
      ...new Map(allUsers.map((u) => [String(u.role_id), u.role_name])),
    ].map(([value, label]) => ({ value, label }));
  }, [allUsers]);

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
    {
      name: "role_id",
      label: "תפקיד",
      type: "select",
      options: [
        { value: "", label: "כל התפקידים" },
        ...roleOptionsFromFiltered,
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
          title="רשימת עובדים"
          columns={columns}
          rows={allUsers}
          filtersDef={filtersDef}
          searchableKeys={["first_name", "last_name", "email", "role_name"]}
          pageSize={25}
          emailApiBase={api}
          addButton={
            <NavigationButton
              linkTo="/dashboard/add_user"
              label="הוספת עובד חדש"
            />
          }
          defaultFilters={defaultFilters}
          searchPlaceholder="חיפוש לפי שם או אימייל..."
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
              user_id: null,
            })
          }
          onConfirm={
            popup.mode === "confirm"
              ? () => confirmDelete(popup.user_id)
              : undefined
          }
        />
      )}
    </div>
  );
}
