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
    <div className="main-dash">
      <h2 className="text-center font-blue fontXL mp2rem">
        הוספת רישום נוכחות
      </h2>
      <form onSubmit={handleSubmit} className="form-group max-w600 center">
        <label>בחר עובד:</label>
        <select
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          className="form-add"
        >
          <option value="">-- בחר עובד --</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </select>

        <label>תאריך:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          max={new Date().toISOString().split("T")[0]}
          className="form-add"
        />

        <label>שעת כניסה:</label>
        <input
          type="time"
          name="check_in"
          value={form.check_in}
          onChange={handleChange}
          className="form-add"
        />

        <label>שעת יציאה:</label>
        <input
          type="time"
          name="check_out"
          value={form.check_out}
          onChange={handleChange}
          className="form-add"
        />

        <label>סטטוס:</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="form-add"
        >
          <option value="נוכח">נוכח</option>
          <option value="חופשה">חופשה</option>
          <option value="מחלה">מחלה</option>
          <option value="היעדרות">היעדרות</option>
        </select>

        <button type="submit" className="btn-update">
          שמור רישום
        </button>
      </form>
    </div>
  );
};

export default AddAttendance;
