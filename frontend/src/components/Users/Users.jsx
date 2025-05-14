import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from "../Tools/Tooltip";
import Button from "../Buttons/Button";

const Users = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
    fetchUsers();
    fetchRoles();
  }, []);

  const checkPermissions = async () => {
    try {
      const res = await axios.get("http://localhost:8801/check-auth", {
        withCredentials: true,
      });
      if (!res.data.loggedIn || res.data.user.role_id !== 1) {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("שגיאה בבדיקת הרשאות", err);
      navigate("/unauthorized");
    }
  };

  const fetchUsers = () => {
    Promise.all([
      axios.get("http://localhost:8801/active-users", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8801/inactive-users", {
        withCredentials: true,
      }),
    ])
      .then(([activeRes, inactiveRes]) => {
        const active = activeRes.data.Result.map((user) => ({
          ...user,
          is_active: true,
        }));
        const inactive = inactiveRes.data.Result.map((user) => ({
          ...user,
          is_active: false,
        }));
        setAllUsers([...active, ...inactive]);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת העובדים:", err);
      });
  };

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
          active: true,
        }));
        const inactive = inactiveRes.data.Roles.map((role) => ({
          ...role,
          active: false,
        }));
        setRoles([...active, ...inactive]);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת תפקידים:", err);
      });
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.role_id === roleId);
    if (!role) {
      return <span className="role-name role-unknown">לא ידוע</span>;
    }

    return (
      <span className="role-name">
        {role.role_name}
        {!role.active && (
          <Tooltip message="תפקיד זה לא פעיל יותר – נא לעדכן תפקיד">
            <span className="color-yellow">⚠</span>
          </Tooltip>
        )}
      </span>
    );
  };

  return (
    <div>
      <div className="main-dash mt2rem">
        <h2 className="text-center font-blue fontXL mp2rem">רשימת משתמשים</h2>
        <div className="filters-container">
          <Button linkTo="/dashboard/add_user" label="הוספת משתמש חדש" />
          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">הצג משתמשים פעילים בלבד</option>
            <option value="inactive">הצג משתמשים לא פעילים בלבד</option>
            <option value="all">הצג את כל המשתמשים</option>
          </select>

          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="🔍  חיפוש משתמש לפי שם ..."
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
              <th className="col10per">תעודת זהות</th>
              <th className="col10per">שם פרטי</th>
              <th className="col10per">שם משפחה</th>
              <th className="col10per">תפקיד</th>
              <th className="col20per">אימייל</th>
              <th className="col10per">סטטוס</th>
              <th className="col20per">פעולה</th>
            </tr>
          </thead>
          <tbody>
            {allUsers
              .filter((user) => {
                const term = searchTerm.toLowerCase();
                const nameMatch = user.role_name.toLowerCase().includes(term);
                const statusText = user.is_active ? "פעיל" : "לא פעיל";
                const statusMatch = statusText.includes(term);

                const statusCheck =
                  statusFilter === "all"
                    ? true
                    : statusFilter === "active"
                    ? user.is_active
                    : !user.is_active;

                return statusCheck && (nameMatch || statusMatch);
              })
              .map((user) => (
                <tr
                  key={user.user_id}
                  className={!user.is_active ? "f-c-b-gray" : ""}
                >
                  <td>{user.user_id}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{getRoleName(user.role_id)}</td>
                  <td>{user.email}</td>
                  <td className={user.is_active ? "status-yes" : "status-no"}>
                    {user.is_active ? "פעיל" : "לא פעיל"}
                  </td>
                  <td className="action-buttons">
                    <button className="btn-edit fontBtnDash">עריכה</button>
                    {user.is_active && (
                      <button className="btn-delete fontBtnDash">מחיקה</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
