// frontend/src/pages/Leads/AddLead.jsx

/**
 * קומפוננטה: AddLead
 * -------------------
 * מטרות:
 * 1. יצירת פנייה חדשה.
 * 2. אם קיים לקוח לפי טלפון → השלמת שדות אוטומטית.
 * 3. אפשרות שיוך לפרויקט ונציג.
 * 4. שמירה עם אישור משתמש.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { Popup } from "components/Tools";
import { api, extractApiError } from "utils";
import ProtectedRoute from "components/Tools/ProtectedRoute";

export default function AddLead() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientExists, setClientExists] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const [form, setForm] = useState({
    phone_number: "",
    project_id: "",
    status: "חדשה",
    first_name: "",
    last_name: "",
    email: "",
    city: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/status/1");
      setProjects(res.data.data || []);
    } catch (err) {
      setError(extractApiError(err, "שגיאה בטעינת פרויקטים"));
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/active");
      setUsers(res.data.data || []);
    } catch (err) {
      setError(extractApiError(err, "שגיאה בטעינת נציגים"));
    }
  };

  const handlePhoneBlur = async () => {
    if (!form.phone_number) return;

    try {
      const res = await api.get(`/leads/${form.phone_number}`);
      if (res.data.success) {
        const c = res.data.data;
        setForm((prev) => ({
          ...prev,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          city: c.city,
        }));
        setClientExists(true);
        setError("");
      } else {
        setClientExists(false);
      }
    } catch (err) {
      console.error("שגיאה בבדיקת לקוח:", err);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    //  ולידציה בסיסית למילוי טופס
    if (
      !form.phone_number ||
      !form.project_id ||
      (!clientExists &&
        (!form.first_name || !form.last_name || !form.email || !form.city))
    ) {
      setError("נא למלא את כל השדות החובה");
      return;
    }

    setError("");
    setShowConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const leadData = {
        phone_number: form.phone_number,
        project_id: form.project_id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        city: form.city,
      };

      const res = await api.post("/leads/add", leadData);

      if (res.data.success) {
        setSuccessPopup(true);
        setShowConfirmPopup(false);
      } else {
        setError(res.data?.message || "שגיאה בשמירת הפנייה");
        setShowConfirmPopup(false);
      }
    } catch (err) {
      setError(extractApiError(err, "שגיאה בשמירת הפנייה"));
      setShowConfirmPopup(false);
    }
  };

  return (
    <ProtectedRoute permission="leads_page_access">
      <div className="p-6 max-w-2xl mx-auto font-rubik">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          הוספת פנייה חדשה
        </h2>

        <form
          onSubmit={handleConfirm}
          className="bg-white/85 p-6 rounded-lg shadow-lg space-y-4"
        >
          <div>
            <label className="block mb-1 font-semibold">מספר טלפון:</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.phone_number}
              onChange={(e) =>
                setForm({ ...form, phone_number: e.target.value })
              }
              onBlur={handlePhoneBlur}
            />
          </div>

          {!clientExists && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">שם פרטי:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">שם משפחה:</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">אימייל:</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">עיר:</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1 font-semibold">פרויקט:</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            >
              <option value="">בחר פרויקט</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center flex justify-center gap-4">
            <AppButton
              label="הוספת פנייה"
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
              to="/dashboard/leads"
            />
          </div>
        </form>

        {/* אישור שמירת פנייה חדשה */}
        {showConfirmPopup && (
          <Popup
            title="אישור שמירה"
            message={`האם להוסיף פנייה חדשה עבור : " ${form.first_name} ${form.last_name} " ?`}
            mode="confirm"
            onConfirm={handleSubmit}
            onClose={() => setShowConfirmPopup(false)}
          />
        )}

        {/* "הודעת הצלחה "יצירת פנייה */}
        {successPopup && (
          <Popup
            title="הצלחה"
            message={`פנייה חדשה עבור : " ${form.first_name} ${form.last_name} " נוספה בהצלחה !`}
            mode="success"
            onClose={() => {
              setSuccessPopup(false);
              navigate("/dashboard/leads");
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
