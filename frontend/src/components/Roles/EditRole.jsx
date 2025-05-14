import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const UpdateRoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    axios
      .get(`http://localhost:8801/role/${id}`)
      .then((res) => {
        setFormData(res.data.Role);
      })
      .catch((err) => {
        alert("שגיאה בטעינת פרטי התפקיד");
        console.error(err);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8801/role/${id}`, formData)
      .then(() => {
        alert("התפקיד עודכן בהצלחה");
        navigate("/dashboard/roles");
      })
      .catch((err) => {
        alert("שגיאת עדכון");
        console.error(err);
      });
  };

  return (
    <form className="update-role-form" onSubmit={handleSubmit}>
      <h2 className="title text-center fontL">עדכו פרטי תפקיד</h2>
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

      <label>סטטוס</label>
      <select name="active" value={formData.active} onChange={handleChange}>
        <option value="1">פעיל</option>
        <option value="0">לא פעיל</option>
      </select>

      <button className="btn-update" type="submit">
        עדכון תפקיד
      </button>
    </form>
  );
};

export default UpdateRoleForm;
