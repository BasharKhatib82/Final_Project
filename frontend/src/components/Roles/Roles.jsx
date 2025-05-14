import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "../Popup";

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
  const navigate = useNavigate();

  useEffect(() => {
    // נבדוק קודם שהמשתמש מחובר והוא מנהל כללי
    axios
      .get("http://localhost:8801/check-auth", { withCredentials: true })
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
    Promise.all([
      axios.get("http://localhost:8801/active-roles", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8801/inactive-roles", {
        withCredentials: true,
      }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = activeRes.data.Roles.map((role) => ({
          ...role,
          is_active: true,
        }));
        const inactive = inactiveRes.data.Roles.map((role) => ({
          ...role,
          is_active: false,
        }));
        setAllRoles([...active, ...inactive]);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת התפקידים:", err);
        setPopup({
          show: true,
          message: "שגיאה בטעינת התפקידים",
          type: "error",
        });
      });
  };

  const handleEdit = (role_id) => {
    navigate(`/dashboard/edit_role/${role_id}`);
  };

  const handleDelete = (role_id) => {
    setPopup({
      show: true,
      message: "⚠️ האם אתה בטוח שברצונך למחוק את התפקיד ?",
      type: "confirm",
      role_id: role_id,
    });
  };

  const confirmDelete = (role_id) => {
    axios
      .put(`http://localhost:8801/delete_role/${role_id}`, null, {
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
          message: "!אירעה שגיאה במחיקה",
          type: "error",
        });
      });
  };

  return (
    <div>
      <div className="main mt2rem">
        <h2 className="text-center font-blue fontXL mp2rem">רשימת תפקידים</h2>
        <div className="filters-container">
          <Link to="/dashboard/add_role" className="btn-add-dash fontBtnDash ">
            הוספת תפקיד חדש
          </Link>
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
              placeholder="🔍  חיפוש תפקיד לפי שם ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="נקה חיפוש"
              >
                ❌
              </button>
            )}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th className="col5per">מזהה</th>
              <th className="col10per">שם תפקיד</th>
              <th className="col5per">ניהול משתמשים</th>
              <th className="col5per">צפייה בדוחות</th>
              <th className="col5per">שייך פניות</th>
              <th className="col5per">עריכת קורסים</th>
              <th className="col5per">ניהול משימות</th>
              <th className="col5per">גישה לנתונים</th>
              <th className="col5per">סטטוס</th>
              <th className="col10per">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {allRoles
              .filter((role) => {
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
              })
              .map((role) => (
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
              ))}
          </tbody>
        </table>
      </div>

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
          onConfirm={() => {
            confirmDelete(popup.role_id);
          }}
        />
      )}
    </div>
  );
};

export default Roles;
