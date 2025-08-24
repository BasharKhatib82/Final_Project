// src/components/Attendance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";

const api = process.env.REACT_APP_API_URL;

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
    fetchAttendance();
    fetchUsers();
  }, []);

  const checkPermissions = async () => {
    try {
      const res = await axios.get(`${api}/auth/check`, {
        withCredentials: true,
      });
      if (!res.data.loggedIn || res.data.user.role_id !== 1) {
        navigate("/unauthorized");
      }
    } catch {
      navigate("/unauthorized");
    }
  };

  const fetchAttendance = () => {
    setLoading(true);
    axios
      .get(`${api}/attendance`, { withCredentials: true })
      .then((res) => setAttendance(res.data.Result || []))
      .catch((err) => console.error("שגיאה בטעינת נוכחות:", err))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    Promise.all([
      axios.get(`${api}/users/active`, { withCredentials: true }),
      axios.get(`${api}/users/inactive`, { withCredentials: true }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = (activeRes.data.Result || []).map((u) => ({
          ...u,
          active: true,
        }));
        const inactive = (inactiveRes.data.Result || []).map((u) => ({
          ...u,
          active: false,
        }));
        setUsers([...active, ...inactive]);
      })
      .catch((err) => console.error("שגיאה בטעינת עובדים:", err));
  };

  // 🟢 פורמט תאריך קצר
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "-";

  // 🟢 פורמט שעה
  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "-");

  // 🟢 עיצוב צבעוני לסטטוס
  const renderStatus = (status) => {
    let color = "text-blue-800";
    if (status === "נוכח") color = "text-green-600 font-semibold";
    else if (status === "היעדרות") color = "text-red-600 font-semibold";
    return <span className={color}>{status}</span>;
  };

  // 🟢 עמודות טבלה + export
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
        const u = users.find((x) => x.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "לא ידוע";
      },
      export: (r) => {
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
        <button
          onClick={() =>
            navigate(`/dashboard/edit_attendance/${r.attendance_id}`)
          }
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          עריכה
        </button>
      ),
      export: () => null, // ❌ לא מייצאים כפתורים
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
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת נוכחות"
          columns={columns}
          rows={attendance}
          filtersDef={filtersDef}
          searchableKeys={["status", "notes", "user_id"]}
          pageSize={25}
          emailApiBase={api}
          addButton={
            <NavigationButton
              linkTo="/dashboard/add_attendance"
              label="הוספת נוכחות חדשה"
            />
          }
          defaultFilters={{}}
          searchPlaceholder="חיפוש לפי שם או סטטוס..."
          filtersVariant="inline"
        />
      )}
    </div>
  );
}
