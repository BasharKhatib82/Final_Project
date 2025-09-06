import React, { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";
import { useUser } from "../Tools/UserContext";

const api = process.env.REACT_APP_API_URL;

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  // 🟢 1) בעת טעינת הנוכחות – הוסף full_name (אם מגיע מה־API זה קל; אם לא, נשלים אחר כך)
  const fetchAttendance = () => {
    setLoading(true);
    axios
      .get(`${api}/attendance`, { withCredentials: true })
      .then((res) => {
        const rows = res.data?.data || [];
        const withNames = rows.map((r) => ({
          ...r,
          // אם השרת מחזיר first_name/last_name נשתמש בהם; אחרת נעדכן מאוחר יותר אחרי users
          full_name: [r.first_name, r.last_name]
            .filter(Boolean)
            .join(" ")
            .trim(),
        }));
        setAttendance(withNames);
      })
      .catch((err) => console.error("שגיאה בטעינת נוכחות:", err))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    Promise.all([
      axios.get(`${api}/users/active`, { withCredentials: true }),
      axios.get(`${api}/users/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes.data.data || []).map((u) => ({
          ...u,
          active: true,
        }));
        const inactive = (inactiveRes.data.data || []).map((u) => ({
          ...u,
          active: false,
        }));
        setUsers([...active, ...inactive]);
      })
      .catch((err) => console.error("שגיאה בטעינת עובדים:", err));
  };

  // 🟢 2) אם ה־API לא מחזיר first_name/last_name, נבנה full_name מתוך users אחרי שנטענו
  useEffect(() => {
    if (users.length === 0 || attendance.length === 0) return;

    setAttendance((prev) =>
      prev.map((r) => {
        if (r.full_name) return r; // כבר קיים
        const u = users.find((x) => x.user_id === r.user_id);
        return {
          ...r,
          full_name: u ? `${u.first_name} ${u.last_name}` : "",
        };
      })
    );
  }, [users]); // מריץ כשמשתמשים נטענים

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "-";

  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "-");

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
      render: (r) => {
        // 🟢 3) נעדיף full_name אם קיים
        if (r.full_name) return r.full_name;
        const u = users.find((x) => x.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "לא ידוע";
      },
      export: (r) => {
        if (r.full_name) return r.full_name;
        const u = users.find((x) => x.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "לא ידוע";
      },
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
      render: (r) => (
        <div className="flex justify-center">
          {user?.permission_edit_attendance === 1 && (
            <button
              onClick={() =>
                navigate(`/dashboard/edit_attendance/${r.attendance_id}`)
              }
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
        </div>
      ),
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
          // 🟢 4) נחליף את מפתחות החיפוש כך שיחפש בשם העובד
          searchableKeys={["status", "notes", "full_name"]}
          pageSize={25}
          emailApiBase={api}
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
    </div>
  );
}
