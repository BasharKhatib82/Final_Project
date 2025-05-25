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
    // בדיקת הרשאות
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
      .catch((err) => {
        console.error("שגיאה בטעינת תפקידים:", err);
        setPopup({
          show: true,
          message: "שגיאה בטעינת התפקידים",
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (role_id) => {
    navigate(`/dashboard/edit_role/${role_id}`);
  };

  const handleDelete = (role_id) => {
    setPopup({
      show: true,
      message: "⚠️ האם אתה בטוח שברצונך למחוק את התפקיד?",
      type: "confirm",
      role_id,
    });
  };

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
        setPopup({ show: true, message: "!אירעה שגיאה במחיקה", type: "error" });
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

  return (
    <div className="main-dash mt2rem">
      <h2 className="text-center font-blue fontXL mp2rem">רשימת תפקידים</h2>

      <div className="filters-container">
        <Button linkTo="/dashboard/add_role" label="הוספת תפקיד חדש" />

        <select
          className="status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">הצג תפקידים פעילים בלבד</option>
          <option value="inactive">הצג תפקידים לא פעילים בלבד</option>
          <option value="all">הצג את כל התפקידים</option>
        </select>

        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 חיפוש תפקיד לפי שם..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ❌
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center mt2rem">טוען נתונים...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>מזהה</th>
              <th>שם תפקיד</th>
              <th>ניהול משתמשים</th>
              <th>צפייה בדוחות</th>
              <th>שייך פניות</th>
              <th>עריכת קורסים</th>
              <th>ניהול משימות</th>
              <th>גישה לנתונים</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center fontSM font-red">
                  אין תפקידים להצגה
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr
                  key={role.role_id}
                  className={!role.is_active ? "f-c-b-gray" : ""}
                >
                  <td>{role.role_id}</td>
                  <td>{role.role_name}</td>
                  <td
                    className={
                      role.can_manage_users ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_manage_users ? "✓" : "✗"}
                  </td>
                  <td
                    className={
                      role.can_view_reports ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_view_reports ? "✓" : "✗"}
                  </td>
                  <td
                    className={
                      role.can_assign_leads ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_assign_leads ? "✓" : "✗"}
                  </td>
                  <td
                    className={
                      role.can_edit_courses ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_edit_courses ? "✓" : "✗"}
                  </td>
                  <td
                    className={
                      role.can_manage_tasks ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_manage_tasks ? "✓" : "✗"}
                  </td>
                  <td
                    className={
                      role.can_access_all_data ? "status-yes" : "status-no"
                    }
                  >
                    {role.can_access_all_data ? "✓" : "✗"}
                  </td>
                  <td className={role.is_active ? "status-yes" : "status-no"}>
                    {role.is_active ? "פעיל" : "לא פעיל"}
                  </td>
                  <td>
                    <button
                      className="btn-edit fontBtnDash"
                      onClick={() => handleEdit(role.role_id)}
                    >
                      עריכה
                    </button>
                    {role.is_active && (
                      <button
                        className="btn-delete fontBtnDash"
                        onClick={() => handleDelete(role.role_id)}
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
      )}

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
