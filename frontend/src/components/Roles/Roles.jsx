import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../Popup";
import Button from "../Buttons/Button";

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [allRoles, setAllRoles] = useState([]);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    role_id: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8801/auth/check", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn && res.data.user.role_id === 1) {
          fetchRoles();
        } else {
          navigate("/unauthorized");
        }
      })
      .catch((err) => {
        console.error("שגיאה בבדיקת התחברות:", err);
        navigate("/unauthorized");
      });
  }, [navigate]);

  const fetchRoles = () => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:8801/roles/active", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8801/roles/inactive", {
        withCredentials: true,
      }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = activeRes.data.Roles.map((r) => ({
          ...r,
          is_active: true,
        }));
        const inactive = inactiveRes.data.Roles.map((r) => ({
          ...r,
          is_active: false,
        }));
        setAllRoles([...active, ...inactive]);
      })
      .catch(() => {
        setPopup({
          show: true,
          message: "שגיאה בטעינת התפקידים",
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (role_id) => navigate(`/dashboard/edit_role/${role_id}`);
  const handleDelete = (role_id) =>
    setPopup({
      show: true,
      message: "⚠️ האם אתה בטוח שברצונך למחוק את התפקיד?",
      type: "confirm",
      role_id,
    });

  const confirmDelete = (role_id) => {
    axios
      .put(`http://localhost:8801/roles/delete/${role_id}`, null, {
        withCredentials: true,
      })
      .then(() => {
        setPopup({
          show: true,
          message: "✅ התפקיד נמחק בהצלחה",
          type: "success",
        });
        fetchRoles();
      })
      .catch(() => {
        setPopup({
          show: true,
          message: "אירעה שגיאה במחיקה",
          type: "error",
        });
      });
  };

  const filteredRoles = allRoles.filter((role) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = role.role_name.toLowerCase().includes(term);
    const statusText = role.is_active ? "פעיל" : "לא פעיל";
    const statusMatch = statusText.includes(term);
    const statusCheck =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? role.is_active
        : !role.is_active;

    return statusCheck && (nameMatch || statusMatch);
  });

  // ✅ סימון ✓ או ✗ בצבע מתאים
  const renderCheck = (value) => (
    <span
      className={value ? "text-green-600 font-bold" : "text-red-500 font-bold"}
    >
      {value ? "✓" : "✗"}
    </span>
  );

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת תפקידים
      </h2>

      {/* סינון + חיפוש */}
      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-2">
        <Button linkTo="/dashboard/add_role" label="הוספת תפקיד חדש" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className=" font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="active">תפקידים פעילים</option>
          <option value="inactive">תפקידים לא פעילים</option>
          <option value="all">הכל</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש תפקיד..."
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* טבלה */}
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <div className="overflow-auto rounded-lg shadow-lg  bg-white/85">
          <table className="w-full table-auto border-collapse text-sm text-center">
            <thead>
              <tr className=" bg-slate-100 text-gray-800">
                <th className="p-2 border">מזהה</th>
                <th className="p-2 border">שם תפקיד</th>
                <th className="p-2 border">ניהול משתמשים</th>
                <th className="p-2 border">צפייה בדוחות</th>
                <th className="p-2 border">שייך פניות</th>
                <th className="p-2 border">עריכת קורסים</th>
                <th className="p-2 border">ניהול משימות</th>
                <th className="p-2 border">גישה לנתונים</th>
                <th className="p-2 border">סטטוס</th>
                <th className="p-2 border">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-red-500 p-4">
                    אין תפקידים להצגה
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr
                    key={role.role_id}
                    className={`transition duration-200 hover:bg-blue-50 cursor-pointer ${
                      role.is_active ? "" : "bg-gray-100"
                    }`}
                  >
                    <td className="border p-2 text-center">{role.role_id}</td>
                    <td className="border p-2">{role.role_name}</td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_manage_users)}
                    </td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_view_reports)}
                    </td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_assign_leads)}
                    </td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_edit_courses)}
                    </td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_manage_tasks)}
                    </td>
                    <td className="border p-2 text-center">
                      {renderCheck(role.can_access_all_data)}
                    </td>
                    <td
                      className={`border p-2 text-center font-semibold ${
                        role.is_active ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {role.is_active ? "פעיל" : "לא פעיל"}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleEdit(role.role_id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
                      >
                        עריכה
                      </button>
                      {role.is_active && (
                        <button
                          onClick={() => handleDelete(role.role_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          מחיקה
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      {popup.show && popup.type !== "confirm" && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() =>
            setPopup({ show: false, message: "", type: "", role_id: null })
          }
        />
      )}
      {popup.show && popup.type === "confirm" && (
        <Popup
          message={popup.message}
          type="confirm"
          onClose={() =>
            setPopup({ show: false, message: "", type: "", role_id: null })
          }
          onConfirm={() => confirmDelete(popup.role_id)}
        />
      )}
    </div>
  );
};

export default Roles;
