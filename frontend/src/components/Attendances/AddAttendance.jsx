import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddAttendance = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    status: "נוכח",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:8801/users/active", { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          setUsers(res.data.Result);
        } else {
          alert("שגיאה בטעינת עובדים");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("שגיאה בעת טעינת העובדים");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // בדיקת שדות חובה
    const requiredFields = [
      "user_id",
      "date",
      "check_in",
      "check_out",
      "status",
    ];
    for (let field of requiredFields) {
      if (!form[field]) {
        return alert(`שדה חובה חסר: ${field}`);
      }
    }

    axios
      .post("http://localhost:8801/attendances/add", form, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          navigate("/dashboard/attendances");
        } else {
          alert("שגיאה: " + res.data.Error);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("אירעה שגיאה בשמירה");
      });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        הוספת רישום נוכחות
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-1">
            בחר עובד:
          </label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-1">
            תאריך:
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-1">
            שעת כניסה:
          </label>
          <input
            type="time"
            name="check_in"
            value={form.check_in}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-1">
            שעת יציאה:
          </label>
          <input
            type="time"
            name="check_out"
            value={form.check_out}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-right text-sm font-medium text-gray-700 mb-1">
            סטטוס:
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="נוכח">נוכח</option>
            <option value="חופשה">חופשה</option>
            <option value="מחלה">מחלה</option>
            <option value="היעדרות">היעדרות</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          שמור רישום
        </button>
      </form>
    </div>
  );
};

export default AddAttendance;