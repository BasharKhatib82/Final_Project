import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddAttendance = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    date: 0,
    check_in: 0,
    check_out: 0,
    status: 0,
    notes: 0,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8801/attendances/add", formData, {
        withCredentials: true,
      })
      .then(() => {
        alert(" רישום נוסף בהצלחה!");
        navigate("/dashboard/attendances");
      })
      .catch((err) => {
        console.error(err);
        alert("אירעה שגיאה בהוספת התפקיד");
      });
  };

  return (
    <form className="update-role-form" onSubmit={handleSubmit}>
      <h2 className="title text-center fontL">הוספת רישום חדש</h2>

      <label>בחירת עובד</label>
      <input
        type="text"
        name="role_name"
        value={formData.role_name}
        onChange={handleChange}
        required
      />
      <label>תאריך</label>
      <select
        name="can_manage_users"
        value={formData.can_manage_users}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>כניסה</label>
      <select
        name="can_view_reports"
        value={formData.can_view_reports}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>יציאה</label>
      <select
        name="can_assign_leads"
        value={formData.can_assign_leads}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>סטטוס</label>
      <select
        name="can_edit_courses"
        value={formData.can_edit_courses}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>הערות</label>
      <select
        name="can_manage_tasks"
        value={formData.can_manage_tasks}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>
      <button className="btn-update " type="submit">
        שמור
      </button>
      <button className="btn-update " type="submit">
        ביטול
      </button>
    </form>
  );
};

export default AddAttendance;
