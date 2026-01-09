/**
 * קומפוננטה: AddProject
 * ----------------------
 * 1. מאפשרת הוספת פרויקט חדש למערכת.
 * 2. שדות נדרשים: שם פרויקט, תיאור (אופציונלי), סטטוס פעיל/לא פעיל.
 * 3.  פופאפ אישור ושמירה.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popup } from "components/Tools";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { api } from "utils";

const AddProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    active: 1,
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
      const res = await api.post("/projects/add", form);

      if (res.data?.success || res.data?.Status) {
        setShowConfirmPopup(false);
        setSuccessPopup(true);
      } else {
        setError(
          res.data?.message || res.data?.Error || "שגיאה בהוספת הפרויקט"
        );
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

        <div className="flex justify-around pt-4">
          <AppButton
            label="הוספת פרויקט"
            type="submit"
            icon={
              <Icon icon="basil:add-outline" width="1.2em" height="1.2em" />
            }
            variant="normal"
          />
          <AppButton
            label="ביטול הוספה"
            icon={
              <Icon icon="hugeicons:cancel-02" width="1.2em" height="1.2em" />
            }
            variant="cancel"
            to="/dashboard/projects"
          />
        </div>
      </form>

      {/* פופאפ אישור */}
      {showConfirmPopup && (
        <Popup
          title="אישור שמירה"
          message={`האם אתה בטוח שברצונך ליצור את הפרויקט : " ${form.project_name} " ?`}
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setShowConfirmPopup(false)}
        />
      )}

      {/* פופאפ הצלחה */}
      {successPopup && (
        <Popup
          title="הצלחה"
          message={`הפרויקט : " ${form.project_name} " נוצר בהצלחה !`}
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
