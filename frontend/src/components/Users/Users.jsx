import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from "../Tools/Tooltip";
import NavigationButton from "../Buttons/NavigationButton";
import Popup from "../Tools/Popup";
const api = process.env.REACT_APP_BACKEND;

const Users = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [popupData, setPopupData] = useState({
    show: false,
    title: "",
    message: "",
    mode: "info",
    user_id: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
    fetchUsers();
    fetchRoles();
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
      console.error("שגיאה בבדיקת הרשאות", err);
      navigate("/unauthorized");
    }
  };

  const fetchUsers = () => {
    Promise.all([
      axios.get(`${api}/users/active`, {
        withCredentials: true,
      }),
      axios.get(`${api}/users/inactive`, {
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
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת העובדים",
          mode: "error",
        });
        console.error(err);
      });
  };

  const fetchRoles = () => {
    Promise.all([
      axios.get(`${api}/roles/active`, {
        withCredentials: true,
      }),
      axios.get(`${api}/roles/inactive`, {
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
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "שגיאה בטעינת תפקידים",
          mode: "error",
        });
        console.error(err);
      });
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.role_id === roleId);
    if (!role) return <span className="text-gray-500">לא ידוע</span>;
    return (
      <span>
        {role.role_name}
        {!role.active && (
          <Tooltip message="תפקיד זה לא פעיל יותר – נא לעדכן תפקיד">
            <span className="text-yellow-500"> ⚠ </span>
          </Tooltip>
        )}
      </span>
    );
  };

  const filteredUsers = allUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const statusText = user.is_active ? "פעיל" : "לא פעיל";
    const statusCheck =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? user.is_active
        : !user.is_active;
    return (
      statusCheck && (fullName.includes(term) || statusText.includes(term))
    );
  });

  const handleDeactivate = (userId) => {
    setPopupData({
      show: true,
      title: "אישור מחיקת משתמש",
      message: "⚠️ האם אתה בטוח שברצונך להפוך משתמש זה ללא פעיל?",
      mode: "confirm",
      user_id: userId,
    });
  };

  const confirmDeactivate = (userId) => {
    axios
      .put(
        `${api}/users/delete/${userId}`,
        { is_active: 0 },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.Status) {
          setPopupData({
            show: true,
            title: "הצלחה",
            message: "המשתמש סומן כלא פעיל",
            mode: "success",
          });
          fetchUsers();
        } else {
          setPopupData({
            show: true,
            title: "שגיאה",
            message: res.data.Error || "שגיאה בעדכון סטטוס משתמש",
            mode: "error",
          });
        }
      })
      .catch((err) => {
        setPopupData({
          show: true,
          title: "שגיאה",
          message: "אירעה שגיאה בעדכון סטטוס משתמש",
          mode: "error",
        });
        console.error(err);
      });
  };

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת משתמשים
      </h2>

      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-2">
        <NavigationButton
          linkTo="/dashboard/add_user"
          label="הוספת משתמש חדש"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="active">משתמשים פעילים</option>
          <option value="inactive">משתמשים לא פעילים</option>
          <option value="all">הכל</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש לפי שם..."
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

      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="text-center bg-slate-100 text-gray-800">
              <th className="p-2 border">ת.ז</th>
              <th className="p-2 border">שם פרטי</th>
              <th className="p-2 border">שם משפחה</th>
              <th className="p-2 border">תפקיד</th>
              <th className="p-2 border">אימייל</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-red-500 p-4">
                  אין משתמשים להצגה
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className={`transition duration-200 hover:bg-blue-50 cursor-pointer ${
                    !user.is_active ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="border p-2 text-center">{user.user_id}</td>
                  <td className="border p-2">{user.first_name}</td>
                  <td className="border p-2">{user.last_name}</td>
                  <td className="border p-2">{getRoleName(user.role_id)}</td>
                  <td className="border p-2">{user.email}</td>
                  <td
                    className={`border p-2 text-center font-semibold ${
                      user.is_active ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {user.is_active ? "פעיל" : "לא פעיל"}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/users/edit/${user.user_id}`)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
                    >
                      עריכה
                    </button>
                    {user.is_active && (
                      <button
                        onClick={() => handleDeactivate(user.user_id)}
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

      {/* Popup */}
      {popupData.show && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() =>
            setPopupData({
              show: false,
              title: "",
              message: "",
              mode: "info",
              user_id: null,
            })
          }
          onConfirm={
            popupData.mode === "confirm"
              ? () => confirmDeactivate(popupData.user_id)
              : undefined
          }
        />
      )}
    </div>
  );
};

export default Users;
