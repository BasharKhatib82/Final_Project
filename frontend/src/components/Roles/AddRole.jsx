import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddRole = () => {
  const [formData, setFormData] = useState({
    role_name: "",
    can_manage_users: 0,
    can_view_reports: 0,
    can_assign_leads: 0,
    can_edit_courses: 0,
    can_manage_tasks: 0,
    can_access_all_data: 0,
    active: 0,
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
      .post("http://localhost:8801/add_role", formData)
      .then(() => {
        alert("🎉 תפקיד נוסף בהצלחה!");
        navigate("/dashboard/roles");
      })
      .catch((err) => {
        console.error(err);
        alert("אירעה שגיאה בהוספת התפקיד");
      });
  };

  return (
    <form className="update-role-form" onSubmit={handleSubmit}>
      <h2 className="title text-center fontL">הוספת תפקיד חדש</h2>

      <label>שם תפקיד</label>
      <input
        type="text"
        name="role_name"
        value={formData.role_name}
        onChange={handleChange}
        required
      />

      <label>ניהול משתמשים</label>
      <select
        name="can_manage_users"
        value={formData.can_manage_users}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>צפייה בדוחות</label>
      <select
        name="can_view_reports"
        value={formData.can_view_reports}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>שייך פניות</label>
      <select
        name="can_assign_leads"
        value={formData.can_assign_leads}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>עריכת קורסים</label>
      <select
        name="can_edit_courses"
        value={formData.can_edit_courses}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>ניהול משימות</label>
      <select
        name="can_manage_tasks"
        value={formData.can_manage_tasks}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <label>גישה לכל הנתונים</label>
      <select
        name="can_access_all_data"
        value={formData.can_access_all_data}
        onChange={handleChange}
      >
        <option value="1">✓ כן</option>
        <option value="0">✗ לא</option>
      </select>

      <button className="btn-update " type="submit">
        הוסף תפקיד
      </button>
    </form>
  );
};

export default AddRole;
