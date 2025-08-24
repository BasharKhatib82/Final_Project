// ✅ Attendance.jsx – עם ReportView אחיד
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "../Tools/Popup";
import NavigationButton from "../Buttons/NavigationButton";
import ReportView from "../Reports/ReportView";

const api = process.env.REACT_APP_API_URL;

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions().then(() => {
      fetchUsers().then(fetchAttendance);
    });
  }, []);

  const checkPermissions = async () => {
    try {
      const res = await axios.get(`${api}/auth/check`, {
        withCredentials: true,
      });
      if (!res.data.loggedIn || res.data.user.role_id !== 1) {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("❌ שגיאה בבדיקת הרשאות:", err);
      navigate("/unauthorized");
    }
  };

  const fetchUsers = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        axios.get(`${api}/users/active`, { withCredentials: true }),
        axios.get(`${api}/users/inactive`, { withCredentials: true }),
      ]);
      const active = (activeRes.data.Result || []).map((u) => ({
        ...u,
        active: true,
      }));
      const inactive = (inactiveRes.data.Result || []).map((u) => ({
        ...u,
        active: false,
      }));
      setUsers([...active, ...inactive]);
    } catch (err) {
      console.error("❌ שגיאה בטעינת עובדים:", err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/attendance`, {
        withCredentials: true,
      });
      setAttendance(res.data.Result || []);
    } catch (err) {
      console.error("❌ שגיאה בטעינת נוכחות:", err);
      setPopup({
        show: true,
        title: "שגיאה",
        message: "שגיאה בטעינת רשומות נוכחות",
        mode: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 עמודות
  const columns = [
    {
      key: "date",
      label: "תאריך",
      export: (r) => r.date,
    },
    {
      key: "user_id",
      label: "שם עובד",
      render: (r) => {
        const user = users.find((u) => u.user_id === r.user_id);
        if (!user) return "לא ידוע";
        return `${user.first_name} ${user.last_name} ${
          !user.active ? "⚠ לא פעיל" : ""
        }`;
      },
      export: (r) => {
        const user = users.find((u) => u.user_id === r.user_id);
        return user ? `${user.first_name} ${user.last_name}` : "לא ידוע";
      },
    },
    { key: "check_in", label: "כניסה", export: (r) => r.check_in || "-" },
    { key: "check_out", label: "יציאה", export: (r) => r.check_out || "-" },
    {
      key: "status",
      label: "סטטוס",
      export: (r) => r.status,
      render: (r) => (
        <span
          className={`${
            r.status === "נוכח"
              ? "text-green-600"
              : r.status === "היעדרות"
              ? "text-red-600"
              : "text-blue-800"
          } font-semibold`}
        >
          {r.status}
        </span>
      ),
    },
    { key: "notes", label: "הערות", export: (r) => r.notes || "-" },
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
      export: () => null,
    },
  ];

  // 🟢 פילטרים
  const filtersDef = [
    {
      name: "status",
      label: "סטטוס נוכחות",
      type: "select",
      options: [
        { value: "", label: "כל הסטטוסים" },
        { value: "נוכח", label: "נוכח" },
        { value: "מחלה", label: "מחלה" },
        { value: "חופשה", label: "חופשה" },
        { value: "היעדרות", label: "היעדרות" },
      ],
    },
    {
      name: "user_id",
      label: "עובד",
      type: "select",
      dynamic: true,
      optionLabelKey: "full_name", // נבנה בשורת mapUser
    },
    {
      name: "date",
      label: "טווח תאריכים",
      type: "daterange",
    },
  ];

  // 🟢 נעדכן כל רשומה עם full_name בשביל dynamic filter
  const rows = attendance.map((a) => {
    const user = users.find((u) => u.user_id === a.user_id);
    return {
      ...a,
      full_name: user ? `${user.first_name} ${user.last_name}` : "לא ידוע",
    };
  });

  const defaultFilters = {};

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת נוכחות"
          columns={columns}
          rows={rows}
          filtersDef={filtersDef}
          searchableKeys={["full_name", "status", "date"]}
          pageSize={25}
          emailApiBase={api}
          addButton={
            <NavigationButton
              linkTo="/dashboard/add_attendance"
              label="הוספת נוכחות חדשה"
            />
          }
          defaultFilters={defaultFilters}
          searchPlaceholder="חיפוש לפי שם או תאריך..."
        />
      )}

      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() =>
            setPopup({ show: false, title: "", message: "", mode: "" })
          }
        />
      )}
    </div>
  );
}
