/**
 * קומפוננטה: EditProject
 * -----------------------
 * 1. project_id מאפשרת עריכה של פרויקט קיים לפי מזהה .
 * 2. כולל שדות: שם, תיאור, סטטוס פעיל/לא פעיל.
 * 3. לאישור ושגיאה Popup שימוש ב   .
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Popup } from "components/Tools";
import { ExitButton } from "components/Buttons";
import { api } from "utils";

const EditProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    is_active: 1,
  });

  const [error, setError] = useState("");
  const [popupData, setPopupData] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success && res.data.data) {
        setForm(res.data.data);
      } else {
        setError("לא ניתן לטעון את נתוני הפרויקט");
      }
    } catch (err) {
      console.error("שגיאה בטעינת פרויקט:", err);
      setError("שגיאה בטעינת נתונים מהשרת");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.project_name.trim()) {
      setError("יש להזין שם פרויקט");
      return;
    }

    try {
      const res = await api.put(`/projects/edit/${id}`, form);
      if (res.data?.success || res.data?.Status) {
        setPopupData({
          title: "הצלחה",
          message: "הפרויקט עודכן בהצלחה!",
          mode: "success",
        });
      } else {
        setError(
          res.data?.message || res.data?.Error || "שגיאה בעדכון הפרויקט"
        );
      }
    } catch (err) {
      console.error("שגיאה בעדכון פרויקט:", err);
      setError("שגיאה בהתחברות לשרת");
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setError("");
    setConfirmPopup(true);
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

      <form onSubmit={handleConfirm} className="space-y-4 font-rubik">
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

        <div>
          <label className="block mb-1 font-medium">סטטוס הפרויקט</label>
          <select
            name="is_active"
            value={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                is_active: Number(e.target.value),
              }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value={1}>פעיל</option>
            <option value={0}>לא פעיל</option>
          </select>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            עדכן פרויקט
          </button>
          <ExitButton label="ביטול" linkTo="/dashboard/projects" />
        </div>
      </form>

      {/* פופאפ אישור */}
      {confirmPopup && (
        <Popup
          title="אישור עדכון"
          message="האם אתה בטוח שברצונך לעדכן את הפרויקט?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setConfirmPopup(false)}
        />
      )}

      {/* פופאפ הצלחה */}
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => {
            setPopupData(null);
            navigate("/dashboard/projects");
          }}
        />
      )}
    </div>
  );
};

export default EditProject;
