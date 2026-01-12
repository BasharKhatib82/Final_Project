/**
 * קומפוננטה: EditProject
 * -----------------------
 * 1. project_id מאפשרת עריכת פרויקט קיים לפי מזהה .
 * 2. כולל שדות: שם פרויקט, תיאור, סטטוס (פעיל / לא פעיל).
 * 3. לאישור או תוצאה Popup שימוש ב .
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Popup, useUser } from "components/Tools";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { api } from "utils";
import ProtectedRoute from "components/Tools/ProtectedRoute";

const EditProject = () => {
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    active: 1,
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
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
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
          message: `הפרויקט " ${form.project_name} " עודכן בהצלחה !`,
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
    <ProtectedRoute permission="projects_page_access">
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
              name="active"
              value={form.active}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  active: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value={1}>פעיל</option>
              <option value={0}>לא פעיל</option>
            </select>
          </div>

          <div className="flex justify-around pt-4">
            <AppButton
              label="שמור שינויים"
              type="submit"
              icon={
                <Icon
                  icon="fluent:save-edit-20-regular"
                  width="1.2em"
                  height="1.2em"
                />
              }
              variant="normal"
            />
            <AppButton
              label="ביטול עריכה"
              icon={
                <Icon icon="hugeicons:cancel-02" width="1.2em" height="1.2em" />
              }
              variant="cancel"
              to="/dashboard/projects"
            />
          </div>
        </form>

        {/* פופאפ אישור */}
        {confirmPopup && (
          <Popup
            title="אישור עדכון"
            message={`האם אתה מאשר לעדכן את הפרויקט : " ${form.project_name} " ?`}
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
    </ProtectedRoute>
  );
};

export default EditProject;
