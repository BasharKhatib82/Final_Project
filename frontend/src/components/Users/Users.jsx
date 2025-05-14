import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Tooltip from "../Tools/Tooltip";

const Users = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
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
      <div className="main mt2rem">
        <h2 className="text-center font-blue fontXL">רשימת עובדים</h2>
        <div className="add-wrapper">
          <Link to="/dashboard/add_user" className="btn-add-dash fontBtnDash">
            הוספת עובד חדש
          </Link>
          <button
            onClick={() => setShowInactive((prev) => !prev)}
            className="btn-filter-dash fontBtnDash"
          >
            {showInactive ? "הסתר עובדים לא פעילים" : "הצג עובדים לא פעילים"}
          </button>
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
              .filter((user) => showInactive || user.is_active)
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
