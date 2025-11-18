// frontend/src/pages/Roles/Roles.jsx

/**
 * קומפוננטה: Roles
 * ----------------
 * מטרות:
 * 1. מציגה רשימת תפקידים קיימים במערכת (פעילים ולא פעילים).
 * 2. מאפשרת:
 *    - צפייה בהרשאות של כל תפקיד.
 *    - עריכת תפקיד (למשתמשים עם הרשאת עריכה).
 *    - מחיקת תפקיד (למשתמשים עם הרשאת מחיקה).
 *    - הוספת תפקיד חדש (למשתמשים עם הרשאת הוספה).
 *
 * שימושים:
 * - ניגשת ל־API כדי לשלוף תפקידים פעילים ולא פעילים.
 * - מציגה טבלה (ReportView) עם אפשרות סינון, חיפוש וייצוא.
 * - משתמשת ב־Popup להצגת הודעות, שגיאות ואישורים.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Popup, useUser } from "components/Tools";
import { NavigationButton } from "components/Buttons";
import ReportView from "../Reports/ReportView";
import { permissionsSchema } from "constants";
import { ROLE_STATUSES } from "constants";
import { api, extractApiError } from "utils";

// "פונקציית עזר: בדיקה אם ערך נחשב "פעיל
const isActive = (el) => el === true || el === 1 || el === "1";

// (כולל שם סטטוס קריא) UI מיפוי רשומת תפקיד ל
const mapRole = (r) => ({
  ...r,
  active: isActive(r.active),
  status_human: isActive(r.active)
    ? ROLE_STATUSES.ACTIVE.label
    : ROLE_STATUSES.INACTIVE.label,
});

// הצגת סטטוס עם צבעים
const renderCheckActive = (v) => (
  <span className={v ? "text-green-600" : "text-red-500"}>
    {v ? ROLE_STATUSES.ACTIVE.label : ROLE_STATUSES.INACTIVE.label}
  </span>
);

export default function Roles() {
  const [allRoles, setAllRoles] = useState([]); // רשימת כל התפקידים
  const [loading, setLoading] = useState(true); // מצב טעינה
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
    role_id: null,
  });

  const navigate = useNavigate();
  const { user } = useUser(); // נתוני המשתמש המחובר

  // שליפת התפקידים מהשרת בעת טעינה ראשונית
  useEffect(() => {
    fetchRoles();
  }, []);

  // שליפת רשימת תפקידים (פעילים + לא פעילים)
  const fetchRoles = () => {
    setLoading(true);
    Promise.all([api.get("/roles/active"), api.get("/roles/inactive")])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes?.data?.data || []).map(mapRole);
        const inactive = (inactiveRes?.data?.data || []).map(mapRole);
        setAllRoles([...active, ...inactive]);
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת התפקידים"),
          mode: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  // מעבר למסך עריכת תפקיד
  const handleEdit = (role_id) => navigate(`/dashboard/edit_role/${role_id}`);

  // מחיקת תפקיד
  const confirmDelete = (role_id) => {
    api
      .put(`/roles/delete/${role_id}`)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "התפקיד נמחק בהצלחה",
          mode: "success",
        });
        fetchRoles();
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

  // עמודות הדוח לטבלת התפקידים
  const columns = [
    { key: "role_id", label: "מזהה", export: (r) => String(r.role_id) },
    { key: "role_name", label: "שם תפקיד", export: (r) => String(r.role_name) },
    {
      key: "permissions",
      label: "הרשאות",
      render: (r) => (
        <div className="flex justify-center">
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
            className="flex flex-row-reverse items-center gap-2 bg-blue-50 border border-blue-200 text-gray-700 hover:bg-blue-100 px-4 py-1 rounded shadow-sm transition"
          >
            צפייה בהרשאות
            <Icon icon="emojione-v1:eye" width="1.2rem" height="1.2rem" />
          </button>
        </div>
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

  // הוספת עמודת "פעולות" בהתאם להרשאות המשתמש
  if (user?.permission_edit_role === 1 || user?.permission_delete_role === 1) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="flex justify-center">
          <div className="flex items-center gap-1 text-center">
            {user?.permission_edit_role === 1 && (
              <button
                onClick={() => handleEdit(r.role_id)}
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
            {user?.permission_delete_role === 1 && r.active && (
              <button
                onClick={() =>
                  setPopup({
                    show: true,
                    title: "אישור מחיקה",
                    message: " למחוק את התפקיד הזה?",
                    mode: "confirm",
                    role_id: r.role_id,
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
        { value: 1, label: ROLE_STATUSES.ACTIVE.label },
        { value: 0, label: ROLE_STATUSES.INACTIVE.label },
        { value: "", label: "כל הסטטוסים" },
      ],
    },
  ];

  const defaultFilters = { active: 1 };

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת תפקידים"
          columns={columns}
          rows={allRoles}
          filtersDef={[filtersDef]}
          searchableKeys={["role_name"]}
          pageSize={10}
          emailApiBase={process.env.REACT_APP_API_URL}
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
