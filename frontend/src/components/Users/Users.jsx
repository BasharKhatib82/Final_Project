// frontend/src/pages/Users/Users.jsx

/**
 * קומפוננטה: Users
 * ----------------
 * מטרות:
 * 1. מציגה רשימת משתמשים , פעילים ולא פעילים .
 * 2. אפשרויות :
 *    -   עריכה.
 *    -  מחיקה (מחיקה לוגית).
 *    -  הוספה .
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Popup, useUser } from "components/Tools";
import { AppButton } from "components/Buttons";
import ReportView from "../Reports/ReportView";
import { api, extractApiError } from "utils";

//פונקציית עזר לבדיקת סטטוס
const isActive = (v) => v === true || v === 1 || v === "1";

// הצגת סטטוס עם צבעים
const renderCheckActive = (v) => (
  <span className={v ? "text-green-600" : "text-red-500"}>
    {v ? "פעיל" : "לא פעיל"}
  </span>
);

export default function Users() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
    user_id: null,
  });

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  // שליפת משתמשים פעילים ולא פעילים
  const fetchUsers = () => {
    setLoading(true);

    Promise.all([api.get("/users/active"), api.get("/users/inactive")])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.data || []).map((u) => ({
          ...u,
          active: isActive(u.active),
          status_human: "פעיל",
        }));
        const inactive = (inactiveRes?.data?.data || []).map((u) => ({
          ...u,
          active: isActive(u.active),
          status_human: "לא פעיל",
        }));
        setAllUsers([...active, ...inactive]);
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת עובדים"),
          mode: "error",
        })
      )
      .finally(() => setLoading(false));
  };

  //  מעבר למסך עריכת משתמש
  const handleEdit = (user_id) => {
    navigate(`/dashboard/users/edit/${user_id}`);
  };

  // סימון משתמש כלא פעיל
  const confirmDelete = (user_id) => {
    api
      .put(`/users/delete/${user_id}`, { active: 0 })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "המשתמש סומן כלא פעיל",
          mode: "success",
        });
        fetchUsers();
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "אירעה שגיאה במחיקה"),
          mode: "error",
        })
      );
  };

  // עמודות הדוח לטבלת המשתמשים
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
      export: (u) => u.status_human,
    },
  ];

  // עמודת פעולות לפי הרשאות
  if (user?.permission_edit_user === 1 || user?.permission_delete_user === 1) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (u) => (
        <div className="flex justify-center">
          <div className="flex items-center gap-1 text-center">
            {user?.permission_edit_user === 1 && (
              <button
                onClick={() => handleEdit(u.user_id)}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
              >
                <Icon
                  icon="fluent-color:edit-32"
                  width="1.2rem"
                  height="1.2rem"
                />
                עריכה
              </button>
            )}
            {user?.permission_delete_user === 1 && u.active && (
              <button
                onClick={() =>
                  setPopup({
                    show: true,
                    title: "אישור מחיקה",
                    message: "להפוך את המשתמש ללא פעיל ?",
                    mode: "confirm",
                    user_id: u.user_id,
                  })
                }
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <Icon
                  icon="streamline-color:recycle-bin-2-flat"
                  width="1.2em"
                  height="1.2em"
                />
                מחיקה
              </button>
            )}
          </div>
        </div>
      ),
      export: () => null,
    });
  }

  // הגדרת פילטרים
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
      dynamic: true,
      optionLabelKey: "role_name",
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
          pageSize={10}
          emailApiBase={process.env.REACT_APP_API_URL}
          addButton={
            user?.permission_add_user === 1 && (
              <AppButton
                label="הוספת עובד חדש"
                icon={
                  <Icon icon="basil:add-outline" width="1.2em" height="1.2em" />
                }
                variant="navigate"
                to="/dashboard/add_user"
              />
            )
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
