// ✅ קובץ Attendance.jsx עם תיקון סינון לפי עובד (parseInt)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
    fetchAttendance();
    fetchUsers();
  }, []);

  const checkPermissions = async () => {
    try {
      const res = await axios.get("http://localhost:8801/auth/check", {
        withCredentials: true,
      });
      const allowedRoles = [1];
      if (!res.data.loggedIn || !allowedRoles.includes(res.data.user.role_id)) {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("שגיאה בבדיקת הרשאות", err);
      navigate("/unauthorized");
    }
  };

  const fetchAttendance = () => {
    axios
      .get("http://localhost:8801/attendance", { withCredentials: true })
      .then((res) => {
        setAttendance(res.data.Result || []);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת נוכחות:", err);
      });
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:8801/users/active", { withCredentials: true })
      .then((res) => {
        setUsers(res.data.Result || []);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת משתמשים:", err);
      });
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "לא ידוע";
  };

  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "-");

  const toLocalDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const filteredData = attendance.filter((record) => {
    const name = getUserName(record.user_id).toLowerCase();
    const statusText = record.status.toLowerCase();
    const dateText = toLocalDate(record.date);

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      search === "" ||
      name.includes(search) ||
      statusText.includes(search) ||
      dateText.includes(search);

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    const matchesEmployee =
      employeeFilter === "all" ||
      record.user_id.toString() === employeeFilter.toString();
    // ✅ תיקון השוואה למספר

    return matchesSearch && matchesStatus && matchesEmployee;
  });

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת נוכחות
      </h2>

      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-2">
        <Button linkTo="/dashboard/add_attendance" label="הוספת נוכחות חדשה" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="all">הכל</option>
          <option value="נוכח">נוכח</option>
          <option value="מחלה">מחלה</option>
          <option value="חופשה">חופשה</option>
          <option value="היעדרות">היעדרות</option>
        </select>

        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="all">כל העובדים</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש לפי שם או תאריך..."
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 cursor-pointer"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">תאריך</th>
              <th className="p-2 border">שם עובד</th>
              <th className="p-2 border">כניסה</th>
              <th className="p-2 border">יציאה</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">הערות</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-red-500 p-4">
                  אין רשומות להצגה
                </td>
              </tr>
            ) : (
              filteredData.map((record) => (
                <tr
                  key={record.attendance_id}
                  className="hover:bg-blue-50 transition"
                >
                  <td className="border p-2">{toLocalDate(record.date)}</td>
                  <td className="border p-2">{getUserName(record.user_id)}</td>
                  <td className="border p-2">{formatTime(record.check_in)}</td>
                  <td className="border p-2">{formatTime(record.check_out)}</td>
                  <td
                    className={`border p-2 font-semibold ${
                      record.status === "נוכח"
                        ? "text-green-600"
                        : record.status === "היעדרות"
                        ? "text-red-600"
                        : "text-blue-800"
                    }`}
                  >
                    {record.status}
                  </td>
                  <td className="border p-2">{record.notes || "-"}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/edit_attendance/${record.attendance_id}`
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
                    >
                      עריכה
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
