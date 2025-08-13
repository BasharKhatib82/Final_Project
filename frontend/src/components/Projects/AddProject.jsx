import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from "../Tools/Popup";
import AddButton from "../Buttons/AddSaveButton";
import ExitButton from "../Buttons/ExitButton";

const AddProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    is_active: 1,
  });

  const [error, setError] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!form.project_name.trim()) {
      setError("יש להזין שם פרויקט");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:8801/projects/add", form, {
        withCredentials: true,
      });

      if (res.data.Status) {
        setShowConfirmPopup(false);
        setSuccessPopup(true);
      } else {
        setError(res.data.Error || "שגיאה בהוספת הפרויקט");
        setShowConfirmPopup(false);
      }
    } catch (err) {
      console.error("שגיאה:", err);
      setError("שגיאה בהתחברות לשרת");
      setShowConfirmPopup(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/90 p-6 mt-8 rounded-lg shadow-md text-right font-rubik">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
        הוספת פרויקט חדש
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleConfirm} className="space-y-4">
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

        <div className="flex justify-center gap-4 mt-6">
          <AddButton label="שמור פרויקט" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/projects" />
        </div>
      </form>

      {showConfirmPopup && (
        <Popup
          title="אישור שמירה"
          message="האם אתה בטוח שברצונך לשמור את הפרויקט?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setShowConfirmPopup(false)}
        />
      )}

      {successPopup && (
        <Popup
          title="הצלחה"
          message="הפרויקט נשמר בהצלחה!"
          mode="success"
          onClose={() => {
            setSuccessPopup(false);
            navigate("/dashboard/projects");
          }}
        />
      )}
    </div>
  );
};

export default AddProject;
