import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";

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
      .get(`http://localhost:8801/roles/${id}`, { withCredentials: true })
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
      .put(`http://localhost:8801/roles/${id}`, formData, {
        withCredentials: true,
      })
      .then(() => {
        navigate("/dashboard/roles");
        alert("התפקיד עודכן בהצלחה");
      })
      .catch((err) => {
        alert("שגיאת עדכון");
        console.error(err);
      });
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2 text-right"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          עדכון פרטי תפקיד
        </h2>

        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            שם תפקיד
          </label>
          <input
            type="text"
            name="role_name"
            value={formData.role_name}
            onChange={handleChange}
            required
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {[
          { name: "can_manage_users", label: "ניהול משתמשים" },
          { name: "can_view_reports", label: "צפייה בדוחות" },
          { name: "can_assign_leads", label: "שייך פניות" },
          { name: "can_edit_courses", label: "עריכת קורסים" },
          { name: "can_manage_tasks", label: "ניהול משימות" },
          { name: "can_access_all_data", label: "גישה לכל הנתונים" },
        ].map((field) => (
          <div key={field.name}>
            <label className="font-rubik block mb-0.5 font-medium">
              {field.label}
            </label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            >
              <option value="1">✓ כן</option>
              <option value="0">✗ לא</option>
            </select>
          </div>
        ))}

        {/* סטטוס */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="active"
            value={formData.active}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value="1">פעיל</option>
            <option value="0">לא פעיל</option>
          </select>
        </div>
        <div className="flex justify-around pt-4">
          <AddSaveButton label="שמור שינויים" />
          <ExitButton label="ביטול" linkTo="/dashboard/roles" />
        </div>
      </form>
    </div>
  );
};

export default UpdateRoleForm;
