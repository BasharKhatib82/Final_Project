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
      .post("http://localhost:8801/roles/add", formData, {
        withCredentials: true,
      })
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
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-2"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
          הוספת תפקיד חדש
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
              className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="1">✓ כן</option>
              <option value="0">✗ לא</option>
            </select>
          </div>
        ))}

        <button
          type="submit"
          className="font-rubik w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 font-medium"
        >
          הוסף תפקיד
        </button>
      </form>
    </div>
  );
};

export default AddRole;
