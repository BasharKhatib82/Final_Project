// frontend/src/pages/Attendance/Attendance.jsx

/**
 * קומפוננטה: Attendance
 * ---------------------
 * מטרות:
 * - הצגת רשימת נוכחות לפי תאריכים.
 * - חיפוש, סינון, הוספה, עריכה.
 *
 * הרשאות:
 * - permission_add_attendance → הצגת כפתור הוספה.
 * - permission_edit_attendance → הצגת כפתור עריכה לכל שורה.
 *
 * עזרים:
 * - useUser → קבלת משתמש נוכחי והרשאות.
 * - formatDate / formatTime → עיצוב תאריך ושעה.
 * - api (axios wrapper) → קריאות API.
 */

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useUser, Popup } from "components/Tools";
import { NavigationButton } from "components/Buttons";
import ReportView from "../Reports/ReportView";
import { api, formatDate, formatTime, extractApiError } from "utils";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance");
      const rows = res.data?.data || [];
      setAttendance(
        rows.map((r) => ({
          ...r,
          full_name: [r.first_name, r.last_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
        }))
      );
    } catch (err) {
      console.error("שגיאה בטעינת נוכחות:", err);
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת רשימת הנוכחות"),
        mode: "error",
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        api.get("/users/active"),
        api.get("/users/inactive"),
      ]);
      const active = (activeRes.data?.data || []).map((u) => ({
        ...u,
        active: true,
      }));
      const inactive = (inactiveRes.data?.data || []).map((u) => ({
        ...u,
        active: false,
      }));
      setUsers([...active, ...inactive]);
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  // שילוב שמות אם חסר
  useEffect(() => {
    if (users.length === 0 || attendance.length === 0) return;
    setAttendance((prev) =>
      prev.map((r) => {
        if (r.full_name) return r;
        const u = users.find((x) => x.user_id === r.user_id);
        return {
          ...r,
          full_name: u ? `${u.first_name} ${u.last_name}` : "לא ידוע",
        };
      })
    );
  }, [users]);

  const renderStatus = (status) => {
    let color = "text-blue-800";
    if (status === "נוכח") color = "text-green-600 font-semibold";
    else if (status === "היעדרות") color = "text-red-600 font-semibold";
    return <span className={color}>{status}</span>;
  };

  const columns = [
    {
      key: "date",
      label: "תאריך",
      render: (r) => formatDate(r.date),
      export: (r) => formatDate(r.date),
    },
    {
      key: "user_id",
      label: "שם עובד",
      render: (r) => r.full_name,
      export: (r) => r.full_name,
    },
    {
      key: "check_in",
      label: "כניסה",
      render: (r) => formatTime(r.check_in),
      export: (r) => formatTime(r.check_in),
    },
    {
      key: "check_out",
      label: "יציאה",
      render: (r) => formatTime(r.check_out),
      export: (r) => formatTime(r.check_out),
    },
    {
      key: "status",
      label: "סטטוס",
      render: (r) => renderStatus(r.status),
      export: (r) => r.status,
    },
    {
      key: "notes",
      label: "הערות",
      render: (r) => r.notes || "-",
      export: (r) => r.notes || "-",
    },
    {
      key: "actions",
      label: "פעולות",
      render: (r) =>
        user?.permission_edit_attendance === 1 ? (
          <button
            onClick={() =>
              navigate(`/dashboard/edit_attendance/${r.attendance_id}`)
            }
            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
          >
            <Icon icon="fluent-color:edit-32" width="1.2rem" height="1.2rem" />
            עריכה
          </button>
        ) : null,
      export: () => null,
    },
  ];

  const filtersDef = [
    {
      name: "status",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "", label: "כל הסטטוסים" },
        { value: "נוכח", label: "נוכח" },
        { value: "חופשה", label: "חופשה" },
        { value: "מחלה", label: "מחלה" },
        { value: "היעדרות", label: "היעדרות" },
      ],
    },
    {
      name: "user_id",
      label: "עובד",
      type: "select",
      options: [
        { value: "", label: "כל העובדים" },
        ...users.map((u) => ({
          value: String(u.user_id),
          label: `${u.first_name} ${u.last_name}${
            !u.active ? " ⚠ לא פעיל" : ""
          }`,
        })),
      ],
    },
    {
      name: "date",
      label: "טווח תאריכים",
      type: "daterange",
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading || users.length === 0 ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת נוכחות"
          columns={columns}
          rows={attendance}
          filtersDef={filtersDef}
          searchableKeys={["status", "notes", "full_name"]}
          pageSize={10}
          emailApiBase={api.defaults.baseURL}
          addButton={
            user?.permission_add_attendance === 1 ? (
              <NavigationButton
                linkTo="/dashboard/add_attendance"
                label="הוספת נוכחות חדשה"
              />
            ) : null
          }
          defaultFilters={{}}
          searchPlaceholder="חיפוש לפי שם או סטטוס..."
          filtersVariant="inline"
        />
      )}

      {popup?.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
