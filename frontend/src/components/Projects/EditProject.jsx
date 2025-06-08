import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    is_active: 1,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = () => {
    axios
      .get(`http://localhost:8801/projects/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.Status && res.data.Result) {
          setForm(res.data.Result);
        } else {
          setError("לא ניתן לטעון את נתוני הפרויקט");
        }
      })
      .catch((err) => {
        console.error("שגיאה בטעינת פרויקט:", err);
        setError("שגיאה בטעינת נתונים מהשרת");
      });
  };

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
      .put(`http://localhost:8801/projects/edit/${id}`, form, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) {
          navigate("/dashboard/projects");
        } else {
          setError(res.data.Error || "שגיאה בעדכון הפרויקט");
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
        עריכת פרויקט
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
            עדכן פרויקט
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
