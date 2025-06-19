import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExitButton from "../Buttons/ExitButton";
import AddSaveButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

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

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showConfirmAddPopup, setShowConfirmAddPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

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
    setShowConfirmAddPopup(true);
  };

  const handleConfirmAdd = () => {
    setShowConfirmAddPopup(false);

    axios
      .post("http://localhost:8801/roles/add", formData, {
        withCredentials: true,
      })
      .then(() => {
        setShowSuccessPopup(true);
      })
      .catch((err) => {
        console.error(err);
        alert("אירעה שגיאה בהוספת התפקיד");
      });
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    navigate("/dashboard/roles");
  };

  const handleExitChanges = () => {
    setShowCancelPopup(true);
    navigate("/dashboard/roles");
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
        <div className="flex justify-around pt-4">
          <AddSaveButton label="הוסף תפקיד" type="submit" />
          <ExitButton label="ביטול" onClick={handleExitChanges} />
        </div>
      </form>

      {/* פופאפ אישור הוספה */}
      {showConfirmAddPopup && (
        <Popup
          message="האם אתה בטוח שברצונך ליצור תפקיד חדש ?"
          mode="confirm"
          onConfirm={handleConfirmAdd}
          onClose={() => showConfirmAddPopup(false)}
        />
      )}

      {/* פופאפ הצלחה */}
      {showSuccessPopup && (
        <Popup message="התפקיד נוסף בהצלחה !" onClose={handleSuccessClose} />
      )}

      {/* פופאפ ביטול */}
      {showCancelPopup && (
        <Popup
          message="האם אתה בטוח שברצונך לבטל את הוספת התפקיד ?"
          mode="confirm"
          onClose={() => setShowCancelPopup(false)}
          onConfirm={() => navigate("/dashboard/roles")}
        />
      )}
    </div>
  );
};

export default AddRole;
