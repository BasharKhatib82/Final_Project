import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    is_active: 1,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.project_name.trim()) {
      setError("יש להזין שם פרויקט");
      return;
    }

    axios
      .post("http://localhost:8801/projects/add", form, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          navigate("/dashboard/projects");
        } else {
          setError(res.data.Error || "שגיאה בהוספת הפרויקט");
        }
      })
      .catch((err) => {
        console.error("שגיאה:", err);
        setError("שגיאה בהתחברות לשרת");
      });
  };

  return (
    <div className="max-w-xl mx-auto bg-white/90 p-6 mt-8 rounded-lg shadow-md text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הוספת פרויקט חדש
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-rubik">
        <div>
          <label className="block mb-1 font-medium">שם פרויקט *</label>
          <input
            type="text"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">תיאור הפרויקט</label>
          <textarea
            name="project_description"
            value={form.project_description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active === 1}
            onChange={handleChange}
            className="accent-blue-500"
          />
          <label className="text-sm">הפרויקט פעיל</label>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            שמור פרויקט
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;
